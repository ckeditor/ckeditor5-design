define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function domBuilder( type, props, children ) {
		if ( type === 'text' ) {
			return document.createTextNode( props );
		}

		var element = document.createElement( type );

		if ( utils.isArray( props ) ) {
			children = props;
			props = {};
		} else if ( utils.isString( props ) || utils.isNumber( props ) ) {
			element.innerHTML = props;
		}

		Object.keys( props ).forEach( function( key ) {
			if ( key === 'id' || key === 'className' || key === 'src' || key === 'value' ) {
				element[ key ] = props[ key ];
			} else if ( key === 'html' ) {
				element.innerHTML = props[ key ];
			} else if ( key === 'text' ) {
				element.textContent = props[ key ];
			} else {
				element.setAttribute( key, props[ key ] );
			}
		} );

		if ( utils.isArray( children ) ) {
			children.forEach( function( child ) {
				element.appendChild( child );
			} );
		}

		return element;
	}

	return domBuilder;
} );