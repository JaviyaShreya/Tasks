const { getAlldata, getdataById, addData, updateData, deleteData } = require('../controllers/data.controller');


function dataroutes(req,res){

    switch(true){

    //to get all the data
    case req.method === 'GET' && req.url ==="/api/data" :
        getAlldata(req,res)
    break
    
    //to get data of a particular id
    case req.method === 'GET' && req.url.startsWith("/api/data") :
        getdataById(req,res)
    break;

    //to post new data
    case req.method === 'POST' && req.url ==="/api/data" :
        addData(req,res)
    break;

    //to update existing data
    case req.method === 'PUT' && req.url.startsWith("/api/data") :
        updateData(req,res)
    break;

    //to delete data
    case req.method === 'DELETE' && req.url.startsWith("/api/data") :
        deleteData(req,res)
    break;
    
    }

    
        
}

module.exports = {dataroutes}