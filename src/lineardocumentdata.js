define( [
	'lineardata',
	'tools/utils'
], function(
	LinearData,
	utils
) {
	'use strict';

	// Data is an array. The item can be
	//   - string - for characters without styles,
	//   - array - for character with style, then:
	//     - item[ 0 ] is character,
	//     - item[ 1 ] is array of styles id in the store.
	//   - object - for elements, then:
	//     - item.type - the item type,
	//     - item.attributes - object of attributes
	//
	// For example for <p> F <b> o o </b> </p> it will be:
	//	[
	//		{ type: paragraph, attributes: {} },
	//		'F',
	//		[ 'o', [] ],
	//		[ 'o', [] ],
	//		{ type: /paragraph }
	//	]
	function LinearDocumentData() {
		LinearData.apply( this, arguments );
	}

	utils.inherit( LinearDocumentData, LinearData );

	// static methods
	utils.extend( LinearDocumentData, {
		getType: function( item ) {
			return this.isOpenElement( item ) ? item.type :
				this.isCloseElement( item ) ? item.type.substr( 1 ) :
				null;
		},

		isElement: function( item ) {
			return item && utils.isString( item.type );
		},

		isOpenElement: function( item ) {
			return this.isElement( item ) && item.type.charAt( 0 ) !== '/';
		},

		isCloseElement: function( item ) {
			return this.isElement( item ) && item.type.charAt( 0 ) === '/';
		}
	} );

	// prototype
	utils.extend( LinearDocumentData.prototype, {
		findCloseElement: function( item ) {
			var i;

			// we accept opening elements only
			if ( !utils.isObject( item ) || !LinearDocumentData.isOpenElement( item ) ||
				( i = this.data.indexOf( item ) ) === -1 ) {
				// TODO: bad smell: incorrect input data should throw an error or break method instead on returning null.
				return null;
			}

			var openingStack = [],
				type = LinearDocumentData.getType( item ),
				len = this.length;

			// we don't want to check the given item again
			i++;

			while ( i < len ) {
				if ( this.getTypeAt( i ) === type ) {
					if ( this.isOpenElementAt( i ) ) {
						openingStack.push( this.get( i ) );
					}

					if ( this.isCloseElementAt( i ) ) {
						if ( openingStack.length ) {
							openingStack.pop();
						} else {
							return this.get( i );
						}
					}
				}

				i++;
			}

			return null;
		},

		findOpenElement: function( item ) {
			var i;

			// we accept opening items only
			if ( !utils.isObject( item ) || !LinearDocumentData.isCloseElement( item ) ||
				( i = this.data.indexOf( item ) ) === -1 ) {
				// TODO: bad smell: incorrect input data should throw an error or break method instead on returning null.
				return null;
			}

			var closingStack = [],
				type = LinearDocumentData.getType( item );

			// we don't want to check the given item again
			i--;

			while ( i >= 0 ) {
				if ( this.getTypeAt( i ) === type ) {
					if ( this.isCloseElementAt( i ) ) {
						closingStack.push( this.get( i ) );
					}

					if ( this.isOpenElementAt( i ) ) {
						if ( closingStack.length ) {
							closingStack.pop();
						} else {
							return this.get( i );
						}
					}
				}

				i--;
			}

			return null;
		},

		getTypeAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.getType( item );
		},

		isCloseElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isCloseElement( item );
		},

		isElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isElement( item );
		},

		isOpenElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isOpenElement( item );
		},

		isValid: function() {
			var open = [];

			for ( var i = 0, len = this.length; i < len; i++ ) {
				if ( this.isElementAt( i ) ) {
					if ( this.isOpenElementAt( i ) ) {
						open.push( this.get( i ) );
					}

					if ( this.isCloseElementAt( i ) ) {
						var lastOpen = open.pop();

						if ( this.getTypeAt( i ) !== this.constructor.getType( lastOpen ) ) {
							return false;
						}
					}
				}
			}

			return open.length === 0;
		}
	} );

	return LinearDocumentData;

} );