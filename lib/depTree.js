var dependencyTree = {};

(function () {
	var oldDefine = define;

	define = function (name, deps, callback) {
		if (!dependencyTree[name] && Array.isArray(deps)) {
			dependencyTree[name] = deps;
		}

		return oldDefine.apply(null, arguments);
	};
})();
