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
		characterDataOldValue: true,
		subtree: true
	};

	function MutationObserver( target, config ) {
		this.target = target;
		this.config = config || defaultConfig;
		this.mutationObserver = new window.MutationObserver( this.onMutations.bind( this ) );
	}

	utils.extend( MutationObserver.prototype, Emitter, {
		enable: function() {
			this.mutationObserver.observe( this.target, this.config );
		},

		disable: function() {
			this.mutationObserver.disconnect();
		},

		onMutations: function( mutations ) {
			var contentOnly = mutations.every( function( mutation ) {
				return mutation.type === 'characterData';
			} );

			this.trigger( 'mutation:' + ( contentOnly ? 'content' : 'childlist' ), mutations );
		}
	} );

	return MutationObserver;
} );