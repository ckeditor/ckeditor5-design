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
			var framedEditableController;

			var hideElement = () => el.style.display = 'none';

			function injectChrome() {
				var editorChromeController = new EditorChrome();

				var toolbar = editor.plugins.get( 'toolbar' );
				editorChromeController.view.regions.get( 'top' ).views.add( toolbar.getView() );

				framedEditableController = new FramedEditable();
				editorChromeController.view.regions.get( 'editable' ).views.add( framedEditableController.view );
				// editorChromeController.addSub( 'editable', framedEditableController );

				var mainRegion = new Region( 'main' );
				mainRegion.views.add( editorChromeController.view );
				editor.regions = {
					main: mainRegion
				};

				document.body.appendChild( editorChromeController.view.el );
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

class Controller extends Model {
	constructor() {
		super();

		/**
		 * @readonly
		 */
		this.set( 'subs', new Collection() );
	}

	init() {
		var that = this;

		return Promise.resolve()
			.then( initView )
			.then( initSubControllers );

		function initView() {
			return that.view.init();
		}

		function initSubControllers() {
			return Promise.all( that.subs.map( sub => sub.init() ) );
		}
	}

	addSub( regionName, subController ) {
		this.view.addSub( regionName, subController.view );
		this.subs.add( subController );
	}

	destroy() {
		this.subs.forEach( sub => sub.destroy() );
	}
}

class View {
	init() {
		return Promise.all( this.regions.map( view => view.init() ) );
	}

	addSub( regionName, subView ) {
		this.regions.get( regionName, subView );
	}
}