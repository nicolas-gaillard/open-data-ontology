// simple express server for HTML pages!
// ES6 style

const express = require("express");
const fs = require("fs");
const hostname = "127.0.0.1";
const port = process.env.PORT || 9865;
const app = express();
app.use(express.static(__dirname + "/"));

app.get("/", function(request, response) {
  response.sendfile("index.html");
});

app.listen(port, () => {
  console.log(`
        Server is running at http://${hostname}:${port}/ 
        Server hostname ${hostname} is listening on port ${port}!
    `);
});
