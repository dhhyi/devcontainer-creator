/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 491:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("{{- $L := (datasource \"language\") -}}\n\n{{- if has $L.devcontainer \"build\" }}\n\n{{- $from := env.Getenv \"BASE_IMAGE\" -}}\n\n{{- $remoteUser := $L.devcontainer.remoteUser -}}\n\n{{- $packages := coll.Slice -}}\n{{- if has $L.devcontainer.build \"packages\" -}}\n  {{- $packages = (coll.Append $packages $L.devcontainer.build.packages) | coll.Flatten -}}\n{{- end -}}\n\n{{- $insertHome := and (has $L.devcontainer.build \"user\") ($L.devcontainer.build.user | strings.Contains \"HOME\") -}}\n\n{{- $prepareBuildArgs := coll.Slice -}}\n{{- $rootBuildArgs := coll.Slice -}}\n{{- $userBuildArgs := coll.Slice -}}\n{{- if has $L.devcontainer.build \"args\" -}}\n  {{- range $arg, $v := $L.devcontainer.build.args -}}\n    {{- if and (has $L.devcontainer.build \"prepare\")\n               ($L.devcontainer.build.prepare | strings.Contains $arg) -}}\n      {{- $prepareBuildArgs = coll.Append $arg $prepareBuildArgs -}}\n    {{- else if and (has $L.devcontainer.build \"root\")\n               ($L.devcontainer.build.root | strings.Contains $arg) -}}\n      {{- $rootBuildArgs = coll.Append $arg $rootBuildArgs -}}\n    {{- else if and (has $L.devcontainer.build \"user\")\n               ($L.devcontainer.build.user | strings.Contains $arg) -}}\n      {{- $userBuildArgs = coll.Append $arg $userBuildArgs -}}\n    {{- end -}}\n  {{- end -}}\n{{- end -}}\n\n{{- \"\" -}}\nFROM {{ $from }}\n{{ \"\" }}\n\n{{- if and\n   (not (strings.Contains \"ghcr.io/dhhyi/dcc-base\" $from))\n   (or ($prepareBuildArgs) ($packages) ($rootBuildArgs)\n       (has $L.devcontainer.build \"root\")) }}\nUSER root\n{{ end }}\n\n{{- if $prepareBuildArgs }}\n{{- range $prepareBuildArgs }}\nARG {{ . }}\n{{- end }}\n{{ end }}\n\n{{- if has $L.devcontainer.build \"prepare\" }}\n{{ conv.Join $L.devcontainer.build.prepare \"\\n\" }}\n{{ end }}\n\n{{- if $packages }}\nRUN apt-get update && export DEBIAN_FRONTEND=noninteractive \\\n    && apt-get -y install --no-install-recommends \\\n    {{ conv.Join $packages \" \" }} \\\n    && apt-get clean && rm -rf /var/lib/apt/lists/*\n{{ end }}\n\n{{- if $rootBuildArgs }}\n{{- range $rootBuildArgs }}\nARG {{ . }}\n{{- end }}\n{{ end }}\n\n{{- if has $L.devcontainer.build \"root\" }}\n{{ conv.Join $L.devcontainer.build.root \"\\n\" }}\n{{ end }}\n\n{{- \"\" }}\nUSER {{ $remoteUser }}\n{{ \"\" }}\n\n{{- if $insertHome -}}\nENV HOME=/home/{{ $remoteUser }}\n{{ end }}\n\n{{- if $userBuildArgs }}\n{{- range $userBuildArgs }}\nARG {{ . }}\n{{- end }}\n{{ end }}\n\n{{- if has $L.devcontainer.build \"user\" }}\n{{ conv.Join $L.devcontainer.build.user \"\\n\" }}\n{{ end }}\n\n{{- end -}}\n");

/***/ }),

/***/ 509:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("{{- $L := (datasource \"language\") -}}\n\n{{- $settings := dict -}}\n{{- if has $L.vscode \"settings\" -}}\n  {{ $settings = coll.Merge $settings $L.vscode.settings }}\n{{- end -}}\n\n{{- $command := slice -}}\n{{- if has $L.language \"binary\" -}}\n  {{- $command = coll.Append $L.language.binary $command -}}\n  {{- if has $L.language \"binaryArgs\" -}}\n    {{- $command = coll.Append $L.language.binaryArgs $command -}}\n  {{- end -}}\n{{- end -}}\n{{- $version := slice -}}\n{{- if or (not (has $L.language \"version\")) ($L.language.version) -}}\n  {{- if (has $L.language \"version\") }}\n    {{- range split ($L.language.version | strings.TrimSpace) \"\\n\" }}\n      {{- $version = coll.Append . $version -}}\n    {{- end -}}\n  {{- else if (has $L.language \"binary\") }}\n    {{- $version = coll.Append (conv.Join (slice $L.language.binary \"--version\")  \" \") $version -}}\n  {{- end -}}\n{{- end -}}\n\n{{- define \"HIDE_FILES\" -}}\nfiles.exclude:\n  {{ range . }}{{ . }}: true\n  {{ end }}\n{{- end -}}\n{{- if and (has $L.vscode \"hideFiles\") ($L.vscode.hideFiles) -}}\n  {{- $settings = coll.Merge $settings (data.YAML (tmpl.Exec \"HIDE_FILES\" $L.vscode.hideFiles)) -}}\n{{- end -}}\n\n{{- $extensions := coll.Slice -}}\n{{- if has $L.vscode \"extensions\" -}}\n  {{ $extensions = (coll.Append $extensions $L.vscode.extensions) | coll.Flatten }}\n{{- end -}}\n\n{{- $containerEnv := dict -}}\n{{- if $L.language -}}\n  {{- $containerEnv = coll.Merge $containerEnv (dict \"DCC_BINARY\" (conv.Join $command \" \")) -}}\n  {{- $containerEnv = coll.Merge $containerEnv (dict \"DCC_VERSION\" (conv.Join $version \"; \")) -}}\n  {{- if has $L.language \"repl\" -}}\n    {{- $containerEnv = coll.Merge $containerEnv (dict \"DCC_REPL\" $L.language.repl) -}}\n  {{- else -}}\n    {{- $containerEnv = coll.Merge $containerEnv (dict \"DCC_REPL\" \"\") -}}\n  {{- end -}}\n{{- end -}}\n{{- if has $L.devcontainer \"selftest\" -}}\n  {{- $containerEnv = coll.Merge $containerEnv (dict \"DCC_SELFTEST\" ($L.devcontainer.selftest | base64.Encode)) -}}\n{{- end -}}\n\n{\n  {{ if has $L.devcontainer \"name\" }}\"name\": \"{{ $L.devcontainer.name }}\",\n  {{ end -}}\n  {{ if has $L.extras \"forward-x11\" }}\"runArgs\": [\n    \"--net\", \"host\",\n    \"-e\", \"DISPLAY=:0\",\n    \"-v\", \"/tmp/.X11-unix:/tmp/.X11-unix\"\n  ],\n  {{ end -}}\n  {{ if not (has $L.devcontainer \"build\") -}}\n  \"image\": \"{{ env.Getenv \"BASE_IMAGE\" }}\"\n  {{- else -}}\n  \"build\": {\n    \"dockerfile\": \"Dockerfile\"\n    {{- if has $L.devcontainer.build \"args\" }},\n    \"args\": {{ $L.devcontainer.build.args | data.ToJSONPretty \"  \" | strings.Indent \"    \" | strings.Trim \" \" }}\n    {{- end }}\n  }{{ end }},\n  \"settings\": {{ $settings | data.ToJSONPretty \"  \" | strings.Indent \"  \" | strings.Trim \" \" }}{{ if $extensions }},\n  \"extensions\": {{ $extensions | data.ToJSONPretty \"  \" | strings.Indent \"  \" | strings.Trim \" \" }}{{ end }}\n  {{- if $containerEnv }},\n  \"containerEnv\": {{ $containerEnv | data.ToJSONPretty \"  \" | strings.Indent \"  \" | strings.Trim \" \" }}{{ end }}\n}\n");

/***/ }),

/***/ 228:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("{{- $L := (datasource \"language\") -}}\n{{- define \"TASK\" -}}\n{\n  \"label\": {{ .label | data.ToJSON }},\n  \"type\": \"shell\",\n  \"command\": {{ .command | data.ToJSON }},\n  \"problemMatcher\": []\n}\n{{- end -}}\n{{- $tasks := coll.Slice -}}\n{{- if (has $L.language \"binary\") -}}\n  {{- $command := slice $L.language.binary -}}\n  {{- if has $L.language \"binaryArgs\" -}}\n    {{- $command = coll.Append $L.language.binaryArgs $command -}}\n  {{- end -}}\n  {{- $command = coll.Prepend \"cont ${fileDirname}\" $command -}}\n  {{- $command = coll.Append \"${file}\" $command -}}\n  {{- $tasks = coll.Append (data.JSON (tmpl.Exec \"TASK\" (dict \"label\" \"Run file continuously\" \"command\" (conv.Join $command \" \")))) $tasks -}}\n\n  {{- $command = coll.Append \"${input:arguments}\" $command -}}\n  {{- $tasks = coll.Append (data.JSON (tmpl.Exec \"TASK\" (dict \"label\" \"Run file continuously with arguments\" \"command\" (conv.Join $command \" \")))) $tasks -}}\n{{- end -}}\n{{- if (has $L.language \"repl\") -}}\n  {{- $tasks = coll.Append (data.JSON (tmpl.Exec \"TASK\" (dict \"label\" \"Start REPL\" \"command\" $L.language.repl))) $tasks -}}\n{{- end -}}\n{{- if has $L.vscode \"tasks\" -}}\n  {{- range $L.vscode.tasks -}}\n    {{- $tasks = coll.Append (data.JSON (tmpl.Exec \"TASK\" (dict \"label\" .label \"command\" .command))) $tasks -}}\n  {{- end -}}\n{{- end -}}\n\n{{- if $tasks }}{\n  // See https://go.microsoft.com/fwlink/?LinkId=733558\n  // for the documentation about the tasks.json format\n  \"version\": \"2.0.0\",\n  \"tasks\": {{ $tasks | data.ToJSONPretty \"  \" | strings.Indent \"  \" | strings.Trim \" \" }}\n  {{- if (has $L.language \"binary\") }},\n  \"inputs\": [\n    {\n      \"type\": \"promptString\",\n      \"id\": \"arguments\",\n      \"description\": \"Arguments.\",\n      \"default\": \"1 2 3 4 5\"\n    }\n  ]{{ end }}\n}{{ end }}\n");

/***/ }),

/***/ 515:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("{{- $L := (datasource \"language\") -}}\n{{- if and (has $L.vscode \"script\") ($L.vscode.script) }}{\n  \"Script\": {\n    \"scope\": \"{{ $L.language.name }}\",\n    \"prefix\": \"script\",\n    \"body\": {{ $L.vscode.script | strings.Split \"\\n\" | data.ToJSONPretty \"  \" | strings.Indent \"    \" | strings.Trim \" \"}},\n    \"description\": \"Script template\"\n  }\n}{{ end }}\n");

/***/ }),

/***/ 813:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "P": () => (/* binding */ DCC_PROTOCOL),
/* harmony export */   "d": () => (/* binding */ baseImageReference)
/* harmony export */ });
const DCC_PROTOCOL = 'dcc://';
const BASE_PROTOCOL = 'base://';
const baseImageReference = (base) => {
    if (!base) {
        throw new Error('base is not defined');
    }
    if (base.startsWith(BASE_PROTOCOL)) {
        return `ghcr.io/dhhyi/dcc-base-${base.substring(BASE_PROTOCOL.length)}`;
    }
    else if (base.startsWith(DCC_PROTOCOL)) {
        return `ghcr.io/dhhyi/dcc-devcontainer-${base.substring(DCC_PROTOCOL.length)}`;
    }
    else {
        throw new Error(`base ${base} is not supported`);
    }
};


/***/ }),

/***/ 457:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "h": () => (/* binding */ execute)
/* harmony export */ });
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(81);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _logging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(810);
/* harmony import */ var _tasks_parse_args__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(508);



function execute(message, binary, args, options) {
    const binaryResolved = typeof binary === 'string' ? binary : binary();
    if (_tasks_parse_args__WEBPACK_IMPORTED_MODULE_2__/* .VERY_VERBOSE */ .Tq) {
        (0,_logging__WEBPACK_IMPORTED_MODULE_1__/* .logPersist */ .kr)('executing', binaryResolved, ...args);
    }
    else if (message) {
        (0,_logging__WEBPACK_IMPORTED_MODULE_1__/* .logStatus */ .ow)(message);
    }
    const build = (0,child_process__WEBPACK_IMPORTED_MODULE_0__.spawnSync)(binaryResolved, args, {
        stdio: [
            'pipe',
            options?.response === 'stdout' || !_tasks_parse_args__WEBPACK_IMPORTED_MODULE_2__/* .VERBOSE */ .k_ ? 'pipe' : 'inherit',
            _tasks_parse_args__WEBPACK_IMPORTED_MODULE_2__/* .VERBOSE */ .k_ ? 'inherit' : 'pipe',
        ],
        encoding: 'utf-8',
        env: { ...process.env, ...options?.env },
    });
    if (build.status !== 0) {
        (0,_logging__WEBPACK_IMPORTED_MODULE_1__/* .logError */ .H)(build.stderr);
        throw new Error();
    }
    if (options?.response === 'stdout') {
        return build.stdout;
    }
}


/***/ }),

/***/ 32:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var _logging__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(810);
/* harmony import */ var _tasks_build_devcontainer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(853);
/* harmony import */ var _tasks_devcontainer_meta__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(908);
/* harmony import */ var _tasks_parse_args__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(508);
/* harmony import */ var _tasks_test_devcontainer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(946);
/* harmony import */ var _tasks_write_devcontainer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(899);






const { build, test, dumpMeta } = (0,_tasks_parse_args__WEBPACK_IMPORTED_MODULE_3__/* .ParsedArgs */ .D$)();
await (0,_tasks_write_devcontainer__WEBPACK_IMPORTED_MODULE_5__/* .WriteDevcontainer */ .$)();
if (test) {
    await (0,_tasks_test_devcontainer__WEBPACK_IMPORTED_MODULE_4__/* .TestDevcontainer */ .a)();
}
else if (build) {
    await (0,_tasks_build_devcontainer__WEBPACK_IMPORTED_MODULE_1__/* .BuildDevcontainer */ .o)();
}
if (dumpMeta) {
    await (0,_tasks_devcontainer_meta__WEBPACK_IMPORTED_MODULE_2__/* .DumpDevcontainerMeta */ .Y3)();
}
(0,_logging__WEBPACK_IMPORTED_MODULE_0__/* .logDone */ .vt)();

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ 810:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "H": () => (/* binding */ logError),
/* harmony export */   "kr": () => (/* binding */ logPersist),
/* harmony export */   "ow": () => (/* binding */ logStatus),
/* harmony export */   "vt": () => (/* binding */ logDone),
/* harmony export */   "yN": () => (/* binding */ logWarn)
/* harmony export */ });
/* harmony import */ var _tasks_parse_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(508);

if (!process.stdout.clearLine) {
    console.time('dcc');
}
function logStatus(...message) {
    if (_tasks_parse_args__WEBPACK_IMPORTED_MODULE_0__/* .VERBOSE */ .k_) {
        console.log(...message);
    }
    else if (process.stdout.clearLine) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(message.join(' '));
    }
    else {
        console.timeLog('dcc', message?.join(' ')?.trim());
    }
}
function logPersist(...message) {
    if (_tasks_parse_args__WEBPACK_IMPORTED_MODULE_0__/* .VERBOSE */ .k_) {
        console.log(...message);
    }
    else if (process.stdout.clearLine) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(...message);
    }
    else {
        console.timeLog('dcc', ...message);
    }
}
function logWarn(...message) {
    if (_tasks_parse_args__WEBPACK_IMPORTED_MODULE_0__/* .VERBOSE */ .k_) {
        if (!process.stdout.clearLine) {
            console.log('::warning::', ...message);
        }
        else {
            console.warn(...message);
        }
    }
    else if (process.stdout.clearLine) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.warn(...message);
    }
    else {
        console.timeLog('dcc');
        console.log('::warning::', ...message);
    }
}
function logError(...message) {
    console.log('\n\x1b[31m', ...message, '\x1b[0m');
}
function logDone() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (process.stdout.clearLine) {
        logStatus('done\n');
    }
    else {
        console.timeEnd('dcc');
    }
}


/***/ }),

/***/ 853:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "o": () => (/* binding */ BuildDevcontainer)
});

// UNUSED EXPORTS: PulledImage

// EXTERNAL MODULE: external "child_process"
var external_child_process_ = __webpack_require__(81);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetTag.js + 3 modules
var _baseGetTag = __webpack_require__(897);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(433);
;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isFunction.js



/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!(0,isObject/* default */.Z)(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = (0,_baseGetTag/* default */.Z)(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/* harmony default export */ const lodash_es_isFunction = (isFunction);

// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_root.js + 1 modules
var _root = __webpack_require__(320);
;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_coreJsData.js


/** Used to detect overreaching core-js shims. */
var coreJsData = _root/* default.__core-js_shared__ */.Z["__core-js_shared__"];

/* harmony default export */ const _coreJsData = (coreJsData);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isMasked.js


/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/* harmony default export */ const _isMasked = (isMasked);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_toSource.js
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/* harmony default export */ const _toSource = (toSource);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsNative.js





/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var _baseIsNative_funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var _baseIsNative_funcToString = _baseIsNative_funcProto.toString;

/** Used to check objects for own properties. */
var _baseIsNative_hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  _baseIsNative_funcToString.call(_baseIsNative_hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!(0,isObject/* default */.Z)(value) || _isMasked(value)) {
    return false;
  }
  var pattern = lodash_es_isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

/* harmony default export */ const _baseIsNative = (baseIsNative);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getValue.js
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/* harmony default export */ const _getValue = (getValue);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getNative.js



/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

/* harmony default export */ const _getNative = (getNative);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_nativeCreate.js


/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

/* harmony default export */ const _nativeCreate = (nativeCreate);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashClear.js


/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

/* harmony default export */ const _hashClear = (hashClear);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashDelete.js
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/* harmony default export */ const _hashDelete = (hashDelete);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashGet.js


/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var _hashGet_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _hashGet_hasOwnProperty = _hashGet_objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return _hashGet_hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/* harmony default export */ const _hashGet = (hashGet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashHas.js


/** Used for built-in method references. */
var _hashHas_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _hashHas_hasOwnProperty = _hashHas_objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : _hashHas_hasOwnProperty.call(data, key);
}

/* harmony default export */ const _hashHas = (hashHas);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashSet.js


/** Used to stand-in for `undefined` hash values. */
var _hashSet_HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? _hashSet_HASH_UNDEFINED : value;
  return this;
}

/* harmony default export */ const _hashSet = (hashSet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Hash.js






/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

/* harmony default export */ const _Hash = (Hash);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheClear.js
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/* harmony default export */ const _listCacheClear = (listCacheClear);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/eq.js
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/* harmony default export */ const lodash_es_eq = (eq);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_assocIndexOf.js


/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (lodash_es_eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/* harmony default export */ const _assocIndexOf = (assocIndexOf);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheDelete.js


/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/* harmony default export */ const _listCacheDelete = (listCacheDelete);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheGet.js


/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/* harmony default export */ const _listCacheGet = (listCacheGet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheHas.js


/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

/* harmony default export */ const _listCacheHas = (listCacheHas);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheSet.js


/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/* harmony default export */ const _listCacheSet = (listCacheSet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_ListCache.js






/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

/* harmony default export */ const _ListCache = (ListCache);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Map.js



/* Built-in method references that are verified to be native. */
var Map = _getNative(_root/* default */.Z, 'Map');

/* harmony default export */ const _Map = (Map);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheClear.js




/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

/* harmony default export */ const _mapCacheClear = (mapCacheClear);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isKeyable.js
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/* harmony default export */ const _isKeyable = (isKeyable);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getMapData.js


/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/* harmony default export */ const _getMapData = (getMapData);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheDelete.js


/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/* harmony default export */ const _mapCacheDelete = (mapCacheDelete);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheGet.js


/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

/* harmony default export */ const _mapCacheGet = (mapCacheGet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheHas.js


/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

/* harmony default export */ const _mapCacheHas = (mapCacheHas);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheSet.js


/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/* harmony default export */ const _mapCacheSet = (mapCacheSet);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_MapCache.js






/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

/* harmony default export */ const _MapCache = (MapCache);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/memoize.js


/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = _MapCache;

/* harmony default export */ const lodash_es_memoize = (memoize);

// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js + 8 modules
var once = __webpack_require__(926);
// EXTERNAL MODULE: ./src/exec.ts
var exec = __webpack_require__(457);
// EXTERNAL MODULE: ./src/logging.ts
var logging = __webpack_require__(810);
// EXTERNAL MODULE: ./src/tasks/devcontainer-meta.ts
var devcontainer_meta = __webpack_require__(908);
// EXTERNAL MODULE: ./src/tasks/install-tools.ts
var install_tools = __webpack_require__(385);
// EXTERNAL MODULE: ./src/tasks/language-spec.ts + 1 modules
var language_spec = __webpack_require__(160);
// EXTERNAL MODULE: ./src/tasks/parse-args.ts + 1 modules
var parse_args = __webpack_require__(508);
;// CONCATENATED MODULE: ./src/tasks/build-devcontainer.ts








const PulledImage = lodash_es_memoize((image, expectSuccess = false) => {
    if (!image.includes(':')) {
        return PulledImage(`${image}:latest`, expectSuccess);
    }
    else {
        if (!(0,external_child_process_.execSync)(`docker image ls -q ${image}`, { encoding: 'utf-8' }).trim()) {
            try {
                (0,exec/* execute */.h)('pulling ' + image, 'docker', ['pull', image]);
            }
            catch (error) {
                // do nothing
            }
        }
        return image;
    }
}, (image, fail) => `${image}:${fail}`);
function buildWithDevcontainerCli() {
    const { tag, cacheFrom, targetDir } = (0,parse_args/* ParsedArgs */.D$)();
    const devcontainerArgs = ['build', '--workspace-folder', targetDir];
    if (tag) {
        devcontainerArgs.push('--image-name', tag);
    }
    if (cacheFrom) {
        devcontainerArgs.push('--cache-from', PulledImage(cacheFrom));
    }
    const result = (0,exec/* execute */.h)('building devcontainer', install_tools/* DevcontainerCLIBin */.i, devcontainerArgs, { response: 'stdout' });
    const devcontainerOutput = JSON.parse(result);
    const image = devcontainerOutput.imageName[0];
    return image;
}
async function buildWithDocker() {
    const resolvedYaml = await (0,language_spec/* ResolvedYaml */.Y)();
    const { tag, cacheFrom, targetDir } = (0,parse_args/* ParsedArgs */.D$)();
    const languageBuildArgs = Object.entries(resolvedYaml?.devcontainer?.build?.args || []).reduce((acc, [key, value]) => [...acc, '--build-arg', `${key}=${value}`], []);
    const image = tag || `dcc-${Date.now()}`;
    const dockerBuildArgs = [
        'build',
        ...languageBuildArgs,
        '--build-arg',
        'BUILDKIT_INLINE_CACHE=1',
        '-t',
        image,
    ];
    if (cacheFrom) {
        dockerBuildArgs.push('--cache-from', PulledImage(cacheFrom));
    }
    dockerBuildArgs.push(`${targetDir}/.devcontainer`);
    (0,exec/* execute */.h)('building devcontainer', 'docker', dockerBuildArgs);
    (0,devcontainer_meta/* appendMetaToImage */.ES)(image, await (0,devcontainer_meta/* ConstructedDevcontainerMeta */._t)());
    return image;
}
const BuildDevcontainer = (0,once/* default */.Z)(async () => {
    let image;
    if ((await (0,language_spec/* ResolvedYaml */.Y)()).devcontainer?.build) {
        image = await buildWithDocker();
    }
    else {
        image = buildWithDevcontainerCli();
    }
    const dccMeta = await (0,devcontainer_meta/* ConstructedDCCMeta */.Z4)();
    if (dccMeta) {
        (0,devcontainer_meta/* appendMetaToImage */.ES)(image, dccMeta);
    }
    (0,logging/* logPersist */.kr)('built image', image);
    return image;
});


/***/ }),

/***/ 20:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "H": () => (/* binding */ TmpOutputDir),
  "VT": () => (/* binding */ TmpTestingDir),
  "J9": () => (/* binding */ TmpWorkingDir)
});

// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(147);
;// CONCATENATED MODULE: external "os"
const external_os_namespaceObject = require("os");
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(17);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js + 8 modules
var once = __webpack_require__(926);
// EXTERNAL MODULE: ./src/logging.ts
var logging = __webpack_require__(810);
;// CONCATENATED MODULE: ./src/tasks/create-tmp-dir.ts





const TmpWorkingDir = (0,once/* default */.Z)(() => {
    const dir = (0,external_path_.join)((0,external_os_namespaceObject.tmpdir)(), 'devcontainer-creator-' + "d5600bd0492ea4358bedf664201f9dc247999369");
    if (!(0,external_fs_.existsSync)(dir)) {
        if (!(0,external_fs_.mkdirSync)(dir, {
            recursive: true,
        })) {
            throw new Error('failed to create temporary working directory');
        }
        else {
            (0,logging/* logStatus */.ow)('created working dir', dir);
        }
    }
    else {
        (0,logging/* logStatus */.ow)('reusing working dir', dir);
    }
    return dir;
});
const TmpOutputDir = (0,once/* default */.Z)(() => {
    const dir = (0,external_fs_.mkdtempSync)((0,external_path_.join)((0,external_os_namespaceObject.tmpdir)(), 'dcc-test-'));
    (0,logging/* logStatus */.ow)('created output dir', dir);
    return dir;
});
const TmpTestingDir = (0,once/* default */.Z)(() => {
    const dir = (0,external_fs_.mkdtempSync)((0,external_path_.join)(TmpWorkingDir(), 'testing-'));
    (0,logging/* logStatus */.ow)('created testing dir', dir);
    return dir;
});


/***/ }),

/***/ 908:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ES": () => (/* binding */ appendMetaToImage),
/* harmony export */   "Y3": () => (/* binding */ DumpDevcontainerMeta),
/* harmony export */   "Z4": () => (/* binding */ ConstructedDCCMeta),
/* harmony export */   "_t": () => (/* binding */ ConstructedDevcontainerMeta),
/* harmony export */   "t4": () => (/* binding */ getDevcontainerMeta),
/* harmony export */   "yO": () => (/* binding */ MergedDevcontainerMeta)
/* harmony export */ });
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(81);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(926);
/* harmony import */ var _exec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(457);
/* harmony import */ var _build_devcontainer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(853);
/* harmony import */ var _install_tools__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(385);
/* harmony import */ var _language_spec__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(160);
/* harmony import */ var _parse_args__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(508);
/* harmony import */ var _write_devcontainer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(899);










function getRemoteDevcontainerMeta(image) {
    return JSON.parse((0,_exec__WEBPACK_IMPORTED_MODULE_3__/* .execute */ .h)(`fetching metadata for ${image}`, 'docker', [
        'run',
        '--rm',
        'quay.io/skopeo/stable',
        'inspect',
        `docker://${image}`,
        '--format={{index .Labels "devcontainer.metadata"}}',
    ], { response: 'stdout' }));
}
function getLocalDevcontainerMeta(image) {
    return JSON.parse((0,child_process__WEBPACK_IMPORTED_MODULE_0__.execSync)(`docker inspect ${image} --format='{{index .Config.Labels "devcontainer.metadata"}}'`, { encoding: 'utf8' }));
}
function getDevcontainerMeta(image) {
    if ((0,child_process__WEBPACK_IMPORTED_MODULE_0__.execSync)(`docker image ls -q ${image}`, { encoding: 'utf-8' }).trim()) {
        return getLocalDevcontainerMeta(image);
    }
    else {
        return getRemoteDevcontainerMeta(image);
    }
}
const MergedDevcontainerMeta = (0,lodash_es__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z)(async () => {
    const targetDir = (0,_parse_args__WEBPACK_IMPORTED_MODULE_7__/* .ParsedArgs */ .D$)().targetDir;
    return JSON.parse((0,_exec__WEBPACK_IMPORTED_MODULE_3__/* .execute */ .h)(undefined, _install_tools__WEBPACK_IMPORTED_MODULE_5__/* .DevcontainerCLIBin */ .i, [
        'read-configuration',
        '--workspace-folder',
        targetDir,
        '--include-merged-configuration',
    ], { response: 'stdout' })).mergedConfiguration;
});
const ConstructedDevcontainerMeta = (0,lodash_es__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z)(async () => {
    const meta = JSON.parse((0,fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync)((0,path__WEBPACK_IMPORTED_MODULE_2__.join)(await (0,_write_devcontainer__WEBPACK_IMPORTED_MODULE_8__/* .WriteDevcontainer */ .$)(), '.devcontainer', 'devcontainer.json'), {
        encoding: 'utf8',
    }));
    if (meta.build) {
        delete meta.build;
    }
    if (meta.name) {
        delete meta.name;
    }
    if (meta.settings || meta.extensions) {
        meta.customizations = {
            vscode: {},
        };
        if (meta.settings) {
            meta.customizations.vscode.settings = meta.settings;
            delete meta.settings;
        }
        if (meta.extensions) {
            meta.customizations.vscode.extensions = meta.extensions;
            delete meta.extensions;
        }
    }
    return meta;
});
const ConstructedDCCMeta = (0,lodash_es__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z)(async () => {
    const yaml = await (0,_language_spec__WEBPACK_IMPORTED_MODULE_6__/* .ResolvedYaml */ .Y)();
    const dcc = {};
    if (typeof yaml.vscode?.script === 'string') {
        dcc.script = Buffer.from(yaml.vscode.script).toString('base64');
    }
    else if (typeof yaml.vscode?.script === 'boolean') {
        dcc.script = '';
    }
    if (yaml.vscode?.tasks) {
        dcc.tasks = yaml.vscode.tasks;
    }
    if (yaml.language?.name) {
        dcc.languageName = yaml.language.name;
    }
    if (Object.keys(dcc).length > 0) {
        return {
            customizations: {
                dcc,
            },
        };
    }
});
function appendMetaToImage(image, meta) {
    const oldMeta = getLocalDevcontainerMeta(image);
    const newMeta = JSON.stringify([...oldMeta, meta]);
    const append = (0,child_process__WEBPACK_IMPORTED_MODULE_0__.spawnSync)('docker', ['build', '-t', image, '--label', `devcontainer.metadata=${newMeta}`, '-'], {
        input: `FROM ${image}`,
    });
    if (append.status !== 0) {
        throw new Error(`Failed to append metadata to image ${image}`);
    }
}
const DumpDevcontainerMeta = (0,lodash_es__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z)(async () => {
    const { targetDir } = (0,_parse_args__WEBPACK_IMPORTED_MODULE_7__/* .ParsedArgs */ .D$)();
    const image = await (0,_build_devcontainer__WEBPACK_IMPORTED_MODULE_4__/* .BuildDevcontainer */ .o)();
    const meta = getLocalDevcontainerMeta(image);
    const metaFile = (0,path__WEBPACK_IMPORTED_MODULE_2__.join)(targetDir, '.devcontainer_meta.json');
    (0,fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync)(metaFile, JSON.stringify(meta, null, 2));
});


/***/ }),

/***/ 385:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "F": () => (/* binding */ GomplateBin),
/* harmony export */   "i": () => (/* binding */ DevcontainerCLIBin)
/* harmony export */ });
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(81);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(926);
/* harmony import */ var _logging__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(810);
/* harmony import */ var _create_tmp_dir__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(20);






function installTool(tool, toolBin) {
    const toolPath = (0,path__WEBPACK_IMPORTED_MODULE_2__.join)((0,_create_tmp_dir__WEBPACK_IMPORTED_MODULE_4__/* .TmpWorkingDir */ .J9)(), toolBin);
    if ((0,fs__WEBPACK_IMPORTED_MODULE_1__.existsSync)(toolPath)) {
        (0,_logging__WEBPACK_IMPORTED_MODULE_3__/* .logStatus */ .ow)('found already installed', tool);
    }
    else {
        try {
            (0,_logging__WEBPACK_IMPORTED_MODULE_3__/* .logStatus */ .ow)('installing', tool);
            (0,child_process__WEBPACK_IMPORTED_MODULE_0__.execSync)(`npm exec pnpm -- install --prefer-offline ${tool}`, {
                stdio: 'ignore',
                cwd: (0,_create_tmp_dir__WEBPACK_IMPORTED_MODULE_4__/* .TmpWorkingDir */ .J9)(),
            });
        }
        catch (error) {
            (0,_logging__WEBPACK_IMPORTED_MODULE_3__/* .logError */ .H)('error installing tool:', error.message);
            process.exit(1);
        }
    }
    return toolPath;
}
const GomplateBin = (0,lodash_es__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)(() => {
    return installTool('gomplate', 'node_modules/gomplate/node_modules/.bin/gomplate');
});
const DevcontainerCLIBin = (0,lodash_es__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)(() => {
    return installTool('@devcontainers/cli', 'node_modules/.bin/devcontainer');
});


/***/ }),

/***/ 160:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "J": () => (/* binding */ ExpandedYaml),
  "Y": () => (/* binding */ ResolvedYaml)
});

// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(147);
;// CONCATENATED MODULE: external "https"
const external_https_namespaceObject = require("https");
// EXTERNAL MODULE: ./node_modules/.pnpm/js-yaml@4.1.0/node_modules/js-yaml/dist/js-yaml.mjs
var js_yaml = __webpack_require__(487);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js + 8 modules
var once = __webpack_require__(926);
// EXTERNAL MODULE: ./src/constants.ts
var constants = __webpack_require__(813);
// EXTERNAL MODULE: ./src/logging.ts
var logging = __webpack_require__(810);
// EXTERNAL MODULE: ./src/tasks/devcontainer-meta.ts
var devcontainer_meta = __webpack_require__(908);
// EXTERNAL MODULE: ./src/tasks/parse-args.ts + 1 modules
var parse_args = __webpack_require__(508);
;// CONCATENATED MODULE: ./src/tasks/language-spec.ts








async function getYaml(languageYaml) {
    if (languageYaml.startsWith(constants/* DCC_PROTOCOL */.P)) {
        return { extends: languageYaml };
    }
    if (languageYaml.startsWith('http')) {
        const downloadFile = async (url) => {
            (0,logging/* logStatus */.ow)('downloading', url);
            return new Promise((resolve, reject) => {
                let rawData = '';
                external_https_namespaceObject.get(url, (resp) => {
                    // chunk received from the server
                    resp.on('data', (chunk) => {
                        rawData += chunk;
                    });
                    // last chunk received, we are done
                    resp.on('end', () => {
                        if (resp.statusCode === 200) {
                            resolve(rawData);
                        }
                        else {
                            reject(new Error('Failed to download file: ' + resp.statusMessage));
                        }
                    });
                })
                    .on('error', (err) => {
                    reject(new Error(err.message));
                });
            });
        };
        try {
            return js_yaml/* load */.zD(await downloadFile(languageYaml));
        }
        catch (error) {
            (0,logging/* logError */.H)(error);
            process.exit(1);
        }
    }
    return js_yaml/* load */.zD((0,external_fs_.readFileSync)(languageYaml, 'utf8'));
}
const ResolvedYaml = (0,once/* default */.Z)(async () => {
    const { devcontainerName, languageYaml, vscode } = (0,parse_args/* ParsedArgs */.D$)();
    let resolvedYaml = await getYaml(languageYaml);
    if (devcontainerName) {
        if (!resolvedYaml.devcontainer) {
            resolvedYaml.devcontainer = {};
        }
        resolvedYaml.devcontainer.name = devcontainerName;
    }
    if (!resolvedYaml) {
        resolvedYaml = {};
    }
    if (!resolvedYaml.extends) {
        resolvedYaml.extends = 'base://debian';
    }
    if (!resolvedYaml.language) {
        resolvedYaml.language = {};
    }
    if (!resolvedYaml.devcontainer) {
        resolvedYaml.devcontainer = {};
    }
    if (!resolvedYaml.vscode) {
        resolvedYaml.vscode = {};
    }
    if (!resolvedYaml.vscode.hideFiles) {
        resolvedYaml.vscode.hideFiles = [
            '.devcontainer',
            '.update_devcontainer.sh',
        ];
        if (vscode) {
            resolvedYaml.vscode.hideFiles.push('.vscode');
        }
    }
    if (!resolvedYaml.extras) {
        resolvedYaml.extras = [];
    }
    resolvedYaml.extras = resolvedYaml.extras.filter((v, i, a) => a.indexOf(v) === i);
    const baseImage = (0,constants/* baseImageReference */.d)(resolvedYaml.extends);
    const baseDevcontainerMeta = (0,devcontainer_meta/* getDevcontainerMeta */.t4)(baseImage);
    const remoteUser = baseDevcontainerMeta.reduce((acc, cur) => cur.remoteUser || acc, '');
    if (remoteUser === resolvedYaml.devcontainer.remoteUser) {
        (0,logging/* logWarn */.yN)(`declaration of 'remoteUser: ${remoteUser}' is redundant`);
    }
    else if (!resolvedYaml.devcontainer.remoteUser) {
        resolvedYaml.devcontainer.remoteUser = remoteUser;
    }
    const inheritedExtensions = baseDevcontainerMeta.reduce((acc, cur) => {
        if (cur.customizations?.vscode?.extensions) {
            return [...acc, ...cur.customizations.vscode.extensions];
        }
        return acc;
    }, []);
    if (resolvedYaml.vscode?.extensions) {
        resolvedYaml.vscode.extensions.forEach((ext) => {
            if (inheritedExtensions.includes(ext)) {
                (0,logging/* logWarn */.yN)(`extension '${ext}' is already inherited`);
            }
        });
    }
    if (parse_args/* VERY_VERBOSE */.Tq) {
        (0,logging/* logPersist */.kr)('Resolved YAML:');
        (0,logging/* logPersist */.kr)(js_yaml/* dump */.$w(resolvedYaml));
    }
    (0,logging/* logStatus */.ow)('validating language spec');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const validate = __webpack_require__(136);
    try {
        if (!validate(resolvedYaml)) {
            throw new Error('invalid yaml: ' + JSON.stringify(validate.errors, undefined, 2));
        }
    }
    catch (error) {
        (0,logging/* logError */.H)(error.message);
        process.exit(1);
    }
    return resolvedYaml;
});
const ExpandedYaml = (0,once/* default */.Z)(async () => {
    const merged = await (0,devcontainer_meta/* MergedDevcontainerMeta */.yO)();
    const resolvedYaml = await ResolvedYaml();
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (!Object.keys(resolvedYaml?.language || {}).length) {
        if (merged?.containerEnv?.DCC_REPL) {
            resolvedYaml.language.repl = merged.containerEnv.DCC_REPL;
        }
        if (merged?.containerEnv?.DCC_BINARY) {
            const split = merged.containerEnv.DCC_BINARY.split(' ');
            const binary = split[0];
            resolvedYaml.language.binary = binary;
            if (split.length > 1) {
                resolvedYaml.language.binaryArgs = split.slice(1).join(' ');
            }
        }
        if (merged?.containerEnv?.DCC_VERSION) {
            resolvedYaml.language.version = merged.containerEnv.DCC_VERSION;
        }
    }
    const custom = [
        ...(merged.customizations?.dcc || []).map((e) => ({
            ...e,
            script: typeof e.script === 'string'
                ? Buffer.from(e.script, 'base64').toString('utf-8')
                : e.script,
        })),
        {
            tasks: resolvedYaml.vscode.tasks,
            script: resolvedYaml.vscode.script,
            languageName: resolvedYaml.language?.name,
        },
    ].reduce((acc, val) => ({
        script: val.script === undefined ? acc.script : val.script,
        tasks: [...(acc.tasks || []), ...(val.tasks || [])].filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i),
        languageName: val.languageName || acc.languageName,
    }));
    if (custom?.script) {
        resolvedYaml.vscode.script = custom.script;
    }
    if (custom?.tasks) {
        resolvedYaml.vscode.tasks = custom.tasks;
    }
    if (custom?.languageName) {
        resolvedYaml.language.name = custom.languageName;
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    return resolvedYaml;
});


/***/ }),

/***/ 508:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "D$": () => (/* binding */ ParsedArgs),
  "k_": () => (/* binding */ VERBOSE),
  "Tq": () => (/* binding */ VERY_VERBOSE)
});

// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(17);
;// CONCATENATED MODULE: ./node_modules/.pnpm/getopts@2.3.0/node_modules/getopts/index.js
const EMPTYARR = []
const SHORTSPLIT = /$|[!-@[-`{-~][\s\S]*/g
const isArray = Array.isArray

const parseValue = function (any) {
  if (any === "") return ""
  if (any === "false") return false
  const maybe = +any
  return maybe * 0 === 0 ? maybe : any
}

const parseAlias = function (aliases) {
  let out = {},
    alias,
    prev,
    any

  for (let key in aliases) {
    any = aliases[key]
    alias = out[key] = isArray(any) ? any : [any]

    for (let i = 0; i < alias.length; i++) {
      prev = out[alias[i]] = [key]

      for (let k = 0; k < alias.length; k++) {
        if (i !== k) prev.push(alias[k])
      }
    }
  }

  return out
}

const parseDefault = function (aliases, defaults) {
  let out = {},
    alias,
    value

  for (let key in defaults) {
    alias = aliases[key]
    value = defaults[key]

    out[key] = value

    if (alias === undefined) {
      aliases[key] = EMPTYARR
    } else {
      for (let i = 0; i < alias.length; i++) {
        out[alias[i]] = value
      }
    }
  }

  return out
}

const parseOptions = function (aliases, options, value) {
  let out = {},
    key,
    alias

  if (options !== undefined) {
    for (let i = 0; i < options.length; i++) {
      key = options[i]
      alias = aliases[key]

      out[key] = value

      if (alias === undefined) {
        aliases[key] = EMPTYARR
      } else {
        for (let k = 0, end = alias.length; k < end; k++) {
          out[alias[k]] = value
        }
      }
    }
  }

  return out
}

const write = function (out, key, value, aliases, unknown) {
  let prev,
    alias = aliases[key],
    len = alias === undefined ? -1 : alias.length

  if (len >= 0 || unknown === undefined || unknown(key)) {
    prev = out[key]

    if (prev === undefined) {
      out[key] = value
    } else {
      if (isArray(prev)) {
        prev.push(value)
      } else {
        out[key] = [prev, value]
      }
    }

    for (let i = 0; i < len; i++) {
      out[alias[i]] = out[key]
    }
  }
}

/* harmony default export */ function getopts(argv, opts) {
  let unknown = (opts = opts || {}).unknown,
    aliases = parseAlias(opts.alias),
    strings = parseOptions(aliases, opts.string, ""),
    values = parseDefault(aliases, opts.default),
    bools = parseOptions(aliases, opts.boolean, false),
    stopEarly = opts.stopEarly,
    _ = [],
    out = { _ },
    key,
    arg,
    end,
    match,
    value

  for (let i = 0, len = argv.length; i < len; i++) {
    arg = argv[i]

    if (arg[0] !== "-" || arg === "-") {
      if (stopEarly) {
        while (i < len) {
          _.push(argv[i++])
        }
      } else {
        _.push(arg)
      }
    } else if (arg === "--") {
      while (++i < len) {
        _.push(argv[i])
      }
    } else if (arg[1] === "-") {
      end = arg.indexOf("=", 2)
      if (arg[2] === "n" && arg[3] === "o" && arg[4] === "-") {
        key = arg.slice(5, end >= 0 ? end : undefined)
        value = false
      } else if (end >= 0) {
        key = arg.slice(2, end)
        value =
          bools[key] !== undefined ||
          (strings[key] === undefined
            ? parseValue(arg.slice(end + 1))
            : arg.slice(end + 1))
      } else {
        key = arg.slice(2)
        value =
          bools[key] !== undefined ||
          (len === i + 1 || argv[i + 1][0] === "-"
            ? strings[key] === undefined
              ? true
              : ""
            : strings[key] === undefined
            ? parseValue(argv[++i])
            : argv[++i])
      }
      write(out, key, value, aliases, unknown)
    } else {
      SHORTSPLIT.lastIndex = 2
      match = SHORTSPLIT.exec(arg)
      end = match.index
      value = match[0]

      for (let k = 1; k < end; k++) {
        write(
          out,
          (key = arg[k]),
          k + 1 < end
            ? strings[key] === undefined ||
                arg.substring(k + 1, (k = end)) + value
            : value === ""
            ? len === i + 1 || argv[i + 1][0] === "-"
              ? strings[key] === undefined || ""
              : bools[key] !== undefined ||
                (strings[key] === undefined ? parseValue(argv[++i]) : argv[++i])
            : bools[key] !== undefined ||
              (strings[key] === undefined ? parseValue(value) : value),
          aliases,
          unknown
        )
      }
    }
  }

  for (let key in values) if (out[key] === undefined) out[key] = values[key]
  for (let key in bools) if (out[key] === undefined) out[key] = false
  for (let key in strings) if (out[key] === undefined) out[key] = ""

  return out
}

// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js + 8 modules
var once = __webpack_require__(926);
// EXTERNAL MODULE: ./src/constants.ts
var constants = __webpack_require__(813);
// EXTERNAL MODULE: ./src/tasks/create-tmp-dir.ts + 1 modules
var create_tmp_dir = __webpack_require__(20);
;// CONCATENATED MODULE: ./src/tasks/parse-args.ts





function printUsageAndExit() {
    console.log(`Create a devcontainer.

Usage: node ${(0,external_path_.basename)(process.argv[1])} language-spec [target-folder] [options]

language-spec: Path to a language specification YAML file, or a URL to a language specification YAML file. If the argument starts with "${constants/* DCC_PROTOCOL */.P}", the language specification will be downloaded from the repositories example folder (i.e ${constants/* DCC_PROTOCOL */.P}lua).

target-folder: Path to the target folder. If not specified, a temporary folder will be used.

Options:
  --name\tName of the devcontainer.

  --build\tBuild the devcontainer after creation.
  --tag\t\tTag of the devcontainer image.
  --cache-from\tImage to use as cache for the devcontainer image.

  --test\tTest the devcontainer after creation.
  --dump-meta\tDump the metadata of the devcontainer.
  --no-vscode\tDo not create a .vscode folder.

  -v, --verbose\tVerbose output.
  -vv, --debug\tDebug output.

  -h, --help\tPrint this help message.

Examples:
  node ${(0,external_path_.basename)(process.argv[1])} ${constants/* DCC_PROTOCOL */.P}lua .
    Create a devcontainer for Lua in the current folder.

  node ${(0,external_path_.basename)(process.argv[1])} language.yaml --test
    Create and test a temporary devcontainer for the
    language specified in language.yaml.
`);
    process.exit(1);
}
const VERY_VERBOSE = process.argv.includes('--debug') || process.argv.includes('-vv');
const VERBOSE = VERY_VERBOSE ||
    process.argv.includes('--verbose') ||
    process.argv.includes('-v');
const ParsedArgs = (0,once/* default */.Z)(() => {
    const options = getopts(process.argv.slice(2), {
        string: ['name', 'cache-from', 'tag'],
        boolean: ['build', 'test', 'dump-meta', 'vscode', 'v', 'verbose', 'debug'],
        default: {
            vscode: true,
        },
        unknown: (arg) => {
            if (arg !== 'help' && arg !== '-h') {
                console.log(`Unknown option: ${arg}`);
            }
            printUsageAndExit();
            return false;
        },
    });
    const defaultArgs = options._;
    if (defaultArgs.length === 0) {
        printUsageAndExit();
    }
    const languageYaml = defaultArgs[0];
    const targetDir = defaultArgs[1] || (0,create_tmp_dir/* TmpOutputDir */.H)();
    return {
        languageYaml,
        targetDir,
        devcontainerName: options.name,
        build: !!options.build,
        tag: options.tag,
        cacheFrom: options['cache-from'],
        test: !!options.test,
        dumpMeta: !!options['dump-meta'],
        vscode: !!options.vscode,
    };
});


/***/ }),

/***/ 946:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ TestDevcontainer)
/* harmony export */ });
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(81);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(926);
/* harmony import */ var _exec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(457);
/* harmony import */ var _logging__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(810);
/* harmony import */ var _build_devcontainer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(853);
/* harmony import */ var _create_tmp_dir__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);
/* harmony import */ var _install_tools__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(385);









const TestDevcontainer = (0,lodash_es__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z)(async () => {
    const image = await (0,_build_devcontainer__WEBPACK_IMPORTED_MODULE_5__/* .BuildDevcontainer */ .o)();
    const testingTmpDir = (0,_create_tmp_dir__WEBPACK_IMPORTED_MODULE_6__/* .TmpTestingDir */ .VT)();
    (0,fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync)((0,path__WEBPACK_IMPORTED_MODULE_2__.join)(testingTmpDir, '.devcontainer.json'), JSON.stringify({ image }));
    const devcontainerUpArgs = ['up', '--workspace-folder', testingTmpDir];
    const devcontainerUp = (0,_exec__WEBPACK_IMPORTED_MODULE_3__/* .execute */ .h)('starting devcontainer', _install_tools__WEBPACK_IMPORTED_MODULE_7__/* .DevcontainerCLIBin */ .i, devcontainerUpArgs, { response: 'stdout' });
    const containerId = JSON.parse(devcontainerUp).containerId;
    const devcontainerTestArgs = [
        'exec',
        '--workspace-folder',
        testingTmpDir,
        '/selftest.sh',
    ];
    try {
        (0,_exec__WEBPACK_IMPORTED_MODULE_3__/* .execute */ .h)('testing devcontainer\n', _install_tools__WEBPACK_IMPORTED_MODULE_7__/* .DevcontainerCLIBin */ .i, devcontainerTestArgs);
    }
    catch (error) {
        (0,_logging__WEBPACK_IMPORTED_MODULE_4__/* .logError */ .H)('error testing devcontainer');
        process.exit(1);
    }
    finally {
        (0,child_process__WEBPACK_IMPORTED_MODULE_0__.execSync)(`docker rm -f ${containerId}`, {
            stdio: 'ignore',
        });
    }
});


/***/ }),

/***/ 899:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "$": () => (/* binding */ WriteDevcontainer)
});

// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(147);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(17);
// EXTERNAL MODULE: ./node_modules/.pnpm/js-yaml@4.1.0/node_modules/js-yaml/dist/js-yaml.mjs
var js_yaml = __webpack_require__(487);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js + 8 modules
var once = __webpack_require__(926);
// EXTERNAL MODULE: ./src/constants.ts
var constants = __webpack_require__(813);
// EXTERNAL MODULE: ./src/exec.ts
var exec = __webpack_require__(457);
// EXTERNAL MODULE: ./src/logging.ts
var logging = __webpack_require__(810);
// EXTERNAL MODULE: ./src/tasks/create-tmp-dir.ts + 1 modules
var create_tmp_dir = __webpack_require__(20);
// EXTERNAL MODULE: ./src/tasks/install-tools.ts
var install_tools = __webpack_require__(385);
// EXTERNAL MODULE: ./src/tasks/language-spec.ts + 1 modules
var language_spec = __webpack_require__(160);
// EXTERNAL MODULE: ./src/tasks/parse-args.ts + 1 modules
var parse_args = __webpack_require__(508);
;// CONCATENATED MODULE: ./src/tasks/templates.ts





const ExtractedResources = (0,once/* default */.Z)(async () => {
    const dir = (0,create_tmp_dir/* TmpWorkingDir */.J9)();
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    const resources = {
        '.devcontainer/cont.sh.gomplate': undefined,
        '.devcontainer/devcontainer.json.gomplate': Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 509)),
        '.devcontainer/disclaimer.sh.gomplate': undefined,
        '.devcontainer/Dockerfile.gomplate': Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 491)),
        '.devcontainer/selftest.sh.gomplate': undefined,
        '.vscode/tasks.json.gomplate': Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 228)),
        '.vscode/vscode.code-snippets.gomplate': Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 515)),
    };
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    (0,logging/* logStatus */.ow)('writing templates to', dir);
    await Promise.all(Object.entries(resources)
        .filter(([, c]) => !!c)
        .map(([filename, content]) => {
        const file = (0,external_path_.join)(dir, filename);
        if (!(0,external_fs_.existsSync)((0,external_path_.dirname)(file))) {
            (0,external_fs_.mkdirSync)((0,external_path_.dirname)(file), { recursive: true });
        }
        if (content) {
            return content.then((c) => {
                (0,external_fs_.writeFileSync)(file, c.default);
            });
        }
    }));
    return Object.keys(resources)
        .filter((f) => f.endsWith('.gomplate'))
        .map((f) => f.replace('.gomplate', ''));
});

;// CONCATENATED MODULE: ./src/tasks/write-devcontainer.ts












function writeUpdateScript() {
    const { languageYaml, targetDir, devcontainerName, vscode } = (0,parse_args/* ParsedArgs */.D$)();
    (0,logging/* logStatus */.ow)('writing update script');
    let relativeYamlPath;
    if (languageYaml.startsWith(constants/* DCC_PROTOCOL */.P) ||
        languageYaml.startsWith('http')) {
        relativeYamlPath = languageYaml;
    }
    else {
        relativeYamlPath = (0,external_path_.relative)(targetDir, languageYaml);
    }
    const updateArgs = [relativeYamlPath, '.'];
    if (devcontainerName) {
        updateArgs.push('--name', devcontainerName);
    }
    if (!vscode) {
        updateArgs.push('--no-vscode');
    }
    updateArgs.push('"$@"');
    const updateArgsString = updateArgs
        .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
        .join(' ');
    const updateScriptPath = (0,external_path_.join)(targetDir, '.update_devcontainer.sh');
    (0,external_fs_.writeFileSync)(updateScriptPath, `#!/bin/sh -e

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - ${updateArgsString}
`);
    (0,external_fs_.chmodSync)(updateScriptPath, '755');
}
async function executeGomplate(folder, resolvedYamlContent) {
    const workingDir = (0,external_path_.join)((0,create_tmp_dir/* TmpWorkingDir */.J9)(), folder);
    const targetDir = (0,external_path_.join)((0,parse_args/* ParsedArgs */.D$)().targetDir, folder);
    const templates = (await ExtractedResources())
        .filter((t) => t.startsWith(folder))
        .map((f) => (0,external_path_.basename)(f));
    (0,logging/* logStatus */.ow)('creating backups');
    templates.forEach((template) => {
        const templatePath = (0,external_path_.join)(targetDir, template);
        if ((0,external_fs_.existsSync)(templatePath)) {
            (0,external_fs_.renameSync)(templatePath, templatePath + '~');
        }
    });
    const gomplateArgs = [
        '--input-dir',
        workingDir,
        '--include',
        '"**/*.gomplate"',
        `--output-map=${targetDir}/{{ .in | strings.TrimSuffix ".gomplate" }}`,
        '-d',
        'language=env:LANGUAGE?type=application/yaml',
    ];
    const gomplateEnv = {
        GOMPLATE_SUPPRESS_EMPTY: 'true',
        BASE_IMAGE: (0,constants/* baseImageReference */.d)(resolvedYamlContent.extends),
        LANGUAGE: js_yaml/* dump */.$w(resolvedYamlContent),
    };
    (0,exec/* execute */.h)('writing ' + folder, install_tools/* GomplateBin */.F, gomplateArgs, {
        env: gomplateEnv,
    });
    (0,logging/* logStatus */.ow)('removing backups');
    templates.forEach((template) => {
        const templatePath = (0,external_path_.join)(targetDir, template + '~');
        if ((0,external_fs_.existsSync)(templatePath)) {
            (0,external_fs_.unlinkSync)(templatePath);
        }
    });
}
const WriteDevcontainer = (0,once/* default */.Z)(async () => {
    const resolvedYaml = await (0,language_spec/* ResolvedYaml */.Y)();
    const { targetDir, vscode } = (0,parse_args/* ParsedArgs */.D$)();
    await executeGomplate('.devcontainer', resolvedYaml);
    if (resolvedYaml.devcontainer?.build?.files) {
        const files = resolvedYaml.devcontainer.build.files;
        Object.entries(files).forEach(([file, content]) => {
            if (content) {
                const filePath = (0,external_path_.join)(targetDir, '.devcontainer', file);
                (0,external_fs_.writeFileSync)(filePath, content);
            }
        });
        const gitignorePath = (0,external_path_.join)(targetDir, '.devcontainer', '.gitignore');
        (0,external_fs_.writeFileSync)(gitignorePath, ['.gitignore', ...Object.keys(files)].join('\n') + '\n');
    }
    if (vscode) {
        const expandedYaml = await (0,language_spec/* ExpandedYaml */.J)();
        await executeGomplate('.vscode', expandedYaml);
    }
    writeUpdateScript();
    (0,logging/* logPersist */.kr)('wrote devcontainer to', targetDir);
    return targetDir;
});


/***/ }),

/***/ 136:
/***/ ((module) => {

module.exports = validate20;module.exports["default"] = validate20;const schema22 = {"$id":"https://example.com/language.schema.json","$schema":"http://json-schema.org/draft-07/schema","title":"Language","type":"object","additionalProperties":false,"properties":{"extends":{"type":"string","enum":["base://brew","base://debian","base://go","base://java","base://node","base://python","base://ruby","dcc://clojure","dcc://elixir","dcc://elm","dcc://erlang","dcc://factor","dcc://go","dcc://haskell","dcc://idris2","dcc://io","dcc://javascript","dcc://julia","dcc://kotlin","dcc://lua","dcc://moonscript","dcc://perl","dcc://prolog","dcc://python","dcc://raku","dcc://ruby","dcc://scala","dcc://tcl","dcc://typescript"]},"language":{"type":"object","additionalProperties":false,"properties":{"name":{"type":"string"},"binary":{"type":"string"},"binaryArgs":{"type":"string"},"repl":{"type":"string"},"version":{"oneOf":[{"type":"string"},{"type":"boolean","not":{"const":true}}]}}},"devcontainer":{"type":"object","additionalProperties":false,"properties":{"name":{"type":"string"},"build":{"type":"object","additionalProperties":false,"properties":{"args":{"type":"object"},"files":{"type":"object"},"prepare":{"type":"array","items":{"type":"string"}},"packages":{"type":"array","items":{"type":"string"}},"user":{"type":"array","items":{"type":"string"}},"root":{"type":"array","items":{"type":"string"}}}},"selftest":{"type":"string"},"remoteUser":{"type":"string"}}},"vscode":{"type":"object","additionalProperties":false,"properties":{"script":{"oneOf":[{"type":"string"},{"type":"boolean","not":{"const":true}}]},"extensions":{"type":"array","items":{"type":"string"}},"hideFiles":{"oneOf":[{"type":"array","items":{"type":"string"}},{"type":"boolean","not":{"const":true}}]},"settings":{"type":"object"},"tasks":{"type":"array","items":{"type":"object","additionalProperties":false,"required":["label","command"],"properties":{"label":{"type":"string"},"command":{"type":"string"}}}}}},"extras":{"type":"array","items":{"type":"string","enum":["forward-x11"]}}}};function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){/*# sourceURL="https://example.com/language.schema.json" */;let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){const _errs1 = errors;for(const key0 in data){if(!(((((key0 === "extends") || (key0 === "language")) || (key0 === "devcontainer")) || (key0 === "vscode")) || (key0 === "extras"))){validate20.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];return false;break;}}if(_errs1 === errors){if(data.extends !== undefined){let data0 = data.extends;const _errs2 = errors;if(typeof data0 !== "string"){validate20.errors = [{instancePath:instancePath+"/extends",schemaPath:"#/properties/extends/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}if(!(((((((((((((((((((((((((((((data0 === "base://brew") || (data0 === "base://debian")) || (data0 === "base://go")) || (data0 === "base://java")) || (data0 === "base://node")) || (data0 === "base://python")) || (data0 === "base://ruby")) || (data0 === "dcc://clojure")) || (data0 === "dcc://elixir")) || (data0 === "dcc://elm")) || (data0 === "dcc://erlang")) || (data0 === "dcc://factor")) || (data0 === "dcc://go")) || (data0 === "dcc://haskell")) || (data0 === "dcc://idris2")) || (data0 === "dcc://io")) || (data0 === "dcc://javascript")) || (data0 === "dcc://julia")) || (data0 === "dcc://kotlin")) || (data0 === "dcc://lua")) || (data0 === "dcc://moonscript")) || (data0 === "dcc://perl")) || (data0 === "dcc://prolog")) || (data0 === "dcc://python")) || (data0 === "dcc://raku")) || (data0 === "dcc://ruby")) || (data0 === "dcc://scala")) || (data0 === "dcc://tcl")) || (data0 === "dcc://typescript"))){validate20.errors = [{instancePath:instancePath+"/extends",schemaPath:"#/properties/extends/enum",keyword:"enum",params:{allowedValues: schema22.properties.extends.enum},message:"must be equal to one of the allowed values"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.language !== undefined){let data1 = data.language;const _errs4 = errors;if(errors === _errs4){if(data1 && typeof data1 == "object" && !Array.isArray(data1)){const _errs6 = errors;for(const key1 in data1){if(!(((((key1 === "name") || (key1 === "binary")) || (key1 === "binaryArgs")) || (key1 === "repl")) || (key1 === "version"))){validate20.errors = [{instancePath:instancePath+"/language",schemaPath:"#/properties/language/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];return false;break;}}if(_errs6 === errors){if(data1.name !== undefined){const _errs7 = errors;if(typeof data1.name !== "string"){validate20.errors = [{instancePath:instancePath+"/language/name",schemaPath:"#/properties/language/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid1 = _errs7 === errors;}else {var valid1 = true;}if(valid1){if(data1.binary !== undefined){const _errs9 = errors;if(typeof data1.binary !== "string"){validate20.errors = [{instancePath:instancePath+"/language/binary",schemaPath:"#/properties/language/properties/binary/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid1 = _errs9 === errors;}else {var valid1 = true;}if(valid1){if(data1.binaryArgs !== undefined){const _errs11 = errors;if(typeof data1.binaryArgs !== "string"){validate20.errors = [{instancePath:instancePath+"/language/binaryArgs",schemaPath:"#/properties/language/properties/binaryArgs/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid1 = _errs11 === errors;}else {var valid1 = true;}if(valid1){if(data1.repl !== undefined){const _errs13 = errors;if(typeof data1.repl !== "string"){validate20.errors = [{instancePath:instancePath+"/language/repl",schemaPath:"#/properties/language/properties/repl/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid1 = _errs13 === errors;}else {var valid1 = true;}if(valid1){if(data1.version !== undefined){let data6 = data1.version;const _errs15 = errors;const _errs16 = errors;let valid2 = false;let passing0 = null;const _errs17 = errors;if(typeof data6 !== "string"){const err0 = {instancePath:instancePath+"/language/version",schemaPath:"#/properties/language/properties/version/oneOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}var _valid0 = _errs17 === errors;if(_valid0){valid2 = true;passing0 = 0;}const _errs19 = errors;if(typeof data6 !== "boolean"){const err1 = {instancePath:instancePath+"/language/version",schemaPath:"#/properties/language/properties/version/oneOf/1/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}const _errs21 = errors;const _errs22 = errors;if(true !== data6){const err2 = {};if(vErrors === null){vErrors = [err2];}else {vErrors.push(err2);}errors++;}var valid3 = _errs22 === errors;if(valid3){const err3 = {instancePath:instancePath+"/language/version",schemaPath:"#/properties/language/properties/version/oneOf/1/not",keyword:"not",params:{},message:"must NOT be valid"};if(vErrors === null){vErrors = [err3];}else {vErrors.push(err3);}errors++;}else {errors = _errs21;if(vErrors !== null){if(_errs21){vErrors.length = _errs21;}else {vErrors = null;}}}var _valid0 = _errs19 === errors;if(_valid0 && valid2){valid2 = false;passing0 = [passing0, 1];}else {if(_valid0){valid2 = true;passing0 = 1;}}if(!valid2){const err4 = {instancePath:instancePath+"/language/version",schemaPath:"#/properties/language/properties/version/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};if(vErrors === null){vErrors = [err4];}else {vErrors.push(err4);}errors++;validate20.errors = vErrors;return false;}else {errors = _errs16;if(vErrors !== null){if(_errs16){vErrors.length = _errs16;}else {vErrors = null;}}}var valid1 = _errs15 === errors;}else {var valid1 = true;}}}}}}}else {validate20.errors = [{instancePath:instancePath+"/language",schemaPath:"#/properties/language/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.devcontainer !== undefined){let data7 = data.devcontainer;const _errs23 = errors;if(errors === _errs23){if(data7 && typeof data7 == "object" && !Array.isArray(data7)){const _errs25 = errors;for(const key2 in data7){if(!((((key2 === "name") || (key2 === "build")) || (key2 === "selftest")) || (key2 === "remoteUser"))){validate20.errors = [{instancePath:instancePath+"/devcontainer",schemaPath:"#/properties/devcontainer/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];return false;break;}}if(_errs25 === errors){if(data7.name !== undefined){const _errs26 = errors;if(typeof data7.name !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/name",schemaPath:"#/properties/devcontainer/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid4 = _errs26 === errors;}else {var valid4 = true;}if(valid4){if(data7.build !== undefined){let data9 = data7.build;const _errs28 = errors;if(errors === _errs28){if(data9 && typeof data9 == "object" && !Array.isArray(data9)){const _errs30 = errors;for(const key3 in data9){if(!((((((key3 === "args") || (key3 === "files")) || (key3 === "prepare")) || (key3 === "packages")) || (key3 === "user")) || (key3 === "root"))){validate20.errors = [{instancePath:instancePath+"/devcontainer/build",schemaPath:"#/properties/devcontainer/properties/build/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"}];return false;break;}}if(_errs30 === errors){if(data9.args !== undefined){let data10 = data9.args;const _errs31 = errors;if(!(data10 && typeof data10 == "object" && !Array.isArray(data10))){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/args",schemaPath:"#/properties/devcontainer/properties/build/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}var valid5 = _errs31 === errors;}else {var valid5 = true;}if(valid5){if(data9.files !== undefined){let data11 = data9.files;const _errs33 = errors;if(!(data11 && typeof data11 == "object" && !Array.isArray(data11))){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/files",schemaPath:"#/properties/devcontainer/properties/build/properties/files/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}var valid5 = _errs33 === errors;}else {var valid5 = true;}if(valid5){if(data9.prepare !== undefined){let data12 = data9.prepare;const _errs35 = errors;if(errors === _errs35){if(Array.isArray(data12)){var valid6 = true;const len0 = data12.length;for(let i0=0; i0<len0; i0++){const _errs37 = errors;if(typeof data12[i0] !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/prepare/" + i0,schemaPath:"#/properties/devcontainer/properties/build/properties/prepare/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid6 = _errs37 === errors;if(!valid6){break;}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer/build/prepare",schemaPath:"#/properties/devcontainer/properties/build/properties/prepare/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid5 = _errs35 === errors;}else {var valid5 = true;}if(valid5){if(data9.packages !== undefined){let data14 = data9.packages;const _errs39 = errors;if(errors === _errs39){if(Array.isArray(data14)){var valid7 = true;const len1 = data14.length;for(let i1=0; i1<len1; i1++){const _errs41 = errors;if(typeof data14[i1] !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/packages/" + i1,schemaPath:"#/properties/devcontainer/properties/build/properties/packages/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid7 = _errs41 === errors;if(!valid7){break;}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer/build/packages",schemaPath:"#/properties/devcontainer/properties/build/properties/packages/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid5 = _errs39 === errors;}else {var valid5 = true;}if(valid5){if(data9.user !== undefined){let data16 = data9.user;const _errs43 = errors;if(errors === _errs43){if(Array.isArray(data16)){var valid8 = true;const len2 = data16.length;for(let i2=0; i2<len2; i2++){const _errs45 = errors;if(typeof data16[i2] !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/user/" + i2,schemaPath:"#/properties/devcontainer/properties/build/properties/user/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid8 = _errs45 === errors;if(!valid8){break;}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer/build/user",schemaPath:"#/properties/devcontainer/properties/build/properties/user/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid5 = _errs43 === errors;}else {var valid5 = true;}if(valid5){if(data9.root !== undefined){let data18 = data9.root;const _errs47 = errors;if(errors === _errs47){if(Array.isArray(data18)){var valid9 = true;const len3 = data18.length;for(let i3=0; i3<len3; i3++){const _errs49 = errors;if(typeof data18[i3] !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/build/root/" + i3,schemaPath:"#/properties/devcontainer/properties/build/properties/root/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid9 = _errs49 === errors;if(!valid9){break;}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer/build/root",schemaPath:"#/properties/devcontainer/properties/build/properties/root/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid5 = _errs47 === errors;}else {var valid5 = true;}}}}}}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer/build",schemaPath:"#/properties/devcontainer/properties/build/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid4 = _errs28 === errors;}else {var valid4 = true;}if(valid4){if(data7.selftest !== undefined){const _errs51 = errors;if(typeof data7.selftest !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/selftest",schemaPath:"#/properties/devcontainer/properties/selftest/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid4 = _errs51 === errors;}else {var valid4 = true;}if(valid4){if(data7.remoteUser !== undefined){const _errs53 = errors;if(typeof data7.remoteUser !== "string"){validate20.errors = [{instancePath:instancePath+"/devcontainer/remoteUser",schemaPath:"#/properties/devcontainer/properties/remoteUser/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid4 = _errs53 === errors;}else {var valid4 = true;}}}}}}else {validate20.errors = [{instancePath:instancePath+"/devcontainer",schemaPath:"#/properties/devcontainer/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs23 === errors;}else {var valid0 = true;}if(valid0){if(data.vscode !== undefined){let data22 = data.vscode;const _errs55 = errors;if(errors === _errs55){if(data22 && typeof data22 == "object" && !Array.isArray(data22)){const _errs57 = errors;for(const key4 in data22){if(!(((((key4 === "script") || (key4 === "extensions")) || (key4 === "hideFiles")) || (key4 === "settings")) || (key4 === "tasks"))){validate20.errors = [{instancePath:instancePath+"/vscode",schemaPath:"#/properties/vscode/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"}];return false;break;}}if(_errs57 === errors){if(data22.script !== undefined){let data23 = data22.script;const _errs58 = errors;const _errs59 = errors;let valid11 = false;let passing1 = null;const _errs60 = errors;if(typeof data23 !== "string"){const err5 = {instancePath:instancePath+"/vscode/script",schemaPath:"#/properties/vscode/properties/script/oneOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err5];}else {vErrors.push(err5);}errors++;}var _valid1 = _errs60 === errors;if(_valid1){valid11 = true;passing1 = 0;}const _errs62 = errors;if(typeof data23 !== "boolean"){const err6 = {instancePath:instancePath+"/vscode/script",schemaPath:"#/properties/vscode/properties/script/oneOf/1/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};if(vErrors === null){vErrors = [err6];}else {vErrors.push(err6);}errors++;}const _errs64 = errors;const _errs65 = errors;if(true !== data23){const err7 = {};if(vErrors === null){vErrors = [err7];}else {vErrors.push(err7);}errors++;}var valid12 = _errs65 === errors;if(valid12){const err8 = {instancePath:instancePath+"/vscode/script",schemaPath:"#/properties/vscode/properties/script/oneOf/1/not",keyword:"not",params:{},message:"must NOT be valid"};if(vErrors === null){vErrors = [err8];}else {vErrors.push(err8);}errors++;}else {errors = _errs64;if(vErrors !== null){if(_errs64){vErrors.length = _errs64;}else {vErrors = null;}}}var _valid1 = _errs62 === errors;if(_valid1 && valid11){valid11 = false;passing1 = [passing1, 1];}else {if(_valid1){valid11 = true;passing1 = 1;}}if(!valid11){const err9 = {instancePath:instancePath+"/vscode/script",schemaPath:"#/properties/vscode/properties/script/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};if(vErrors === null){vErrors = [err9];}else {vErrors.push(err9);}errors++;validate20.errors = vErrors;return false;}else {errors = _errs59;if(vErrors !== null){if(_errs59){vErrors.length = _errs59;}else {vErrors = null;}}}var valid10 = _errs58 === errors;}else {var valid10 = true;}if(valid10){if(data22.extensions !== undefined){let data24 = data22.extensions;const _errs66 = errors;if(errors === _errs66){if(Array.isArray(data24)){var valid13 = true;const len4 = data24.length;for(let i4=0; i4<len4; i4++){const _errs68 = errors;if(typeof data24[i4] !== "string"){validate20.errors = [{instancePath:instancePath+"/vscode/extensions/" + i4,schemaPath:"#/properties/vscode/properties/extensions/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid13 = _errs68 === errors;if(!valid13){break;}}}else {validate20.errors = [{instancePath:instancePath+"/vscode/extensions",schemaPath:"#/properties/vscode/properties/extensions/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid10 = _errs66 === errors;}else {var valid10 = true;}if(valid10){if(data22.hideFiles !== undefined){let data26 = data22.hideFiles;const _errs70 = errors;const _errs71 = errors;let valid14 = false;let passing2 = null;const _errs72 = errors;if(errors === _errs72){if(Array.isArray(data26)){var valid15 = true;const len5 = data26.length;for(let i5=0; i5<len5; i5++){const _errs74 = errors;if(typeof data26[i5] !== "string"){const err10 = {instancePath:instancePath+"/vscode/hideFiles/" + i5,schemaPath:"#/properties/vscode/properties/hideFiles/oneOf/0/items/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err10];}else {vErrors.push(err10);}errors++;}var valid15 = _errs74 === errors;if(!valid15){break;}}}else {const err11 = {instancePath:instancePath+"/vscode/hideFiles",schemaPath:"#/properties/vscode/properties/hideFiles/oneOf/0/type",keyword:"type",params:{type: "array"},message:"must be array"};if(vErrors === null){vErrors = [err11];}else {vErrors.push(err11);}errors++;}}var _valid2 = _errs72 === errors;if(_valid2){valid14 = true;passing2 = 0;}const _errs76 = errors;if(typeof data26 !== "boolean"){const err12 = {instancePath:instancePath+"/vscode/hideFiles",schemaPath:"#/properties/vscode/properties/hideFiles/oneOf/1/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};if(vErrors === null){vErrors = [err12];}else {vErrors.push(err12);}errors++;}const _errs78 = errors;const _errs79 = errors;if(true !== data26){const err13 = {};if(vErrors === null){vErrors = [err13];}else {vErrors.push(err13);}errors++;}var valid16 = _errs79 === errors;if(valid16){const err14 = {instancePath:instancePath+"/vscode/hideFiles",schemaPath:"#/properties/vscode/properties/hideFiles/oneOf/1/not",keyword:"not",params:{},message:"must NOT be valid"};if(vErrors === null){vErrors = [err14];}else {vErrors.push(err14);}errors++;}else {errors = _errs78;if(vErrors !== null){if(_errs78){vErrors.length = _errs78;}else {vErrors = null;}}}var _valid2 = _errs76 === errors;if(_valid2 && valid14){valid14 = false;passing2 = [passing2, 1];}else {if(_valid2){valid14 = true;passing2 = 1;}}if(!valid14){const err15 = {instancePath:instancePath+"/vscode/hideFiles",schemaPath:"#/properties/vscode/properties/hideFiles/oneOf",keyword:"oneOf",params:{passingSchemas: passing2},message:"must match exactly one schema in oneOf"};if(vErrors === null){vErrors = [err15];}else {vErrors.push(err15);}errors++;validate20.errors = vErrors;return false;}else {errors = _errs71;if(vErrors !== null){if(_errs71){vErrors.length = _errs71;}else {vErrors = null;}}}var valid10 = _errs70 === errors;}else {var valid10 = true;}if(valid10){if(data22.settings !== undefined){let data28 = data22.settings;const _errs80 = errors;if(!(data28 && typeof data28 == "object" && !Array.isArray(data28))){validate20.errors = [{instancePath:instancePath+"/vscode/settings",schemaPath:"#/properties/vscode/properties/settings/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}var valid10 = _errs80 === errors;}else {var valid10 = true;}if(valid10){if(data22.tasks !== undefined){let data29 = data22.tasks;const _errs82 = errors;if(errors === _errs82){if(Array.isArray(data29)){var valid17 = true;const len6 = data29.length;for(let i6=0; i6<len6; i6++){let data30 = data29[i6];const _errs84 = errors;if(errors === _errs84){if(data30 && typeof data30 == "object" && !Array.isArray(data30)){let missing0;if(((data30.label === undefined) && (missing0 = "label")) || ((data30.command === undefined) && (missing0 = "command"))){validate20.errors = [{instancePath:instancePath+"/vscode/tasks/" + i6,schemaPath:"#/properties/vscode/properties/tasks/items/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {const _errs86 = errors;for(const key5 in data30){if(!((key5 === "label") || (key5 === "command"))){validate20.errors = [{instancePath:instancePath+"/vscode/tasks/" + i6,schemaPath:"#/properties/vscode/properties/tasks/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"}];return false;break;}}if(_errs86 === errors){if(data30.label !== undefined){const _errs87 = errors;if(typeof data30.label !== "string"){validate20.errors = [{instancePath:instancePath+"/vscode/tasks/" + i6+"/label",schemaPath:"#/properties/vscode/properties/tasks/items/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid18 = _errs87 === errors;}else {var valid18 = true;}if(valid18){if(data30.command !== undefined){const _errs89 = errors;if(typeof data30.command !== "string"){validate20.errors = [{instancePath:instancePath+"/vscode/tasks/" + i6+"/command",schemaPath:"#/properties/vscode/properties/tasks/items/properties/command/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid18 = _errs89 === errors;}else {var valid18 = true;}}}}}else {validate20.errors = [{instancePath:instancePath+"/vscode/tasks/" + i6,schemaPath:"#/properties/vscode/properties/tasks/items/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid17 = _errs84 === errors;if(!valid17){break;}}}else {validate20.errors = [{instancePath:instancePath+"/vscode/tasks",schemaPath:"#/properties/vscode/properties/tasks/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid10 = _errs82 === errors;}else {var valid10 = true;}}}}}}}else {validate20.errors = [{instancePath:instancePath+"/vscode",schemaPath:"#/properties/vscode/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs55 === errors;}else {var valid0 = true;}if(valid0){if(data.extras !== undefined){let data33 = data.extras;const _errs91 = errors;if(errors === _errs91){if(Array.isArray(data33)){var valid19 = true;const len7 = data33.length;for(let i7=0; i7<len7; i7++){let data34 = data33[i7];const _errs93 = errors;if(typeof data34 !== "string"){validate20.errors = [{instancePath:instancePath+"/extras/" + i7,schemaPath:"#/properties/extras/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}if(!(data34 === "forward-x11")){validate20.errors = [{instancePath:instancePath+"/extras/" + i7,schemaPath:"#/properties/extras/items/enum",keyword:"enum",params:{allowedValues: schema22.properties.extras.items.enum},message:"must be equal to one of the allowed values"}];return false;}var valid19 = _errs93 === errors;if(!valid19){break;}}}else {validate20.errors = [{instancePath:instancePath+"/extras",schemaPath:"#/properties/extras/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid0 = _errs91 === errors;}else {var valid0 = true;}}}}}}}else {validate20.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate20.errors = vErrors;return errors === 0;}

/***/ }),

/***/ 81:
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 17:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 487:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$w": () => (/* binding */ dump),
/* harmony export */   "zD": () => (/* binding */ load)
/* harmony export */ });
/* unused harmony exports CORE_SCHEMA, DEFAULT_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, Schema, Type, YAMLException, loadAll, safeDump, safeLoad, safeLoadAll, types */

/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


var isNothing_1      = isNothing;
var isObject_1       = isObject;
var toArray_1        = toArray;
var repeat_1         = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1         = extend;

var common = {
	isNothing: isNothing_1,
	isObject: isObject_1,
	toArray: toArray_1,
	repeat: repeat_1,
	isNegativeZero: isNegativeZero_1,
	extend: extend_1
};

// YAML error class. http://stackoverflow.com/questions/8458984


function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException$1(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;


YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


var exception = YAMLException$1;

// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


var snippet = makeSnippet;

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$1(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$1;

/*eslint-disable max-len*/





function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema$1(definition) {
  return this.extend(definition);
}


Schema$1.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type$1.loadKind && type$1.loadKind !== 'scalar') {
      throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type$1.multi) {
      throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema$1.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


var schema = Schema$1;

var str = new type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

var seq = new type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

var map = new type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

var int = new type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

var float = new type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});

var core = json;

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

var timestamp = new type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

/*eslint-disable no-bitwise*/





// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

var binary = new type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString$1.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

var pairs = new type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});

/*eslint-disable max-len,no-use-before-define*/







var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State$1(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || _default;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = snippet(mark);

  return new exception(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
        _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load$1(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception('expected a single document in the stream, but found more');
}


var loadAll_1 = loadAll$1;
var load_1    = load$1;

var loader = {
	loadAll: loadAll_1,
	load: load_1
};

/*eslint-disable no-use-before-define*/





var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || _default;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new exception('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump$1(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

var dump_1 = dump$1;

var dumper = {
	dump: dump_1
};

function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


var Type                = type;
var Schema              = schema;
var FAILSAFE_SCHEMA     = failsafe;
var JSON_SCHEMA         = json;
var CORE_SCHEMA         = core;
var DEFAULT_SCHEMA      = _default;
var load                = loader.load;
var loadAll             = loader.loadAll;
var dump                = dumper.dump;
var YAMLException       = exception;

// Re-export all types in case user wants to create custom schema
var types = {
  binary:    binary,
  float:     float,
  map:       map,
  null:      _null,
  pairs:     pairs,
  set:       set,
  timestamp: timestamp,
  bool:      bool,
  int:       int,
  merge:     merge,
  omap:      omap,
  seq:       seq,
  str:       str
};

// Removed functions from JS-YAML 3.0.x
var safeLoad            = renamed('safeLoad', 'load');
var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
var safeDump            = renamed('safeDump', 'dump');

var jsYaml = {
	Type: Type,
	Schema: Schema,
	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
	JSON_SCHEMA: JSON_SCHEMA,
	CORE_SCHEMA: CORE_SCHEMA,
	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
	load: load,
	loadAll: loadAll,
	dump: dump,
	YAMLException: YAMLException,
	types: types,
	safeLoad: safeLoad,
	safeLoadAll: safeLoadAll,
	safeDump: safeDump
};

/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (jsYaml)));



/***/ }),

/***/ 897:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _baseGetTag)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_root.js + 1 modules
var _root = __webpack_require__(320);
;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Symbol.js


/** Built-in value references. */
var Symbol = _root/* default.Symbol */.Z.Symbol;

/* harmony default export */ const _Symbol = (Symbol);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getRawTag.js


/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _getRawTag_hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = _getRawTag_hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/* harmony default export */ const _getRawTag = (getRawTag);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_objectToString.js
/** Used for built-in method references. */
var _objectToString_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _objectToString_nativeObjectToString = _objectToString_objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return _objectToString_nativeObjectToString.call(value);
}

/* harmony default export */ const _objectToString = (objectToString);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetTag.js




/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var _baseGetTag_symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (_baseGetTag_symToStringTag && _baseGetTag_symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

/* harmony default export */ const _baseGetTag = (baseGetTag);


/***/ }),

/***/ 320:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _root)
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_freeGlobal.js
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/* harmony default export */ const _freeGlobal = (freeGlobal);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_root.js


/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

/* harmony default export */ const _root = (root);


/***/ }),

/***/ 433:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isObject);


/***/ }),

/***/ 926:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_once)
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_trimmedEndIndex.js
/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/* harmony default export */ const _trimmedEndIndex = (trimmedEndIndex);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseTrim.js


/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

/* harmony default export */ const _baseTrim = (baseTrim);

// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(433);
// EXTERNAL MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetTag.js + 3 modules
var _baseGetTag = __webpack_require__(897);
;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObjectLike.js
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/* harmony default export */ const lodash_es_isObjectLike = (isObjectLike);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isSymbol.js



/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (lodash_es_isObjectLike(value) && (0,_baseGetTag/* default */.Z)(value) == symbolTag);
}

/* harmony default export */ const lodash_es_isSymbol = (isSymbol);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toNumber.js




/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (lodash_es_isSymbol(value)) {
    return NAN;
  }
  if ((0,isObject/* default */.Z)(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = (0,isObject/* default */.Z)(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = _baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/* harmony default export */ const lodash_es_toNumber = (toNumber);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toFinite.js


/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = lodash_es_toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/* harmony default export */ const lodash_es_toFinite = (toFinite);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toInteger.js


/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = lodash_es_toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/* harmony default export */ const lodash_es_toInteger = (toInteger);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/before.js


/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', _.before(5, addContactToList));
 * // => Allows adding up to 4 contacts to the list.
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = lodash_es_toInteger(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

/* harmony default export */ const lodash_es_before = (before);

;// CONCATENATED MODULE: ./node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/once.js


/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // => `createApplication` is invoked once
 */
function once(func) {
  return lodash_es_before(2, func);
}

/* harmony default export */ const lodash_es_once = (once);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && !queue.d) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = 1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(32);
/******/ 	
/******/ })()
;