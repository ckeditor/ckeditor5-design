define( [
	'range',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Range,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Selection( document, $document ) {
		this.document = document;
		this.$document = $document;

		this.nativeSelection = this.$document.getSelection();
		this.currentSelection = null;
		this.previousSelection = null;
	}

	utils.extend( Selection, {
		EMPTY: 'empty',
		CARRET: 'carret',
		RANGE: 'range',
		MULTIRANGE: 'multirange'
	} );

	utils.extend( Selection.prototype, Emitter, {
		buildFromNativeSelection: function( selection ) {
			var result = {
				ranges: [],
				type: Selection.EMPTY
			};

			selection = selection || this.nativeSelection;

			var count;

			if ( !( count = selection.rangeCount ) ) {
				return result;
			}

			for ( var i = 0; i < count; i++ ) {
				result.ranges.push( Range.createFromNativeRange( this.nativeSelection.getRangeAt( i ), this.document ) );
			}

			result.type = count === 1 ?
				result.ranges[ 0 ].collapsed ? Selection.CARRET : Selection.RANGE :
				Selection.MULTIRANGE;

			return result;
		},

		clear: function() {
			this.nativeSelection.removeAllRanges();

			this.previousSelection = this.currentSelection;

			this.currentSelection = {
				ranges: [],
				type: Selection.EMPTY
			};
		},

		getSelectedNode: function( selection ) {
			selection = selection || this.currentSelection;

			if ( selection.type === Selection.EMPTY ) {
				return null;
			}

			return this.document.getNodeAtPosition( selection.ranges[ 0 ].start.offset );
		},

		getSelectedData: function() {
			return this.currentSelection ?
				this.currentSelection.ranges.map( function( range ) {
					return this.document.data.getDataForRange( range );
				}, this ) : [];
		},

		getSelectedRanges: function() {
			return this.currentSelection.ranges;
		},

		selectDataRange: function( range ) {
			var nativeRange = this.$document.createRange();

			var start = this.document.getDomNodeAndOffset( range.start.offset, range.start.attributes );
			var end = this.document.getDomNodeAndOffset( range.end.offset, range.end.attributes );

			nativeRange.setStart( start.node, start.offset );
			nativeRange.setEnd( end.node, end.offset );

			this.selectRange( nativeRange );
		},

		selectElement: function( element ) {
			var nativeRange = this.$document.createRange();

			nativeRange.selectNode( element );

			this.selectRange( nativeRange );
		},

		selectNode: function( node ) {
			var offset = node.offset,
				range = Range.createFromOffsets( offset, offset + node.length );

			this.selectDataRange( range );
		},

		selectRange: function( range ) {
			this.nativeSelection.removeAllRanges();
			this.nativeSelection.addRange( range );
		},

		update: function( selection ) {
			var nextSelection = this.buildFromNativeSelection( selection );

			if ( !utils.areEqual( this.currentSelection, nextSelection ) ) {
				this.previousSelection = this.currentSelection;
				this.currentSelection = nextSelection;

				this.trigger( 'selection:change', this.currentSelection, this.previousSelection );
			}
		}
	} );

	return Selection;

} );