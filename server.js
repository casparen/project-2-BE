//db = project_2
// collection = search
// favCollection = favorites

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var request = require('request');
var md5 = require('md5')

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var MongoClient = mongodb.MongoClient;
// var mongoUrl = 'mongodb://localhost:27017/project_2';
var mongourl = 'mongodb://heroku_0vf9635k:8dv42argrk3a0riv9faii59rlh@ds029745.mlab.com:29745/heroku_0vf9635k';

PORT = process.env.PORT || 80;


app.get('/', function(request, response){
  response.json({"description":"project_2 data base"});
});


///////////////////////////////////////////////////////////////////////////////open data search
app.post('/search', function (req, res){

  var endPoint = 'https://data.cityofnewyork.us/resource/yjub-udmw.json?'
  request({
    url: endPoint,
    method: 'GET',
    callback: function (err, response, body){
      // console.log(body);
      res.send(body);
    }
  })
})//post


/////////////////////////////////////////////////////////////////////////////////////google search
app.post('/searchPlaces', function(req, res){

  var endPoint = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
  var queryString = '?location='
  var lat = req.body.lat + ','
  var lng = req.body.lng
  var queryString2 = '&radius=200'
  var queryString3 = '&keyword='
  var keyword = req.body.keyword
  var queryString4 = '&key='
  // var GOOGLE_MAPS_KEY_NEW = process.env.GOOGLE_MAPS_KEY_NEW;


  var fullQuery = endPoint + queryString + lat + lng + queryString2 + queryString3 + keyword + queryString4 + 'AIzaSyCLSDon0Fh4aD2ipbh_01P-_twyWzj_H9E'
  // var fullQuery = endPoint + queryString + '40.7400036' + '-73.9896392' + queryString2 + queryString3 + keyword + queryString4 + 'AIzaSyCLSDon0Fh4aD2ipbh_01P-_twyWzj_H9E'

console.log(fullQuery);
  request({
    url: fullQuery,
    method: 'GET',
    callback: function(err, response, body){
      // console.log(body);
      console.log(lat);
      console.log(lng);
      res.send(body);
    }
  })
})//post google search


console.log('im backedn');




/////////////////////////////////////////////////////////////////////////add to favorites
app.post('/favorites/new', function (request, response){
  // response.json({"description":"add new"});
  console.log('request');
  console.log("request.body", request.body);

  MongoClient.connect(mongourl, function (err, db) {
    var favoritesCollection = db.collection('favorites');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      // We are connected!
      console.log('Connection established to', mongoUrl);
      console.log('Adding new user...');

      /* Insert */
      var newFavPlace = request.body;
      favoritesCollection.insert([newFavPlace], function (err, result) {
        if (err) {
          console.log(err);
          response.json("error");
        } else {
          console.log('Inserted.');
          console.log('RESULT!!!!', result);
          console.log("end result");
          response.json(result);
        }
        db.close(function() {
          console.log( "database CLOSED");
        });
      }); // end insert
    } // end else
  }); // end mongo connect
})




///////////////////////////////////////////////////////////////view favorites
app.get('/favorites', function(request, response){
  MongoClient.connect(mongourl, function(err, db){
    var favoritesCollection = db.collection('favorites');
    if(err){
      console.log('unable to connect to the mongoDB server', err);
    }
    else {
      favoritesCollection.find().toArray(function (err, result){
        if(err){
          console.log("error!", err);
          response.json("error");
        }
        else if (result.length){
          console.log('found', result);
          response.json(result);
        }
        else {
          console.log("no documents found with this defined criteria ");
          response.json("no places found");
        }
        db.close(function() {
          console.log('db closed');
        })
      })
    }
  })
})

//important to rememeber is placeName the key of the object
////////////////////////////////////////////////////////////////////////////delete fav
app.delete('/favorites/:placeName', function(request, response){
  // console.log("request.body:", request.body);
  // console.log("request.params:", request.params);

  MongoClient.connect(mongourl, function(err, db){
    var favoritesCollection = db.collection('favorites');
    if(err){
      console.log("unable to connect to the mongoDB server. ERROR", err);
    }
    else {
      console.log("deleting by name...");

    //deleting
    favoritesCollection.remove(request.params, function(err, numOfRemovedDocs){
      console.log("numOfRemovedDocs", numOfRemovedDocs);
      if(err){
        console.log("error", err);
      }
      else {
        favoritesCollection.find().toArray(function(err, result){
          if(err){
            console.log("ERROR", err);
            response.json("error");
          }
          else if (result.length){
            console.log("found", result);
            response.json(result);
          }
          else {
            console.log("No documents found with defined search criteria");
            response.json("none found")
          }
          db.close(function(){
            console.log("database CLOSED");
          })
        })
      }
    })
    }
  })
})








app.listen(PORT, function(){
  console.log('listen to events on a PORT heroku')
});


// app.listen(3000, function(){
//   console.log('listen to events on a PORT 3000')
// });





// https://data.seattle.gov/resource/pu5n-trf4.json?$where=within_circle(incident_location, 47.59815, -122.334540, 500)
// https://data.cityofnewyork.us/resource/yjub-udmw.json$where=within_circle(incident_location, 40.7399279, -73.9895729, 500)


//nyc locoation
//40.7400036
//-73.9896392


//li location
//40.914072499999996,
//-72.2882612

// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.7400036,-73.9896392&radius=400&keyword=Coffee&key=AIzaSyCLSDon0Fh4aD2ipbh_01P-_twyWzj_H9E






// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=restaurant&name=cruise&key=AIzaSyAimAwqFD8-PUpLLDrgFXbhjMO3GJ6hiDA

// https://data.seattle.gov/resource/3k2p-39jp.json?$where=within_circle(incident_location, 47.59815, -122.334540, 500)
// https://data.cityofnewyork.us/resource/yjub-udmw.json?$where=within_circle(incident_location,
// https://open.whitehouse.gov/resource/9j92-xfdk.json?$select=max(salary)
// https://data.cityofnewyork.us/resource/xx67-kt59.json?cuisine_description=Bakery













////////////////////////////////////////////OLD
// var express = require('express');
// var cors = require('cors');
// var fs = require('fs');
// var bodyParser = require('body-parser');
// var mongodb = require('mongodb')
// var request = require('request');
// var md5 = require('md5')
//
// var app = express();
//
// app.use(cors())
// app.use(bodyParser.urlencoded({extended: true}))
//
//
//
// var mongoClient = mongodb.MongoClient;
// var mongoUrl = 'mongodb://localhost:27017/last_fm_API'
//
// //last_fm_API
//
// app.post('/API/search', function(req, res){
//   var endPoint = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks';
//   var genre = '&tag=' + req.body.genre;
//   var keyString = '&api_key=';
//   var LAST_FM_KEY = process.env.LAST_FM_KEY;
//   var endPoint2 = '&format=json';
//
// var fullQuery = endPoint + genre + keyString + 'cb8b1a5dcb21602f48885f556a6bd619' + endPoint2;
// console.log(LAST_FM_KEY);
// console.log('fullQuery: ' + fullQuery);
//
// request({
//   url: fullQuery,
//   method: 'GET',
//   callback: function(err, response, body){
//     console.log(body);
//     res.send(body);
//   }
// })
// })
//
//
//
//
//
// app.listen(3000, function(){
//   console.log('backend listening on port 3000');
// })
//
//
// // 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=hip%20hop&api_key=cb8b1a5dcb21602f48885f556a6bd619&format=json'
