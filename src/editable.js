define( [
	'document',
	'definitions',
	'transaction',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	def,
	Transaction,
	Element,
	Emitter,
	utils
) {
	'use strict';

	var config = {
		childList: true,
		attributes: true,
		characterData: true,
		subtree: true
	};

	function Editable( $el ) {
		// create an element for the editable area
		this.$el = Element.create( 'div' );
		this.$el.addClass( 'cke-editable' );

		this._views = {};

		// create a document for this editable area
		this.document = new Document( $el, this );

		this.$documentView = this.document.root.view;
		this.$documentView.appendTo( this.$el );
		this.$documentView.attr( 'contenteditable', true );

		// a store for applied transactions
		this.history = [];

		this.mutationObserver = new MutationObserver( this.handleMutations.bind( this ) );

		this.enableMutationObserver();
	}

	utils.extend( Editable.prototype, Emitter, {
		addView: function( view ) {
			this._views[ view.vid ] = view;
		},

		disableMutationObserver: function() {
			this.mutationObserver.disconnect();
		},

		enableMutationObserver: function() {
			this.mutationObserver.observe( this.$documentView.getElement(), config );
		},

		getView: function( vid ) {
			return this._views[ vid ] || null;
		},

		handleMutations: function( mutations ) {
			var that = this;

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
					view = that.getView( target.dataset.vid );

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
			} );

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
				var transaction = Transaction.createFromNodeAndElement( this.document, node, elements[ i ] );

				transaction.applyTo( this.document );

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
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );