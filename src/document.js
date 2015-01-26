define( [
	'tools/emitter',
	'converter',
	'normalizer',
	'branch',
	'tools/utils'
], function(
	Emitter,
	converter,
	normalizer,
	Branch,
	utils
) {
	'use strict';

	function Document( el ) {
		normalizer.normalize( el );
		this.data = converter.getOperationsForDom( el );
		this.tree = null;
	}

	utils.extend( Document.prototype, Emitter, {

	} );

	return Document;
} );