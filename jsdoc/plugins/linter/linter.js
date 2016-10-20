/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const DocletLinter = require( './docletlinter' );

exports.handlers = {
	parseComplete( e ) {
		const linter = new DocletLinter( e.doclets );

		linter.findErrors()
			.forEach( error => console.error( error ) );
	}
};
