define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var propPattern = /(\w+)(?:\.(\w+))?/,
		attAliases = {
			'text': 'textContent'
		};

	var helpers = {
		bindProp: function( property, mutator ) {
			var parsed = propPattern.exec( property );

			return function( element, attr ) {
				var callback = this[ mutator ] || function( value ) {
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
				var callback = this[ mutator ] || function( value ) {
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
				children = elem[ 2 ],
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

					// bind an event
					if ( !name.indexOf( 'on' ) ) {
						this._bindEvent( element, name, value );
						// bind an attribute
					} else {
						this._bindAttribute( element, name, value );
					}
				}, this );
			}

			// add children
			if ( utils.isArray( children ) ) {
				children.forEach( function( child ) {
					if ( ( child = this.build( child ) ) ) {
						element.appendChild( child );
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

			var handler = utils.isFunction( value ) ? value : this[ value ];

			if ( utils.isFunction( value ) ) {
				handler = value.bind( this );
			} else if ( utils.isString( value ) ) {
				var parsed = propPattern.exec( value ),
					target = parsed[ 2 ] ? this[ parsed[ 1 ] ] : this,
					name = parsed[ 2 ] || parsed[ 1 ];

				handler = target[ name ].bind( target );
			} else {
				throw new Error( 'Nope' );
			}


			element.addEventListener( event, handler, false );
		},

		_setAttribute: function( element, name, value ) {
			name = attAliases[ name ] || name;

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