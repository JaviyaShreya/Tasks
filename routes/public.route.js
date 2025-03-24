const { servePublic } = require('../controllers/public.controller')

function publicroutes(req,res){

    //to serve static files
    if(req.url.startsWith('/public') && req.method === 'GET'){
    servePublic(req,res)
    return true
    }
   
}
module.exports = {publicroutes}