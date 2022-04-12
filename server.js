var fs = require('fs');
var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;


var mongo_url = "mongodb://localhost:27017/";

http.createServer(function (req, res) {
  pathname = url.parse(req.url, true).pathname;
  if (pathname == "/data")
  {
    // parse query
    var url_query = url.parse(req.url, true).query;
    // TODO test with actual URL
    if (url_query.start_date == null)
      url_query.start_date = new Date("2020-04-06T04:00:10");
    else
      url_query.start_date = new Date(url_query.start_date);
    if (url_query.end_date == null)
      url_query.end_date = new Date("2020-04-06T04:00:30");
    else
      url_query.end_date = new Date(url_query.end_date);
    // query database
    MongoClient.connect(mongo_url, async function(err, db) {
      if (err) throw err;
      var dbo = db.db("MC2");
      var query = {Timestamp: {$gte: url_query.start_date, $lt: url_query.end_date}};
      data = await dbo.collection("MobileSensorReadings").find(query).toArray();
      // send response
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(data));
    });
  }
  else
  {
    // respond with requested file
    var filename = "." + pathname;
    fs.readFile(filename, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 Not Found");
      } 
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  }
}).listen(8080);