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
	var LinkButton = Button.extend( {
		template: function( model ) {
			return _( 'a', {
				href: 'javascript:;',
				title: model.title,
				text: model.text
			} );
		}
	} );

	ui.linkButton = function( options ) {
		return new LinkButton( options );
	};

	return LinkButton;
} );