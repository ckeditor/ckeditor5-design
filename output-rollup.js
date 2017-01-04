(function () {
'use strict';

const e = Math.random();

function b() {
	console.log( 'b', e );
	c();
}

const e$2 = Math.random();

function c$2() {
	console.log( 'c1', e$2 );
}

const e$3 = Math.random();

function c$3() {
	console.log( 'c2', e$3 );
}

b();
c$2();
c$3();

const e$4 = Math.random();

function c$4() {
	console.log( 'c2', e$4 );
}

c$4();

}());
