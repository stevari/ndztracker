import React from 'react'

import DisplayAll from './components/DisplayAll'
import DisplayPilots from './components/DisplayPilots'
import DisplayViolatingDrones from './components/DisplayViolatingDrones'



export default function App() {

  //NOTETOSELF remember to start server before launch

  return (
    <div>
      <h1>
        All drones listed:
      </h1>
        <DisplayAll/>
      <h1>
        Violating drones listed:
      </h1>
        <DisplayViolatingDrones/>
        <h1>
          Violating pilots:
        </h1>
        <DisplayPilots/>
    </div>
  )
}
