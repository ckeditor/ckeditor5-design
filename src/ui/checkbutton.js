define( [
	'ui',
	'ui/button',
	'core/mvc',
	'tools/dombuilder'
], function(
	ui,
	Button,
	MVC,
	_
) {
	var CheckButton = Button.extend( {
		events: {
			'change input': 'onClick'
		},

		template: function( model ) {
			return _( 'label', {
				title: model.title
			}, [
				_( 'input', {
					type: 'checkbox'
				} ),
				_( 'text', model.text )
			] );
		},

		toggle: function( model ) {
			Button.prototype.toggle.call( this, model );
			this.$el.findOne( 'input' )._el.checked = model.active;
		}
	} );

	ui.checkButton = function( options ) {
		return new CheckButton( options );
	};

	return CheckButton;
} );