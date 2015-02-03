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
		this.vid = utils.uid( 'view' );
		this.data( 'vid', this.vid );
	}

	utils.inherit( View, Element );

	utils.extend( View.prototype, Element.prototype, Emitter, {
		// TODO append/remove methods should emit some events
	} );

	return View;
} );