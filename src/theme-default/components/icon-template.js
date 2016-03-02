'use strict';

var sprite = '{{#shapes}}{{{svg}}}{{/shapes}}';
var tmp = document.createElement( 'div' );

document.addEventListener( 'DOMContentLoaded', function(event) {
	tmp.innerHTML =
		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="ck-sprite">' +
			sprite +
		'</svg>';

	document.body.appendChild( tmp.firstChild );
} );