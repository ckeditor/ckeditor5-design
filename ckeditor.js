'use strict';

import Editor from 'ckeditor5-core/src/editor.js';
import proof from './src/proof.js';

proof();

const CKEDITOR = {
	create: create,

	checkCircularRef() {
		console.log( Editor.circularCKEDITORRef() );
	},

	toJSON() {
		return 'I am stringified CKEDITOR object';
	}
};

export function create( config ) {
	console.log( 'CKEDITOR.create()' );

	const editor = new Editor( config.features );

	return editor.init();
}

export default CKEDITOR;