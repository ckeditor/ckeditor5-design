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
	this.observer = new MutationObserver( this.handleMutations.bind( this ) );
	this.observer.observe( this.el, config );
}

Editable.prototype = {
	handleMutations: function( mutations ) {
		mutations.forEach( function( mutation ) {
			switch ( mutation.type ) {
				case 'characterData':
					console.log( 'text - old: "' + mutation.oldValue + '" new: "' + mutation.target.data + '"' );
					break;

				case 'childList':
					console.log( 'child list - addedNodes:', mutation.addedNodes, 'removedNodes:', mutation.removedNodes );
					break;
			}
		} );
	}
};

module.exports = Editable;