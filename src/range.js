define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function Range( from, to ) {
		this.from = from.offset;
		this.fromAttributes = from.attributes;

		this.to = to ? to.offset : this.from;
		this.toAttributes = to ? to.attributes : this.fromAttributes;

		this.start = this.from > this.to ? this.to : this.from;
		this.startAttributes = this.from > this.to ? this.toAttributes : this.fromAttributes;

		this.end = this.from > this.to ? this.from : this.to;
		this.endAttributes = this.from > this.to ? this.fromAttributes : this.toAttributes;
	}

	// prototype
	Object.defineProperty( Range.prototype, 'collapsed', {
		get: function() {
			return this.start === this.end;
		}
	} );

	Object.defineProperty( Range.prototype, 'length', {
		get: function() {
			return this.end - this.start;
		}
	} );

	utils.extend( Range.prototype, {
		equals: function( range ) {
			return range && range.from === this.from && range.to === this.to &&
				areEqualArrays( range.fromAttributes, this.fromAttributes ) &&
				areEqualArrays( range.toAttributes, this.toAttributes );
		},

		equalsSelection: function( range ) {
			return range && range.start === this.start && range.end === this.end &&
				areEqualArrays( range.startAttributes, this.startAttributes ) &&
				areEqualArrays( range.endAttributes, this.endAttributes );
		},

		translateOffset: function( offset ) {
			return new this.constructor( this.from + offset, this.to + offset );
		}

		// TODO transalte attributes
	} );

	function areEqualArrays( a, b ) {
		return Array.isArray( a ) && Array.isArray( b ) && a.length === b.length &&
			a.every( function( item, i ) {
				return item === b[ i ];
			} );
	}

	return Range;

} );