const { getAlldata, getdataById, addData, updateData, deleteData } = require('../controllers/data.controller');


function dataroutes(req,res){

    //to get all the data
    if(req.method === 'GET' && req.url ==="/api/data"){
        getAlldata(req,res)
        return true
    }
    //to get data of a particular id
    else if(req.method === 'GET' && req.url.startsWith("/api/data")){
        getdataById(req,res)
        return true
    }
    //to post new data
    else if(req.method === 'POST' && req.url ==="/api/data"){
        addData(req,res)
        return true
    }
    //to update existing data
    else if(req.method === 'PUT' && req.url.startsWith("/api/data")){
        updateData(req,res)
        return true
    }
    //to delete data
    else if(req.method === 'DELETE' && req.url.startsWith("/api/data")){
        deleteData(req,res)
        return true
    }

    
        
}

module.exports = {dataroutes}