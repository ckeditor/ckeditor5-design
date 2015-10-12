/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

'use strict';

CKEDITOR.define( 'plugin!creator', [
	'plugin',
	'promise',
	'ui/region',
	'component!appchrome',
	'component!button',
	'component!framededitable',
	'component!editorchrome'				// 'plugin!creator/editorchrome'
], function( Plugin, Promise, Region, AppChrome, Button, FramedEditable, EditorChrome ) {
	class ClassicCreator {
		constructor( editor ) {
			this.editor = editor;
		}

		create() {
			var editor = this.editor;
			var element = editor.element;
			var framedEditable;

			return Promise.resolve()
				.then( hideElement )
				.then( injectChrome )
				.then( initEditable );

			function hideElement() {
				element.style.display = 'none';
			}

			function injectChrome() {
				var editorChrome = new EditorChrome();
				var mainRegion = new Region( 'main' );

				mainRegion.views.add( editorChrome );

				var boldButton = new Button( {
					value: 'Bold button',
					disabled: false
				} );

				framedEditable = new FramedEditable();

				editorChrome.regions.get( 0 ).views.add( boldButton );
				editorChrome.regions.get( 1 ).views.add( framedEditable );

				editor.regions = {
					main: mainRegion
				};

				document.body.appendChild( editorChrome.el );
			}

			function initEditable() {
				// This is totally wrong. It is not supposed to be the way to initialize the editable.
				var iframe = framedEditable.el;
				var body = iframe.contentDocument.body;
				body.contentEditable = true;
			}
		}

		destroy() {
		}
	}

	class ClassicCreatorPlugin extends Plugin {
		constructor( editor ) {
			super( editor );
		}

		init() {
			var creator = new ClassicCreator( this.editor );

			this.editor.on( 'destroy', function() {
				creator.destroy();
			} );

			return creator.create();
		}
	}

	return ClassicCreatorPlugin;
} );