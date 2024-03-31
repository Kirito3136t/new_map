import React from 'react';
import Analytics from './components/Analytics';
import Cards from './components/Cards';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Newsletter from './components/Newsletter';
import Maps from './components/Maps';
import All from './components/All';
import RealtimeData from './components/About';
import 'bootstrap/dist/css/bootstrap.min.css';
//import Signup from './components/Signup';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import About from './components/About';
import Signup from './components/Signup';

function App() {
  return (
    <div>
      {/* <Navbar />
      <Hero />
      <Analytics />
      <Newsletter />
      <Cards />
      <Footer /> */}
      <Router>
        <Routes>
          <Route path="/" element={<All />}></Route>
          <Route path="/maps" element={<Maps />}></Route>
          <Route path="/Signup" element={<Signup />}></Route>
          <Route path="/about" element={<RealtimeData />}></Route>
        </Routes>
      </Router>
      {/* <Maps /> */}
    </div>
  );
}

export default App;
