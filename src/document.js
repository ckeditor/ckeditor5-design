'use strict';

var EventEmitter = require( 'events' ).EventEmitter,
	Converter = require( './converter' ),
	TypeManager = require( './type-manager' ),
	Normalizer = require( './normalizer' ),
	Branch = require( './branch' ),
	Delta = require( 'rich-text' ).Delta,
	utils = require( './utils' );

function Document( dom ) {
	EventEmitter.call( this );
	this.dom = dom;

	this.normalizer = new Normalizer();
	this.normalizer.normalize( this.dom );

	this.typeManager = new TypeManager();
	this.typeManager.register( [
		'break', 'div', 'heading', 'image', 'list', 'listItem', 'paragraph',
		'span', 'text', 'unknown', 'bold', 'italic', 'underline'
	] );

	this.converter = new Converter( this.typeManager );

	this.ops = this.converter.getOperationsForDom( this.dom );
}

utils.inherit( Document, EventEmitter );

Document.prototype = {

};

module.exports = Document;