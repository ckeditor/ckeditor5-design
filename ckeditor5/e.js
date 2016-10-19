/**
 * Both of the functions here should automatically be exported as "s1" and "s2", but instead we need to
 * use the `@function` tag.
 *
 * @module e
 */

export {
	some1 as s1,
	some2 as s2
};

/**
 * The some1 function.
 *
 * @function s1
 * @memberOf module:e
 */
function some1() {
}

/**
 * The some2 function.
 *
 * @function s2
 * @memberOf module:e
 * @param {String} foo The foo param.
 */
function some2() {
}
