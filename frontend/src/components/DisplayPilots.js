import React from 'react'
import { useState,useEffect } from 'react'
import SpinnerLoading from './SpinnerLoading'

export default function DisplayPilots() {
    const [pilotData,setpilotData] = useState([{}])
    useEffect(() => {
        fetch("api/pilots")
        .then(
          response => response.json() 
        )
        .then(
          data => {
            setpilotData(data)
          }
        )
      },[])
  return (
    <div style={{textAlign:"center"}}>
      <h2>
          Violating pilots:
        </h2>
      <div>
      {(typeof pilotData.violatingPilots ==='undefined') ? (
        <SpinnerLoading/>
      ):(
        pilotData.violatingPilots.filter(pilot => pilot != null).map(pilot => (
          <div key={pilot.name}>
            <p>
              {`Offender's name: ${pilot.name}`}
              <br/>
              {`Phone number: ${pilot.phoneNumber}`}
              <br/>
              {`Email address: ${pilot.email}`}
              <br/>
              {`Drone's distance from nest: ${pilot.distance}`}
                </p>
          </div>
        ))
      )}
      </div>

    </div>
  )
}
