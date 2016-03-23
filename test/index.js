/* transpile-middleware test */

var fs = require('fs') ;
var tm = require('..') ;

console.log("Testing...") ;
var opts = {
    features: tm.features,
    srcDir:__dirname
} ;
var req = {
    url:'/test-input.js',
    headers:{}
} ;
var res = {
    status:function(x){
        if (x>=300)
            throw new Error('Failed http status='+x)
        return res ;
    },
    send:function(x){
        return res ;
    },
    write:function(x){
        this.result = x ;
        return res ;
    },
    end:function(x){
        return res ;
    }
} ;

var handler = tm.createHandler(opts) ;

req.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2623.87 Safari/537.36'
handler(req,res,()=>{throw new Error('next')}) ;
var a = fs.readFileSync(__dirname+'/out.js.chrome55').toString().replace(/\s/g,"") ;
if (a!==res.result.replace(/\s/g,""))
    throw new Error('Unexpected output chrome55') ;

req.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1.0.2623.87 Safari/537.36' ;
handler(req,res,()=>{throw new Error('next')}) ;
a = fs.readFileSync(__dirname+'/out.js.chrome1').toString().replace(/\s/g,"") ;
if (a!==res.result.replace(/\s/g,""))
    throw new Error('Unexpected output chrome1') ;

console.log("...OK") ;