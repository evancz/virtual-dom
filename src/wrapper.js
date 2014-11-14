
var VNode = require('vtree/vnode');
var VText = require('vtree/vtext');
var diff = require('vtree/diff');
var patch = require('vdom/patch');
var createElement = require('vdom/create-element');
var DataSet = require("data-set");
var Delegator = require("dom-delegator");
var isHook = require("vtree/is-vhook");

Elm.Native.VirtualDom = {};
Elm.Native.VirtualDom.make = function(elm) {
    elm.Native = elm.Native || {};
    elm.Native.VirtualDom = elm.Native.VirtualDom || {};
    if (elm.Native.VirtualDom.values) {
        return elm.Native.VirtualDom.values;
    }

    // This manages event listeners. Somehow...
    var delegator = Delegator();

    var RenderUtils = ElmRuntime.use(ElmRuntime.Render.Utils);
    var newElement = Elm.Graphics.Element.make(elm).newElement;
    var Json = Elm.Native.Json.make(elm);
    var List = Elm.Native.List.make(elm);
    var Utils = Elm.Native.Utils.make(elm);

    function listToObject(list) {
        var object = {};
        while (list.ctor !== '[]') {
            var entry = list._0;
            object[entry.key] = entry.value;
            list = list._1;
        }
        return object;
    }

    function node(name, propertyList, contents) {
        var props = listToObject(propertyList);

        var key, namespace;
        // support keys
        if (props.key !== undefined) {
            key = props.key;
            props.key = undefined;
        }

        // support namespace
        if (props.namespace !== undefined) {
            namespace = props.namespace;
            props.namespace = undefined;
        }

        // ensure that setting text of an input does not move the cursor
        var useSoftSet =
            name === 'input'
            && props.value !== undefined
            && !isHook(props.value);

        if (useSoftSet) {
            props.value = SoftSetHook(props.value);
        }

        return new VNode(name, props, List.toArray(contents), key, namespace);
    }

    function property(key, value) {
        return {
            key: key,
            value: value
        };
    }

    function on(name, decoder, createMessage) {
        function eventHandler(event) {
            var value = A2(Json.decode, decoder, event);
            if (value.ctor === 'Ok') {
                createMessage(value._0)();
            }
        }
        return property(name, DataSetHook(eventHandler));
    }

    function DataSetHook(value) {
        if (!(this instanceof DataSetHook)) {
            return new DataSetHook(value);
        }

        this.value = value;
    }

    DataSetHook.prototype.hook = function (node, propertyName) {
        var ds = DataSet(node);
        ds[propertyName] = this.value;
    };


    function SoftSetHook(value) {
      if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
      }

      this.value = value;
    }

    SoftSetHook.prototype.hook = function (node, propertyName) {
      if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
      }
    };

    function text(string) {
        return new VText(string);
    }

    function toElement(width, height, html) {
        return A3(newElement, width, height,
                  { ctor: 'Custom'
                  , type: 'evancz/elm-html'
                  , render: render
                  , update: update
                  , model: html
                  });
    }

    function render(model) {
        var element = RenderUtils.newElement('div');
        element.appendChild(createElement(model));
        return element;
    }

    function update(node, oldModel, newModel) {
        var patches = diff(oldModel, newModel);
        var newNode = patch(node.firstChild, patches)
        if (newNode !== node.firstChild) {
            node.replaceChild(newNode, node.firstChild)
        }
    }

    function lazyRef(fn, a) {
        function thunk() {
            return fn(a);
        }
        return new Thunk('ref', fn, [a], thunk);
    }

    function lazyRef2(fn, a, b) {
        function thunk() {
            return A2(fn, a, b);
        }
        return new Thunk('ref', fn, [a,b], thunk);
    }

    function lazyRef3(fn, a, b, c) {
        function thunk() {
            return A3(fn, a, b, c);
        }
        return new Thunk('ref', fn, [a,b,c], thunk);
    }

    function Thunk(kind, fn, args, thunk) {
        this.fn = fn;
        this.args = args;
        this.vnode = null;
        this.key = undefined;
        this.thunk = thunk;

        this.kind = kind;
    }

    Thunk.prototype.type = "immutable-thunk";
    Thunk.prototype.update = updateThunk;
    Thunk.prototype.init = initThunk;

    function shouldUpdate(current, previous) {
        if (current.kind !== previous.kind || current.fn !== previous.fn) {
            return true;
        }

        // if it's the same function, we know the number of args must match
        var cargs = current.args;
        var pargs = previous.args;

        for (var i = cargs.length; i--; ) {
            if (cargs[i] !== pargs[i]) {
                return true;
            }
        }

        return false;
    }

    function updateThunk(previous, domNode) {
        if (!shouldUpdate(this, previous)) {
            this.vnode = previous.vnode;
            return;
        }

        if (!this.vnode) {
            this.vnode = this.thunk();
        }

        var patches = diff(previous.vnode, this.vnode);
        patch(domNode, patches);
    }

    function initThunk() {
        this.vnode = this.thunk();
        return createElement(this.vnode);
    }

    return Elm.Native.VirtualDom.values = {
        node: F3(node),
        text: text,
        on: F3(on),

        property: F2(property),

        lazy: F2(lazy),
        lazy2: F3(lazy2),
        lazy3: F4(lazy3),

        toElement: F3(toElement)
    };
};
