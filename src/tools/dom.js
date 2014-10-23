define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var sepPattern = /\s+/;

	var dom = {
		addClass: function( elem, value ) {
			elem.classList.add( value.split( sepPattern ) );
		},

		attr: function( elem, name, value ) {
			elem.setAttribute( name, value );
		},

		find: function( elem, selector ) {
			return elem.querySelector( selector );
		},

		hasClass: function( elem, value ) {
			return elem.classList.contains( value );
		},

		html: function( elem, html ) {
			elem.innerHTML = html;
		},

		off: function( elem, type, handler ) {
			elem.removeEventListener( type, handler );
		},

		on: function( elem, type, handler ) {
			elem.addEventListener( type, handler );
		},

		remove: function( elem ) {
			elem.parentNode.removeChild( elem );
		},

		removeClass: function( elem, value ) {
			elem.classList.remove( value.split( sepPattern ) );
		},

		setStyle: function( elem, prop, value ) {
			if ( utils.isString( prop ) ) {
				elem.style[ prop ] = value;
			} else if ( utils.isObject( prop ) ) {
				Object.keys( prop ).forEach( function( key ) {
					elem.style[ key ] = prop[ key ];
				} );
			}
		},

		text: function( elem, text ) {
			elem.textContent = text;
		},

		toggleClass: function( elem, value, state ) {
			if ( state && !elem.classList.contains( value ) ) {
				this.addClass( elem, value );
			} else if ( state === false && elem.classList.contains( value ) ) {
				this.removeClass( elem, value );
			} else {
				if ( elem.classList.contains( value ) ) {
					this.removeClass( elem, value );
				} else {
					this.addClass( elem, value );
				}
			}
		}
	};

	return dom;
} );