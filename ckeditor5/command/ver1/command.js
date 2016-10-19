/**
 * This is a command module (ver1).
 *
 * @module command/ver1/command
 */

/**
 * The Command class.
 */
export default class Command {
	/**
	 * Executes the command.
	 *
	 * @param {module:command/ver1/command~CommandParam} param
	 */
	execute( param ) {

	}

	/**
	 * Fired when the command is being executed.
	 *
	 * This event follows the {@link module:editor/editor~Editor#event:execute} event.
	 *
	 * @event ~Command#execute
	 */
}

/**
 * Some typedef.
 *
 * @typedef {String|Number|module:editor/editorinterface~EditorInterface} CommandParam
 */
