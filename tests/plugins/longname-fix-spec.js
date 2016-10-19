/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const { formatLinks } = require( '../../jsdoc/plugins/longname-fix/formatters' );

describe( 'Long name fix plugin', () => {
	it( 'formatLinks()', () => {
		const doclet = formatLinks( {
			comment: 'Creates {@link ~EditorInterface} instance',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface} instance'
		);
	} );

	it( 'formatLinks() 2', () => {
		const doclet = formatLinks( {
			comment: 'Method {@link #create} creates instance',
			memberof: 'module:ckeditor5/editor/editorinterface~EditorInterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Method {@link module:ckeditor5/editor/editorinterface~EditorInterface#create} creates instance'
		);
	} );

	it( 'formatLinks() with link name', () => {
		const doclet = formatLinks( {
			comment: 'Creates {@link ~EditorInterface editor} instance with a given name.',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface editor} instance with a given name.'
		);
	} );

	it( 'formatLinks() with more complicated path', () => {
		const doclet = formatLinks( {
			comment: 'Method {@link ~EditorInterface#create create} creates Editor',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Method {@link module:ckeditor5/editor/editorinterface~EditorInterface#create create} creates Editor'
		);
	} );
} );