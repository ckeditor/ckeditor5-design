define( [
	'range',
	'tools/utils'
], function(
	Range,
	utils
) {
	'use strict';

	function Selection( range ) {
		this.range = null;
		this.node = null;
	}

	utils.extend( Selection.prototype, {
		empty: function() {
			this.range = null;
			tnis.node = null;
		},

		update: function( from, to ) {
			var range = new Range( from, to );

			if ( !this.range || !this.range.equals( range ) ) {
				this.range = range;
			}
		}
	} );

	return Selection;

} );