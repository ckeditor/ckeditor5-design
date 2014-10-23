define( [
	'editor/editable',
	'core/mvc',
	'tools/element',
	'tools/utils'
], function(
	Editable,
	MVC,
	Element,
	utils
) {
	'use strict';

	function Editor( selector, options ) {
		MVC.Application.call( this, options );

		this.el = selector instanceof Element ?
			selector :
			new Element( selector );

		this.el.setStyle( 'visibility', 'hidden' );

		this.editable = new Editable( this.el, options );
	}

	utils.inherit( Editor, MVC.Application );

	return Editor;
} );