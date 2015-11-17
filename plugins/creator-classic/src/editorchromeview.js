/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/editorchromeview', [
	'plugin!ui-library/appchromeview'
], function( AppChromeView ) {
	/**
	 * Creates an instance of the {@link EditorChrome} class.
	 *
	 * @param {Model} mode (View)Model of this EditorChrome.
	 * @constructor
	 */
	class EditorChromeView extends AppChromeView {
		constructor( model ) {
			super( model );

			/**
			 * The template of this EditorChrome.
			 */
			this.template.attrs.class.push( 'ck-editor-chrome' );
			this.template.children = [
				{
					tag: 'div',
					attrs: {
						'class': 'ck-editor-chrome-top'
					}
				},
				{
					tag: 'div',
					attrs: {
						'class': 'ck-editor-chrome-editable'
					}
				}
			];

			this.regionsDef = {
				top: el => el.firstChild,
				editable: el => el.lastChild
			};
		}
	}

	return EditorChromeView;
} );
