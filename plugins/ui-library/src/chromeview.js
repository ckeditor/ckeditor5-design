/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * UI Library Chrome Component.
 *
 * @class Chrome
 * @extends View
 */

CKEDITOR.define( 'plugin!ui-library/chromeview', [ 'ui/view' ], function( View ) {
	class ChromeView extends View {
		/**
		 * Creates an instance of the {@link Chrome} class.
		 *
		 * @param {Model} mode (View)Model of this Chrome.
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			/**
			 * The template of this button.
			 */
			this.template = {
				tag: 'div',
				attrs: {
					'class': [ 'ck-chrome' ]
				}
			};
		}
	}

	return ChromeView;
} );
