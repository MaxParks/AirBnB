// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul>
      <li>
      <NavLink exact to="/" style={{ fontSize: '24px', color: 'red' }}>
    <i className="fa-brands fa-airbnb " style={{ fontSize: '36px', color: 'red' }}></i>
    MaxBnB</NavLink>
      </li>
      {!sessionUser ||(
        <div className="create-spot" >
      <li>
        <NavLink exact to ='/spots/new'><button>Create a New Spot</button></NavLink>
      </li>
      </div>
      )}
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
  );
}

export default Navigation;