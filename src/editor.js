define( [
	'editable',
	'tools/emitter',
	'tools/element',
	'tools/utils'
], function(
	Editable,
	Emitter,
	Element,
	utils
) {
	'use strict';

	function Editor( selector ) {
		this.$srcEl = new Element( document.querySelector( selector ) );

		this.editable = new Editable( this.$srcEl );

		// disable content editable and empty the source element
		this.$srcEl.attr( 'contentEditable', false );
		// this.$srcEl.html( '' );
		// this.$srcEl.append( this.editable.$el );
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );