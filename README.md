# Virtual DOM for Elm

Minimal bindings to a virtual DOM system. Useful for creating libraries for HTML and SVG.

## Rebuilding from NPM
The build version of virtual-dom is committed to `src/Native/VirtualDom.js`. To rebuild this file with a newer version of virtual-dom:

1. Change the `virtual-dom` version number in `package.json`.
2. Run `npm install`
3. Run `./rebuild.sh`

And you should see changes in `src/Native/VirtualDom.js`.
