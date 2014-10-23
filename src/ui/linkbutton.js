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
		template: function( options ) {
			return _( 'a', {
				href: 'javascript:;',
				title: options.title,
				text: options.text
			} );
		}
	} );

	ui.linkButton = function( options ) {
		return new LinkButton( options );
	};

	return LinkButton;
} );