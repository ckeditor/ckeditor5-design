define( [
	'store',
	'tools/utils'
], function(
	Store,
	utils
) {
	'use strict';

	function LinearData( data, store ) {
		this.data = data || [];
		this.store = store || new Store();
	}

	// static methods
	utils.extend( LinearData, {
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
	Object.defineProperty( LinearData.prototype, 'length', {
		get: function() {
			return this.data.length;
		}
	} );

	utils.extend( LinearData.prototype, {
		clone: function() {
			return this.constructor( utils.clone( this.data ), this.store );
		},

		cloneSlice: function( start, end ) {
			var data = this.slice( start, end );

			return new LinearData( utils.clone( data ), this.store );
		},

		findCloseElement: function( item ) {
			var i;

			// we accept opening elements only
			if ( !utils.isObject( item ) || !LinearData.isOpenElement( item ) ||
				( i = this.data.indexOf( item ) ) === -1 ) {
				return null;
			}

			var openingStack = [],
				type = LinearData.getType( item ),
				len = this.length;

			// we don't want to check the given item again
			i++;

			while ( i < len ) {
				if ( this.getTypeAt( i ) === type ) {
					if ( this.isOpenElementAt( i ) ) {
						openingStack.push( this.get( i ) );
					} else if ( this.isCloseElementAt( i ) ) {
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
			if ( !utils.isObject( item ) || !LinearData.isCloseElement( item ) ||
				( i = this.data.indexOf( item ) ) === -1 ) {
				return null;
			}

			var closingStack = [],
				type = LinearData.getType( item );

			// we don't want to check the given item again
			i--;

			while ( i >= 0 ) {
				if ( this.getTypeAt( i ) === type ) {
					if ( this.isCloseElementAt( i ) ) {
						closingStack.push( this.get( i ) );
					} else if ( this.isOpenElementAt( i ) ) {
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

		get: function( idx ) {
			return idx !== undefined ? this.data[ idx ] : this.data;
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

		push: function( value ) {
			this.data.push( value );
		},

		set: function( idx, value ) {
			this.data[ idx ] = value;
		},

		slice: function() {
			return [].slice.apply( this.data, arguments );
		},

		splice: function() {
			return [].splice.apply( this.data, arguments );
		}
	} );

	return LinearData;
} );