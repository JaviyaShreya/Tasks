const http = require('http');
const { publicroutes } = require('./routes/public.route');
const { dataroutes } = require('./routes/data.route');


const myServer = http.createServer((req,res)=>{
    console.log(req.url)
    console.log(req.method)
    console.log("server is running")
   

    //healthcheck to check if server is running
    if(req.method === 'GET' && req.url ==="/healthcheck"){
        try{
            res.writeHead(200,{'content-type':'application/json'})
            return res.end(JSON.stringify({message:"Server is running properly"}))
        }
        catch(err){
            res.end(err.message)
        }
    }
    
    // else{
    //     res.writeHead(404,{'Content-Type':'application/json'})
    //     res.end(JSON.stringify({message:"Route not found"}))
    // }
    
    publicroutes(req,res)
    dataroutes(req,res)
    
})
//to listen to the server
myServer.listen(5000,(err)=>{
    if(err){
        console.log("Error Occured",err)
    }
    else{
        console.log("Server is running on http://localhost:5000")
    }
})



