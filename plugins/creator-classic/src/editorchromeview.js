/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/editorchromeview', [
	'ui/region',
	'ui/template',
	'plugin!ui-library/appchromeview'
], function( Region, Template, AppChromeView ) {
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

			// A place to put dialogs, floating elements, etc.
			const containerEl = new Template( {
				tag: 'div',
				attrs: {
					class: 'ck-editor-chrome-container'
				}
			} ).render();

			document.body.appendChild( containerEl );

			this.register( 'top', el => el.firstChild );
			this.register( new Region( 'editable' ), el => el.lastChild ); // POC
			this.register( 'container', () => null ); // POC
			this.register( 'container', () => containerEl, true ); // POC

			this.model.editor.element.style.display = 'none';
		}
	}

	return EditorChromeView;
} );
