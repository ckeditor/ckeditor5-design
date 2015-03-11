// contains pieces of 'selectionchange' event polyfill: github.com/2is10/selectionchange-polyfill

define( [
	'tools/emitter',
	'tools/utils'
], function(
	Emitter,
	utils
) {
	'use strict';

	var isWebkit = ( navigator.userAgent.toLowerCase().indexOf( ' applewebkit/' ) > -1 );

	function EditableWatcher( editable ) {
		this.editable = editable;
		this.document = editable.$document || document;

		this._changeHandler = this.triggerChange.bind( this );

		this.editable.$el.addListener( isWebkit ? 'DOMFocusIn' : 'focus', this.startWatching.bind( this ) );
		this.editable.$el.addListener( isWebkit ? 'DOMFocusOut' : 'blur', this.stopWatching.bind( this ) );
	}

	var ranges;

	utils.extend( EditableWatcher.prototype, Emitter, {
		startWatching: function() {
			// enable selectionchange event polyfill if needed
			this._startSelectionChangePolyfill();

			this.document.addEventListener( 'selectionchange', this._changeHandler );
		},

		stopWatching: function() {
			// disable selectionchange event polyfill
			this._stopSelectionChangePolyfill();

			this.document.removeEventListener( 'selectionchange', this._changeHandler );
		},

		triggerChange: function() {
			this.trigger( 'selectionChange', this.document.getSelection() );
		},

		_startSelectionChangePolyfill: function() {
			if (
				( ranges || !hasNativeSupport( this.document ) && ( ranges = newWeakMap() ) ) &&
				!ranges.has( this.document )
			) {
				ranges.set( this.document, getSelectionRange( this.document ) );

				this.document.addEventListener( 'keydown', dispatchChange );
				this.document.addEventListener( 'mousedown', onMouseDown );
				this.document.addEventListener( 'mousemove', onMouseMove );
				this.document.addEventListener( 'mouseup', onMouseUp );
				this.document.defaultView.addEventListener( 'focus', dispatchChange );

				this.triggerChange();
			}
		},

		_stopSelectionChangePolyfill: function() {
			if ( ranges && ranges.has( this.document ) ) {
				ranges[ 'delete' ]( this.document );

				this.document.removeEventListener( 'keydown', dispatchChange );
				this.document.removeEventListener( 'mousedown', onMouseDown );
				this.document.removeEventListener( 'mousemove', onMouseMove );
				this.document.removeEventListener( 'mouseup', onMouseUp );
				this.document.defaultView.removeEventListener( 'focus', dispatchChange );

				this.triggerChange();
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

		if ( !sameRange( rNew, rOld ) ) {
			ranges.set( doc, rNew );
			setTimeout( doc.dispatchEvent.bind( doc, new Event( 'selectionchange' ) ), 0 );
		}
	}

	function getSelectionRange( doc ) {
		var s = doc.getSelection();

		return s.rangeCount ? s.getRangeAt( 0 ) : null;
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

	function sameRange( r1, r2 ) {
		return r1 === r2 || r1 && r2 &&
			r1.startContainer === r2.startContainer &&
			r1.startOffset === r2.startOffset &&
			r1.endContainer === r2.endContainer &&
			r1.endOffset === r2.endOffset;
	}

	return EditableWatcher;

} );