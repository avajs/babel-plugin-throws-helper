import path from 'path';
import fs from 'fs';
import {serial as test} from 'ava';
import * as babel from 'babel-core';
import fn from './';

function transform(input) {
	return babel.transform(input, {
		plugins: [fn],
		filename: 'some-file.js'
	});
}

const examples = [];

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

const HELPERS = `function _avaThrowsHelperStart(t, assertion, file, line) {
  if (t._throwsArgStart) {
    t._throwsArgStart(assertion, file, line);
  }
}

function _avaThrowsHelperEnd(t, arg) {
  if (t._throwsArgEnd) {
    t._throwsArgEnd();
  }

  return arg;
}\n\n`;

function wrapped(throws, expression, line) {
	return `t.${throws}((_avaThrowsHelperStart(t, "${throws}", "some-file.js", ${line}), _avaThrowsHelperEnd(t, ${expression})));`;
}

test('creates a helper', t => {
	const input = 't.throws(foo())';
	const {code} = transform(input);

	t.is(code, HELPERS + wrapped('throws', 'foo()', 1));
	addExample(input, code);
});

test('creates the helper only once', t => {
	const input = 't.throws(foo());\nt.throws(bar());';
	const {code} = transform(input);

	t.is(code, HELPERS + wrapped('throws', 'foo()', 1) + '\n' + wrapped('throws', 'bar()', 2));
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

	t.is(code, HELPERS + wrapped('notThrows', 'baz()', 1));
	addExample(input, code);
});

test('does not throw on generated code', t => {
	t.notThrows(() => {
		const statement = babel.types.expressionStatement(babel.types.callExpression(
			babel.types.memberExpression(
				babel.types.identifier('t'),
				babel.types.identifier('throws')
			),
			[babel.types.callExpression(
				babel.types.identifier('foo'),
				[]
			)]
		));

		const program = babel.types.program([statement]);

		babel.transformFromAst(program, null, {
			plugins: [fn],
			filename: 'some-file.js'
		});
	});
});

if (process.env.WRITE_EXAMPLES) {
	test('writing examples', t => {
		fs.writeFileSync(
			path.join(__dirname, 'example-output.md'),
			examples.join('\n')
		);
		t.pass();
	});
}
