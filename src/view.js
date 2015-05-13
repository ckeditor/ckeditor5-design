define( [
	'viewmanager',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	viewManager,
	Element,
	Emitter,
	utils
) {
	'use strict';

	// View binds element with node. This is in fact viewmodel in the terms of MVC*.
	function View( node, el ) {
		Element.call( this, el );

		this.node = node;
		this.vid = utils.uid( 'view' );
		this.data( 'vid', this.vid );

		viewManager.add( this );
	}

	utils.inherit( View, Element );

	utils.extend( View.prototype, Element.prototype, Emitter, {
		// TODO append/remove methods should emit some events
		destroy: function() {
			this.remove();
			viewManager.remove( this.vid );
		}
	} );

	return View;
} );