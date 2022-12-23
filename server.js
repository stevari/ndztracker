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

console.log(d);
return ((d<=r)); //point is inside or on the circle if d < r or d == r

}
 async function main(){
  var drones =[];
  drones = await getDrones();

  const violatingDronesList =[];

  setTimeout(function(){ //wait until getDrones() has done it's job. 
    //console.log(drones);
    //Loop through get drones -list and check each drone if they are violating the NDZ.
    drones.forEach(drone =>{
      console.log(`new drone, serialnumber: ${drone.serialNumber}, positionX:${drone.positionX}, positionY:${drone.positionY}`);
       //if a drone is violating the NDZ, add it to violators list to be later matched with their owner
      if(insideNDZcircle(drone)){ 
      violatingDronesList.push(drone);
    }
    });
    
   
    //test end
    console.log(violatingDronesList);
  },700)
  
}

main();
/*
pilot info
https://assignments.reaktor.com/birdnest/pilots/SN-B_qzs7sZyE
JSON
{
"pilotId": "P-2t9QnmWzuz",
"firstName": "Michel",
"lastName": "Bauch",
"phoneNumber": "+210400002939",
"createdDt": "2022-11-26T17:21:53.289Z",
"email": "michel.bauch@example.com"
}
*/

/*
drone info
<report>
<deviceInformation deviceId="GUARDB1RD">
<listenRange>500000</listenRange>
<deviceStarted>2022-12-22T11:00:35.166Z</deviceStarted>
<uptimeSeconds>25491</uptimeSeconds>
<updateIntervalMs>2000</updateIntervalMs>
</deviceInformation>
<capture snapshotTimestamp="2022-12-22T18:05:25.864Z">
<drone>
<serialNumber>SN-BW7UW9xmJ2</serialNumber>
<model>Eagle</model>
<manufacturer>MegaBuzzer Corp</manufacturer>
<mac>22:21:9a:39:98:c4</mac>
<ipv4>24.150.81.162</ipv4>
<ipv6>e7b0:ccc1:f531:9a07:5a4a:c167:bd78:9008</ipv6>
<firmware>4.4.1</firmware>
<positionY>137568.8937059248</positionY>
<positionX>112417.92232394806</positionX>
<altitude>4044.869999732763</altitude>
</drone>
<drone>
<serialNumber>SN-U8N2chRY5z</serialNumber>
<model>HRP-DRP 1 Pro</model>
<manufacturer>ProDröne Ltd</manufacturer>
<mac>73:65:7c:7b:ae:26</mac>
<ipv4>111.49.200.154</ipv4>
<ipv6>8bcc:261d:d6af:824e:c499:558f:d48b:a96a</ipv6>
<firmware>2.4.1</firmware>
<positionY>52809.92378230504</positionY>
<positionX>379120.71001164353</positionX>
<altitude>4031.769977714812</altitude>
</drone>
<drone>
<serialNumber>SN-i_oQlL01Bp</serialNumber>
<model>Falcon</model>
<manufacturer>MegaBuzzer Corp</manufacturer>
<mac>b7:f3:a1:1d:d3:13</mac>
<ipv4>131.184.2.70</ipv4>
<ipv6>4b2d:9c75:d946:6e93:7705:b598:9a3b:4128</ipv6>
<firmware>0.5.6</firmware>
<positionY>206397.69213693665</positionY>
<positionX>172738.70309577454</positionX>
<altitude>4205.101635247059</altitude>
</drone>
<drone>
<serialNumber>SN-BZsHLKO45e</serialNumber>
<model>Mosquito</model>
<manufacturer>MegaBuzzer Corp</manufacturer>
<mac>dd:e1:15:35:17:54</mac>
<ipv4>19.192.137.235</ipv4>
<ipv6>b1a4:a9d9:b57c:3750:995b:9146:f1d7:7155</ipv6>
<firmware>1.8.2</firmware>
<positionY>381403.6937000825</positionY>
<positionX>30644.069637430737</positionX>
<altitude>4606.914836908364</altitude>
</drone>
</capture>
</report>

*/