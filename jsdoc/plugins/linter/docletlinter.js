/* jshint browser: false, node: true, strict: true */

const Collection = require( '../utils/collection' );

/**
 * Main linting class
 * @class DocletLinter
 */
class DocletLinter {
	/**
	 * Creates DocletLinter
	 */
	constructor( doclets ) {
		/**
		 * 	Errors founded in findErrors method.
		 *  @protected
		 * */
		this._errors = [];

		/**
		 * doclets grouped by doclet kind
		 * @private
		 */
		this._collection = this._createCollection( doclets );
	}

	/**
	 * Creates doclets grouped by doclet kind
	 * @private
	 * @returns {Collection}
	 */
	_createCollection( doclets ) {
		const collection = new Collection();

		for ( const doclet of doclets ) {
			collection.add( doclet.kind, doclet );
		}

		return collection;
	}

	/**
	 * @public
	 * @returns {string[]}
	 */
	findErrors() {
		this._errors = [];

		this._lintMembers();
		this._lintParams();
		this._lintLinks();

		return this._errors;
	}

	/**
	 * Finds errors in member names
	 * JSDoc changes member name 'a' to module:someModule/a when founds no such name
	 * @protected
	*/
	_lintMembers() {
		this._collection.get( 'member' )
			.filter( member => member.name.includes( 'module:' ) )
			.filter( member => member.scope === 'inner' )
			.forEach( member => this._errors.push(
				`Wrong member name: ${ member.name } in ${ member.meta.filename }, ${ member.memberof }`
			) );
	}

	/**
	 * Finds errors in parameter types
	 * @protected */
	_lintParams() {
		const collections = [
			...this._collection.get( 'function' ),
			...this._collection.get( 'class' ),
		]
			.filter( el => !!el.params );

		for ( const element of collections ) {
			for ( const param of element.params ) {
				this._lintElementParams( element, param );
			}
		}
	}

	/**
	 * @private
	 */
	_lintElementParams( element, param ) {
		const typeNames = this._collection.getAll()
			.map( el => el.longname );

		const paramFullNames = Array.isArray( param.type.parsedType.elements ) ?
			param.type.parsedType.elements.map( type => type.name ) :
			[ param.type.parsedType.name ];

		for ( const paramFullName of paramFullNames ) {
			if ( paramFullName.includes( 'module:' ) && !typeNames.includes( paramFullName ) ) {
				this._errors.push(
					`Wrong param name: ${ paramFullName } in ${ element.meta.filename }, ${ element.longname }`
				);
			}
		}
	}

	/**
	 * Finds errors in links
	 * @protected
	 */
	_lintLinks() {
		const allLinkRegExp = /\{\@link *[^} ]+(\}| )/g;
		const pathRegExp = /\{\@link *([^} ]+)(\}| )/;

		const typeNames = this._collection.getAll()
			.map( el => el.longname );

		for ( const element of this._collection.getAll() ) {
			const paths = ( element.comment.match( allLinkRegExp ) || [] )
				.map( link => link.match( pathRegExp )[1] );

			for ( const path of paths ) {
				if ( !typeNames.includes( path ) ) {
					this._errors.push(
						`Wrong link: ${ path } in ${ element.meta.filename }, ${ element.longname }`
					);
				}
			}
		}
	}
}

module.exports = DocletLinter;
