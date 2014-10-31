define( [
	'ui',
	'ui/button'
], function(
	ui,
	Button
) {
	var LinkButton = Button.extend( {
		template: [ 'a', {
			className: Button.bindProp( 'model.active', 'isActive' ),
			href: 'javascript:;',
			onclick: 'click',
			title: Button.bindProp( 'model.title' ),
			children: [
				[ 'span', Button.bindProp( 'model.text' ) ]
			]
		} ]
	} );

	ui.linkButton = function( options ) {
		return new LinkButton( options );
	};

	return LinkButton;
} );