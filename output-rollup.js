(function () {
'use strict';

const e = Math.random();

function b() {
	console.log( 'b', e );
	c();
}

const e$2 = Math.random();

function c$2() {
	console.log( 'c', e$2 );
}

b();
c$2();

}());
