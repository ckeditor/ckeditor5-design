/* global document */

'use strict';

var EventEmitter = require( 'events' ).EventEmitter,
	Document = require( './document' ),
	utils = require( './utils' );

function Editor( selector ) {
	EventEmitter.apply( this, arguments );

	this.el = document.querySelector( selector );

	this.document = new Document( this.el );
}

utils.inherit( Editor, EventEmitter );

utils.extend( Editor.prototype, {
	getDom: function( target ) {
		this.document.buildDom( target );
	}
} );

module.exports = Editor;