define( [
	'document',
	'definitions',
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
				currentView,
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

			// get the top-most affected node
			mutations.forEach( function( mutation ) {
				var type = mutation.type;

				var view = findParentView( mutation.target );

				if ( view ) {
					var offset = view.node.getOffset();

					// the model with the lowest offset would represent the top-most node in the modified node tree
					if ( offset < minOffset ) {
						currentView = view;
						minOffset = offset;
					}
				}
			} );

			console.log( currentView.node );
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );