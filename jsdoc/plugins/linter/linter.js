/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const config = require( './linter-config.json' );
const output = path.resolve( config.output );
const DocletLinter = require( './docletlinter' );

exports.handlers = {
	parseComplete( e ) {
		const linter = new DocletLinter( e.doclets );
		const errors = linter.findErrors();
		fs.writeFileSync( output, errors.join( '\n' ), 'utf-8' );

		if ( config.throwsOnError ) {
			throw new Error( errors[0] );
		}
	}
};
