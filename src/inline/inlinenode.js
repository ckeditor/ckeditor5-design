define( [
	'nodes/text',
	'tools/utils'
], function(
	TextNode,
	utils
) {
	'use strict';

	function InlineNode() {
		TextNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( InlineNode, TextNode, {
		toData: function( options ) {
			var attributes = {};

			attributes[ this.type ] = true;

			// save additional attributes
			utils.extend( attributes, this.pickAttributes( options.element, this.attributes ) );

			options.onAttributes( attributes );
		},

		toDom: function( data, doc ) {
			var dom = doc.createElement( this.tags[ 0 ] ),
				attributes = utils.pick( data, this.attributes );

			// apply additional attributes
			Object.keys( attributes ).forEach( function( name ) {
				dom.setAttribute( name, attributes[ name ] );
			} );

			return dom;
		}
	} );

	// inherit prototype
	utils.inherit( InlineNode, TextNode );

	utils.extend( InlineNode.prototype, {
		// TODO
	} );

	return InlineNode;
} );