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

	html = editor.editable.document.data.map( function( op ) {
		op = utils.clone( op );

		if ( !Array.isArray( op ) ) {
			op = [ op ];
		}

		if ( op[ 0 ] === 1 ) {
			op[ 0 ] = op[ 1 ].type;
			op[ 2 ] = 'tag';
		} else if ( op[ 0 ] === 2 ) {
			op[ 0 ] = '/' + op[ 1 ].type;
			op[ 2 ] = 'tag';
		} else if ( op[ 0 ] === ' ' ) {
			op[ 0 ] = '_';
			op[ 2 ] = 'whitespace';
		} else {
			op[ 2 ] = 'text';
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
		} ).replace( /;\s?&/g, ';<br>&' );
	}

	document.getElementById( 'html' ).innerHTML = escapeTags( document.getElementById( 'input' ).innerHTML );
} );