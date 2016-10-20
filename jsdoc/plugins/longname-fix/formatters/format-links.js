/* jshint browser: false, node: true, strict: true */

'use strict';

function formatLinks( doclet ) {
	const linkRegExp = /{@link *([~#][^}]+) *}/g;
	const replacer = ( fullLink, linkName ) => {
		const [ ref ] = linkName.split( ' ' );

		return doclet.memberof.includes( ref ) ?
			'{@link ' + doclet.memberof + '}' :
			'{@link ' + doclet.memberof + linkName + '}';
	};

	const comment = doclet.comment.replace( linkRegExp, replacer );

	let description = doclet.description;

	if ( description ) {
		description = doclet.description.replace( linkRegExp, replacer );
	}

	return Object.assign( {}, doclet, { comment, description } );
}

module.exports = formatLinks;