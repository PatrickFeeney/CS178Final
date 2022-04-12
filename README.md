# CS178Final

The MC2 folder contains the files shared for the VAST 2019 MC2 except MobileSensorReadings.csv, which is too large for GitHub to store. This file must be added to the repository in MC2/data.

### Install

1. Install [node.js](https://nodejs.org/en/).
1. Install [MongoDB](https://www.mongodb.com/try/download/community). Recommended to uncheck the "Install MongoD as a Service" box and to install MongoDB Compass.
1. Unzip db.zip, producing the db folder in the root of the repository. 
1. Run ```npm install``` from root of repository.

### Running

1. Launch the database server by running ```./launch_mongo.ps1```.
1. Launch the node.js server by running ```node server.js```.
1. Visit the website by going to ```http://localhost:8080/index.html```.
