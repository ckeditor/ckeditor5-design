/* global document */

'use strict';

var Converter = require( './converter' ),
	TypeManager = require( './type-manager' ),
	EventEmitter = require( 'events' ).EventEmitter,
	utils = require( './utils' );

function Editor( selector ) {
	EventEmitter.apply( this, arguments );

	this.el = document.querySelector( selector );

	this.typeManager = new TypeManager();
	this.typeManager.register( [
		'break', 'div', 'heading', 'image', 'list', 'listItem', 'paragraph',
		'span', 'text', 'unknown', 'bold', 'italic', 'underline'
	] );

	this.converter = new Converter( this.typeManager );

	this.document = this.converter.getDocForDom( this.el );
}

utils.inherit( Editor, EventEmitter );

utils.extend( Editor.prototype, {
	getDom: function( target ) {
		this.converter.getDomForDoc( this.document, target );
	}
} );

module.exports = Editor;