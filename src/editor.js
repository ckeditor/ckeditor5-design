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
		this.sourceElement = document.querySelector( selector );
		this.$sourceElement = new Element( this.sourceElement );

		this.editable = new Editable( this.sourceElement );

		this.$sourceElement.html('');
	}

	utils.extend( Editor.prototype, Emitter, {} );

	return Editor;

} );