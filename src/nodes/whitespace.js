define( [
	'node',
	'nodemanager',
	'tools/utils'
], function(
	Node,
	nodeManager,
	utils
) {
	'use strict';

	var allWhitePattern = /^\s+$/,
		startEndWhitePattern = /^\s+|\s+$/g,
		blockElements = [
			'address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt',
			'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'header', 'hgroup', 'hr', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre', 'section',
			'table', 'tbody', 'tfoot', 'thead', 'ul', 'video'
		];

	// The converter to consume whitespaces (do not create any data for them).
	function WhitespaceNode() {
		Node.apply( this, arguments );
	}

	utils.extend( WhitespaceNode, Node, {
		isEmpty: true,
		isWrapped: false,
		tags: [ '#text' ],
		type: 'whitespace',

		toData: function( options ) {
			var elem = options.element,
				text = elem.data;

			// TODO what about pre-formatted text? we shouldn't touch whitespaces, should we?

			// remove unneeded text nodes
			if ( allWhitePattern.test( text ) && ( (
						( blockElements.indexOf( elem.parentNode.nodeName.toLowerCase() ) > -1 ) &&
						( !elem.previousSibling || !elem.nextSibling )
					) ||
					// ignore whitespaces between block elements
					( elem.previousSibling && blockElements.indexOf( elem.previousSibling.nodeName.toLowerCase() ) > -1 ) ||
					( elem.nextSibling && blockElements.indexOf( elem.nextSibling.nodeName.toLowerCase() ) > -1 ) ||
					// ignore whitespaces between tags containing newline characters
					( elem.previousSibling && elem.nextSibling && text.match( /\n/ ) ) ) ) {
				options.onElement( null );
			} else {
				elem.data = text.replace( startEndWhitePattern, ' ' );
			}
		}
	} );

	utils.inherit( WhitespaceNode, Node );

	// set the lower priority to execute this one before the text constructor
	nodeManager.register( WhitespaceNode, 0 );

	return WhitespaceNode;
} );