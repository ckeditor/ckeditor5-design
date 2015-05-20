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

	// data - linear data
	function Node( data ) {
		this.data = data || null;

		// TODO: is seems to be not needed. It could be replaced with checking if view exists.
		this.isRendered = false;

		this.document = null;
		this.parent = null;
		this.view = null;

		this._length = 0;
	}

	// static properties
	// Every specific node set its type.
	Node.type = null;
	// Every specific node set tags it accept. The first one will be used to create DOM element.
	Node.tags = [];
	// Every specific node set attributes witch it handle.
	Node.attributes = [];
	// Has open and close tag; at the moment only text node is not wrapped
	// TODO: change isWrapped to isTextNode and move to the text node
	Node.isWrapped = true;


	// static methods

	// used by converters to match node to the processing element
	// options.element - DOM element
	Node.match = function( options ) {
		// match by tag name (node name to support matching comments/text nodes)
		if ( this.tags.length ) {
			var tag = options.element.nodeName.toLowerCase();

			if ( this.tags.indexOf( tag ) > -1 ) {
				return true;
			}
		}

		return false;
	};

	// pick attributes from the DOM element during conversion
	Node.pickAttributes = function( dom ) {
		var result = {};

		this.attributes.forEach( function( attribute ) {
			var value = dom.getAttribute( attribute );

			if ( value !== null ) {
				result[ attribute ] = value;
			}
		} );

		return result;
	};

	// convert a DOM element into item
	Node.toData = function( options ) {
		options.onItem( {
			type: this.type,
			attributes: this.pickAttributes( options.element )
		} );
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
			// TODO: node.length = node.length; will change value; this should be fixed
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

	// offset of a node from the beginning of the document, corresponds to the position in the linear data
	Object.defineProperty( Node.prototype, 'offset', {
		get: function() {
			// it's the topmost element
			if ( !this.parent ) {
				return 0;
			}

			var offset = this.parent.offset;

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