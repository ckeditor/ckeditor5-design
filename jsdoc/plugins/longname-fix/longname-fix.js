/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const { formatLinks, formatMembers } = require( './formatters' );
const composeFunctions = require( '../utils/composefunctions' );

exports.handlers = {
	newDoclet( e ) {
		e.doclet = composeFunctions(
			formatLinks,
			formatMembers
		)( e.doclet );
	}
};
