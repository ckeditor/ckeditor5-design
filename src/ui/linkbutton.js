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
	var LinkButton = Button.extend( {
		template: function( model ) {
			return _( 'a', {
				className: _.watchProp( model, 'active', this.isActive ),
				href: 'javascript:;',
				onclick: this.click.bind( this ),
				title: _.watchProp( model, 'title' )
			}, [
				_( 'span', _.watchProp( model, 'text' ) )
			] );
		}
	} );

	ui.linkButton = function( options ) {
		return new LinkButton( options );
	};

	return LinkButton;
} );