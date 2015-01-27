define( [
	'tools/emitter',
	'converter',
	'normalizer',
	'documenttree',
	'lineardata',
	'branch',
	'tools/utils'
], function(
	Emitter,
	converter,
	normalizer,
	DocumentTree,
	LinearData,
	Branch,
	utils
) {
	'use strict';

	function Document( el ) {
		var doc = converter.createDocumentFromHTML( el.innerHTML );

		normalizer.normalize( doc.body );

		this.data = new LinearData( converter.getOperationsForDom( doc.body ) );
		this.tree = new DocumentTree( this.data );
	}

	utils.extend( Document.prototype, Emitter, {

	} );

	return Document;
} );