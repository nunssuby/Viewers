import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
import axios from 'axios';
import './grkStudyList.css';
import OHIFLogo from '../components/OHIFLogo/OHIFLogo.js';
import Logout from '../components/Header/Logout.js';

let haveToken = false;
const Login = () => {
  const [studyObj, setStudyObj] = useState([]);
  useEffect(() => {
    checkToken();
    fetchData();
  }, []);

  const goStudy = oid => {
    sessionStorage.setItem('studyOid', oid);
    window.location.assign(`/${oid}/subjectlist`);
  };

  const checkToken = async () => {
    const accessToken = sessionStorage.getItem('accessTokenPotal');
    if (!accessToken) {
      window.location.assign('./login');
    }
  };

  const fetchData = async () => {
    try {
      const accessTokenPotal = JSON.parse(
        sessionStorage.getItem('accessTokenPotal')
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
      <div className="entry-header header-big">
        <div className="header-left-box">
          <div className="logo-box">{OHIFLogo()}</div>
        </div>
        {Logout()}
      </div>
      <div className="container">
        <div className="table-top">
          <h3 className="title">Study List</h3>
          <p className="condition">
            {studyObj.length}{' '}
            <span className="condition-highlight">Studies</span>
          </p>
        </div>
        <table>
          <colgroup>
            <col width="8%" />
            <col width="15%" />
            <col width="" />
            <col width="20%" />
            <col width="20%" />ㅖ
          </colgroup>
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
                <td className="study name">{row.studyName}</td>
                <td className="study description">{row.studyDescription}</td>
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
