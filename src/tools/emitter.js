define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var EmitterMixin = {
		listenTo: function( target, type, callback, ctx ) {
			if ( !this._listeningTo ) {
				Object.defineProperty( this, '_listeningTo', {
					value: {}
				} );
			}

			if ( !target._emitterId ) {
				Object.defineProperty( target, '_emitterId', {
					value: utils.uid( 'emitter' )
				} );
			}

			this._listeningTo[ target._emitterId ] = target;

			target.on( type, callback, ctx );

			return this;
		},

		listenToOnce: function( target, type, callback, ctx ) {
			if ( !this._listeningTo ) {
				Object.defineProperty( this, '_listeningTo', {
					value: {}
				} );
			}

			if ( !target._emitterId ) {
				target._emitterId = utils.uid( 'emitter' );
			}

			this._listeningTo[ target._emitterId ] = target;

			target.once( type, callback, ctx );

			return this;
		},

		off: function( type, callback, ctx ) {
			if ( !this._events ) {
				return this;
			}

			if ( !arguments.length ) {
				Object.defineProperty( this, '_events', {
					configurable: true,
					value: {}
				} );

				return this;
			}

			var types = type ? [ type ] : Object.keys( this._events );

			types.forEach( function( type ) {
				var events = this._events[ type ];

				this._events[ type ] = [];

				events.forEach( function( event ) {
					if (
						( callback && event.callback !== callback && event.callback._original !== callback ) ||
						( ctx && event.ctx !== ctx )
					) {
						this._events[ type ].push( event );
					}
				}, this );

				if ( !this._events[ type ].length ) {
					delete this._events[ type ];
				}
			}, this );

			return this;
		},

		on: function( type, callback, ctx ) {
			if ( !this._events ) {
				Object.defineProperty( this, '_events', {
					configurable: true,
					value: {}
				} );
			}

			if ( !this._events[ type ] ) {
				this._events[ type ] = [];
			}

			this._events[ type ].push( {
				callback: callback,
				ctx: ctx || this
			} );

			return this;
		},

		once: function( type, callback, ctx ) {
			var fired = false,
				that = this;

			function once() {
				that.off( type, once );

				if ( !fired ) {
					fired = true;
					callback.apply( ctx, arguments );
				}
			}

			once._original = callback;

			return this.on( type, once, ctx );
		},

		stopListening: function( target, type, callback ) {
			if ( !this._listeningTo ) {
				return this;
			}

			if ( target ) {
				target.off( type, callback, this );
				if ( !Object.keys( target._events ).length ) {
					var uid = target._emitterId;

					if ( uid ) {
						delete this._listeningTo[ uid ];
					}
				}
			} else {
				Object.keys( this._listeningTo ).forEach( function( uid ) {
					this._listeningTo[ uid ].off( type, callback, this );

					delete this._listeningTo[ uid ];
				}, this );
			}

			return this;
		},

		trigger: function( type, args ) {
			var events;

			if ( !this._events || !( events = this._events[ type ] ) || !events.length ) {
				return this;
			}

			args = Array.prototype.slice.call( arguments, 1 );

			events.forEach( function( event ) {
				event.callback.apply( event.ctx, args );
			}, this );

			return this;
		}
	};

	return EmitterMixin;
} );