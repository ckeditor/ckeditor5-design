/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Promise, document */

'use strict';

CKEDITOR.define( 'plugin!creator-classic', [
	'creator',
	'ui/region',
	'plugin!ui-library/appchrome',
	'plugin!ui-library/button',
	'plugin!ui-library/framededitable',
	'plugin!creator-classic/editorchrome',
	'plugin!toolbar'
], function( Creator, Region, AppChrome, Button, FramedEditable, EditorChrome ) {
	class ClassicCreatorPlugin extends Creator {
		constructor( editor ) {
			super( editor );
		}

		create() {
			var editor = this.editor;
			var el = editor.element;
			var framedEditable;

			var hideElement = () => el.style.display = 'none';

			function injectChrome() {
				var editorChrome = new EditorChrome();

				var toolbar = editor.plugins.get( 'toolbar' );
				editorChrome.regions.get( 0 ).views.add( toolbar.getView() );

				framedEditable = new FramedEditable();
				editorChrome.regions.get( 1 ).views.add( framedEditable );

				var mainRegion = new Region( 'main' );
				mainRegion.views.add( editorChrome );
				editor.regions = {
					main: mainRegion
				};

				document.body.appendChild( editorChrome.el );
			}

			function initEditable() {
				// This is totally wrong. It is not supposed to be the way to initialize the editable.
				var iframe = framedEditable.el;
				iframe.contentDocument.body.contentEditable = true;
			}

			return Promise.resolve()
				.then( hideElement )
				.then( injectChrome )
				.then( initEditable );
		}

		destroy() {}
	}

	return ClassicCreatorPlugin;
} );