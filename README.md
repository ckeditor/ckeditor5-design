AMD Prototype
================================

This prototype demonstrates a possible way to use AMD with RequireJS during the
development of CKEditor.

For general details, please check [Modularity and Namespacing](https://github.com/ckeditor/v5-protos/wiki/Modularity-and-Namespacing)
in the wiki pages.

## Modules

RequireJS has been chosen as the AMD library for the CKEditor dev code.

The `src` directory contains sample source code of the CKEditor API, coded with
AMD. It shows how independence and dependency are clearly defined.

## The CKEDITOR Namespace

One of the tricky parts here is that we have a mix of AMD and namespacing
strategy in our API. Therefore, some tricks had to be figured out so the
`CKEDITOR` namespace is available as well as `require('ckeditor')`.

Samples and tests will use the namespace way to invoke API features.

## Building CKEditor

Another important goal in the prototype research is understanding our
distribution strategy, considering the AMD approach on coding.

The prototype includes a build tool. To execute it:

```
> grunt build
```

The following issues should have been addressed:

1. End-developers should have no need of external libraries to run CKEditor. So
   RequireJS should not be required.
2. Our distribution code should be minimal.
3. The whole CKEditor API should be exposed as a AMD module.

Some details about solutions for the above:

* Modules are merged with the [RequireJS optimizer](http://requirejs.org/docs/optimization.html).
* RequireJS is not include in the build.
* To solve the RequireJS dependency, [AMDClean](https://www.npmjs.org/package/amdclean)
  is used. It magically removes AMD from the code, transforming define/require
  calls into pure JavaScript.
* Of course, minification is performed with [UglifyJS](https://www.npmjs.org/package/uglify-js).
