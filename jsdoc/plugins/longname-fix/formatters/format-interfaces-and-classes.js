/* jshint browser: false, node: true, strict: true */

'use strict';
const assign = Object.assign;

function formatInterfacesAndClasses( object ) {
	let { doclet, lastInterfaceOrClass } = object;

	if ( doclet.kind === 'interface' || doclet.kind === 'class' ) {
		return assign( {}, object, { lastInterfaceOrClass: doclet } );
	}

	if ( !lastInterfaceOrClass ) {
		return object;
	}

	if (
		doclet.meta.path !== lastInterfaceOrClass.meta.path ||
		doclet.meta.filename !== lastInterfaceOrClass.meta.filename
	) {
		return object;
	}

	return fixShortNameIssue( object );
}

function fixShortNameIssue( object ) {
	let { doclet, lastInterfaceOrClass } = object;
	const firstNameChar = doclet.longname[0];

	if ( firstNameChar === '~' ) {
		doclet = assign( {}, doclet, {
			memberof: lastInterfaceOrClass.memberof + '~' + lastInterfaceOrClass.name,
			longname: lastInterfaceOrClass.memberof + doclet.longname,
		} );
	}

	if ( firstNameChar === '#' ) {
		doclet = assign( {}, doclet, {
			memberof: lastInterfaceOrClass.longname,
			longname: lastInterfaceOrClass.longname + doclet.longname,
		} );
	}

	return assign( {}, object, { doclet } );
}

module.exports = formatInterfacesAndClasses;