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
  const callback = payload => { //callback function to retrieve data from child component
    setNewFilter(payload);
  }

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
function DisplayPilots(props) {
  const [pilotData,setPilotData] = useState([])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log('Connected to server');
    };
    ws.onmessage = (event) => {
      //console.log('Received: ', event.data);
      const jsonData = JSON.parse(event.data);
      setPilotData(jsonData);
    };
    return () => {
      ws.close();
    };
  }, []);
    
return (
  
  <div style={{padding:1,borderStyle:"solid"}}>
    
    <h2 style={{textAlign:"center",backgroundColor:"#072a58"}}>
        Violating pilots:
      </h2>
  
  

  <div style={{textAlign:"center",overflowY:"scroll",height:"91vh"}}>
    
    <div>
    {(typeof pilotData ==='undefined'||pilotData.length<1) ? (
      <SpinnerLoading/> //if there is nothing to show, show a spinner
    ):(
      showFilteredPilots(props.filterData)
    )}
    </div>

  </div>
  </div>
)

function showFilteredPilots(filterData) {
  let filter = filterData;
  if(filterData==="undefined"||filterData===""){ //avoiding errors. We must always have some filter to sort
    filter="distance"
  }
  //console.log('currentminutes'+currentMinutes);
  
  return sortedPilotsBy(filter).map(pilot => ( //sort the list, then display
    <div key={pilot.id}>
      <p>
        {`Offender's name: ${pilot.name}`}
        <br />
        {`Phone number: ${pilot.phoneNumber}`}
        <br />
        {`Email address: ${pilot.email}`}
        <br />
        {`Drone's distance from nest: ${pilot.distance} meters`}
        <br />
        {`Time of violation: ${pilot.violationTime}`}
      </p>
    </div>
  ))
}

function sortedPilotsBy(filterData){
  //pilotlist sorting logic, returns a list of pilots
  const pilotlist =pilotData;
  if(filterData==="name"||filterData==="distance"||filterData==="time"){
    switch (filterData) {
      case "name":
        return pilotlist.sort((a,b) => (a.name > b.name) ? 1:-1); //sort by name
      case "distance":
        return pilotlist.sort((a,b) => (a.distance > b.distance) ? 1:-1); //sort by distance to the nest
      case "time":
        return pilotlist.sort((a,b) => (a.violationTime > b.violationTime) ? 1:-1).reverse(); //sort by time of violation
      default:
        return pilotlist.sort((a,b) => (a.distance > b.distance) ? 1:-1); //default option is to sort by distance
    }
    
  }else{
    //if the filterdata variable is not one of the three sorting types, it has to be a search filter
    //return a new list inlucing only the pilots who's name includes the search filter
    return pilotlist.filter(pilot => pilot.name.toLocaleLowerCase().includes(filterData)); 
  }
 
  
}
}
//******DisplayPilots Component***************/

//******MainNavBar Component***************/
function MainNavbar({callback}) {
  //navbar component that can be used for sorting pilot list and searching for specific pilots 
  const [newSearchFilter,setNewSearchFilter] = useState("");
  /*handleCallback sends sorting/search filter to parent component (App), 
    to be send forward to the displayer component. It accepts a string as a parameter
    which is either one of the three sorting options or a string of characters that could
    exist in a pilots name
  */

  const handleCallback = (value) => callback(value); 
  
  useEffect(() => {
    handleCallback(newSearchFilter);
 },[newSearchFilter]);

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
              placeholder="Search by name"
              className="me-2"
              aria-label="Search"
              onChange={(event) => setNewSearchFilter(event.target.value.toLocaleLowerCase())}
              value={newSearchFilter}
            />
            
            <Button onClick={()=>handleCallback(newSearchFilter)}>Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

//******MainNavBar Component***************/
