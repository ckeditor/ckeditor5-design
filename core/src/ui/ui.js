/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'./Region',
	'./View'
], function( Region, View ) {
	class UI {
		constructor( editor, library ) {
			this.editor = editor;

			this.library = new library();

			var mainRegion = new Region( 'main', document.getElementById( 'region-main' ) );

			var boldButton = new this.library.components.button( {
				value: 'Bold button',
				disabled: false
			} );

			mainRegion.addView( boldButton );

			this.editor.regions = {
				main: mainRegion
			};
		}
	}

	return UI;
} );
