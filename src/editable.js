define( [
	'document',
	'definitions',
	'editablewatcher',
	'mutationobserver',
	'selection',
	'transaction',
	'viewmanager',
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
	viewManager,
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

		// create a document for this editable area
		this.document = new Document( $el, this );

		this.$documentView = this.document.root.view;
		this.$documentView.appendTo( this.$el );

		// a store for applied transactions
		this.history = [];

		// linear data selection
		this.dataSelection = new Selection( this.document );

		// native selection
		this.selection = window.getSelection();

		this.mutationObserver = new MutationObserver( this.$documentView.getElement(), this.handleMutations.bind( this ) );

		// start listening for DOM mutations
		this.mutationObserver.enable();

		this.watcher = new EditableWatcher( this );
		this.watcher.on( 'selectionChange', this.updateSelection, this );
		this.watcher.enable();
	}

	utils.extend( Editable.prototype, Emitter, {
		handleMutations: function( mutations ) {
			var that = this;

			var node, len, i;

			var nodes = [];
			var elements = [];
			// nodes to be removed after applying the mutation's outcome
			var toRemove = [];

			// disable the mutation observer while manipulating "dirty" DOM elements
			this.mutationObserver.disable();
			// pattern used to recognized ignored attribute changes
			var attrIgnorePattern = /^_moz_/i;

			// get the top-most affected node
			for ( i = 0, len = mutations.length; i < len; i++ ) {
				var mutation = mutations[ i ];
				// try to find the node using the sibling first
				var target = mutation.target,
					view;

				// ignore mutations caused by Firefox adding some attributes
				if ( mutation.type === 'attributes' && attrIgnorePattern.test( mutation.attributeName ) ) {
					continue;
				}

				// try identifying a node in the document tree using a view
				if ( target.dataset && target.dataset.vid ) {
					view = viewManager.get( target.dataset.vid );

					if ( view ) {
						node = view.node;
					}

					if ( !node || node.type !== 'root' ) {
						target.dataset.affected = node.type;
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
			this.watcher.disable();

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

				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}

			// re-enable the mutation observer
			this.mutationObserver.enable();

			// TODO restore the selection

			// re-enable the watcher in another tick - we don't want to trigger current changes
			setTimeout( function() {
				that.watcher.enable();
				// that.watcher.checkSelectionChange();
			}, 0 );

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
						return viewManager.get( element.dataset.vid );
						// we reached the editable element
					} else if ( element === topEl ) {
						return null;
					}

					element = element.parentNode;
				}
			}
		},

		updateSelection: function( range ) {
			this.dataSelection.update( range );

			console.log( this.dataSelection.range );

			// this.selection.removeAllRanges();

			if ( this.dataSelection.type === Selection.EMPTY ) {
				return;
			}

			var nativeRange = this.selection.getRangeAt( 0 );


			var newRange = this.$document.createRange();

			var start = this.document.getDomNodeAndOffset(
				this.dataSelection.range.start,
				this.dataSelection.range.startAttributes
			);

			if ( start ) {
				console.log( 'start', start.node, start.offset );
			}

			if ( !start || nativeRange.startContainer !== start.node || nativeRange.startOffset !== start.offset ) {
				console.warn( 'wrong - native start', nativeRange.startContainer, nativeRange.startOffset );
			}

			// newRange.setStart( start.node, start.offset );

			if ( this.dataSelection.type === Selection.RANGE ) {
				var end = this.document.getDomNodeAndOffset(
					this.dataSelection.range.end,
					this.dataSelection.range.endAttributes
				);

				if ( end ) {
					console.log( 'end', end.node, end.offset );
				}

				if ( !end || nativeRange.endContainer !== end.node || nativeRange.endOffset !== end.offset ) {
					console.warn( 'wrong - native end', nativeRange.endContainer, nativeRange.endOffset );
				}

				// newRange.setEnd( end.node, end.offset );
			}

			// this.selection.addRange( newRange );

		}
	} );

	return Editable;
} );