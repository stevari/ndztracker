import React from 'react'
import { useState,useEffect } from 'react'

export default function DisplayAll() { //retrieves all drones from the latest snapshot
    const [allDronesData,setallDronesData] = useState([{}])

    useEffect(() => {
        fetch("api/drones")
        .then(
          response => response.json() //Handle errors!
        )
        .then(
          data => {
            setallDronesData(data)
          }
        )
      },[])

  return (
    <div>
      <div>
      {(typeof allDronesData.drones ==='undefined') ? (
        <p>loading...</p>
      ):(
        allDronesData.drones.map(drone => (
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
