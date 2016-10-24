/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const formatLinks = require( '../../jsdoc/plugins/longname-fix/formatters/format-links' );

/** Helper function that provides easier test */
function formatLinksInDoclet( doclet ) {
	const result = formatLinks( { doclet } );

	return result.doclet;
}

describe( 'Long name fix plugin - formatLinks()', () => {
	it( 'formatLinks()', () => {
		const doclet = formatLinksInDoclet( {
			comment: 'Creates {@link ~EditorInterface} instance',
			description: '<p>Creates {@link ~EditorInterface} instance</p>',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface} instance'
		);
		expect( doclet.description ).to.be.equal(
			'<p>Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface} instance</p>'
		);
	} );

	it( 'formatLinks() hash', () => {
		const doclet = formatLinksInDoclet( {
			comment: 'Method {@link #create} creates instance',
			memberof: 'module:ckeditor5/editor/editorinterface~EditorInterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Method {@link module:ckeditor5/editor/editorinterface~EditorInterface#create} creates instance'
		);
	} );

	it( 'formatLinks() with link name', () => {
		const doclet = formatLinksInDoclet( {
			comment: 'Creates {@link ~EditorInterface editor} instance with a given name.',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Creates {@link module:ckeditor5/editor/editorinterface~EditorInterface editor} instance with a given name.'
		);
	} );

	it( 'formatLinks() with more complicated path', () => {
		const doclet = formatLinksInDoclet( {
			comment: 'Method {@link ~EditorInterface#create create} creates Editor',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'Method {@link module:ckeditor5/editor/editorinterface~EditorInterface#create create} creates Editor'
		);
	} );

	it( 'formatLinks() in description', () => {
		const doclet = formatLinksInDoclet( {
			comment: '',
			description: 'You can later destroy it with {@link ~EditorInterface#destroy}',
			memberof: 'module:ckeditor5/editor/editorinterface',
		} );

		expect( doclet.description ).to.be.equal(
			'You can later destroy it with {@link module:ckeditor5/editor/editorinterface~EditorInterface#destroy}'
		);
	} );

	it( 'formatLinks() multiple links', () => {
		const doclet = formatLinksInDoclet( {
			comment: '{@link #destroy} {@link #destroy}',
			memberof: 'module:editor/editorinterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'{@link module:editor/editorinterface#destroy} {@link module:editor/editorinterface#destroy}'
		);
	} );

	it( 'formatLinks() link to parent: class / interface', () => {
		const doclet = formatLinksInDoclet( {
			comment: '{@link ~EditorInterface}',
			memberof: 'module:editor/editorinterface~EditorInterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'{@link module:editor/editorinterface~EditorInterface}'
		);
	} );

	it( 'formatLinks() link to parent: class / interface 2', () => {
		const doclet = formatLinksInDoclet( {
			comment: '{@link ~EditorInterface editor}',
			memberof: 'module:editor/editorinterface~EditorInterface',
		} );

		expect( doclet.comment ).to.be.equal(
			'{@link module:editor/editorinterface~EditorInterface editor}'
		);
	} );
} );