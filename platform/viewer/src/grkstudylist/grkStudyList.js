import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
import axios from 'axios';
import './grkStudyList.css';
import OHIFLogo from '../components/OHIFLogo/OHIFLogo.js';

const Login = () => {
  const [studyObj, setStudyObj] = useState([]);
  useEffect(() => {
    checkToken();
    fetchData();
  }, []);

  const goStudy = oid => {
    window.location.assign(`/${oid}/subjectlist`);
  };

  const logout = () => {
    localStorage.removeItem('accessTokenPotal');
    localStorage.removeItem('refreshTokenPotal');
    localStorage.removeItem('loginUserPotal');
    localStorage.removeItem('saveId');
    localStorage.setItem('isLogin', false);
    window.location.assign('./login');
  };
  const checkToken = async () => {
    const accessToken = localStorage.getItem('accessTokenPotal');
    if (!accessToken) {
      window.location.assign('./login');
    }
  };

  const fetchData = async () => {
    try {
      const accessTokenPotal = JSON.parse(
        localStorage.getItem('accessTokenPotal')
      );
      const response = await axios.get(
        'http://grk-backend.medical-lab.co.kr/api/v1/study',
        {
          headers: {
            Authorization: `Bearer ${accessTokenPotal.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setStudyObj(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section>
      <div className="header">
        <div className="logo-box">{OHIFLogo()}</div>
      </div>
      <p>
        <a href="#" className="logout" onClick={() => logout()}>
          logout
        </a>
      </p>
      <div className="container">
        <div>
          <h3 className="title">Study List</h3>
          <p className="condition">
            {studyObj.length}{' '}
            <span className="condition-highlight">Studies</span>
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Start</th>
              <th scope="col">End</th>
            </tr>
          </thead>
          <tbody>
            {studyObj.map((row, index) => (
              <tr
                key={index}
                className="study line"
                onClick={() => goStudy(row.oid)}
              >
                <td className="study number">{index + 1}</td>
                <td className="study name left">{row.studyName}</td>
                <td className="study description left">
                  {row.studyDescription}
                </td>
                <td className="study start">{row.startDate}</td>
                <td className="study end">{row.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Login;
