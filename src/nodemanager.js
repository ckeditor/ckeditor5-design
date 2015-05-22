define( function() {
	'use strict';

	function NodeManager() {

		this._list = [];

		this._items = {};
	}

	NodeManager.prototype = {
		// clear all registered nodes
		clear: function() {
			// Array of [ [ type, constructor, priority ], [ type, constructor, priority ], ... ]
			// sorted by priority
			this._list = [];

			// type => [ type, constructor, priority ]
			this._items = {};
		},

		// create a node from the given data if a proper node type constructor exists
		// data -linear data item ({type: <type>, attributes: {} })
		create: function( data ) {
			var constructor = this._items[ typeof data === 'string' ? data : data.type ];
			return constructor ? new constructor[ 1 ]( data ) : null;
		},

		// return a node constructor with the given type or all the constructors
		get: function( type ) {
			return type !== undefined ?
				this._items[ type ] && this._items[ type ][ 1 ] :
				this._list.map( function( item ) {
					return item[ 1 ];
				} );
		},

		// return an ordered list of node constructors types
		// TODO: do we need this?
		list: function() {
			return this._list.map( function( item ) {
				return item[ 0 ];
			} );
		},

		// find a style constructor for the given data
		// TODO deprecated because now multiple converters can handle the same node
		matchStyleForData: function( data ) {
			var result = null;

			Object.keys( data ).some( function( type ) {
				// we use booleans for style flags only (for now at least)
				if ( data[ type ] === true && this._items[ type ] ) {
					result = this._items[ type ][ 1 ];

					return true;
				}
			}, this );

			return result;
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

			for ( var i = this._list.length - 1; i >= 0; i-- ) {
				if ( this._list[ i ][ 2 ] <= priority ) {
					this._list.splice( i + 1, 0, item );
					return;
				}
			}

			this._list.unshift( item );
		},

		// unregister a node constructor
		unregister: function( type ) {
			delete this._items[ type ];

			for ( var i = this._list.length - 1; i >= 0; i-- ) {
				if ( this._list[ i ][ 0 ] === type ) {
					this._list.splice( i, 1 );
					return;
				}
			}
		}
	};

	return new NodeManager();
} );