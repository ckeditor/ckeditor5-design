requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/src/'
} );

window.CKEDITOR = window.CKEDITOR || {};
CKEDITOR.define = CKEDITOR.define || define;
CKEDITOR.require = CKEDITOR.require || require;
