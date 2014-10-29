require.config( {
	baseUrl: '../src/'
} );

require( [
	'ui',
	'core/mvc',
	'tools/dombuilder2',
	'ui/button'
], function(
	ui,
	MVC,
	B
) {
	var buttonsEl = document.getElementById( 'buttons' );

	var model = window.model = new MVC.Model( {
		text: 'Input text',
		title: 'Input title',
		active: false,
		counter: 1
	} );

	var button = window.button = ui.button( {
		model: model
	} );

	button.render();

	buttonsEl.appendChild( button.el );

	var text = B( 'p', [
		'Current counter value is: ',
		B( 'span', {
			textContent: B.watchProp( model, 'counter' )
		} ),
		'!'
	] );

	buttonsEl.appendChild( text );
} );