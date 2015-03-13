define( [
	'document',
	'definitions',
	'editablewatcher',
	'mutationobserver',
	'selection',
	'transaction',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	def,
	EditableWatcher,
	MutationObserver,
	Selection,
	Transaction,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Editable( $el ) {
		// create an element for the editable area
		this.$el = Element.create( 'div' );
		this.$el.addClass( 'cke-editable' );
		this.$el.attr( 'contenteditable', true );

		this.$document = $el.getElement().ownerDocument;

		this._views = {};

		// create a document for this editable area
		this.document = new Document( $el, this );

		this.$documentView = this.document.root.view;
		this.$documentView.appendTo( this.$el );

		// a store for applied transactions
		this.history = [];

		this.selection = new Selection( this.document );

		this.mutationObserver = new MutationObserver( this.$documentView.getElement(), this.handleMutations.bind( this ) );

		// start listening for DOM mutations
		this.mutationObserver.enable();

		this.watcher = new EditableWatcher( this );
		this.watcher.on( 'selectionChange', this.updateSelection, this );
	}

	utils.extend( Editable.prototype, Emitter, {
		addView: function( view ) {
			this._views[ view.vid ] = view;
		},

		getView: function( vid ) {
			return this._views[ vid ] || null;
		},

		handleMutations: function( mutations ) {
			var that = this;

			var node, len, i;

			var nodes = [];
			var elements = [];
			// nodes to be removed after applying the mutation's outcome
			var toRemove = [];

			// disable the mutation observer while manipulating "dirty" DOM elements
			this.mutationObserver.disable();

			// get the top-most affected node
			for ( i = 0, len = mutations.length; i < len; i++ ) {
				var mutation = mutations[ i ];
				// try to find the node using the sibling first
				var target = mutation.target,
					view;

				// try identifying a node in the document tree using a view
				if ( target.dataset && target.dataset.vid ) {
					view = this.getView( target.dataset.vid );

					if ( view ) {
						node = view.node;
					}

					if ( !node || node.type !== 'root' ) {
						delete target.dataset.vid;
					}

					// collect nodes created by contenteditable to be removed later
					if ( mutation.type === 'childList' ) {
						addRemove( mutation.addedNodes );
						delRemove( mutation.removedNodes );
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
			}

			// go through all the nodes and check if they already have their ancestors in the array
			// in order to reduce the number of transactions
			// TODO maybe we could combine it with mutation processing to speed things up
			for ( i = 0; i < nodes.length; i++ ) {
				node = nodes[ i ];
				for ( var j = 0; j < nodes.length; j++ ) {
					if ( node && node.hasAncestor( nodes[ j ] ) ) {
						nodes.splice( i, 1 );
						elements.splice( i, 1 );
						i--;
					}
				}
			}

			// force selection change check
			this.watcher.checkSelectionChange();

			// TODO merge transactions (?)
			// create and apply transactions to the document
			for ( i = 0, len = nodes.length; i < len; i++ ) {
				node = nodes[ i ];

				var transaction = Transaction.createFromNodeAndElement( this.document, node, elements[ i ] );

				transaction.applyTo( this.document );

				// store applied transactions only
				if ( transaction.applied ) {
					this.history.push( transaction );
				}
			}

			// disable the mutation observer again before removing unneeded DOM elements
			this.mutationObserver.disable();

			// clean up all unneeded nodes
			for ( i = 0, len = toRemove.length; i < len; i++ ) {
				node = toRemove[ i ];

				if ( node.parentElement ) {
					node.parentElement.removeChild( node );
				}
			}

			// re-enable the mutation observer
			this.mutationObserver.enable();

			// TODO restore the selection

			// TODO this is just a temporary solution for development purposes
			this.trigger( 'change' );

			function addRemove( addedNodes ) {
				for ( var i = 0, len = addedNodes.length; i < len; i++ ) {
					var addedNode = addedNodes[ i ];

					if ( toRemove.indexOf( addedNode ) === -1 ) {
						toRemove.push( addedNode );
					}
				}
			}

			function delRemove( removedNodes ) {
				var idx;

				for ( var i = 0, len = removedNodes.length; i < len; i++ ) {
					var removedNode = removedNodes[ i ];

					if ( ( idx = toRemove.indexOf( removedNode ) ) !== -1 ) {
						toRemove.splice( idx, 1 );
					}
				}
			}

			function findParentView( element ) {
				var topEl = that.$el.getElement();

				while ( element ) {
					// we've found a parent view
					if ( element.dataset && element.dataset.vid ) {
						return that.getView( element.dataset.vid );
						// we reached the editable element
					} else if ( element === topEl ) {
						return null;
					}

					element = element.parentElement;
				}
			}
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		},

		updateSelection: function( range ) {
			this.selection.update( range );
			console.log( this.selection.range );
		}
	} );

	return Editable;
} );