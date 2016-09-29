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

var kangax = require('./build/compat.json') ;

kangax.es6.tests.forEach(function(test) { return features["es6_"+test.name.replace(/\W+/g,"_")] = makeTest(test)}) ;
kangax.esnext.tests.forEach(function(test) { return features["esnext_"+test.name.replace(/\W+/g,"_")] = makeTest(test)}) ;

//Map babel transforms to kangax names
var kangaxToBabel = {
    es6_arrow_functions:['babel-plugin-transform-es2015-arrow-functions'],
    es6_const:['babel-plugin-transform-es2015-block-scoping'],
    es6_let:['babel-plugin-transform-es2015-block-scoping'],
    es6_object_literal_extensions:['babel-plugin-transform-es2015-computed-properties','babel-plugin-transform-es2015-literals','babel-plugin-transform-es2015-shorthand-properties'],
    es6_template_literals:['babel-plugin-transform-es2015-template-literals'],
    es6_destructuring_declarations:['babel-plugin-transform-es2015-destructuring'],
    es6_destructuring_assignment:['babel-plugin-transform-es2015-destructuring'],
    es6_destructuring_parameters:['babel-plugin-transform-es2015-destructuring']
} ;

var nodentPlugins = {
    async_functions:true,
    async_return:true,
    async_throw:true,
    await_anywhere:true
} ;

var aliases = {
    es6_template_strings:'es6_template_literals'
};

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
    if (!Array.isArray(opts.features)) {
        return function(_0,_1,next) { next(); } ;
    }
    
    var enableCache = ('enableCache' in opts)?opts.enableCache:true ;
    var match = opts.match;
    var sourcemap = opts.sourcemap || false;
    if (!match) match = /\.js$/;

    var uaParser = require('./lib/ua');
    var transformed = {};

    var xform = function transformReqHandler(req, res, next) {
        if (!req.url.match(match)) return next();

        var ua = uaParser(req.headers['user-agent']);
        var key = [req.url, "*", ua.ua.family, ua.ua.major].join('<>');

        if (enableCache === true && key in transformed) {
            res.setHeader('Content-Type','text/javascript')
            res.write(transformed[key]);
            res.end();
            return ;
        } 

        try {
            var transpilers = [] ;
            var babelPlugins = {} ;
            var useNodent = null ;
            opts.features.forEach(feature => {
                var test ;
                if (aliases[feature])
                    feature = aliases[feature] ;
                if (test = nodentPlugins[feature]) {
                    useNodent = { promises: true } ;
                } else if (features[feature]) {
                    if (kangaxToBabel[feature] && !features[feature](ua.ua)) {
                        kangaxToBabel[feature].forEach(function(plugin){
                            babelPlugins[plugin] = _try(require,ex=>console.error("Feature "+feature+": "+ex))(plugin) ;
                        }) ;
                    }
                } else console.error("Unknown feature "+feature) ;
            }) ;

            var transformKeys = Object.keys(babelPlugins);

            if (useNodent) {
                transformKeys.push('nodent') ;
                useNodent.sourcemap = sourcemap ;

                if (features.esnext_async_functions(ua.ua))
                    useNodent.engine = true ;

                var nodent = {
                    compiler: _try(require,ex=>console.error("Feature "+feature+": "+ex))('nodent')(),
                    method: 'compile',
                    args: (req,code) => [code, req.url, useNodent],
                    outputProperty: 'code' } ;
                if (!nodent.compiler.version || nodent.compiler.version<"2.6")
                    console.log("Nodent version should be >=2.6") ;
                else
                    transpilers.push(nodent) ;
            }
            
            transformKeys = req.url+"<>!"+transformKeys.sort().join('<>') ;
            
            if (transformKeys in transformed) {
                res.setHeader('Content-Type','text/javascript')
                res.write(transformed[transformKeys]);
                res.end();
                return ;
            } 
            babelPlugins = Object.keys(babelPlugins).map(key=>babelPlugins[key]).filter(plugin=>!!plugin) ;
            if (useNodent && useNodent.engine)
                babelPlugins.push(require('babel-plugin-syntax-async-functions')) ;

            if (babelPlugins.length) {
                var babel = require('babel-core');
                transpilers.push({
                    compiler: babel, method: 'transform',
                    args: (req,code) => [code, { plugins: babelPlugins, compact:false }],
                    outputProperty: 'code'
                }) ;
            }

            var fileContents = fs.readFileSync(opts.srcDir + req.url);
            var result = transpilers.reduce(
                (output, transpiler) => {
                    var args = transpiler.args(req,output);
                    if (args === false) return output;
                    var compiler = transpiler.compiler;
                    return compiler[transpiler.method].apply(compiler, args)[transpiler.outputProperty];
                },
                fileContents.toString()
            );

            if (enableCache === true) 
                transformed[key] = transformed[transformKeys] = result;

            res.setHeader('Content-Type','text/javascript')
            res.write(result);
            res.end();
        } catch (ex) {
            res.status(500).send("Error occurred whilst running transforms: "+ex.message+"\n"+ex.stack);
        }
    };
    xform.clearCache = function(url) {
        if (url) {
            url += "<>" ;
            Object.keys(transformed).forEach(function(k){
                if (k.slice(0,url.length-1)===url)
                    delete transformed[k] ;
            }) ;
        } else {
            transformed = {} ;
        }
    } ;
    return xform ;
}

module.exports = {
    createHandler:createHandler,
    features:Object.keys(kangaxToBabel).concat(Object.keys(nodentPlugins)).concat(Object.keys(aliases))
};
