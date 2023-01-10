import React from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {GiDeliveryDrone} from 'react-icons/gi';
import { useState,useEffect } from 'react'
import SpinnerLoading from './components/SpinnerLoading'

import Footer from './components/Footer'
import "./App.css"
export default function App() {
  const [newFilter,setNewFilter] = useState("");
  const callback = payload => {
    setNewFilter(payload);
  }
  //NOTETOSELF remember to start server before launch

  return (
    <div className='App'>
      <MainNavbar callback={callback}/>
      <div style={{height:"100vh"}}>
        <DisplayPilots filterData = {newFilter}/>
      </div>
      <Footer/>
    </div>
  )
}

//******DisplayPilots Component***************/
function DisplayPilots(filterData) {
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
      showFilteredPilots(filterData.filterData)
    )}
    </div>

  </div>
  </div>
)

function showFilteredPilots(filterData) {
  const filter = filterData;
  //console.log('showFilteredPilots called with filter: '+filter);
  
  //return pilotData.violatingPilots.filter(pilot => pilot != null)
  return sortedPilotsBy(filter).map(pilot => (
    <div key={pilot.name}>
      <p>
        {`Offender's name: ${pilot.name}`}
        <br />
        {`Phone number: ${pilot.phoneNumber}`}
        <br />
        {`Email address: ${pilot.email}`}
        <br />
        {`Drone's distance from nest: ${pilot.distance} meters`}
        <br />
        {`Time of violation: ${pilot.violationTime} `}
      </p>
    </div>
  ))
}
 
function sortedPilotsBy(filterData){
  const pilotlist =pilotData.violatingPilots;
  switch (filterData) {
    case "name":
      return pilotlist.sort((a,b) => (a.name > b.name) ? 1:-1);
      //
    case "distance":
      return pilotlist.sort((a,b) => (a.distance > b.distance) ? 1:-1);
      //
    case "time":
      //todo
      return pilotlist.sort((a,b) => (a.violationTime > b.violationTime) ? 1:-1);
    default:
      return pilotlist.sort((a,b) => (a.distance > b.distance) ? 1:-1);
  }
  
  
}
}
//******DisplayPilots Component***************/

//******MainNavBar Component***************/
function MainNavbar({callback}) {
  //const [newFilter,setNewFilter] = useState("");
  const handleCallback = (value) => callback(value);


  return (
    <Navbar className='MainNavbar' variant="dark" style={{backgroundColor:"#05244d"}}>
      <Container>
        <Navbar.Brand href="#home"><h2><GiDeliveryDrone size = "1.5em" style={{padding:1,marginRight:"1vh"}}/>NDZ-Tracker</h2></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
           
            <NavDropdown title="Sort pilots by" id="collasible-nav-dropdown">
              <NavDropdown.Item  onClick={()=>handleCallback("distance")}>Distance</NavDropdown.Item>
              <NavDropdown.Item  onClick={()=>handleCallback("name")}>Name</NavDropdown.Item>
              <NavDropdown.Item  onClick={()=>handleCallback("time")}>Time</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search pilots"
              className="me-2"
              aria-label="Search"
            />
            <Button >Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

//******MainNavBar Component***************/
