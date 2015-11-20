'use strict';

/* global System */

export default function load( modulePath ) {
	return System
		.import( modulePath )
		.then( ( module ) => {
			return module;
		} );
}