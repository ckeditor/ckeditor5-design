define( [
	'tools/emitter',
	'tools/element',
	'tools/commands',
	'tools/dom',
	'tools/utils'
], function(
	Emitter,
	Element,
	Commands,
	dom,
	utils
) {
	'use strict';

	var MVC = {};

	function nop() {}

	var extend = function( proto ) {
		var parent = this,
			child = proto.hasOwnProperty( 'constructor' ) ?
			proto.constructor :
			function() {
				parent.apply( this, arguments );
			};

		utils.extend( child, parent );

		child.prototype = Object.create( parent.prototype );
		utils.extend( child.prototype, proto );

		return child;
	};


	/**************************************************************************
	 * Model
	 *************************************************************************/

	MVC.Model = function( attrs ) {
		Object.defineProperty( this, 'attrs', {
			value: {}
		} );

		this._initAttrs( attrs || {} );
		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Model.prototype, Emitter, {
		initialize: nop,

		set: function( attr, value ) {
			if ( !this[ attr ] ) {
				Object.defineProperty( this, attr, {
					enumerable: true,

					get: function() {
						return this.attrs[ attr ];
					},

					set: function( value ) {
						var oldValue = this.attrs[ attr ];

						if ( oldValue !== value ) {
							this.attrs[ attr ] = value;
							this.trigger( 'change', this );
							this.trigger( 'change:' + attr, this, value, oldValue );
						}
					}
				} );
			}

			this.attrs[ attr ] = value;
		},

		_initAttrs: function( attrs ) {
			Object.keys( attrs ).forEach( function( attr ) {
				this.set( attr, attrs[ attr ] );
			}, this );
		}
	} );


	/**************************************************************************
	 * View
	 *************************************************************************/

	MVC.View = function( options ) {
		this.options = options;
		utils.extend( this, options );
		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.View.prototype, Emitter, {
		destroy: function() {
			if ( this.isDestroyed ) {
				return this;
			}

			this.trigger( 'before:destroy', this );

			this.isDestroyed = true;
			this.el.remove();
			this.stopListening();

			this.trigger( 'destroy', this );

			return this;
		},

		initialize: nop,

		render: function() {
			this.trigger( 'before:render', this );

			if ( this.el || this.$el ) {
				this._unbindUIEvents();
			}

			this.el = this.template( this.model );
			this.$el = new Element( this.el );

			this._bindUIEvents();

			this.trigger( 'render', this );

			return this;
		},

		_bindUIEvents: function() {
			var sepPattern = /\s+/;

			if ( !this.events ) {
				return;
			}

			Object.keys( this.events ).forEach( function( key ) {
				var selectors = key.trim().split( sepPattern ),
					type = selectors.shift(),
					handler;

				handler = utils.isFunction( this.events[ key ] ) ?
					this.events[ key ] :
					this[ this.events[ key ] ];

				handler = handler.bind( this );

				if ( !selectors.length ) {
					this.$el.on( type, handler );
				} else {
					selectors.forEach( function( selector ) {
						this.$el.find( selector ).on( type, handler );
					}, this );
				}
			}, this );
		},

		_unbindUIEvents: function() {
			// TODO
		}
	} );

	MVC.View.extend = extend;


	/**************************************************************************
	 * Space
	 *************************************************************************/

	MVC.Space = function( options ) {
		this.options = options;
		utils.extend( this, options );
		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Space.prototype, Emitter, {
		initialize: nop,

		setEl: function( el ) {
			this.el = el;
			this.$el = new Element( el );
		},

		show: function( view ) {
			this.trigger( 'before:show', view );

			if ( this.currentView ) {
				this.clear();
			}

			view.once( 'destroy', this.clear, this );
			view.render();
			this._setContent( view.el );

			this.currentView = view;

			this.trigger( 'show', view );

			return this;
		},

		clear: function() {
			var view = this.currentView;

			if ( !view ) {
				return this;
			}

			this.trigger( 'before:clear', view );
			if ( !view.isDestroyed ) {
				view.destroy();
			}
			this.trigger( 'clear', view );

			delete this.currentView;

			return this;
		},

		_setContent: function( el ) {
			this.$el.html( '' );
			this.el.appendChild( el );
		}
	} );

	MVC.Space.extend = extend;


	/**************************************************************************
	 * SpaceManager
	 *************************************************************************/

	MVC.SpaceManager = function( options ) {
		this.options = options;
		utils.extend( this, options );

		Object.defineProperty( this, 'spaces', {
			value: {}
		} );
	};

	utils.extend( MVC.SpaceManager.prototype, Emitter, {
		addSpace: function( name, space ) {
			this.trigger( 'before:add:space', name, space );

			this.spaces[ name ] = space;

			this.trigger( 'add:space', name, space );

			return this;
		},

		destroy: function() {
			this.trigger( 'before:destroy' );

			Object.keys( spaces ).forEach( function( name ) {
				this.removeSpace( name );
			}, this );

			this.trigger( 'destroy' );

			return this;
		},

		getSpace: function( name ) {
			return this.spaces[ name ];
		},

		removeSpace: function( name ) {
			var space = this.spaces[ name ];

			if ( !space ) {
				return;
			}

			this.trigger( 'before:remove:space', name, space );

			space.clear();
			space.stopListening();

			delete this.spaces[ name ];

			this.trigger( 'remove:space', name, space );

			return this;
		}
	} );

	MVC.SpaceManager.extend = extend;


	/**************************************************************************
	 * FocusManager
	 *************************************************************************/

	MVC.FocusManager = function( options ) {
		this.options = options;
		utils.extend( this, options );
		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.FocusManager.prototype, Emitter, {
		initialize: nop
	} );

	MVC.FocusManager.extend = extend;


	/**************************************************************************
	 * Application
	 *************************************************************************/

	MVC.Application = function( options ) {
		this.options = options;
		utils.extend( this, options );

		this._spaceManager = new MVC.SpaceManager( options );
		this._focusManager = new MVC.FocusManager( options );

		this._initSpaceManager();

		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Application.prototype, Emitter, Commands, {
		destroy: function() {
			this.trigger( 'before:destroy' );
			this._spaceManager.destroy();
			this.trigger( 'destroy' );
		},

		getOption: function( name ) {
			return this.options && this.options[ name ] !== undefined ?
				this.options[ name ] :
				this[ name ];
		},

		initialize: nop,

		create: function() {
			this.trigger( 'before:create', this );
			this.trigger( 'create', this );

			return this;
		},

		_initSpaceManager: function() {
			var apis = [ 'addSpace', 'getSpace', 'removeSpace' ],
				events = [ 'before:add:space', 'add:space', 'before:remove:space', 'remove:space' ];

			// expose Space Manager API
			apis.forEach( function( api ) {
				this[ api ] = function() {
					return this._spaceManager[ api ].apply( this._spaceManager, arguments );
				};
			}, this );

			// bind to the Space Manager's events
			events.forEach( function( event ) {
				this.listenTo( this._spaceManager, event, function() {
					this.trigger.apply( this, [ event ].concat( arguments ) );
				}, this );
			}, this );
		}
	} );

	MVC.Application.extend = extend;

	return MVC;
} );