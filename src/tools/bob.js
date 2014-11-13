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
		_parseProp: function( prop ) {
			if ( !prop || !utils.isString( prop ) ) {
				return null;
			}

			var parsed = propPattern.exec( prop ),
				target = parsed[ 2 ] && parsed[ 1 ],
				name = parsed[ 2 ] || parsed[ 1 ];

			return {
				name: name,
				target: target
			};
		},

		bindProp: function( property, mutator ) {
			var parsed = helpers._parseProp( property ),
				parsedMut = helpers._parseProp( mutator );

			return function( element, attr ) {
				var callback = parsedMut ?
					( parsedMut.target ? this[ parsedMut.target ] : this )[ parsedMut.name ] :
					function( value ) {
						return value;
					};

				function handler( model, newValue, oldValue ) {
					bob._setAttribute( element, attr, callback( newValue, oldValue ) );
				}

				var target = parsed.target ? this[ parsed.target ] : this;

				if ( parsed.target ) {
					this.listenTo( this[ parsed.target ], 'change:' + parsed.name, handler, this );
				} else {
					this.on( 'change:' + parsed.name, handler );
				}

				bob._setAttribute( element, attr, callback( target[ parsed.name ], target[ parsed.name ] ) );
			};
		},

		bindAttr: function( attr, property, mutator ) {
			var parsed = helpers._parseProp( property ),
				parsedMutator = utils.isString( mutator ) && helpers._parseProp( mutator );

			return function( event ) {
				var element = event.currentTarget,
					value = attr in element ? element[ attr ] : element.getAttribute( attr ),
					callback = parsedMutator ? ( parsedMutator.target ? this[ parsedMutator.target ] : this )[ parsedMutator.name ] : function( value ) {
						return value;
					};

				( parsed.target ? this[ parsed.target ] : this )[ parsed.name ] = callback( value );
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

			// add attributes
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

			var handler;

			if ( utils.isFunction( value ) ) {
				handler = value.bind( this );
			} else if ( utils.isString( value ) ) {
				var parsed = helpers._parseProp( value );

				handler = ( parsed.target ? this[ parsed.target ] : this )[ parsed.name ].bind( this );
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