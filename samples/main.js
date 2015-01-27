require.config( {
	baseUrl: '../src/',

	paths: {
		lodash: '../lib/lodash',
		mutationSummary: '../lib/mutation-summary'
	},

	shim: {
		mutationSummary: {
			exports: 'MutationSummary'
		}
	}
} );

require( [
	'editor',
	'tools/utils'
], function(
	Editor,
	utils
) {
	'use strict';

	var editor = window.editor = new Editor( '#input' ),
		html = [];

	function formatAttributes( attributes ) {
		return attributes ? Object.keys( attributes )
			.filter( function( attr ) {
				return attr !== 'type';
			} )
			.map( function( attr ) {
				return attr + ': ' + attributes[ attr ];
			} )
			.join( '<br>' ) : '';
	}

	html = editor.editable.document.data.data.map( function( op ) {
		op = utils.clone( op );

		if ( Array.isArray( op ) ) {
			if ( op[ 0 ] === ' ' ) {
				op[ 0 ] = '_';
				op[ 2 ] = 'whitespace';
			} else {
				op[ 2 ] = 'text';
			}
		} else if ( typeof op == 'string' ) {
			if ( op === ' ' ) {
				op = [ '_' ];
				op[ 2 ] = 'whitespace';
			} else {
				op = [ op ];
				op[ 2 ] = 'text';
			}
		} else {
			op = typeof op == 'object' ? [ op.type, op.attributes ] : [ op ];
			op[ 2 ] = 'tag';
		}

		return op;
	} ).map( function( op, idx ) {
		return [ '<tr>',
			'<td>', idx, '</td>',
			'<td class="', op[ 2 ], '">', op[ 0 ], '</td>',
			'<td>', formatAttributes( op[ 1 ] ), '</td>',
			'</tr>'
		].join( '' );
	} );

	document.querySelector( '#data>tbody' ).innerHTML = html.join( '\n' );

	function escapeTags( str ) {
		var replacements = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;'
		};

		if ( typeof str !== 'string' ) {
			return str;
		}

		return str.replace( /[&<>]/g, function( item ) {
			return replacements[ item ] || item;
		} );
	}

	document.getElementById( 'html' ).innerHTML = escapeTags( document.getElementById( 'input' ).innerHTML );
} );