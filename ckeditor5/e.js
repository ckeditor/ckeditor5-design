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
 */
function some1() {
}

/**
 * The some2 function.
 */
function some2() {
}
