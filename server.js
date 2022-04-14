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
    url_query.start_date = url_query.start_date == null ?
      new Date(url_query.start_date)
      : new Date("2020-04-06T04:00:10");
    url_query.end_date = url_query.end_date == null?
      new Date(url_query.end_date)
      : new Date("2020-04-06T04:00:30");
    url_query.min_val = url_query.min_val == null ?
      parseFloat(url_query.min_val)
      : 0.0;
    url_query.max_val = url_query.max_val == null ?
      parseFloat(url_query.max_val)
      : 10000.0;
    if (url_query.tag != null)
    {
      url_query.user_id = url_query.tag.split(":")[0];
      url_query.sensor_id = url_query.tag.split(":")[0];
    }
    // query database
    MongoClient.connect(mongo_url, async function(err, db) {
      if (err) throw err;
      var dbo = db.db("MC2");
      var base_query = {
        Timestamp: {$gte: url_query.start_date, $lte: url_query.end_date},
        Value: {$gte: url_query.min_val, $lte: url_query.max_val}
      };
      // parse id filtering
      var static_query = base_query;
      var mobile_query = base_query;
      if (url_query.user_id == "Static")
        static_query["Sensor-id"] = url_query.sensor_id;
      else if (url_query.user_id != null)
        mobile_query["Sensor-id"] = url_query.sensor_id;
      // request queries to get them running, need to await variables to get results
      raw_static_locs = dbo.collection("StaticSensorLocations").find().toArray();
      raw_static_data = dbo.collection("StaticSensorReadings").find(static_query).toArray();
      raw_mobile_data = dbo.collection("MobileSensorReadings").find(mobile_query).toArray();
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
        id: "Static:" + d["Sensor-id"],
        val: parseFloat(d.Value),
        lat: static_locs.find(loc => loc.id == parseInt(d["Sensor-id"])).lat,
        long: static_locs.find(loc => loc.id == parseInt(d["Sensor-id"])).long,
        }; }
      );
      // process mobile data
      mobile_data = Array.from(await raw_mobile_data,
        (d) => { return {
          time: new Date(d.Timestamp),
          id: d[" User-id"].trim() + ":" + d["Sensor-id"],
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