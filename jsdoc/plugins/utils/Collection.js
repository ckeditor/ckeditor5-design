/**
 * Collection of <string, T[]> pairs
 * @template T
 */
class Collection {
	/**
	 * Creates collection of <string, T[]> pairs
	 */
	constructor() {
		this._data = {};
	}

	/**
	 * Adds record to collection
	 * @param {string} name
	 * @param {T} record
	*/
	add( name, record ) {
		if ( !this._data[name] ) {
			this._data[name] = [];
		}

		this._data[name].push( record );
	}

	/**
	 * Returns records filtered by name
	 * @param {string} name
	 * @returns {T[]}
	 */
	get( name ) {
		return this._data[name] || [];
	}

	/**
	 * Returns all records
	 * @returns {T[]}
	*/
	getAll () {
		let result = [];

		Object.keys( this._data ).forEach( key => {
			result.push( ...this._data[key] );
		} );

		return result;
	}
}

module.exports = Collection;