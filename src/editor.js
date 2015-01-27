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
		this.sourceElement = document.querySelector( selector );
		this.editable = new Editable( this.sourceElement );
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );