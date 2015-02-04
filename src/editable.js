define( [
	'document',
	'definitions',
	'mutationSummary',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	def,
	MutationSummary,
	Element,
	Emitter,
	utils
) {
	'use strict';

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

		// attach the mutation observer
		this.observer = new MutationSummary( {
			callback: this.handleMutation.bind( this ),
			queries: [ {
				characterData: true
			} ],
			rootNode: this.$documentView.getElement()
		} );

		this.$documentView.addListener( 'keydown', this.handleKeyDown.bind( this ) );
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
					e.preventDefault();

					// TODO handle enter key
					break;
			}
		},

		handleMutation: function( summaries ) {
			var summary = summaries[ 0 ],
				that = this;

			Object.keys( summary ).forEach( function( type ) {
				var nodes = summary[ type ];

				// ignore empty summaries
				if ( !nodes || !nodes.length ) {
					return;
				}

				nodes.forEach( function( node ) {
					if ( type === 'added' ) {
						handleAdd( node );
					}

					if ( type === 'removed' ) {
						handleRemove( node );
					}

					if ( type === 'valueChanged' ) {
						handleChange( node );
					}
				} );
			} );

			function handleAdd( node ) {
				console.log( 'add', node );
			}

			function handleRemove( node ) {
				console.log( 'remove', node );
				var parent = summary.getOldParentNode( node ),
					oldText;

				try {
					oldText = summary.getOldCharacterData( node );
				} catch ( e ) {
					console.log( e );
				}

				console.log( 'remove', parent, oldText );
			}

			function handleChange( node ) {
				var oldText = summary.getOldCharacterData( node );

				console.log( 'change', oldText );
				console.dir( node );

				var parentView = findParentView( node );

				console.log( 'parent', parentView );
			}

			function findParentView( node ) {
				var topEl = that.$el.getElement(),
					parent;

				while ( ( parent = node.parentElement ) ) {
					// we've found a parent view
					if ( parent.dataset.vid ) {
						return that.getView( parent.dataset.vid );
						// we reached the editable element
					} else if ( parent === topEl ) {
						return null;
					}

					node = parent;
				}
			}
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );