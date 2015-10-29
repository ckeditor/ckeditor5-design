/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Basic Toolbar Plugin.
 *
 * @class Toolbar
 * @extends Plugin
 */

CKEDITOR.define( 'plugin!toolbar', [
	'model',
	'collection',
	'plugin',
	'ui/region',
	'plugin!toolbar/editortoolbar/controller'
], function( Model, Collection, Plugin, Region, EditorToolbarController ) {
	class Toolbar extends Plugin {
		constructor( editor ) {
			super( editor );
		}

		init() {
		}

		getController() {
			// Supposing this is config.toolbar.
			var config = [ 'Bold', 'Italic', 'Underline' ];

			// This is the **feature model**.
			var model = new Model( {
				items: new Collection()
			} );

			// Filling the **feature model** with config data.
			config.map( c => model.items.add( c ) );

			// Passing the **feature model** to Controller.
			return new EditorToolbarController( model );
		}
	}

	return Toolbar;
} );