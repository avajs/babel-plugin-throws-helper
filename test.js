import test from 'ava';
import * as babel from 'babel-core';
import fn from './';

function transform(input) {
	return babel.transform(input, {
		plugins: [fn]
	});
}

test('foo', t => {
	const code = transform(`t.throws(foo())`).code;
	
	const expected = [
		'function _avaThrowsHelper(fn, data) {',
		'  try {',
		'    return fn();',
		'  } catch (e) {',
		'    e._avaTryCatchHelperData = data;',
		'    throw e;',
		'  }',
		'}',
		'',
		't.throws(_avaThrowsHelper(function () {',
		'  return foo();',
		'}));'
	].join('\n');

	t.is(code, expected);
});
