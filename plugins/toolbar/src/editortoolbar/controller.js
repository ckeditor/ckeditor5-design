/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar/controller', [
	'model',
	'ui/controller',
	'plugin!toolbar/editortoolbar/view'
], function( Model, Controller, EditorToolbarView ) {
	class EditorToolbarController extends Controller {
		constructor( model ) {
			super( model, new EditorToolbarView() );
		}
	}

	return EditorToolbarController;
} );
