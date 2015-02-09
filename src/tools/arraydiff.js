// The following code is based on the "O(NP) Sequence Comparison Algorithm"
// by Sun Wu, Udi Manber, Gene Myers, Webb Miller
// 
// You can find this paper here:
// http://www.itu.dk/stud/speciale/bepjea/xwebtex/litt/an-onp-sequence-comparison-algorithm.pdf

define( function() {
	'use strict';

	// operation types
	var INSERT = 1,
		DELETE = -1,
		EQUAL = 0;

	/**
	 * Calculates the difference between two arrays producing an object containing a list of operations
	 * necessary to transform one array into another
	 * @param  {Array}    a     Input array
	 * @param  {Array}    b     Output array
	 * @param  {Function} [cmp] Optional function used to compare array values, by default === is used
	 * @return {Object}
	 */
	function diff( a, b, cmp ) {
		// set the comparator function
		cmp = cmp || function( a, b ) {
			return a === b;
		};

		// temporary operation type statics
		var _INSERT, _DELETE;

		// swapped the arrays to use the shorter one as the first one
		if ( b.length < a.length ) {
			var tmp = a;

			a = b;
			b = tmp;

			// we swap the operation types as well
			_INSERT = DELETE;
			_DELETE = INSERT;
		} else {
			_INSERT = INSERT;
			_DELETE = DELETE;
		}

		// add empty items at the beginning because we want to compare the first array items as well
		a = [ null ].concat( a );
		b = [ null ].concat( b );

		// -1 the length to balance "null" at the beginning
		var m = a.length - 1,
			n = b.length - 1,
			delta = n - m;

		// edit scripts
		var es = {};
		// path endpoints (y-coords), we left fp name as it was in the paper
		var fp = {};

		function snake( k ) {
			// we use -1 below to handle initial values ( instead of filling the fp with -1 first )
			// y on the diagonal below k
			var y1 = ( fp[ k - 1 ] || -1 ) + 1;
			// y on the diagonal above k
			var y2 = fp[ k + 1 ] || -1;

			var dir = y1 > y2 ? -1 : 1;

			// clone previous operations array (if any)
			if ( es[ k + dir ] ) {
				es[ k ] = es[ k + dir ].slice( 0 );
			}

			// create operations array
			if ( !es[ k ] ) {
				es[ k ] = [];
			}

			// push the operation
			es[ k ].push( y1 > y2 ? _INSERT : _DELETE );

			// set the beginning coordinates
			var y = Math.max( y1, y2 ),
				x = y - k;

			// traverse the diagonal as long as the values match
			while ( x < m && y < n && cmp( a[ x + 1 ], b[ y + 1 ] ) ) {
				x++;
				y++;
				// push no change operation
				es[ k ].push( EQUAL );
			}

			return y;
		}

		var p = 0,
			k;

		// traverse the graph until we reach the end of the longer string
		do {
			// generate points on diagonals below the delta
			for ( k = -p; k < delta; k++ ) {
				fp[ k ] = snake( k );
			}

			// generate points on diagonals above the delta
			for ( k = delta + p; k > delta; k-- ) {
				fp[ k ] = snake( k );
			}

			// generate points on diagonals on the delta
			fp[ delta ] = snake( delta );

			p++;
		} while ( fp[ delta ] !== n );


		// return the final list of edit operations
		// we remove the first item that represents the opration for the injected nulls
		return es[ delta ].slice( 1 );
	}

	// expose operation types
	diff.INSERT = INSERT;
	diff.DELETE = DELETE;
	diff.EQUAL = EQUAL;

	return diff;
} );