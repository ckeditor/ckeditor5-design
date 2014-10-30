require.config( {
	baseUrl: '../src/'
} );

require( [
	'ui',
	'core/mvc',
	'tools/dombuilder2',
	'ui/button'
	// 'ui/linkbutton',
	// 'ui/checkbutton'
], function(
	ui,
	MVC,
	B
) {
	var buttonsEl = document.getElementById( 'buttons' );

	var model = window.model = new MVC.Model( {
		text: 'Button text',
		title: 'Button title',
		active: false
	} );

	var button = window.button = ui.button( {
		model: model
	} );

	button.render();

	buttonsEl.appendChild( button.el );

	var Input = MVC.View.extend( {
		template: [
			'input', {
				onchange: MVC.View.bindAttr( 'value', 'model.text', 'trim' ),
				value: MVC.View.bindProp( 'model.text' )
			}
		],

		trim: function( value ) {
			return value.trim();
		}
	} );

	var input = window.input = new Input( {
		model: model
	} );

	input.render();

	document.body.appendChild( input.el );
} );