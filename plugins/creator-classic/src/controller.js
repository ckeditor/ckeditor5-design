/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/controller', [
	'collection',
	'ui/controller',
	'plugin!ui-library/framededitableview',
	'plugin!creator-classic/editorchromeview',
	'plugin!toolbar'
], function( Collection, Controller, FramedEditableView, EditorChromeView ) {
	class ClassicCreatorController extends Controller {
		constructor( model ) {
			super( model, new EditorChromeView( model ) );

			this.register( 'top', new Collection() );
			this.register( 'editable', new Collection() );

			// No promise, because it's before init().
			this.addChild( 'top', model.editor.plugins.get( 'toolbar' ).getController() );
			this.addChild( 'editable', new Controller( {}, new FramedEditableView() ) );

			this.model.editor.controller = this;
		}

		init() {
			document.body.appendChild( this.view.el );

			return super.init();
		}
	}

	return ClassicCreatorController;
} );