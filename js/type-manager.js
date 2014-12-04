'use strict';

// YES, IT'S UGLY, BUT IT'S A TEMPORARY SOLUTION
var nodeTypes = {
	// nodes
	'break': require( './nodes/break' ),
	div: require( './nodes/div' ),
	heading: require( './nodes/heading' ),
	image: require( './nodes/image' ),
	list: require( './nodes/list' ),
	listitem: require( './nodes/listitem' ),
	paragraph: require( './nodes/paragraph' ),
	span: require( './nodes/span' ),
	text: require( './nodes/text' ),
	unknown: require( './nodes/unknown' ),
	// formats
	bold: require( './formats/bold' ),
	italic: require( './formats/italic' ),
	underline: require( './formats/underline' )
};

function TypeManager() {
	this.types = {};
}

TypeManager.prototype.register = function( types ) {
	if ( !Array.isArray( types ) ) {
		types = [ types ];
	}

	types.forEach( function( type ) {
		if ( nodeTypes[ type ] ) {
			this.types[ type ] = nodeTypes[ type ];
		}
	}, this );
};

TypeManager.prototype.match = function( dom ) {
	var result = null,
		tag = dom.nodeName.toLowerCase();

	Object.keys( this.types ).some( function( type ) {
		var nodeClass = this.types[ type ];

		if ( nodeClass.tags.indexOf( tag ) > -1 ) {
			result = nodeClass;
			return true;
		}
	}, this );

	return result;
};

TypeManager.prototype.get = function( name ) {
	return this.types[ name ] || null;
};

TypeManager.prototype.create = function( type, data ) {
	return this.types[ type ] ? new this.types[ type ]( data ) : null;
};

module.exports = TypeManager;