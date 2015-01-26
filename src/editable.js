define( [
	'document',
	'mutationSummary',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	MutationSummary,
	Emitter,
	utils
) {
	'use strict';

	var config = {
		childList: true,
		subtree: true,
		characterData: true,
		characterDataOldValue: true,
		attributes: true,
		attributeOldValue: true
	};

	function Editable( el ) {
		this.el = el;

		this.document = new Document( el );

		this.observer = new MutationSummary( {
			callback: this.mutationHandler.bind( this ),
			queries: [ {
				all: true
			} ],
			rootNode: this.el
		} );
	}

	utils.extend( Editable.prototype, Emitter, {
		mutationHandler: function( summaries ) {
			console.log( summaries.length );
			summaries.forEach( function( summary ) {
				console.log( summary );
			} );
		}
	} );

	return Editable;
} );