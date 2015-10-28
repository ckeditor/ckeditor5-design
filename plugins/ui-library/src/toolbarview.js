/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * UI Library Toolbar Component.
 *
 * @class Toolbar
 * @extends View
 */

CKEDITOR.define( 'plugin!ui-library/toolbarview', [ 'ui/view' ], function( View ) {
	class ToolbarView extends View {
		/**
		 * Creates an instance of the {@link Toolbar} class.
		 *
		 * @param {Model} mode (View)Model of this Toolbar.
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			/**
			 * The template of this Toolbar.
			 */
			this.template = {
				tag: 'div',
				attrs: {
					'class': [ 'ck-toolbar' ]
				}
			};
		}
	}

	return ToolbarView;
} );