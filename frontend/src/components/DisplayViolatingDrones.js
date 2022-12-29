import React from 'react'
import { useState,useEffect } from 'react'

export default function DisplayViolatingDrones() {
    const [violatingDronesData,setviolatingDronesData] = useState([{}])

    useEffect(() => {
        fetch("api/violatingdrones")
        .then(
          response => response.json() 
        )
        .then(
          data => {
            setviolatingDronesData(data)
          }
        )
      },[])
  return (
    <div>
      <div>
      {(typeof violatingDronesData.violatingDrones ==='undefined') ? (
        <p>loading...</p>
      ):(
        violatingDronesData.violatingDrones.map(drone => (
          <div key={drone.serialNumber}>
            <p>{`drone serial number: ${drone.serialNumber} 
                positionY: ${drone.positionY}
                positionX: ${drone.positionX}`}</p>
          </div>
        ))
      )}
      </div>

    </div>
  )
}
