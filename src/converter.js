define( [
	'document',
	'nodemanager',
	'styles/styled-node',
	'tools/utils',
	'nodetypes'
], function(
	Document,
	nodeManager,
	StyledNode,
	utils
) {
	'use strict';

	function Converter() {}

	Converter.prototype = {
		// create a new detached document from an HTML string
		createDocumentFromHTML: function( html ) {
			if ( DOMParser ) {
				var parser = new DOMParser();

				return parser.parseFromString( html, 'text/html' );
			} else {
				// TODO handle IE < 10
			}
		},

		// the parent argument is used to wrap the result in parent element opening/closing operations
		getOperationsForDom: function( dom, parent, parentStyle ) {
			var ops = [];

			// add parent element's opening tag
			if ( utils.isObject( parent ) && parent.type ) {
				ops.push( parent );
			}

			// add operations for child nodes
			[].forEach.call( dom.childNodes, function( child ) {
				var childOps;

				// element
				if ( child.nodeType === Node.ELEMENT_NODE ) {
					var typeConverter = nodeManager.matchForDom( child ) || nodeManager.get( 'unknown' );

					// styled text
					if ( typeConverter.prototype instanceof StyledNode ) {
						// styled node's operation contains attributes only
						var childStyle = typeConverter.toOperation( child );

						// merge child's and parent's styles
						childStyle = utils.extend( {}, parentStyle || {}, childStyle );

						// collect operations for all children
						childOps = this.getOperationsForDom( child, null, childStyle );
						// regular element
					} else {
						var parentOp = typeConverter.toOperation( child );
						childOps = this.getOperationsForDom( child, parentOp );
					}

					ops = ops.concat( childOps );
					// text
				} else if ( child.nodeType === Node.TEXT_NODE ) {
					var text = child.data;

					// don't add empty text nodes
					if ( text === '' ) {
						return;
					}

					// node contains whitespaces only
					if ( text.match( /^\s+$/ ) ) {
						// there's an element opening operation before the text so ignore it
						if ( ops[ ops.length - 1 ] && ops[ ops.length - 1 ].type ) {
							return;
						}

						// TODO is that enough for now?
					}

					childOps = this.getOperationsForText( child.textContent, parentStyle );

					ops = ops.concat( childOps );
				}
			}, this );

			// add parent element's closing tag
			if ( utils.isObject( parent ) && parent.type ) {
				// TODO should we put a closing tag for a void element?

				// TODO remove empty text before the closing element operation

				ops.push( {
					type: '/' + parent.type
				} );
			}

			return ops;
		},

		getOperationsForText: function( text, parentStyle ) {
			text = text.split( '' );

			if ( !parentStyle ) {
				return text;
			}

			return text.map( function( char ) {
				return [ char, parentStyle ];
			} );
		},

		getDomForOperations: function( ops, targetElement ) {
			// TODO
		},

		getDomForOperation: function( operation, doc ) {
			var typeConverter = nodeManager.get( operation[ 1 ].type );

			return typeConverter.toDom( operation, doc );
		}
	};

	return new Converter();
} );