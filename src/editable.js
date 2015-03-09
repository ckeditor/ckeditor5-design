define( [
	'document',
	'definitions',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	def,
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

		// start listening for DOM mutations
		this.document.enableMutationObserver();
	}

	utils.extend( Editable.prototype, Emitter, {
		addView: function( view ) {
			this._views[ view.vid ] = view;
		},

		getView: function( vid ) {
			return this._views[ vid ] || null;
		},

		removeView: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return Editable;
} );