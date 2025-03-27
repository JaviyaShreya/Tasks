const { v4: uuidValidate } = require('uuid');

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

module.exports = {createResponse, validateData, validateId}