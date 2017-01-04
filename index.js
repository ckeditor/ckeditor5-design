'use strict';

const childProcess = require( 'child_process' );
const randomId = require( './randomid' );

const MAX_FORKS = 3;

const freeForks = [
	createFork(),
	createFork(),
	createFork()
];
const dataPool = [];
let poolIndex = 0;

addDataToPool( randomId() );
addDataToPool( randomId() );
addDataToPool( randomId() );
addDataToPool( randomId() );
resume();

function getDataFromPool() {
	if ( !isDrained() ) {
		return dataPool[ poolIndex++ ];
	}
}

function addDataToPool( data ) {
	if ( !dataPool.includes( data ) ) {
		dataPool.push( data );
	}
}

function isDrained() {
	return dataPool.length <= poolIndex;
}

function createFork() {
	const child = childProcess.fork( 'child' );

	child.on( 'message', ( requires ) => {
		requires.forEach( addDataToPool );
		freeForks.push( child );

		resume();
	} );

	return child;
}

function resume() {
	if ( !freeForks.length || isDrained() ) {
		if ( freeForks.length == MAX_FORKS && isDrained() ) {
			console.log( `Finished processing ${ dataPool.length } items.` );
			console.log( dataPool.sort() );

			exit();
		}

		return;
	}

	const data = getDataFromPool();
	const child = freeForks.shift();

	child.send( data );

	resume();
}

function exit() {
	freeForks.forEach( fork => fork.kill() );
}
