define( [
	'tools/bob',
	'tools/commands',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	Bob,
	Commands,
	Element,
	Emitter,
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

	MVC.Model = function( attributes, properties ) {
		Object.defineProperty( this, '_attributes', {
			value: {}
		} );

		utils.extend( this, properties );

		this._initAttributes( attributes || {} );
		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Model.prototype, Emitter, {
		initialize: nop,

		define: function( attr, value, options ) {
			Object.defineProperty( this, attr, utils.extend( {
				enumerable: true,

				get: function() {
					return this._attributes[ attr ];
				},

				set: function( value ) {
					var oldValue = this._attributes[ attr ];

					if ( oldValue !== value ) {
						this._attributes[ attr ] = value;
						this.trigger( 'change', this );
						this.trigger( 'change:' + attr, this, value, oldValue );
					}
				}
			}, options ) );

			if ( !utils.isUndefined( value ) ) {
				this._attributes[ attr ] = value;
			}
		},

		_initAttributes: function( attributes ) {
			Object.keys( attributes ).forEach( function( attr ) {
				this.define( attr, attributes[ attr ] );
			}, this );
		}
	} );

	MVC.Model.extend = extend;


	/**************************************************************************
	 * View
	 *************************************************************************/

	MVC.View = function( options ) {
		this.options = options || {};

		if ( options instanceof MVC.Model ) {
			options.model = options;
		}

		if ( options && options.model ) {
			this.model = options.model;
		}

		if ( options && options.el ) {
			this.el = options.el;
		}

		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.View, Bob.helpers );

	utils.extend( MVC.View.prototype, Emitter, Bob.mixin, {
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

			this.el = this.build( this.template );
			this.$el = new Element( this.el );

			this.trigger( 'render', this );

			return this;
		}
	} );

	MVC.View.extend = extend;


	/**************************************************************************
	 * Space
	 *************************************************************************/

	MVC.Space = function( options, properties ) {
		if ( options instanceof Element || utils.isElement( options ) ) {
			this.options = {};
			this.setEl( options );
		} else {
			this.options = options;
		}

		if ( properties ) {
			utils.extend( this, properties );
		}

		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Space.prototype, Emitter, {
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

		initialize: nop,

		setEl: function( el ) {
			if ( el instanceof Element ) {
				this.$el = el;
				this.el = this.$el._el;
			} else if ( utils.isElement( el ) ) {
				this.el = el;
				this.$el = new Element( el );
			}
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

		_setContent: function( el ) {
			this.$el.html( '' ).append( el );
		}
	} );

	MVC.Space.extend = extend;


	/**************************************************************************
	 * SpaceManager
	 *************************************************************************/

	MVC.SpaceManagerMixin = utils.extend( {
		addSpace: function( name, space ) {
			this.trigger( 'before:add:space', name, space );

			if ( !this._spaces ) {
				Object.defineProperty( this, '_spaces', {
					configurable: true,
					value: {}
				} );
			}

			if ( space instanceof MVC.Space ) {
				this._spaces[ name ] = space;
			} else if ( space instanceof Element || utils.isElement( space ) ) {
				this._spaces[ name ] = new MVC.Space( space );
			}

			this.trigger( 'add:space', name, space );

			return this;
		},

		destroy: function() {
			if ( !this._spaces ) {
				return;
			}

			this.trigger( 'before:destroy' );

			Object.keys( this._spaces ).forEach( function( name ) {
				this.removeSpace( name );
			}, this );

			this.trigger( 'destroy' );

			return this;
		},

		getSpace: function( name ) {
			return this._spaces ? this._spaces[ name ] : null;
		},

		removeSpace: function( name ) {
			var space = this._spaces && this._spaces[ name ];

			if ( !space ) {
				return;
			}

			this.trigger( 'before:remove:space', name, space );

			space.clear();
			space.stopListening();

			delete this._spaces[ name ];

			this.trigger( 'remove:space', name, space );

			return this;
		}
	}, Emitter );

	MVC.SpaceManager = function( options, properties ) {
		this.options = options;

		if ( properties ) {
			utils.extend( this, properties );
		}

		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.SpaceManager.prototype, MVC.SpaceManagerMixin, {
		initialize: nop
	} );

	MVC.SpaceManager.extend = extend;


	/**************************************************************************
	 * Application
	 *************************************************************************/

	MVC.Application = function( options, properties ) {
		this.options = options;

		if ( properties ) {
			utils.extend( this, properties );
		}

		this.initialize.apply( this, arguments );
	};

	utils.extend( MVC.Application.prototype, Emitter, Commands, MVC.SpaceManagerMixin, {
		create: function() {
			this.trigger( 'before:create', this );
			this.trigger( 'create', this );

			return this;
		},

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

		initialize: nop
	} );

	MVC.Application.extend = extend;

	return MVC;
} );