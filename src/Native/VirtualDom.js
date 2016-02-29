//import Native.Json //

var _evancz$virtual_dom$Native_VirtualDom = function() {

var EVENT_KEY = 'EVENT';
var ATTRIBUTE_KEY = 'ATTR';
var ATTRIBUTE_NS_KEY = 'ATTR_NS';



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
		descendantsCount: 1 + (node.descendantsCount || 0)
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
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
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
				domNode = applyPatches(domNode, currentVirtualNode, patches, eventNode);
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
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return document.createTextNode(vnode.text);

		case 'node':
			var node = vnode.namespace
				? document.createElementNS(vnode.namespace, vnode.tag)
				: document.createElement(vnode.tag);

			applyStyles(node, vnode.styles);
			applyEvents(node, vnode.events, eventNode);
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


function applyStyles(domNode, styles)
{
	for (var key in styles)
	{
		var value = styles[key];
		domNode.style[key] = typeof value === 'undefined' ? '' : value;
	}
}


function applyEvents(domNode, events, eventNode)
{
	for (var key in events)
	{
		var value = events[key];
		if (typeof value === 'undefined')
		{
			domNode[key] = null;
		}
		else if (domNode[key])
		{
			domNode[key].info = value;
		}
		else
		{
			domNode[key] = makeEventHandler(eventNode, value);
		}
	}
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

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
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}


function applyProps(domNode, props, previousProps)
{
	for (var key in props)
	{
		var value = props[key];
		domNode[key] =
			typeof value === 'undefined'
				? (typeof previousProps[key] === 'string' ? '' : null)
				: value;
	}
}


function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}


function applyAttrsNS(domNode, nsAttrs, previousNsAttrs)
{
	for (var key in nsAttrs)
	{
		var value = nsAttrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(previousNsAttrs[key].namespace, key);
		}
		else
		{
			domNode.setAttributeNS(value.namespace, key, value.value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push({
			index: index,
			type: 'p-redraw',
			data: b,
			domNode: null
		});
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
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
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			patches.push({
				index: index,
				type: 'p-thunk',
				data: subPatches,
				domNode: null
			});
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push({
					index: index,
					type: 'p-redraw',
					data: b,
					domNode: null
				});
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push({
					 index: index,
					 type: 'p-tagger',
					 data: bTaggers,
					 domNode: null
				});
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push({
					index: index,
					type: 'p-text',
					data: b.text,
					domNode: null
				});
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace || a.key !== b.key)
			{
				patches.push({
					index: index,
					type: 'p-redraw',
					data: b,
					domNode: null
				});
				return;
			}

			var stylesDiff = diffFacts(a.styles, b.styles);
			var eventsDiff = diffFacts(a.events, b.events, equalEvents);
			var propsDiff = diffFacts(a.properties, b.properties);
			var attrsDiff = diffFacts(a.attributes, b.attributes);
			var attrsNsDiff = diffFacts(a.attributesNS, b.attributesNS);

			if (stylesDiff || eventsDiff || propsDiff || attrsDiff || attrsNsDiff)
			{
				patches.push({
					index: index,
					type: 'p-facts',
					data: {
						oldVirtualNode: a,
						styles: stylesDiff,
						events: eventsDiff,
						props: propsDiff,
						attrs: attrsDiff,
						attrsNs: attrsNsDiff
					},
					domNode: null
				});
			}

			diffChildren(a, b, patches, index);
			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, specialEq)
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

		if (aValue === bValue || (specialEq && specialEq(aValue, bValue)))
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

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
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

		if (aLen > bLen)
		{
			patches.push({
				index: rootIndex,
				type: 'p-remove',
				data: bLen - aLen,
				domNode: null
			});
		}
		else if (aLen < bLen)
		{
			patches.push({
				index: rootIndex,
				type: 'p-insert',
				data: bChildren.slice(aLen),
				domNode: null
			});
		}

		var i = 0;
		var minLen = aLen > bLen ? aLen : bLen;
		for (; i < minLen; i++)
		{
			index++;
			var aChild = aChildren[i];
			diffHelp(aChild, bChildren[i], patches, index);
			index += aChild.descendantsCount || 0;
		}
	}

	if (aNumKeys === aLen && bNumKeys == bLen)
	{

	}
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		if (patch.type === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else
		{
			// TODO add eventNode to certain patches
			patch.domNode = domNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			return addDomNodesHelp(domNode, vNode.node, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	console.log(patches);

	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);

	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}


function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return redraw(domNode, patch.data);

		case 'p-facts':
			applyFacts(domNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-tagger':
			domNode.elm_event_node_ref.tagger = patch.data;
			return domNode;

		case 'p-remove':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-insert':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				parentNode.appendChild(render(newNodes[i], /*TODO*/ eventNode));
			}
			return domNode;

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function redraw(domNode, vNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, null);
	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyFacts(domNode, facts)
{
	var vNode = facts.oldVirtualNode;
	applyStyles(domNode, facts.styles);
	applyEvents(domNode, facts.events, eventNode);
	applyProps(domNode, facts.props, vNode.properties);
	applyAttrs(domNode, facts.attrs);
	applyAttrsNS(domNode, facts.attrsNs, vNode.attributesNS);
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