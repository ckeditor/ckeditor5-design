define( [
	'document',
	'definitions',
	'editablewatcher',
	'selection',
	'transaction',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	def,
	EditableWatcher,
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

		this.selection = new Selection();

		this.mutationObserver = new MutationObserver( this.handleMutations.bind( this ) );

		// start listening for DOM mutations
		this.enableMutationObserver();

		this.watcher = new EditableWatcher( this );
		this.watcher.on( 'selectionChange', this.updateSelection, this );
	}

	var config = {
		childList: true,
		attributes: true,
		characterData: true,
		subtree: true
	};

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

			var node, len, i;

			var nodes = [];
			var elements = [];
			// nodes to be removed after applying the mutation's outcome
			var toRemove = [];

			// disable the mutation observer while manipulating "dirty" DOM elements
			this.disableMutationObserver();

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

			// TODO save current selection
			var selection = this.$document.getSelection();
			// TODO temporarily force selection change trigger
			console.log( 'trigger' );
			this.watcher.trigger( 'selectionChange', selection );

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
			this.disableMutationObserver();

			// clean up all unneeded nodes
			for ( i = 0, len = toRemove.length; i < len; i++ ) {
				node = toRemove[ i ];

				if ( node.parentElement ) {
					node.parentElement.removeChild( node );
				}
			}

			// re-enable the mutation observer
			this.enableMutationObserver();

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

		updateSelection: function( selection ) {
			var range = selection && selection.rangeCount && selection.getRangeAt( 0 ) || null,
				topEl = this.$el.getElement(),
				that = this;

			// no range or outside of the editable area
			if ( !range || !hasAncestor( range.commonAncestorContainer, topEl ) ) {
				this.selection.empty();
				return;
			}

			var startOffset = getOffset( selection.anchorNode, selection.anchorOffset ),
				endOffset;

			if ( !selection.isCollapsed ) {
				endOffset = getOffset( selection.focusNode, selection.focusOffset );
			}

			var node = this.document.getNodeAtPosition( startOffset );

			this.selection.update( startOffset, endOffset, node );

			console.log( 'sel', this.selection.range );

			// TODO exclude internal elements from the offset calculation
			// calculates the offset in the linear data
			function getOffset( element, offset ) {
				var length = 0,
					view, node, searchElem;

				// validate the offset first
				if (
					offset < 0 ||
					offset > ( element.nodeType === Node.ELEMENT_NODE ? element.childNodes.length : element.data.length )
				) {
					throw new Error( 'Invalid offset.' );
				}

				if ( element.nodeType === Node.ELEMENT_NODE ) {
					// the selection is at the beginning or end of the element
					if ( element.childNodes.length === 0 || element.childNodes.length === offset ) {
						// the element has a view so we can easily get its offset in the linear data
						if ( ( view = getView( element ) ) ) {
							node = view.node;

							// node's offset +
							// node's length if we're looking for the node's closing element
							// or + 1 for the opening element
							return node.getOffset() + ( offset ? node.length : 1 );
						}

						searchElem = element;

						// we'll try to get the offset using the element last child's offset (or its descendant's offset)
						if ( offset ) {
							while ( searchElem.lastChild ) {
								searchElem = searchElem.lastChild;

								if ( ( view = getView( searchElem ) ) ) {
									node = view.node;

									// node's offset + length to get the closing element's offset
									return node.getOffset() + node.length;
								}
							}
						}
					} else {
						searchElem = element.childNodes[ offset ];
						element = searchPrecedingElem( searchElem );
					}
				} else {
					// include the offset within a text node
					length += offset;

					searchElem = element;
					element = searchPrecedingElem( element );
				}

				// find the closest referring to a view
				while ( !( view = getView( element ) ) ) {
					// include the element's length in the final offset
					if ( element.nodeType === Node.TEXT_NODE ) {
						length += element.data.length;
					}

					element = searchPrecedingElem( element );
				}

				node = view.node;

				// include the element's length or + 1 opening element if needed
				length += hasAncestor( searchElem, element ) ? 1 : node.length;

				// compute the final offset
				offset = node.getOffset() + length;

				return offset;
			}

			// finds the closest preceding element that has a view attached to it
			function searchPrecedingElem( element ) {
				// use the parent if there's no previous sibling
				while ( !element.previousSibling ) {
					element = element.parentElement;

					if ( !element ) {
						throw new Error( 'Element doesn\'t have a parent with a view attached to it.' );
					}

					// we may use the parent since it has a view
					if ( getView( element ) ) {
						return element;
					}
				}

				element = element.previousSibling;

				// we may use the sibling
				if ( getView( element ) ) {
					return element;
				}

				while ( element.lastChild ) {
					element = element.lastChild;
					// we may use the sibling's descendant
					if ( getView( element ) ) {
						return element;
					}
				}

				return element;
			}

			// checks if the given element has the given ancestor
			function hasAncestor( elem, ancestor ) {
				var parent;

				while ( ( parent = elem.parentElement ) ) {
					if ( parent === ancestor ) {
						return true;
					}

					elem = parent;
				}

				return false;
			}

			// get the element's view, if any
			function getView( element ) {
				return element.dataset && element.dataset.vid && that.getView( element.dataset.vid );
			}
		}
	} );

	return Editable;
} );