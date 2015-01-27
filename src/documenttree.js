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
			var currentNode = this.documentNode,
				currentStack = [],
				parentStack = [ this.documentNode ],
				nodeStack = [ parentStack, currentStack ],
				textLength = 0,
				inText = false,
				len,
				i;

			for ( i = 0, len = this.data.length; i < len; i++ ) {
				// an element
				if ( this.data.isElementAt( i ) ) {
					// we were in a text before
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

						currentNode = nodeManager.create( type, item );
						currentStack.push( currentNode );

						// node may have children
						if ( currentNode.children ) {
							parentStack = currentStack;
							currentStack = [];
							nodeStack.push( currentStack );
						}
						// a closing element
					} else {
						// node may have children
						if ( currentNode.children ) {
							var children = nodeStack.pop();

							currentStack = parentStack;
							parentStack = nodeStack[ nodeStack.length - 2 ];

							if ( !parentStack ) {
								throw new Error( 'This shouldn\'t happen - check the linear data' );
							}

							// [].splice.apply( currentNode.children, [ 0, 0 ].concat( children ) );

							currentNode.splice.apply( currentNode, [ 0, 0 ].concat( children ) );
						}

						currentNode = parentStack[ parentStack.length - 1 ];
					}

					// a text
				} else {
					// start of a text
					if ( !inText ) {
						currentNode = nodeManager.create( 'text' );
						currentStack.push( currentNode );
						inText = true;
					}

					textLength++;
				}
			}

			if ( inText ) {
				currentNode.length = textLength;
			}

			// [].splice.apply( this.documentNode.children, [ 0, 0 ].concat( currentStack ) );

			this.documentNode.splice.apply( this.documentNode, [ 0, 0 ].concat( currentStack ) );
		}


	} );

	return DocumentTree;
} );