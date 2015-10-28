/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library/button/controller', [
	'ui/controller',
	'plugin!ui-library/button/view',
], function( Controller, ButtonView ) {
	class ButtonController extends Controller {
		/**
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			this.view = new ButtonView( model );

			var viewModel = this.view.model;

			this.view.on( 'click', () => {
				viewModel.state = ( viewModel.state == 'off' ? 'on' : 'off' );
				viewModel.count++;
			} );
		}
	}

	return ButtonController;
} );
