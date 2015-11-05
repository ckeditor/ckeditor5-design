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
		getController() {
			var controller = new EditorToolbarController( new Model() );

			this.editor.uiItems
				.filter( item => item.type.button )
				.forEach( item => controller.add( item, 'container' ) );

			return controller;
		}
	}

	return Toolbar;
} );