define( [
	'converter',
	'dataprocessor',
	'lineardata',
	'nodemanager',
	'store',
	'view',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	dataProcessor,
	LinearData,
	nodeManager,
	Store,
	View,
	Emitter,
	utils
) {
	'use strict';

	function Document( $el, editable ) {
		this.store = new Store();

		// reference to the parent editable object
		this.editable = editable;

		// create a detached copy of the source html
		var dom = utils.createDocumentFromHTML( $el.html() ).body;

		// TODO combine the data processing with data conversion loop
		// normalize the dom
		dataProcessor.normalizeWhitespaces( dom );

		// prepare the data array for the linear data
		var data = converter.getDataForDom( dom, this.store, null, true );

		// document's linear data
		this.data = new LinearData( data, this.store );

		// create document tree root element
		this.root = converter.getTreeForData( this.data, this );
		this.root.view = new View( this.root, document.createElement( 'div' ) );
		this.root.document = this;
		this.editable.addView( this.root.view );

		this.renderTree( this.root, this.root.view );
	}

	utils.extend( Document.prototype, Emitter, {
		// apply a transaction to the document - update the linear data and document tree
		applyTransaction: function( transaction ) {
			if ( transaction.applied ) {
				throw new Error( 'The transaction has already been applied.' );
			}

			transaction.applyTo( this );

			this.history.push( transaction );
		},

		// retrieve linear data for the given node
		getNodeData: function( node ) {
			if ( !node ) {
				return;
			}

			var offset = node.getOffset();

			return this.data.slice( offset, offset + node.length );
		},

		// retrieve a node that contains data at the given position
		getNodeAtPosition: function( position ) {
			function findNode( node, offset ) {
				// the position points to this node's opening/closing items
				if ( position === offset || position === offset + node.length - 1 ) {
					return node;
				}

				var result = null;

				if ( position > offset && position < offset + node.length - 1 ) {
					// node has children so let's check which of them we're looking for
					if ( node.children ) {
						// increment the counter for the node's opening item
						offset++;

						node.children.some( function( child ) {
							result = findNode( child, offset );

							if ( result ) {
								return true;
							} else {
								offset += child.length;
							}
						} );
					} else {
						result = node;
					}
				}

				return result;
			}

			return findNode( this.root, 0 );
		},

		// render given node tree and append it to the parent
		renderTree: function( node, parent ) {
			var doc = parent.getElement().ownerDocument;

			function appendToParent( el ) {
				parent.append( el );
			}

			node.children.forEach( function( child ) {
				// use child's data or get it from the linear data
				var data = child.data || this.getNodeData( child );
				// create DOM element(s) for a child nnode
				var elem = child.constructor.toDom( data, doc, this.store );

				// node returns an array of element so there's no point in processing its children again
				// this happens e.g. for text nodes
				if ( utils.isArray( elem ) ) {
					elem.forEach( appendToParent );
				} else {
					child.view = new View( child, elem );
					// TODO this doesn't seem to be the best place to store it
					this.editable.addView( child.view );
					child.view.appendTo( parent );

					if ( child.children ) {
						this.renderTree( child, child.view );
					}
				}

			}, this );
		},
	} );

	return Document;
} );