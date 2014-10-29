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

	Element.prototype = {
		addClass: function( value ) {
			this._el.classList.add( value.split( sepPattern ) );

			return this;
		},

		append: function( child ) {
			this._el.appendChild( child );

			return this;
		},

		attr: function( name, value ) {
			this._el.setAttribute( name, value );

			return this;
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
			this._el.parentNode.insertBefore( sibling, this._el.nextSibling );

			return this;
		},

		insertBefore: function( sibling ) {
			this._el.parentNode.insertBefore( sibling, this._el );

			return this;
		},

		off: function( type, handler ) {
			this._el.removeEventListener( type, handler );

			return this;
		},

		on: function( type, handler ) {
			this._el.addEventListener( type, handler );

			return this;
		},

		remove: function() {
			this._el.parentNode.removeChild( this._el );

			return this;
		},

		removeClass: function( value ) {
			this._el.classList.remove( value.split( sepPattern ) );

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
			this._el.classList.toggle( value, state );

			return this;
		}
	};

	return Element;
} );