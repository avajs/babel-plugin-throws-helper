import test from 'ava';
import * as babel from 'babel-core';
import fn from './';

function transform(input) {
	return babel.transform(input, {
		plugins: [fn]
	});
}

const HELPER = [
	'function _avaThrowsHelper(fn, data) {',
	'  try {',
	'    return fn();',
	'  } catch (e) {',
	'    e._avaTryCatchHelperData = data;',
	'    throw e;',
	'  }',
	'}',
	''
].join('\n');

function wrapped(throws, expression, line, column) {
	return [
		`t.${throws}(_avaThrowsHelper(function () {`,
		`  return ${expression};`,
		'}, {',
		`  line: ${line},`,
		`  column: ${column},`,
		`  source: "${expression}"`,
		'}));'
	].join('\n');
}

test('creates a helper', t => {
	const code = transform(`t.throws(foo())`).code;

	const expected = [
		HELPER,
		wrapped('throws', 'foo()', 1, 9)
	].join('\n');

	t.is(code, expected);
});

test('creates the helper only once', t => {
	const code = transform(`t.throws(foo());\nt.throws(bar());`).code;

	const expected = [
		HELPER,
		wrapped('throws', 'foo()', 1, 9),
		wrapped('throws', 'bar()', 2, 9)
	].join('\n');

	t.is(code, expected);
});

test('does nothing if it does not match', t => {
	const code = transform('t.is(foo());').code;

	t.is(code, 't.is(foo());');
});

test('helps notThrows', t => {
	const code = transform(`t.notThrows(baz())`).code;

	const expected = [
		HELPER,
		wrapped('notThrows', 'baz()', 1, 12)
	].join('\n');

	t.is(code, expected);
});

