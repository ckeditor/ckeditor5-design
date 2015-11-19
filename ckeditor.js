'use strict';

import Editor from 'ckeditor5-core/editor.js';
import proof from 'ckeditor5/proof.js';

proof( 'Calling from ckeditor.js' );

const CKEDITOR = {
	create: create
};

export function create( config ) {
	console.log( 'CKEDITOR.create()' );

	const editor = new Editor( config.features );

	return editor.init();
}

export default CKEDITOR;