//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/front-end-vina-alta'));
// app.use(express.static('./dist/front-end-vina-alta'));

app.get('/*', (req, res) =>
    // res.sendFile('index.html', { root: 'dist/front-end-vina-alta/' }),
    res.sendFile(path.join(__dirname + '/dist/front-end-vina-alta/index.html'))
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);