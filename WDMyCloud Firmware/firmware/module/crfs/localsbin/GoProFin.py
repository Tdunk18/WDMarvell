#!/usr/bin/python
# 2014.01.07 VODKA
# Final version 2014.02.27
##
import os
import sys
import argparse
import commands
import shutil
import time
import fcntl
from   threading import Thread
import threading
import traceback
import datetime
import signal
#Global value
MANUFACTURER   = "GoPro"
#TMP_FOLDER     = "/mnt/HD/HD_a2/tmp/"
TMP_FOLDER     = ""
LOCK           = "/var/lock/GoPro.lock"
LOG_FILE       = "/var/log/GoPro.log"
XML_FILE_TMP   = "/var/www/xml/gopro/gopro_camera_tmp.xml"
XML_FILE       = "/var/www/xml/gopro/gopro_camera.xml"
SAVE_PATH      = "/var/www/xml/gopro/"
MOUNT_FOLDER   = "/mnt/USB/GoPro/"
PHOTO_FLAG     = True
THREAD_RUNNING = True
TRANS_NUM      = ""
GOPRO_STATUS   = "init"
#For exception
GO_LIST    = ""
#syslog
LOG_INFO       = 6
LOG_WARNING    = 4
#alert id
CANNOT_COPY_FILES_FROM_CAMERA = 1127
CANNOT_MOVE_FILES_FROM_CAMERA = 1130
FILES_COPIED_FROM_CAMERA      = 2126
COPYING_FILES                 = 2128
FILES_MOVED_FROM_CAMERA       = 2129
MOVING_FILES                  = 2131

#-------------------------------
#  To Do : debug print
#-------------------------------
def dprint(msg):
  print msg
  log(msg)
#-------------------------------
#  To Do : Write to LOG
#-------------------------------
def log(msg):
	try:
		l = open(LOG_FILE,'a')
		l.write('%s' % datetime.datetime.now().ctime() + ' : ' + msg+'\n')
		l.close()
	except:
		sys.stderr.write('Warning: Exception encountered')
		msg = traceback.format_exception(sys.exc_info()[0],
		                                 sys.exc_info()[1],
		                                 sys.exc_info()[2])
		msg = ''.join(msg)
		print msg

def clear_alert():
	os.system("alert_test -R")
	dprint("Clear alert!!")
	
def err_log(trans_mode,manufacturer,transfer_folder):
	trans_file()
	if trans_mode == "copy":
		msg = "Failed to copy %s files from %s to %s on %s"%(TRANS_NUM,manufacturer,transfer_folder,datetime.datetime.now().ctime())
		alert_id = CANNOT_COPY_FILES_FROM_CAMERA
	elif trans_mode == "move":
		msg = "Failed to move %s files from %s to %s on %s"%(TRANS_NUM,manufacturer,transfer_folder,datetime.datetime.now().ctime())
		alert_id = CANNOT_MOVE_FILES_FROM_CAMERA
	#alert code
	cmd = "alert_test -a %d -p \"%s,%s\" -f"%(alert_id,manufacturer,transfer_folder)
	os.system(cmd)
	#syslog
	os.system("/usr/bin/logger -t \"MTP\" -p %d %s"%(LOG_WARNING,msg))
def write_xml(vendor,model,sn,rev,mode,status,percent,count):
	try:
		l = open(XML_FILE_TMP,'w')
		l.write('<?xml version=\"1.0\" encoding=\"utf-8\" ?> \n')
		l.write('<config>\n')
		l.write('<device_name>%s %s</device_name>\n'%(vendor,model))
		l.write('<manufacturer>%s</manufacturer>\n'%vendor)
		l.write('<model>%s</model>\n'%model)
		l.write('<serial_number>%s</serial_number>\n'%sn)
		l.write('<revision>%s</revision>\n'%rev)
		l.write('<transfer_mode>%s</transfer_mode>\n'%mode)
		l.write('<time>%s</time>\n'%commands.getoutput("date +%s"))
		l.write('<status>%s</status>\n'%status)
		l.write('<percent>%s</percent>\n'%percent)
		l.write('<file_count>%s</file_count>\n'%count)
		l.write('</config>\n')
		l.close()
	except:
		sys.stderr.write('Warning: Exception encountered')
		msg = traceback.format_exception(sys.exc_info()[0],
		                                 sys.exc_info()[1],
		                                 sys.exc_info()[2])
		msg = ''.join(msg)
		print msg
#-------------------------------
#  To Do : check setting
#-------------------------------
def check_setting(args):
	#delete log file
	if os.path.exists(LOG_FILE):
		os.system("rm %s"%LOG_FILE)
		
	#check auto backup mode 0:off 1:on
	if (args.auto_mode == "off"):
		dprint("Backup option is off!!")
		mount_action("umount",args.dev)
		clear_alert()
		sys.exit()
	#check source path
	if not os.path.exists(args.source):
		dprint("Source path [%s] doesn't exist!!"%args.source)
		mount_action("umount",args.dev)
		clear_alert()
		sys.exit()	
	#check xml save path
	if not os.path.exists(SAVE_PATH):
	  os.makedirs(SAVE_PATH)	
	
def check_disk():
	global TMP_FOLDER
	dev = ['a','b','c','d']
	for dev_num in dev:
		if os.path.exists("/mnt/HD/HD_%s2/"%dev_num):
			dprint("find dev:[/mnt/HD/HD_%s2]"%dev_num)
			TMP_FOLDER     = "/mnt/HD/HD_%s2/tmp/"%dev_num
			break
	if TMP_FOLDER == "":
		dprint("[ERR]No disk !!")
		clear_alert()
		sys.exit()
		
def set_status(tag,msg):
    dprint("setting %s...."%msg)
    commands.getoutput("sed -i \"s/<%s>.*/<%s>%s<\/%s>/g\" %s"%(tag,tag,msg,tag,XML_FILE))
	
def mount_action(mode,dev):
	if mode == "mount":
		dprint("mount [/dev/%s1]"%dev)
		if not os.path.exists(MOUNT_FOLDER):
			os.makedirs(MOUNT_FOLDER)
		else:
			rel = commands.getoutput("umount /dev/%s1 "%dev)
			
		rel = commands.getoutput("mount /dev/%s1 %s"%(dev,MOUNT_FOLDER))
	elif mode == "umount":
		os.system("sync")
		time.sleep(5)
		dprint("umount [/dev/%s1]"%dev)
		command = "fuser -m -v /dev/%s1"%dev
		os.system(command)
		#kill = commands.getoutput(command)
		#dprint("kill user [%s]"%rel)
		for i in range(7):
		  (status,rel) = commands.getstatusoutput("umount /dev/%s1"%dev)
		  dprint("umount message :[%s] status:[%s]"%(rel,status))
		  mtable = commands.getoutput("mount | grep /dev/%s1"%dev)
		  dprint("mtable:[%s]"%mtable)
		  if not mtable:
		    break
		  time.sleep(1)
		if mtable:
		  (status,rel) = commands.getstatusoutput("umount /dev/%s1 -l"%dev)
		  dprint("LAZY umount mes :[%s] status:[%s]"%(rel,status))
		if os.path.exists(MOUNT_FOLDER):
			shutil.rmtree(MOUNT_FOLDER)
			
def trans_file():
    global TRANS_NUM
    TRANS_NUM = commands.getoutput("cat %s |grep file_count | awk -F '<file_count>' '{split($2,a,\"</file_count>\")};{print a[1]}'"%XML_FILE)
	
def do_except(sig,_id):
	global THREAD_RUNNING
	global GOPRO_STATUS
	THREAD_RUNNING = False
	GoPar = GO_LIST.split(",")
	dprint("Exception working")
	dprint("--[%s] [%s] [%s] [%s]"%(GoPar[0],GoPar[1],GoPar[2],GoPar[3]))
	base = commands.getoutput("basename %s"%GoPar[0])
	if GoPar[2] == "0":
		commands.getoutput("ps | awk '{if($5==\"rsync\"){for(i=2;i<=NF;i++){if($i==\"%s\"){print $1;break}}}}' | xargs kill"%GoPar[0])
		do_rename = rename_func()
		do_rename.rename_dir_suffix(GoPar[3])
	elif GoPar[2] == "1":
		photo_backup = Photo_date_backup("")
		TMP_FOLDER_BASE=TMP_FOLDER+base+"/"
		photo_backup.checkFileDir(TMP_FOLDER_BASE,GoPar[1])
		photo_backup.copyFileDir(TMP_FOLDER_BASE,GoPar[1])
		shutil.rmtree(TMP_FOLDER_BASE,ignore_errors=True)
	elif GoPar[2] == "2":
		commands.getoutput("ps | awk '{if($5==\"rsync\"){for(i=2;i<=NF;i++){if($i==\"%s\"){print $1;break}}}}' | xargs kill"%GoPar[0])
		do_rename = rename_func()
		do_rename.rename_dir_suffix(GoPar[3])
		
	GOPRO_STATUS = "init"
	set_status("status","init")
	set_status("percent","")
	mount_action("umount",GoPar[6])
	err_log(GoPar[4],GoPar[5],GoPar[1])
	os.kill(os.getpid(),signal.SIGUSR1)
	

def do_hotplug(args):
	#kill process if exist
	dprint("hotplug Exception working")
	GoPar = GO_LIST.split(",")
	base = commands.getoutput("basename %s"%args.source)
	commands.getoutput("ps | awk '{if($5==\"rsync\"){for(i=2;i<=NF;i++){if($i==\"%s\"){print $1;break}}}}' | xargs kill"%GoPar[0])
	pid = commands.getoutput("ps | grep GoProFin.py | awk '{if(($7==\"/usr/local/sbin/GoProFin.py\")&&($8==\"%s\")){for(i=2;i<=NF;i++){if($i == \"--hotplug\"){return}}print $1}}'"%GoPar[6])
	dprint("pid:[%s]"%pid)
	if pid:
	  commands.getoutput("ps | grep GoProFin.py | awk '{if(($7==\"/usr/local/sbin/GoProFin.py\")&&($8==\"%s\")){for(i=2;i<=NF;i++){if($i==\"--hotplug\"){return}}print $1}}' | xargs kill"%GoPar[6])
	  set_status("status","fail")
	else:
	  clear_alert()
	  
	set_status("status","init")  
	mount_action("umount",GoPar[6])
	#do rename something
	if os.path.exists(args.dest_path):
	  do_rename = rename_func()
	  do_rename.rename_dir_suffix(args.dest_path)
	  
	TMP_FOLDER_BASE=TMP_FOLDER+base+"/"
	if os.path.exists(TMP_FOLDER_BASE):
	  photo_backup = Photo_date_backup("")
	  photo_backup.checkFileDir(TMP_FOLDER_BASE,"/shares%s"%args.transfer_folder)
	  photo_backup.copyFileDir(TMP_FOLDER_BASE,"/shares%s"%args.transfer_folder)
	  shutil.rmtree(TMP_FOLDER_BASE,ignore_errors=True)
	if pid:
	  err_log(GoPar[4],GoPar[5],GoPar[1])

def clean(args):
	#do rename something
	dprint("cleaning")
	
	base = commands.getoutput("basename %s"%args.source)
	if os.path.exists(args.dest_path):
	  do_rename = rename_func()
	  do_rename.rename_dir_suffix(args.dest_path)
	  
	TMP_FOLDER_BASE=TMP_FOLDER+base+"/"
	if os.path.exists(TMP_FOLDER_BASE):
	  photo_backup = Photo_date_backup("")
	  photo_backup.checkFileDir(TMP_FOLDER_BASE,"/shares%s"%args.transfer_folder)
	  photo_backup.copyFileDir(TMP_FOLDER_BASE,"/shares%s"%args.transfer_folder)
	  shutil.rmtree(TMP_FOLDER_BASE,ignore_errors=True)
	
#-------------------------------
#  To Do : for parser /etc/NAS_CFG/config.xml
#          and set to parameter
#  
#-------------------------------
def init_args(args):
	if (args.transfer_mode == None):
		output = commands.getoutput('xmldbc -g /download_mgr/mtp_backup/mode')
		args.transfer_mode = output == "0" and "copy" or "move"
	if (args.auto_mode == None):
		output = commands.getoutput('xmldbc -g /download_mgr/mtp_backup/automatic')
		args.auto_mode = output == "0" and "off" or "on"
	if (args.transfer_folder == None):
		args.transfer_folder = commands.getoutput('xmldbc -g /download_mgr/mtp_backup/transfer_folder')
	if (args.folder_option == None):
		args.folder_option = commands.getoutput('xmldbc -g /download_mgr/mtp_backup/folder_option')
	if (args.date_format == None):
		output = commands.getoutput('xmldbc -g /system_mgr/time/date_format')
		if (output == "YYYY-MM-DD"):
			args.date_format = "0"
		elif (output == "MM-DD-YYYY"):
			args.date_format = "1"
		elif (output == "DD-MM-YYYY"):
			args.date_format = "2"
		else:
			args.date_format = "0"
	if (args.folder_name == None):
		args.folder_name = commands.getoutput('xmldbc -g /download_mgr/mtp_backup/folder_name')
		
	#adjust path
	args.source = adjust_path(args.source)

	
#-------------------------------
#  To Do : FOR PROGRESS THREAD
#-------------------------------
class ProgressThread(threading.Thread):
	
  def __init__(self,args):
  	threading.Thread.__init__(self)
  	self._args = args
  	#get destination folder number at first
  	self.ori_total_dest = getFolderNum2(self._args.dest_path)
  	#for rsync percent file
  	base = commands.getoutput("basename %s"%self._args.source)
  	self.rsync_file = "/tmp/r_%s"%base
	#remove /tmp/xxx/NUM and /tmp/r_xxx 
	if os.path.exists(self.rsync_file):
	    os.remove(self.rsync_file)
	if os.path.exists(TMP_FOLDER+"NUM"):
	    os.remove(TMP_FOLDER+"NUM")
  	#get source total size
  	self.ori_size_source = getFolderSize(self._args.source)
	self.ori_num_source = getFolderNum2(self._args.source)
	dprint("get source num:[%s] [%s]"%(str(self.ori_num_source),self._args.source))
	dprint("get source size:[%s] [%s]"%(str(self.ori_size_source),self._args.source))
  
  def __del__(self):
    self.xml_create()
	
  def run(self):
  	while(THREAD_RUNNING):
  		self.xml_create()
  		time.sleep(1)
  	#update the latest status

  def stop(self):
  	global THREAD_RUNNING
  	THREAD_RUNNING = False
  	print "Progress Thread Stop"
  	
  def xml_create(self):
  	REMOVE = False
	RSYNC_STATUS = True
	global GOPRO_STATUS
	
  	if (self._args.folder_option == "0"):
  		REMOVE = True
  		dest_num = getFolderNum2(self._args.dest_path)
		sub_num = int(dest_num)-int(self.ori_total_dest)
  		if  os.path.exists(self.rsync_file):
  			#for percentage
  			percent = commands.getoutput("head -n 1 \"%s\""%self.rsync_file)
			if sub_num <= int(self.ori_num_source):
			  file_count = str(int(dest_num)-int(self.ori_total_dest))
			else :
			  dprint("over file num sou:[%s] dest:[%s] sub:[%s] replace:[%s]"%(self.ori_num_source,dest_num,str(sub_num),str(self.ori_num_source)))
			  file_count = str(self.ori_num_source)
			
			if percent == "-1":
			  RSYNC_STATUS = False
  			REMOVE = True
		elif not os.path.exists(self.rsync_file):
			percent = ""
			file_count = ""
			REMOVE = True
  	elif (self._args.folder_option == "1"):
		percent = ""
		file_count = ""
  		if os.path.exists(self._args.dest_path) and PHOTO_FLAG and not os.path.exists(TMP_FOLDER+"NUM"):
			try:
			  rate = float(getFolderSize(self._args.dest_path)) / float(self.ori_size_source)
			  #rate_num = int(rate*100)
			  percent = str(int(rate*100))
			  file_count = str(getFolderNum2(self._args.dest_path))
			  dprint("[%s] [%s]"%(self.ori_size_source,self._args.dest_path))
			  REMOVE = True
			except ZeroDivisionError:
			  dprint("[ERR]ZeroDivision") 
			except:
			  dprint("[ERR]division error")
  		if os.path.exists(TMP_FOLDER+"NUM"):
			percent = "100"
			file_count = commands.getoutput("cat \"%sNUM\""%TMP_FOLDER)
  			REMOVE = True
  	elif (self._args.folder_option == "2"):
  		REMOVE = True
  		dest_num = getFolderNum2(self._args.dest_path)
		sub_num = int(dest_num)-int(self.ori_total_dest)
  		if  os.path.exists(self.rsync_file):
  			#for percentage
  			percent = commands.getoutput("head -n 1 \"%s\""%self.rsync_file)
			if sub_num <= int(self.ori_num_source):
			  file_count = str(int(dest_num)-int(self.ori_total_dest))
			else :
			  dprint("over file num sou:[%s] dest:[%s] sub:[%s] replace:[%s]"%(self.ori_num_source,dest_num,str(sub_num),str(self.ori_num_source)))
			  file_count = str(self.ori_num_source)
			
			if percent == "-1":
			  RSYNC_STATUS = False
  			REMOVE = True
		elif not os.path.exists(self.rsync_file):
			percent = ""
			file_count = ""
			REMOVE = True
			
	if not RSYNC_STATUS and GOPRO_STATUS!="init":
		GOPRO_STATUS = "fail"
	elif GOPRO_STATUS=="init":
	    percent = ""
	write_xml(self._args.manufacturer,self._args.model,self._args.sn,self._args.rev,
	          self._args.transfer_mode == "copy" and "0" or "1",GOPRO_STATUS,percent,file_count)
  	#check rename or not
  	if REMOVE:
  		shutil.move(XML_FILE_TMP,XML_FILE)

		
#-----------------------------------
#  To Do: FUNCTION FOR HANDLE FOLDER
#  
#-----------------------------------
def getFolderSize(folder):
	if not os.path.exists(folder):
		return
	total_size = os.path.getsize(folder)
	for item in os.listdir(folder):
		itempath = os.path.join(folder,item)
		if os.path.isfile(itempath):
			total_size += os.path.getsize(itempath)
		elif os.path.isdir(itempath):
			total_size += getFolderSize(itempath)
	return total_size

def getFolderNum(folder):
	if not os.path.exists(folder):
		return	
	total_num = 0
	for item in os.listdir(folder):
		itempath = os.path.join(folder,item)
		if os.path.isfile(itempath):
			total_num += 1
		elif os.path.isdir(itempath):
			total_num += getFolderNum(itempath)
	return total_num
	
def getFolderNum2(folder):
	if not os.path.exists(folder):
		dprint("getFolderNum2:[%s] doesn't exist"%folder)
		return	0
	total_num = 0
	command = "find \"%s\" \( -name .wdmc \) -prune -o -type f ! -name \".*\" -print 2>/dev/null | wc -l "%folder
	(status, total_num) = commands.getstatusoutput(command)
	return total_num

#-----------------------------------
#  To Do: ADJUST FILE PATH
#  
#-----------------------------------	
def adjust_path(path):
	if not (path[len(path)-1] == "/"):
		path = path + "/"
		return path
	return path
	
def adjust_dest_path(args):
	if (args.folder_option == "0"):
		if (args.date_format == "0"):
			date_command="date \"+%Y/%m/%d\" | sed \"s/\//-/g\""
		elif (args.date_format == "1"):
			date_command="date \"+%m/%d/%Y\" | sed \"s/\//-/g\""
		elif (args.date_format == "2"):
			date_command="date \"+%d/%m/%Y\" | sed \"s/\//-/g\""
		else:
			dprint("[ERR]Can't get date format")
			mount_action("umount",args.dev)
			clear_alert()
			sys.exit()
		now_date = commands.getoutput(date_command)
		args.dest_path = "/shares%s/%s"%(args.transfer_folder,now_date)
	elif (args.folder_option == "1"):
		basename_command="basename %s"%args.source
		basename = commands.getoutput(basename_command)
		args.dest_path = adjust_path(TMP_FOLDER+basename)
	elif (args.folder_option == "2"):
		args.dest_path = "/shares%s/%s"%(args.transfer_folder,args.folder_name)
		
#-----------------------------------
#  To Do: FOR RENAME FILE
#  
#-----------------------------------			
class rename_func:
	def file_Rename(self,path,_count_str):
		fname, fextension=os.path.splitext(path)
		rname=fname+_count_str+fextension
		shutil.move(path,rname)
		
	def rename_file_suffix(self,path):
		_count = 0
		_TMP=path
		while (os.path.exists(path)):
			_count =_count+1
			fname, fextension=os.path.splitext(_TMP)
			if _count<=9:
				_count_str="_0"+str(_count)
			else:
				_count_str="_"+str(_count)
			path=fname+_count_str+fextension
		
		if not _count==0:
			self.file_Rename(_TMP,_count_str)
			
	def rename_dir_suffix(self,dest_path):
		fileList = os.listdir(dest_path)
		for eachFile in fileList:
			check_path = os.path.join(dest_path,eachFile)
			if os.path.isdir(check_path): 
				self.rename_dir_suffix(check_path)
			else:
				token_index=check_path.find("_old")
				if token_index>0:
					reconstruct_path=check_path.split('_old')[0]
					self.rename_file_suffix(reconstruct_path)
					shutil.move(check_path,reconstruct_path)
					
#-----------------------------------
#  To Do: FUNCTION FOR DATE BACKUP
#  
#-----------------------------------	
class Date_backup:		
	def __init__(self, args):
		self._args = args
		
	def date_backup(self):
		if (self._args.date_format == "0"):
			date_command="date \"+%Y/%m/%d\" | sed \"s/\//-/g\""
		elif (self._args.date_format == "1"):
			date_command="date \"+%m/%d/%Y\" | sed \"s/\//-/g\""
		elif (self._args.date_format == "2"):
			date_command="date \"+%d/%m/%Y\" | sed \"s/\//-/g\""
		(status, now_date) = commands.getstatusoutput(date_command)
		dest_path = "/shares%s/%s"%(self._args.transfer_folder,now_date)
		if not os.path.exists(dest_path):
			os.makedirs(dest_path)
		basename_comm="basename %s"%self._args.source
		basename = commands.getoutput(basename_comm)
		rsync_command = "rsync -abqI --job-name=%s --suffix=_old \"%s\" \"%s\" "%(basename,self._args.source,dest_path)
		#rsync_command = "rsync -abq --job-name=%s --suffix=_old \"%s\" \"%s\" "%(basename,self._args.source,dest_path)
		(status, rsync_rel) = commands.getstatusoutput(rsync_command)
		if status != 0:
			err_log(self._args.transfer_mode,self._args.source,dest_path)
		#To do rename suffix
		do_rename = rename_func()
		do_rename.rename_dir_suffix(dest_path)

#-----------------------------------
#  To Do: FUNCTION FOR PHOTODATE BACKUP
#  
#-----------------------------------
class Photo_date_backup:
	def __init__(self, args):
		self._args = args
		self.do_rename = rename_func()

	def copyFileDir(self,srcFilename,desFilename):
		if not os.path.exists(srcFilename):
			return
		fileList = os.listdir(srcFilename)
		for eachFile in fileList:
			sourceF = os.path.join(srcFilename,eachFile)
			targetF = os.path.join(desFilename,eachFile)
			
			if os.path.isdir(sourceF):
				if not os.path.exists(targetF):
					os.makedirs(targetF)
				self.copyFileDir(sourceF,targetF)
			else:
				shutil.move(sourceF,targetF)
				
	def findMtime(self,file_name,mode):
		#find file modify time
		mtime="stat %s  | grep Modify | awk '{ printf $2 }'"%(file_name)
		(status, output)=commands.getstatusoutput(mtime)
		mtime_format=output.split("-")
		if mode == "0":
			return ("%s-%s-%s")%(mtime_format[0],mtime_format[1],mtime_format[2])
		elif mode == "1":
			return ("%s-%s-%s")%(mtime_format[1],mtime_format[2],mtime_format[0])
		elif mode == "2":
			return ("%s-%s-%s")%(mtime_format[2],mtime_format[1],mtime_format[0])
	
	def photo_dir_copy(self,tmp_folder,source):
	
		fileList = os.listdir(source)
		for eachFile in fileList:
			if not THREAD_RUNNING:
				break
			check_path = os.path.join(source,eachFile)
			if os.path.isdir(check_path):
				self.photo_dir_copy(tmp_folder,check_path)
			else:
				photo_date=self.findMtime(check_path,self._args.date_format)
				des_path="%s%s"%(tmp_folder,photo_date)
				if not os.path.exists(des_path):
					os.makedirs(des_path)
				if os.path.exists(check_path):
					shutil.copy2(check_path,des_path)
		
	def checkFileDir(self,srcFilename,desFilename):
		if not os.path.exists(srcFilename): 
			return
		fileList = os.listdir(srcFilename)  
		for eachFile in fileList:
			sourceF = os.path.join(srcFilename,eachFile) 
			targetF = os.path.join(desFilename,eachFile)
			if os.path.isdir(sourceF): 
				if os.path.exists(targetF): 
					self.checkFileDir(sourceF,targetF)
			else:
				#check difference with file
				#command = "diff \"%s\" \"%s\""%(sourceF,targetF)
				#diff = commands.getoutput(command)
				#if not diff:
				#  continue
				_count=0
				_TMP=targetF
				while (os.path.exists(targetF)):
					_count =_count+1
					fname, fextension=os.path.splitext(_TMP)
					if _count<10:
						_count_str="_0"+str(_count)
					else:
						_count_str="_"+str(_count)
					targetF=fname+_count_str+fextension
				if not _count==0:
					self.do_rename.file_Rename(sourceF,_count_str)
				
	def photo_backup(self):
		global PHOTO_FLAG
		
		basename_comm="basename %s"%self._args.source
		(status, basename)=commands.getstatusoutput(basename_comm)
		TMP_FOLDER_BASE=TMP_FOLDER+basename+"/"
		#check tmp folder exist
		if not os.path.exists(TMP_FOLDER_BASE): 
			os.makedirs(TMP_FOLDER_BASE)
		#copy to tmp folder
		self.photo_dir_copy(TMP_FOLDER_BASE,self._args.source)
		
		#rename in tmp folder
		dest_path = "/shares%s/"%(self._args.transfer_folder)
		self.checkFileDir(TMP_FOLDER_BASE , dest_path)
		#set stop 
		PHOTO_FLAG = False
		#update the latest number
		os.system("echo \"%s\" > %sNUM"%(getFolderNum2(TMP_FOLDER_BASE),TMP_FOLDER))
		#mv tmp folder to /shares
		self.copyFileDir(TMP_FOLDER_BASE,dest_path)
		shutil.rmtree(TMP_FOLDER_BASE,ignore_errors=True)

#-----------------------------------
#  To Do: FUNCTION FOR CUSTOM BACKUP
#  
#-----------------------------------
class Custom_share_backup:
	def __init__(self, args):
		self._args = args		
	def custom_backup(self):
		dest_path = "/shares%s/%s"%(self._args.transfer_folder,self._args.folder_name)
		if not os.path.exists(dest_path):
			os.makedirs(dest_path)
		basename_command="basename %s"%self._args.source
		basename = commands.getoutput(basename_command)
		rsync_command = "rsync -abqI --job-name=%s --suffix=_old \"%s\" \"%s\" "%(basename,self._args.source,dest_path)
		#rsync_command = "rsync -abq --job-name=%s --suffix=_old \"%s\" \"%s\" "%(basename,self._args.source,dest_path)
		(status, rsync_rel) = commands.getstatusoutput(rsync_command)
		if status != 0:
			err_log(self._args.transfer_mode,self._args.source,dest_path)		
		#To do rename suffix
		do_rename = rename_func()
		do_rename.rename_dir_suffix(dest_path)	

class Lock_func:
	def __init__(self):
		self.handle = open(LOCK,'w')
	def acquire(self):
		fcntl.flock(self.handle,fcntl.LOCK_EX)
	def release(self):
		fcntl.flock(self.handle, fcntl.LOCK_UN)
	def __del__(self):
		self.handle.close()

#-----------------------------------
#  To Do: MAIN
#  
#-----------------------------------		
def main(argv = sys.argv):
	parser = argparse.ArgumentParser("GoProFin")
	
	parser.add_argument('dev', help = 'Go Pro source drive')
	parser.add_argument('--source', help = 'Go Pro source drive' , default = MOUNT_FOLDER+"DCIM/")
	parser.add_argument('--destination', help = 'Destination location to copy source media.\
	                     Directory with date will be placed in that location.' , default = None)
	parser.add_argument('--manufacturer', help = 'If gopro, then will transfer', default = MANUFACTURER)
	parser.add_argument('--model', help = 'If gopro, model number', default = "default11111")
	parser.add_argument('--sn', help = 'If gopro, serial number', default = "default22222")
	parser.add_argument('--rev', help = 'If gopro, revision', default = "default-2.0")
	parser.add_argument('--transfer_mode', help = 'Mode preference: copy or move. Default is copy.',
	                     default = None )
	parser.add_argument('--auto_mode', help = 'Force transfer mode.', default = None )
	parser.add_argument('--transfer_folder', help = 'Destination folder for save.', default = None )
	parser.add_argument('--folder_option', help = 'Select folder name format.', default = None )
	parser.add_argument('--date_format', help = 'Select date name format.', default = None )
	parser.add_argument('--folder_name', help = 'Name for custom folder.', default = None )
	parser.add_argument('--hotplug', help = 'Do hotplug.', default = None )
	parser.add_argument('--dest_path', help = 'destination', default = None )
	args = parser.parse_args()
	#let gopro not work 20140429.VODKA
	return
	init_args(args)
	
	#check manufacturer
	if (args.manufacturer != MANUFACTURER):
	  return
	
	global GO_LIST
	global GOPRO_STATUS
	#Do exception
	signal.signal(signal.SIGINT ,do_except)
	signal.signal(signal.SIGTERM,do_except)

	#create init xml!!
	write_xml(args.manufacturer,args.model,args.sn,args.rev,
	          args.transfer_mode == "copy" and "0" or "1","init","","")
	#lock file
	do_lock = Lock_func()
	
	GOPRO_STATUS = "running"
    #To do syslog and alert code
	if args.transfer_mode=="copy":
		alert_id = COPYING_FILES
	elif args.transfer_mode=="move":
		alert_id = MOVING_FILES
	cmd = "alert_test -a %d -p \"\" -f"%(alert_id)
	os.system(cmd)	
	
	check_disk()
	#get destination path
	adjust_dest_path(args)		
	GO_LIST = "%s,/shares%s,%s,%s,%s,%s,%s"%(args.source,args.transfer_folder,
	                                      args.folder_option,args.dest_path,
										  args.transfer_mode,args.manufacturer,args.dev)	
	if (args.hotplug == "true"):
		do_hotplug(args)
		return
	#mount gopro device
	mount_action("mount",args.dev)
	
	#check setting
	check_setting(args)
	
	do_lock.acquire()
	
	#run progerss thread
	Progress = ProgressThread(args)
	Progress.start()
	
	dprint("GoPro running")
	#print parameter
	dprint("source=[%s]"%(args.source))
	dprint("destination=[%s]"%(args.destination))
	dprint("manufacturer=[%s]"%(args.manufacturer))
	dprint("transfer_mode=[%s]"%(args.transfer_mode))
	dprint("auto_mode=[%s]"%(args.auto_mode))
	dprint("transfer_folder=[%s]"%(args.transfer_folder))
	dprint("folder_option=[%s]"%(args.folder_option))
	dprint("date_format=[%s]"%(args.date_format))
	dprint("folder_name=[%s]"%(args.folder_name))
	
    #Start backup
	if (args.folder_option == "0"):
		dprint("----DateTime mode-----")
		date_mode = Date_backup(args)
		date_mode.date_backup()
	elif (args.folder_option == "1"):
		dprint("----PhotoTime mode-----")
		photo_backup = Photo_date_backup(args)
		photo_backup.photo_backup()
	elif (args.folder_option == "2"):
		dprint("----Custom mode-----")
		custom_backup = Custom_share_backup(args)
		custom_backup.custom_backup()
	#progress thread stop
	Progress.stop()
	GOPRO_STATUS = "success"
	clean(args)
	#umount gopro device
	mount_action("umount",args.dev)
	if args.transfer_mode=="move":
		os.system("rm -rf %s*"%args.source)
	do_lock.release()
	#To do syslog and alert code
	trans_file()
	if args.transfer_mode=="copy":
		alert_id = FILES_COPIED_FROM_CAMERA
		msg = "Copied %s files from %s to %s on %s"%(TRANS_NUM,args.source,args.dest_path,datetime.datetime.now().ctime())
	elif args.transfer_mode=="move":
		alert_id = FILES_MOVED_FROM_CAMERA
		msg = "Moved %s files from %s to %s on %s"%(TRANS_NUM,args.source,args.dest_path,datetime.datetime.now().ctime())
	os.system("/usr/bin/logger -t \"MTP\" -p %d %s"%(LOG_INFO,msg))
	
	cmd = "alert_test -a %d -p \"%s,%s\" -f"%(alert_id,args.source,args.dest_path)
	os.system(cmd)
	dprint("LOCK RELEASE.....")

if __name__=='__main__':
	main()
 
	