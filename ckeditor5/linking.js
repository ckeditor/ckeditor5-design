/**
 * Linking test:
 *
 * * a:
 *   * {@link module:a~A} but not {@link module:a.A}
 * * b:
 *   * {@link module:b~Some1} but not {@link module:b.Some1}
 *   * {@link module:b~Some2}
 * * c:
 *   * {@link module:c.some1} but not {@link module:c~some1}
 *   * {@link module:c.some2}
 * * d:
 *   * {@link module:d.some1}
 * * e:
 *   * {@link module:e.s1}
 *   * {@link module:e.s2}
 * * f:
 *   * {@link module:f.v1}
 *
 * According to the [documentation](http://usejsdoc.org/about-namepaths.html) `# . ~` should work in the same way
 * (at least in some cases):
 *
 * > This chaining can be used with any combination of the connecting symbols: # . ~
 *
 * To make it more confusing, the [documentation](http://usejsdoc.org/howto-es2015-modules.html) defines also
 * such a namespace `module:my/pants.Jeans#hem`.
 *
 * @module linking
 */
