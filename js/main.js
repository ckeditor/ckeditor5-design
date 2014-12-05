/* global window, document */

'use strict';

var Editor = require( './editor' );

var editor = window.editor = new Editor( '#editor' );

var html = [];

function formatAttributes( attributes ) {
	return Object.keys( attributes )
		.sort()
		.map( function( attr ) {
			return attr + ': ' + attributes[ attr ];
		} )
		.join( '<br>' );
}

var idx = 0;

html = editor.document.data.map( function( op ) {
	var str = '<tr><td>' + idx + '</td><td>' + op.insert + '</td>' +
		'<td class="' + ( op.attributes ? op.attributes.type ? 'tag' : 'style' : 'none' ) + '">' +
		( op.attributes ? formatAttributes( op.attributes ) : '' ) + '</td></tr>';

	idx += op.insert.toString().length;

	return str;
} );

document.querySelector( '#data>tbody' ).innerHTML = html.join( '\n' );