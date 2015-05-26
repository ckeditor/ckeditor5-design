// contains bits of 'selectionchange' event polyfill: github.com/2is10/selectionchange-polyfill
define( [
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Element,
	Emitter,
	utils
) {
	'use strict';

	var isWebkit = navigator.userAgent.toLowerCase().indexOf( ' applewebkit/' ) > -1;

	function SelectionWatcher( target ) {
		this.target = target;
		this.document = target.getElement().ownerDocument;

		this._changeHandler = this._triggerChange.bind( this );

		this.target.addListener( isWebkit ? 'DOMFocusIn' : 'focus', this._startWatching.bind( this ) );
		this.target.addListener( isWebkit ? 'DOMFocusOut' : 'blur', this._stopWatching.bind( this ) );
	}

	// WeakMap of ranges assigned to docs:
	// 		doc1 -> [ range1a, range1b, ... ],
	// 		doc2 -> [ range2a, range2b, ... ],
	// 		...
	var ranges;

	utils.extend( SelectionWatcher.prototype, Emitter, {
		start: function() {
			this.document.addEventListener( 'selectionchange', this._changeHandler );
		},

		stop: function() {
			this.document.removeEventListener( 'selectionchange', this._changeHandler );
		},

		_triggerChange: function() {
			this.trigger( 'selection:change', this.document.getSelection() );
		},

		_startWatching: function() {
			this._startSelectionChangePolyfill();
			this.start();
		},

		_stopWatching: function() {
			this._stopSelectionChangePolyfill();
			this.stop();
		},

		_startSelectionChangePolyfill: function() {
			var doc = this.document;

			if (
				( ranges || !hasNativeSupport( doc ) && ( ranges = newWeakMap() ) ) &&
				!ranges.has( doc )
			) {
				ranges.set( doc, getSelectionRange( doc ) );

				doc.addEventListener( 'keydown', dispatchChange );
				doc.addEventListener( 'mousedown', onMouseDown );
				doc.addEventListener( 'mousemove', onMouseMove );
				doc.addEventListener( 'mouseup', onMouseUp );
				doc.defaultView.addEventListener( 'focus', dispatchChange );
			}
		},

		_stopSelectionChangePolyfill: function() {
			var doc = this.document;

			if ( ranges && ranges.has( doc ) ) {
				ranges[ 'delete' ]( doc );

				doc.removeEventListener( 'keydown', dispatchChange );
				doc.removeEventListener( 'mousedown', onMouseDown );
				doc.removeEventListener( 'mousemove', onMouseMove );
				doc.removeEventListener( 'mouseup', onMouseUp );
				doc.defaultView.removeEventListener( 'focus', dispatchChange );
			}
		}
	} );

	/*jshint validthis:true */
	function dispatchChange() {
		var that = this;

		setTimeout( function() {
			dispatchIfChanged( that );
		}, 0 );
	}

	function dispatchIfChanged( doc ) {
		var rOld = ranges.get( doc );
		var rNew = getSelectionRange( doc );

		if ( !areSameRanges( rNew, rOld ) ) {
			ranges.set( doc, rNew );
			setTimeout( doc.dispatchEvent.bind( doc, new Event( 'selectionchange' ) ), 0 );
		}
	}

	function getSelectionRange( doc ) {
		var selection = doc.getSelection(),
			count = selection.rangeCount;

		if ( count > 1 ) {
			var ranges = [];

			for ( var i = 0; i < count; i++ ) {
				ranges.push( selection.getRangeAt( i ) );
			}

			return ranges;
		} else if ( count === 1 ) {
			return selection.getRangeAt( 0 );
		} else {
			return null;
		}
	}

	function hasNativeSupport( doc ) {
		var osc = doc.onselectionchange;

		if ( osc !== undefined ) {
			try {
				doc.onselectionchange = 0;
				return doc.onselectionchange === null;
			} catch ( e ) {} finally {
				doc.onselectionchange = osc;
			}
		}

		return false;
	}

	function newWeakMap() {
		if ( typeof window.WeakMap !== 'undefined' ) {
			return new window.WeakMap();
		} else {
			throw new Error( 'selectionchange: WeakMap not supported' );
		}
	}

	function onMouseDown( e ) {
		if ( e.button === 0 ) {
			this.addEventListener( 'mousemove', onMouseMove );
			dispatchChange.call( this );
		}
	}

	function onMouseMove( e ) {
		// only needed while primary button is down
		if ( e.buttons & 1 ) {
			dispatchIfChanged( this );
		} else {
			this.removeEventListener( 'mousemove', onMouseMove );
		}
	}

	function onMouseUp( e ) {
		if ( e.button === 0 ) {
			dispatchChange.call( this );
		} else {
			this.removeEventListener( 'mousemove', onMouseMove );
		}
	}

	/*jshint validthis:false */

	function areSameRanges( r1, r2 ) {
		if ( Array.isArray( r1 ) && Array.isArray( r2 ) ) {
			if ( r1.length !== r2.length ) {
				return false;
			}

			return r1.every( function( range, i ) {
				return areSameRanges( range, r2[ i ] );
			} );
		} else {
			return r1 === r2 || r1 && r2 &&
				r1.startContainer === r2.startContainer &&
				r1.startOffset === r2.startOffset &&
				r1.endContainer === r2.endContainer &&
				r1.endOffset === r2.endOffset;
		}
	}

	return SelectionWatcher;
} );