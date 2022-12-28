import React from 'react'
import { useState,useEffect } from 'react'



export default function App() {
  const [backendData,setBackendData] = useState([{}])
  //NOTETOSELF remember to start server before launch
  useEffect(() => {
    fetch("/drones")
    .then(
      response => response.json() 
    )
    .then(
      data => {
        setBackendData(data)
      }
    )
  },[])

  return (
    <div>
      {(typeof backendData.drones ==='undefined') ? (
        <p>loading...</p>
      ):(
        backendData.drones.map(drone => (
          <div key={drone.serialNumber}>
            <p>{`drone serial number: ${drone.serialNumber} 
                positionY: ${drone.positionY}
                positionX: ${drone.positionX}`}</p>
          </div>
        ))
      )}
    </div>
  )
}
