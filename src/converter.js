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

		// the parent argument is used to wrap the result in parent element opening/closing data
		getDataForDom: function( dom, store, parent, parentStyle ) {
			var data = [];

			// add parent element's opening tag
			if ( utils.isObject( parent ) && parent.type ) {
				data.push( parent );
			}

			// add data for child nodes
			[].forEach.call( dom.childNodes, function( child ) {
				var childData;

				// element
				if ( child.nodeType === Node.ELEMENT_NODE ) {
					var nodeConstructor = nodeManager.matchForDom( child ) || nodeManager.get( 'unknown' );

					// styled text
					if ( nodeConstructor.prototype instanceof StyledNode ) {
						// styled node's data contains attributes only
						var childStyle = nodeConstructor.toData( child );

						// get index of a style in the store
						var index = store.store( childStyle );

						// merge child's and parent's styles
						childStyle = [].concat( parentStyle || [] );

						// add child's style
						if ( childStyle.indexOf( index ) === -1 ) {
							childStyle.push( index );
						}

						// collect data for all children
						childData = this.getDataForDom( child, store, null, childStyle );
						// regular element
					} else {
						var parentData = nodeConstructor.toData( child );
						childData = this.getDataForDom( child, store, parentData );
					}

					data = data.concat( childData );
					// text
				} else if ( child.nodeType === Node.TEXT_NODE ) {
					var text = child.data;

					// don't add empty text nodes
					if ( text === '' ) {
						return;
					}

					// node contains whitespaces only
					if ( text.match( /^\s+$/ ) ) {
						// there's an element opening data before the text so ignore it
						if ( data[ data.length - 1 ] && data[ data.length - 1 ].type ) {
							return;
						}

						// TODO is that enough for now?
					}

					childData = this.getDataForText( child.textContent, parentStyle );

					data = data.concat( childData );
				}
			}, this );

			// add parent element's closing tag
			if ( utils.isObject( parent ) && parent.type ) {
				// TODO should we put a closing tag for a void element?

				// TODO remove empty text before the closing element data

				data.push( {
					type: '/' + parent.type
				} );
			}

			return data;
		},

		getDataForText: function( text, parentStyle ) {
			text = text.split( '' );

			if ( !parentStyle ) {
				return text;
			}

			return text.map( function( char ) {
				return [ char, parentStyle ];
			} );
		},

		getDomForData: function( data, doc ) {
			var nodeConstructor = nodeManager.get( data[ 1 ].type );

			return nodeConstructor.toDom( data, doc );
		}
	};

	return new Converter();
} );