'use strict';

const randomId = require( './randomid' );
const createForkPool = require( './createforkpool' );

const ids = [];
const forkPool = createForkPool( process.argv[ 2 ] || 'child' );

console.time( 'Processing time:' );

enqueue( randomId() );
enqueue( randomId() );
enqueue( randomId() );

function enqueue( id ) {
	if ( ids.includes( id ) ) {
		return;
	}

	ids.push( id );

	forkPool.enqueue( id )
		.then( ( requiredIds ) => {
			requiredIds.forEach( enqueue );

			if ( forkPool.isDone ) {
				return onDone();
			}
		} )
		.catch( ( err ) => {
			console.error( err );
			process.exit( 1 );
		} );
}

function onDone() {
	return forkPool.killAll()
		.then( () => {
			console.log( `Finished processing ${ ids.length } items.` );
			console.log( ids.sort() );

			console.timeEnd( 'Processing time:' );
		} );
}
