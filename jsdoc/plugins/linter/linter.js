/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const DocletLinter = require( './docletlinter' );

exports.handlers = {
	parseComplete( e ) {
		const linter = new DocletLinter( e.doclets );

		for ( const error of linter.findErrors() ) {
			console.error( error.message );
			console.error( `\tat ${ error.file } (line ${ error.line })` );
		}
	}
};
