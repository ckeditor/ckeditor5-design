define( [
	'tools/emitter',
	'converter',
	'type-manager',
	'normalizer',
	'branch',
	'tools/utils'
], function(
	Emitter,
	Converter,
	TypeManager,
	Normalizer,
	Branch,
	utils
) {
	'use strict';

	function Document( dom ) {
		this.dom = dom;

		this.normalizer = new Normalizer();
		this.normalizer.normalize( this.dom );

		this.typeManager = new TypeManager();
		this.typeManager.register( [
			'break', 'div', 'heading', 'image', 'list', 'listItem', 'paragraph',
			'span', 'text', 'unknown', 'bold', 'italic', 'underline'
		] );

		this.converter = new Converter( this.typeManager );

		this.ops = this.converter.getOperationsForDom( this.dom );
	}

	utils.extend( Document.prototype, Emitter, {

	} );

	return Document;
} );