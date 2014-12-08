'use strict';

// YES, IT'S UGLY, BUT IT'S A TEMPORARY SOLUTION
var nodeTypes = {
	// nodes
	'break': require( './nodes/break' ),
	div: require( './nodes/div' ),
	heading: require( './nodes/heading' ),
	image: require( './nodes/image' ),
	list: require( './nodes/list' ),
	listItem: require( './nodes/listitem' ),
	paragraph: require( './nodes/paragraph' ),
	span: require( './nodes/span' ),
	text: require( './nodes/text' ),
	unknown: require( './nodes/unknown' ),
	// styles
	bold: require( './styles/bold' ),
	italic: require( './styles/italic' ),
	underline: require( './styles/underline' )
};

var StyledNode = require( './styles/styled-node' );

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

TypeManager.prototype.matchForData = function( data ) {
	var result = null;

	Object.keys( data.attributes ).some( function( name ) {
		if ( data.attributes[ name ] !== true ) {
			return;
		}

		var nodeClass = this.types[ name ];

		if ( nodeClass && nodeClass.prototype instanceof StyledNode ) {
			result = nodeClass;
			return true;
		}
	}, this );

	return result;
};

TypeManager.prototype.matchForDom = function( dom ) {
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

TypeManager.prototype.isEmpty = function( type ) {
	if ( this.types[ type ] ) {
		return this.types[ type ].isEmpty;
	}

	throw new Error( 'Unknown node type: ' + type );
};

module.exports = TypeManager;