import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// const navigate = useNavigate();   /////////////////////////////
const Login = () => {
  const [studyObj, setStudyObj] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const goStudy = oid => {
    this.navigate(`/${oid}/subjectlist`);
    console.log(oid, '스터디 목록 눌림');
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
    // (!token)?
    // // this.navigate('/login'):
    // console.log("!!!!!!!!!!!!!!!!!!no token"):
    <section className="bg-black  md:h-screen">
      <div className="flex flex-row items-center bg-black border-b border-gray-900 z-20 sticky top-0 justify-between">
        <div className="flex justify-between flex-1  container py-4  m-auto">
          <div className="flex items-center">
            <div className="inline-flex items-center mr-3">
              <div className="ml-4">
                {/* <Svg
                    name="logo-ohif"
                    style={{ width: '180px', height: '40px' }}
                  /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container relative flex flex-col m-auto">
        <div className="mt-10 py-5 border-b border-gray-900">
          <h3 className="text-white text-bold text-2xl">Study List</h3>
          <p className="text-white text-bold text-base mt-2">
            {studyObj.length}{' '}
            <span className="text-primary-light ml-2">Studys</span>
          </p>
        </div>
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8 mt-5">
          <div className="py-4 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-lg">
              <table className="min-w-full text-center ">
                <thead className="border-b bg-gray-900 border-primary-light">
                  <tr>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4 text-left"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4"
                    >
                      Start
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4"
                    >
                      End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studyObj.map((row, index) => (
                    <tr
                      key={index}
                      className="bg-gray-800 cursor-pointer hover:bg-secondary-main"
                      onClick={() => this.goStudy(row.oid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {index + 1}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap text-left">
                        {row.studyName}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                        {row.studyDescription}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                        {row.startDate}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                        {row.endDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
