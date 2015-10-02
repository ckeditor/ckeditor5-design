/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

'use strict';

CKEDITOR.define( 'plugin!creator', [
	'plugin',
	'promise',
	'../../../../../core/src/ui/region',						// 'ui/region'
	'../../../../../ui-library/src/components/appchrome',		// 'ui!appchorme'
	'../../../../../ui-library/src/components/button',			// 'ui!button'
	'../../../../../plugins/creator/src/editorchrome'
], function( Plugin, Promise, Region, AppChrome, Button, EditorChrome ) {
	class ClassicCreator {
		constructor( editor ) {
			this.editor = editor;
		}

		create() {
			var that = this;
			var editor = this.editor;
			var element = editor.element;
			var editorElement;

			return Promise.resolve()
				.then( hideElement )
				.then( injectChrome );

			function hideElement() {
				element.style.display = 'none';
			}

			function injectChrome() {
				var editorChrome = new EditorChrome(),
					mainRegion = new Region( 'main' );

				mainRegion.views.add( editorChrome );

				var boldButton = new Button( {
					value: 'Bold button',
					disabled: false
				} );

				editorChrome.regions.get( 0 ).views.add( boldButton );

				editor.regions = {
					main: mainRegion
				};

				document.body.appendChild( editorChrome.el );
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