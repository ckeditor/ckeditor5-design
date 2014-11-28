	var CKE = require( 'ckeditor' );

	CKE._dependencyTree = dependencyTree || {};
	CKE.define = CKE.define || define;
	CKE.require = CKE.require || require;

	return CKE;
} );
