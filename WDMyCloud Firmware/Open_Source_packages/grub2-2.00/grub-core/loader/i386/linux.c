/*
 *  GRUB  --  GRand Unified Bootloader
 *  Copyright (C) 2006,2007,2008,2009,2010  Free Software Foundation, Inc.
 *
 *  GRUB is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  GRUB is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with GRUB.  If not, see <http://www.gnu.org/licenses/>.
 */

#include <grub/loader.h>
#include <grub/memory.h>
#include <grub/normal.h>
#include <grub/file.h>
#include <grub/disk.h>
#include <grub/err.h>
#include <grub/misc.h>
#include <grub/types.h>
#include <grub/dl.h>
#include <grub/mm.h>
#include <grub/term.h>
#include <grub/cpu/linux.h>
#include <grub/video.h>
#include <grub/video_fb.h>
#include <grub/command.h>
#include <grub/i386/relocator.h>
#include <grub/i18n.h>
#include <grub/lib/cmdline.h>

GRUB_MOD_LICENSE ("GPLv3+");

#ifdef GRUB_MACHINE_PCBIOS
#include <grub/i386/pc/vesa_modes_table.h>
#endif

#ifdef GRUB_MACHINE_EFI
#include <grub/efi/efi.h>
#define HAS_VGA_TEXT 0
#define DEFAULT_VIDEO_MODE "auto"
#define ACCEPTS_PURE_TEXT 0
#elif defined (GRUB_MACHINE_IEEE1275)
#include <grub/ieee1275/ieee1275.h>
#define HAS_VGA_TEXT 0
#define DEFAULT_VIDEO_MODE "text"
#define ACCEPTS_PURE_TEXT 1
#else
#include <grub/i386/pc/vbe.h>
#include <grub/i386/pc/console.h>
#define HAS_VGA_TEXT 1
#define DEFAULT_VIDEO_MODE "text"
#define ACCEPTS_PURE_TEXT 1
#endif

static grub_dl_t my_mod;

static grub_size_t linux_mem_size;
static int loaded;
static void *prot_mode_mem;
static grub_addr_t prot_mode_target;
static void *initrd_mem;
static grub_addr_t initrd_mem_target;
static grub_size_t prot_init_space;
static grub_uint32_t initrd_pages;
static struct grub_relocator *relocator = NULL;
static void *efi_mmap_buf;
static grub_size_t maximal_cmdline_size;
static struct linux_kernel_params linux_params;
static char *linux_cmdline;
#ifdef GRUB_MACHINE_EFI
static grub_efi_uintn_t efi_mmap_size;
#else
static const grub_size_t efi_mmap_size = 0;
#endif

#define ALPHA_CUSTOMIZE //Casper, 20140519
#if defined(ALPHA_CUSTOMIZE) //casper, 20140519
#define CRC_NO_MATCH 	(0x1)
#define CRC_MATCH 		(0x0)
static int crc_result = CRC_MATCH;
#endif


/* FIXME */
#if 0
struct idt_descriptor
{
  grub_uint16_t limit;
  void *base;
} __attribute__ ((packed));

static struct idt_descriptor idt_desc =
  {
    0,
    0
  };
#endif

static inline grub_size_t
page_align (grub_size_t size)
{
  return (size + (1 << 12) - 1) & (~((1 << 12) - 1));
}

#ifdef GRUB_MACHINE_EFI
/* Find the optimal number of pages for the memory map. Is it better to
   move this code to efi/mm.c?  */
static grub_efi_uintn_t
find_efi_mmap_size (void)
{
  static grub_efi_uintn_t mmap_size = 0;

  if (mmap_size != 0)
    return mmap_size;

  mmap_size = (1 << 12);
  while (1)
    {
      int ret;
      grub_efi_memory_descriptor_t *mmap;
      grub_efi_uintn_t desc_size;

      mmap = grub_malloc (mmap_size);
      if (! mmap)
	return 0;

      ret = grub_efi_get_memory_map (&mmap_size, mmap, 0, &desc_size, 0);
      grub_free (mmap);

      if (ret < 0)
	{
	  grub_error (GRUB_ERR_IO, "cannot get memory map");
	  return 0;
	}
      else if (ret > 0)
	break;

      mmap_size += (1 << 12);
    }

  /* Increase the size a bit for safety, because GRUB allocates more on
     later, and EFI itself may allocate more.  */
  mmap_size += (3 << 12);

  mmap_size = page_align (mmap_size);
  return mmap_size;
}

#endif

/* Find the optimal number of pages for the memory map. */
static grub_size_t
find_mmap_size (void)
{
  grub_size_t count = 0, mmap_size;

  auto int NESTED_FUNC_ATTR hook (grub_uint64_t, grub_uint64_t,
				  grub_memory_type_t);
  int NESTED_FUNC_ATTR hook (grub_uint64_t addr __attribute__ ((unused)),
			     grub_uint64_t size __attribute__ ((unused)),
			     grub_memory_type_t type __attribute__ ((unused)))
    {
      count++;
      return 0;
    }

  grub_mmap_iterate (hook);

  mmap_size = count * sizeof (struct grub_e820_mmap);

  /* Increase the size a bit for safety, because GRUB allocates more on
     later.  */
  mmap_size += (1 << 12);

  return page_align (mmap_size);
}

static void
free_pages (void)
{
  grub_relocator_unload (relocator);
  relocator = NULL;
  prot_mode_mem = initrd_mem = 0;
  prot_mode_target = initrd_mem_target = 0;
}

/* Allocate pages for the real mode code and the protected mode code
   for linux as well as a memory map buffer.  */
static grub_err_t
allocate_pages (grub_size_t prot_size, grub_size_t *align,
		grub_size_t min_align, int relocatable,
		grub_uint64_t prefered_address)
{
  grub_err_t err;

  prot_size = page_align (prot_size);

  /* Initialize the memory pointers with NULL for convenience.  */
  free_pages ();

  relocator = grub_relocator_new ();
  if (!relocator)
    {
      err = grub_errno;
      goto fail;
    }

  /* FIXME: Should request low memory from the heap when this feature is
     implemented.  */

  {
    grub_relocator_chunk_t ch;
    if (relocatable)
      {
	err = grub_relocator_alloc_chunk_align (relocator, &ch,
						prefered_address,
						prefered_address,
						prot_size, 1,
						GRUB_RELOCATOR_PREFERENCE_LOW,
						1);
	for (; err && *align + 1 > min_align; (*align)--)
	  {
	    grub_errno = GRUB_ERR_NONE;
	    err = grub_relocator_alloc_chunk_align (relocator, &ch,
						    0x1000000,
						    0xffffffff & ~prot_size,
						    prot_size, 1 << *align,
						    GRUB_RELOCATOR_PREFERENCE_LOW,
						    1);
	  }
	if (err)
	  goto fail;
      }
    else
      err = grub_relocator_alloc_chunk_addr (relocator, &ch,
					     prefered_address,
					     prot_size);
    if (err)
      goto fail;
    prot_mode_mem = get_virtual_current_address (ch);
    prot_mode_target = get_physical_target_address (ch);
  }

  grub_dprintf ("linux", "prot_mode_mem = %lx, prot_mode_target = %lx, prot_size = %x\n",
                (unsigned long) prot_mode_mem, (unsigned long) prot_mode_target,
		(unsigned) prot_size);
  return GRUB_ERR_NONE;

 fail:
  free_pages ();
  return err;
}

static grub_err_t
grub_e820_add_region (struct grub_e820_mmap *e820_map, int *e820_num,
                      grub_uint64_t start, grub_uint64_t size,
                      grub_uint32_t type)
{
  int n = *e820_num;

  if ((n > 0) && (e820_map[n - 1].addr + e820_map[n - 1].size == start) &&
      (e820_map[n - 1].type == type))
      e820_map[n - 1].size += size;
  else
    {
      e820_map[n].addr = start;
      e820_map[n].size = size;
      e820_map[n].type = type;
      (*e820_num)++;
    }
  return GRUB_ERR_NONE;
}

static grub_err_t
grub_linux_setup_video (struct linux_kernel_params *params)
{
  struct grub_video_mode_info mode_info;
  void *framebuffer;
  grub_err_t err;
  grub_video_driver_id_t driver_id;
  const char *gfxlfbvar = grub_env_get ("gfxpayloadforcelfb");

  driver_id = grub_video_get_driver_id ();

  if (driver_id == GRUB_VIDEO_DRIVER_NONE)
    return 1;

  err = grub_video_get_info_and_fini (&mode_info, &framebuffer);

  if (err)
    {
      grub_errno = GRUB_ERR_NONE;
      return 1;
    }

  params->lfb_width = mode_info.width;
  params->lfb_height = mode_info.height;
  params->lfb_depth = mode_info.bpp;
  params->lfb_line_len = mode_info.pitch;

  params->lfb_base = (grub_size_t) framebuffer;
  params->lfb_size = ALIGN_UP (params->lfb_line_len * params->lfb_height, 65536);

  params->red_mask_size = mode_info.red_mask_size;
  params->red_field_pos = mode_info.red_field_pos;
  params->green_mask_size = mode_info.green_mask_size;
  params->green_field_pos = mode_info.green_field_pos;
  params->blue_mask_size = mode_info.blue_mask_size;
  params->blue_field_pos = mode_info.blue_field_pos;
  params->reserved_mask_size = mode_info.reserved_mask_size;
  params->reserved_field_pos = mode_info.reserved_field_pos;

  if (gfxlfbvar && (gfxlfbvar[0] == '1' || gfxlfbvar[0] == 'y'))
    params->have_vga = GRUB_VIDEO_LINUX_TYPE_SIMPLE;
  else
    {
      switch (driver_id)
	{
	case GRUB_VIDEO_DRIVER_VBE:
	  params->lfb_size >>= 16;
	  params->have_vga = GRUB_VIDEO_LINUX_TYPE_VESA;
	  break;
	
	case GRUB_VIDEO_DRIVER_EFI_UGA:
	case GRUB_VIDEO_DRIVER_EFI_GOP:
	  params->have_vga = GRUB_VIDEO_LINUX_TYPE_EFIFB;
	  break;

	  /* FIXME: check if better id is available.  */
	case GRUB_VIDEO_DRIVER_SM712:
	case GRUB_VIDEO_DRIVER_SIS315PRO:
	case GRUB_VIDEO_DRIVER_VGA:
	case GRUB_VIDEO_DRIVER_CIRRUS:
	case GRUB_VIDEO_DRIVER_BOCHS:
	case GRUB_VIDEO_DRIVER_RADEON_FULOONG2E:
	  /* Make gcc happy. */
	case GRUB_VIDEO_DRIVER_SDL:
	case GRUB_VIDEO_DRIVER_NONE:
	  params->have_vga = GRUB_VIDEO_LINUX_TYPE_SIMPLE;
	  break;
	}
    }

#ifdef GRUB_MACHINE_PCBIOS
  /* VESA packed modes may come with zeroed mask sizes, which need
     to be set here according to DAC Palette width.  If we don't,
     this results in Linux displaying a black screen.  */
  if (driver_id == GRUB_VIDEO_DRIVER_VBE && mode_info.bpp <= 8)
    {
      struct grub_vbe_info_block controller_info;
      int status;
      int width = 8;

      status = grub_vbe_bios_get_controller_info (&controller_info);

      if (status == GRUB_VBE_STATUS_OK &&
	  (controller_info.capabilities & GRUB_VBE_CAPABILITY_DACWIDTH))
	status = grub_vbe_bios_set_dac_palette_width (&width);

      if (status != GRUB_VBE_STATUS_OK)
	/* 6 is default after mode reset.  */
	width = 6;

      params->red_mask_size = params->green_mask_size
	= params->blue_mask_size = width;
      params->reserved_mask_size = 0;
    }
#endif

  return GRUB_ERR_NONE;
}

static grub_err_t
grub_linux_boot (void)
{
  int e820_num;
  grub_err_t err = 0;
  const char *modevar;
  char *tmp;
  struct grub_relocator32_state state;
  void *real_mode_mem;
  grub_addr_t real_mode_target = 0;
  grub_size_t real_size, mmap_size;
  grub_size_t cl_offset;

#ifdef GRUB_MACHINE_IEEE1275
  {
    const char *bootpath;
    grub_ssize_t len;

    bootpath = grub_env_get ("root");
    if (bootpath)
      grub_ieee1275_set_property (grub_ieee1275_chosen,
				  "bootpath", bootpath,
				  grub_strlen (bootpath) + 1,
				  &len);
    linux_params.ofw_signature = GRUB_LINUX_OFW_SIGNATURE;
    linux_params.ofw_num_items = 1;
    linux_params.ofw_cif_handler = (grub_uint32_t) grub_ieee1275_entry_fn;
    linux_params.ofw_idt = 0;
  }
#endif

  modevar = grub_env_get ("gfxpayload");

  /* Now all graphical modes are acceptable.
     May change in future if we have modes without framebuffer.  */
  if (modevar && *modevar != 0)
    {
      tmp = grub_xasprintf ("%s;" DEFAULT_VIDEO_MODE, modevar);
      if (! tmp)
	return grub_errno;
#if ACCEPTS_PURE_TEXT
      err = grub_video_set_mode (tmp, 0, 0);
#else
      err = grub_video_set_mode (tmp, GRUB_VIDEO_MODE_TYPE_PURE_TEXT, 0);
#endif
      grub_free (tmp);
    }
  else
    {
#if ACCEPTS_PURE_TEXT
      err = grub_video_set_mode (DEFAULT_VIDEO_MODE, 0, 0);
#else
      err = grub_video_set_mode (DEFAULT_VIDEO_MODE,
				 GRUB_VIDEO_MODE_TYPE_PURE_TEXT, 0);
#endif
    }

  if (err)
    {
      grub_print_error ();
      grub_puts_ (N_("Booting in blind mode"));
      grub_errno = GRUB_ERR_NONE;
    }

  if (grub_linux_setup_video (&linux_params))
    {
#if defined (GRUB_MACHINE_PCBIOS) || defined (GRUB_MACHINE_COREBOOT) || defined (GRUB_MACHINE_QEMU)
      linux_params.have_vga = GRUB_VIDEO_LINUX_TYPE_TEXT;
      linux_params.video_mode = 0x3;
#else
      linux_params.have_vga = 0;
      linux_params.video_mode = 0;
      linux_params.video_width = 0;
      linux_params.video_height = 0;
#endif
    }


#ifndef GRUB_MACHINE_IEEE1275
  if (linux_params.have_vga == GRUB_VIDEO_LINUX_TYPE_TEXT)
#endif
    {
      grub_term_output_t term;
      int found = 0;
      FOR_ACTIVE_TERM_OUTPUTS(term)
	if (grub_strcmp (term->name, "vga_text") == 0
	    || grub_strcmp (term->name, "console") == 0
	    || grub_strcmp (term->name, "ofconsole") == 0)
	  {
	    grub_uint16_t pos = grub_term_getxy (term);
	    linux_params.video_cursor_x = pos >> 8;
	    linux_params.video_cursor_y = pos & 0xff;
	    linux_params.video_width = grub_term_width (term);
	    linux_params.video_height = grub_term_height (term);
	    found = 1;
	    break;
	  }
      if (!found)
	{
	  linux_params.video_cursor_x = 0;
	  linux_params.video_cursor_y = 0;
	  linux_params.video_width = 80;
	  linux_params.video_height = 25;
	}
    }

  mmap_size = find_mmap_size ();
  /* Make sure that each size is aligned to a page boundary.  */
  cl_offset = ALIGN_UP (mmap_size + sizeof (linux_params), 4096);
  if (cl_offset < ((grub_size_t) linux_params.setup_sects << GRUB_DISK_SECTOR_BITS))
    cl_offset = ALIGN_UP ((grub_size_t) (linux_params.setup_sects
					 << GRUB_DISK_SECTOR_BITS), 4096);
  real_size = ALIGN_UP (cl_offset + maximal_cmdline_size, 4096);

#ifdef GRUB_MACHINE_EFI
  efi_mmap_size = find_efi_mmap_size ();
  if (efi_mmap_size == 0)
    return grub_errno;
#endif

  grub_dprintf ("linux", "real_size = %x, mmap_size = %x\n",
		(unsigned) real_size, (unsigned) mmap_size);

  auto int NESTED_FUNC_ATTR hook (grub_uint64_t, grub_uint64_t,
				  grub_memory_type_t);
  int NESTED_FUNC_ATTR hook (grub_uint64_t addr, grub_uint64_t size,
			     grub_memory_type_t type)
    {
      /* We must put real mode code in the traditional space.  */
      if (type != GRUB_MEMORY_AVAILABLE || addr > 0x90000)
	return 0;

      if (addr + size < 0x10000)
	return 0;

      if (addr < 0x10000)
	{
	  size += addr - 0x10000;
	  addr = 0x10000;
	}

      if (addr + size > 0x90000)
	size = 0x90000 - addr;

      if (real_size + efi_mmap_size > size)
	return 0;

      grub_dprintf ("linux", "addr = %lx, size = %x, need_size = %x\n",
		    (unsigned long) addr,
		    (unsigned) size,
		    (unsigned) (real_size + efi_mmap_size));
      real_mode_target = ((addr + size) - (real_size + efi_mmap_size));
      return 1;
    }
#ifdef GRUB_MACHINE_EFI
  grub_efi_mmap_iterate (hook, 1);
  if (! real_mode_target)
    grub_efi_mmap_iterate (hook, 0);
#else
  grub_mmap_iterate (hook);
#endif
  grub_dprintf ("linux", "real_mode_target = %lx, real_size = %x, efi_mmap_size = %x\n",
                (unsigned long) real_mode_target,
		(unsigned) real_size,
		(unsigned) efi_mmap_size);

  if (! real_mode_target)
    return grub_error (GRUB_ERR_OUT_OF_MEMORY, "cannot allocate real mode pages");

  {
    grub_relocator_chunk_t ch;
    err = grub_relocator_alloc_chunk_addr (relocator, &ch,
					   real_mode_target,
					   (real_size + efi_mmap_size));
    if (err)
     return err;
    real_mode_mem = get_virtual_current_address (ch);
  }
  efi_mmap_buf = (grub_uint8_t *) real_mode_mem + real_size;

  grub_dprintf ("linux", "real_mode_mem = %lx\n",
                (unsigned long) real_mode_mem);

  struct linux_kernel_params *params;

  params = real_mode_mem;

  *params = linux_params;
  params->cmd_line_ptr = real_mode_target + cl_offset;
  grub_memcpy ((char *) params + cl_offset, linux_cmdline,
	       maximal_cmdline_size);

  grub_dprintf ("linux", "code32_start = %x\n",
		(unsigned) params->code32_start);

  auto int NESTED_FUNC_ATTR hook_fill (grub_uint64_t, grub_uint64_t,
				  grub_memory_type_t);
  int NESTED_FUNC_ATTR hook_fill (grub_uint64_t addr, grub_uint64_t size, 
				  grub_memory_type_t type)
    {
      grub_uint32_t e820_type;
      switch (type)
        {
        case GRUB_MEMORY_AVAILABLE:
	  e820_type = GRUB_E820_RAM;
	  break;

        case GRUB_MEMORY_ACPI:
	  e820_type = GRUB_E820_ACPI;
	  break;

        case GRUB_MEMORY_NVS:
	  e820_type = GRUB_E820_NVS;
	  break;

        case GRUB_MEMORY_BADRAM:
	  e820_type = GRUB_E820_BADRAM;
	  break;

        default:
          e820_type = GRUB_E820_RESERVED;
        }
      if (grub_e820_add_region (params->e820_map, &e820_num,
				addr, size, e820_type))
	return 1;

      return 0;
    }

  e820_num = 0;
  if (grub_mmap_iterate (hook_fill))
    return grub_errno;
  params->mmap_size = e820_num;

#ifdef GRUB_MACHINE_EFI
  {
    grub_efi_uintn_t efi_desc_size;
    grub_size_t efi_mmap_target;
    grub_efi_uint32_t efi_desc_version;
    err = grub_efi_finish_boot_services (&efi_mmap_size, efi_mmap_buf, NULL,
					 &efi_desc_size, &efi_desc_version);
    if (err)
      return err;
    
    /* Note that no boot services are available from here.  */
    efi_mmap_target = real_mode_target 
      + ((grub_uint8_t *) efi_mmap_buf - (grub_uint8_t *) real_mode_mem);
    /* Pass EFI parameters.  */
    if (grub_le_to_cpu16 (params->version) >= 0x0208)
      {
	params->v0208.efi_mem_desc_size = efi_desc_size;
	params->v0208.efi_mem_desc_version = efi_desc_version;
	params->v0208.efi_mmap = efi_mmap_target;
	params->v0208.efi_mmap_size = efi_mmap_size;

#ifdef __x86_64__
	params->v0208.efi_mmap_hi = (efi_mmap_target >> 32);
#endif
      }
    else if (grub_le_to_cpu16 (params->version) >= 0x0206)
      {
	params->v0206.efi_mem_desc_size = efi_desc_size;
	params->v0206.efi_mem_desc_version = efi_desc_version;
	params->v0206.efi_mmap = efi_mmap_target;
	params->v0206.efi_mmap_size = efi_mmap_size;
      }
    else if (grub_le_to_cpu16 (params->version) >= 0x0204)
      {
	params->v0204.efi_mem_desc_size = efi_desc_size;
	params->v0204.efi_mem_desc_version = efi_desc_version;
	params->v0204.efi_mmap = efi_mmap_target;
	params->v0204.efi_mmap_size = efi_mmap_size;
      }
  }
#endif

  /* FIXME.  */
  /*  asm volatile ("lidt %0" : : "m" (idt_desc)); */
  state.ebp = state.edi = state.ebx = 0;
  state.esi = real_mode_target;
  state.esp = real_mode_target;
  state.eip = params->code32_start;
  return grub_relocator32_boot (relocator, state, 0);
}

static grub_err_t
grub_linux_unload (void)
{
  grub_dl_unref (my_mod);
  loaded = 0;
  grub_free (linux_cmdline);
  linux_cmdline = 0;
  return GRUB_ERR_NONE;
}


#if defined(ALPHA_CUSTOMIZE)	//ALPHA_CUSTOMIZE, Casper, 20140519

typedef unsigned long ulong;
typedef grub_uint32_t uint32_t;
typedef grub_uint8_t uint8_t;
typedef grub_size_t size_t;

#define IH_MAGIC	0x27051956	/* Image Magic Number		*/

//X86 use little endian
#define LE_IH_MAGIC	\
	( ((IH_MAGIC&0xff000000)>>24) | \
	  ((IH_MAGIC&0x00ff0000)>>8) | \
	  ((IH_MAGIC&0x0000ff00)<<8) | \
	  ((IH_MAGIC&0x000000ff)<<24) )


#define IH_NMLEN		32	/* Image Name Length		*/
/*
 * Legacy format image header,
 * all data in network byte order (aka natural aka bigendian).
 */
typedef struct image_header {
	uint32_t	ih_magic;	/* Image Header Magic Number	*/
	uint32_t	ih_hcrc;	/* Image Header CRC Checksum	*/
	uint32_t	ih_time;	/* Image Creation Timestamp	*/
	uint32_t	ih_size;	/* Image Data Size		*/
	uint32_t	ih_load;	/* Data	 Load  Address		*/
	uint32_t	ih_ep;		/* Entry Point Address		*/
	uint32_t	ih_dcrc;	/* Image Data CRC Checksum	*/
	uint8_t		ih_os;		/* Operating System		*/
	uint8_t		ih_arch;	/* CPU architecture		*/
	uint8_t		ih_type;	/* Image Type			*/
	uint8_t		ih_comp;	/* Compression Type		*/
	uint8_t		ih_name[IH_NMLEN];	/* Image Name		*/
} image_header_t;

uint32_t crc32(uint32_t crc, const void *buf, size_t size);
int image_check_hcrc(const image_header_t *hdr);
int image_check_dcrc(unsigned char * data,  ulong len , const image_header_t *hdr);
uint32_t swap_endian (uint32_t value);

static inline uint32_t image_get_header_size(void)
{
	return (sizeof(image_header_t));
}

/**
 * memmove - Copy one area of memory to another
 * @dest: Where to copy to
 * @src: Where to copy from
 * @count: The size of the area.
 *
 * Unlike memcpy(), memmove() copes with overlapping areas.
 */
void * memmove(void * dest,const void *src,size_t count)
{
	char *tmp, *s;

	if (src == dest)
		return dest;

	if (dest <= src) {
		tmp = (char *) dest;
		s = (char *) src;
		while (count--)
			*tmp++ = *s++;
		}
	else {
		tmp = (char *) dest + count;
		s = (char *) src + count;
		while (count--)
			*--tmp = *--s;
		}

	return dest;
}


static uint32_t crc32_tab[] = {
	0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f,
	0xe963a535, 0x9e6495a3,	0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
	0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2,
	0xf3b97148, 0x84be41de,	0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
	0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec,	0x14015c4f, 0x63066cd9,
	0xfa0f3d63, 0x8d080df5,	0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
	0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,	0x35b5a8fa, 0x42b2986c,
	0xdbbbc9d6, 0xacbcf940,	0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
	0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423,
	0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
	0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,	0x76dc4190, 0x01db7106,
	0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
	0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d,
	0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
	0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
	0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
	0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7,
	0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
	0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa,
	0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
	0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81,
	0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
	0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84,
	0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
	0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
	0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
	0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e,
	0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
	0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55,
	0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
	0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28,
	0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
	0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f,
	0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
	0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
	0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
	0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69,
	0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
	0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc,
	0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
	0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693,
	0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
	0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
};

uint32_t crc32(uint32_t crc, const void *buf, size_t size)
{
	const uint8_t *p;

	p = buf;
	crc = crc ^ ~0U;

	while (size--){
		crc = crc32_tab[(crc ^ *p++) & 0xFF] ^ (crc >> 8);
	}
	crc = crc ^ ~0U ;
	return crc;
}

uint32_t swap_endian (uint32_t value)
{
	return ((value&0xff000000)>>24) | ((value&0x00ff0000)>>8) | 
		((value&0x0000ff00)<<8) |((value&0x000000ff)<<24) ;
}


int image_check_hcrc(const image_header_t *hdr)
{
	ulong hcrc;
	ulong len = image_get_header_size();
	image_header_t header;
	uint32_t ih_hcrc = swap_endian(hdr->ih_hcrc);
	
	memmove(&header, (char *)hdr, len);
	
	header.ih_hcrc = 0;
	hcrc = crc32(0, (unsigned char *)&header, len);
	
	return (hcrc == ih_hcrc);
}

static inline ulong image_get_data(const image_header_t *hdr)
{
	return ((ulong)hdr + image_get_header_size());
}

int image_check_dcrc(unsigned char * data,  ulong len , const image_header_t *hdr)
{
	uint32_t ih_dcrc = swap_endian(hdr->ih_dcrc) ;	
	ulong dcrc = crc32(0, (unsigned char *)data, len);

	return (dcrc == ih_dcrc);	
}

static image_header_t *image_check_crc(unsigned char * img_all, int verify)
{
	image_header_t *hdr = (image_header_t *)img_all;
	ulong len;	
	uint32_t ih_magic = swap_endian(hdr->ih_magic);
	
	if (ih_magic != IH_MAGIC) {
		grub_dprintf ("linux", "Bad Magic Number = %x\n", hdr->ih_magic);
		return NULL;
	}

	if (!image_check_hcrc(hdr)) {
		grub_dprintf ("linux", "Bad Header Checksum\n");
		return NULL;
	}

	if (verify) {
		grub_dprintf ("linux", "Verifying Checksum ... ");
		
		len = swap_endian(hdr->ih_size);
		
		grub_dprintf ("linux", "Data Size = %ld\n", len);
		if (!image_check_dcrc( (unsigned char *)(img_all+image_get_header_size()), len, hdr)) {
			grub_dprintf ("linux", "Bad Data CRC\n");
			return NULL;
		}
		grub_dprintf ("linux", "OK\n");
	}

/*
	if (!image_check_target_arch(hdr)) {
		printf("Unsupported Architecture 0x%x\n", image_get_arch(hdr));
		//show_boot_progress(-4);
		return NULL;
	}
*/

	return hdr;
}

#endif

static grub_err_t
grub_cmd_linux (grub_command_t cmd __attribute__ ((unused)),
		int argc, char *argv[])
{
	grub_file_t file = 0;
	struct linux_kernel_header lh;
	struct linux_kernel_params *params;
	grub_uint8_t setup_sects;
	grub_size_t real_size, prot_size, prot_file_size;
	grub_ssize_t len;
	int i;
	grub_size_t align, min_align;
	int relocatable;
	grub_uint64_t preffered_address = GRUB_LINUX_BZIMAGE_ADDR;

	grub_dl_ref (my_mod);

#if defined (ALPHA_CUSTOMIZE)
	if (crc_result == CRC_NO_MATCH) {
		grub_error (GRUB_ERR_TEST_FAILURE, N_("crc32 mismatch"));
		goto fail;
	}
#endif

  if (argc == 0)
    {
      grub_error (GRUB_ERR_BAD_ARGUMENT, N_("filename expected"));
      goto fail;
    }
  
  file = grub_file_open (argv[0]);
  
  if (! file)
    goto fail;

 
#if defined(ALPHA_CUSTOMIZE) //ALPHA_CUSTOMIZE
	grub_file_seek (file, image_get_header_size());
#endif

  if (grub_file_read (file, &lh, sizeof (lh)) != sizeof (lh))
    {
      if (!grub_errno)
	grub_error (GRUB_ERR_BAD_OS, N_("premature end of file %s"),
		    argv[0]);
      goto fail;
    }

  if (lh.boot_flag != grub_cpu_to_le16 (0xaa55))
    {
      grub_error (GRUB_ERR_BAD_OS, "invalid magic number");
      goto fail;
    }

  if (lh.setup_sects > GRUB_LINUX_MAX_SETUP_SECTS)
    {
      grub_error (GRUB_ERR_BAD_OS, "too many setup sectors");
      goto fail;
    }

  /* FIXME: 2.03 is not always good enough (Linux 2.4 can be 2.03 and
     still not support 32-bit boot.  */
  if (lh.header != grub_cpu_to_le32 (GRUB_LINUX_MAGIC_SIGNATURE)
      || grub_le_to_cpu16 (lh.version) < 0x0203)
    {
      grub_error (GRUB_ERR_BAD_OS, "version too old for 32-bit boot"
#ifdef GRUB_MACHINE_PCBIOS
		  " (try with `linux16')"
#endif
		  );
      goto fail;
    }

  if (! (lh.loadflags & GRUB_LINUX_FLAG_BIG_KERNEL))
    {
      grub_error (GRUB_ERR_BAD_OS, "zImage doesn't support 32-bit boot"
#ifdef GRUB_MACHINE_PCBIOS
		  " (try with `linux16')"
#endif
		  );
      goto fail;
    }

  if (grub_le_to_cpu16 (lh.version) >= 0x0206)
    maximal_cmdline_size = grub_le_to_cpu32 (lh.cmdline_size) + 1;
  else
    maximal_cmdline_size = 256;

  if (maximal_cmdline_size < 128)
    maximal_cmdline_size = 128;

  setup_sects = lh.setup_sects;

  /* If SETUP_SECTS is not set, set it to the default (4).  */
  if (! setup_sects)
    setup_sects = GRUB_LINUX_DEFAULT_SETUP_SECTS;

  real_size = setup_sects << GRUB_DISK_SECTOR_BITS;
  
#if defined(ALPHA_CUSTOMIZE)	//ALPHA_CUSTOMIZE, Casper
  prot_file_size = grub_file_size (file) - real_size - GRUB_DISK_SECTOR_SIZE - image_get_header_size();
#else
  prot_file_size = grub_file_size (file) - real_size - GRUB_DISK_SECTOR_SIZE;
#endif

  if (grub_le_to_cpu16 (lh.version) >= 0x205
      && lh.kernel_alignment != 0
      && ((lh.kernel_alignment - 1) & lh.kernel_alignment) == 0)
    {
      for (align = 0; align < 32; align++)
	if (grub_le_to_cpu32 (lh.kernel_alignment) & (1 << align))
	  break;
      relocatable = grub_le_to_cpu32 (lh.relocatable);
    }
  else
    {
      align = 0;
      relocatable = 0;
    }
    
  if (grub_le_to_cpu16 (lh.version) >= 0x020a)
    {
      min_align = lh.min_alignment;
      prot_size = grub_le_to_cpu32 (lh.init_size);
      prot_init_space = page_align (prot_size);
      if (relocatable)
	preffered_address = grub_le_to_cpu64 (lh.pref_address);
      else
	preffered_address = GRUB_LINUX_BZIMAGE_ADDR;
    }
  else
    {
      min_align = align;
      prot_size = prot_file_size;
      preffered_address = GRUB_LINUX_BZIMAGE_ADDR;
      /* Usually, the compression ratio is about 50%.  */
      prot_init_space = page_align (prot_size) * 3;
    }

  if (allocate_pages (prot_size, &align,
		      min_align, relocatable,
		      preffered_address))
    goto fail;

  params = (struct linux_kernel_params *) &linux_params;
  grub_memset (params, 0, sizeof (*params));
  grub_memcpy (&params->setup_sects, &lh.setup_sects, sizeof (lh) - 0x1F1);

  params->code32_start = prot_mode_target + lh.code32_start - GRUB_LINUX_BZIMAGE_ADDR;
  params->kernel_alignment = (1 << align);
  params->ps_mouse = params->padding10 =  0;

  len = sizeof (*params) - sizeof (lh);
  if (grub_file_read (file, (char *) params + sizeof (lh), len) != len)
    {
      if (!grub_errno)
	grub_error (GRUB_ERR_BAD_OS, N_("premature end of file %s"),
		    argv[0]);
      goto fail;
    }

  params->type_of_loader = GRUB_LINUX_BOOT_LOADER_TYPE;

  /* These two are used (instead of cmd_line_ptr) by older versions of Linux,
     and otherwise ignored.  */
  params->cl_magic = GRUB_LINUX_CL_MAGIC;
  params->cl_offset = 0x1000;

  params->ramdisk_image = 0;
  params->ramdisk_size = 0;

  params->heap_end_ptr = GRUB_LINUX_HEAP_END_OFFSET;
  params->loadflags |= GRUB_LINUX_FLAG_CAN_USE_HEAP;

  /* These are not needed to be precise, because Linux uses these values
     only to raise an error when the decompression code cannot find good
     space.  */
  params->ext_mem = ((32 * 0x100000) >> 10);
  params->alt_mem = ((32 * 0x100000) >> 10);

  /* Ignored by Linux.  */
  params->video_page = 0;

  /* Only used when `video_mode == 0x7', otherwise ignored.  */
  params->video_ega_bx = 0;

  params->font_size = 16; /* XXX */

#ifdef GRUB_MACHINE_EFI
#ifdef __x86_64__
  if (grub_le_to_cpu16 (params->version < 0x0208) &&
      ((grub_addr_t) grub_efi_system_table >> 32) != 0)
    return grub_error(GRUB_ERR_BAD_OS,
		      "kernel does not support 64-bit addressing");
#endif

  if (grub_le_to_cpu16 (params->version) >= 0x0208)
    {
      params->v0208.efi_signature = GRUB_LINUX_EFI_SIGNATURE;
      params->v0208.efi_system_table = (grub_uint32_t) (unsigned long) grub_efi_system_table;
#ifdef __x86_64__
      params->v0208.efi_system_table_hi = (grub_uint32_t) ((grub_uint64_t) grub_efi_system_table >> 32);
#endif
    }
  else if (grub_le_to_cpu16 (params->version) >= 0x0206)
    {
      params->v0206.efi_signature = GRUB_LINUX_EFI_SIGNATURE;
      params->v0206.efi_system_table = (grub_uint32_t) (unsigned long) grub_efi_system_table;
    }
  else if (grub_le_to_cpu16 (params->version) >= 0x0204)
    {
      params->v0204.efi_signature = GRUB_LINUX_EFI_SIGNATURE_0204;
      params->v0204.efi_system_table = (grub_uint32_t) (unsigned long) grub_efi_system_table;
    }
#endif

  /* The other parameters are filled when booting.  */
#if defined(ALPHA_CUSTOMIZE)	//ALPHA_CUSTOMIZE, Casper
	grub_file_seek (file, real_size + GRUB_DISK_SECTOR_SIZE + image_get_header_size());
#else
  grub_file_seek (file, real_size + GRUB_DISK_SECTOR_SIZE);
#endif

  grub_dprintf ("linux", "bzImage, setup=0x%x, size=0x%x\n",
		(unsigned) real_size, (unsigned) prot_size);

  /* Look for memory size and video mode specified on the command line.  */
  linux_mem_size = 0;
  for (i = 1; i < argc; i++)
#ifdef GRUB_MACHINE_PCBIOS
    if (grub_memcmp (argv[i], "vga=", 4) == 0)
      {
	/* Video mode selection support.  */
	char *val = argv[i] + 4;
	unsigned vid_mode = GRUB_LINUX_VID_MODE_NORMAL;
	struct grub_vesa_mode_table_entry *linux_mode;
	grub_err_t err;
	char *buf;

	grub_dl_load ("vbe");

	if (grub_strcmp (val, "normal") == 0)
	  vid_mode = GRUB_LINUX_VID_MODE_NORMAL;
	else if (grub_strcmp (val, "ext") == 0)
	  vid_mode = GRUB_LINUX_VID_MODE_EXTENDED;
	else if (grub_strcmp (val, "ask") == 0)
	  {
	    grub_puts_ (N_("Legacy `ask' parameter no longer supported."));

	    /* We usually would never do this in a loader, but "vga=ask" means user
	       requested interaction, so it can't hurt to request keyboard input.  */
	    grub_wait_after_message ();

	    goto fail;
	  }
	else
	  vid_mode = (grub_uint16_t) grub_strtoul (val, 0, 0);

	switch (vid_mode)
	  {
	  case 0:
	  case GRUB_LINUX_VID_MODE_NORMAL:
	    grub_env_set ("gfxpayload", "text");
	    grub_printf_ (N_("%s is deprecated. "
			     "Use set gfxpayload=%s before "
			     "linux command instead.\n"), "text",
			  argv[i]);
	    break;

	  case 1:
	  case GRUB_LINUX_VID_MODE_EXTENDED:
	    /* FIXME: support 80x50 text. */
	    grub_env_set ("gfxpayload", "text");
	    grub_printf_ (N_("%s is deprecated. "
			     "Use set gfxpayload=%s before "
			     "linux command instead.\n"), "text",
			  argv[i]);
	    break;
	  default:
	    /* Ignore invalid values.  */
	    if (vid_mode < GRUB_VESA_MODE_TABLE_START ||
		vid_mode > GRUB_VESA_MODE_TABLE_END)
	      {
		grub_env_set ("gfxpayload", "text");
		/* TRANSLATORS: "x" has to be entered in, like an identifier,
		   so please don't use better Unicode codepoints.  */
		grub_printf_ (N_("%s is deprecated. VGA mode %d isn't recognized. "
				 "Use set gfxpayload=WIDTHxHEIGHT[xDEPTH] "
				 "before linux command instead.\n"),
			     argv[i], vid_mode);
		break;
	      }

	    linux_mode = &grub_vesa_mode_table[vid_mode
					       - GRUB_VESA_MODE_TABLE_START];

	    buf = grub_xasprintf ("%ux%ux%u,%ux%u",
				 linux_mode->width, linux_mode->height,
				 linux_mode->depth,
				 linux_mode->width, linux_mode->height);
	    if (! buf)
	      goto fail;

	    grub_printf_ (N_("%s is deprecated. "
			     "Use set gfxpayload=%s before "
			     "linux command instead.\n"),
			 argv[i], buf);
	    err = grub_env_set ("gfxpayload", buf);
	    grub_free (buf);
	    if (err)
	      goto fail;
	  }
      }
    else
#endif /* GRUB_MACHINE_PCBIOS */
    if (grub_memcmp (argv[i], "mem=", 4) == 0)
      {
	char *val = argv[i] + 4;

	linux_mem_size = grub_strtoul (val, &val, 0);

	if (grub_errno)
	  {
	    grub_errno = GRUB_ERR_NONE;
	    linux_mem_size = 0;
	  }
	else
	  {
	    int shift = 0;

	    switch (grub_tolower (val[0]))
	      {
	      case 'g':
		shift += 10;
	      case 'm':
		shift += 10;
	      case 'k':
		shift += 10;
	      default:
		break;
	      }

	    /* Check an overflow.  */
	    if (linux_mem_size > (~0UL >> shift))
	      linux_mem_size = 0;
	    else
	      linux_mem_size <<= shift;
	  }
      }
    else if (grub_memcmp (argv[i], "quiet", sizeof ("quiet") - 1) == 0)
      {
	params->loadflags |= GRUB_LINUX_FLAG_QUIET;
      }

  /* Create kernel command line.  */
  linux_cmdline = grub_zalloc (maximal_cmdline_size + 1);
  if (!linux_cmdline)
    goto fail;
  grub_memcpy (linux_cmdline, LINUX_IMAGE, sizeof (LINUX_IMAGE));
  grub_create_loader_cmdline (argc, argv,
			      linux_cmdline
			      + sizeof (LINUX_IMAGE) - 1,
			      maximal_cmdline_size
			      - (sizeof (LINUX_IMAGE) - 1));

  len = prot_file_size;
  if (grub_file_read (file, prot_mode_mem, len) != len && !grub_errno)
    grub_error (GRUB_ERR_BAD_OS, N_("premature end of file %s"),
		argv[0]);

  if (grub_errno == GRUB_ERR_NONE)
    {
      grub_loader_set (grub_linux_boot, grub_linux_unload,
		       0 /* set noreturn=0 in order to avoid grub_console_fini() */);
      loaded = 1;
    }

 fail:

  if (file)
    grub_file_close (file);

  if (grub_errno != GRUB_ERR_NONE)
    {
      grub_dl_unref (my_mod);
      loaded = 0;
    }

  return grub_errno;
}

static grub_err_t
grub_cmd_initrd (grub_command_t cmd __attribute__ ((unused)),
		 int argc, char *argv[])
{
  grub_file_t *files = 0;
  grub_size_t size = 0;
  grub_addr_t addr_min, addr_max;
  grub_addr_t addr;
  grub_err_t err;
  int i;
  int nfiles = 0;
  grub_uint8_t *ptr;


#if defined (ALPHA_CUSTOMIZE)
	if (crc_result == CRC_NO_MATCH) {
		grub_error (GRUB_ERR_TEST_FAILURE, N_("crc32 mismatch"));
		goto fail;
	}
#endif

  if (argc == 0)
    {
      grub_error (GRUB_ERR_BAD_ARGUMENT, N_("filename expected"));
      goto fail;
    }

  if (! loaded)
    {
      grub_error (GRUB_ERR_BAD_ARGUMENT, N_("you need to load the kernel first"));
      goto fail;
    }

  files = grub_zalloc (argc * sizeof (files[0]));
  if (!files)
    goto fail;

  for (i = 0; i < argc; i++)
    {
      grub_file_filter_disable_compression ();
      files[i] = grub_file_open (argv[i]);
      if (! files[i])
		goto fail;
		
#if defined(ALPHA_CUSTOMIZE)
		grub_file_seek (files[i], image_get_header_size());
#endif
		nfiles++;

#if defined(ALPHA_CUSTOMIZE)
		size += ALIGN_UP (grub_file_size (files[i]) - image_get_header_size(), 4);
#else
		size += ALIGN_UP (grub_file_size (files[i]), 4);
#endif

    }

  initrd_pages = (page_align (size) >> 12);

  /* Get the highest address available for the initrd.  */
  if (grub_le_to_cpu16 (linux_params.version) >= 0x0203)
    {
      addr_max = grub_cpu_to_le32 (linux_params.initrd_addr_max);

      /* XXX in reality, Linux specifies a bogus value, so
	 it is necessary to make sure that ADDR_MAX does not exceed
	 0x3fffffff.  */
      if (addr_max > GRUB_LINUX_INITRD_MAX_ADDRESS)
	addr_max = GRUB_LINUX_INITRD_MAX_ADDRESS;
    }
  else
    addr_max = GRUB_LINUX_INITRD_MAX_ADDRESS;

  if (linux_mem_size != 0 && linux_mem_size < addr_max)
    addr_max = linux_mem_size;

  /* Linux 2.3.xx has a bug in the memory range check, so avoid
     the last page.
     Linux 2.2.xx has a bug in the memory range check, which is
     worse than that of Linux 2.3.xx, so avoid the last 64kb.  */
  addr_max -= 0x10000;

  addr_min = (grub_addr_t) prot_mode_target + prot_init_space
             + page_align (size);

  /* Put the initrd as high as possible, 4KiB aligned.  */
  addr = (addr_max - size) & ~0xFFF;

  if (addr < addr_min)
    {
      grub_error (GRUB_ERR_OUT_OF_RANGE, "the initrd is too big");
      goto fail;
    }

  {
    grub_relocator_chunk_t ch;
    err = grub_relocator_alloc_chunk_align (relocator, &ch,
					    addr_min, addr, size, 0x1000,
					    GRUB_RELOCATOR_PREFERENCE_HIGH,
					    1);
    if (err)
      return err;
    initrd_mem = get_virtual_current_address (ch);
    initrd_mem_target = get_physical_target_address (ch);
  }

  ptr = initrd_mem;
  for (i = 0; i < nfiles; i++)
    {
#if defined(ALPHA_CUSTOMIZE)
		grub_ssize_t cursize = (grub_file_size (files[i]) - image_get_header_size());
#else
		grub_ssize_t cursize = grub_file_size (files[i]);
#endif
      if (grub_file_read (files[i], ptr, cursize) != cursize)
	{
	  if (!grub_errno)
	    grub_error (GRUB_ERR_FILE_READ_ERROR, N_("premature end of file %s"),
			argv[i]);
	  goto fail;
	}
      ptr += cursize;
      grub_memset (ptr, 0, ALIGN_UP_OVERHEAD (cursize, 4));
      ptr += ALIGN_UP_OVERHEAD (cursize, 4);
    }

  grub_dprintf ("linux", "Initrd, addr=0x%x, size=0x%x\n",
		(unsigned) addr, (unsigned) size);

  linux_params.ramdisk_image = initrd_mem_target;
  linux_params.ramdisk_size = size;
  linux_params.root_dev = 0x0100; /* XXX */

 fail:
  for (i = 0; i < nfiles; i++)
    grub_file_close (files[i]);
  grub_free (files);

  return grub_errno;
}

#if defined(ALPHA_CUSTOMIZE)
static grub_err_t
grub_cmd_alpha_crc32_reset (grub_command_t cmd __attribute__ ((unused)),
		 int argc, char *argv[])
{
		crc_result = CRC_MATCH;	
		return grub_errno;
}

static grub_err_t
grub_cmd_alpha_crc32_check (grub_command_t cmd __attribute__ ((unused)),
		 int argc, char *argv[])
{
	grub_file_t *files = 0;
	int i;
	int nfiles = 0;

	image_header_t *hdr;
	unsigned char * img_all;
	grub_ssize_t len;

	if (argc == 0)
	{
		crc_result = CRC_NO_MATCH;	
		grub_error (GRUB_ERR_BAD_ARGUMENT, N_("filename expected"));
		goto fail;
	}

	files = grub_zalloc (argc * sizeof (files[0]));
	if (!files) {
		crc_result = CRC_NO_MATCH;
		goto fail;
	}

	for (i = 0; i < argc; i++)
	{
		grub_file_filter_disable_compression ();
//		grub_dprintf ("linux", "Open File : %s", argv[i]);		
		files[i] = grub_file_open (argv[i]);		
		if (! files[i]) {
			crc_result = CRC_NO_MATCH;
			goto fail;
		}
		
		len = grub_file_size(files[i]);
		img_all = grub_malloc(len);
		if (!img_all) {
			grub_dprintf ("linux", "Out of memory");
			crc_result = CRC_NO_MATCH;		
			goto fail;
		}
		
		if (grub_file_read (files[i], img_all, len) != len) {
			if (!grub_errno)
				grub_error (GRUB_ERR_BAD_OS, N_("Open file %s"),
			    	argv[i]);
			crc_result = CRC_NO_MATCH;			
			goto fail;
		}
		
		hdr = image_check_crc(img_all, 1);
		grub_free(img_all);
		if (!hdr)
		{
			crc_result = CRC_NO_MATCH;		
			grub_dprintf ("linux", "crc32 mismatch : %s\n",argv[i]);
			goto fail;
		} else {
			grub_dprintf ("linux", "crc32 match : %s\n",argv[i]);
		}
		nfiles++;
    }

	fail:
		for (i = 0; i < nfiles; i++)
			grub_file_close (files[i]);
	grub_free (files);

	return grub_errno;
}

#endif

#if defined(ALPHA_CUSTOMIZE)
static grub_command_t cmd_linux, cmd_initrd, cmd_alpha_crc32_check, cmd_alpha_crc32_reset;
#else
static grub_command_t cmd_linux, cmd_initrd;
#endif

GRUB_MOD_INIT(linux)
{
	cmd_linux = grub_register_command ("linux", grub_cmd_linux,
				     0, N_("Load Linux."));
	cmd_initrd = grub_register_command ("initrd", grub_cmd_initrd,
				     0, N_("Load initrd."));
#if defined(ALPHA_CUSTOMIZE)
	cmd_alpha_crc32_check = grub_register_command ("Alpha_CRC32_Check", grub_cmd_alpha_crc32_check,
				     0, N_("Alpha - Check CRC32 of Image."));

	cmd_alpha_crc32_reset = grub_register_command ("Alpha_CRC32_Reset", grub_cmd_alpha_crc32_reset,
				 0, N_("Alpha - Reset Check Result of CRC32."));
#endif
	my_mod = mod;
}

GRUB_MOD_FINI(linux)
{
	grub_unregister_command (cmd_linux);
	grub_unregister_command (cmd_initrd);
#if defined(ALPHA_CUSTOMIZE)
	grub_unregister_command (cmd_alpha_crc32_check);
	grub_unregister_command (cmd_alpha_crc32_reset);
#endif
}
