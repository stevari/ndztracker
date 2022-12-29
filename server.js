import axios from 'axios';
import xml2js from "xml2js";
import express from 'express';


const dronePositionsURL = 'https://assignments.reaktor.com/birdnest/drones'; //URL for drone positions data
const pilotInfoBaseURL = 'https://assignments.reaktor.com/birdnest/pilots/'; //base URL for "national drone registry endpoint" to fecth pilot info using drone's serial no.
const violatingPilots = [];
 function getDrones() { 
  //this function retrieves xml data from a source, parses the xml into json and creates objects from json
  //then returns a list of these created objects

  var parser = new xml2js.Parser(); //init xml to json parser
  const droneList = []; //init empty list of drones
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
  
          droneList.push(droneObject); 
          
        });
       });
  
      }); //pearser.parseString()
      //console.log(droneList);
      
    }); //axios.get()
    
  } catch (error) {
    console.log(error);
    
  }
  
  return droneList;
  
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
        if(pilot != null){
          violatingPilots.push(pilot);
        }
        
    })
  } catch (error) {
    console.log(error);
    
  }

}

  function getViolatingDrones(){
  var drones =[];
  drones = getDrones();

  const violatingDronesList =[];

  setTimeout(function(){ //wait until getDrones() has done it's job. 
    //console.log(drones);
    //Loop through get drones -list and check each drone if they are violating the NDZ.
    drones.forEach(drone =>{
      //console.log(`new drone, serialnumber: ${drone.serialNumber}, positionY:${drone.positionY}, positionX:${drone.positionX}`);
       //if a drone is violating the NDZ, add it to violators list to be later matched with their owner
      if(insideNDZcircle(drone)){ 
      violatingDronesList.push(drone);
      violatingPilots.push(getPilotInfoFrom(drone));
      
    }
    });
    //console.log(violatingDronesList);
    //return violatingDronesList;
    
  },400)
  
  return violatingDronesList;
}

const PORT = process.env.PORT || 3001; //port for the web server
const app = express(); //using express library to make the server
//NOTE TO SELF: npm run dev to use nodemon
//Idea is to make RESTful web server

app.get("/api",(req,res) => {
  res.send("<h1>Moi maailma</h1>");
})

app.get("/api/drones",(req,res) => {
  let drones = [];
  drones = getDrones();
  setTimeout(() => {
    res.json({"drones":drones});
  }, 400);
})

app.get('/api/violatingdrones',(req,res) => {
  let violatingDrones = [];
  violatingDrones = getViolatingDrones();
  setTimeout(() => {
    res.json({"violatingDrones":violatingDrones});
  }, 400);
})

app.get('/api/pilots',(req,res) => {
  console.log(violatingPilots);
  res.json({"violatingPilots":violatingPilots});
})
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
