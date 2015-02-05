define( [
	'converter',
	'document',
	'definitions',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	Document,
	def,
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

		this.observer = new MutationObserver( this.handleMutation.bind( this ) );
		this.observer.observe( this.$documentView.getElement(), config );

		// this.$documentView.addListener( 'keydown', this.handleKeyDown.bind( this ) );
	}

	utils.extend( Editable.prototype, Emitter, {
		addView: function( view ) {
			this._views[ view.vid ] = view;
		},

		getView: function( vid ) {
			return this._views[ vid ] || null;
		},

		handleKeyDown: function( e ) {
			// we want to handle ENTER key ourselves
			switch ( e.keyCode ) {
				case def.KEY.ENTER:
					// TODO handle enter key
					break;
			}
		},

		handleMutation: function( mutations ) {
			var target,
				minOffset = Infinity,
				currentNode,
				currentElement,
				that = this;

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

			// get the top-most affected node
			mutations.forEach( function( mutation ) {
				// try to find the node using the sibling first
				var target = mutation.target,
					node, view;

				if ( target.dataset && target.dataset.vid ) {
					view = that.getView( target.dataset.vid );

					if ( view ) {
						node = view.node;
					}
				}

				if ( !node ) {
					node = findNodeBySibling( target );
				}

				if ( !node ) {
					view = findParentView( target );

					if ( view ) {
						node = view.node;
					}
				}

				if ( node ) {
					var offset = node.getOffset();

					// the node with the lowest offset would represent the top-most node in the modified node tree
					if ( offset < minOffset ) {
						currentNode = node;
						currentElement = node.view ? node.view.getElement() : target;
						minOffset = offset;
					}
				}
			} );

			var data = converter.getDataForDom( currentElement, this.document.store );

			console.log( currentElement );
			console.log( currentNode );
			console.log( data );
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );