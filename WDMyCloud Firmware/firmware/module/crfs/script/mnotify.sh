#!/bin/sh

EVENT_TYPE=$1
NEW_PATH=$2
OLD_PATH=$3
UPDATE_ADD_FILE="1"
UPDATE_ADD_DIR="2"
UPDATE_DELETE_FILE="3"
UPDATE_DELETE_DIR="4"
UPDATE_RENAME_FILE="5"
UPDATE_RENAME_DIR="6"
UPDATE_MOVE_FILE="7"
UPDATE_MOVE_DIR="8"
UPDATE_MODIFY_FILE="13"

if [ $EVENT_TYPE == $UPDATE_ADD_FILE ]; then
	#echo "## UPDATE_ADD_FILE [$NEW_PATH] [$OLD_PATH]"
	sqldb -a add "$NEW_PATH"
elif [ $EVENT_TYPE == $UPDATE_ADD_DIR ]; then
	#echo "## UPDATE_ADD_DIR [$NEW_PATH] [$OLD_PATH]"
	sqldb -a add -d "$NEW_PATH"
elif [ $EVENT_TYPE == $UPDATE_DELETE_FILE ]; then
	#echo "## UPDATE_DELETE_FILE [$NEW_PATH] [$OLD_PATH]"
	sqldb -a remove "$NEW_PATH"
elif [ $EVENT_TYPE == $UPDATE_DELETE_DIR ]; then
	#echo "## UPDATE_DELETE_DIR [$NEW_PATH] [$OLD_PATH]"
	sqldb -a remove -d "$NEW_PATH"
elif [ $EVENT_TYPE == $UPDATE_RENAME_FILE ]; then
	#echo "## UPDATE_RENAME_FILE [$NEW_PATH] [$OLD_PATH]"
	sqldb -a rename "$NEW_PATH" "$OLD_PATH"
elif [ $EVENT_TYPE == $UPDATE_RENAME_DIR ]; then
	#echo "## UPDATE_RENAME_DIR [$NEW_PATH] [$OLD_PATH]"
	sqldb -a rename -d "$NEW_PATH" "$OLD_PATH"
elif [ $EVENT_TYPE == $UPDATE_MOVE_FILE ]; then
	#echo "## UPDATE_MOVE_FILE [$NEW_PATH] [$OLD_PATH]"
	sqldb -a move "$NEW_PATH" "$OLD_PATH"
elif [ $EVENT_TYPE == $UPDATE_MOVE_DIR ]; then
	#echo "## UPDATE_MOVE_DIR [$NEW_PATH] [$OLD_PATH]"
	sqldb -a move -d "$NEW_PATH" "$OLD_PATH"
elif [ $EVENT_TYPE == $UPDATE_MODIFY_FILE ]; then
	sqldb -a modify -d "$NEW_PATH"
fi

