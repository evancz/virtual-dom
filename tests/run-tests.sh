#!/bin/sh

set -e

cd "$(dirname "$0")"

mkdir -p build/virtual-dom/Native
mkdir -p build/virtual-dom/VirtualDom
cp ../src/VirtualDom.elm build/virtual-dom/
cp ../src/VirtualDom/Inspect.elm build/virtual-dom/VirtualDom
$(npm bin)/browserify ../src/wrapper.js -o build/VirtualDom.browser.js

set +e
diff -u ../src/Native/VirtualDom.js build/VirtualDom.browser.js
if [ $? != 0 ]; then
	echo "ERROR:"
	echo "src/Native/VirtualDom.js has local modifications or is out of date. Please run rebuild.sh"
	exit 1
fi
set -e

node compile.js > build/virtual-dom/Native/VirtualDom.js

elm-make --yes --output build/test.js TestMain.elm
cat elm-io-ports.js >> build/test.js
node build/test.js
