/* global window, document */

'use strict';

var Editor = require( './editor' );

var editor = window.editor = new Editor( '#editor' );

var html = [];

html = editor.document.data.map( function( op ) {
	return '<tr><td>' + op.insert + '</td>' +
		'<td class="' + ( op.attributes ? op.attributes.type ? 'tag' : 'style' : '' ) + '">' +
		( op.attributes ? JSON.stringify( op.attributes ) : '' ) +
		'</td></tr>';
} );

document.querySelector( '#data>tbody' ).innerHTML = html.join( '\n' );