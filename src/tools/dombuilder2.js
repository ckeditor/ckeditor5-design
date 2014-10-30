define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var propPattern = /(\w+)(?:\.(\w+))?(?:\:(\w+))?/;

	var DOMBuilderMixin = {
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
						console.log( 'bind attr', name, value );
						this._bindAttribute( element, name, value );
					}
				}, this );
			}

			return element;
		},

		_bindAttribute: function( element, name, value ) {
			var parsed;

			if ( utils.isFunction( value ) ) {
				value( element, name );
			} else if ( ( parsed = this._parseProperty( value ) ) ) {
				this._bindProperty( element, name, parsed );
			} else {
				this._setAttribute( element, name, value );
			}
		},

		_bindEvent: function( element, name, value ) {
			name = !name.indexOf( 'on' ) ? name.substr( 2 ) : name;

			element.addEventListener( name, (
					utils.isFunction( value ) ? value : this[ value ]
				).bind( this ),
				false );
		},

		_bindProperty: function( element, attr, parsed ) {
			var callback = this[ parsed.mutator ] || function( value ) {
					return value;
				},
				target = parsed.target,
				name = parsed.prop,
				that = this;

			function handler( model, newValue, oldValue ) {
				that._setAttribute( element, attr, callback( newValue, oldValue ) );
			}

			if ( target === this ) {
				this.on( 'change:' + name, handler );
			} else {
				this.listenTo( target, 'change:' + name, handler, this );
			}

			that._setAttribute( element, attr, callback( target[ name ], target[ name ] ) );
		},

		_parseProperty: function( name ) {
			var match = propPattern.exec( name );

			if ( !match || !( match[ 1 ] in this ) ) {
				return null;
			}

			return {
				target: match[ 2 ] ? this[ match[ 1 ] ] : this,
				prop: match[ 2 ] || match[ 1 ],
				mutator: match[ 3 ]
			};
		},

		_setAttribute: function( element, name, value ) {
			if ( name in element ) {
				element[ name ] = value;
			} else {
				element.setAttribute( name, value );
			}
		}
	};

	return DOMBuilderMixin;
} );