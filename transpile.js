'use strict';

var fs = require('fs');
var uaParser = require('./lib/ua');

var features = {} ;
function makeTest(test){
    return function(ua) {
        var uaID = ua.family.toLowerCase() ;
        return test.subtests.every(function(subtest) {
            for (var n=ua.major;n>=0;n--) {
                var uaVer = uaID+(n?n:"") ;
                if (uaVer in subtest.res)
                    return subtest.res[uaVer]==true ;
            }
        })?test:false;
    }
}
require('./kangax/data-es6.js').tests.forEach(function(test) { return features["es6_"+test.name.replace(/\W+/g,"_")] = makeTest(test)}) ;
require('./kangax/data-esnext.js').tests.forEach(function(test) { return features["esnext_"+test.name.replace(/\W+/g,"_")] = makeTest(test)}) ;

// Map babel transforms to kangax names
var kangaxToBabel = {
    es6_arrow_functions:['babel-plugin-transform-es2015-arrow-functions'],
    es6_const:['babel-plugin-transform-es2015-block-scoping'],
    es6_let:['babel-plugin-transform-es2015-block-scoping'],
    es6_object_literal_extensions:['babel-plugin-transform-es2015-computed-properties','babel-plugin-transform-es2015-literals','babel-plugin-transform-es2015-shorthand-properties'],
    es6_template_strings:['babel-plugin-transform-es2015-template-literals'],
    es6_destructuring_declarations:['babel-plugin-transform-es2015-destructuring'],
    es6_destructuring_assignment:['babel-plugin-transform-es2015-destructuring'],
    es6_destructuring_parameters:['babel-plugin-transform-es2015-destructuring']
} ;

var nodentPlugins = {
    async_return:true,
    async_throw:true,
    await_anywhere:true
} ;

var transforms = {};

function _try(fn,error) {
    return function(){
        try {
            return fn.apply(this,arguments) ;
        } catch (ex) {
            (error || console.error)(ex) ;
            return undefined ;
        }
    }
}

function createHandler(opts) {
    if (!Array.isArray(opts.features))
        return function(_0,_1,next) { next(); } ;

    var enableCache = ('enableCache' in opts)?opts.enableCache:true ;
    var match = opts.match;
    var sourcemap = opts.sourcemap || false;
    if (!match) match = /\.js$/;

    var uaParser = require('./lib/ua');

    return function transformReqHandler(req, res, next) {
        if (!req.url.match(match)) return next();

        var ua = uaParser(req.headers['user-agent']);
        var key = [req.url, ua.ua.family, ua.ua.major].join('||');

        if (enableCache === true && key in transforms) {
            res.write(transforms[key]);
            res.end();
        } else {
            try {
                var fileContents = fs.readFileSync(opts.srcDir + req.url);

                var transpilers = [] ;
                var babelPlugins = {} ;
                var useNodent = false ;
                opts.features.forEach(feature => {
                    if (nodentPlugins[feature])
                        useNodent = true ;
                    else if (features[feature]) {
                        if (kangaxToBabel[feature] && !features[feature](ua.ua)) {
                            kangaxToBabel[feature].forEach(function(plugin){
                                babelPlugins[plugin] = _try(require,ex=>console.error("Feature "+feature+": "+ex))(plugin) ;
                            }) ;
                        }
                    } else console.error("Unknown feature "+feature) ;
                }) ;

                if (useNodent) {
                    transpilers.push({
                        compiler: _try(require,ex=>console.error("Feature "+feature+": "+ex))('nodent')(),
                        method: 'compile',
                        args: (req,code) => [code, req.url, { promises: true, sourcemap: sourcemap }],
                        outputProperty: 'code' }) ;
                }

                babelPlugins = Object.keys(babelPlugins).map(key=>babelPlugins[key]).filter(plugin=>!!plugin) ;
                if (babelPlugins.length) {
                    var babel = require('babel-core');
                    transpilers.push({
                        compiler: babel, method: 'transform',
                        args: (req,code) => [code, { plugins: babelPlugins }],
                        outputProperty: 'code'
                    }) ;
                }

                var result = transpilers.reduce(
                    (output, transpiler) => {
                        var args = transpiler.args(req,output);
                        if (args === false) return output;
                        var compiler = transpiler.compiler;
                        return compiler[transpiler.method].apply(compiler, args)[transpiler.outputProperty];
                    },
                    fileContents.toString()
                );

                if (enableCache === true) transforms[key] = result;
                res.write(result);
                res.end();
            } catch (ex) {
                res.status(500).send("Error occurred whilst running transforms: "+ex.message);
            }
        }
    };
}

module.exports = {
    createHandler
};
