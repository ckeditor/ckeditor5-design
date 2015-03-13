define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	var defaultConfig = {
		childList: true,
		attributes: true,
		characterData: true,
		subtree: true
	};

	function MutationObserver( target, handler, config ) {
		this.target = target;
		this.handler = handler;
		this.config = config || defaultConfig;
		this.mutationObserver = new window.MutationObserver( this.handler );
	}

	utils.extend( MutationObserver.prototype, {
		enable: function() {
			this.mutationObserver.observe( this.target, this.config );
		},

		disable: function() {
			this.mutationObserver.disconnect();
		}
	} );

	return MutationObserver;
} );