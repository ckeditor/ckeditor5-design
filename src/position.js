define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Position( offset, attributes ) {
		this.offset = offset;
		this.attributes = attributes || [];
	}

	utils.extend( Position.prototype, {
		clone: function() {
			return new Position( this.offset, utils.clone( this.attributes ) );
		},

		equals: function( position ) {
			return position && this.offset === position.offset &&
				utils.areEqual( this.attributes, position.attributes );
		},

		translate: function( distance ) {
			this.offset += distance;
		}
	} );

	return Position;
} );