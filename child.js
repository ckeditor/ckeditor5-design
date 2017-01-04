'use strict';

const execSh = require( 'exec-sh' );
const randomId = require( './randomid' );

process.on( 'message', ( data ) => {
	console.log( 'Starting processing: ', data );

	execSh( 'sleep ' + Math.random(), ( err, stdout, stderr ) => {
		const requires = [];
		let i = Math.random() * 3;

		while ( --i > 0 ) {
			requires.push( randomId() );
		}

		console.log( 'Finished processing: ', data );
		console.log( 'Requires: ', requires );

		process.send( requires );

		// console.log( 'error: ', err );
		// console.log( 'stdout: ', stdout );
		// console.log( 'stderr: ', stderr );
	} );
} );
