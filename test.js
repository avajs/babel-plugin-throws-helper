import path from 'path';
import fs from 'fs';
import {serial as test} from 'ava';
import * as babel from 'babel-core';
import fn from './';

function transform(input) {
	return babel.transform(input, {
		plugins: [fn]
	});
}

var examples = [];

function addExample(input, output) {
	examples.push(
		'input:',
		'',
		'```js',
		input,
		'```',
		'',
		'becomes:',
		'',
		'```js',
		output,
		'```',
		'',
		'---',
		''
	);
}

const HELPER = [
	'function _avaThrowsHelper(fn, data) {',
	'  try {',
	'    return fn();',
	'  } catch (e) {',
	'    if (e) {',
	'      e._avaTryCatchHelperData = data;',
	'    }',
	'',
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
	const input = `t.throws(foo())`;
	const code = transform(input).code;

	const expected = [
		HELPER,
		wrapped('throws', 'foo()', 1, 9)
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

test('creates the helper only once', t => {
	const input = `t.throws(foo());\nt.throws(bar());`;
	const code = transform(input).code;

	const expected = [
		HELPER,
		wrapped('throws', 'foo()', 1, 9),
		wrapped('throws', 'bar()', 2, 9)
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

test('does nothing if it does not match', t => {
	const input = 't.is(foo());';
	const code = transform(input).code;

	t.is(code, input);
	addExample(input, code);
});

test('helps notThrows', t => {
	const input = `t.notThrows(baz())`;
	const code = transform(input).code;

	const expected = [
		HELPER,
		wrapped('notThrows', 'baz()', 1, 12)
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

if (process.env.WRITE_EXAMPLES) {
	test('writing examples', () => {
		fs.writeFileSync(
			path.join(__dirname, 'example-output.md'),
			examples.join('\n')
		);
	});
}
