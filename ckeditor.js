requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/src/',

	packages: [ {
		name: 'plugins/example',
		location: '../../ckeditor-plugin-example/src/',
		main: 'example'
	} ]
} );

var CKEDITOR = CKEDITOR || {};

CKEDITOR.require = CKEDITOR.require || require;
CKEDITOR.define = CKEDITOR.define || define;

require( [
	'mvc',
	'plugins/example',
	'plugins/example/foo'
], function(
	MVC,
	example,
	foo
) {
	console.log( MVC );
	console.log( example );
	console.log( foo );
} );
