/* global window, document */

'use strict';

var Editor = require( './editor' ),
	editor = window.editor = new Editor( '#input' ),
	output = document.getElementById( 'output' ),
	html = [];

editor.getDom( output );

function formatAttributes( attributes ) {
	return Object.keys( attributes )
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

var Delta = require( 'rich-text' ).Delta;

var delta = new Delta();

delta.insert( 'Foo', {
	italic: true
} ).insert( 'bar' );

var delta2 = new Delta();

delta2.retain( 3, {
	bold: true
} );

delta.compose( delta2 );

window.delta = delta;