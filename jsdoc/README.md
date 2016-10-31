# JSDoc plugins overview

## Overview

There're 3 types of references available with the plugin.
External references works everywhere, but have long names, so this plugin enables references with shorter names. 


## External references

External reference has to start with `@module:`.

```
class Editor {
	/**
	 * Method execute takes a command
	 *
	 * @param {String} @module:command~Command} command
	 */

	execute( command ) {

	}
}
```

## Internal references

Short references to methods, and properties are available from JSDoc comments inside the same class or interface. 
These references **cannot** link to symbols inside another classes / interfaces even if they are in the same module.

Here, two types of references are available.

References starting with `#` are available for members and methods, e.g. `{@link #create}`.

References starting with `~` are available for classes and interfaces, e.g. `{@link ~Editor}`.
But you can use them as well for the methods and members, e.g. `{@link ~Editor#create}`

```
class Editor {
	/**
	 * This property represents {@link ~Editor editor} name.
	 *
	 * @member {String} #name
	 */

	/**
	 * This property represents editor version.
	 * See editor {@link ~Editor#name name}.
	 * 
	 * @member {String} ~Editor#version
	 */
} 
```

