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
	 *
	 * For example `diff( 'aba', 'acca' );` will return: `[ EQUAL, INSERT, INSERT, DELETE, EQUAL ]`
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

		var m = a.length,
			n = b.length,
			delta = n - m;

		// edit scripts, for each diagonal
		var es = {};
		// furthest points, the furthest y we can get on each diagonal
		var fp = {};

		function snake( k ) {
			// we use -1 as an alternative below to handle initial values ( instead of filling the fp with -1 first )
			// furthest points (y) on the diagonal below k
			var y1 = ( fp[ k - 1 ] !== undefined ? fp[ k - 1 ] : -1 ) + 1;
			// furthest points (y) on the diagonal above k
			var y2 = fp[ k + 1 ] !== undefined ? fp[ k + 1 ] : -1;
			// the way we should go to get further
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
			while ( x < m && y < n && cmp( a[ x ], b[ y ] ) ) {
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
			// updates furthest points and edit scripts for diagonals below delta
			for ( k = -p; k < delta; k++ ) {
				fp[ k ] = snake( k );
			}

			// updates furthest points and edit scripts for diagonals above delta
			for ( k = delta + p; k > delta; k-- ) {
				fp[ k ] = snake( k );
			}

			// updates furthest point and edit script for the delta diagonal
			// Note that the delta diagonal is the one which goes through the sink (m, n).
			fp[ delta ] = snake( delta );

			p++;
		} while ( fp[ delta ] !== n );

		// return the final list of edit operations
		// we remove the first item that represents the operation for the injected nulls
		return es[ delta ].slice( 1 );
	}

	// expose operation types
	diff.INSERT = INSERT;
	diff.DELETE = DELETE;
	diff.EQUAL = EQUAL;

	return diff;
} );