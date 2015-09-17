function createOpFromLine( line, siteId ) {
	var args = line.split( ' ', 4 );
	var path = args[ 1 ].split( ',' );

	for ( var i = 0; i < path.length; i++ ) {
		path[ i ] = Number( path[ i ] );
	}

	var op = {
		type: args[ 0 ]
	};

	switch ( op.type ) {
		case 'insert':
			var offset = path.pop();
			var address = createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				offset: offset
			};

			var node = null;

			if ( args[ 2 ] == 'text' ) {
				node = new TextNode( args[ 3 ] );
			} else if ( args[ 2 ] == 'block' ) {
				node = new BlockNode( args[ 3 ] );
			}

			op.props.node = node;

			break;
		case 'remove':
			var offset = path.pop();
			var address = createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				offset: offset
			};

			break;
		case 'change':
			var address = createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				attr: args[ 2 ],
				value: args[ 3 ]
			};

			break;
		default:
			return null;
	}

	return createOperation( op.type, op.props );
}

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

function applyOperations( operations ) {
	for ( var i = 0; i < operations.length; i++ ) {
		applyOperation( operations[ i ] );
	}
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

var ITsDone = 0;

function init( objs ) {
	var operations = getOperationsFromTextarea( objs.context );
	applyOperations( operations );

	objs.tree.innerHTML = '';
	printTree( docRoot, objs.tree, 0 );
}

function process( objs ) {
	var siteOperations = getOperationsFromTextarea( objs.site, 1 );
	applyOperations( siteOperations );

	var incomingOperations = getOperationsFromTextarea( objs.incoming, 2 );
	var transformedIncoming = [];

	var timestamp = Number( new Date() );

	for ( var i = 0; i < incomingOperations.length; i++ ) {
		var transformedSite = [];
		var inOp = incomingOperations[ i ];
		var transInOp = copyOperation( inOp );

		for ( var j = 0; j < siteOperations.length; j++ ) {
			var siOp = siteOperations[ j ];
			var newTransInOp;

			newTransInOp = IT[ transInOp.type ][ siOp.type ]( transInOp, siOp );
			siOp = IT[ siOp.type ][ transInOp.type ]( siOp, transInOp );

			ITsDone+=2;

			transformedSite.push( siOp );

			transInOp = newTransInOp;
		}

		applyOperation( transInOp );
		transformedIncoming.push( transInOp );

		siteOperations = transformedSite;
	}

	var timeTaken = Number( new Date() ) - timestamp;

	objs.tree.innerHTML = '';
	printTree( docRoot, objs.tree, 0 );
	printOperations( transformedIncoming, objs.transformed );

	alert( 'IT transformations done: ' + ITsDone + '\n' + 'It took around: ' + timeTaken + 'ms' );

	ITsDone = 0;
}