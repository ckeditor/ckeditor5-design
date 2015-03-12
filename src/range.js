define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Range( from, to ) {
		this.from = from;
		this.to = to === undefined ? from : to;
		this.start = this.from > this.to ? this.to : this.from;
		this.end = this.from > this.to ? this.from : this.to;
	}

	// prototype
	Object.defineProperty( Range.prototype, 'collapsed', {
		get: function() {
			return this.from === this.to;
		}
	} );

	Object.defineProperty( Range.prototype, 'length', {
		get: function() {
			return this.end - this.start;
		}
	} );

	utils.extend( Range.prototype, {
		equals: function( range ) {
			return range.from === this.from && range.to === this.to && this.equalsSelection( range );
		},

		equalsSelection: function( range ) {
			return range.start === this.start && range.end === this.end;
		},

		translate: function( offset ) {
			return new this.constructor( this.from + offset, this.to + offset );
		}
	} );

	return Range;

} );