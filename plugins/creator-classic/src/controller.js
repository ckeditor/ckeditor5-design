/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/controller', [
	'ui/controller',
	'ui/controllercollection',
	'plugin!ui-library/framededitableview',
	'plugin!creator-classic/editorchromeview',
	'plugin!toolbar'
], function( Controller, ControllerCollection, FramedEditableView, EditorChromeView ) {
	class ClassicCreatorController extends Controller {
		constructor( model ) {
			super( model, new EditorChromeView( model ) );

			this.collections.add( new ControllerCollection( 'top' ) );
			this.collections.add( new ControllerCollection( 'editable' ) );

			// No promise, because it's before init().
			this.addChild( 'top', model.editor.plugins.get( 'toolbar' ).getController() );
			this.addChild( 'editable', new Controller( {}, new FramedEditableView() ) );

			this.model.editor.controller = this;
		}

		init() {
			// Append the element first because iframe body is inaccessible in detached DOM.
			document.body.appendChild( this.view.el );

			return super.init();
		}
	}

	return ClassicCreatorController;
} );