var utils = require( './utils' );

var config = {
	childList: true,
	subtree: true,
	characterData: true,
	characterDataOldValue: true,
	attributes: true,
	attributeOldValue: true
};

function Editable( document, el ) {
	this.document = document;
	this.el = el;

	this.observer = new MutationSummary( {
		callback: this.mutationHandler.bind( this ),
		queries: [ {
			all: true
		} ],
		rootNode: this.el
	} );
}

Editable.prototype = {
	mutationHandler: function( summaries ) {
		console.log(summaries.length);
		summaries.forEach( function( summary ) {
			console.log( summary );
		} );
	}
};

module.exports = Editable;