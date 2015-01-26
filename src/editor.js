define( [
	'editable',
	'converter',
	'tools/emitter',
	'tools/utils'
], function(
	Editable,
	converter,
	Emitter,
	utils
) {
	'use strict';

	function Editor( selector ) {
		this.el = document.querySelector( selector );
		this.editable = new Editable( this.el );
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );