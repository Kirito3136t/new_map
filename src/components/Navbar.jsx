import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [nav, setNav] = useState(false);

  const navigate = useNavigate();

  const handleAbout = () => {
    navigate('/Signup');
  };

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white'>
      <h1 className='w-full text-3xl font-bold text-[#00df9a]'>RIDE-SAFE.</h1>
      <ul className='hidden md:flex'>
        {/* Other menu items */}
        <li>
          <button
            className='p-4 focus:outline-none'
            onClick={handleAbout}
          >
            Admin
          </button>
        </li>
        {/* Other menu items */}
      </ul>
      <div onClick={handleNav} className='block md:hidden'>
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>
      <ul
        className={
          nav
            ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500'
            : 'ease-in-out duration-500 fixed left-[-100%]'
        }
      >
        <h1 className='w-full text-3xl font-bold text-[#00df9a] m-4'>RIDE-SAFE.</h1>
        {/* Other menu items */}
      </ul>
    </div>
  );
};

export default Navbar;
