import React from 'react'
import Body from './components/Body'
import Footer from './components/Footer'
import Header from './components/Header'
import "./App.css"
export default function App() {

  //NOTETOSELF remember to start server before launch

  return (
    <div className='App'>
      <Header/>
      <Body/>
      <Footer/>
    </div>
  )
}
