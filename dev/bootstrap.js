require.config( {
	baseUrl: '../src/'
} );

require( [
	'ui',
	'core/mvc',
	'tools/dombuilder2',
	'editor/editor',
	'ui/checkbutton',
	'ui/linkbutton'
], function(
	ui,
	MVC,
	B
) {
	var buttonsEl = document.getElementById( 'buttons' );

	var model = window.model = new MVC.Model( {
		text: 'Input text',
		title: 'Input title',
		active: false
	} );

	var button = window.button = B( 'button.cke_button', {
		className: B.watchProp( model, 'active', function( value ) {
			return value ? 'active' : '';
		} ),
		onclick: function() {
			model.active = !model.active;
		}
	}, [
		B( 'span.cke_button_icon' ),
		B( 'span', {
			textContent: B.watchProp( model, 'text' )
		} )
	] );

	buttons.appendChild( button );

} );