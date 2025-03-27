const fs = require('fs');
const path = require('path');

function servedefault(req,res){
    fs.readFile('public/index.html', (err, odata) => {
        if(err){
            res.writeHead(500)
            res.end('server error', err.code)
        }
        else{
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(odata, 'utf8');
        }
    })
}

function servePublic(req,res){
    const filepath = req.url
    console.log(filepath)
    let sextname = String(path.extname(filepath)).toLowerCase();
    const omime = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon"
    }
              
    let contentType = omime[sextname] || 'application/octet-stream';
    fs.readFile(filepath.slice(1), (err, odata) => {
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
            res.end(odata, 'utf8');
        }
    })
}

module.exports = {servePublic, servedefault}

