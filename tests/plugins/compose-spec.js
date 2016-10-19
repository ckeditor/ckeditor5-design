/* jshint browser: false, node: true, strict: true, mocha: true */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const composeFunctions = require( '../../jsdoc/plugins/utils/composefunctions' );

describe( 'composeFunctions', () => {
	it( 'should compose functions', () => {
		const add1 = x => x + 1;
		const multiplyByTwo = x => x * 2;

		expect(
			composeFunctions(
				add1,
				multiplyByTwo
			)( 10 )
		).to.be.equal( 21 );
	} );
} );
