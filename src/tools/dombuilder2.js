define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function bindEvent( element, name, handler ) {
		var event = name.substr( 2 );

		element.addEventListener( event, handler, false );
	}

	function setAttribute( element, name, value ) {
		if ( utils.isFunction( value ) ) {
			value( element, name );
		} else {
			if ( name in element ) {
				element[ name ] = value;
			} else {
				element.setAttribute( name, value );
			}
		}
	}

	function build( elem ) {
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
		}

		// add the attributes
		if ( utils.isObject( attributes ) ) {
			Object.keys( attributes ).forEach( function( name ) {
				var value = attributes[ name ];

				if ( !name.indexOf( 'on' ) ) {
					bindEvent( element, name, value );
				} else {
					setAttribute( element, name, value );
				}
			} );
		}

		// build and add the children
		if ( utils.isArray( children ) ) {
			children.forEach( function( child ) {
				if ( ( child = build( child ) ) ) {
					element.appendChild( child );
				}
			} );
		}

		return element;
	}

	function bindAttr( attribute, target, property ) {
		return function( evt ) {
			var elem = evt.currentTarget || this,
				value = attribute in elem ? elem[ attribute ] : elem.getAttribute( attribute );

			target[ property ] = value;
		};
	}

	function watchProp( target, name, callback ) {
		callback = callback || function( newValue ) {
			return newValue;
		};

		return function( element, attr ) {
			// TODO use listenTo for easier unbinding in future,
			// besides this guarantees a memory leak now...
			this.listenTo( target, 'change:' + name, function( model, newValue, oldValue ) {
				setAttribute( element, attr, callback( newValue, oldValue ) );
			}, this );

			setAttribute( element, attr, callback( target[ name ], target[ name ] ) );
		}.bind( this );
	}

	return {
		bindAttr: bindAttr,
		build: build,
		watchProp: watchProp
	};
} );