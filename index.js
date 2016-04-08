'use strict';

module.exports = function (babel) {
	var template = babel.template;

	var wrap = template([
		'throwsHelper(function () {',
		'  return EXP;',
		'});'
	].join('\n'));

	return {
		visitor: {
			CallExpression: function (path) {
				if (isThrowsMember(path.get('callee'))) {
					const arg0 = path.node.arguments[0];
					path.node.arguments[0] = wrap({EXP: arg0}).expression;
				}
			}
		}
	};
};

function isThrowsMember(path) {
	return path.isMemberExpression() && path.get('object').isIdentifier({name: 't'}) && path.get('property').isIdentifier({name: 'throws'});
}
