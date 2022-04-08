var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("MC2");
  var query = {Timestamp: {$gte: new Date("2020-04-06T04:00:10"), $lt: new Date("2020-04-06T04:00:30")}};
  dbo.collection("MobileSensorReadings").find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});
