/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/controller', [
	'ui/controller',
	'plugin!ui-library/framededitableview',
	'plugin!creator-classic/editorchromeview',
	'plugin!creator-classic/view',
	'plugin!toolbar'
], function( Controller, FramedEditableView, EditorChromeView, ClassicCreatorView ) {
	class ClassicCreatorController extends Controller {
		constructor( model ) {
			super( model, new ClassicCreatorView( model ) );
		}

		init() {
			return super.init()
				.then( this._injectChrome.bind( this ) )
				.then( this._injectToolbar.bind( this ) )
				.then( this._injectEditable.bind( this ) )
				.then( () => {
					this.model.editor.controller = this;
				} );
		}

		_injectChrome() {
			let editor = this.model.editor;
			let editorChrome = new Controller( {}, new EditorChromeView() );

			return this.addChild( editorChrome, 'chrome' )
				.then( () => {
					editor.element.parentNode.insertBefore(
						editorChrome.view.el,
						editor.element
					);

					return editorChrome;
				} );
		}

		_injectToolbar( editorChrome ) {
			let editor = this.model.editor;
			let toolbarPlugin = editor.plugins.get( 'toolbar' );

			return Promise.resolve( toolbarPlugin.getController() )
				.then( toolbar => {
					editorChrome.addChild( toolbar, 'top' );

					return editorChrome;
				} );
		}

		_injectEditable( editorChrome ) {
			return Promise.resolve( new Controller( {}, new FramedEditableView() ) )
				.then( framedEditable => {
					return editorChrome.addChild( framedEditable, 'editable' );
				} );
		}
	}

	return ClassicCreatorController;
} );