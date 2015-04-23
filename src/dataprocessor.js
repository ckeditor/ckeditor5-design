define( function() {
	'use strict';

	var allWhitePattern = /^\s+$/,
		startEndWhitePattern = /^\s+|\s+$/g;

	function DataProcessor() {}

	DataProcessor.prototype = {
		// TODO move this to some kind of data processor
		normalizeWhitespaces: function( el ) {
			var children = el.childNodes,
				child,
				i;

			for ( i = children.length - 1; i >= 0; i-- ) {
				child = children[ i ];

				// text node
				if ( child.nodeType === Node.TEXT_NODE ) {
					// text node contains whitespaces only
					if ( allWhitePattern.test( child.data ) ) {
						// strip whitespaces at the end or at the beginning of the el
						if ( !child.previousSibling || !child.nextSibling ) {
							el.removeChild( child );

							// reduce to a single white space
						} else {
							child.data = ' ';
						}
						// replace multiple whitespaces at the start/end with a single one
					} else {
						child.data = child.data.replace( startEndWhitePattern, ' ' );
					}

					// TODO move start/end whitespaces
					// http://www.w3.org/TR/html4/struct/text.html#h-9.1

					// element
				} else if ( child.nodeType === Node.ELEMENT_NODE ) {
					this.normalizeWhitespaces( child );
				}
			}
		}
	};

	return new DataProcessor();
} );