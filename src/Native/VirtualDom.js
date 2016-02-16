


// RENDER


function render(vnode, taggerStack)
{
	switch (vnode.type)
	{
		case 'thunk':
			if (!vnode.node)
			{
				vnode.node = vnode.thunk();
			}
			return render(vnode.node, taggerStack);

		case 'tagger':
			return render(vnode.value, {
				tagger: vnode.tagger,
				rest: taggerStack
			});

		case 'text':
			return document.createTextNode(vnode.text);

		case 'node':
			var node = vnode.namespace
				? document.createElementNS(vnode.namespace, vnode.tag)
				: document.createElement(vnode.tag);

			applyStyle(node, vnode.styles);
			applyProperties(node, vnode.properties);
			applyAttributes(node, vnode.attributes);
			applyAttributesNS(node, vnode.attributesNS);

			var children = vnode.children;

			for (var i = 0; i < children.length; i++)
			{
				node.appendChild(render(children[i], taggerStack));
			}

			return node;
	}
}



// Applying STYLES, PROPERTIES, ATTRIBUTES, and ATTRIBUTES_NS
//
// All of these functions use `undefined` to mean "remove all existing things"


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
		if (value === undefined)
		{
			node.style[key] = '';
		}
		else
		{
			node.style[key] = value;
		}
	}
}


function applyProperties(node, props, previousProps)
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
		if (value === undefined)
		{
			node[key] = typeof previousProps[key] === 'string' ? '' : null;
		}
		else
		{
			node[key] = value;
		}
	}
}


function applyAttributes(node, attrs, previousAttrs)
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
		if (value === undefined)
		{
			node.removeAttribute(key);
		}
		else
		{
			node.setAttribute(key, value);
		}
	}
}


function applyAttributesNS(node, nsAttrs, previousNsAttrs)
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
		if (value === undefined)
		{
			node.removeAttributeNS(previousNsAttrs[key].namespace, key);
		}
		else
		{
			node.setAttributeNS(value.namespace, key, value.value);
		}
	}
}



// PATCHES


function virtualPatch(type, vNode, patch)
{
	return {
		type: type,
		vNode: vNode,
		patch: patch
	};
}



// TRAVERSE DOM, APPLY PATCHES


function applyPatches(domNode, patchDict)
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
	var indexToDomNodeDict = getDomNodeDict(domNode, patchDict.a, patchIndexes);

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
			newNode = applyPatch(patches[i], domNode);
			if (domNode === rootNode)
			{
				rootNode = newNode;
			}
		}
		return rootNode;
	}

	newNode = applyPatch(patches, domNode);
	if (domNode === rootNode)
	{
		rootNode = newNode;
	}
	return rootNode;
}


function getDomNodeDict(domNode, vNode, indexes)
{
	// Each node in the DOM is given an index using in-order tree indexing.
	// These indexes let us skip traversing branches that do not contain any
	// indexes we care about.

	indexes.sort(ascending);

	return getDomNodeDictHelp(domNode, vNode, indexes, 0, 0, vNode.descendantsCount, {});
}

function ascending(a, b)
{
	return a > b ? 1 : -1;
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


function applyPatch(vpatch, domNode)
{
	var type = vpatch.type
	var vNode = vpatch.vNode
	var patch = vpatch.patch
	switch (type)
	{
		case 'patch-remove':
			return removeNode(domNode, vNode);

		case 'patch-insert':
			return insertNode(domNode, patch);

		case 'patch-vtext':
			return updateText(domNode, vNode, patch);

		case 'patch-vnode':
			return renderAndReplace(domNode, vNode, patch);

		case 'patch-order':
			reorderChildren(domNode, patch);
			return domNode;

		case 'patch-props':
			applyProperties(domNode, patch, vNode.properties);
			return domNode

		default:
			return domNode
	}
}

function removeNode(domNode, vNode)
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

function updateText(domNode, leftVNode, vText)
{
	if (domNode.nodeType === 3)
	{
		domNode.replaceData(0, domNode.length, vText.text);
		return domNode;
	}

	var parentNode = domNode.parentNode;
	var newNode = render(vText, null);
	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
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



// DIFF two VIRTUAL-DOM nodes


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
				// TODO if you have thunk vs not-thunk, is it even worth it to diff them?
				// Cannot really imagine code where `lazy` is added/removed and the
				// underlying structure did not change in serious ways.
				b.node = b.thunk();
				diffHelp(a, b.node, patchDict, index);
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
			if (a.type === 'tagger')
			{
				// TODO swap function in "tagger tree"
				// needs to be done as patch so all changes are synchronized
			}
			else
			{
				// TODO replace everithing?
			}
			// TODO return

		case 'text':
			if (a.type !== 'text')
			{
				addPatch(patchDict, index, virtualPatch('patch-vtext', a, b));
				return;
			}
			if (a.text !== b.text)
			{
				addPatch(patchDict, index, virtualPatch('patch-vtext', a, b))
			}
			return;

		case 'node':
			if (a.type === 'node' && a.tag === b.tag && a.namespace === b.namespace && a.key === b.key)
			{
				var stylesPatch = diffFacts(a.styles, b.styles);
				var propertiesPatch = diffFacts(a.properties, b.properties);
				var attributesPatch = diffFacts(a.attributes, b.attributes);
				var attributesNsPatch = diffFacts(a.attributesNS, b.attributesNS);

				if (propsPatch)
				{
					addPatch(patchDict, index, virtualPatch('patch-props', a, propsPatch));
				}
				diffChildren(a, b, patchDict, index);
				return;
			}

			addPatch(patchDict, index, virtualPatch('patch-vnode', a, b));
			return;
	}
}


function diffFacts(a, b)
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
	return diff;
}


function diffChildren(a, b, patchDict, index)
{
	var aChildren = a.children;
	var orderedSet = reorder(aChildren, b.children);
	var bChildren = orderedSet.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var len = aLen > bLen ? aLen : bLen;
	for (var i = 0; i < len; i++)
	{
		var leftNode = aChildren[i];
		var rightNode = bChildren[i];
		index += 1;

		// compare nodes
		if (!leftNode)
		{
			if (rightNode)
			{
				// Excess nodes in b need to be added
				applyPatchesHelp(patchDict, index, virtualPatch('patch-insert', null, rightNode));
			}
		}
		else if (!rightNode)
		{
			addPatch(patchDict, index, virtualPatch('patch-remove', leftNode, rightNode));
		}
		else
		{
			diffHelp(leftNode, rightNode, patchDict, index);
		}

		// bump index as far as necessary
		if (leftNode.type === 'node' && leftNode.descendantsCount)
		{
			index += leftNode.descendantsCount;
		}
	}
	if (orderedSet.moves)
	{
		// Reorder nodes last
		applyPatchesHelp(patchDict, index, virtualPatch('patch-order', a, orderedSet.moves));
	}
	return apply;
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren)
{
	// TODO opportunity with keyIndex to allocate less.
	// Take two passes over children. First to count/gather keys.
	// Second pass only if some keys are found.
	//
	// If no keys, no new allocations.
	// If keys, allocate with new Array(N) instead of push.

	// O(M) time, O(M) memory
	var bChildIndex = keyIndex(bChildren)
	var bKeys = bChildIndex.keys
	var bFree = bChildIndex.free
	if (bFree.length === bChildren.length)
	{
		return {
			children: bChildren,
			moves: null
		}
	}
	// O(N) time, O(N) memory
	var aChildIndex = keyIndex(aChildren)
	var aKeys = aChildIndex.keys
	var aFree = aChildIndex.free
	if (aFree.length === aChildren.length)
	{
		return {
			children: bChildren,
			moves: null
		}
	}

	// O(MAX(N, M)) memory
	var newChildren = [];
	var freeIndex = 0;
	var freeCount = bFree.length;
	var deletedItems = 0;

	// Iterate through a and match a node in b
	// O(N) time,
	for (var i = 0; i < aChildren.length; i++)
	{
		var aItem = aChildren[i];
		var aKey = aItem.key;
		if (aKey)
		{
			if (bKeys[aKey] !== undefined)
			{
				// Match up the old keys
				newChildren.push(bChildren[bKeys[aKey]]);
			}
			else
			{
				// Remove old keyed items
				deletedItems++;
				newChildren.push(null);
			}
		}
		else
		{
			// Match the item in a with the next free item in b
			if (freeIndex < freeCount)
			{
				newChildren.push(bChildren[bFree[freeIndex++]]);
			}
			else
			{
				// There are no free items in b to match with
				// the free items in a, so the extra free nodes
				// are deleted.
				deletedItems++;
				newChildren.push(null);
			}
		}
	}

	// Iterate through b and append any new keys in O(M) time
	// (1) Add any new keyed items or (2) add any leftover non-keyed items
	// We are adding new items to the end and then sorting them
	// in place. In future we should insert new items in place.

	var lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];

	var j = 0;

	for ( ; j < lastFreeIndex; j++)
	{
		var newItem = bChildren[j];
		var newKey = newItem.key;
		if (newKey && aKeys[newKey] === undefined)
		{
			newChildren.push(newItem);
		}
	}
	for ( ; j < bChildren.length; j++)
	{
		newChildren.push(bChildren[j]);
	}

	var simulate = newChildren.slice();
	var simulateIndex = 0;
	var removes = [];
	var inserts = [];
	var simulateItem;
	for (var k = 0; k < bChildren.length;)
	{
		var wantedItem = bChildren[k];
		simulateItem = simulate[simulateIndex];

		// remove items
		while (simulateItem === null && simulate.length)
		{
			removes.push(remove(simulate, simulateIndex, null));
			simulateItem = simulate[simulateIndex];
		}
		if (!simulateItem || simulateItem.key !== wantedItem.key)
		{
			// if we need a key in this position...
			if (wantedItem.key)
			{
				if (simulateItem && simulateItem.key)
				{
					// if an insert doesn't put this key in place, it needs to move
					if (bKeys[simulateItem.key] !== k + 1)
					{
						removes.push(remove(simulate, simulateIndex, simulateItem.key));
						simulateItem = simulate[simulateIndex];
							// if the remove didn't put the wanted item in place, we need to insert it
						if (!simulateItem || simulateItem.key !== wantedItem.key)
						{
							inserts.push(
							{
								key: wantedItem.key,
								to: k
							});
						}
						// items are matching, so skip ahead
						else
						{
							simulateIndex++;
						}
					}
					else
					{
						inserts.push(
						{
							key: wantedItem.key,
							to: k
						});
					}
				}
				else
				{
					inserts.push(
					{
						key: wantedItem.key,
						to: k
					});
				}
				k++;
			}
			// a key in simulate has no matching wanted key, remove it
			else if (simulateItem && simulateItem.key)
			{
				removes.push(remove(simulate, simulateIndex, simulateItem.key));
			}
		}
		else
		{
			simulateIndex++;
			k++;
		}
	}
	// remove all the remaining nodes from simulate
	while (simulateIndex < simulate.length)
	{
		simulateItem = simulate[simulateIndex];
		removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
	}
	// If the only moves we have are deletes then we can just
	// let the delete patch remove these items.
	if (removes.length === deletedItems && !inserts.length)
	{
		return {
			children: newChildren,
			moves: null
		};
	}
	return {
		children: newChildren,
		moves: {
			removes: removes,
			inserts: inserts
		}
	};
}

function remove(arr, index, key)
{
	arr.splice(index, 1)
	return {
		from: index,
		key: key
	}
}

function keyIndex(children)
{
	var keys = {};
	var free = [];
	var length = children.length;
	for (var i = 0; i < length; i++)
	{
		var child = children[i];
		if (child.key)
		{
			keys[child.key] = i;
		}
		else
		{
			free.push(i);
		}
	}
	return {
		keys: keys,
		free: free
	};
}


// The Elm Stuff

Elm.Native.VirtualDom = {};
Elm.Native.VirtualDom.make = function(elm)
{
	elm.Native = elm.Native || {};
	elm.Native.VirtualDom = elm.Native.VirtualDom || {};
	if (elm.Native.VirtualDom.values)
	{
		return elm.Native.VirtualDom.values;
	}

	var Json = Elm.Native.Json.make(elm);

	var ATTRIBUTE_KEY = 'ATTRUBUTE_KEY_B6K7ITZ7H1';
	var ATTRIBUTE_NS_KEY = 'ATTRIBUTE_NS_KEY_7RD0ZS79BQ';


	// VIRTUAL DOM NODES


	// TODO does it make things faster to use `this` instead?
	function text(string)
	{
		return {
			type: 'text',
			text: string // TODO does it make things faster to cast this to String? String(string)
		};
	}

	function node(name)
	{
		return F2(function(propertyList, contents) {
			return nodeHelp(name, propertyList, contents);
		});
	}

	function nodeHelp(name, factList, kidList)
	{
		var virtualKey, namespace;
		var style, properties, attributes, attributesNS;

		while (factList.ctor !== '[]')
		{
			var entry = factList._0;
			var key = entry.key;

			switch (key)
			{
				case ATTRIBUTE_KEY:
					attributes = attributes || {};
					attributes[entry.attrKey] = entry.value;
					break;

				case ATTRIBUTE_NS_KEY:
					attributesNS = attributesNS || {};
					attributesNS[entry.attrKey] = entry.value;
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
		while (kidList.ctor !== '[]')
		{
			var kid = kidList._0;
			descendantsCount += kid.descendantsCount;
			children.push(kid);
			kidList = kidList._1;
		}
		descendantsCount += children.length;

		return {
			type: 'node',
			tag: tag,
			style: style,
			properties: properties,
			attributes: attributes,
			attributesNS: attributesNS,
			children: children,
			key: virtualKey,
			namespace: namespace,
			descendantsCount: descendantsCount
		};

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
			attrKey: key,
			value: value
		};
	}

	function attributeNS(namespace, key, value)
	{
		return {
			key: ATTRIBUTE_NS_KEY,
			attrKey: key,
			value: {
				value: value,
				namespace: namespace
			}
		};
	}



	// EVENTS


	function on(name, options, decoder)
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
				eventHandler.router(value._0);
			}
		}

		return property('on' + name, eventHandler);
	}



	// UPDATE


	function update(domNode, oldVirtualNode, newVirtualNode)
	{
		var patches = diff(oldVirtualNode, newVirtualNode);
		return applyPatches(domNode, patches);
	}



	// LAZINESS


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


	return elm.Native.VirtualDom.values = Elm.Native.VirtualDom.values = {
		node: node,
		text: text,
		on: F3(on),

		property: F2(property),
		attribute: F2(attribute),
		attributeNS: F3(attributeNS),

		lazy: F2(lazy),
		lazy2: F3(lazy2),
		lazy3: F4(lazy3),

		render: render,
		update: update
	};
};
