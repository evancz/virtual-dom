#!/bin/bash

cd "$(dirname "$0")"

if [ ! -d node_modules/browserify ] || [ ! -d node_modules/virtual-dom ]; then
	echo "Please run 'npm install' first."
	exit
fi

$(npm bin)/browserify -g [ uglifyify --ignore '**/wrapper.js' ] src/wrapper.js -o src/Native/VirtualDom.js
