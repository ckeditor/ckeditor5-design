define( function() {
	'use strict';

	function NodeManager() {
		this._list = [];
		this._items = {};
	}

	NodeManager.prototype = {
		// create a node from the given data if a proper node type constructor exists
		create: function( data ) {
			var constructor = this._items[ typeof data === 'string' ? data : data.type ];
			return constructor ? new constructor[ 1 ]( data ) : null;
		},

		// return an ordered list of node constructors names
		list: function() {
			return this._list.map( function( item ) {
				return item[ 0 ];
			} );
		},

		// register a constructor for a node type, default priority = 10
		register: function( constructor, priority ) {
			var type = constructor.type;

			if ( typeof priority != 'number' ) {
				priority = 10;
			}

			var item = [ type, constructor, priority ];

			// override the existing node constructor with the same type
			if ( this._items[ type ] ) {
				this.unregister( type );
			}

			this._items[ type ] = item;

			for ( var i = this._list.length - 1; i > 0; i-- ) {
				if ( this._list[ i ][ 2 ] <= priority ) {
					this._list.splice( i + 1, 0, item );
					return;
				}
			}

			this._list.unshift( item );
		},

		// unregister a node constructor
		unregister: function( name ) {
			delete this._items[ name ];

			for ( var i = this.length - 1; i >= 0; i-- ) {
				if ( this._list[ i ][ 0 ] === name ) {
					this._list.splice( i, 1 );
					return;
				}
			}
		},

		// find a style constructor for the given data
		matchStyleForData: function( data ) {
			var result = null;

			Object.keys( data ).some( function( name ) {
				// we use booleans for style flags only (for now at least)
				if ( data[ name ] === true && this._items[ name ] ) {
					result = this._items[ name ][ 1 ];

					return true;
				}
			}, this );

			return result;
		},

		// find a node constructor for the given DOM element
		matchForDom: function( dom ) {
			var result = null,
				tag = dom.nodeName.toLowerCase();

			this._list.some( function( item ) {
				var nodeClass = item[ 1 ];
				// match the tag
				if ( nodeClass.tags.indexOf( tag ) > -1 ) {
					result = nodeClass;
					return true;
				}

				// TODO add other types of matching
			}, this );

			return result;
		},

		// return a node constructor with the given name or all the constructors
		get: function( name ) {
			return name !== undefined ? this._items[ name ][ 1 ] : this._list.map( function( item ) {
				return item[ 1 ];
			} );
		}
	};

	return new NodeManager();
} );