define( [
	'ui',
	'ui/button',
	'core/mvc',
	'tools/dombuilder2'
], function(
	ui,
	Button,
	MVC,
	_
) {
	var CheckButton = Button.extend( {
		template: function( model ) {
			return _( 'label', {
				className: _.watchProp( model, 'active', this.isActive ),
				title: _.watchProp( model, 'title' )
			}, [
				_( 'input[type=checkbox]', {
					onchange: this.click.bind( this ),
					checked: _.watchProp( model, 'active' )
				} ),
				_( 'span', _.watchProp( model, 'text' ) )
			] );
		}
	} );

	ui.checkButton = function( options ) {
		return new CheckButton( options );
	};

	return CheckButton;
} );