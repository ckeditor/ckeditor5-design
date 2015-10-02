/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var editor;

( function() {
	createEditor();

	// Replaces the <textarea> element in the form with a CKEditor instance.
	function createEditor() {
		// In this development example, we use RequireJS to load CKEditor. In release the editor API will be also
		// available through the global CKEDITOR namespace.
		require( [
			'ckeditor'
		], function ( CKEDITOR ) {
			CKEDITOR
				.create( document.getElementById( 'contents' ), {
					plugins: 'creator'
				} )
				.then( function ( createdEditor ) {
					editor = createdEditor;
				} );
		} );
	}
} )();
