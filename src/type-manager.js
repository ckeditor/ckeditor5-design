// YES, IT'S UGLY, BUT IT'S A TEMPORARY SOLUTION (hopefully)
define( [
	'nodes/break',
	'nodes/div',
	'nodes/heading',
	'nodes/image',
	'nodes/list',
	'nodes/listitem',
	'nodes/paragraph',
	'nodes/span',
	'nodes/text',
	'nodes/unknown',
	// styles
	'styles/bold',
	'styles/italic',
	'styles/underline',
	'styles/styled-node'
], function(
	brk,
	div,
	heading,
	image,
	list,
	listItem,
	paragraph,
	span,
	text,
	unknown,
	bold,
	italic,
	underline,
	StyledNode
) {
	'use strict';

	var nodeTypes = {
		// nodes
		'break': brk,
		div: div,
		heading: heading,
		image: image,
		list: list,
		listItem: listItem,
		paragraph: paragraph,
		span: span,
		text: text,
		unknown: unknown,
		// styles
		bold: bold,
		italic: italic,
		underline: underline,
	};

	function TypeManager() {
		this.types = {};
	}

	TypeManager.prototype = {
		create: function( type, operation ) {
			return this.types[ type ] ? new this.types[ type ]( operation ) : null;
		},

		register: function( types ) {
			if ( !Array.isArray( types ) ) {
				types = [ types ];
			}

			types.forEach( function( type ) {
				if ( nodeTypes[ type ] ) {
					this.types[ type ] = nodeTypes[ type ];
				}
			}, this );
		},

		matchForOperation: function( operation ) {
			var result = null;

			Object.keys( operation.attributes ).some( function( name ) {
				if ( operation.attributes[ name ] !== true ) {
					return;
				}

				var nodeClass = this.types[ name ];

				if ( nodeClass && nodeClass.prototype instanceof StyledNode ) {
					result = nodeClass;
					return true;
				}
			}, this );

			return result;
		},

		matchForDom: function( dom ) {
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
		},

		get: function( name ) {
			return this.types[ name ] || null;
		},

		isEmpty: function( type ) {
			if ( this.types[ type ] ) {
				return this.types[ type ].isEmpty;
			}

			throw new Error( 'Unknown node type: ' + type );
		}
	};

	return TypeManager;
} );