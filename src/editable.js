define( [
	'document',
	'mutationSummary',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Document,
	MutationSummary,
	Element,
	Emitter,
	utils
) {
	'use strict';

	var config = {
		childList: true,
		subtree: true,
		characterData: true,
		characterDataOldValue: true,
		attributes: true,
		attributeOldValue: true
	};

	function Editable( sourceElement ) {
		// create a document for this editable area
		console.time('document');
		this.document = new Document( sourceElement );
		console.timeEnd('document');

		// create an element for the editable area
		this.$el = Element.create( 'div' );

		// TODO append the document tree to this element
		// this.$el.append( this.document.tree.documentNode.$element );

		// attach the mutation observer
		this.observer = new MutationSummary( {
			callback: this.mutationHandler.bind( this ),
			queries: [ {
				all: true
			} ],
			rootNode: this.$el._el
		} );
	}

	utils.extend( Editable.prototype, Emitter, {
		mutationHandler: function( summaries ) {
			console.log( summaries.length );
			summaries.forEach( function( summary ) {
				console.log( summary );
			} );
		}
	} );

	return Editable;
} );