define( [
	'selectionwatcher',
	'range',
	'tools/element',
	'tools/utils'
], function(
	SelectionWatcher,
	Range,
	Element,
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
		clear: function() {
			this.nativeSelection.clearAllRanges();
		},

		getDataRange: function() {

		},

		getSelectedNode: function() {

		},

		getSelectedData: function() {

		},

		getSelectedDataRange: function() {
			var nativeRange, start, end;

			if ( !this.nativeSelection.rangeCount ) {
				return null;
			}

			nativeRange = this.nativeSelection.getRangeAt( 0 );

			start = this.document.getOffsetAndAttributes(
				nativeRange.startContainer,
				nativeRange.startOffset
			);

			if ( !nativeRange.collapsed ) {
				end = this.document.getOffsetAndAttributes(
					nativeRange.endContainer,
					nativeRange.endOffset
				);
			}

			return new Range( start, end );
		},

		selectDataRange: function( range ) {
			console.log( 'select data range', range );
		},

		selectDomRange: function( ranges ) {

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
			console.log( 'update', selection );

		}
	} );

	return Selection;

} );