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
	'plugin',
	'ui/region',
	'plugin!toolbar/editortoolbar/controller'
], function( Plugin, Region, EditorToolbarController ) {
	class Toolbar extends Plugin {
		constructor( editor ) {
			super( editor );
		}

		init() {
		}

		getController() {
			return new EditorToolbarController();
		}
	}

	return Toolbar;
} );