import React from 'react';
import Typed from 'react-typed';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate('/maps');
  };

  return (
    <div className="text-white bg-black"> {/* Add the bg-black class here */}
      <div className="max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center">
        <p className="text-[#00df9a] font-bold p-2">FROM PITS TO PERFECTION!</p>
        <h1 className="md:text-7xl sm:text-6xl text-4xl font-bold md:py-6">
          Paving the Way to Smoother Roads.
        </h1>
        <div className="flex justify-center items-center">
          <p className="md:text-5xl sm:text-4xl text-xl font-bold py-4">
            Safe, secure travelling for
          </p>
          <Typed
            className="md:text-5xl sm:text-4xl text-xl font-bold md:pl-4 pl-2"
            strings={["Bikes", "Cars", "Trucks"]}
            typeSpeed={120}
            backSpeed={140}
            loop
          />
        </div>
        <p className="md:text-2xl text-xl font-bold text-gray-500">
          Promote safe driving practices for Personal Vehicles, Commercial Fleets, and Public Transportation
        </p>
        <Link to="/maps">
          <button className="bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black" onClick={handleNavigation}>
            Pothole Traffic
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
