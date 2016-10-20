/* jshint browser: false, node: true, strict: true */

'use strict';

/**
 * @param {...Function} functions
 */
function composeFunctions( ...fns ) {
	return ( result ) => {
		for ( const fn of fns ) {
			result = fn( result );
		}

		return result;
	};
}

module.exports = composeFunctions;