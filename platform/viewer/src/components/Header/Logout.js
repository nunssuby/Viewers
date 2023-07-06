import './Logout.css';
import React from 'react';

const logout = () => {
  localStorage.removeItem('accessTokenPotal');
  localStorage.removeItem('refreshTokenPotal');
  localStorage.removeItem('loginUserPotal');
  localStorage.setItem('isLogin', false);
  window.location.assign('/login');
};

function Logout() {
  return (
    <a href="#" className="logout" onClick={() => logout()}>
      Logout
    </a>
  );
}

export default Logout;
