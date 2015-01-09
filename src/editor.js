/* global document */

'use strict';

var EventEmitter = require( 'events' ).EventEmitter,
	Document = require( './document' ),
	Editable = require( './editable' ),
	utils = require( './utils' );

function Editor( selector ) {
	EventEmitter.apply( this, arguments );

	this.el = document.querySelector( selector );
	this.document = new Document( this.el );
	this.editable = new Editable( this.document, this.el );
}

utils.inherit( Editor, EventEmitter );

utils.extend( Editor.prototype, {} );

module.exports = Editor;