import './OHIFLogo.css';

import { Icon } from '@ohif/ui';
import React from 'react';
const logout = () => {
  localStorage.removeItem('accessTokenPotal');
  localStorage.removeItem('refreshTokenPotal');
  localStorage.removeItem('loginUserPotal');
  localStorage.removeItem('saveId');
  localStorage.setItem('isLogin', false);
  window.location.assign('/login');
};
function OHIFLogo() {
  return (
    <div>
      <span className="header-brand">
        <Icon name="ohif-logo" className="header-logo-image" />
        {/* Logo text would fit smaller displays at two lines:
         *
         * Open Health
         * Imaging Foundation
         *
         * Or as `OHIF` on really small displays
         */}
        <Icon name="ohif-text-logo" className="header-logo-text" />
      </span>
      <a href="#" className="logout" onClick={() => logout()}>
        logout
      </a>
    </div>
  );
}

export default OHIFLogo;
