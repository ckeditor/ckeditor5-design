define( [
	'core/mvc',
	'tools/element',
	'tools/utils'
], function(
	MVC,
	Element,
	utils
) {
	'use strict';

	function Editor( src, options ) {
		options = options || {};
		options.src = new Element( src );

		MVC.Application.call( this, options );
	}

	utils.inherit( Editor, MVC.Application );

	utils.extend( Editor.prototype, {
		addCreator: function( name, createFunction ) {
			// TODO
		},

		getCreator: function( name ) {
			// TODO
		},

		initialize: function( options ) {
			// TODO initialize plugins

			var creator = this.getCreator( options.creator );
			if ( creator ) {
				creator( this, options.src );
			}

			return this;
		}
	} );

	return Editor;
} );