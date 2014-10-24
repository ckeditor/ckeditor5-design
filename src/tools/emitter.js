define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	var EmitterMixin = {
		on: function( type, callback, ctx ) {
			if ( !this._events ) {
				this._events = {};
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

		listenTo: function( target, type, callback, ctx ) {
			if ( !this._listeningTo ) {
				this._listeningTo = {};
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
				this._listeningTo = {};
			}

			if ( !target._emitterId ) {
				target._emitterId = utils.uid( 'emitter' );
			}

			this._listeningTo[ target._emitterId ] = target;

			return this;
		},

		stopListening: function( target, type, callback ) {
			if ( !this._listeningTo ) {
				return;
			}

			Object.keys( this._listeningTo ).forEach( function( uid ) {
				this._listeningTo[ uid ].off();
				delete this._listeningTo[ uid ];
			}, this );

			return this;
		},

		off: function( type, callback, ctx ) {
			if ( !this._events ) {
				return this;
			}

			if ( !type && !callback ) {
				delete this._events;
				return this;
			}

			var events = this._events[ type ];

			this._events[ type ] = [];

			events.forEach( function( event ) {
				if ( event.callback !== callback || event.ctx !== ctx ) {
					this._events[ type ].push( event );
				}
			}, this );

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