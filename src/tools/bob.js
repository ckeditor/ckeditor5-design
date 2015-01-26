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

	function returnCallback( value ) {
		return value;
	}

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

		bindAttr: function( attr, property, callback ) {
			var parsed = helpers._parseProp( property ),
				parsedCbk = helpers._parseProp( callback );

			return function( event ) {
				var element = event.currentTarget,
					value = attr in element ? element[ attr ] : element.getAttribute( attr ),
					target = parsed.target ? this[ parsed.target ] : this,
					cbk;

				if ( parsedCbk ) {
					cbk = ( parsedCbk.target ? this[ parsedCbk.target ] : this )[ parsedCbk.name ];
				} else if ( utils.isFunction( callback ) ) {
					cbk = callback;
				} else {
					cbk = returnCallback;
				}

				target[ parsed.name ] = cbk.call( target, value );
			};
		},

		bindClassToggle: function( name, property, callback ) {
			var negate = false;

			if ( property.charAt( 0 ) === '!' ) {
				negate = true;
				property = property.substr( 1 );
			}

			var parsed = helpers._parseProp( property ),
				parsedCbk = helpers._parseProp( callback );

			return function( element ) {
				var cbk;

				if ( parsedCbk ) {
					cbk = ( parsedCbk.target ? this[ parsedCbk.target ] : this )[ parsedCbk.name ];
				} else if ( utils.isFunction( callback ) ) {
					cbk = callback;
				} else {
					cbk = returnCallback;
				}

				function setClass( add ) {
					if ( negate ) {
						add = !add;
					}

					element.classList[ add ? 'add' : 'remove' ]( name );
				}

				function handler( model, newValue, oldValue ) {
					setClass( cbk( newValue, oldValue ) );
				}

				var target = parsed.target ? this[ parsed.target ] : this;

				if ( parsed.target ) {
					this.listenTo( this[ parsed.target ], 'change:' + parsed.name, handler, this );
				} else {
					this.on( 'change:' + parsed.name, handler );
				}

				setClass( cbk( target[ parsed.name ], target[ parsed.name ] ) );
			};
		},

		bindProp: function( property, callback ) {
			var parsed = helpers._parseProp( property ),
				parsedCbk = helpers._parseProp( callback );

			return function( element, attr ) {
				var target = parsed.target ? this[ parsed.target ] : this,
					handler,
					cbk;

				if ( parsedCbk ) {
					cbk = ( parsedCbk.target ? this[ parsedCbk.target ] : this )[ parsedCbk.name ];
				} else if ( utils.isFunction( callback ) ) {
					cbk = callback;
				} else {
					cbk = returnCallback;
				}

				// set the element's attribute
				if ( attr ) {
					handler = function( model, newValue, oldValue ) {
						bob._setAttribute( element, attr, cbk( newValue, oldValue ) );
					};

					bob._setAttribute( element, attr, cbk( target[ parsed.name ], target[ parsed.name ] ) );
					// set the element's class
				} else {
					var last;

					handler = function( model, newValue, oldValue ) {
						var value = cbk( newValue, oldValue );

						if ( last ) {
							if ( last === value ) {
								return;
							}

							element.classList.remove( last );
						}

						last = value;

						if ( value ) {
							element.classList.add( value );
						}
					};

					var value = cbk( target[ parsed.name ], target[ parsed.name ] );

					last = value;

					if ( value ) {
						element.classList.add( value );
					}
				}

				if ( parsed.target ) {
					this.listenTo( this[ parsed.target ], 'change:' + parsed.name, handler, this );
				} else {
					this.on( 'change:' + parsed.name, handler );
				}
			};
		},
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
						// bind classes
					} else if ( name === 'classes' ) {
						if ( !utils.isArray( value ) ) {
							return;
						}

						this._bindClasses( element, value );
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
				var parsed = helpers._parseProp( value ),
					target = parsed.target ? this[ parsed.target ] : this;

				handler = target[ parsed.name ].bind( target );
			} else {
				throw new Error( 'Nope' );
			}

			element.addEventListener( event, handler, false );
		},

		_bindClasses: function( element, classes ) {
			classes.forEach( function( value ) {
				if ( utils.isString( value ) ) {
					element.classList.add( value );
				} else if ( utils.isFunction( value ) ) {
					value.call( this, element );
				}
			}, this );
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