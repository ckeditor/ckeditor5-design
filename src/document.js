define( [
	'converter',
	'dataprocessor',
	'lineardata',
	'nodemanager',
	'store',
	'view',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	dataProcessor,
	LinearData,
	nodeManager,
	Store,
	View,
	Emitter,
	utils
) {
	'use strict';

	function Document( $el, editable ) {
		this.store = new Store();

		// reference to the parent editable object
		this.editable = editable;

		// create a detached copy of the source html
		var dom = utils.createDocumentFromHTML( $el.html() ).body;

		// TODO combine the data processing with data conversion loop
		// normalize the dom
		dataProcessor.normalizeWhitespaces( dom );

		// prepare the data array for the linear data
		var data = converter.getDataForDom( dom, this.store, null, true );

		// document's linear data
		this.data = new LinearData( data, this.store );

		// create document tree root element
		this.root = this.buildTree();
		this.root.view = new View( this.root, document.createElement( 'div' ) );
		this.root.document = this;
		this.editable.addView( this.root.view );

		this.renderTree( this.root, this.root.view );
	}

	utils.extend( Document.prototype, Emitter, {
		// build a node tree, collect the children first and then push them to their parents
		// we use this oreder to calculate the lengths properly
		buildTree: function() {
			var currentStack = [],
				parentStack = [],
				nodeStack = [];

			// start with the topmost element - the document node
			var currentNode;

			// add the parent and current stacks to start with
			nodeStack.push( parentStack, currentStack );

			// length counter for a text node
			var textLength = 0;

			// flag that says if we're processing a text node
			var inText = false;

			for ( var i = 0, len = this.data.length; i < len; i++ ) {
				// an element
				if ( this.data.isElementAt( i ) ) {
					// previous item was a text
					if ( inText ) {
						// set the final length of a text node
						currentNode.length = textLength;
						inText = false;
						textLength = 0;
						currentNode = parentStack[ parentStack.length - 1 ];
					}

					// an opening element
					if ( this.data.isOpenElementAt( i ) ) {
						var type = this.data.getTypeAt( i );
						var item = this.data.get( i );

						// create a node for this element and add it to the stack
						currentNode = nodeManager.create( type, item );
						currentNode.document = this;
						currentNode.root = this.root;
						currentStack.push( currentNode );

						// node may contain children
						if ( currentNode.children ) {
							parentStack = currentStack;
							currentStack = [];
							nodeStack.push( currentStack );
						}
						// a closing element
					} else {
						// node may contain children
						if ( currentNode.children ) {
							var children = nodeStack.pop();

							currentStack = parentStack;
							parentStack = nodeStack[ nodeStack.length - 2 ];

							if ( !parentStack ) {
								throw new Error( 'This shouldn\'t happen - check the linear data' );
							}

							currentNode.spliceArray( 0, 0, children );
						}

						currentNode = parentStack[ parentStack.length - 1 ];
					}

					// a text
				} else {
					// start of a text
					if ( !inText ) {
						// create a text node and push it to the stack
						currentNode = nodeManager.create( 'text' );
						currentNode.document = this;
						currentNode.root = this.root;
						currentStack.push( currentNode );

						inText = true;
					}

					textLength++;
				}
			}

			// we ended up with text so just update the current node's length
			if ( inText ) {
				currentNode.length = textLength;
			}

			return currentStack[ 0 ];
		},

		// retrieve linear data for the given node
		getNodeData: function( node ) {
			if ( !node ) {
				return;
			}

			var offset = node.getOffset();

			return this.data.slice( offset, offset + node.length );
		},

		// render given node tree and append it to the parent
		renderTree: function( node, parent ) {
			var doc = parent.getElement().ownerDocument;

			function appendToParent( el ) {
				parent.append( el );
			}

			node.children.forEach( function( child ) {
				// use child's data or get it from the linear data
				var data = child.data || this.getNodeData( child );
				// create DOM element(s) for a child nnode
				var elem = child.constructor.toDom( data, doc, this.store );

				// node returns an array of element so there's no point in processing its children again
				// this happens e.g. for text nodes
				if ( utils.isArray( elem ) ) {
					elem.forEach( appendToParent );
				} else {
					child.view = new View( child, elem );
					// TODO this doesn't seem to be the best place to store it
					this.editable.addView( child.view );
					child.view.appendTo( parent );

					if ( child.children ) {
						this.renderTree( child, child.view );
					}
				}

			}, this );
		},
	} );

	return Document;
} );