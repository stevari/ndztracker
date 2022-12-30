import axios from 'axios';
import xml2js from "xml2js";
import express from 'express';


const dronePositionsURL = 'https://assignments.reaktor.com/birdnest/drones'; //URL for drone positions data
const pilotInfoBaseURL = 'https://assignments.reaktor.com/birdnest/pilots/'; //base URL for "national drone registry endpoint" to fecth pilot info using drone's serial no.

const drones = []; //list of all the drones from the most recent snapshot
const violatingDrones = []; //list of drones that violate the NDZ
const violatingPilots = []; //list of piolts that own drones that violate the NDZ

 function getDrones() { 
  //this function retrieves xml data from a source, parses the xml into json and creates objects from json
  //then returns a list of these created objects

  var parser = new xml2js.Parser(); //init xml to json parser

  try {
    axios.get(dronePositionsURL).then(res =>{ //retrieve xml data from source
      parser.parseString(res.data,function(err,result){ //parse to json
      
       var captureObject = result.report.capture;  //json to object
       Object.values(captureObject).forEach(value =>{ //iterate to find drone data
        Object.values(value.drone).forEach(drone => {
  
          let droneObject = { //create a new drone object using retrieved data
            serialNumber:drone.serialNumber.toString(), //serial number to match owner
            positionY:drone.positionY.toString(), //positions as coordinates 
            positionX:drone.positionX.toString()
          };
          //console.log(droneObject)

          /*Avoiding duplicates in the list by checking if a drone exists in the drones list already by using its serial number.
            if it does, update the object's values (coordinates) instead of adding it to the list, otherwise, add to list
          */
          if(foundDuplicate(drones,droneObject)){ 
            //console.log('duplicate!');
            updateValues(drones,droneObject);
          }else{
            drones.push(droneObject); 
          }
        });
       });
  
      }); //pearser.parseString()
      //console.log(droneList);
      
    }); //axios.get()
    
  } catch (error) {
    console.log(error);
    
  }
  
}

function foundDuplicate(dronelist,droneobj){
  return (dronelist.some(d => d.serialNumber === droneobj.serialNumber))
}

function updateValues(dronelist,droneobj){
  dronelist.forEach((drone, index) => {
    if(drone.serialNumber === droneobj.serialNumber) {
        dronelist[index] = droneobj;
    }
});
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
let r = 100000.0;
let x_c = 250000.0;
let y_c =250000.0;


let y_p = parseFloat(drone.positionY);
let x_p = parseFloat(drone.positionX);

let d = Math.sqrt( Math.pow((x_p - x_c),2) + Math.pow((y_p - y_c),2) );

//console.log(d);
return ((d<=r)); //point is inside or on the circle if d < r or d == r

}

function getPilotInfoFrom (drone){
  //This function fetches pilot information from a pre-determined URL using a drone's serial number
  const serialNumber = drone.serialNumber;
  const url = pilotInfoBaseURL+serialNumber;
  try {
    axios
    .get(url)
    .then(res => {
      //console.log(res.data);
        //console.log(`Violator's full name: ${res.data.firstName} ${res.data.lastName}`);
        //console.log(`Email address: ${res.data.email}`);
        //console.log(`Phone number: ${res.data.phoneNumber}`);
        //console.log('--------------------------------------');
        let pilot = {
          name:res.data.firstName.toString() +" " +res.data.lastName.toString(),
          email:res.data.email.toString(),
          phoneNumber:res.data.phoneNumber.toString()
        }
        if(pilot != null && pilot !== "undefined"){ 
          if(!violatingPilots.some(p => p.name === pilot.name)){ //avoiding duplicates
            violatingPilots.push(pilot);
          }
          
        }
        
    })
  } catch (error) {
    console.log(error);
    
  }

}

  function getViolatingDrones(){
    //Loop through get drones -list and check each drone if they are violating the NDZ.
    try {
      drones.forEach(drone =>{
        if(insideNDZcircle(drone)){
          if(foundDuplicate(violatingDrones,drone)){ 
            //console.log('duplicate!');
            updateValues(violatingDrones,drone);
            getPilotInfoFrom(drone);
          }else{
            violatingDrones.push(drone); 
            getPilotInfoFrom(drone);
          } 
      }
      });
      
    } catch (error) {
      console.log('err'+error);
      
    }
    
}

const PORT = process.env.PORT || 3001; //port for the web server
const app = express(); //using express library to make the server
//NOTE TO SELF: npm run dev to use nodemon
//Idea is to make RESTful web server

app.get("/api",(req,res) => {
  res.send("<h1>Moi maailma</h1>");
})

app.get("/api/drones",(req,res) => {
  getDrones();
  setTimeout(() => {
    res.json({"drones":drones});
  }, 500);
})

app.get('/api/violatingdrones',(req,res) => {
  getViolatingDrones();
  setTimeout(() => {
    res.json({"violatingDrones":violatingDrones});
  }, 700);
})

app.get('/api/pilots',(req,res) => {
  console.log(violatingPilots);
  res.json({"violatingPilots":violatingPilots});
})
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
