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
	'plugin!toolbar/editortoolbar/controller'
], function( Model, Collection, Plugin, EditorToolbarController ) {
	class Toolbar extends Plugin {
		getController() {
			const controller = new EditorToolbarController( new Model() );
			const containerCollection = controller.collections.get( 'container' );

			this.editor.uiItems
				.filter( uiItem => uiItem.type.button )
				.forEach( uiItem => containerCollection.add( uiItem ) );

			return controller;
		}
	}

	return Toolbar;
} );