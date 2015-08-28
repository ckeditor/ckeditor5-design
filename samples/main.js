require.config( {
	baseUrl: '../src/'
} );

require( [
	'editor',
	'tools/utils'
], function(
	Editor,
	utils
) {
	'use strict';

	var editor = window.editor = new Editor( '#input' );
	var table = document.querySelector( '#data>tbody' );
	var tree = document.getElementById( 'tree' );
	var transactionView = document.querySelector( '#transaction>tbody' );
	var selection = document.getElementById( 'selection' );

	function printLinearData( data ) {
		var html = [];

		data = utils.clone( data );

		for ( var i = 0, len = data.length; i < len; i++ ) {
			var op = data[ i ];

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

			html.push( [ '<tr>',
				'<td>', i, '</td>',
				'<td class="', op[ 2 ], '">', op[ 0 ], '</td>',
				'<td>', formatAttributes( op[ 1 ] ), '</td>',
				'<td></td>',
				'</tr>'
			].join( '' ) );
		}

		table.innerHTML = html.join( '\n' );
	}

	function formatAttributes( attributes ) {
		if ( Array.isArray( attributes ) ) {
			// retrieve attribute values from the store
			attributes = attributes.map( function( attr ) {
				return editor.editable.document.store.get( attr );
			} );
			attributes.unshift( {} );
			attributes = utils.extend.apply( utils, attributes );
		}

		if ( utils.isObject( attributes ) ) {
			return Object.keys( attributes )
				.map( function( attr ) {
					return attr + ': ' + attributes[ attr ];
				} )
				.join( '<br>' );
		} else {
			return '';
		}
	}

	function buildTree( node, parentElem ) {
		var elem = document.createElement( 'li' );

		elem.innerHTML = node.type + ' <small>[' + node.length + ']</small>';

		parentElem.appendChild( elem );

		if ( node.children ) {
			var childElem = document.createElement( 'ul' );

			node.children.forEach( function( child ) {
				buildTree( child, childElem );
			} );

			elem.appendChild( childElem );
		}
	}

	function showTransaction( transaction ) {
		var operations = transaction.operations;
		var html = '';
		var operation, type, value;

		for ( var i = 0, len = operations.length; i < len; i++ ) {
			operation = operations[ i ];

			if ( operation.insert ) {
				type = 'insert';
				value = operation.insert;
			} else if ( operation.remove ) {
				type = 'remove';
				value = operation.remove;
			} else if ( operation.retain ) {
				type = 'retain';
				value = operation.retain;
			}

			if ( Array.isArray( value ) ) {
				value = value[ 0 ] + ' [' + formatAttributes( value[ 1 ] ) + ']';
			} else if ( typeof value == 'object' ) {
				value = value.type;
			}

			html += '<tr>' +
					'<td class="operation-' + type + '">' + type + '</td>' +
					'<td>' + value + '</td>' +
				'</tr>'
		}

		transactionView.innerHTML = html;
	}

	printLinearData( editor.editable.document.data.get() );
	buildTree( editor.editable.document.root, tree );

	// update the UI on document change
	editor.editable.on( 'change', function() {
		setTimeout( function() {
			printLinearData( editor.editable.document.data.get() );
			tree.innerHTML = '';
			buildTree( editor.editable.document.root, tree );

		}, 0 );
	} );

	editor.editable.document.on( 'transaction:start', function( transaction ) {
			showTransaction( transaction );
	} );

	editor.editable.document.selection.on( 'selection:change', function( current ) {
		var range = current.ranges[ 0 ];

		var html = 'Current selection: ';

		if ( !range ) {
			html += 'none';
		} else {
			html += '[ ' + range.start.offset +
				( range.start.attributes.length ? ', ' + JSON.stringify( range.start.attributes ) : '' ) + ' ]';

			if ( !range.start.equals( range.end ) ) {
				html += ' - [ ' + range.end.offset +
					( range.end.attributes.length ? ', ' + JSON.stringify( range.end.attributes ) : '' ) + ' ]';
			}
		}

		selection.innerHTML = html;
	} );
} );