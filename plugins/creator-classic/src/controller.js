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

			const topCollection = new ControllerCollection( 'top' );
			const editableCollection = new ControllerCollection( 'editable' );

			this.collections.add( topCollection );
			this.collections.add( editableCollection );

			// No promise, because it's before init().
			topCollection.add( model.editor.plugins.get( 'toolbar' ).getController() );
			editableCollection.add( new Controller( {}, new FramedEditableView() ) );

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