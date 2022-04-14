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
      // request queries to get them running, need to await variables to get results
      raw_static_locs = dbo.collection("StaticSensorLocations").find().toArray();
      raw_static_data = dbo.collection("StaticSensorReadings").find(query).toArray();
      raw_mobile_data = dbo.collection("MobileSensorReadings").find(query).toArray();
      // process static data
      static_locs = Array.from(await raw_static_locs,
        (d) => { return {
          id: parseInt(d["Sensor-id"]),
          lat: parseFloat(d.Lat),
          long: parseFloat(d.Long),
        }; }
      );
      static_data = Array.from(await raw_static_data,
      (d) => { return {
        time: new Date(d.Timestamp),
        id: "Static:" + d["Sensor-id"].trim(),
        val: parseFloat(d.Value),
        lat: static_locs.find(loc => loc.id == parseInt(d["Sensor-id"])).lat,
        long: static_locs.find(loc => loc.id == parseInt(d["Sensor-id"])).long,
        }; }
      );
      // process mobile data
      mobile_data = Array.from(await raw_mobile_data,
        (d) => { return {
          time: new Date(d.Timestamp),
          id: d[" User-id"].trim() + ":" + d["Sensor-id"].trim(),
          lat: parseFloat(d.Lat),
          long: parseFloat(d.Long),
          val: parseFloat(d.Value),
        }; }
      );
      // send response
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(mobile_data.concat(static_data)));
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