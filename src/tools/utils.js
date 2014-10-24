define( function() {
	'use strict';

	function makeIs( type ) {
		return function( obj ) {
			return Object.prototype.toString.call( obj ) === '[object ' + type + ']';
		};
	}

	var uids = {};

	var utils = {
		extend: function( target, source ) {
			if ( !this.isObject( source ) && !this.isFunction( source ) ) {
				return target;
			}

			var args, keys, i;

			if ( arguments.length > 2 ) {
				args = Array.prototype.splice.call( arguments, 1 );
				i = args.length;

				while ( i-- ) {
					this.extend( target, args[ i ] );
				}

			} else {
				keys = Object.keys( source );
				i = keys.length;

				while ( i-- ) {
					target[ keys[ i ] ] = source[ keys[ i ] ];
				}
			}

			return target;
		},

		inherit: function( target, source ) {
			target.prototype = Object.create( source.prototype, {
				constructor: {
					value: target,
					enumerable: false,
					writable: true,
					configurable: true
				}
			} );
		},

		isArray: function( obj ) {
			return Array.isArray( obj );
		},

		isBoolean: function( obj ) {
			return obj === true || obj === false || Object.prototype.toString.call( obj ) === '[object Boolean]';
		},

		isDate: makeIs( 'Date' ),

		isFunction: function( obj ) {
			return typeof obj == 'function';
		},

		isNull: function( obj ) {
			return obj === null;
		},

		isNumber: makeIs( 'Number' ),

		isObject: function( obj ) {
			return typeof obj === 'object' && !!obj;
		},

		isRegExp: makeIs( 'StRegExp' ),

		isString: makeIs( 'String' ),

		isUndefined: function( obj ) {
			return obj === void 0;
		},

		uid: function( name ) {
			if ( !uids[ name ] ) {
				uids[ name ] = 1;
			}

			return uids[ name ]++;
		}
	};

	return utils;
} );