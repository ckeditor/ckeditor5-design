define( [
	'converter',
	'dataprocessor',
	'lineardocumentdata',
	'linearmetadata',
	'nodemanager',
	'store',
	'transaction',
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
	Transaction,
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

		// a store for applied transactions
		this.history = [];

		this.mutationObserver = new MutationObserver( utils.debounce( this.handleMutations.bind( this ), 200 ) );
	}

	var config = {
		childList: true,
		attributes: true,
		characterData: true,
		subtree: true
	};

	utils.extend( Document.prototype, Emitter, {
		// apply a transaction to the document - update the linear data and document tree
		applyTransaction: function( transaction ) {
			if ( transaction.applied ) {
				throw new Error( 'The transaction has already been applied.' );
			}

			transaction.applyTo( this );

			this.history.push( transaction );
		},

		disableMutationObserver: function() {
			this.mutationObserver.disconnect();
		},

		enableMutationObserver: function() {
			this.mutationObserver.observe( this.root.view.getElement(), config );
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

		handleMutations: function( mutations ) {
			var that = this;

			function findParentView( element ) {
				var topEl = that.editable.$el.getElement();

				while ( element ) {
					// we've found a parent view
					if ( element.dataset && element.dataset.vid ) {
						return that.editable.getView( element.dataset.vid );
						// we reached the editable element
					} else if ( element === topEl ) {
						return null;
					}

					element = element.parentElement;
				}
			}

			var nodes = [];
			var elements = [];
			// nodes to be removed after applying the mutation's outcome
			var toRemove = [];

			// get the top-most affected node
			mutations.forEach( function( mutation ) {
				// try to find the node using the sibling first
				var target = mutation.target,
					node, view;

				// try identifying a node in the document tree using a view
				if ( target.dataset && target.dataset.vid ) {
					view = this.editable.getView( target.dataset.vid );

					if ( view ) {
						node = view.node;
					}

					// collet nodes created by CE to be removed later
					if ( mutation.type === 'childList' ) {
						[].forEach.call( mutation.addedNodes, function( addedNode ) {
							if ( toRemove.indexOf( addedNode ) === -1 ) {
								toRemove.push( addedNode );
							}
						} );

						[].forEach.call( mutation.removedNodes, function( removedNode ) {
							var idx;

							if ( ( idx = toRemove.indexOf( removedNode ) ) !== -1 ) {
								toRemove.splice( idx, 1 );
							}
						} );
					}
					//*/
				}

				// node's parent doesn't refer to any view, lets find the closest ancestor that has one
				if ( !node ) {
					view = findParentView( target );

					if ( view ) {
						node = view.node;
					}
				}

				// we found a node and it's not in the nodes array yet
				if ( node && nodes.indexOf( node ) === -1 ) {
					nodes.push( node );
					elements.push( node.view ? node.view.getElement() : target );
				}
			}, this );

			// go through all the nodes and check if they already have their ancestors in the array
			// in order to reduce the number of transactions
			// TODO maybe we could combine it with mutation processing to speed things up
			for ( var i = 0; i < nodes.length; i++ ) {
				var node = nodes[ i ];
				for ( var j = 0; j < nodes.length; j++ ) {
					if ( node && node.hasAncestor( nodes[ j ] ) ) {
						nodes.splice( i, 1 );
						elements.splice( i, 1 );
						i--;
					}
				}
			}

			// TODO save current selection

			// create and apply transactions to the document
			nodes.forEach( function( node, i ) {
				var transaction = Transaction.createFromNodeAndElement( this, node, elements[ i ] );

				transaction.applyTo( this );

				// store applied transactions only
				if ( transaction.applied ) {
					this.history.push( transaction );
				}
			}, this );

			// disable the mutation observer while manipulating "dirty" DOM elements
			this.disableMutationObserver();

			// clean up all unneeded nodes
			toRemove.forEach( function( node ) {
				if ( node.parentElement ) {
					node.parentElement.removeChild( node );
				}
			} );

			// re-enable the mutation observer
			this.enableMutationObserver();

			// TODO restore the selection

			// TODO this is just a temporary solution for development purposes
			this.trigger( 'change' );
		}
	} );

	return Document;
} );