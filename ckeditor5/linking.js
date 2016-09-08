/**
 * Linking test:
 *
 * * a:
 *   * {@link module:ckeditor5/a~A} but not {@link module:ckeditor5/a.A}
 * * b:
 *   * {@link module:ckeditor5/b~Some1} but not {@link module:ckeditor5/b.Some1}
 *   * {@link module:ckeditor5/b~Some2}
 * * c:
 *   * {@link module:ckeditor5/c.some1} but not {@link module:ckeditor5/c~some1}
 *   * {@link module:ckeditor5/c.some2}
 * * d:
 *   * {@link module:ckeditor5/d.some1}
 * * e:
 *   * {@link module:ckeditor5/e.s1}
 *   * {@link module:ckeditor5/e.s2}
 * * f:
 *   * {@link module:ckeditor5/f.v1}
 *
 * According to the [documentation](http://usejsdoc.org/about-namepaths.html) `# . ~` should work in the same way
 * (at least in some cases):
 *
 * > This chaining can be used with any combination of the connecting symbols: # . ~
 *
 * To make it more confusing, the [documentation](http://usejsdoc.org/howto-es2015-modules.html) defines also
 * such a namespace `module:my/pants.Jeans#hem`.
 *
 * @module ckeditor5/linking
 */
