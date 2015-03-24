define( [
	'selectionwatcher',
	'range',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	SelectionWatcher,
	Range,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Selection( editable ) {
		this.editable = editable;
		this.document = editable.document;
		this.nativeSelection = editable.$document.getSelection();
		this.watcher = new SelectionWatcher( editable.$el );
		this.watcher.on( 'selection:change', this.update, this );
		this.startWatching();

		this.previousSelection = null;
		this.currentSelection = null;
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

			result.type = count === 1 && result.ranges[ 0 ].collapsed ? Selection.CARRET : Selection.RANGE;

			return result;
		},

		clear: function() {
			this.nativeSelection.clearAllRanges();
		},

		getDataRange: function() {

		},

		getSelectedNode: function() {

		},

		getSelectedData: function() {

		},

		getSelectedDataRanges: function() {

		},

		selectDataRanges: function( ranges ) {
			console.log( 'select data range', range );
		},

		selectDomRanges: function( ranges ) {

		},

		selectElement: function( element ) {

		},

		selectNode: function( node ) {

		},

		startWatching: function() {
			this.watcher.start();
		},

		stopWatching: function() {
			this.watcher.stop();
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