System.register("ckeditor5-image/image.js", ["ckeditor5-core/feature.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-image/image.js";
  var Feature;
  return {
    setters: [function($__m) {
      Feature = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Image() {
          $traceurRuntime.superConstructor(Image).call(this);
          console.log('Image.constructor()');
        }
        return ($traceurRuntime.createClass)(Image, {}, {}, $__super);
      }(Feature));
    }
  };
});

System.register("ckeditor5-image/imagecaption.js", ["ckeditor5-core/feature.js", "ckeditor5-image/image.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-image/imagecaption.js";
  var Feature,
      Image,
      requires;
  return {
    setters: [function($__m) {
      Feature = $__m.default;
    }, function($__m) {
      Image = $__m.default;
    }],
    execute: function() {
      requires = [Image];
      $__export("requires", requires);
      $__export('default', function($__super) {
        function ImageCaption(editor) {
          $traceurRuntime.superConstructor(ImageCaption).call(this);
          console.log('ImageCaption.constructor()');
          console.log('Image should already be initialised', editor.features.get(Image));
        }
        return ($traceurRuntime.createClass)(ImageCaption, {}, {}, $__super);
      }(Feature));
    }
  };
});

System.register("src/proof.js", [], function($__export) {
  "use strict";
  var __moduleName = "src/proof.js";
  function proof(message) {
    console.log(("proof( " + message + " );"));
  }
  $__export("default", proof);
  return {
    setters: [],
    execute: function() {}
  };
});

System.register("ckeditor5-link/link.js", ["ckeditor5-core/feature.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-link/link.js";
  var Feature;
  return {
    setters: [function($__m) {
      Feature = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Link() {
          $traceurRuntime.superConstructor(Link).call(this);
          console.log('Link.constructor()');
        }
        return ($traceurRuntime.createClass)(Link, {}, {}, $__super);
      }(Feature));
    }
  };
});

System.register("ckeditor5-classiccreator/classiccreator.js", ["ckeditor5-link/link.js", "src/proof.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-classiccreator/classiccreator.js";
  var Link,
      proof;
  return {
    setters: [function($__m) {
      Link = $__m.default;
    }, function($__m) {
      proof = $__m.default;
    }],
    execute: function() {
      proof('Calling from a plugin.');
      $__export('default', function() {
        function ClassicCreator(editor) {
          console.log('ClassicCreator.constructor()');
          this.editor = editor;
          this.editor.features.set('link', new Link());
        }
        return ($traceurRuntime.createClass)(ClassicCreator, {}, {});
      }());
    }
  };
});

System.register("ckeditor5-button/button.js", ["ckeditor5-core/feature.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-button/button.js";
  var Feature;
  return {
    setters: [function($__m) {
      Feature = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Button() {
          $traceurRuntime.superConstructor(Button).call(this);
          console.log('Button.constructor()');
        }
        return ($traceurRuntime.createClass)(Button, {}, {}, $__super);
      }(Feature));
    }
  };
});

System.register("ckeditor5-basicstyles/italic.js", ["ckeditor5-basicstyles/basicstyle.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-basicstyles/italic.js";
  var BasicStyle;
  return {
    setters: [function($__m) {
      BasicStyle = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Italic() {
          $traceurRuntime.superConstructor(Italic).call(this);
          console.log('Italic.constructor()');
        }
        return ($traceurRuntime.createClass)(Italic, {}, {}, $__super);
      }(BasicStyle));
    }
  };
});

System.register("ckeditor5-core/feature.js", [], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-core/feature.js";
  return {
    setters: [],
    execute: function() {
      $__export('default', function() {
        function Feature() {
          console.log('Feature.constructor()');
        }
        return ($traceurRuntime.createClass)(Feature, {}, {});
      }());
    }
  };
});

System.register("ckeditor5-basicstyles/basicstyle.js", ["ckeditor5-core/feature.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-basicstyles/basicstyle.js";
  var Feature;
  return {
    setters: [function($__m) {
      Feature = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function BasicStyle() {
          $traceurRuntime.superConstructor(BasicStyle).call(this);
          console.log('BasicStyle.constructor()');
        }
        return ($traceurRuntime.createClass)(BasicStyle, {}, {}, $__super);
      }(Feature));
    }
  };
});

System.register("ckeditor5-basicstyles/bold.js", ["ckeditor5-basicstyles/basicstyle.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-basicstyles/bold.js";
  var BasicStyle;
  return {
    setters: [function($__m) {
      BasicStyle = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Bold() {
          $traceurRuntime.superConstructor(Bold).call(this);
          console.log('Bold.constructor()');
        }
        return ($traceurRuntime.createClass)(Bold, {}, {}, $__super);
      }(BasicStyle));
    }
  };
});

System.register("ckeditor5/proof.js", [], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5/proof.js";
  function proof(message) {
    console.log(("proof( " + message + " );"));
  }
  $__export("default", proof);
  return {
    setters: [],
    execute: function() {}
  };
});

System.register("ckeditor5-core/model.js", [], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-core/model.js";
  return {
    setters: [],
    execute: function() {
      $__export('default', function() {
        function Model() {
          console.log('Model.constructor()');
        }
        return ($traceurRuntime.createClass)(Model, {}, {});
      }());
    }
  };
});

System.register("ckeditor5-core/editor.js", ["ckeditor5-core/model.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor5-core/editor.js";
  var Model;
  return {
    setters: [function($__m) {
      Model = $__m.default;
    }],
    execute: function() {
      $__export('default', function($__super) {
        function Editor(features) {
          $traceurRuntime.superConstructor(Editor).call(this);
          console.log('Editor.constructor()');
          this._features = features;
          this.features = new Map();
        }
        return ($traceurRuntime.createClass)(Editor, {init: function() {
            var $__2 = this;
            var promises = [];
            var features = this.features;
            var that = this;
            this._features.forEach(function(featureName) {
              var featurePath;
              if (featureName.indexOf('/') == -1) {
                featurePath = ("ckeditor5-" + featureName + "/" + featureName);
              } else {
                featurePath = ("ckeditor5-" + featureName);
              }
              var promise = System.import(featurePath).then(function(FeatureModule) {
                var requires = FeatureModule.requires;
                var Feature = FeatureModule.default;
                if (requires) {
                  requires.forEach(function(DepFeature) {
                    if (!isAlreadyInited(DepFeature)) {
                      initFeature(null, DepFeature);
                    }
                  });
                }
                initFeature(featureName, Feature);
              });
              promises.push(promise);
            });
            return Promise.all(promises).then(function() {
              return $__2;
            });
            function initFeature(featureName, Feature) {
              var feature = new Feature(that);
              if (featureName) {
                features.set(featureName, feature);
              }
              features.set(Feature, feature);
            }
            function isAlreadyInited(Feature) {
              return !!features.get(Feature);
            }
          }}, {}, $__super);
      }(Model));
    }
  };
});

System.register("ckeditor.js", ["ckeditor5-core/editor.js", "ckeditor5/proof.js"], function($__export) {
  "use strict";
  var __moduleName = "ckeditor.js";
  var Editor,
      proof,
      CKEDITOR;
  function create(config) {
    console.log('CKEDITOR.create()');
    var editor = new Editor(config.features);
    return editor.init();
  }
  $__export("create", create);
  return {
    setters: [function($__m) {
      Editor = $__m.default;
    }, function($__m) {
      proof = $__m.default;
    }],
    execute: function() {
      proof('Calling from ckeditor.js');
      CKEDITOR = {create: create};
      $__export('default', CKEDITOR);
    }
  };
});
