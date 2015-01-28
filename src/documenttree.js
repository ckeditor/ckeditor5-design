define( [
	'nodemanager',
	'tools/utils'
], function(
	nodeManager,
	utils
) {
	'use strict';

	function DocumentTree( data ) {
		var DocumentNode = nodeManager.get( 'document' );

		this.documentNode = new DocumentNode();

		this.data = data;

		this.build();
	}

	utils.extend( DocumentTree.prototype, {
		build: function() {
			var currentStack = [],
				parentStack = [],
				nodeStack = [];

			// start with the topmost element - the document node
			var currentNode = this.documentNode;

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

			// finally push all the children to the documentNode
			this.documentNode.spliceArray( 0, 0, currentStack );
		}


	} );

	return DocumentTree;
} );