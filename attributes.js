var size = 1000000;

var tab = [];

var repo = [];

function Attr( key, value ) {
	this.key = key;
	this.value = value;
}

var a = new Attr( 'f', 'L' )

for ( var i = 0; i < size; i++ ) {
	tab.push( a );
}