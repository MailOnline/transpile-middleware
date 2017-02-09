transpile-middleware
============

Connect/Express middleware to do a minimal transpilation to meet the requirements of a browser.

Installation
============

	npm install transpile-middleware

The package will install both the middleware, and _all_ the supporting Babel & Nodent packages to support all features. You can install just the transpiler with:

	npm install --prod transpile-middleware
	
In this case, if you are not using all the supported features, install the Babel & Nodent packages you required for your project.

How it works
=====
transpile-middleware compiles and caches your source JavaScript using [Nodent](http://nodent.mailed.me.uk) and/or [Babel](http://babeljs.io) as it is requested by browsers. It checks the compatibility of the browser and only transpiles features not implemented by the browser, allowing the native implementations to take over where possible.

You need to specify which ES6/7/Next features your app uses (in the browser) so transpile-middleware can do the minimum work necessary. For each feature you specify you _may_ need to install a babel transform or other module. transpile-middleware doesn't install anything by default except babel-core to keep installation as light as possible. If a module is missing, transpile-middleware will print a message to console.error() showing you what is missing.

Internally, there is a map between the Kangax feature names (see below) and the Nodent or Babel transformers that implement it. At present (v0.9) this is a very small list - feel free to update the list and submit a PR.

Usage
=====

In your Node server:

		app.use(require('transpile-middleware').createHandler({
		    // The features used by this app
		    features: ['let','const','arrow_functions','async_return','async_throw','await_anywhere'],
		    // Location of the js files
            srcDir: __dirname + '/www',
            match: /^\/js\/[^\/]+\.js$/, // Match everything is /js/xxx.js, but NOT subdirs like /js/vendor/xxx.js
            enableCache: (process.env.NODE_ENV === 'production')
        }));

Options for `createHandler` are:

srcDir
-----
The root directory of where your static .js files live

match
-----
A pattern to test the request URL against - allows you to filter in/out some JS paths.

features
--------
An array of features used by your app. Valid values (derived from the Kangax ES6/7/Next compatibility tables) are:

	const
	let
	arrow_functions
	object_literal_extensions (since v0.9.1)
	template_strings (since v0.9.1)
	template_literals (since v0.9.5)
	destructuring_declarations (since v0.9.2)
	destructuring_assignment (since v0.9.2)
	destructuring_parameters (since v0.9.2)
	async_functions (invokes Nodent)
	async_return (invokes Nodent)
	async_throw (invokes Nodent)
	await_anywhere (invokes Nodent)


The following values are valid, but not implemented in v0.9 (requires babel support for each feature)

	proper_tail_calls_tail_call_optimisation_
	default_function_parameters
	rest_parameters
	spread_operator
	for_of_loops
	octal_and_binary_literals
	RegExp_y_and_u_flags
	Unicode_code_point_escapes
	new_target
	block_level_function_declaration
	class
	super
	generators
	typed_arrays
	Map
	Set
	WeakMap
	WeakSet
	Proxy
	Reflect
	Promise
	Symbol
	well_known_symbols
	Object_static_methods
	function_name_property
	String_static_methods
	String_prototype_methods
	RegExp_prototype_properties
	Array_static_methods
	Array_prototype_methods
	Number_properties
	Math_methods
	Array_is_subclassable
	RegExp_is_subclassable
	Function_is_subclassable
	Promise_is_subclassable
	miscellaneous_subclassables
	prototype_of_bound_functions
	Proxy_internal_get_calls
	Proxy_internal_set_calls
	Proxy_internal_defineProperty_calls
	Proxy_internal_deleteProperty_calls
	Proxy_internal_getOwnPropertyDescriptor_calls
	Proxy_internal_ownKeys_calls
	Object_static_methods_accept_primitives
	own_property_order
	miscellaneous
	non_strict_function_semantics
	__proto___in_object_literals
	Object_prototype___proto__
	String_prototype_HTML_methods
	RegExp_prototype_compile
	RegExp_syntax_extensions
	HTML_style_comments
	exponentiation_operator
	Array_prototype_includes
	generator_functions_can_t_be_used_with_new_
	strict_fn_w_non_strict_non_simple_params_is_error
	nested_rest_destructuring_declarations
	nested_rest_destructuring_parameters
	Proxy_enumerate_handler_removed
	Proxy_internal_calls_Array_prototype_includes
	Object_values
	Object_entries
	trailing_commas_in_function_syntax
	async_functions
	Object_getOwnPropertyDescriptors
	SIMD_Single_Instruction_Multiple_Data_
	String_padding
	function_sent
	object_rest_properties
	object_spread_properties
	ArrayBuffer_transfer
	class_decorators
	class_properties
	String_trimming
	System_global
	Observable
	bind_operator
	do_expression
	Map_prototype_toJSON
	Set_prototype_toJSON
	String_prototype_at
	Error_isError
	Math_methods_for_64_bit_integers
	Reflect_Realm

Updating
========

You can force an update from the Kangax browser capability database (see [http://kangax.github.io/compat-table/](http://kangax.github.io/compat-table/)) using:

	npm run update-kangax
	
You can force an update to the User Agent database using 

	npm run update-ua
	
...or update both with

	npm run update-all
	
Updating these components installs and builds quite a lot of dependencies which are installed on demand.