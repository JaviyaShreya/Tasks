
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { validate: uuidValidate } = require('uuid')
const{readFile,writeFile} =require('fs').promises
const url = require('url')
const {event} = require('../utils/eventhandler')
const {createResponse, validateData, validateId} = require('../helpers/helper')


async function getAlldata(req,res){
    try{
        const odata = await readFile('data.json','utf-8')
       
        const odataArr = JSON.parse(odata)
        const onewdata = odataArr.filter(i=>i.sstatus==='available')
      
       
        return createResponse({res, nstatuscode:200, oData:onewdata})
    }
    catch(err){
        if(err){
            if(err.code==="ENOENT"){
                return createResponse({res, nstatuscode:404, sMessage:"Data not found", bisError:true})
            }
            else{
                return createResponse({res, nstatuscode:500, sMessage:err.message, bisError:true})
            }
        }
    }
}

async function getdataById(req,res){
    try{
        const iId = req.url.split('/')[3]
        validateId(iId)
        const odata = await readFile('data.json','utf-8')
        const odataArr = JSON.parse(odata)
        const nId = odataArr.findIndex(i=>i.id===iId)
        if(nId==-1){
            return createResponse({res, nstatuscode:404, sMessage:"Item not found", bisError:true})
        }
        //const oItem = odataArr.find(i=>i.id===iId)
        return createResponse({res, nstatuscode:200, oData:odataArr[nId]})
    }
    catch(err){
        console.log(err.message)
        if(err){
            if(err.code==="ENOENT"){
                return createResponse({res, nstatuscode:404, sMessage:"Data not found", bisError:true})
            }
            else{
                return createResponse({res, nstatuscode:500, sMessage:"Error while reading data", bisError:true})
            }
        }
    }
}

async function addData(req,res){
    try{
        const odata = await readFile('data.json','utf-8')
        const ooldata = Array.from(JSON.parse(odata))
        console.log(odata)
        let body = ''
        req.on('data',chunk=>{
            body += chunk.toString()
        })
        req.on('end',async ()=>{
            if(!body.trim()){
                return createResponse({res, nstatuscode:400, sMessage:"Enter valid data", bisError:true})
            }
            try{
                JSON.parse(body)
            }
            catch(err){
                return createResponse({res, nstatuscode:400, sMessage:"Enter valid JSON", bisError:true})
            }
            const onewdata = JSON.parse(body)

            validateData(res, onewdata)

            onewdata.id = uuidv4()
            ooldata.push(onewdata)

            await writeFile('data.json',JSON.stringify(ooldata))
            event.emit('itemAdded')
            return createResponse({res, nstatuscode:201, sMessage:"Data Added Successfully", oData:onewdata})
        })
    }
    catch(err){
        console.log(err.message)
        if(err.code==="ENOENT"){
            return createResponse({res, nstatuscode:404, sMessage:"Data not found", bisError:true})
        }
        else{
            return createResponse({res, nstatuscode:500, sMessage:"Error while reading data", bisError:true})
        }
    }
}

async function updateData(req,res){
    try{
        const iId = req.url.split('/')[3]
        //to check if the id is valid
        validateId(iId)
    
        const odata = await readFile('data.json','utf-8')
        const odataArr = JSON.parse(odata)

        const nindex = odataArr.findIndex(i=>i.id===iId)
        if(nindex===-1){
            return createResponse({res, nstatuscode:404, sMessage:"Item not found", bisError:true})
        }
        let body = ''
        req.on('data',chunk=>{
            body += chunk.toString()
        })
        req.on('end',async ()=>{
            if(!body.trim()){
                return createResponse({res, nstatuscode:400, sMessage:"Enter valid data", bisError:true})
            }
            try{
                JSON.parse(body)
            }
            catch(err){
                return createResponse({res, nstatuscode:400, sMessage:"Enter valid data", bisError:true})
            }

            const onewdata = JSON.parse(body)
            odataArr[nindex] = {...odataArr[nindex],...onewdata}
            await writeFile('data.json',JSON.stringify(odataArr))

            event.emit('itemUpdated')
            return createResponse({res, nstatuscode:200, sMessage:"Data Updated Successfully", oData:odataArr[nindex]})
        
        })
    }
    catch(err){
        if(err){
            console.log(err.message)
            if(err.code==="ENOENT"){
                return createResponse({res, nstatuscode:404, sMessage:"Data not found", bisError:true})
            }
            else{
                return createResponse({res, nstatuscode:500, sMessage:"Error while reading data", bisError:true})
            }
        }
    }
}

async function deleteData(req,res){
    try{
        const iId = req.url.split('/')[3] 
        validateId(iId)
        
        const odata = await readFile('data.json','utf-8')
        const odataArr = JSON.parse(odata)

        const nindex = odataArr.findIndex(i=>i.id===iId)

        if(nindex===-1){
            return createResponse({res, nstatuscode:404, sMessage:"Item not found", bisError:true})
        }

        const onewdata = odataArr.filter(i=>i.id!==iId)
        await writeFile('data.json',JSON.stringify(onewdata))
        event.emit('itemDeleted')
        return createResponse({res, nstatuscode:200, sMessage:"Data Deleted Successfully"})
              
    }
    catch(err){
        console.log(err.message)
        if(err){
            if(err.code==="ENOENT"){
                return createResponse({res, nstatuscode:404, sMessage:"Data not found", bisError:true})
            }
            else{
                return createResponse({res, nstatuscode:500, sMessage:"Error while reading data", bisError:true})
            }
        }
    }
}

module.exports={getAlldata,getdataById,addData,updateData,deleteData}