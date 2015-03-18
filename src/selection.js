define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function Selection( document, range ) {
		this.document = document;
		// TODO what about multiple ranges (in ff)?
		this.range = null;
		this.node = null;

		this.update( range );
	}

	utils.extend( Selection, {
		EMPTY: 'empty',
		CARRET: 'carret',
		RANGE: 'range'
	} );

	Object.defineProperty( Selection.prototype, 'collapsed', {
		get: function() {
			return this.range && this.range.collapsed;
		}
	} );

	utils.extend( Selection.prototype, {
		update: function( range ) {
			this.range = range;

			// set current node
			if ( this.range ) {
				this.node = this.document.getNodeAtPosition( this.range.from );
			}

			this.type = range ? range.collapsed ? Selection.CARRET : Selection.RANGE : Selection.EMPTY;

			// TODO get attributes
		}
	} );

	return Selection;

} );