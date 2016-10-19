/* jshint browser: false, node: true, strict: true */

'use strict';

function formatLinks( doclet ) {
	const linkRegExp = /\{\@link *((~|#)[^}]+) *\}/;

	return Object.assign( {}, doclet, {
		comment: doclet.comment
			.replace( linkRegExp, ( fullLink, linkName ) => {
				return '{@link ' + doclet.memberof + linkName + '}';
			} ),

		description: doclet.description ? doclet.description.replace( linkRegExp, ( fullLink, linkName ) => {
			return '{@link ' + doclet.memberof + linkName + '}';
		} ) : undefined,
	} );
}

function formatMembers( doclet ) {



	return doclet;
}

module.exports = {
	formatLinks,
	formatMembers,
};
