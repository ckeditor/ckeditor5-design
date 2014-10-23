require.config( {
	baseUrl: '../src/'
} );

require( [
	'ui',
	'core/mvc',
	'ui/checkbutton',
	'ui/linkbutton'
], function(
	ui,
	MVC
) {
	var buttonsEl = document.getElementById( 'buttons' );

	var model = window.model = new MVC.Model( {
		text: 'Button',
		title: 'Button title',
		active: false
	} );

	var btn1 = ui.button( {
		model: model
	} );

	btn1.render();
	buttonsEl.appendChild( btn1.el );


	var btn2 = ui.linkButton( {
		model: model
	} );

	btn2.render();
	buttonsEl.appendChild( btn2.el );

	var btn3 = ui.checkButton( {
		model: model
	} );

	btn3.render();
	buttonsEl.appendChild( btn3.el );

} );