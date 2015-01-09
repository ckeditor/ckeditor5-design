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


	html = editor.document.ops.map( function( op ) {
		if ( op.insert === 1 ) {
			op.insert = op.attributes.type;
			op.css = 'tag';
		} else {
			op.css = 'text';
		}

		return op;
	} ).map( function( op, idx ) {
		return [ '<tr>',
			'<td>', idx, '</td>',
			'<td class="', op.css, '">', op.insert, '</td>',
			'<td>', formatAttributes( op.attributes ), '</td>',
			'</tr>'
		].join( '' );
	} );

	document.querySelector( '#data>tbody' ).innerHTML = html.join( '\n' );

} );