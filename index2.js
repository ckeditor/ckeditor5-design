'use strict';

const childProcess = require( 'child_process' );
const genericPool = require( 'generic-pool' );
const randomId = require( './randomid' );

const ids = [];
const forkPool = createForkPool();

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

			if ( !forkPool.pool.pending && !forkPool.pool.borrowed ) {
				console.log( `Finished processing ${ ids.length } items.` );
				console.log( ids.sort() );

				return forkPool.pool.drain()
					.then( () => {
						forkPool.pool.clear();

						console.timeEnd( 'Processing time:' );
					} );
			}
		} )
		.catch( ( err ) => {
			console.error( err );
			process.exit( 1 );
		} );
}

function createForkPool() {
	const forkPoolFactory = {
		create() {
			return new Promise( ( resolve ) => {
				resolve( childProcess.fork( 'child' ) );
			} );
		},

		destroy( child ) {
			child.kill();
		}
	};

	const pool = genericPool.createPool( forkPoolFactory, {
		max: 4,
		min: 3
	} );

	return {
		pool: pool,

		enqueue( data ) {
			return new Promise( ( resolve, reject ) => {
				pool.acquire()
					.then( ( child ) => {
						child.once( 'message', ( returnedData ) => {
							pool.release( child );

							resolve( returnedData );
						} );

						child.send( data );
					} )
					.catch( reject );
			} );
		}
	};
}
