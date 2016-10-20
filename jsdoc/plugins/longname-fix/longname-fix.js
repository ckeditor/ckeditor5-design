/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const formatLinks = require( './formatters/format-links' );
const formatInterfaces = require( './formatters/format-interfaces' );
const composeFunctions = require( '../utils/composefunctions' );

exports.handlers = {
	newDoclet( e ) {
		e.doclet = composeFunctions(
			formatInterfaces,
			formatLinks
		)( e.doclet );
	}
};
