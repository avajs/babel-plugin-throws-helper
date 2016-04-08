input:

```js
t.throws(foo())
```

becomes:

```js
function _avaThrowsHelper(fn, data) {
  try {
    return fn();
  } catch (e) {
    e._avaTryCatchHelperData = data;
    throw e;
  }
}

t.throws(_avaThrowsHelper(function () {
  return foo();
}, {
  line: 1,
  column: 9,
  source: "foo()"
}));
```

---

input:

```js
t.throws(foo());
t.throws(bar());
```

becomes:

```js
function _avaThrowsHelper(fn, data) {
  try {
    return fn();
  } catch (e) {
    e._avaTryCatchHelperData = data;
    throw e;
  }
}

t.throws(_avaThrowsHelper(function () {
  return foo();
}, {
  line: 1,
  column: 9,
  source: "foo()"
}));
t.throws(_avaThrowsHelper(function () {
  return bar();
}, {
  line: 2,
  column: 9,
  source: "bar()"
}));
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
function _avaThrowsHelper(fn, data) {
  try {
    return fn();
  } catch (e) {
    e._avaTryCatchHelperData = data;
    throw e;
  }
}

t.notThrows(_avaThrowsHelper(function () {
  return baz();
}, {
  line: 1,
  column: 12,
  source: "baz()"
}));
```

---
