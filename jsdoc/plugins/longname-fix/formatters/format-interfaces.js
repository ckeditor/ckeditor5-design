/* jshint browser: false, node: true, strict: true */

'use strict';

let lastInterfce;

function formatInterfaces( doclet ) {
	if ( doclet.kind === 'interface' ) {
		lastInterfce = doclet;
		return doclet;
	}

	if ( !lastInterfce ) {
		return doclet;
	}

	if (
		doclet.meta.path !== lastInterfce.meta.path ||
		doclet.meta.filename !== lastInterfce.meta.filename
	) {
		return doclet;
	}

	if ( doclet.longname[0] === '~' ) {
		return Object.assign( {}, doclet, {
			memberof: lastInterfce.memberof,
			longname: lastInterfce.memberof + doclet.longname,
		} );
	}

	if ( doclet.longname[0] === '#' ) {
		return Object.assign( {}, doclet, {
			memberof: lastInterfce.longname,
			longname: lastInterfce.longname + doclet.longname,
		} );
	}

	return doclet;
}

module.exports = formatInterfaces;