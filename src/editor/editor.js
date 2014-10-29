define( [
	'editor/editable',
	'core/mvc',
	'tools/element',
	'tools/dombuilder',
	'tools/utils'
], function(
	Editable,
	MVC,
	Element,
	_,
	utils
) {
	'use strict';

	function Editor( selector, options ) {
		var src;

		if ( utils.isString( selector ) ) {
			src = new Element( selector );
		} else if ( utils.isObject( selector ) ) {
			options = selector;
		}

		options = options || {};

		if ( src ) {
			options.src = src;
		}

		MVC.Application.call( this, options );
		this.editable = new Editable( options );
	}

	utils.inherit( Editor, MVC.Application );

	utils.extend( Editor.prototype, {
		create: function() {
			this.trigger( 'before:create', this );

			if ( this.src ) {
				this.src
					.setStyle( 'visibility', 'hidden' )
					.insertAfter( this.el );
			}

			this.trigger( 'create', this );

			return this;
		},

		initialize: function( options ) {
			this.el = this.template();
			this.$el = new Element( this.el );

			this
				.addSpace( 'header', this.$el.findOne( '.header' ) )
				.addSpace( 'content', this.$el.findOne( '.content' ) )
				.addSpace( 'footer', this.$el.findOne( '.footer' ) );
		},

		template: function() {
			return _( 'div', [
				_( 'div', {
					className: 'header'
				} ),
				_( 'div', {
					className: 'content'
				} ),
				_( 'div', {
					className: 'footer'
				} )
			] );
		}
	} );

	return Editor;
} );