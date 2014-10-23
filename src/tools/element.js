define( [
	'tools/dom',
	'tools/utils'
], function(
	dom,
	utils
) {
	'use strict';

	function Element( selector ) {
		if ( utils.isString( selector ) ) {
			this._el = document.querySelector( selector );
		} else if ( selector && selector.nodeType === 1 ) { // what about 9 and 11?
			this._el = selector;
		}
	}

	Element.prototype = {
		addClass: function( value ) {
			dom.addClass( this._el, value );

			return this;
		},

		attr: function( name, value ) {
			dom.attr( this._el, name, value );

			return this;
		},

		find: function( selector ) {
			var elem = dom.find( this._el, selector );

			return elem ? new Element( elem ) : null;
		},

		getElement: function() {
			return this._el;
		},

		html: function( html ) {
			if ( html ) {
				dom.html( this._el, html );
				return this;
			} else {
				return this._el.innerHTML;
			}
		},

		off: function( type, handler ) {
			dom.off( this._el, type, handler );

			return this;
		},

		on: function( type, handler ) {
			dom.on( this._el, type, handler );

			return this;
		},

		remove: function() {
			dom.remove( this._el );

			return this;
		},

		removeClass: function( value ) {
			dom.removeClass( this._el, value );

			return this;
		},

		setStyle: function( prop, value ) {
			dom.setStyle( this._el, prop, value );

			return this;
		},

		text: function( text ) {
			if ( text ) {
				dom.text( this._el, text );
			} else {
				return this._el.textContent;
			}
		},

		toggleClass: function( value, state ) {
			dom.toggleClass( this._el, value );

			return this;
		}
	};

	return Element;
} );