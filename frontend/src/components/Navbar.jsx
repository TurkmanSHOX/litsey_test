import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Educational Platform</h1>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;