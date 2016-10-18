/* jshint browser: false, node: true, strict: true */

'use strict';

/**
 * @param {...Function} functions
 */
function composeFunctions( ...fns ) {
	return ( result ) => {
		for ( const fn of fns.reverse() ) {
			result = fn( result );
		}

		return result;
	};
}

module.exports = composeFunctions;