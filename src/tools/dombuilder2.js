define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var selectorPattern = /(^|#|\.)([^#\.\[\]]+)|(\[.+?\])/g,
		attributePattern = /\[(.+?)(?:=("|'|)(.*)\2)?\]/;

	function parseSelector( selector ) {
		var attributes = {},
			classes = [],
			id, match, tag;

		while ( ( match = selectorPattern.exec( selector ) ) ) {
			if ( match[ 1 ] === '#' ) {
				// ID
				id = match[ 2 ];
			} else if ( match[ 1 ] === '.' ) {
				// classes
				classes.push( match[ 2 ] );
			} else if ( !match[ 1 ] ) {
				if ( match[ 0 ].charAt( 0 ) === '[' ) {
					// attribute
					var arg = attributePattern.exec( match[ 0 ] );
					attributes[ arg[ 1 ] ] = arg[ 3 ];
				} else {
					// tag
					tag = match[ 2 ];
				}
			}
		}

		if ( classes.length ) {
			attributes.className = classes.join( ' ' );
		}

		if ( id ) {
			attributes.id = id;
		}

		return {
			attributes: attributes,
			tag: tag || 'div'
		};
	}

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

	function domBuilder( selector, attributes, children ) {
		var parsed = parseSelector( selector ),
			element = document.createElement( parsed.tag );

		if ( utils.isArray( attributes ) ) {
			children = attributes;
			attributes = {};
		}

		attributes = utils.extend( parsed.attributes, attributes );

		Object.keys( attributes ).forEach( function( name ) {
			var value = attributes[ name ];

			if ( !name.indexOf( 'on' ) ) {
				bindEvent( element, name, value );
			} else {
				setAttribute( element, name, value );
			}
		} );

		if ( utils.isArray( children ) ) {
			children.forEach( function( child ) {
				element.appendChild( child );
			} );
		}

		return element;
	}

	domBuilder.watchProp = function( target, name, callback ) {
		callback = callback || function( newValue ) {
			return newValue;
		};

		return function( element, attr ) {
			target.on( 'change:' + name, function( model, newValue, oldValue ) {
				setAttribute( element, attr, callback( newValue, oldValue ) );
			} );

			setAttribute( element, attr, target[ name ] );
		};
	};

	domBuilder.bindAttr = function( attribute, target, property ) {
		return function( evt ) {
			evt = evt || event;

			var elem = evt.currentTarget || this,
				value = attribute in elem ? elem[ attribute ] : elem.getAttribute( attribute );

			target[ property ] = value;
		};
	};

	return domBuilder;
} );