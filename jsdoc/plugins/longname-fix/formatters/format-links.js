/* jshint browser: false, node: true, strict: true */

'use strict';

function formatLinks( config ) {
	let { doclet } = config;
	const linkRegExp = /{@link *([~#][^}]+)}/g;
	const replacer = ( fullLink, linkContent ) => {
		const [ ref, linkName ] = linkContent.split( ' ' );
		const [ className, methodName ] = ref.split( '#' );

		let result = '{@link ' + doclet.memberof;

		if ( !doclet.memberof.includes( className ) ) {
			return result + linkContent + '}';
		}

		if ( methodName ) {
			result += '#' + methodName;
		}

		if ( linkName ) {
			result += ' ' + linkName;
		}

		return result + '}';
	};

	const comment = doclet.comment.replace( linkRegExp, replacer );

	let description = doclet.description;

	if ( description ) {
		description = doclet.description.replace( linkRegExp, replacer );
	}

	doclet = Object.assign( {}, doclet, { comment, description });

	return Object.assign( {}, config, { doclet });
}

module.exports = formatLinks;