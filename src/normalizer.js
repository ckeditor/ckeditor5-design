define( function() {
	'use strict';

	var whitePattern = /^\s+$/;

	function Normalizer() {}

	Normalizer.prototype = {
		normalize: function( el ) {
			var children = el.childNodes,
				child,
				i;

			for ( i = children.length - 1; i >= 0; i-- ) {
				child = children[ i ];

				// text node
				if ( child.nodeType === Node.TEXT_NODE ) {
					// text node contains whitespaces only
					if ( whitePattern.test( child.data ) ) {
						// strip whitespaces at the end or at the beginning of the el
						if ( !child.previousSibling || !child.nextSibling ) {
							el.removeChild( child );

							// reduce to a single white space
						} else {
							child.data = ' ';
						}
					}

					// TODO move start/end whitespaces to the siblings
					// http://www.w3.org/TR/html4/struct/text.html#h-9.1

					// element
				} else if ( child.nodeType === Node.ELEMENT_NODE ) {
					this.normalize( child );
				}
			}
		}
	};

	return new Normalizer();
} );