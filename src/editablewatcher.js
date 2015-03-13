// contains pieces of 'selectionchange' event polyfill: github.com/2is10/selectionchange-polyfill

define( [
	'range',
	'tools/emitter',
	'tools/utils'
], function(
	Range,
	Emitter,
	utils
) {
	'use strict';

	var isWebkit = ( navigator.userAgent.toLowerCase().indexOf( ' applewebkit/' ) > -1 );

	function EditableWatcher( editable ) {
		this.editable = editable;
		this.document = editable.$document || document;
		this.range = null;

		this._changeHandler = this.checkSelectionChange.bind( this );

		this.editable.$el.addListener( isWebkit ? 'DOMFocusIn' : 'focus', this.startWatching.bind( this ) );
		this.editable.$el.addListener( isWebkit ? 'DOMFocusOut' : 'blur', this.stopWatching.bind( this ) );
	}

	var ranges;

	utils.extend( EditableWatcher.prototype, Emitter, {
		checkSelectionChange: function() {
			var selection = this.document.getSelection(),
				range = selection && selection.rangeCount && selection.getRangeAt( 0 ) || null,
				topEl = this.editable.$el.getElement(),
				that = this;

			// no range or outside of the editable area
			if ( !range || !hasAncestor( range.commonAncestorContainer, topEl ) ) {
				return;
			}

			var startOffset = getOffset( selection.anchorNode, selection.anchorOffset ),
				endOffset;

			if ( !selection.isCollapsed ) {
				endOffset = getOffset( selection.focusNode, selection.focusOffset );
			}

			range = new Range( startOffset, endOffset );

			// check if the range changed and trigger selectionChange if needed
			if ( !this.range || !this.range.equals( range ) ) {
				this.range = range;
				this.trigger( 'selectionChange', this.range );
			}

			// TODO exclude internal elements from the offset calculation
			// calculates the offset in the linear data
			function getOffset( element, offset ) {
				var length = 0,
					view, node, searchElem;

				// validate the offset first
				if (
					offset < 0 ||
					offset > ( element.nodeType === Node.ELEMENT_NODE ? element.childNodes.length : element.data.length )
				) {
					throw new Error( 'Invalid offset.' );
				}

				if ( element.nodeType === Node.ELEMENT_NODE ) {
					// the selection is at the beginning or end of the element
					if ( element.childNodes.length === 0 || element.childNodes.length === offset ) {
						// the element has a view so we can easily get its offset in the linear data
						if ( ( view = getView( element ) ) ) {
							node = view.node;

							// node's offset +
							// node's length if we're looking for the node's closing element
							// or + 1 for the opening element
							return node.getOffset() + ( offset ? node.length : 1 );
						}

						searchElem = element;

						// we'll try to get the offset using the element last child's offset (or its descendant's offset)
						if ( offset ) {
							while ( searchElem.lastChild ) {
								searchElem = searchElem.lastChild;

								if ( ( view = getView( searchElem ) ) ) {
									node = view.node;

									// node's offset + length to get the closing element's offset
									return node.getOffset() + node.length;
								}
							}
						}
					} else {
						searchElem = element.childNodes[ offset ];
						element = searchPrecedingElem( searchElem );
					}
				} else {
					// include the offset within a text node
					length += offset;

					searchElem = element;
					element = searchPrecedingElem( element );
				}

				// find the closest referring to a view
				while ( !( view = getView( element ) ) ) {
					// include the element's length in the final offset
					if ( element.nodeType === Node.TEXT_NODE ) {
						length += element.data.length;
					}

					element = searchPrecedingElem( element );
				}

				node = view.node;

				// include the element's length or + 1 opening element if needed
				length += hasAncestor( searchElem, element ) ? 1 : node.length;

				// compute the final offset
				offset = node.getOffset() + length;

				return offset;
			}

			// finds the closest preceding element that has a view attached to it
			function searchPrecedingElem( element ) {
				// use the parent if there's no previous sibling
				while ( !element.previousSibling ) {
					element = element.parentElement;

					if ( !element ) {
						throw new Error( 'Element doesn\'t have a parent with a view attached to it.' );
					}

					// we may use the parent since it has a view
					if ( getView( element ) ) {
						return element;
					}
				}

				element = element.previousSibling;

				// we may use the sibling
				if ( getView( element ) ) {
					return element;
				}

				while ( element.lastChild ) {
					element = element.lastChild;
					// we may use the sibling's descendant
					if ( getView( element ) ) {
						return element;
					}
				}

				return element;
			}

			// checks if the given element has the given ancestor
			function hasAncestor( elem, ancestor ) {
				var parent;

				while ( ( parent = elem.parentElement ) ) {
					if ( parent === ancestor ) {
						return true;
					}

					elem = parent;
				}

				return false;
			}

			// get the element's view, if any
			function getView( element ) {
				return element.dataset && element.dataset.vid && that.editable.getView( element.dataset.vid );
			}
		},

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

				this.checkSelectionChange();
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