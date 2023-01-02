import React from 'react'
import { useState,useEffect } from 'react'

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
    <div>
      <div>
      {(typeof pilotData.violatingPilots ==='undefined') ? (
        <p>loading...</p>
      ):(
        pilotData.violatingPilots.filter(pilot => pilot != null).map(pilot => (
          <div key={pilot.name}>
            <p>{`
                name: ${pilot.name}
                phone number: ${pilot.phoneNumber}
                email: ${pilot.email}
                `}
                
                </p>
          </div>
        ))
      )}
      </div>

    </div>
  )
}
