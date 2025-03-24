
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { validate: uuidValidate } = require('uuid')
const url = require('url')
const {event} = require('../utils/eventhandler')


function getAlldata(req,res){
    try{
        fs.readFile('data.json',(err,data)=>{
            
         if(err){
             if(err.code==="ENOENT"){
                res.writeHead(200,{'content-type':'application/json'})
                res.end(JSON.stringify({message:"Data not found"}))
                return
            }
            else{
                res.writeHead(200,{'content-type':'application/json'})
                res.end(JSON.stringify({message:"Error while reading data"}))
                return
            }
         }
        res.writeHead(200,{'Content-Type':'application/json'})
         res.end(JSON.stringify(JSON.parse(data)))
        })
     }
     catch(err){
        res.end(err.message)
     }
}

function getdataById(req,res){
    try{
        const id = req.url.split('/')[3]
        //to check if the id is valid
        if(!uuidValidate(id)){
            res.writeHead(400,{'content-type':'application/json'})
            res.end(JSON.stringify({message:"Invalid ID"}))
            return
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
                return res.end(JSON.stringify(item))
            }
            else{
                res.writeHead(404,{'content-type':'application/json'})
                return res.end(JSON.stringify({message:"Item not found"}))         
            }
        })
    }
    catch(err){
        res.end(err.message)
    }
}

function addData(req,res){
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

function updateData(req,res){
    try{
        const id = req.url.split('/')[3]
        //to check if the id is valid
        if(!uuidValidate(id)){
            res.writeHead(400,{'content-type':'application/json'})
            res.end(JSON.stringify({message:"Invalid ID"}))
            return
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

function deleteData(req,res){
    try{
        const id = req.url.split('/')[3] 
        if(!uuidValidate(id)){
            res.writeHead(400,{'content-type':'application/json'})
            res.end(JSON.stringify({message:"Invalid ID"}))
            return
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

module.exports={getAlldata,getdataById,addData,updateData,deleteData}