/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ '../../../core/src/ui/view' ], function( View ) {
	class FramedEditable extends View {
		constructor( model ) {
			super( model );

			this.template = {
				tag: 'iframe',
				attributes: {
					'class': [ 'ck-framededitable' ],
					sandbox: 'allow-same-origin'
				}
			};
		};
	}

	return FramedEditable;
} );
