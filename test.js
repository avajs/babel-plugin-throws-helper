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
		't.throws(throwsHelper(function () {',
		'  return foo();',
		'}));'
	].join('\n');

	t.is(code, expected);
});
