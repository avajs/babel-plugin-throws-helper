'use strict';

module.exports = function (babel) {
	var template = babel.template;
	var t = babel.types;

	var wrapWithHelper = template([
		'HELPER_ID(function () {',
		'  return EXP;',
		'});'
	].join('\n'));

	var buildHelper = template([
		'function HELPER_ID(fn, data) {',
		'  try {',
		'    return fn();',
		'  } catch (e) {',
		'    e._avaTryCatchHelperData = data;',
		'    throw e;',
		'  }',
		'}'
	].join('\n'));

	var assertionVisitor = {
		CallExpression: function (path) {
			if (isThrowsMember(path.get('callee'))) {
				var arg0 = path.node.arguments[0];
				path.node.arguments[0] = wrapWithHelper({
					HELPER_ID: t.identifier(this.avaThrowHelper()),
					EXP: arg0
				}).expression;
			}
		}
	};

	return {
		visitor: {
			Program: function (path) {
				var HELPER_ID = path.scope.generateUid('avaThrowsHelper');
				var created = false;

				path.traverse(assertionVisitor, {
					avaThrowHelper: function () {
						if (!created) {
							created = true;
							path.unshiftContainer('body', buildHelper({
								HELPER_ID: t.identifier(HELPER_ID)
							}));
						}
						return HELPER_ID;
					}
				});
			}
		}
	};
};

function isThrowsMember(path) {
	return path.isMemberExpression() && path.get('object').isIdentifier({name: 't'}) && path.get('property').isIdentifier({name: 'throws'});
}
