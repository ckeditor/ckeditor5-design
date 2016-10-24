/* jshint browser: false, node: true, strict: true */

'use strict';
const assign = Object.assign;

function formatInterfacesAndClasses( object ) {
	let { doclet, lastInterfaceOrClass } = object;

	if ( doclet.kind === 'interface' || doclet.kind === 'class' ) {
		object = assign( {}, object, { lastInterfaceOrClass: doclet } );

		return fixShortNameInEvents( object );
	}

	if (
		!lastInterfaceOrClass ||
		doclet.meta.path !== lastInterfaceOrClass.meta.path ||
		doclet.meta.filename !== lastInterfaceOrClass.meta.filename
	) {
		return object;
	}

	object = fixShortNamesInLongnameAndMemeberof( object );

	return fixShortNameInEvents( object );
}

function fixShortNamesInLongnameAndMemeberof( object ) {
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

function fixShortNameInEvents( object ) {
	let { doclet } = object;

	if ( !doclet.fires ) {
		return object;
	}

	const fires = doclet.fires.map( event => {
		if ( event.indexOf( 'module:' ) === 0 ) {
			return event;
		}

		const paramName = event.split( '#' )[1];

		return doclet.memberof + '#' + paramName;
	} );

	doclet = assign( {}, doclet, { fires } );

	return assign( {}, object, { doclet } );
}

module.exports = formatInterfacesAndClasses;