/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Promise, document */

'use strict';

CKEDITOR.define( 'plugin!creator-classic', [
	'creator',
	'ui/region',
	'ui/controller',
	'ui/view',
	'plugin!ui-library/framededitableview',
	'plugin!creator-classic/editorchromeview',
	'plugin!toolbar'
], function( Creator, Region, Controller, View, FramedEditableView, EditorChromeView ) {
	class ClassicCreatorPlugin extends Creator {
		constructor( editor ) {
			super( editor );
		}

		create() {
			var controller = new ClassicCreatorController( {
				editor: this.editor
			} );

			return controller.init();
		}

		destroy() {}
	}

	class ClassicCreatorController extends Controller {
		constructor( model ) {
			super( model );

			this.view = new ClassicCreatorView();
		}

		init() {
			var editor = this.model.editor;
			var that = this;

			this.model.editor.regions = this.view.regions;

			return super.init()
				.then( hideElement )
				.then( injectChrome )
				.then( initEditable );

			function hideElement() {
				editor.element.style.display = 'none';
			}

			function injectChrome() {
				var editorChrome = new Controller( {}, new EditorChromeView() );

				return that.append( editorChrome, 'root' )
					.then( injectToolbar )
					.then( injectEditable );

				function injectEditable() {
					return Promise.resolve( new Controller( {}, new FramedEditableView() ) )
						.then( framedEditable => {
							return editorChrome.append( framedEditable, 'editable' );
						} );
				}

				function injectToolbar() {
					var toolbarPlugin = editor.plugins.get( 'toolbar' );

					return Promise.resolve( toolbarPlugin.getController() )
						.then( toolbar => {
							return editorChrome.append( toolbar, 'top' );
						} );
				}
			}

			function initEditable( framedEditable ) {
				var iframe = framedEditable.view.el;
				iframe.contentDocument.body.contentEditable = true;
			}
		}
	}

	class ClassicCreatorView extends View {
		constructor() {
			super();

			this.regions.add( new Region( 'root', document.body ) );
		}
	}

	return ClassicCreatorPlugin;
} );