/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'../../../ui-library/src/components/appchrome' ,
	'../../../core/src/ui/region',
], function( AppChrome, Region ) {
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
			this.template = [
				'<div class="ck-chrome ck-app-chrome ck-editor-chrome">',
					'<div class="ck-editor-chrome-top"></div>',
					'<div class="ck-editor-chrome-edtable"></div>',
				'</div>'
			].join( '' );

			var topRegion = new Region( 'top', this.el.firstChild ),
				editableRegion = new Region( 'editable', this.el.lastChild );

			this.regions.add( topRegion );
			this.regions.add( editableRegion );
		};
	}

	return EditorChrome;
} );
