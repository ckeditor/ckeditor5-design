define( [
	'nodes/text',
	'tools/utils'
], function(
	TextNode,
	utils
) {
	'use strict';

	function StyledNode() {
		TextNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( StyledNode, TextNode, {
		toData: function( dom ) {
			var attributes = {};

			attributes[ this.type ] = true;

			// save additional attributes
			utils.extend( attributes, this.pickAttributes( dom, this.attributes ) );

			return attributes;
		},

		toDom: function( data, doc ) {
			var dom = doc.createElement( this.tags[ 0 ] ),
				attributes = utils.pick( data.attributes, this.attributes );

			// apply additional attributes
			Object.keys( attributes ).forEach( function( name ) {
				dom.setAttribute( name, attributes[ name ] );
			} );

			return dom;
		}
	} );

	// inherit prototype
	utils.inherit( StyledNode, TextNode );

	utils.extend( StyledNode.prototype, {
		// TODO
	} );

	return StyledNode;
} );