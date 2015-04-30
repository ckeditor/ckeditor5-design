define( [
	'tools/emitter',
	'tools/utils'
], function(
	Emitter,
	utils
) {
	'use strict';

	function MutationObserver( target, config ) {
		this.target = target;
		this.config = config || MutationObserver.defaultConfig;
		this.mutationObserver = new window.MutationObserver( this.onMutations.bind( this ) );
	}

	MutationObserver.defaultConfig = {
		childList: true,
		attributes: true,
		characterData: true,
		characterDataOldValue: true,
		subtree: true
	};

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

			this.trigger( 'mutation', mutations );
			this.trigger( 'mutation:' + ( contentOnly ? 'content' : 'childlist' ), mutations );
		}
	} );

	return MutationObserver;
} );