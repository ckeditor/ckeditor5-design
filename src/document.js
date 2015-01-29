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

		var Data = converter.getDataForDom( doc.body, this.store );

		this.data = new LinearData( Data, this.store );
		this.tree = new DocumentTree( this.data );
	}

	utils.extend( Document.prototype, Emitter, {

	} );

	return Document;
} );