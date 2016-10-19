/**
 * @module editor/editor
 */

/**
 * The Editor class.
 *
 * @implements module:editor/editorinterface~EditorInterface
 */
export default class Editor {
	/**
	 * This property represents editor name.
	 *
	 * @member {String} ~Editor#name Editor name.
	 */

	/**
	 * This property stores the element on which the editor has been initialized.
	 *
	 * There's also a link to the {@link ~Editor#name name of the editor}.
	 *
	 * @member {Element} ~Editor#element Editor element.
	 */

	/**
	 * Executes some command.
	 *
	 * @param {module:command/ver2/command~Command} command
	 */
	execute( command ) {

	}
}

/**
 * This is some typedef.
 *
 * @typedef {Object|module:command/ver2/command~Command} SomeType
 * @property {Boolean} isItReallyNiceType And some sentence.
 */
