'use strict';

define(['exports', './model', '../ckeditor5/load'], function (exports, _model, _load) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _model2 = _interopRequireDefault(_model);

	var _load2 = _interopRequireDefault(_load);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class Editor extends _model2.default {
		constructor(features) {
			super();
			console.log('Editor.constructor()');
			this._features = features;
			this.features = new Map();
		}

		init() {
			const promises = [];
			const features = this.features;
			const that = this;

			this._features.forEach(feature => {
				if (typeof feature == 'function') {
					initFeatureByClass(feature);
				} else {
					initFeatureByName(feature);
				}
			});

			return Promise.all(promises).then(() => this);

			function initFeatureByName(featureName) {
				let featurePath;

				if (featureName.indexOf('/') == -1) {
					featurePath = `../ckeditor5-${ featureName }/${ featureName }`;
				} else {
					featurePath = `../ckeditor5-${ featureName }`;
				}

				promises.push((0, _load2.default)(featurePath).then(Feature => initFeatureByClass(Feature.default, featureName)));
			}

			function initFeatureByClass(Feature, featureName) {
				const requires = Feature.requires;

				if (requires) {
					requires.forEach(DepFeature => {
						if (!isAlreadyInited(DepFeature)) {
							initFeature(DepFeature);
						}
					});
				}

				initFeature(Feature, featureName);
			}

			function initFeature(Feature, featureName) {
				const feature = new Feature(that);

				if (featureName) {
					features.set(featureName, feature);
				}

				features.set(Feature, feature);
			}

			function isAlreadyInited(Feature) {
				return !!features.get(Feature);
			}
		}

	}

	exports.default = Editor;
});