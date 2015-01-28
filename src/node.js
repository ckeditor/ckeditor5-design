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

	// convert a DOM element into an operation
	Node.toOperation = function( dom ) {
		return {
			type: this.type,
			attributes: this.pickAttributes( dom, this.attributes )
		};
	};

	// convert an operation into a DOM element
	Node.toDom = function( operation, doc ) {
		var tags = this.tags;

		// there's only one tag defined so we just assume that's the one
		// we want to use for the DOM element
		if ( tags.length === 1 ) {
			var dom = doc.createElement( tags[ 0 ] ),
				attributes = utils.pick( operation.attributes, this.attributes );

			// apply selected attributes on the newly created DOM element
			Object.keys( attributes ).forEach( function( name ) {
				var value;

				// there's no point in setting empty attributes... I guess?
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
			// include the opening and closing operations in the final node length
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
		// increase/decrease length by the given difference
		adjustLength: function( difference ) {
			this._length += difference;
		},

		// returns the offset of a node from the beginning of the document,
		// this corresponds to the position in the linear data
		getOffset: function() {
			// it's the topmost element
			if ( !this.parent ) {
				return 0;
			}

			var offset = this.parent.getOffset();

			// add 1 for parent's opening element
			if ( this.parent !== this.root ) {
				offset += 1;
			}

			// add lengths of the siblings to the final offset
			var found = this.parent.children.some( function( child ) {
				if ( child === this ) {
					return true;
				}

				offset += child.length;
			}, this );

			if ( !found ) {
				throw new Error( 'Node not found in its parent\'s children array.' );
			}

			return offset;
		}
	} );

	return Node;
} );