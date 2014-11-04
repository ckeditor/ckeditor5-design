define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var propPattern = /(\w+)(?:\.(\w+))?/;

	var helpers = {
		bindProp: function( property, mutator ) {
			var parsed = propPattern.exec( property );

			return function( element, attr ) {
				var callback = utils.isFunction( mutator ) ? mutator : this[ mutator ] || function( value ) {
						return value;
					},
					target = parsed[ 2 ] ? this[ parsed[ 1 ] ] : this,
					name = parsed[ 2 ] || parsed[ 1 ];

				function handler( model, newValue, oldValue ) {
					bob._setAttribute( element, attr, callback( newValue, oldValue ) );
				}

				if ( target === this ) {
					this.on( 'change:' + name, handler );
				} else {
					this.listenTo( target, 'change:' + name, handler, this );
				}

				bob._setAttribute( element, attr, callback( target[ name ], target[ name ] ) );
			};
		},

		bindAttr: function( attr, property, mutator ) {
			var parsed = propPattern.exec( property );

			return function( event ) {
				var callback = utils.isFunction( mutator ) ? mutator : this[ mutator ] || function( value ) {
						return value;
					},
					target = parsed[ 2 ] ? this[ parsed[ 1 ] ] : this,
					name = parsed[ 2 ] || parsed[ 1 ],
					element = event.currentTarget,
					value = attr in element ? element[ attr ] : element.getAttribute( attr );

				target[ name ] = callback( value );
			};
		}
	};

	var bob = {
		build: function( elem ) {
			if ( !elem ) {
				return null;
			}

			// just create a text node
			if ( !utils.isArray( elem ) ) {
				return document.createTextNode( elem );
			}

			var tag = elem[ 0 ],
				attributes = elem[ 1 ],
				element = document.createElement( tag );

			// only children were passed
			if ( utils.isArray( attributes ) ) {
				children = attributes;
				attributes = {};
				// a text content was passed (or inner HTML, we'll see)
			} else if ( attributes && !utils.isObject( attributes ) ) {
				attributes = {
					textContent: attributes
				};
			}

			// add the attributes
			if ( utils.isObject( attributes ) ) {
				Object.keys( attributes ).forEach( function( name ) {
					var value = attributes[ name ];

					// add children
					if ( name === 'children' && utils.isArray( value ) ) {
						value.forEach( function( child ) {
							if ( ( child = this.build( child ) ) ) {
								element.appendChild( child );
							}
						}, this );
						// bind an event
					} else if ( !name.indexOf( 'on' ) ) {
						this._bindEvent( element, name, value );
						// bind an attribute
					} else {
						this._bindAttribute( element, name, value );
					}
				}, this );
			}

			return element;
		},

		_bindAttribute: function( element, name, value ) {
			if ( utils.isFunction( value ) ) {
				value.call( this, element, name );
			} else {
				this._setAttribute( element, name, value );
			}
		},

		_bindEvent: function( element, event, value ) {
			event = !event.indexOf( 'on' ) ? event.substr( 2 ) : event;

			element.addEventListener( event, (
					utils.isFunction( value ) ? value : this[ value ]
				).bind( this ),
				false );
		},

		_setAttribute: function( element, name, value ) {
			if ( name in element ) {
				element[ name ] = value;
			} else {
				element.setAttribute( name, value );
			}
		}
	};

	return {
		helpers: helpers,
		mixin: bob
	};
} );