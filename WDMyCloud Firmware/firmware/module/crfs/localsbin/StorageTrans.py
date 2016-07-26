#!/usr/bin/python
#
# NOTE : for USB/SD backup
#
#-------------------------#
import argparse
import ConfigParser
import commands
import datetime
import traceback
import sys
import os
import shutil

class Transfer:
	# Get parameter from ini file
	def __init__(self,args):
	  self._args = args
	  if (self._args.ini != None):
		cp = ConfigParser.ConfigParser()
		try:
			cp.read(self._args.ini)
			if(self._args.enable == False):
			  self._args.enable = cp.get('transfer', 'enable')
			if (self._args.transfer_mode == None):
			  self._args.transfer_mode = cp.get('transfer', 'mode')
			if (self._args.status == None):
			  self._args.status = cp.get('status', 'path')
			if (self._args.debug == None):
			  self._args.debug = cp.get('transfer', 'debug')
			self.log("Program Begin.")
		except:
		    self._dumpTraceback()
			
	# Write Log
	def log(self,msg):
	  if(self._args.ini!=None):
	    try:
		    wl=open(self._args.debug,'a')
		    wl.write('%s' % datetime.datetime.now().ctime() + ' : ' + msg+'\n')
		    wl.close()
	    except:
		    self._dumpTraceback()

	def add_line_path(self,path):
		if not (path.endswith("/")):
			path = path + "/"
			return path
		return path			

	def remove_line_path(self,path):
		if (path.endswith("/")):
			path = path[:-1]
			return path
		return path	
		
	# Run Program
	def slurp(self):
	  args = self._args
	  
	  output=os.popen("sqlite3 /usr/local/config/orion.db \"select * from volumes\"",'r')
	  while 1:
	    line = output.readline()
	    if not line: break
	    arg = line.split("|")
	    #print arg[0]
	    if(arg[2] == self.remove_line_path(args.source)):
		  args.destination = "/shares/Public/%s"%(arg[0])
		  #print arg[0]
	  print(self.remove_line_path(args.source),args.destination,args.enable,args.transfer_mode,
            args.status,args.debug)
			
	  if (args.enable == 'false'):
	    self.log("Backup doesn't set enable.")
	    return
	  # Use rsync to backup 
	  try:
		  subdirectory = args.destination + '/'
		  rsync_command = "rsync -aqI --job-name=%s \"%s\" \"%s\" "%("storage",self.add_line_path(args.source),subdirectory)
		  ret = commands.getoutput(rsync_command)
		  if(args.transfer_mode == "move"):
		    os.system("rm -rf %s/*"%(self.remove_line_path(args.source)))
		  self.log("Backup done.")
	  except:
	      self.log("Error in rsync backup.")
		  
	def _dumpTraceback(self):
	  sys.stderr.write('Warning: Exception encountered')
	  msg = traceback.format_exception(sys.exc_info()[0],
	                                   sys.exc_info()[1],
									   sys.exc_info()[2])
	  msg = ''.join(msg)
	  print msg
	  
def main():
    parser = argparse.ArgumentParser("StorageTrans")
	
    parser.add_argument('source', help = 'Device source path')
    parser.add_argument('destination', help = 'Destination location to copy source media')
    parser.add_argument('--debug', help = 'Write to debug file - must specifiy file path',
                                   default = None)
    parser.add_argument('--ini', help = 'Initialization file for execution behavior')
    parser.add_argument('--status', help = 'File path to 1 line status of current execution')
    parser.add_argument('--transfer_mode', help = 'Mode preference: copy or move. Default is copy.',
                                           default = None )
    parser.add_argument('--enable', help = 'Force transfer mode in case ini file has it disabled.',
                                    action = 'store_true')
    transfer = Transfer(parser.parse_args())
    transfer.slurp()
	
if __name__ == '__main__':
    main()