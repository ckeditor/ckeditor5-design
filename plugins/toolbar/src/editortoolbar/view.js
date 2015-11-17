/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 /* global setTimeout */

'use strict';

/**
 * EditorToolbar UI component for Toolbar Plugin.
 *
 * @class EditorToolbar
 * @extends Toolbar
 */

CKEDITOR.define( 'plugin!toolbar/editortoolbar/view', [
	'plugin!ui-library/toolbarview',
], function( ToolbarView ) {
	/**
	 * Creates an instance of the {@link AppChrome} class.
	 *
	 * @param {Model} mode (View)Model of this AppChrome.
	 * @constructor
	 */
	class EditorToolbarView extends ToolbarView {
		constructor( model ) {
			super( model );

			/**
			 * The template of this EditorToolbar.
			 */
			this.template.attrs.class.push( 'ck-editortoolbar' );

			this.regionsDef = {
				container: el => el
			};
		}

		init() {
			super.init();

			return new Promise( resolve => {
				setTimeout( resolve, 1000 );
			} );
		}
	}

	return EditorToolbarView;
} );