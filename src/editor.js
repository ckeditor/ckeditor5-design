define( [
	'tools/emitter',
	'document',
	'editable',
	'tools/utils'
], function(
	Emitter,
	Document,
	Editable,
	utils
) {
	'use strict';

	function Editor( selector ) {
		this.el = document.querySelector( selector );
		this.document = new Document( this.el );
		this.editable = new Editable( this.document, this.el );
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );