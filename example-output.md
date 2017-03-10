input:

```js
t.throws(foo())
```

becomes:

```js
function _avaThrowsHelperStart(t, assertion, file, line) {
  if (t._throwsArgStart) {
    t._throwsArgStart(assertion, file, line);
  }
}

function _avaThrowsHelperEnd(t, arg) {
  if (t._throwsArgEnd) {
    t._throwsArgEnd();
  }

  return arg;
}

t.throws((_avaThrowsHelperStart(t, "throws", "some-file.js", 1), _avaThrowsHelperEnd(t, foo())));
```

---

input:

```js
t.throws(foo());
t.throws(bar());
```

becomes:

```js
function _avaThrowsHelperStart(t, assertion, file, line) {
  if (t._throwsArgStart) {
    t._throwsArgStart(assertion, file, line);
  }
}

function _avaThrowsHelperEnd(t, arg) {
  if (t._throwsArgEnd) {
    t._throwsArgEnd();
  }

  return arg;
}

t.throws((_avaThrowsHelperStart(t, "throws", "some-file.js", 1), _avaThrowsHelperEnd(t, foo())));
t.throws((_avaThrowsHelperStart(t, "throws", "some-file.js", 2), _avaThrowsHelperEnd(t, bar())));
```

---

input:

```js
t.is(foo());
```

becomes:

```js
t.is(foo());
```

---

input:

```js
t.notThrows(baz())
```

becomes:

```js
function _avaThrowsHelperStart(t, assertion, file, line) {
  if (t._throwsArgStart) {
    t._throwsArgStart(assertion, file, line);
  }
}

function _avaThrowsHelperEnd(t, arg) {
  if (t._throwsArgEnd) {
    t._throwsArgEnd();
  }

  return arg;
}

t.notThrows((_avaThrowsHelperStart(t, "notThrows", "some-file.js", 1), _avaThrowsHelperEnd(t, baz())));
```

---
