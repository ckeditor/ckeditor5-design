/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'component!editorchrome', [ 'component!appchrome', 'ui/region' ], function( AppChrome, Region ) {
	/**
	 * Creates an instance of the {@link EditorChrome} class.
	 *
	 * @param {Model} mode (View)Model of this EditorChrome.
	 * @constructor
	 */
	class EditorChrome extends AppChrome {
		constructor( model ) {
			super( model );

			/**
			 * The template of this EditorChrome.
			 */
			this.template.attributes.class.push( 'ck-editor-chrome' );
			this.template.children = [
				{
					tag: 'div',
					attributes: {
						'class': 'ck-editor-chrome-top'
					}
				},
				{
					tag: 'div',
					attributes: {
						'class': 'ck-editor-chrome-editable'
					}
				}
			];

			var topRegion = new Region( 'top', this.el.firstChild );
			var editableRegion = new Region( 'editable', this.el.lastChild );

			this.regions.add( topRegion );
			this.regions.add( editableRegion );
		}
	}

	return EditorChrome;
} );
