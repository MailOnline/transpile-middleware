function test() {
    const x = ()=>({a:1,b:2,c:this});
    let {a,b} = x() ;
    console.log(`${a+b}`) ;
    const q = { a, [b]:'bb' } ;
    console.log(q) ;
}

async function atest() { 
    const a = async ()=>2;
    return await a() ;
}


