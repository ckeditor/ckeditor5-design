define( [
	'converter',
	'dataprocessor',
	'lineardocumentdata',
	'linearmetadata',
	'nodemanager',
	'store',
	'view',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	dataProcessor,
	LinearDocumentData,
	LinearMetaData,
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
		this.data = new LinearDocumentData( data, this.store );
		this.metadata = new LinearMetaData();

		// create document tree root element
		this.root = converter.getNodesForData( this.data, this )[ 0 ];

		this.root.render();
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

		// return an element and offset representing the given position in the linear data
		getDomNodeAndOffset: function( position, attributes ) {
			var node = this.getViewNodeAtPosition( position );

			if ( !node ) {
				return null;
			}

			// TODO take the attributes into account

			var view = node.view;
			var offset = node.getOffset() + ( node.isWrapped ? 1 : 0 );

			var current = {
				children: view.getElement().childNodes,
				index: 0
			};

			var stack = [ current ];

			console.log( 'offset', offset );

			while ( stack.length ) {
				console.log( current.index, current.children.length );
				// we went through all nodes in the current stack
				if ( current.index >= current.children.length ) {
					stack.pop();
					current = stack[ stack.length - 1 ];
					// process current stack
				} else {
					var child = current.children[ current.index ];

					// child  is a text node, check if the position sits within the child
					if ( child.nodeType === Node.TEXT_NODE ) {
						// position fits this node
						if ( position >= offset && position < offset + child.data.length ) {
							return {
								node: child,
								offset: position - offset
							};
						} else {
							offset += child.data.length;
						}
						// child  is an element
					} else if ( child.nodeType === Node.ELEMENT_NODE ) {
						var vid;

						// see if we have a view attached to this node
						if ( child.dataset && ( vid = child.dataset.vid ) && ( view = this.editable.getView( vid ) ) ) {
							node = view.node;

							var nodeOffset = node.getOffset();

							if ( position >= nodeOffset && position < nodeOffset + node.length ) {
								current.index++;
								current = {
									children: child.childNodes,
									index: 0
								};

								stack.push( current );

								if ( node.isWrapped ) {
									offset += 1;
								}

								continue;
							} else {
								offset += node.length;
							}
						} else {
							current.index++;

							current = {
								children: child.childNodes,
								index: 0
							};

							stack.push( current );

							continue;
						}
					}

					current.index++;
				}
			}

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
				var last = offset + node.length - 1;

				// the position points to this node's first/last item
				if ( position === offset || position === last ) {
					return node;
				}

				var result = null;

				if ( position > offset && position < last ) {
					// node has children so let's check which of them we're looking for
					if ( node.children ) {
						// increment the counter for the node's opening item
						offset++;

						for ( var i = 0, len = node.children.length; i < len; i++ ) {
							var child = node.children[ i ];

							result = findNode( child, offset ) || null;

							if ( result ) {
								return result;
							} else {
								offset += child.length;
							}
						}
					} else {
						result = node;
					}
				}

				return result;
			}

			return findNode( this.root, 0 );
		},

		// retrieve a node with view attached to it located at the given position
		getViewNodeAtPosition: function( position ) {
			var node = this.getNodeAtPosition( position );

			while ( !node.view ) {
				node = node.parent;
			}

			return node;
		}
	} );

	return Document;
} );