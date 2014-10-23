define( function() {
	'use strict';

	var CommandsMixin = {
		command: function( name, cmd, ctx ) {
			if ( !this._commands ) {
				this._commands = {};
			}

			this._commands[ name ] = {
				cmd: cmd,
				ctx: ctx || this
			};

			return this;
		},

		removeCommand: function( name ) {
			if ( this._commands ) {
				delete this._commands[ name ];
			}

			return this;
		},

		execute: function( name, args ) {
			var command;

			if ( !this._commands || !( command = this._commands[ name ] ) ) {
				return this;
			}

			args = Array.prototype.slice.call( arguments, 1 );

			return command.cmd.apply( command.ctx, args );
		}
	};

	return CommandsMixin;
} );