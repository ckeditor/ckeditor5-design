'use strict';

const execSh = require( 'exec-sh' );

process.on( 'message', ( data ) => {
	console.log( 'Starting processing: ', data );

	execSh( 'git st && sleep ' + Math.random(), true, ( err, stdout, stderr ) => {
		console.log( 'Finished processing: ', data );

		console.log( 'error: ', err );
		console.log( 'stdout: ', stdout );
		console.log( 'stderr: ', stderr );

		process.send( [] );
	} );
} );
