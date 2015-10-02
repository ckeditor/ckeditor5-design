/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'./Region',
	'./View',
], function( Region, View ) {
	class UI {
		constructor( editor, library ) {
			this.editor = editor;
			this.library = new library();
			this.components = this.library.components;

			var mainRegion = new Region( 'main' );
			var appChrome = new this.components.AppChrome();
			mainRegion.views.add( appChrome );

			var topRegion = new Region( 'top' );
			var editableRegion = new Region( 'editable' );
			appChrome.regions.add( topRegion );
			appChrome.regions.add( editableRegion );

			var boldButton = new this.components.Button( {
				value: 'Bold button',
				disabled: false
			} );

			topRegion.views.add( boldButton );

			this.editor.regions = {
				main: mainRegion
			};

			document.body.appendChild( appChrome.el );
		};

		destroy() {

		};
	}

	return UI;
} );
