define( function() {
	'use strict';

	function NodeManager() {
		this.store = {};
	}

	NodeManager.prototype = {
		create: function( name, operation ) {
			return this.store[ name ] ? new this.store[ name ]( operation ) : null;
		},

		register: function( constructor ) {
			if ( constructor.type && !this.store[ constructor.type ] ) {
				this.store[ constructor.type ] = constructor;
			}
		},

		matchForOperation: function( operation ) {
			var result = null;

			if ( !operation[ 1 ] ) {
				return result;
			}

			Object.keys( operation[ 1 ] ).some( function( name ) {
				// use boolean type for styles only?
				if ( operation[ 1 ][ name ] !== true ) {
					return;
				}

				var nodeClass = this.store[ name ];

				// TODO
				if ( nodeClass ) {
					// if ( nodeClass && nodeClass.prototype instanceof StyledNode ) {
					result = nodeClass;
					return true;
				}
			}, this );

			return result;
		},

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

		get: function( name ) {
			return this.store[ name ] || null;
		},

		isEmpty: function( name ) {
			if ( this.store[ name ] ) {
				return this.store[ name ].isEmpty;
			}

			throw new Error( 'Unknown node type: ' + name );
		}
	};

	return new NodeManager();
} );