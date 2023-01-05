import React from 'react'
import { useEffect } from 'react'
import DisplayPilots from "./DisplayPilots"
//get and display only pilot data
export default function Body
() {
  useEffect(() => {
    fetch("api/drones")
    .then(
      fetch("api/violatingdrones")
    )
  },[])
  return (
    <div style={{height:"100vh"}}>
        <DisplayPilots/>
    </div>
  )
}
