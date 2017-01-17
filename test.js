import path from 'path';
import fs from 'fs';
import {serial as test} from 'ava';
import * as babel from 'babel-core';
import * as types from 'babel-types';
import fn from './';

function transform(input) {
	return babel.transform(input, {
		plugins: [fn],
		filename: 'some-file.js'
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

const HELPER = `function _avaThrowsHelper(fn, data) {
  try {
    return fn();
  } catch (e) {
    var type = typeof e;

    if (e !== null && (type === "object" || type === "function")) {
      try {
        Object.defineProperty(e, "_avaThrowsHelperData", {
          value: data
        });
      } catch (e) {}
    }

    throw e;
  }
}\n`;

function wrapped(throws, line, column, expression, source = expression) { // eslint-disable-line max-params
	return `t.${throws}(_avaThrowsHelper(function () {
  return ${expression};
}, {
  line: ${line},
  column: ${column},
  source: "${source}",
  filename: "some-file.js"
}));`;
}

function indent(str) {
	return str.replace(/\n/g, '\n  ').trimRight();
}

test('creates a helper', t => {
	const input = 't.throws(foo())';
	const {code} = transform(input);

	const expected = [
		HELPER,
		wrapped('throws', 1, 9, 'foo()')
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

test('creates the helper only once', t => {
	const input = 't.throws(foo());\nt.throws(bar());';
	const {code} = transform(input);

	const expected = [
		HELPER,
		wrapped('throws', 1, 9, 'foo()'),
		wrapped('throws', 2, 9, 'bar()')
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

test('hoists await expressions', t => {
	const input = `async function test() {
  t.throws(foo(await bar(), await baz(), qux));
  t.throws(await quux);
}`;
	const {code} = transform(input);

	const expected = `${HELPER}
async function test() {
  var _arg = await bar();

  var _arg2 = await baz();

  ${indent(wrapped('throws', 2, 11, 'foo(_arg, _arg2, qux)', 'foo(await bar(), await baz(), qux)'))}

  var _arg3 = await quux;

  ${indent(wrapped('throws', 3, 11, '_arg3', 'await quux'))}
}`;

	t.is(code, expected);
	addExample(input, code);
});

test('hoists yield expressions', t => {
	const input = `function* test() {
  t.throws(foo(yield bar(), yield baz(), qux));
  t.throws(yield quux);
}`;
	const {code} = transform(input);

	const expected = `${HELPER}
function* test() {
  var _arg = yield bar();

  var _arg2 = yield baz();

  ${indent(wrapped('throws', 2, 11, 'foo(_arg, _arg2, qux)', 'foo(yield bar(), yield baz(), qux)'))}

  var _arg3 = yield quux;

  ${indent(wrapped('throws', 3, 11, '_arg3', 'yield quux'))}
}`;

	t.is(code, expected);
	addExample(input, code);
});

test('does nothing if it does not match', t => {
	const input = 't.is(foo());';
	const {code} = transform(input);

	t.is(code, input);
	addExample(input, code);
});

test('helps notThrows', t => {
	const input = 't.notThrows(baz())';
	const {code} = transform(input);

	const expected = [
		HELPER,
		wrapped('notThrows', 1, 12, 'baz()')
	].join('\n');

	t.is(code, expected);
	addExample(input, code);
});

test('does not throw on generated code', () => {
	var statement = types.expressionStatement(types.callExpression(
		types.memberExpression(
			types.identifier('t'),
			types.identifier('throws')
		),
		[types.callExpression(
			types.identifier('foo'),
			[]
		)]
	));

	var program = types.program([statement]);

	babel.transformFromAst(program, null, {
		plugins: [fn],
		filename: 'some-file.js'
	});
});

if (process.env.WRITE_EXAMPLES) {
	test('writing examples', () => {
		fs.writeFileSync(
			path.join(__dirname, 'example-output.md'),
			examples.join('\n')
		);
	});
}
