/**
 * Collection of <String, Object[]> pairs.
 */
class Collection {
	/**
	 * Creates collection of <String, Object[]> pairs
	 */
	constructor() {
		this._data = {};
	}

	/**
	 * Adds record to collection
	 *
	 * @param {String} name
	 * @param {Object} record
	*/
	add( name, record ) {
		if ( !this._data[name] ) {
			this._data[ name ] = [];
		}

		this._data[ name ].push( record );
	}

	/**
	 * Returns records filtered by name.
	 *
	 * @param {String} name
	 * @returns {Object[]}
	 */
	get( name ) {
		return this._data[ name ] || [];
	}

	/**
	 * Returns all records.
	 *
	 * @returns {Object[]}
	*/
	getAll() {
		let result = [];

		Object.keys( this._data ).forEach( key => {
			result.push( ...this._data[ key ] );
		} );

		return result;
	}
}

module.exports = Collection;
