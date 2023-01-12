const axios = require('axios');
const xml2js = require('xml2js');
const express = require('express');
const path = require('path');
const cors = require('cors');
const url = require('url');
const mongoose = require('mongoose');
require('dotenv').config();
const Pilot = require('./models/pilot');


//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);


const dronePositionsURL = 'https://assignments.reaktor.com/birdnest/drones'; //URL for drone positions data
const pilotInfoBaseURL = 'https://assignments.reaktor.com/birdnest/pilots/'; //base URL for "national drone registry endpoint" to fecth pilot info using drone's serial no.

const drones = []; //list of all the drones from the most recent snapshot
const violatingDrones = []; //list of drones that violate the NDZ
const violatingPilots = []; //list of piolts that own drones that violate the NDZ

 async function getDrones() { 
  //this function retrieves xml data from a source, parses the xml into json and creates drone objects to be added to the drone list
  var parser = new xml2js.Parser(); //init xml to json parser

  try {
    const response = await axios.get(dronePositionsURL).then(res =>{ //retrieve xml data from source, waiting for response
      parser.parseString(res.data,function(err,result){ //parse to json
      
       var captureObject = result.report.capture;  //json to object
       Object.values(captureObject).forEach(value =>{ //iterate to find drone data
        let timestamp = (value.$.snapshotTimestamp); //timestamp, e.g 2023-01-06T14:37:54.057Z
        Object.values(value.drone).forEach(drone => {
  
          let droneObject = { //create a new drone object using retrieved data
            serialNumber:drone.serialNumber.toString(), //serial number to match owner
            positionY:drone.positionY.toString(), //positions as coordinates 
            positionX:drone.positionX.toString(),
            timestamp: timestamp
          };

          /*Avoiding duplicates in the list by checking if a drone exists in the drones list already by using its serial number.
            if it does, update the object's values (coordinates) instead of adding it to the list, otherwise, add to list
          */
          if(foundDuplicate(drones,droneObject)){ 
            updateValues(drones,droneObject);
          }else{
            drones.push(droneObject); 
          }
        });
       });

      }); 

    }); 
    
  } catch (error) {
    console.log("error in getDrones()"+error);
    
  }
  
}

function foundDuplicate(dronelist,droneobj){ //returns true if an object exists in the given list, false if not
  return (dronelist.some(d => d.serialNumber === droneobj.serialNumber))
}

function updateValues(dronelist,droneobj){ //iterates the given dronelist, finds the drone we are looking for using it's serial number and finally, updates the drone object's data (position)
  dronelist.forEach((drone, index) => {
    if(drone.serialNumber === droneobj.serialNumber) {
        dronelist[index] = droneobj;
    }
});
}
function updatePilotList(pilotobj){ //same idea as the above function, but now updating pilot info
  violatingPilots.forEach((pilot,index) => {
    if(pilot.phoneNumber === pilotobj.phoneNumber){
      violatingPilots[index] = pilotobj;
    }
  })
}

function calculateDistanceFromNest(drone){
  //a mathematical function to calcluate difference between points. Used in the insideNDZCircle function to determine if a drone is violating the NDZ
  let x_c = 250000.0; // point (250 000, 250 000) is where the nest is located 
  let y_c =250000.0;
  
  let y_p = parseFloat(drone.positionY); //drone's coordinates
  let x_p = parseFloat(drone.positionX);

  return Math.round(Math.sqrt( Math.pow((x_p - x_c),2) + Math.pow((y_p - y_c),2) ),0);
}
function insideNDZcircle(drone){
/*
The NDZ is a circle whose center is at (x_c, y_z),
where x_c = 250000.0 and y_c = 2500000.0 and has a radius r of 100m.

A drone has a position described with coordinates x and y. These x and y coordinates
make a point in space (x_p, y_p). This point has a distance d from the center point where
d = sqrt( (x_p - x_c)^2 + (y_p - y_c)^2 ).

The point, and therefore also the location of the drone is inside the circle, when
d < r
and on the circle when
d = r.

source:
https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle

This function return true if the drone is inside or on the circle.
*/
let r = 100000.0; //radius 100m

let d = calculateDistanceFromNest(drone);

return ((d<=r)); //point is inside or on the circle if d < r or d == r

}

 async function getPilotInfoFrom (drone){
  //This function fetches pilot information from a pre-determined URL using a drone's serial number. This function also waits for response 
  const serialNumber = drone.serialNumber;
  const url = pilotInfoBaseURL+serialNumber;
  const timestamp = drone.timestamp.toString().substring(11,16)
  
  //console.log('timestamp'+timestamp);
  
  try {
    const response = await axios.get(url)
    .then(res => {
        let pilot = {
          name:res.data.firstName.toString() +" " +res.data.lastName.toString(),
          email:res.data.email.toString(),
          phoneNumber:res.data.phoneNumber.toString(),
          distance:(calculateDistanceFromNest(drone)/1000),
          violationTime: timestamp
        }
      
        if(pilot != null && pilot !== "undefined"){ //avoiding null pointers
          if(violatingPilots.some(p => p.phoneNumber=== pilot.phoneNumber)){ //avoiding duplicates
            updatePilotList(pilot); //updates pilot info if phone number matches
            try {
              updatePilotInfoDatabase(pilot); //update the database also
            } catch (error) {
              console.log('error updating db');
              
            }
            
          }else{ //if the pilot doesnt exist yet, add it to the list of pilots and post it to the database
            violatingPilots.push(pilot);
            try {
              postPilotToDatabase(pilot);
            } catch (error) {
              console.log('error pushing to db');
            }
          }
          
        }
        
    })
  } catch (error) {
    console.log("error getting pilot info:"+error);
    
  }

}

  function getViolatingDrones(){
    //Loop through get drones -list and check each drone if they are violating the NDZ.
    try {
      drones.forEach(drone =>{
        if(insideNDZcircle(drone)){
          if(foundDuplicate(violatingDrones,drone)){ //if the drone is already in our violating list, it's probably because it has moved, so just update its pos.
            updateValues(violatingDrones,drone);
            getPilotInfoFrom(drone);
          }else{
            violatingDrones.push(drone); //otherwise, add it to the list
            getPilotInfoFrom(drone);
          } 
      }
      });
      
    } catch (error) {
      console.log('error in getViolatingDrones'+error);
      
    }
    
}
function postPilotToDatabase(targetPilot){ //posts pilot info to database
  const pilot = new Pilot({
    name:targetPilot.name,
    email:targetPilot.email,
    phoneNumber:targetPilot.phoneNumber,
    distance:targetPilot.distance,
    violationTime:targetPilot.violationTime,
    createdAt:new Date()
  })


  pilot.save().then(result =>{
    //console.log('pilot saved to db');
  });
}

function updatePilotInfoDatabase(targetPilot){ //updates pilot info to database
const filter ={name:targetPilot.name};
const update = {distance: targetPilot.distance,violationTime:targetPilot.violationTime};
const options = {new:false};
 Pilot.findOneAndUpdate(filter,update,options);
}


const PORT = process.env.PORT || "8080"; //port for the web server
const app = express(); //using express library to make the server


app.use(express.static(path.resolve(__dirname, 'frontend/build'))); //serve frontend static files
app.use(cors());

app.get("/api",(req,res) => {
  res.send("<h1>Empty page</h1>");
})

app.get('/api/pilots',(req,res) => {
  //console.log(violatingPilots);
  getDrones().then(getViolatingDrones()).then( //retrieves drone and violatingdrone data in orderder to get the latest pilot data
  Pilot.find({}).then(pilots => { //retrieve pilot info from the database 
    res.json({"violatingPilots":pilots})
  }))
})

app.get('*',(req,res) => {
  //console.log(__dirname);
  //any requests wihout /api will be served with front end page
  res.sendFile(path.resolve(__dirname,'frontend/build','index.html'));
})

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
