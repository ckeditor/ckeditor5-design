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
		if ( utils.isString( selector ) ) {
			
		}

		MVC.Application.call( this, options );
		this.editable = new Editable( options );
	}

	utils.inherit( Editor, MVC.Application );

	// custom implementation part
	utils.extend( Editor.prototype, {
		initialize: function( options ) {
			this.el = this.template( options );
		},

		template: function( options ) {
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