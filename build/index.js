/* Script to build JSON files describing browser capabilities */

console.log("\n\nTranspile-middleware - building runtime compatability data") ;
console.log("----------------------------------------------------------") ;
var kangax = {
    es6:require('compat-table/data-es6'),
    es2016plus:require('compat-table/data-es2016plus'),
    esnext:require('compat-table/data-esnext')
} ;

var fs = require('fs') ;

fs.writeFileSync(__dirname+'/compat.json',JSON.stringify(kangax,null,2)) ;

var features = {} ;
Object.keys(kangax).forEach(function(revision){
    kangax[revision].tests.forEach(function(test) {
        var name = test.name.replace(/\W+/g,"_") ;
        if (features[name])
            console.warn("WARNING: duplicate feature '"+name+"' in "+revision+" and "+features[name]) ;
        features[name] = revision;
    }) ;
}) ;

console.log('Updated '+__dirname+'/compat.json\n') ;
