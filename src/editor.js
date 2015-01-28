define( [
	'editable',
	'tools/emitter',
	'tools/utils'
], function(
	Editable,
	Emitter,
	utils
) {
	'use strict';

	function Editor( selector ) {
		this.sourceElement = document.querySelector( selector );
		this.editable = new Editable( this.sourceElement );
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );