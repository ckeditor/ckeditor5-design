'use strict';

const childProcess = require( 'child_process' );
const genericPool = require( 'generic-pool' );

module.exports = function createForkPool() {
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
		get isDone() {
			return !pool.pending && !pool.borrowed;
		},

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
		},

		killAll() {
			return pool.drain()
				.then( () => {
					pool.clear();
				} );
		}
	};
};
