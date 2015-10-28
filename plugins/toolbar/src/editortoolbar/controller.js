/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar/controller', [
	'ui/controller',
	'plugin!toolbar/editortoolbar/view',
	'plugin!ui-library/button/controller'
], function( Controller, EditorToolbarView, ButtonController ) {
	class EditorToolbarController extends Controller {
		/**
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			this.view = new EditorToolbarView( model );
		}

		init() {
			var buttons = [
				{ label: 'Bold', state: 'off', count: 0 },
				{ label: 'Italic', state: 'off', count: 0 },
				{ label: 'Underline', state: 'off', count: 0 }
			];

			// TODO: How to deal with parent init()?
			return super.init()
				.then(
					Promise.all( buttons.filter( b => {
						return this.append( new ButtonController( b ), 'container' );
					} ) )
				);
		}
	}

	return EditorToolbarController;
} );
