'use strict';

/* global require */

export default function load( modulePath ) {
	return new Promise( ( resolve ) => {
		resolve( require( modulePath ) );
	} );
}