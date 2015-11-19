define(function () { 'use strict';

	class Feature {
		constructor() {
			console.log( 'Feature.constructor()' );
		}
	}

	class Button extends Feature {
		constructor() {
			super();

			console.log( 'Button.constructor()' );
		}
	}

	class Image extends Feature {
		constructor() {
			super();

			console.log( 'Image.constructor()' );
		}
	}

	class ImageCaption extends Feature {
		constructor( editor ) {
			super();

			console.log( 'ImageCaption.constructor()' );
			console.log( 'Image should already be initialised', editor.features.get( Image ) );
		}
	}

	ImageCaption.requires = [ Image ];

	function proof( message ) {
		console.log( `proof( ${ message } );` );
	}

	class Link extends Feature {
		constructor() {
			super();

			console.log( 'Link.constructor()' );
		}
	}

	proof( 'Calling from a plugin.' );

	class ClassicCreator {
		constructor( editor ) {
			console.log( 'ClassicCreator.constructor()' );

			this.editor = editor;

			// Checking if cross-package imports work...
			this.link = new Link();
		}
	}

	class BasicStyle extends Feature {
		constructor() {
			super();

			console.log( 'BasicStyle.constructor()' );
		}
	}

	class Italic extends BasicStyle {
		constructor() {
			super();

			console.log( 'Italic.constructor()' );
		}
	}

	class Bold extends BasicStyle {
		constructor() {
			super();

			console.log( 'Bold.constructor()' );
		}
	}

	class Model {
		constructor() {
			console.log( 'Model.constructor()' );
		}
	}

	class Editor extends Model {
		constructor( features ) {
			super();

			console.log( 'Editor.constructor()' );

			this._features = features;
			this.features = new Map();
		}

		init() {
			const promises = [];
			const features = this.features;
			const that = this;

			this._features.forEach( ( feature ) => {
				if ( typeof feature == 'function' ) {
					initFeatureByClass( feature );
				} else {
					initFeatureByName( feature );
				}
			} );

			return Promise.all( promises ).then( () => this );

			function initFeatureByName( featureName ) {
				let featurePath;

				if ( featureName.indexOf( '/' ) == -1 ) {
					featurePath = `ckeditor5-${ featureName }/${ featureName }`;
				} else {
					featurePath = `ckeditor5-${ featureName }`;
				}

				const promise = System
					.import( featurePath )
					.then( ( FeatureModule ) => {
						const Feature = FeatureModule.default;

						initFeatureByClass( Feature, featureName );
					} );

				promises.push( promise );
			}

			function initFeatureByClass( Feature, featureName ) {
				const requires = Feature.requires;

				if ( requires ) {
					requires.forEach( ( DepFeature ) => {
						if ( !isAlreadyInited( DepFeature ) ) {
							initFeature( DepFeature );
						}
					} );
				}

				initFeature( Feature, featureName );
			}

			function initFeature( Feature, featureName ) {
				const feature = new Feature( that );

				if ( featureName ) {
					features.set( featureName, feature );
				}

				features.set( Feature, feature );
			}

			function isAlreadyInited( Feature ) {
				return !!features.get( Feature );
			}
		}
	}

	proof( 'Calling from ckeditor.js' );

	const CKEDITOR = {
		create: create
	};

	function create( config ) {
		console.log( 'CKEDITOR.create()' );

		const editor = new Editor( config.features );

		return editor.init();
	}

	CKEDITOR.features = [ Bold, Italic, ClassicCreator, ImageCaption, Button ];

	return CKEDITOR;

});
//# sourceMappingURL=ckeditor5-amd.js.map