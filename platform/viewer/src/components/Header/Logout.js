import './Logout.css';
import React from 'react';

const logout = () => {
  sessionStorage.removeItem('accessTokenPotal');
  sessionStorage.removeItem('refreshTokenPotal');
  sessionStorage.removeItem('loginUserPotal');
  sessionStorage.setItem('isLogin', false);
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
