define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var sepPattern = /\s+/;

	function Element( selector ) {
		if ( utils.isString( selector ) ) {
			this._el = document.querySelector( selector );
		} else if ( selector && selector.nodeType === 1 ) { // what about 9 and 11?
			this._el = selector;
		}
	}

	// static methods
	utils.extend( Element, {
		create: function( tag ) {
			var el = document.createElement( tag );

			return new Element( el );
		},

		hasAncestor: function( element, ancestor ) {
			var parent;

			while ( ( parent = element.parentNode ) ) {
				if ( parent === ancestor ) {
					return true;
				}

				element = parent;
			}

			return false;
		}
	} );


	// prototype properties
	Object.defineProperty( Element.prototype, 'childNodes', {
		get: function() {
			return this._el.childNodes;
		}
	} );

	Object.defineProperty( Element.prototype, 'detached', {
		get: function() {
			return !this._el.parentNode;
		}
	} );

	Object.defineProperty( Element.prototype, 'firstChild', {
		get: function() {
			return this._el.firstChild;
		}
	} );

	Object.defineProperty( Element.prototype, 'lastChild', {
		get: function() {
			return this._el.lastChild;
		}
	} );

	Object.defineProperty( Element.prototype, 'nextSibling', {
		get: function() {
			return this._el.nextSibling;
		}
	} );

	Object.defineProperty( Element.prototype, 'previousSibling', {
		get: function() {
			return this._el.previousSibling;
		}
	} );

	// prototype methods
	utils.extend( Element.prototype, {
		addClass: function( value ) {
			this._el.classList.add( value.split( sepPattern ) );

			return this;
		},

		addListener: function( type, handler ) {
			this._el.addEventListener( type, handler );

			return this;
		},

		append: function( child ) {
			this._el.appendChild( child instanceof Element ? child._el : child );

			return this;
		},

		appendTo: function( target ) {
			if ( target instanceof Element ) {
				target.append( this );
			} else {
				target.appendChild( this._el );
			}

			return this;
		},

		attr: function( name, value ) {
			this._el.setAttribute( name, value );

			return this;
		},

		data: function( name, value ) {
			this._el.dataset[ name ] = value;
		},

		find: function( selector ) {
			var elems = this._el.querySelectorAll( selector );

			return Array.prototype.map.call( elems, function( elem ) {
				return new Element( elem );
			} );
		},

		findOne: function( selector ) {
			var elem = this._el.querySelector( selector );

			return elem ? new Element( elem ) : null;
		},

		getElement: function() {
			return this._el;
		},

		hasAncestor: function( ancestor ) {
			return this.constructor.hasAncestor( this._el, ancestor instanceof Element ? ancestor._el : ancestor );
		},

		hasClass: function( value ) {
			return this._el.classList.contains( value );
		},

		html: function( html ) {
			if ( html !== undefined ) {
				this._el.innerHTML = html;
				return this;
			} else {
				return this._el.innerHTML;
			}
		},

		insertAfter: function( sibling ) {
			if ( !this.detached ) {
				this._el.parentNode.insertBefore(
					sibling instanceof Element ? sibling._el : sibling,
					this._el.nextSibling
				);
			}

			return this;
		},

		insertBefore: function( sibling ) {
			if ( !this.detached ) {
				this._el.parentNode.insertBefore(
					sibling instanceof Element ? sibling._el : sibling,
					this._el
				);
			}

			return this;
		},

		prepend: function( child ) {
			if ( this._el.childNodes.length ) {
				this._el.insertBefore( child instanceof Element ? child._el : child, this._el.firstChild );
			} else {
				this.append( child );
			}
		},

		remove: function() {
			if ( !this.detached ) {
				this._el.parentNode.removeChild( this._el );
			}

			return this;
		},

		removeClass: function( value ) {
			this._el.classList.remove( value.split( sepPattern ) );

			return this;
		},

		removeData: function( name ) {
			delete this._el.dataset[ name ];
		},

		removeListener: function( type, handler ) {
			this._el.removeEventListener( type, handler );

			return this;
		},

		setStyle: function( prop, value ) {
			if ( utils.isString( prop ) ) {
				this._el.style[ prop ] = value;
			} else if ( utils.isObject( prop ) ) {
				Object.keys( prop ).forEach( function( key ) {
					this._el.style[ key ] = prop[ key ];
				} );
			}

			return this;
		},

		text: function( text ) {
			if ( text !== undefined ) {
				this._el.textContent = text;
			} else {
				return this._el.textContent;
			}
		},

		toggleClass: function( value, state ) {
			var hasClass = this.hasClass( value );

			if ( state === undefined ) {
				this._el.classList.toggle( value );
			} else if ( state ) {
				this.addClass( value );
			} else {
				this.removeClass( value );
			}

			return this;
		}
	} );

	return Element;
} );