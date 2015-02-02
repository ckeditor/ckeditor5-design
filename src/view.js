define( [
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Element,
	Emitter,
	utils
) {
	'use strict';

	function View( node, el ) {
		Element.call( this, el );
		this.node = node;
	}

	utils.inherit( View, Element );

	utils.extend( View.prototype, Element.prototype, {

	} );

	return View;
} );