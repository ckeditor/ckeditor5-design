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
	 * @returns {Object[]}
	 */
	findErrors() {
		this._errors = [];

		this._lintMembers();
		this._lintMemberofProperty();
		this._lintParams();
		this._lintLinks();
		this._lintEvents();
		this._lintInterfaces();

		return this._errors;
	}

	/**
	 * Finds errors in member names
	 * JSDoc changes member name 'a' to module:someModule/a when founds no such name
	 * @protected
	*/
	_lintMembers() {
		this._collection.get( 'member' )
			.filter( member => member.name.indexOf( 'module:' ) === 0 )
			.filter( member => member.scope === 'inner' )
			.forEach( member => this._addError( member, `Wrong member name: ${ member.name }` ) );
	}

	/**
	 * protected
	 */
	_lintMemberofProperty() {
		this._collection.getAll()
			.filter( el => el.memberof && el.memberof.indexOf( 'module:' ) !== 0 )
			.forEach( el => this._addError( el, `Memberof property should start with 'module:'. Got ${ el.memberof } instead` ) );
	}

	_lintLongnameProperty() {
		this._collection.getAll()
			.filter( el => el.longname && el.longname.indexOf( 'module:' ) !== 0 )
			.forEach( el => this._addError( el, `Longname property should start with 'module:'. Got ${ el.longname } instead` ) );
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
				this._addError( element, `Wrong param name: ${ paramFullName }` );
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
					this._addError( element, `Wrong link: ${ path }` );
				}
			}
		}
	}

	_lintEvents() {
		const longNames = this._getAllLongNames();

		for ( const element of this._collection.getAll() ) {
			for ( const event of element.fires || [] ) {
				if ( !longNames.includes( event ) ) {
					this._addError( element, `Wrong event name: ${ event }` );
				}
			}
		}
	}

	_lintInterfaces() {
		const classes = this._collection.get( 'class' );
		const interfaceLongNames = this._collection.get( 'interface' )
			.map( i => i.longname );

		for ( const someClass of classes ) {
			for ( const someInterface of someClass.implements || [] ) {
				if ( !interfaceLongNames.includes( someInterface ) ) {
					this._addError( someClass, `Wrong interface name: ${ someInterface }` );
				}
			}
		}
	}


	_getAllLongNames() {
		return this._collection.getAll()
			.map( el => el.longname );
	}

	/**
	 * @param {string} errorMessage
	 * @private
	 */
	_addError( doclet, errorMessage ) {
		this._errors.push( Object.assign( {
			message: errorMessage,
		}, this._getErrorData( doclet ) ) );
	}

	/**
	 * @param {Object} member
	 * @private
	 */
	_getErrorData( doclet ) {
		return {
			parent: doclet.memberof,
			line: doclet.meta.lineno,
			file: doclet.meta.path + '/' + doclet.meta.filename,
		};
	}
}

module.exports = DocletLinter;
