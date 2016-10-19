/* jshint browser: false, node: true, strict: true */

'use strict';

function formatLinks( doclet ) {
	const linkRegExp = /{@link *([~#][^}]+) *}/;
	const comment = doclet.comment
		.replace( linkRegExp, ( fullLink, linkName ) => {
			return '{@link ' + doclet.memberof + linkName + '}';
		} );
	let description = doclet.description;

	if ( description ) {
		description = doclet.description.replace( linkRegExp, ( fullLink, linkName ) => {
			return '{@link ' + doclet.memberof + linkName + '}';
		} );
	}

	return Object.assign( {}, doclet, { comment, description } );
}

function formatMembers( doclet ) {



	return doclet;
}

module.exports = {
	formatLinks,
	formatMembers,
};
