// We need to force loading notes (no one includes them).
// YES, IT'S UGLY, BUT IT'S A TEMPORARY SOLUTION (hopefully)
define( [
	'nodes/break',
	'nodes/div',
	'nodes/heading',
	'nodes/image',
	'nodes/list',
	'nodes/listitem',
	'nodes/paragraph',
	'nodes/root',
	'nodes/text',
	'nodes/whitespace',
	'inline/bold',
	'inline/italic',
	'inline/link',
	'inline/span',
	'inline/underline'
], {} );