const http = require('http');
const fs = require('fs');
const url = require('url');
const EventEmmiter = require('node:events');
const path = require('path');
const data = require('./data.json')
const { v4: uuidv4, validate: uuidValidate  } = require('uuid')

// const dataset =[
//     {
//         "id":2,
//         "itemname":"Watch",
//         "quantity":5, 
//         "price":10000,
//         "status":"Not Available",
//         "createdAt":"22/3/25",
//         "updatedAt":"25/3/25"
//     },
//     {
//         "id":3,
//         "itemname":"Mobile",
//         "quantity":10,
//         "price":20000,
//         "status":"Available",
//         "createdAt":"22/3/25",
//         "updatedAt":"25/3/25"
//     }
// ]
// fs.writeFile('data.json',JSON.stringify(dataset),(err)=>{
//     if(err){
//         console.log("Error while writing data")
//     }
// })

const event = new EventEmmiter()

const myServer = http.createServer((req,res)=>{
    console.log(req.url)
    console.log(req.method)
    console.log("server is running")
   
    //Event Listeners
    event.on('itemCreated',()=>{
        console.log("Item Created Successfully")
    })
    event.on('itemUpdated',()=>{
        console.log("Item Updated Successfully")
    })
    event.on('itemDeleted',()=>{
        console.log("Item Deleted Successfully")
    })

    //healthcheck to check if server is running
    if(req.method === 'GET' && req.url ==="/healthcheck"){
        try{
            res.writeHead(200,{'content-type':'application/json'})
            return res.end(JSON.stringify({message:"Server is running"}))
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to ge all the data
    else if(req.method === 'GET' && req.url ==="/api/data"){
        try{
           res.writeHead(200,{'content-type':'application/json'})
           fs.readFile('data.json',(err,data)=>{
            if(err){
                if(err.code==="ENOENT"){
                    res.end(JSON.stringify({message:"Data not found"}))
                }
                else{
                    res.end(JSON.stringify({message:"Error while reading data"}))
                }
            }
            res.end(JSON.stringify(JSON.parse(data)))
           })
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to get data of a particular id
    else if(req.method === 'GET' && req.url.startsWith("/api/data")){
        try{
            const id = req.url.split('/')[3]
            //to check if the id is valid
            if(!uuidValidate(id)){
                res.writeHead(400,{'content-type':'application/json'})
                res.end(JSON.stringify({message:"Invalid ID"}))
            }
            fs.readFile('data.json',(err,data)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return res.end(JSON.stringify({message:"Data not found"}))
                    }
                    else{
                        return res.end(JSON.stringify({message:"Error while reading data"}))
                    }
                }
                const dataArr = JSON.parse(data)
                //to find the data of the given id
                const item = dataArr.find(i=>i.id===id)
                if(item){
                    res.writeHead(200,{'content-type':'application/json'})
                    res.end(JSON.stringify(item))
                }
                else{
                    res.writeHead(404,{'content-type':'application/json'})
                    res.end(JSON.stringify({message:"Item not found"}))         

                }
            })
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to post new data
    else if(req.method === 'POST' && req.url ==="/api/data"){
        try{
            
           fs.readFile('data.json',(err,data)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return res.end(JSON.stringify({message:"Data not found"}))
                    }
                    else{
                       res.writeHead(500,{'content-type':'application/json'})
                        return res.end(JSON.stringify({message:"Error while reading data"}))
                    }
                }
                //store the already existing data in json file
                const oldata = Array.from(JSON.parse(data.toString('utf-8')))
                let body = ''
            
                req.on('data',chunk=>{
                    body+=chunk.toString()
                })
                req.on('end',()=>{
                    if (!body.trim()) {  // Check if body is empty
                        res.writeHead(400, { 'content-type': 'application/json' });
                        return res.end(JSON.stringify({ message: "Enter valid data" }));
                    }
                    const newdata = JSON.parse(body)

                    //to check if the object is emnpty
                    if(Object.keys(newdata).length===0){
                        res.writeHead(400,{'content-type':'application/json'})
                        return res.end(JSON.stringify({message:"Enter valid data"}))
                    }
                    //takes random id from uuid
                    newdata.id = uuidv4()
                    //push the new data to the existing data
                    oldata.push(newdata)
                  
                    fs.writeFile('data.json',JSON.stringify(oldata),(err)=>{
                        if(err){
                            if(err.code==="ENOENT"){
                                return res.end(JSON.stringify({message:"Data not found"}))
                            }
                            else{
                                return res.end(JSON.stringify({message:"Error while writing data"}))
                            }
                         }
                        event.emit('itemCreated')
                        res.writeHead(201,{'content-type':'application/json'})
                        res.end(JSON.stringify({message:"Data Created Successfully",data:newdata}))
                    })
                
                })

            })
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to update existing data
    else if(req.method === 'PUT' && req.url.startsWith("/api/data")){
        try{
            const id = req.url.split('/')[3]
            //to check if the id is valid
            if(!uuidValidate(id)){
                res.writeHead(400,{'content-type':'application/json'})
                res.end(JSON.stringify({message:"Invalid ID"}))
            }
        
            fs.readFile('data.json',(err,data)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        res.end(JSON.stringify({message:"Data not found"}))
                    }
                    else{
                        res.writeHead(500,{'content-type':'application/json'})
                        res.end(JSON.stringify({message:"Error while reading data"}))
                    }
                }
                const dataArr = Array.from(JSON.parse(data.toString('utf-8')))
                //to find the index of the data with the given id
                const index = dataArr.findIndex(i=>i.id===id)

                if(index === -1){
                    res.end(JSON.stringify({message:"Item not found"}))
                }
                let body = ''
                req.on('data',chunk=>{
                    body += chunk.toString()
                })
                req.on('end',()=>{
                    //to check if the body is empty
                    if(!body.trim()){
                        res.writeHead(400,{'content-type':'application/json'})
                        return res.end(JSON.stringify({message:"Enter valid data"}))
                    }
                    const updateditem = JSON.parse(body)
                    //to check if the object is empty
                    if(Object.keys(updateditem).length===0){
                        res.writeHead(400,{'content-type':'application/json'})
                        return res.end(JSON.stringify({message:"Enter valid data"}))
                    }
                    //update the existing data with the new data
                    dataArr[index] = {...dataArr[index],...updateditem}
                    fs.writeFile('data.json',JSON.stringify(dataArr),(err)=>{
                        if(err){
                            if(err.code==="ENOENT"){
                                return res.end(JSON.stringify({message:"Data not found"}))
                            }
                            else{
                                res.writeHead(500,{'content-type':'application/json'})
                                return res.end(JSON.stringify({message:"Error while writing data"}))
                            }
                        }

                        event.emit('itemUpdated')
                        res.writeHead(200,{'content-type':'application/json'})
                        res.end(JSON.stringify({message:"Data Updated Successfully",data:dataArr[index]}))
                    })


                })
            })
            
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to delete data
    else if(req.method === 'DELETE' && req.url.startsWith("/api/data")){
        try{
            const id = req.url.split('/')[3] 
            if(!uuidValidate(id)){
                res.writeHead(400,{'content-type':'application/json'})
                res.end(JSON.stringify({message:"Invalid ID"}))
            }
            fs.readFile('data.json',(err,data)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return res.end(JSON.stringify({message:"Data not found"}))
                    }
                    else{
                        res.writeHead(500,{'content-type':'application/json'})
                        return res.end(JSON.stringify({message:"Error while reading data"}))
                    }
                }
                const dataArr = Array.from(JSON.parse(data.toString('utf-8')))
                //to filter the data with the given id
                const newdata = dataArr.filter(i=>i.id!==id)
                //to check if the data is not found
                if(newdata.length === dataArr.length){
                    return res.end(JSON.stringify({message:"Item not found"}))
                }
                fs.writeFile('data.json',JSON.stringify(newdata),(err)=>{
                    if(err){
                        if(err.code==="ENOENT"){
                            return res.end(JSON.stringify({message:"Data not found"}))
                        }
                        else{
                            res.writeHead(500,{'content-type':'application/json'})
                            return res.end(JSON.stringify({message:"Error while writing data"}))
                        }
                    }
                    event.emit('itemDeleted')
                    res.writeHead(200,{'content-type':'application/json'})
                    res.end(JSON.stringify({message:"Data Deleted Successfully"}))
                })
            })
          
        }
        catch(err){
            res.end(err.message)
        }
    }
    //to serve static files
    else if(req.url.startsWith('/public') && req.method === 'GET'){
        let filepath=req.url
        console.log(filepath)
        let extname = String(path.extname(filepath)).toLowerCase();
        const mime = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".ico": "image/x-icon",
              }
              
            let contentType = mime[extname] || 'application/octet-stream';
        
        fs.readFile(filepath.slice(1), (err, data) => {
            if(err){
                if(err.code == 'ENOENT'){
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end('File not found!');
                }
                else{
                    res.writeHead(500)
                    res.end('server error', err.code)
                }
            }
            else{
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data, 'utf8');
            }
        })
    }
        
    
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