/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const { formatLinks } = require( '../../jsdoc/plugins/formatters' );

describe( 'Long name fix plugin', () => {
	it( 'formatLinks()', () => {
		const doclet = formatLinks( {
			comment: '<p>Creates {@link ~EditorInterface} instance',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'<p>Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface} instance'
		);
	} );

	it( 'formatLinks() 2', () => {
		const doclet = formatLinks( {
			comment: '<p>Method {@link #create} creates instance',
			memberof: 'module:ckeditor5/editor/editorinterface~EditorInterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'<p>Method {@link module:ckeditor5/editor/editorinterface~EditorInterface#create} creates instance'
		);
	} );

	it( 'formatLinks() with link description', () => {
		const doclet = formatLinks( {
			comment: '"/**\n * Creates {@link ~EditorInterface editor} instance with a given name.',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'"/**\n * Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface editor} instance with a given name.'
		);
	} );
} );