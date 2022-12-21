import axios from 'axios';
import xml2js from "xml2js";



async function getDrones() { 
  //this function retrieves xml data from a source, parses the xml into json and creates objects from json
  //then returns a list of these created objects

  var parser = new xml2js.Parser(); //init xml to json parser
  const droneList = []; //init empty list of drones
  axios.get('https://assignments.reaktor.com/birdnest/drones').then(res =>{ //retrieve xml data from source
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
  
  return droneList;

}

function insideNDZcircle(droneObject){
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

This function return true if the drone is inside or on the circle.
*/

}
 function main(){
  var drones =getDrones();

  setTimeout(function(){ //wait until getDrones() has done it's job. 
    console.log(drones);
  },700)
  
}

main();
