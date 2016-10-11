/**
 * Indent module.
 *
 * @module ckeditor5/command/indentcommand
 */

import Command from './ver1/command.js';

/**
 * The IndentCommand class.
 */
export default class IndentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {ckeditor5/editor/editor~Editor} editor Editor instance.
	 * @param {'forward'|'backward'} indentDirection Direction of indent. If it is equal to `backward`, the command
	 * will outdent a list item.
	 */
	constructor( editor, indentDirection ) {
		super( editor );

		/**
		 * By how much the command will change list item's indent attribute.
		 *
		 * @since 4.3.0
		 * @private
		 * @readonly
		 * @member {number} _indentBy
		 */
		this._indentBy = indentDirection == 'forward' ? 1 : -1;

		// Refresh command state after selection is changed or changes has been done to the document.
		this.listenTo( editor.document.selection, 'change:range', () => {
			this.refreshState();
		} );

		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshState();
		} );
	}
}
