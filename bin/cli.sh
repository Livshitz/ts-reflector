#!/bin/bash

# Get dir of executable
# dir=$( dirname $(realpath "$0") )/../

# Execute the main script and pass the args
# node $dir/build/Main.js $@
# SCRIPT_DIRECTORY="$(dirname $(realpath "$0"))",
# dir=$( dirname $(realpath "$0") )/../
script_dir="$(dirname "$(readlink -f "$0")")"
original_dir="$(pwd)"

scriptToExecute="$script_dir/../src/CLI.ts --i=$original_dir/$1 --o=$original_dir/$2"
echo " [v] ts-reflector"
echo " [-] executing: '$scriptToExecute'" 
tsx $scriptToExecute