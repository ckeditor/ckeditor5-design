define( [
	'tools/emitter',
	'converter',
	'normalizer',
	'documenttree',
	'lineardata',
	'store',
	'tools/utils'
], function(
	Emitter,
	converter,
	normalizer,
	DocumentTree,
	LinearData,
	Store,
	utils
) {
	'use strict';

	function Document( el ) {
		var doc = converter.createDocumentFromHTML( el.innerHTML );

		normalizer.normalize( doc.body );

		this.store = new Store();

		this.data = new LinearData( converter.getOperationsForDom( doc.body, this.store ), this.store );
		this.tree = new DocumentTree( this.data );
	}

	utils.extend( Document.prototype, Emitter, {

	} );

	return Document;
} );