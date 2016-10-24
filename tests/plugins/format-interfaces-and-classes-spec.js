/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const formatInterfaces = require( '../../jsdoc/plugins/longname-fix/formatters/format-interfaces-and-classes' );

describe( 'Long name fix plugin - formatInterfaces()', () => {
	it( 'remember last interface', () => {
		let result = formatInterfaces( {
			doclet: {
				kind: 'interface',
				memberof: 'editor/editorinterface',
				longname: 'editor/editorinterface~EditorInterface',
				name: 'EditorInterface',
				meta: {
					path: 'editor/',
					filename: 'interface.js'
				}
			}
		} );

		expect( result.lastInterfaceOrClass.name, 'EditorInterface' );
	} );

	it( 'fix interface method ', () => {
		let result = formatInterfaces( {
			lastInterfaceOrClass: {
				kind: 'interface',
				memberof: 'editor/editorinterface',
				longname: 'editor/editorinterface~EditorInterface',
				name: 'EditorInterface',
				meta: {
					path: 'editor/',
					filename: 'interface.js'
				}
			},
			doclet: {
				kind: 'method',
				meta: {
					path: 'editor/',
					filename: 'interface.js'
				},
				longname: '#destroy',
				name: 'destroy',
			}
		} );

		expect( result.doclet.memberof ).to.be.equal( 'editor/editorinterface~EditorInterface' );
		expect( result.doclet.longname ).to.be.equal( 'editor/editorinterface~EditorInterface#destroy' );
	} );

	it( 'do not fix interface method ', () => {
		let result = formatInterfaces( {
			lastInterfaceOrClass: {
				kind: 'interface',
				memberof: 'module:editor/editorinterface',
				longname: 'module:editor/editorinterface~EditorInterface',
				name: 'EditorInterface',
				meta: {
					path: '/',
					filename: 'interface.js'
				}
			},
			doclet: {
				kind: 'method',
				meta: {
					path: '/',
					filename: 'interface.js'
				},
				longname: 'module:someModule~SomeOtherClass#destroy',
				memberof: 'module:someModule~SomeOtherClass',
				name: 'destroy',
			},
		} );

		expect( result.doclet.memberof ).to.be.equal( 'module:someModule~SomeOtherClass' );
		expect( result.doclet.longname ).to.be.equal( 'module:someModule~SomeOtherClass#destroy' );
	} );

	it( 'fix class member with ~ reference', () => {
		let result = formatInterfaces( {
			lastInterfaceOrClass: {
				kind: 'class',
				memberof: 'module:editor',
				longname: 'module:editor~Editor',
				name: 'Editor',
				meta: {
					path: '/',
					filename: 'editor.js'
				}
			},
			doclet: {
				kind: 'member',
				meta: {
					path: '/',
					filename: 'editor.js'
				},
				longname: '~Editor#name',
				name: 'name',
			},
		} );

		expect( result.doclet.longname ).to.be.equal( 'module:editor~Editor#name' );
		expect( result.doclet.memberof ).to.be.equal( 'module:editor~Editor' );
	} );

	it( 'fix class member with # reference', () => {
		let result = formatInterfaces( {
			lastInterfaceOrClass: {
				kind: 'class',
				memberof: 'module:editor',
				longname: 'module:editor~Editor',
				name: 'Editor',
				meta: {
					path: '/',
					filename: 'editor.js'
				}
			},
			doclet: {
				kind: 'member',
				meta: {
					path: '/',
					filename: 'editor.js'
				},
				longname: '#name',
				name: 'name',
			},
		} );

		expect( result.doclet.longname ).to.be.equal( 'module:editor~Editor#name' );
		expect( result.doclet.memberof ).to.be.equal( 'module:editor~Editor' );
	} );
} );