define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Node( op ) {
		this.op = op || null;
		this.parent = null;
		this.root = null;

		this._length = 0;
	}

	// static properties
	Node.type = null;
	Node.tags = [];
	Node.attributes = [];
	Node.isWrapped = true;

	// static methods
	Node.pickAttributes = function( dom, attributes ) {
		var result = {};

		attributes.forEach( function( attribute ) {
			result[ attribute ] = dom.getAttribute( attribute );
		} );

		return result;
	};

	Node.toOperation = function( dom ) {
		return {
			type: this.type,
			attributes: this.pickAttributes( dom, this.attributes )
		};
	};

	Node.toDom = function( operation, doc ) {
		var tags = this.tags;

		if ( tags.length === 1 ) {
			var dom = doc.createElement( tags[ 0 ] ),
				attributes = utils.pick( operation.attributes, this.attributes );

			Object.keys( attributes ).forEach( function( name ) {
				var value;

				if ( ( value = attributes[ name ] ) !== null ) {
					dom.setAttribute( name, value );
				}
			} );

			return dom;
		}

		throw new Error( 'Override toDom in a subclass' );
	};

	// prototype
	Object.defineProperty( Node.prototype, 'length', {
		get: function() {
			// add the opening and closing elements to the length
			return this._length + ( this.isWrapped ? 2 : 0 );
		},

		set: function( length ) {
			this._length = length;
		}
	} );

	Object.defineProperty( Node.prototype, 'isWrapped', {
		get: function() {
			return this.constructor.isWrapped;
		}
	} );

	utils.extend( Node.prototype, {
		adjustLength: function( length ) {
			this._length += length;
		}
	} );

	return Node;
} );