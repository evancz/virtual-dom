(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
var topLevel="undefined"!=typeof global?global:"undefined"!=typeof window?window:{},minDoc=require("min-document");if("undefined"!=typeof document)module.exports=document;else{var doccy=topLevel["__GLOBAL_DOCUMENT_CACHE@4"];doccy||(doccy=topLevel["__GLOBAL_DOCUMENT_CACHE@4"]=minDoc),module.exports=doccy}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],3:[function(require,module,exports){
"use strict";module.exports=function(t){return"object"==typeof t&&null!==t};

},{}],4:[function(require,module,exports){
function isArray(r){return"[object Array]"===toString.call(r)}var nativeIsArray=Array.isArray,toString=Object.prototype.toString;module.exports=nativeIsArray||isArray;

},{}],5:[function(require,module,exports){
function applyProperties(o,t,e){for(var r in t){var i=t[r];void 0===i?removeProperty(o,r,i,e):isHook(i)?(removeProperty(o,r,i,e),i.hook&&i.hook(o,r,e?e[r]:void 0)):isObject(i)?patchObject(o,t,e,r,i):o[r]=i}}function removeProperty(o,t,e,r){if(r){var i=r[t];if(isHook(i))i.unhook&&i.unhook(o,t,e);else if("attributes"===t)for(var v in i)o.removeAttribute(v);else if("style"===t)for(var s in i)o.style[s]="";else"string"==typeof i?o[t]="":o[t]=null}}function patchObject(o,t,e,r,i){var v=e?e[r]:void 0;if("attributes"!==r){if(v&&isObject(v)&&getPrototype(v)!==getPrototype(i))return void(o[r]=i);isObject(o[r])||(o[r]={});var s="style"===r?"":void 0;for(var n in i){var p=i[n];o[r][n]=void 0===p?s:p}}else for(var c in i){var u=i[c];void 0===u?o.removeAttribute(c):o.setAttribute(c,u)}}function getPrototype(o){return Object.getPrototypeOf?Object.getPrototypeOf(o):o.__proto__?o.__proto__:o.constructor?o.constructor.prototype:void 0}var isObject=require("is-object"),isHook=require("../vnode/is-vhook.js");module.exports=applyProperties;

},{"../vnode/is-vhook.js":13,"is-object":3}],6:[function(require,module,exports){
function createElement(e,r){var t=r?r.document||document:document,n=r?r.warn:null;if(e=handleThunk(e).a,isWidget(e))return e.init();if(isVText(e))return t.createTextNode(e.text);if(!isVNode(e))return n&&n("Item is not a valid virtual dom node",e),null;var i=null===e.namespace?t.createElement(e.tagName):t.createElementNS(e.namespace,e.tagName),a=e.properties;applyProperties(i,a);for(var d=e.children,l=0;l<d.length;l++){var o=createElement(d[l],r);o&&i.appendChild(o)}return i}var document=require("global/document"),applyProperties=require("./apply-properties"),isVNode=require("../vnode/is-vnode.js"),isVText=require("../vnode/is-vtext.js"),isWidget=require("../vnode/is-widget.js"),handleThunk=require("../vnode/handle-thunk.js");module.exports=createElement;

},{"../vnode/handle-thunk.js":11,"../vnode/is-vnode.js":14,"../vnode/is-vtext.js":15,"../vnode/is-widget.js":16,"./apply-properties":5,"global/document":2}],7:[function(require,module,exports){
function domIndex(n,e,r,i){return r&&0!==r.length?(r.sort(ascending),recurse(n,e,r,i,0)):{}}function recurse(n,e,r,i,t){if(i=i||{},n){indexInRange(r,t,t)&&(i[t]=n);var d=e.children;if(d)for(var u=n.childNodes,o=0;o<e.children.length;o++){t+=1;var c=d[o]||noChild,f=t+(c.count||0);indexInRange(r,t,f)&&recurse(u[o],c,r,i,t),t=f}}return i}function indexInRange(n,e,r){if(0===n.length)return!1;for(var i,t,d=0,u=n.length-1;u>=d;){if(i=(u+d)/2>>0,t=n[i],d===u)return t>=e&&r>=t;if(e>t)d=i+1;else{if(!(t>r))return!0;u=i-1}}return!1}function ascending(n,e){return n>e?1:-1}var noChild={};module.exports=domIndex;

},{}],8:[function(require,module,exports){
function applyPatch(e,r,t){var a=e.type,n=e.vNode,o=e.patch;switch(a){case VPatch.REMOVE:return removeNode(r,n);case VPatch.INSERT:return insertNode(r,o,t);case VPatch.VTEXT:return stringPatch(r,n,o,t);case VPatch.WIDGET:return widgetPatch(r,n,o,t);case VPatch.VNODE:return vNodePatch(r,n,o,t);case VPatch.ORDER:return reorderChildren(r,o),r;case VPatch.PROPS:return applyProperties(r,o,n.properties),r;case VPatch.THUNK:return replaceRoot(r,t.patch(r,o,t));default:return r}}function removeNode(e,r){var t=e.parentNode;return t&&t.removeChild(e),destroyWidget(e,r),null}function insertNode(e,r,t){var a=t.render(r,t);return e&&e.appendChild(a),e}function stringPatch(e,r,t,a){var n;if(3===e.nodeType)e.replaceData(0,e.length,t.text),n=e;else{var o=e.parentNode;n=a.render(t,a),o&&n!==e&&o.replaceChild(n,e)}return n}function widgetPatch(e,r,t,a){var n,o=updateWidget(r,t);n=o?t.update(r,e)||e:a.render(t,a);var d=e.parentNode;return d&&n!==e&&d.replaceChild(n,e),o||destroyWidget(e,r),n}function vNodePatch(e,r,t,a){var n=e.parentNode,o=a.render(t,a);return n&&o!==e&&n.replaceChild(o,e),o}function destroyWidget(e,r){"function"==typeof r.destroy&&isWidget(r)&&r.destroy(e)}function reorderChildren(e,r){for(var t,a,n,o=e.childNodes,d={},i=0;i<r.removes.length;i++)a=r.removes[i],t=o[a.from],a.key&&(d[a.key]=t),e.removeChild(t);for(var c=o.length,p=0;p<r.inserts.length;p++)n=r.inserts[p],t=d[n.key],e.insertBefore(t,n.to>=c++?null:o[n.to])}function replaceRoot(e,r){return e&&r&&e!==r&&e.parentNode&&e.parentNode.replaceChild(r,e),r}var applyProperties=require("./apply-properties"),isWidget=require("../vnode/is-widget.js"),VPatch=require("../vnode/vpatch.js"),updateWidget=require("./update-widget");module.exports=applyPatch;

},{"../vnode/is-widget.js":16,"../vnode/vpatch.js":19,"./apply-properties":5,"./update-widget":10}],9:[function(require,module,exports){
function patch(r,e,t){return t=t||{},t.patch=t.patch&&t.patch!==patch?t.patch:patchRecursive,t.render=t.render||render,t.patch(r,e,t)}function patchRecursive(r,e,t){var a=patchIndices(e);if(0===a.length)return r;var n=domIndex(r,e.a,a),c=r.ownerDocument;t.document||c===document||(t.document=c);for(var p=0;p<a.length;p++){var u=a[p];r=applyPatch(r,n[u],e[u],t)}return r}function applyPatch(r,e,t,a){if(!e)return r;var n;if(isArray(t))for(var c=0;c<t.length;c++)n=patchOp(t[c],e,a),e===r&&(r=n);else n=patchOp(t,e,a),e===r&&(r=n);return r}function patchIndices(r){var e=[];for(var t in r)"a"!==t&&e.push(Number(t));return e}var document=require("global/document"),isArray=require("x-is-array"),render=require("./create-element"),domIndex=require("./dom-index"),patchOp=require("./patch-op");module.exports=patch;

},{"./create-element":6,"./dom-index":7,"./patch-op":8,"global/document":2,"x-is-array":4}],10:[function(require,module,exports){
function updateWidget(i,e){return isWidget(i)&&isWidget(e)?"name"in i&&"name"in e?i.id===e.id:i.init===e.init:!1}var isWidget=require("../vnode/is-widget.js");module.exports=updateWidget;

},{"../vnode/is-widget.js":16}],11:[function(require,module,exports){
function handleThunk(e,n){var r=e,i=n;return isThunk(n)&&(i=renderThunk(n,e)),isThunk(e)&&(r=renderThunk(e,null)),{a:r,b:i}}function renderThunk(e,n){var r=e.vnode;if(r||(r=e.vnode=e.render(n)),!(isVNode(r)||isVText(r)||isWidget(r)))throw new Error("thunk did not return a valid node");return r}var isVNode=require("./is-vnode"),isVText=require("./is-vtext"),isWidget=require("./is-widget"),isThunk=require("./is-thunk");module.exports=handleThunk;

},{"./is-thunk":12,"./is-vnode":14,"./is-vtext":15,"./is-widget":16}],12:[function(require,module,exports){
function isThunk(n){return n&&"Thunk"===n.type}module.exports=isThunk;

},{}],13:[function(require,module,exports){
function isHook(o){return o&&("function"==typeof o.hook&&!o.hasOwnProperty("hook")||"function"==typeof o.unhook&&!o.hasOwnProperty("unhook"))}module.exports=isHook;

},{}],14:[function(require,module,exports){
function isVirtualNode(e){return e&&"VirtualNode"===e.type&&e.version===version}var version=require("./version");module.exports=isVirtualNode;

},{"./version":17}],15:[function(require,module,exports){
function isVirtualText(e){return e&&"VirtualText"===e.type&&e.version===version}var version=require("./version");module.exports=isVirtualText;

},{"./version":17}],16:[function(require,module,exports){
function isWidget(e){return e&&"Widget"===e.type}module.exports=isWidget;

},{}],17:[function(require,module,exports){
module.exports="2";

},{}],18:[function(require,module,exports){
function VirtualNode(e,i,o,s,r){this.tagName=e,this.properties=i||noProperties,this.children=o||noChildren,this.key=null!=s?String(s):void 0,this.namespace="string"==typeof r?r:null;var t,n=o&&o.length||0,h=0,a=!1,d=!1,u=!1;for(var k in i)if(i.hasOwnProperty(k)){var l=i[k];isVHook(l)&&l.unhook&&(t||(t={}),t[k]=l)}for(var p=0;n>p;p++){var v=o[p];isVNode(v)?(h+=v.count||0,!a&&v.hasWidgets&&(a=!0),!d&&v.hasThunks&&(d=!0),u||!v.hooks&&!v.descendantHooks||(u=!0)):!a&&isWidget(v)?"function"==typeof v.destroy&&(a=!0):!d&&isThunk(v)&&(d=!0)}this.count=n+h,this.hasWidgets=a,this.hasThunks=d,this.hooks=t,this.descendantHooks=u}var version=require("./version"),isVNode=require("./is-vnode"),isWidget=require("./is-widget"),isThunk=require("./is-thunk"),isVHook=require("./is-vhook");module.exports=VirtualNode;var noProperties={},noChildren=[];VirtualNode.prototype.version=version,VirtualNode.prototype.type="VirtualNode";

},{"./is-thunk":12,"./is-vhook":13,"./is-vnode":14,"./is-widget":16,"./version":17}],19:[function(require,module,exports){
function VirtualPatch(t,a,r){this.type=Number(t),this.vNode=a,this.patch=r}var version=require("./version");VirtualPatch.NONE=0,VirtualPatch.VTEXT=1,VirtualPatch.VNODE=2,VirtualPatch.WIDGET=3,VirtualPatch.PROPS=4,VirtualPatch.ORDER=5,VirtualPatch.INSERT=6,VirtualPatch.REMOVE=7,VirtualPatch.THUNK=8,module.exports=VirtualPatch,VirtualPatch.prototype.version=version,VirtualPatch.prototype.type="VirtualPatch";

},{"./version":17}],20:[function(require,module,exports){
function VirtualText(t){this.text=String(t)}var version=require("./version");module.exports=VirtualText,VirtualText.prototype.version=version,VirtualText.prototype.type="VirtualText";

},{"./version":17}],21:[function(require,module,exports){
function diffProps(o,t){var e;for(var r in o){r in t||(e=e||{},e[r]=void 0);var i=o[r],f=t[r];if(i!==f)if(isObject(i)&&isObject(f))if(getPrototype(f)!==getPrototype(i))e=e||{},e[r]=f;else if(isHook(f))e=e||{},e[r]=f;else{var s=diffProps(i,f);s&&(e=e||{},e[r]=s)}else e=e||{},e[r]=f}for(var n in t)n in o||(e=e||{},e[n]=t[n]);return e}function getPrototype(o){return Object.getPrototypeOf?Object.getPrototypeOf(o):o.__proto__?o.__proto__:o.constructor?o.constructor.prototype:void 0}var isObject=require("is-object"),isHook=require("../vnode/is-vhook");module.exports=diffProps;

},{"../vnode/is-vhook":13,"is-object":3}],22:[function(require,module,exports){
function diff(e,n){var t={a:e};return walk(e,n,t,0),t}function walk(e,n,t,r){if(e!==n){var h=t[r],a=!1;if(isThunk(e)||isThunk(n))thunks(e,n,t,r);else if(null==n)isWidget(e)||(clearState(e,t,r),h=t[r]),h=appendPatch(h,new VPatch(VPatch.REMOVE,e,n));else if(isVNode(n))if(isVNode(e))if(e.tagName===n.tagName&&e.namespace===n.namespace&&e.key===n.key){var i=diffProps(e.properties,n.properties);i&&(h=appendPatch(h,new VPatch(VPatch.PROPS,e,i))),h=diffChildren(e,n,t,h,r)}else h=appendPatch(h,new VPatch(VPatch.VNODE,e,n)),a=!0;else h=appendPatch(h,new VPatch(VPatch.VNODE,e,n)),a=!0;else isVText(n)?isVText(e)?e.text!==n.text&&(h=appendPatch(h,new VPatch(VPatch.VTEXT,e,n))):(h=appendPatch(h,new VPatch(VPatch.VTEXT,e,n)),a=!0):isWidget(n)&&(isWidget(e)||(a=!0),h=appendPatch(h,new VPatch(VPatch.WIDGET,e,n)));h&&(t[r]=h),a&&clearState(e,t,r)}}function diffChildren(e,n,t,r,h){for(var a=e.children,i=reorder(a,n.children),s=i.children,o=a.length,u=s.length,c=o>u?o:u,d=0;c>d;d++){var l=a[d],f=s[d];h+=1,l?walk(l,f,t,h):f&&(r=appendPatch(r,new VPatch(VPatch.INSERT,null,f))),isVNode(l)&&l.count&&(h+=l.count)}return i.moves&&(r=appendPatch(r,new VPatch(VPatch.ORDER,e,i.moves))),r}function clearState(e,n,t){unhook(e,n,t),destroyWidgets(e,n,t)}function destroyWidgets(e,n,t){if(isWidget(e))"function"==typeof e.destroy&&(n[t]=appendPatch(n[t],new VPatch(VPatch.REMOVE,e,null)));else if(isVNode(e)&&(e.hasWidgets||e.hasThunks))for(var r=e.children,h=r.length,a=0;h>a;a++){var i=r[a];t+=1,destroyWidgets(i,n,t),isVNode(i)&&i.count&&(t+=i.count)}else isThunk(e)&&thunks(e,null,n,t)}function thunks(e,n,t,r){var h=handleThunk(e,n),a=diff(h.a,h.b);hasPatches(a)&&(t[r]=new VPatch(VPatch.THUNK,null,a))}function hasPatches(e){for(var n in e)if("a"!==n)return!0;return!1}function unhook(e,n,t){if(isVNode(e)){if(e.hooks&&(n[t]=appendPatch(n[t],new VPatch(VPatch.PROPS,e,undefinedKeys(e.hooks)))),e.descendantHooks||e.hasThunks)for(var r=e.children,h=r.length,a=0;h>a;a++){var i=r[a];t+=1,unhook(i,n,t),isVNode(i)&&i.count&&(t+=i.count)}}else isThunk(e)&&thunks(e,null,n,t)}function undefinedKeys(e){var n={};for(var t in e)n[t]=void 0;return n}function reorder(e,n){var t=keyIndex(n),r=t.keys,h=t.free;if(h.length===n.length)return{children:n,moves:null};var a=keyIndex(e),i=a.keys,s=a.free;if(s.length===e.length)return{children:n,moves:null};for(var o=[],u=0,c=h.length,d=0,l=0;l<e.length;l++){var f,k=e[l];k.key?r.hasOwnProperty(k.key)?(f=r[k.key],o.push(n[f])):(f=l-d++,o.push(null)):c>u?(f=h[u++],o.push(n[f])):(f=l-d++,o.push(null))}for(var p=u>=h.length?n.length:h[u],P=0;P<n.length;P++){var v=n[P];v.key?i.hasOwnProperty(v.key)||o.push(v):P>=p&&o.push(v)}for(var y,V=o.slice(),g=0,T=[],m=[],w=0;w<n.length;){var N=n[w];for(y=V[g];null===y&&V.length;)T.push(remove(V,g,null)),y=V[g];y&&y.key===N.key?(g++,w++):N.key?(y&&y.key&&r[y.key]!==w+1?(T.push(remove(V,g,y.key)),y=V[g],y&&y.key===N.key?g++:m.push({key:N.key,to:w})):m.push({key:N.key,to:w}),w++):y&&y.key&&T.push(remove(V,g,y.key))}for(;g<V.length;)y=V[g],T.push(remove(V,g,y&&y.key));return T.length!==d||m.length?{children:o,moves:{removes:T,inserts:m}}:{children:o,moves:null}}function remove(e,n,t){return e.splice(n,1),{from:n,key:t}}function keyIndex(e){for(var n={},t=[],r=e.length,h=0;r>h;h++){var a=e[h];a.key?n[a.key]=h:t.push(h)}return{keys:n,free:t}}function appendPatch(e,n){return e?(isArray(e)?e.push(n):e=[e,n],e):n}var isArray=require("x-is-array"),VPatch=require("../vnode/vpatch"),isVNode=require("../vnode/is-vnode"),isVText=require("../vnode/is-vtext"),isWidget=require("../vnode/is-widget"),isThunk=require("../vnode/is-thunk"),handleThunk=require("../vnode/handle-thunk"),diffProps=require("./diff-props");module.exports=diff;

},{"../vnode/handle-thunk":11,"../vnode/is-thunk":12,"../vnode/is-vnode":14,"../vnode/is-vtext":15,"../vnode/is-widget":16,"../vnode/vpatch":19,"./diff-props":21,"x-is-array":4}],23:[function(require,module,exports){
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var diff = require('virtual-dom/vtree/diff');
var patch = require('virtual-dom/vdom/patch');
var createElement = require('virtual-dom/vdom/create-element');
var isHook = require("virtual-dom/vnode/is-vhook");


Elm.Native.VirtualDom = {};
Elm.Native.VirtualDom.make = function(elm)
{
	elm.Native = elm.Native || {};
	elm.Native.VirtualDom = elm.Native.VirtualDom || {};
	if (elm.Native.VirtualDom.values)
	{
		return elm.Native.VirtualDom.values;
	}

	var Element = Elm.Native.Graphics.Element.make(elm);
	var Json = Elm.Native.Json.make(elm);
	var List = Elm.Native.List.make(elm);
	var Signal = Elm.Native.Signal.make(elm);
	var Utils = Elm.Native.Utils.make(elm);

	var ATTRIBUTE_KEY = 'UniqueNameThatOthersAreVeryUnlikelyToUse';



	// VIRTUAL DOM NODES


	function text(string)
	{
		return new VText(string);
	}

	function node(name)
	{
		return F2(function(propertyList, contents) {
			return makeNode(name, propertyList, contents);
		});
	}


	// BUILD VIRTUAL DOME NODES


	function makeNode(name, propertyList, contents)
	{
		var props = listToProperties(propertyList);

		var key, namespace;
		// support keys
		if (props.key !== undefined)
		{
			key = props.key;
			props.key = undefined;
		}

		// support namespace
		if (props.namespace !== undefined)
		{
			namespace = props.namespace;
			props.namespace = undefined;
		}

		// ensure that setting text of an input does not move the cursor
		var useSoftSet =
			(name === 'input' || name === 'textarea')
			&& props.value !== undefined
			&& !isHook(props.value);

		if (useSoftSet)
		{
			props.value = SoftSetHook(props.value);
		}

		return new VNode(name, props, List.toArray(contents), key, namespace);
	}

	function listToProperties(list)
	{
		var object = {};
		while (list.ctor !== '[]')
		{
			var entry = list._0;
			if (entry.key === ATTRIBUTE_KEY)
			{
				object.attributes = object.attributes || {};
				object.attributes[entry.value.attrKey] = entry.value.attrValue;
			}
			else
			{
				object[entry.key] = entry.value;
			}
			list = list._1;
		}
		return object;
	}



	// PROPERTIES AND ATTRIBUTES


	function property(key, value)
	{
		return {
			key: key,
			value: value
		};
	}

	function attribute(key, value)
	{
		return {
			key: ATTRIBUTE_KEY,
			value: {
				attrKey: key,
				attrValue: value
			}
		};
	}



	// NAMESPACED ATTRIBUTES


	function attributeNS(namespace, key, value)
	{
		return {
			key: key,
			value: new AttributeHook(namespace, key, value)
		};
	}

	function AttributeHook(namespace, key, value)
	{
		if (!(this instanceof AttributeHook))
		{
			return new AttributeHook(namespace, key, value);
		}

		this.namespace = namespace;
		this.key = key;
		this.value = value;
	}

	AttributeHook.prototype.hook = function (node, prop, prev)
	{
		if (prev
			&& prev.type === 'AttributeHook'
			&& prev.value === this.value
			&& prev.namespace === this.namespace)
		{
			return;
		}

		node.setAttributeNS(this.namespace, prop, this.value);
	};

	AttributeHook.prototype.unhook = function (node, prop, next)
	{
		if (next
			&& next.type === 'AttributeHook'
			&& next.namespace === this.namespace)
		{
			return;
		}

		node.removeAttributeNS(this.namespace, this.key);
	};

	AttributeHook.prototype.type = 'AttributeHook';



	// EVENTS


	function on(name, options, decoder, createMessage)
	{
		function eventHandler(event)
		{
			var value = A2(Json.runDecoderValue, decoder, event);
			if (value.ctor === 'Ok')
			{
				if (options.stopPropagation)
				{
					event.stopPropagation();
				}
				if (options.preventDefault)
				{
					event.preventDefault();
				}
				Signal.sendMessage(createMessage(value._0));
			}
		}
		return property('on' + name, eventHandler);
	}

	function SoftSetHook(value)
	{
		if (!(this instanceof SoftSetHook))
		{
			return new SoftSetHook(value);
		}

		this.value = value;
	}

	SoftSetHook.prototype.hook = function (node, propertyName)
	{
		if (node[propertyName] !== this.value)
		{
			node[propertyName] = this.value;
		}
	};



	// INTEGRATION WITH ELEMENTS


	function ElementWidget(element)
	{
		this.element = element;
	}

	ElementWidget.prototype.type = "Widget";

	ElementWidget.prototype.init = function init()
	{
		return Element.render(this.element);
	};

	ElementWidget.prototype.update = function update(previous, node)
	{
		return Element.update(node, previous.element, this.element);
	};

	function fromElement(element)
	{
		return new ElementWidget(element);
	}

	function toElement(width, height, html)
	{
		return A3(Element.newElement, width, height, {
			ctor: 'Custom',
			type: 'evancz/elm-html',
			render: render,
			update: update,
			model: html
		});
	}



	// RENDER AND UPDATE


	function render(model)
	{
		var element = Element.createNode('div');
		element.appendChild(createElement(model));
		return element;
	}

	function update(node, oldModel, newModel)
	{
		updateAndReplace(node.firstChild, oldModel, newModel);
		return node;
	}

	function updateAndReplace(node, oldModel, newModel)
	{
		var patches = diff(oldModel, newModel);
		var newNode = patch(node, patches);
		return newNode;
	}



	// LAZINESS


	function lazyRef(fn, a)
	{
		function thunk()
		{
			return fn(a);
		}
		return new Thunk(fn, [a], thunk);
	}

	function lazyRef2(fn, a, b)
	{
		function thunk()
		{
			return A2(fn, a, b);
		}
		return new Thunk(fn, [a,b], thunk);
	}

	function lazyRef3(fn, a, b, c)
	{
		function thunk()
		{
			return A3(fn, a, b, c);
		}
		return new Thunk(fn, [a,b,c], thunk);
	}

	function Thunk(fn, args, thunk)
	{
		/* public (used by VirtualDom.js) */
		this.vnode = null;
		this.key = undefined;

		/* private */
		this.fn = fn;
		this.args = args;
		this.thunk = thunk;
	}

	Thunk.prototype.type = "Thunk";
	Thunk.prototype.render = renderThunk;

	function shouldUpdate(current, previous)
	{
		if (current.fn !== previous.fn)
		{
			return true;
		}

		// if it's the same function, we know the number of args must match
		var cargs = current.args;
		var pargs = previous.args;

		for (var i = cargs.length; i--; )
		{
			if (cargs[i] !== pargs[i])
			{
				return true;
			}
		}

		return false;
	}

	function renderThunk(previous)
	{
		if (previous == null || shouldUpdate(this, previous))
		{
			return this.thunk();
		}
		else
		{
			return previous.vnode;
		}
	}


	return elm.Native.VirtualDom.values = Elm.Native.VirtualDom.values = {
		node: node,
		text: text,
		on: F4(on),

		property: F2(property),
		attribute: F2(attribute),
		attributeNS: F3(attributeNS),

		lazy: F2(lazyRef),
		lazy2: F3(lazyRef2),
		lazy3: F4(lazyRef3),

		toElement: F3(toElement),
		fromElement: fromElement,

		render: createElement,
		updateAndReplace: updateAndReplace
	};
};

},{"virtual-dom/vdom/create-element":6,"virtual-dom/vdom/patch":9,"virtual-dom/vnode/is-vhook":13,"virtual-dom/vnode/vnode":18,"virtual-dom/vnode/vtext":20,"virtual-dom/vtree/diff":22}]},{},[23]);
