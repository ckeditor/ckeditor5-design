// contains pieces of 'selectionchange' event polyfill: github.com/2is10/selectionchange-polyfill

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

	var isWebkit = ( navigator.userAgent.toLowerCase().indexOf( ' applewebkit/' ) > -1 );

	function EditableWatcher( editable ) {
		this.editable = editable;
		this.document = editable.document;
		this.$document = editable.$document || document;
		this.range = null;

		this._changeHandler = this.checkSelectionChange.bind( this );

		this.editable.$el.addListener( isWebkit ? 'DOMFocusIn' : 'focus', this.startWatching.bind( this ) );
		this.editable.$el.addListener( isWebkit ? 'DOMFocusOut' : 'blur', this.stopWatching.bind( this ) );
	}

	var ranges;

	utils.extend( EditableWatcher.prototype, Emitter, {
		checkSelectionChange: function() {
			var selection = this.$document.getSelection(),
				// TODO what about other ranges?
				range = selection && selection.rangeCount && selection.getRangeAt( 0 ) || null,
				topEl = this.editable.$el.getElement();

			// no range or outside of the editable area
			if ( !range || !Element.hasAncestor( range.commonAncestorContainer, topEl ) ) {
				range = null;
			} else {
				var start = this.document.getOffsetAndAttributes( selection.anchorNode, selection.anchorOffset ),
					end;

				if ( !selection.isCollapsed ) {
					end = this.document.getOffsetAndAttributes( selection.focusNode, selection.focusOffset );
				}

				range = new Range( start, end );
			}

			// check if the range changed and trigger selectionChange if needed
			if (
				( this.range && !this.range.equals( range ) ) ||
				( !this.range && range )
			) {
				this.range = range;
				this.trigger( 'selectionChange', this.range );
			}
		},

		enable: function() {
			this.$document.addEventListener( 'selectionchange', this._changeHandler );
		},

		disable: function() {
			this.$document.removeEventListener( 'selectionchange', this._changeHandler );
		},

		startWatching: function() {
			// enable selectionchange event polyfill if needed
			this._startSelectionChangePolyfill();

			this.enable();
		},

		stopWatching: function() {
			// disable selectionchange event polyfill
			this._stopSelectionChangePolyfill();

			this.disable();
		},

		_startSelectionChangePolyfill: function() {
			if (
				( ranges || !hasNativeSupport( this.$document ) && ( ranges = newWeakMap() ) ) &&
				!ranges.has( this.$document )
			) {
				ranges.set( this.$document, getSelectionRange( this.$document ) );

				this.$document.addEventListener( 'keydown', dispatchChange );
				this.$document.addEventListener( 'mousedown', onMouseDown );
				this.$document.addEventListener( 'mousemove', onMouseMove );
				this.$document.addEventListener( 'mouseup', onMouseUp );
				this.$document.defaultView.addEventListener( 'focus', dispatchChange );

				this.checkSelectionChange();
			}
		},

		_stopSelectionChangePolyfill: function() {
			if ( ranges && ranges.has( this.$document ) ) {
				ranges[ 'delete' ]( this.$document );

				this.$document.removeEventListener( 'keydown', dispatchChange );
				this.$document.removeEventListener( 'mousedown', onMouseDown );
				this.$document.removeEventListener( 'mousemove', onMouseMove );
				this.$document.removeEventListener( 'mouseup', onMouseUp );
				this.$document.defaultView.removeEventListener( 'focus', dispatchChange );

				this.checkSelectionChange();
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
		if ( typeof WeakMap !== 'undefined' ) {
			return new WeakMap();
		} else {
			console.error( 'selectionchange: WeakMap not supported' );
			return null;
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

	return EditableWatcher;

} );