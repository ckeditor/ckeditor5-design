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
	'plugin!toolbar/editortoolbar',
	'plugin!ui-library/button'
], function( Plugin, Region, EditorToolbar, Button ) {
	class Toolbar extends Plugin {
		constructor( editor ) {
			super( editor );
		}

		init() {
			this.editorToolbar = new EditorToolbar();

			var buttons = [
				{
					label: 'Bold',
					state: 'off',
					count: 0
				},
				{
					label: 'Italic',
					state: 'off',
					count: 0
				},
				{
					label: 'Underline',
					state: 'off',
					count: 0
				}
			];

			buttons = buttons.map( b => new Button( b ) );

			for ( let b of buttons ) {
				this.editorToolbar.regions.get( 'container' ).views.add( b );

				b.on( 'click', () => {
					b.model.state = ( b.model.state == 'off' ? 'on' : 'off' );
					b.model.count++;
				} );
			}
		}

		getView() {
			return this.editorToolbar;
		}
	}

	return Toolbar;
} );