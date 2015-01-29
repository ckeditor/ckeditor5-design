define( function() {
	'use strict';

	function NodeManager() {
		this.store = {};
	}

	NodeManager.prototype = {
		// create a node from the given data if a proper node type constructor exists
		create: function( name, data ) {
			return this.store[ name ] ? new this.store[ name ]( data ) : null;
		},

		// register a constructor for a node type
		register: function( constructor ) {
			if ( constructor.type && !this.store[ constructor.type ] ) {
				this.store[ constructor.type ] = constructor;
			}
		},

		// find a style constructor for the given data
		matchStyleForData: function( data ) {
			// TODO
		},

		// find a node constructor for the given DOM element
		matchForDom: function( dom ) {
			var result = null,
				tag = dom.nodeName.toLowerCase();

			Object.keys( this.store ).some( function( name ) {
				var nodeClass = this.store[ name ];

				// match the tag
				if ( nodeClass.tags.indexOf( tag ) > -1 ) {
					result = nodeClass;
					return true;
				}

				// TODO add other types of matching
			}, this );

			return result;
		},

		// return a node constructor with the given name
		get: function( name ) {
			return this.store[ name ] || null;
		},

		// check if a node produced by the node construtor with the given name should be empty
		isEmpty: function( name ) {
			if ( this.store[ name ] ) {
				return this.store[ name ].isEmpty;
			}

			throw new Error( 'Unknown node type: ' + name );
		}
	};

	return new NodeManager();
} );