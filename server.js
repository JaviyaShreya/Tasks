const http = require('http');
const {writeFile, readFile} = require('fs').promises;
const fs = require('fs');
const url = require('url');
const EventEmmiter = require('node:events');
const path = require('path');
const { v4: uuidv4, validate: uuidValidate  } = require('uuid')

const event = new EventEmmiter()

function createResponse({res, nstatuscode,oData, sMessage="", bisError=false}){
    if(bisError){
        res.writeHead(nstatuscode, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({"message": sMessage}));
    }
    else if(oData){
        res.writeHead(nstatuscode, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({"message": sMessage,  "data": oData}));
    }
    else if(sMessage){
        res.writeHead(nstatuscode, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({"message": sMessage}));
    }
}
function validateData(res, oNewdata){
    if(!oNewdata.sname || !oNewdata.nquantity || !oNewdata.nprice || !oNewdata.sstatus){
        return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
    }
    else if(typeof oNewdata.sname !== 'string' || typeof oNewdata.nquantity !== 'number' || typeof oNewdata.nprice !== 'number' || typeof oNewdata.sstatus !== 'string'){
        return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
    }
    else if(oNewdata.nquantity < 0 || oNewdata.nprice < 0){
        return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
    }
        
}
function validateId(res, id){
    if(!uuidValidate(id)){
        return createResponse({res, nstatuscode:400, sMessage:"Invalid ID"})
    }
}
const myServer = http.createServer((req,res)=>{
    console.log(req.url)
    console.log(req.method)
    console.log("server is running")
   
    //Event Listeners
    event.on('oItemCreated',(oData)=>{
        console.log("oItem Created Successfully",oData)
    })
    event.on('oItemUpdated',(oData)=>{
        console.log("oItem Updated Successfully",oData)
    })
    event.on('oItemDeleted',(oData)=>{
        console.log("oItem Deleted Successfully",oData)
    })

    //healthcheck to check if server is running
    switch (true) {
    
    case req.method === 'GET' && req.url ==="/healthcheck" :
        try{
            return createResponse({res, nstatuscode:200, sMessage:"Server is running"})
        }
        catch(err){
           return createResponse({res, nstatuscode:500, sMessage:err.message, bisError:true})
        }
    break;

    //to get all the oData
    case req.method === 'GET' && req.url ==="/api/data" :
        try{
           fs.readFile('data.json',(err,oData)=>{
            if(err){
                if(err.code==="ENOENT"){
                    return createResponse({res, nstatuscode:404, sMessage:"Data not found"})
                }
                else{
                    return createResponse({res, nstatuscode:500, sMessage:"Error while reading oData"})
                }
            }
            const oDataArr = JSON.parse(oData)
            const oNewdata = oDataArr.filter(i=>i.sstatus==="available")
            return createResponse({res, nstatuscode:200, oData:oNewdata})
           })
        }
        catch(err){
            return createResponse({res, nstatuscode:500, sMessage:err.message, bisError:true})
        }
    break;
    
    //to get oData of a particular id
    case req.method === 'GET' && req.url.startsWith("/api/data") :
        try{
            const id = req.url.split('/')[3]
            //to check if the id is valid
            validateId(res, id)
            fs.readFile('data.json',(err,oData)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                    }
                    else{
                        return createResponse({res, nstatuscode:500, sMessage:"Error while reading oData"})
                    }
                }
                const oDataArr = JSON.parse(oData)
                //to find the oData of the given id
                const itemIndex=oDataArr.findIndex(i=>i.id===id)
                if(itemIndex === -1){
                    return createResponse({res, nstatuscode:404, sMessage:"oItem not found"})
                }

                const oItem = oDataArr.find(i=>i.id===id)
                if(oItem){
                    return createResponse({res, nstatuscode:200, oData:oItem})
                }
            })
        }
        catch(err){
            return res.end(err.message)
        }
    break;

    //to post new oData
    case req.method === 'POST' && req.url ==="/api/data" :
        try{
            
           fs.readFile('data.json',(err,oData)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                    }
                    else{
                        return createResponse({res, nstatuscode:500, sMessage:"Error while reading oData"})
                    }
                }
                //store the already existing oData in json file
                const oOldata = Array.from(JSON.parse(oData.toString('utf-8')))
                let body = ''
            
                req.on('data',chunk=>{
                    body+=chunk.toString()
                }) 
               
                req.on('end',()=>{
                    if (!body.trim()) {  // Check if body is empty
                       return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
                    }
                    try{
                        JSON.parse(body)
                    }
                    catch(err){
                        return createResponse({res, nstatuscode:400, sMessage:"Enter JSON format"})
                    }
                    const oNewdata = JSON.parse(body)

                    validateData(res, oNewdata)
                   
                    //to check if the object is emnpty
                    if(Object.keys(oNewdata).length===0){
                        createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
                    }
                    //takes random id from uuid
                    oNewdata.id = uuidv4()
                    //push the new oData to the existing oData
                    oOldata.push(oNewdata)
                    fs.writeFile('data.json',JSON.stringify(oOldata),(err)=>{
                        if(err){
                            if(err.code==="ENOENT"){
                                return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                            }
                            else{
                                return createResponse({res, nstatuscode:500, sMessage:"Error while writing oData"})
                            }
                         }
                        event.emit('oItemCreated',oNewdata)                     
                        return createResponse({res, nstatuscode:201, sMessage:"oData Created Successfully",oData:oNewdata})
                    })
                
                })

            })
        }
        catch(err){
            return createResponse({res, nstatuscode:500, sMessage:err.message, bisError:true})
        }
    break;

    //to update existing oData
    case req.method === 'PUT' && req.url.startsWith("/api/data") :
        try{
            const id = req.url.split('/')[3]
            //to check if the id is valid
            validateId(res, id)
        
            fs.readFile('data.json',(err,oData)=>{
                if(err){
                    if(err.code==="ENOENT"){    
                        return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                    }
                    else{
                        return createResponse({res, nstatuscode:500, sMessage:"Error while reading oData"})
                    }
                }
                const oDataArr = Array.from(JSON.parse(oData.toString('utf-8')))
                //to find the nIndex of the oData with the given id
                const nIndex = oDataArr.findIndex(i=>i.id===id)

                if(nIndex === -1){
                    return createResponse({res, nstatuscode:404, sMessage:"oItem not found"})
                }
                let body = ''
                req.on('data',chunk=>{
                    body += chunk.toString()
                })
                req.on('end',()=>{
                    //to check if the body is empty
                    if(!body.trim()){
                        return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
                    }
                    const updatedoItem = JSON.parse(body)
                    //to check if the object is empty
                    if(Object.keys(updatedoItem).length===0){
                        return createResponse({res, nstatuscode:400, sMessage:"Enter valid oData"})
                    }
                    //update the existing oData with the new oData
                    oDataArr[nIndex] = {...oDataArr[nIndex],...updatedoItem}
                    fs.writeFile('oData.json',JSON.stringify(oDataArr),(err)=>{
                        if(err){
                            if(err.code==="ENOENT"){
                                return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                            }
                            else{
                                res.writeHead(500,{'content-type':'application/json'})
                                return createResponse({res, nstatuscode:500, sMessage:"Error while writing oData"})
                            }
                        }

                        event.emit('oItemUpdated',oDataArr[nIndex])
                        return createResponse({res, nstatuscode:200, sMessage:"Data Updated Successfully",oData:oDataArr[nIndex]})
                    })
                })
            })
            
        }
        catch(err){
            return res.end(err.message)
        }
    break;

    //to delete oData
    case req.method === 'DELETE' && req.url.startsWith("/api/data") :
        try{
            const id = req.url.split('/')[3] 
            validateId(res, id)
            fs.readFile('data.json',(err,oData)=>{
                if(err){
                    if(err.code==="ENOENT"){
                        return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                    }
                    else{
                        res.writeHead(500,{'content-type':'application/json'})
                        return createResponse({res, nstatuscode:500, sMessage:"Error while reading oData"})
                    }
                }
                const oDataArr = Array.from(JSON.parse(oData.toString('utf-8')))
                const oDeletedata = oDataArr.find(i=>i.id===id)

                //to filter the oData with the given id
                const oNewdata = oDataArr.filter(i=>i.id!==id)
                console.log(oNewdata)
                //to check if the oData is not found
                const itemIndex=oDataArr.findIndex(i=>i.id===id)
                if(itemIndex === -1){
                    return createResponse({res, nstatuscode:404, sMessage:"oItem not found"})
                }
                
                fs.writeFile('data.json',JSON.stringify(oNewdata),(err)=>{
                    if(err){
                        if(err.code==="ENOENT"){
                            return createResponse({res, nstatuscode:404, sMessage:"oData not found"})
                        }
                        else{
                            res.writeHead(500,{'content-type':'application/json'})
                            return createResponse({res, nstatuscode:500, sMessage:"Error while writing oData"})
                        }
                    }
                    event.emit('oItemDeleted',oDeletedata)
                    createResponse({res, nstatuscode:200, sMessage:"oData Deleted Successfully"})
                })
            })
          
        }
        catch(err){
            return createResponse({res, nstatuscode:500, sMessage:err.message, bisError:true})
        }
    break;

    //to serve static files
    case req.url.startsWith('/public') && req.method === 'GET' :
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
        
        fs.readFile(filepath.slice(1), (err, oData) => {
            if(err){
                if(err.code == 'ENOENT'){
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    return res.end('File not found!');
                }
                else{
                    res.writeHead(500)
                    return res.end('server error', err.code)
                }
            }
            else{
                res.writeHead(200, {'Content-Type': contentType});
                return res.end(oData, 'utf8');
            }
        })
    break;

    default:
        return createResponse({res, nstatuscode:404, sMessage:"Route not found"})
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