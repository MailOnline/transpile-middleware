/* Script to build JSON files describing browser capabilities */

var compat = {
    es6:require('compat-table/data-es6'),
    esnext:require('compat-table/data-esnext')
} ;

var fs = require('fs') ;

fs.writeFileSync(__dirname+'/compat.json',JSON.stringify(compat,null,2)) ;

console.log('Updated '+__dirname+'/compat.json') ;
