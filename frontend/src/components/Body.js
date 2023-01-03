import React from 'react'

import DisplayAll from "./DisplayAll"
import DisplayPilots from "./DisplayPilots"
import DisplayViolatingDrones from './DisplayViolatingDrones'

export default function Body
() {
  return (
    <div>
        <h2>
        All drones listed:
      </h2>
        <DisplayAll/>
      <h2>
        Violating drones listed:
      </h2>
        <DisplayViolatingDrones/>
        <h2>
          Violating pilots:
        </h2>
        <DisplayPilots/>
    </div>
  )
}
