/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library/button/controller', [
	'model',
	'ui/controller',
	'plugin!ui-library/button/view',
], function( Model, Controller, ButtonView ) {
	class ButtonController extends Controller {
		/**
		 * @constructor
		 */
		constructor( model ) {
			// Passing Controller model straight as View model.
			// It is possible because Button is simple.
			super( model );

			this.view = new ButtonView( this._createViewModel() );

			this.view.on( 'click', () => {
				this.model.fire( 'exec' );
				this.view.model.count += 1;
			} );

			this.type = { button: 1 };
		}

		_createViewModel() {
			let viewModel = new Model();

			this.model.on( 'change:state', ( evt, value ) => {
				viewModel.state = value;
			} );
			this.model.on( 'change:disabled', ( evt, value ) => viewModel.disabled = value );
			this.model.on( 'change:label', ( evt, value ) => viewModel.label = value );

			viewModel.set( 'state', this.model.state );
			viewModel.set( 'disabled', this.model.disabled );
			viewModel.set( 'label', this.model.label );
			viewModel.set( 'count', 0 );

			return viewModel;
		}
	}

	return ButtonController;
} );
