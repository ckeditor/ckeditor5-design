/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const DocletLinter = require( '../../jsdoc/plugins/linter/docletlinter.js' );

describe( 'Linter plugin', () => {
	it( '_lintMembers()', () => {
		const linter = new DocletLinter( [ {
			kind: 'member',
			name: 'module:ckeditor5/wrong_path',
			scope: 'inner',
			meta: { fileName: '' },
		} ] );

		linter._lintMembers();

		expect( linter._errors.length ).to.be.equal( 1 );
	} );

	it( '_lintParams() 1', () => {
		const linter = new DocletLinter( [ {
			kind: 'function',
			params: [ {
				type: { parsedType: {
					name: 'module:ckeditor5/editor'
				} }
			} ],
			longname: 'abc',
			scope: 'inner',
			meta: { fileName: '' },
		} ] );

		linter._lintParams();

		expect( linter._errors.length ).to.be.equal( 1 );
	} );

	it( '_lintParams() 2', () => {
		const linter = new DocletLinter( [ {
			kind: 'class',
			params: [ {
				type: { parsedType: {
					name: 'module:ckeditor5/editor'
				} }
			} ],
		}, {
			kind: 'module',
			longname: 'module:ckeditor5/editor',
		} ] );

		linter._lintParams();

		expect( linter._errors.length ).to.be.equal( 0 );
	} );

	it( '_lintLinks()', () => {
		const linter = new DocletLinter( [ {
			comment:
				`* {@link module:ckeditor5/a~A#method1}
				 * {@link module:ckeditor5/b~Some1} `,
			meta: { fileName: '' },
		} ] );

		linter._lintLinks();

		expect( linter._errors.length ).to.be.equal( 2 );
	} );

	it( '_lintLinks() 2', () => {
		const linter = new DocletLinter( [ {
			comment:
				`/** Linking test:\n *\n * * a:\n *
				 * {@link module:ckeditor5/a~A} `,
		}, {
			comment: '',
			longname: 'module:ckeditor5/a~A',
		} ] );

		linter._lintLinks();

		expect( linter._errors.length ).to.be.equal( 0 );
	} );

	it( '_lintLinks() with link name', () => {
		const linter = new DocletLinter( [ {
			comment:
				` {@link module:ckeditor5/a~A classA} `,
		}, {
			comment: '',
			longname: 'module:ckeditor5/a~A',
		} ] );

		linter._lintLinks();

		expect( linter._errors.length ).to.be.equal( 0 );
	} );
} );
