/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/editorchromeview', [
	'plugin!ui-library/appchromeview',
	'ui/region'
], function( AppChromeView, Region ) {
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

			this.regions.add( new Region( 'top', this.el.firstChild ) );
			this.regions.add( new Region( 'editable', this.el.lastChild ) );
		}
	}

	return EditorChromeView;
} );
