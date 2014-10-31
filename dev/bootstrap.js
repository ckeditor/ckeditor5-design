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

	model.on( 'change:active', function( model ) {
		model.counter++;
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

	var Input = MVC.View.extend( {
		template: [
			'input', {
				oninput: MVC.View.bindAttr( 'value', 'model.text', 'trim' ),
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

	var Counter = MVC.View.extend( {
		length: function( value ) {
			return value.length;
		},

		template: [
			'p', {
				children: [
					'Input length: ', [ 'span', MVC.View.bindProp( 'model.text', 'length' ) ]
				]
			}
		]
	} );

	var counter = new Counter( {
		model: model
	} );

	counter.render();

	document.body.appendChild( counter.el );
} );