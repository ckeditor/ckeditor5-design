require.config( {
	baseUrl: '../src/'
} );

require( [
	'ui',
	'core/mvc',
	'tools/dombuilder2',
	'ui/button',
	'ui/linkbutton',
	'ui/checkbutton'
], function(
	ui,
	MVC,
	B
) {
	var buttonsEl = document.getElementById( 'buttons' );

	var model = window.model = new MVC.Model( {
		text: 'Button text',
		title: 'Button title',
		active: false,
		counter: 0
	} );

	var button = window.button = ui.button( {
		model: model
	} );

	button.render();

	buttonsEl.appendChild( button.el );

	var linkButton = window.linkButton = ui.linkButton( {
		model: model
	} );

	linkButton.render();

	buttonsEl.appendChild( linkButton.el );

	var checkButton = window.checkButton = ui.checkButton( {
		model: model
	} );

	checkButton.render();

	buttonsEl.appendChild( checkButton.el );

	model.on( 'change:active', function() {
		model.counter++;
	} );

	var text = B( 'p', 'Current counter value is: ', [
		B( 'span', B.watchProp( model, 'counter' ) )
	] );

	buttonsEl.appendChild( text );
} );