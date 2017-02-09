/* transpile-middleware test */

var fs = require('fs') ;
var uaParser = require('../lib/ua');
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
        this.result = x ;
        return res ;
    },
    write:function(x){
        this.result = x ;
        return res ;
    },
    end:function(x){
        return res ;
    },
    status:function(x){
        return res ;
    },
    setHeader:function(x){
        return res ;
    }
} ;

var handler = tm.createHandler(opts) ;

function testUserAgent(id,uas) {
    var ua = uaParser(uas);
    var id = ua.ua.family.toLowerCase()+(ua.ua.major|"") ;
    console.log("Testing "+id,"("+uas+")");
    req.headers['user-agent'] = uas ;
    handler(req,res,()=>{throw new Error('next')}) ;
    var a = fs.readFileSync(__dirname+'/out.js.'+id).toString().replace(/\s+/g," ").trim() ;
    var out = res.result.replace(/\s+/g," ").trim() ;
    
    if (a!=out) {
        console.log("________")
        console.log(res.result) ;
        console.log("________")
        throw new Error('Unexpected output '+id+'\n'+a+'\n'+out) ;
    }
}

testUserAgent('chrome56', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2623.87 Safari/537.36') ;
testUserAgent('chrome50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2623.87 Safari/537.36') ;
testUserAgent('chrome1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1.0.2623.87 Safari/537.36') ;

console.log("...OK") ;