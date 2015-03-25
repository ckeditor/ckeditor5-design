define( [
	'document',
	'mutationobserver',
	'selection',
	'transaction',
	'viewmanager',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
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

		// a reference to the owner document
		this.$document = $el.getElement().ownerDocument;

		// create a document for this editable area
		this.document = new Document( $el, this );

		this.$documentView = this.document.root.view;
		this.$documentView.appendTo( this.$el );

		// a store for applied transactions
		this.history = [];

		this.mutationObserver = new MutationObserver( this.$documentView.getElement() );
		this.mutationObserver.on( 'mutation', this.handleMutations, this );
		this.document.on( 'transaction:start', this.mutationObserver.disable, this.mutationObserver );
		this.document.on( 'transaction:end', this.mutationObserver.enable, this.mutationObserver );

		// start listening for DOM mutations
		this.mutationObserver.enable();

		this.selection = new Selection( this );
		this.selection.on( 'selection:change', function( selection ) {
			console.log( selection );
		} );
	}

	utils.extend( Editable.prototype, Emitter, {
		handleMutations: function( mutations ) {
			var that = this;

			var node, len, i;

			var nodes = [];
			var elements = [];
			var nodesToRemove = [];

			// disable the mutation observer while manipulating "dirty" DOM elements
			this.mutationObserver.disable();

			// pattern used to recognized ignored attribute changes
			var attrIgnorePattern = /^_moz_/i;

			// get the top-most affected node
			for ( i = 0, len = mutations.length; i < len; i++ ) {
				// rule #1 - always reset your variables...
				node = null;

				var mutation = mutations[ i ];
				var target = mutation.target,
					view;

				// ignore mutations caused by Firefox adding some attributes to elements
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

			// stop watching for selection changes
			this.selection.stopWatching();

			var historyItem = {
				previousSelection: this.selection.currentSelection,
				selection: null,
				transactions: []
			};

			// create and apply transactions to the document
			for ( i = 0, len = nodes.length; i < len; i++ ) {
				node = nodes[ i ];

				var transaction = Transaction.createFromNodeAndElement( this.document, node, elements[ i ] );

				transaction.applyTo( this.document );

				// store applied transactions only
				if ( transaction.applied ) {
					historyItem.transactions.push( transaction );
				}
			}

			// re-disable the mutation observer before removing unneeded DOM elements
			this.mutationObserver.disable();

			// clean up all unneeded nodes
			for ( i = 0, len = nodesToRemove.length; i < len; i++ ) {
				node = nodesToRemove[ i ];

				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}

			// enable the mutation observer
			this.mutationObserver.enable();

			historyItem.selection = '?';
			// TODO restore the selection

			this.history.push( historyItem );

			// re-enable the selection watcher in another tick - we don't want to trigger current changes
			setTimeout( function() {
				that.selection.startWatching();
			}, 0 );

			// TODO this is just a temporary solution for development purposes
			this.trigger( 'change' );

			function addRemove( addedNodes ) {
				for ( var i = 0, len = addedNodes.length; i < len; i++ ) {
					var addedNode = addedNodes[ i ];

					if ( nodesToRemove.indexOf( addedNode ) === -1 ) {
						nodesToRemove.push( addedNode );
					}
				}
			}

			function delRemove( removedNodes ) {
				var idx;

				for ( var i = 0, len = removedNodes.length; i < len; i++ ) {
					var removedNode = removedNodes[ i ];

					if ( ( idx = nodesToRemove.indexOf( removedNode ) ) !== -1 ) {
						nodesToRemove.splice( idx, 1 );
					}
				}
			}

			var topEl = this.$el.getElement();

			function findParentView( element ) {
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
		}
	} );

	return Editable;
} );