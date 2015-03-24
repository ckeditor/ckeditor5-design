define( [
	'tools/emitter',
	'tools/utils'
], function(
	Emitter,
	utils
) {
	'use strict';

	var defaultConfig = {
		childList: true,
		attributes: true,
		characterData: true,
		subtree: true
	};

	function MutationObserver( target, config ) {
		this.target = target;
		this.config = config || defaultConfig;
		this.mutationObserver = new window.MutationObserver( this.handleMutations.bind( this ) );
	}

	utils.extend( MutationObserver.prototype, Emitter, {
		enable: function() {
			this.mutationObserver.observe( this.target, this.config );
		},

		disable: function() {
			this.mutationObserver.disconnect();
		},

		handleMutations: function( mutations ) {
			this.trigger( 'mutation', mutations );
		}
	} );

	return MutationObserver;
} );