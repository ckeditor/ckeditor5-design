define( [
	'nodes/text',
	'tools/utils'
], function(
	TextNode,
	utils
) {
	'use strict';

	// InlineNode is the base class for inline converters. It is not present in the document model.
	function InlineNode() {
		TextNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( InlineNode, TextNode, {
		inline: true,

		toData: function( options ) {
			var attributes = {};

			attributes[ this.type ] = true;

			// save additional attributes
			utils.extend( attributes, this.pickAttributes( options.element ) );

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

	return InlineNode;
} );