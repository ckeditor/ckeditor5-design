define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Node( op ) {
		this.op = op || null;
		this.document = null;
		this.parent = null;
		this.root = null;

		this._contentLength = 0;

		Object.defineProperty( this, 'length', {
			get: function() {
				// add the opening and closing elements to the length
				return this._contentLength + ( this.isContent() ? 0 : 2 );
			},

			set: function( length ) {
				this._contentLength = length;
			}
		} );

	}

	// static props
	Node.type = null;
	Node.tags = [];
	Node.attributes = [];
	Node.isContent = false;

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
	utils.extend( Node.prototype, {
		isContent: function() {
			return this.constructor.isContent;
		},

		adjustLength: function( length ) {
			this._contentLength += length;
		}
	} );

	return Node;
} );