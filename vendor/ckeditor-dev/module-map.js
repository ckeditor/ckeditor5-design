/* global require */

'use strict';

( () => {
	// This can be retrieved from existing <script> tags or preconfigured by the developer
	// by setting CKEDITOR_BASE_URL.
	const basePath = 'vendor/ckeditor-dev/';

	// NOTE!!!
	// The above setting works but the following one would not:
	//
	// const basePath = './vendor/ckeditor-dev/';
	//
	// Files are loaded but Require.JS does not register modules.
	//
	// The documentation mentions that but it's super confusing.

	require.config( {
		map: {
			'*': {
				'ckeditor': basePath + 'ckeditor',
				'ckeditor5/core/editor': basePath + 'core/editor'
			}
		}
	} );
} )();