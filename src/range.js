define( [
	'position',
	'tools/utils'
], function(
	Position,
	utils
) {
	'use strict';

	function Range( start, end ) {
		this.start = start;
		this.end = end || start.clone();
	}

	// static
	utils.extend( Range, {
		createFromOffsets: function( startOffset, endOffset ) {
			var start = new Position( startOffset );
			var end = new Position( endOffset );

			return new Range( start, end );
		},

		createFromNativeRange: function( range, document ) {
			var start, end;

			start = document.getOffsetAndAttributes(
				range.startContainer,
				range.startOffset
			);

			if ( !range.collapsed ) {
				end = document.getOffsetAndAttributes(
					range.endContainer,
					range.endOffset
				);
			}

			return new Range( start, end );
		}
	} );

	// prototype
	Object.defineProperty( Range.prototype, 'collapsed', {
		get: function() {
			return this.start.equals( this.end );
		}
	} );

	utils.extend( Range.prototype, {
		equals: function( range ) {
			return range && this.start.equals( range.start ) && this.end.equals( range.end );
		},

		translate: function( offset ) {
			this.start.translate( offset );
			this.end.translate( offset );
		}
	} );

	return Range;

} );