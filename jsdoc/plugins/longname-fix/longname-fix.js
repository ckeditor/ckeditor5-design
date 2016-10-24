/* jshint browser: false, node: true, strict: true */

/**
 * @see http://usejsdoc.org/about-plugins.html
 */

'use strict';

const formatLinks = require( './formatters/format-links' );
const formatInterfacesAndClasses = require( './formatters/format-interfaces-and-classes' );
const composeFunctions = require( '../utils/composefunctions' );

let config = {};

function setNewDoclet( doclet ) {
	return ( config ) => {
		return Object.assign( {}, config, { doclet } );
	};
}

exports.handlers = {
	newDoclet( e ) {
		config = composeFunctions(
			setNewDoclet( e.doclet ),
			formatInterfacesAndClasses,
			formatLinks
		)( config );

		e.doclet = config.doclet;
	}
};
