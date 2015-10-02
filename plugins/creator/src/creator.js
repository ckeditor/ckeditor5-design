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
	'../../../../../ui-library/src/components/button'			// 'ui!button'
], function( Plugin, Promise, Region, AppChrome, Button ) {
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
				var mainRegion = new Region( 'main' );
				var appChrome = new AppChrome();
				mainRegion.views.add( appChrome );

				var topRegion = new Region( 'top' );
				var editableRegion = new Region( 'editable' );
				appChrome.regions.add( topRegion );
				appChrome.regions.add( editableRegion );

				var boldButton = new Button( {
					value: 'Bold button',
					disabled: false
				} );

				topRegion.views.add( boldButton );

				editor.regions = {
					main: mainRegion
				};

				document.body.appendChild( appChrome.el );

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
			console.log( this );
			var creator = new ClassicCreator( this.editor );

			this.editor.on( 'destroy', function() {
				creator.destroy();
			} );

			return creator.create();
		}
	}

	return ClassicCreatorPlugin;
} );