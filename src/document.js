define( [
	'tools/emitter',
	'converter',
	'dataprocessor',
	'lineardata',
	'nodemanager',
	'store',
	'tools/utils'
], function(
	Emitter,
	converter,
	dataProcessor,
	LinearData,
	nodeManager,
	Store,
	utils
) {
	'use strict';

	function Document( $el ) {
		this.store = new Store();

		this.ownerDocument = $el._el.ownerDocument;

		// create a detached copy of the source html
		var dom = utils.createDocumentFromHTML( $el.html() ).body;

		// normalize the dom
		dataProcessor.normalizeWhitespaces( dom );

		// prepare the data array for the linear data
		var data = converter.getDataForDom( dom, this.store );

		// document's linear data
		this.data = new LinearData( data, this.store );

		// document's node tree
		this.root = new( nodeManager.get( 'root' ) )();
		this.root.document = this;

		this.buildTree();
	}

	utils.extend( Document.prototype, Emitter, {
		// build a node tree starting at this.root
		buildTree: function() {
			var currentStack = [],
				parentStack = [],
				nodeStack = [];

			// start with the topmost element - the document node
			var currentNode = this.root;

			parentStack.push( currentNode );

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

			// finally push all the children to the root node
			this.root.spliceArray( 0, 0, currentStack );
		},

		// retrieve linear data for the given node
		getNodeData: function( node ) {
			if ( !node ) {
				return;
			}

			var offset = node.getOffset();

			return this.data.slice( offset, offset + node.length );
		}
	} );

	return Document;
} );