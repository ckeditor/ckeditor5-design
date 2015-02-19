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

		this.observer = new MutationObserver( this.handleMutation.bind( this ) );
		this.observer.observe( this.$documentView.getElement(), config );
	}

	utils.extend( Editable.prototype, Emitter, {
		addView: function( view ) {
			this._views[ view.vid ] = view;
		},

		getView: function( vid ) {
			return this._views[ vid ] || null;
		},

		handleMutation: function( mutations ) {
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

			// search siblings in order to find one that has a view
			// and can point to the node representing given element
			function findNodeBySibling( element ) {
				var dirs = [ 'nextSibling', 'previousSibling' ],
					dir = dirs.shift(),
					sibling = element[ dir ];

				while ( sibling || dirs.length ) {
					if ( !sibling ) {
						dir = dirs.shift();
						sibling = element;
					} else {
						if ( sibling.dataset && sibling.dataset.vid ) {
							var view = that.getView( sibling.dataset.vid );

							if ( view ) {
								return view.node[ dir === 'nextSibling' ? 'previousSibling' : 'nextSibling' ];
							}
						}
					}

					if ( dir ) {
						sibling = sibling[ dir ];
					}
				}

				return null;
			}

			var nodes = [];
			var elements = [];

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
				}

				// node doesn't have a view attached, try finding it using siblings
				if ( !node ) {
					node = findNodeBySibling( target );
				}

				// node doesn't have syblings, try identify it using its parent
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
			for ( var i = 0; i < nodes.length; i++ ) {
				var node = nodes[ i ];
				for ( var j = 0; j < nodes.length; j++ ) {
					if ( node.hasAncestor( nodes[ j ] ) ) {
						nodes.splice( i, 1 );
						elements.splice( i, 1 );
						i--;
					}
				}
			}

			console.log( nodes );

			nodes.forEach( function( node, i ) {
				var transaction = Transaction.createFromNodeAndElement( this.document, node, elements[ i ] );

				transaction.applyTo( this.document );

				this.history.push( transaction );
			}, this );


			// TODO this is just a temporary solution for development purposes
			this.trigger( 'change' );
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );