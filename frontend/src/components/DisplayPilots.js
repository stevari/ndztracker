import React from 'react'
import { useState,useEffect } from 'react'
import SpinnerLoading from './SpinnerLoading'

export default function DisplayPilots() {
    const [pilotData,setpilotData] = useState([{}])

    async function fetchData() {
      fetch("api/pilots")
        .then(
          response => {
            if(!response.ok){
              alert("Network error when fetching data, please try again later. Response status: "+response.status);
            }else{
              return response.json()
            }
            
          }
        )
        .then(
          data => {
            if(data !== undefined){
              setpilotData(data)
            }
            
          }
        )
    }

    useEffect(() => { //retrieves data periodically and sets the retrieved data to a statevariable called pilotData 
      const interval = setInterval(() => {
        fetchData();
      }, 10000);
        return () => clearInterval(interval);
      },[])
      
  return (
    <div style={{padding:1,borderStyle:"solid"}}>
      <h2 style={{textAlign:"center",backgroundColor:"#072a58"}}>
          Violating pilots:
        </h2>
    
    

    <div style={{textAlign:"center",overflowY:"scroll",height:"91vh"}}>
      
      <div>
      {(typeof pilotData.violatingPilots ==='undefined'||pilotData.violatingPilots.length<1) ? (
        <SpinnerLoading/> //if there is nothing to show, show a spinner
      ):(
        pilotData.violatingPilots.filter(pilot => pilot != null).map(pilot => (
          <div key={pilot.name}>
            <p >
              {`Offender's name: ${pilot.name}`}
              <br/>
              {`Phone number: ${pilot.phoneNumber}`}
              <br/>
              {`Email address: ${pilot.email}`}
              <br/>
              {`Drone's distance from nest: ${pilot.distance} meters`}
              <br/>
              {`Time of violation: ${pilot.violationTime} `}
                </p>
          </div>
        ))
      )}
      </div>

    </div>
    </div>
  )
}


