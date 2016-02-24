//import Native.Json //

var _evancz$virtual_dom$Native_VirtualDom = function() {

var EVENT_KEY = 'EVENT_KEY';
var ATTRIBUTE_KEY = 'ATTRUBUTE_KEY';
var ATTRIBUTE_NS_KEY = 'ATTRIBUTE_NS_KEY';



////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(propertyList, contents) {
		return nodeHelp(tag, propertyList, contents);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var virtualKey, namespace;
	var style, events, properties, attributes, attributesNS;

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		switch (key)
		{
			case ATTRIBUTE_KEY:
				attributes = attributes || {};
				attributes[entry.realKey] = entry.value;
				break;

			case ATTRIBUTE_NS_KEY:
				attributesNS = attributesNS || {};
				attributesNS[entry.realKey] = entry.value;
				break;

			case EVENT_KEY:
				events = events || {};
				events['on' + entry.realKey] = entry.value;
				break;

			case 'style':
				style = entry.value;
				break;

			case 'key':
				virtualKey = entry.value;
				break;

			case 'namespace':
				namespace = entry.value;
				break;

			default:
				properties = properties || {};
				properties[key] = entry.value;
				break;
		}
		factList = factList._1;
	}

	var children = [];
	var descendantsCount = 0;
	var numKeys = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);

		if (typeof kid.key !== 'undefined')
		{
			numKeys++;
		}

		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		style: style,
		events: events,
		properties: properties,
		attributes: attributes,
		attributesNS: attributesNS,
		children: children,
		key: virtualKey,
		numKeys: numKeys,
		namespace: namespace,
		descendantsCount: descendantsCount
	};

}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: node.descendantsCount || 0
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: null
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


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
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTRIBUTE_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	return a.options === b.options && a.decoder === b.decoder;
}



////////////  RENDERER  ////////////


function renderer(parent, tagger, initialVirtualNode)
{
	var eventNode = { tagger: tagger, parent: null };

	var domNode = render(initialVirtualNode, eventNode);
	parent.appendChild(domNode);

	var state = 'NO_REQUEST';
	var currentVirtualNode = initialVirtualNode;
	var nextVirtualNode = initialVirtualNode;

	function registerVirtualNode(vnode)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextVirtualNode = vnode;
	}

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/core/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var patches = diff(currentVirtualNode, nextVirtualNode);
				domNode = applyPatches(domNode, currentVirtualNode, patches);
				currentVirtualNode = nextVirtualNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return { update: registerVirtualNode };
}


var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(cb) { setTimeout(cb, 1000 / 60); };



////////////  RENDER  ////////////


function render(vnode, eventNode)
{
	switch (vnode.type)
	{
		case 'thunk':
			if (!vnode.node)
			{
				vnode.node = vnode.thunk();
			}
			return render(vnode.node, eventNode);

		case 'tagger':
			var subEventRoot = {
				tagger: vnode.tagger,
				parent: eventNode
			};
			var domNode = render(vnode.node, subEventRoot);
			domNode.elm_event_ref = subEventRoot;
			return domNode;

		case 'text':
			return document.createTextNode(vnode.text);

		case 'node':
			var node = vnode.namespace
				? document.createElementNS(vnode.namespace, vnode.tag)
				: document.createElement(vnode.tag);

			applyStyles(node, vnode.styles);
			applyEvents(node, eventNode, vnode.events);
			applyProps(node, vnode.properties);
			applyAttrs(node, vnode.attributes);
			applyAttrsNS(node, vnode.attributesNS);

			var children = vnode.children;

			for (var i = 0; i < children.length; i++)
			{
				node.appendChild(render(children[i], eventNode));
			}

			return node;
	}
}



// Applying STYLES, EVENTS, PROPERTIES, ATTRIBUTES, and ATTRIBUTES_NS
//
// All of these functions use `undefined` to mean "remove all existing things"
// All previousX may be undefined, meaning nothing is set already.


function applyStyles(node, styles, previousStyles)
{
	if (!styles)
	{
		for (var key in previousStyles)
		{
			node.style[key] = '';
		}
		return;
	}

	for (var key in styles)
	{
		var value = styles[key];
		if (typeof value === 'undefined')
		{
			node.style[key] = '';
		}
		else
		{
			node.style[key] = value;
		}
	}
}


function applyEvents(node, eventNode, events, previousEvents)
{
	if (!events)
	{
		for (var key in previousEvents)
		{
			node[key] = null;
		}
		return;
	}

	for (var key in events)
	{
		var value = events[key];
		if (typeof value === 'undefined')
		{
			node[key] = null;
		}
		else if (node[key])
		{
			node[key].info = value;
		}
		else
		{
			node[key] = makeEventHandler(eventNode, value);
		}
	}
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.runDecoderValue, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				message = currentEventNode.tagger(message);
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}


function applyProps(node, props, previousProps)
{
	if (!props)
	{
		for (var key in previousProps)
		{
			node[key] = typeof previousProps[key] === 'string' ? '' : null;
		}
		return;
	}

	for (var key in props)
	{
		var value = props[key];
		if (typeof value === 'undefined')
		{
			node[key] = typeof previousProps[key] === 'string' ? '' : null;
		}
		else
		{
			node[key] = value;
		}
	}
}


function applyAttrs(node, attrs, previousAttrs)
{
	if (!attrs)
	{
		for (var key in previousAttrs)
		{
			node.removeAttribute(key);
		}
		return;
	}

	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			node.removeAttribute(key);
		}
		else
		{
			node.setAttribute(key, value);
		}
	}
}


function applyAttrsNS(node, nsAttrs, previousNsAttrs)
{
	if (!nsAttrs)
	{
		for (var key in previousNsAttrs)
		{
			node.removeAttributeNS(previousNsAttrs[key].namespace, key);
		}
		return;
	}

	for (var key in nsAttrs)
	{
		var value = nsAttrs[key];
		if (typeof value === 'undefined')
		{
			node.removeAttributeNS(previousNsAttrs[key].namespace, key);
		}
		else
		{
			node.setAttributeNS(value.namespace, key, value.value);
		}
	}
}



////////////  PATCHES  ////////////


function virtualPatch(type, vNode, patch)
{
	return {
		type: type,
		vNode: vNode,
		patch: patch
	};
}


function patchText(text)
{
	return {
		type: 'patch-vtext',
		text: text
	};
}


function patchFacts(applyFacts, facts, previousFacts)
{
	return {
		type: 'patch-facts',
		applyFacts: applyFacts,
		facts: facts,
		previousFacts: previousFacts
	};
}


var patchRemove = {
	type: 'patch-remove'
};


function patchInsert(node)
{
	return {
		type: 'patch-insert',
		node: node
	};
}


function patchTagger(tagger)
{
	return {
		type: 'patch-tagger',
		tagger: tagger
	};
}



// TRAVERSE DOM, APPLY PATCHES


function applyPatches(domNode, oldVirtualNode, patchDict)
{
	var patchIndexes = [];
	for (var key in patchDict)
	{
		patchIndexes.push(Number(key));
	}

	if (patchIndexes.length === 0)
	{
		return domNode;
	}
	var indexToDomNodeDict = getDomNodeDict(domNode, oldVirtualNode, patchIndexes);

	for (var i = 0; i < patchIndexes.length; i++)
	{
		var index = patchIndexes[i];
		domNode = applyPatchesHelp(domNode, indexToDomNodeDict[index], patchDict[index]);
	}
	return domNode;
}


function applyPatchesHelp(rootNode, domNode, patches)
{
	if (!domNode)
	{
		return rootNode;
	}

	var newNode;
	if (patches instanceof Array)
	{
		for (var i = 0; i < patches.length; i++)
		{
			newNode = applyPatch(domNode, patches[i]);
			if (domNode === rootNode)
			{
				rootNode = newNode;
			}
		}
		return rootNode;
	}

	newNode = applyPatch(domNode, patches);
	if (domNode === rootNode)
	{
		rootNode = newNode;
	}
	return rootNode;
}


function getDomNodeDict(domNode, vNode, indexes)
{
	// Each node in the DOM is given an index, assigned in order of the
	// traversal. These indexes let us skip branches that do not contain any
	// indexes we care about.

	indexes.sort(ascending);

	return getDomNodeDictHelp(domNode, vNode, indexes, 0, 0, vNode.descendantsCount, {});
}


function ascending(a, b)
{
	return a - b;
}


function getDomNodeDictHelp(domNode, vNode, indexes, i, low, high, indexToDomNodeDict)
{
	var index = indexes[i];

	if (index > high)
	{
		return indexToDomNodeDict;
	}

	// are we at the desired index? If so, add it to the dictionary.
	if (index === low)
	{
		indexToDomNodeDict[index] = domNode;
		i++;
		index = indexes[i];

		if (index > high)
		{
			return indexToDomNodeDict;
		}
	}

	var vChildren = vNode.children;
	if (!vChildren)
	{
		return indexToDomNodeDict;
	}

	var childNodes = domNode.childNodes;
	for (var j = 0; j < vChildren.length; j++)
	{
		low++;
		var vChild = vChildren[j];
		var nextLow = low + (vChild.descendantsCount || 0);
		if (low <= index && index <= nextLow)
		{
			getDomNodeDictHelp(childNodes[j], vChild, indexes, i, low, nextLow, indexToDomNodeDict);
			while ((index = indexes[i]) <= nextLow)
			{
				i++;
			}
		}
		low = nextLow;
	}
	return indexToDomNodeDict;
}



// APPLY A PATCH


function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'patch-remove':
			return removeNode(domNode);

		case 'patch-insert':
			return insertNode(domNode, patch.node);

		case 'patch-vtext':
			domNode.replaceData(0, domNode.length, patch.text);
			return domNode;

		case 'patch-vnode':
			return renderAndReplace(domNode, vNode, patch);

		case 'patch-tagger':
			domNode.elm_event_ref.tagger = patch.tagger;
			return domNode;

		case 'patch-order':
			reorderChildren(domNode, patch);
			return domNode;

		case 'patch-facts':
			patch.applyFacts(domNode, patch.facts, patch.previousFacts);
			return domNode;

		default:
			return domNode;
	}
}


function removeNode(domNode)
{
	var parentNode = domNode.parentNode;
	if (parentNode)
	{
		parentNode.removeChild(domNode);
	}
	return null;
}


function insertNode(parentNode, vNode)
{
	var newNode = render(vNode, null);
	if (parentNode)
	{
		parentNode.appendChild(newNode);
	}
	return parentNode;
}


function renderAndReplace(domNode, leftVNode, vNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, null);
	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function reorderChildren(domNode, moves)
{
	var childNodes = domNode.childNodes;
	var keyMap = {};
	var node;
	var remove;
	var insert;

	for (var i = 0; i < moves.removes.length; i++)
	{
		remove = moves.removes[i];
		node = childNodes[remove.from];
		if (remove.key)
		{
			keyMap[remove.key] = node;
		}
		domNode.removeChild(node);
	}

	var length = childNodes.length;

	for (var j = 0; j < moves.inserts.length; j++)
	{
		insert = moves.inserts[j];
		node = keyMap[insert.key];
		// this is the weirdest bug i've ever seen in webkit
		domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patchDict = {};
	diffHelp(a, b, patchDict, 0);
	return patchDict;
}


function diffHelp(a, b, patchDict, index)
{
	if (a === b)
	{
		return;
	}

	switch (b.type)
	{
		case 'thunk':
			if (a.type !== 'thunk')
			{
				addPatch(patchDict, index, virtualPatch('patch-vnode', a, b));
				return;
			}
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				return;
			}
			b.node = b.thunk();
			diffHelp(a.node, b.node, patchDict, index);
			return;

		case 'tagger':
			if (a.type !== 'tagger')
			{
				addPatch(patchDict, index, virtualPatch('patch-vnode', a, b));
				return;
			}

			if (a.tagger !== b.tagger)
			{
				addPatch(patchDict, index, patchTagger(b.tagger));
			}

			diffHelp(a.node, b.node, patchDict, index);
			return;

		case 'text':
			if (a.type !== 'text')
			{
				addPatch(patchDict, index, virtualPatch('patch-vnode', a, b));
				return;
			}

			if (a.text !== b.text)
			{
				addPatch(patchDict, index, patchText(b.text));
				return;
			}

			return;

		case 'node':
			if (a.type === 'node' && a.tag === b.tag && a.namespace === b.namespace && a.key === b.key)
			{
				diffFacts(patchDict, index, applyStyles, a.styles, b.styles);
				diffFacts(patchDict, index, applyProps, a.properties, b.properties);
				diffFacts(patchDict, index, applyAttrs, a.attributes, b.attributes);
				diffFacts(patchDict, index, applyAttrsNS, a.attributesNS, b.attributesNS);

				diffChildren(a, b, patchDict, index);
				return;
			}

			addPatch(patchDict, index, virtualPatch('patch-vnode', a, b));
			return;
	}
}


function addPatch(patchDict, index, patch)
{
	var patches = patchDict[index];
	if (typeof patches === 'undefined')
	{
		patchDict[index] = patch;
	}
	else if (patches instanceof Array)
	{
		patches.push(patch);
	}
	else
	{
		patchDict[index] = [patches, patch];
	}
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(patchDict, index, applyFacts, a, b)
{
	var diff;
	for (var aKey in a)
	{
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] = undefined;
			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		if (aValue === bValue)
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	if (!diff)
	{
		return;
	}

	addPatch(patchDict, index, patchFacts(applyFacts, diff, a));
}


function diffChildren(aParent, bParent, patchDict, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	var aNumKeys = aParent.numKeys;
	var bNumKeys = aParent.numKeys;

	if (aNumKeys === 0 || bNumKeys === 0)
	{
		// TODO consider the case where A has keys and B does not.
		// Perhaps it makes sense to remove keyed nodes as you see them,
		// knowing that they will not match with anything on the other
		// side. This may give you cleaner diffs on the remaining nodes.
		// May be worthwhile to break this case out, even if it is quite
		// rare in practice.

		var index = rootIndex;

		var i = 0;
		var minLen = aLen > bLen ? aLen : bLen;
		for (; i < minLen; i++)
		{
			index++;
			var aChild = aChildren[i];
			diffHelp(aChild, bChildren[i], patchDict, index);
			index += aChild.descendantsCount || 0;
		}
		for (; i < aLen; i++)
		{
			index++;
			addPatch(patchDict, index, patchRemove);
			index += aChildren[i].descendantsCount || 0;
		}
		for (; i < bLen; i++)
		{
			addPatch(patchDict, rootIndex, patchInsert(bChildren[i]));
		}
	}

	if (aNumKeys === aLen && bNumKeys == bLen)
	{

	}
}



////////////  PROGRAMS  ////////////


function program(details)
{
	var init = details.init;
	return {
		init: typeof init === 'function' ? init : function() { return init; },
		update: details.update,
		subscriptions: details.subscriptions,
		view: details.view,
		renderer: renderer
	};
}


function staticProgram(parent, vnode)
{
	var domNode = render(vnode, null);
	parent.appendChild(domNode);
}


return {
	node: node,
	text: text,

	map: F2(map),

	on: F3(on),
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),

	program: program,
	render: staticProgram
};

}();