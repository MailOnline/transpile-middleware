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
		    features: ['es6_let','es6_const','es6_arrow_functions','async_return','async_throw','await_anywhere'],
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

	es6_const
	es6_let
	es6_arrow_functions
	es6_object_literal_extensions (since v0.9.1)
	es6_template_strings (since v0.9.1)
	es6_template_literals (since v0.9.5)
	es6_destructuring_declarations (since v0.9.2)
	es6_destructuring_assignment (since v0.9.2)
	es6_destructuring_parameters (since v0.9.2)
	async_functions (invokes Nodent)
	async_return (invokes Nodent)
	async_throw (invokes Nodent)
	await_anywhere (invokes Nodent)


The following values are valid, but not implemented in v0.9 (requires babel support for each feature)

	es6_proper_tail_calls_tail_call_optimisation_
	es6_default_function_parameters
	es6_rest_parameters
	es6_spread_operator
	es6_for_of_loops
	es6_octal_and_binary_literals
	es6_RegExp_y_and_u_flags
	es6_Unicode_code_point_escapes
	es6_new_target
	es6_block_level_function_declaration
	es6_class
	es6_super
	es6_generators
	es6_typed_arrays
	es6_Map
	es6_Set
	es6_WeakMap
	es6_WeakSet
	es6_Proxy
	es6_Reflect
	es6_Promise
	es6_Symbol
	es6_well_known_symbols
	es6_Object_static_methods
	es6_function_name_property
	es6_String_static_methods
	es6_String_prototype_methods
	es6_RegExp_prototype_properties
	es6_Array_static_methods
	es6_Array_prototype_methods
	es6_Number_properties
	es6_Math_methods
	es6_Array_is_subclassable
	es6_RegExp_is_subclassable
	es6_Function_is_subclassable
	es6_Promise_is_subclassable
	es6_miscellaneous_subclassables
	es6_prototype_of_bound_functions
	es6_Proxy_internal_get_calls
	es6_Proxy_internal_set_calls
	es6_Proxy_internal_defineProperty_calls
	es6_Proxy_internal_deleteProperty_calls
	es6_Proxy_internal_getOwnPropertyDescriptor_calls
	es6_Proxy_internal_ownKeys_calls
	es6_Object_static_methods_accept_primitives
	es6_own_property_order
	es6_miscellaneous
	es6_non_strict_function_semantics
	es6___proto___in_object_literals
	es6_Object_prototype___proto__
	es6_String_prototype_HTML_methods
	es6_RegExp_prototype_compile
	es6_RegExp_syntax_extensions
	es6_HTML_style_comments
	esnext_exponentiation_operator
	esnext_Array_prototype_includes
	esnext_generator_functions_can_t_be_used_with_new_
	esnext_strict_fn_w_non_strict_non_simple_params_is_error
	esnext_nested_rest_destructuring_declarations
	esnext_nested_rest_destructuring_parameters
	esnext_Proxy_enumerate_handler_removed
	esnext_Proxy_internal_calls_Array_prototype_includes
	esnext_Object_values
	esnext_Object_entries
	esnext_trailing_commas_in_function_syntax
	esnext_async_functions
	esnext_Object_getOwnPropertyDescriptors
	esnext_SIMD_Single_Instruction_Multiple_Data_
	esnext_String_padding
	esnext_function_sent
	esnext_object_rest_properties
	esnext_object_spread_properties
	esnext_ArrayBuffer_transfer
	esnext_class_decorators
	esnext_class_properties
	esnext_String_trimming
	esnext_System_global
	esnext_Observable
	esnext_bind_operator
	esnext_do_expression
	esnext_Map_prototype_toJSON
	esnext_Set_prototype_toJSON
	esnext_String_prototype_at
	esnext_Error_isError
	esnext_Math_methods_for_64_bit_integers
	esnext_Reflect_Realm

Updating
========

You can force an update from the Kangax browser capability database (see [http://kangax.github.io/compat-table/](http://kangax.github.io/compat-table/)) using:

	npm run update-kangax
	
You can force an update to the User Agent database using 

	npm run update-ua
	
...or update both with

	npm run update-all
	
Updating these components installs and builds quite a lot of dependancies which are installed on demand.