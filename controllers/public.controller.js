


function servePublic(req,res){
    const filepath = path.join(__dirname, '../public', req.url);
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
        ".ico": "image/x-icon"
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

module.exports = {servePublic}

const fs = require('fs');
const path = require('path');

function servePublic(req, res) {
    let requestedPath = path.join(__dirname, '../public', req.url);
    
    // Prevent directory traversal attacks
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');

    // If the requested URL is a directory, serve index.html
    if (safePath.endsWith(path.sep)) {
        requestedPath = path.join(safePath, 'index.html');
    }

    const extname = path.extname(requestedPath).toLowerCase();
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
    };

    const contentType = mime[extname] || 'application/octet-stream';

    fs.readFile(requestedPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data, 'utf8');
        }
    });
}

module.exports = { servePublic };
