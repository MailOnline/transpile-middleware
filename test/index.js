/* transpile-middleware test */

var tm = require('..') ;

console.log("Testing...") ;
var opts = {
    features: tm.features,
    srcDir:__dirname
} ;
var req = {
    url:'/test-input.js',
    headers:{
        'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2623.87 Safari/537.36'
    }
} ;
var res = {
    status:function(x){
        console.log('status:',x) ;
        return res ;
    },
    send:function(x){
        console.log(x) ;
        return res ;
    },
    write:function(x){
        console.log(x) ;
        return res ;
    },
    end:function(x){
        console.log("<end>") ;
        return res ;
    }
} ;

tm.createHandler(opts)(req,res,()=>console.log('done')) ;
req.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1.0.2623.87 Safari/537.36' ;
tm.createHandler(opts)(req,res,()=>console.log('done')) ;
