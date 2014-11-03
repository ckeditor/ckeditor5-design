require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var Button = mvc.View.extend( {
		template: [
			'button', {
				onclick: 'click',
				text: 'Button'
			}
		],

		click: function() {
			console.log( 'Button clicked!' );
		}
	} );

	var button = new Button();

	button.render();

	document.body.appendChild( button.el );
} );