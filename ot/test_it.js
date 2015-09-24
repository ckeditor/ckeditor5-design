require( [ 'ot', 'dopt' ], function( OT, DOPT ) {
	function getOperationsFromTextarea( textarea, siteId ) {
		if ( textarea.value === '' ) {
			return [];
		}

		var lines = textarea.value.split( '\n' );
		var ops = [];

		for ( var i = 0; i < lines.length; i++ ) {
			var op = createOpFromLine( lines[ i ], siteId );
			if ( op ) {
				ops.push( op );
			}
		}

		return ops;
	}

	function printAttrs( node, element ) {
		element.innerHTML += ' { ';
		for ( var i in node.attrs ) {
			if ( node.attrs.hasOwnProperty( i ) ) {
				element.innerHTML += i + ':' + node.attrs[ i ] + ' ';
			}
		}
		element.innerHTML += '}';
	}

	function printTree( node, element, level ) {
		for ( var i = 0; i < level; i++ ) {
			element.innerHTML += '  ';
		}

		if ( node instanceof TextNode ) {
			element.innerHTML += '"' + node.char + '"';
			printAttrs( node, element );
			element.innerHTML += '\n';
		} else if ( node instanceof BlockNode ) {
			element.innerHTML += '[' + node.type + ']';
			printAttrs( node, element );
			element.innerHTML += '\n';

			var childCount = node.getChildCount();
			for ( var i = 0; i < childCount; i++ ) {
				printTree( node.getChild( i ), element, level + 1 );
			}
		}
	}

	function init( objs ) {
		var operations = getOperationsFromTextarea( objs.context );
		applyOperations( operations );

		objs.tree.innerHTML = '';
		printTree( docRoot, objs.tree, 0 );
	}

	function process( objs ) {
		var siteOperations = getOperationsFromTextarea( objs.site, 1 );
		var incomingOperations = getOperationsFromTextarea( objs.incoming, 2 );

		var timestamp = Number( new Date() );

		var transformedIncoming = DOPT.dopt( siteOperations, incomingOperations );

		var timeTaken = Number( new Date() ) - timestamp;

		objs.tree.innerHTML = '';
		printTree( docRoot, objs.tree, 0 );
		printOperations( transformedIncoming, objs.transformed );

		alert( 'IT transformations done: ' + ITsDone + '\n' + 'It took around: ' + timeTaken + 'ms' );

		ITsDone = 0;
	}

	function printOperations( operations, element ) {
		for ( var i = 0; i < operations.length; i++ ) {
			var op = operations[ i ];
			element.innerHTML += op.type;

			if ( op.type == 'change' ) {
				var path = op.address.path.join( ',' );
				element.innerHTML += ' ' + path + ' ' + op.attr + ' ' + op.value + '<br />';
			} else {
				var path = op.address.path.join( ',' ) + ( op.address.path.length ? ',' : '' ) + op.offset;
				element.innerHTML += ' ' + path;

				if ( op.type == 'insert' ) {
					element.innerHTML += ' ' + ( op.node instanceof TextNode ? 'text' : 'block' ) + ' ' + ( op.node instanceof TextNode ? op.node.char : op.node.type ) + '<br />';
				}
			}
		}
	}

	var objs = {
		context: document.getElementById( 'context' ),
		site: document.getElementById( 'site' ),
		incoming: document.getElementById( 'incoming' ),
		transformed: document.getElementById( 'transformed' ),
		tree: document.getElementById( 'tree' )
	};

	document.getElementById( 'swap' ).onclick = function () {
		var site = objs.site.value;
		objs.site.value = objs.incoming.value;
		objs.incoming.value = site;
	};

	document.getElementById( 'submit' ).onclick = function () {
		process( objs );
	};

	init( objs );
} );