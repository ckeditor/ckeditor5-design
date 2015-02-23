define( [
	'view',
	'tools/emitter',
	'tools/utils'
], function(
	View,
	Emitter,
	utils
) {
	'use strict';

	function Node( data ) {
		this.data = data || null;

		this.isRendered = false;

		this.document = null;
		this.parent = null;
		this.view = null;

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
			var value = dom.getAttribute( attribute );

			if ( value !== null ) {
				result[ attribute ] = value;
			}
		} );

		return result;
	};

	// convert a DOM element into data
	Node.toData = function( dom ) {
		return {
			type: this.type,
			attributes: this.pickAttributes( dom, this.attributes )
		};
	};

	// convert data into a DOM element
	Node.toDom = function( data, doc ) {
		var tags = this.tags;

		// there's only one tag defined so we just assume that's the one
		// we want to use for the DOM element
		if ( tags.length === 1 ) {
			var dom = doc.createElement( tags[ 0 ] ),
				attributes = data.attributes ? utils.pick( data.attributes, this.attributes ) : [];

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

	Object.defineProperty( Node.prototype, 'depth', {
		get: function() {
			var depth = 0,
				parent = this.parent;

			while ( parent ) {
				depth++;

				parent = parent.parent;
			}

			return depth;
		}
	} );

	Object.defineProperty( Node.prototype, 'length', {
		get: function() {
			// include the opening and closing element data in the final node length
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

	Object.defineProperty( Node.prototype, 'nextSibling', {
		get: function() {
			var idx;

			// no parent or child doesn't exist in parent's children
			if ( !this.parent || ( idx = this.parent.indexOf( this ) ) == -1 ) {
				return null;
			}

			return this.parent.childAt( idx + 1 );
		}
	} );

	Object.defineProperty( Node.prototype, 'previousSibling', {
		get: function() {
			var idx;

			// no parent or child doesn't exist in parent's children
			if ( !this.parent || ( idx = this.parent.indexOf( this ) ) == -1 ) {
				return null;
			}

			return this.parent.childAt( idx - 1 );
		}
	} );

	Object.defineProperty( Node.prototype, 'type', {
		get: function() {
			return this.constructor.type;
		}
	} );

	utils.extend( Node.prototype, Emitter, {
		// increase/decrease length by the given difference
		adjustLength: function( difference ) {
			this._length += difference;
		},

		// attach node to the parent element
		attachTo: function( target ) {
			this.parent = target;
			this.document = target.document;
		},

		// detach the node
		detach: function() {
			this.parent = null;
			this.document = null;
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
			if ( this.parent ) {
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
		},

		// check if the given node is this node's ancestor
		hasAncestor: function( node ) {
			var current = this;

			while ( ( current = current.parent ) ) {
				if ( current === node ) {
					return true;
				}
			}

			return false;
		},

		render: function() {
			// TODO what document should we use?
			var elem = this.constructor.toDom( this.data || {}, document );

			this.view = new View( this, elem );

			this.document.editable.addView( this.view );

			this.isRendered = true;
		},

		// replace this node with the given one
		replace: function( nodes ) {
			if ( !this.parent ) {
				throw new Error( 'Cannot replace a node that is not a child.' );
			}

			if ( !utils.isArray( nodes ) ) {
				nodes = [ nodes ];
			}

			var idx = this.parent.indexOf( this );

			if ( idx < 0 ) {
				throw new Error( 'Node not found in its parent\'s children array.' );
			}

			this.parent.spliceArray( idx, 1, nodes );
		}
	} );

	return Node;
} );