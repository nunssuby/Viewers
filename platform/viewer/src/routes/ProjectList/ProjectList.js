import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Svg } from '@ohif/ui';

function ProjectList() {
  const navigate = useNavigate();

  // Set body style
  useEffect(() => {
    const isLogin = localStorage.getItem('isLogin');
    if (isLogin != 'OK') {
      navigate('/login');
    }

    document.body.classList.add('bg-black');
    return () => {
      document.body.classList.remove('bg-black');
    };
  }, []);

  const goStudy = () => {
    navigate('/');
  };

  return (
    <section className="bg-black  md:h-screen">
      <div className="flex flex-row items-center bg-black border-b border-gray-900 z-20 sticky top-0 justify-between">
        <div className="flex justify-between flex-1  container py-4  m-auto">
          <div className="flex items-center">
            <div className="inline-flex items-center mr-3">
              <div className="ml-4">
                <Svg
                  name="logo-ohif"
                  style={{ width: '180px', height: '40px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container relative flex flex-col m-auto">
        <div className="mt-10 py-5 border-b border-gray-900">
          <h3 className="text-white text-bold text-2xl">Project List</h3>
          <p className="text-white text-bold text-base mt-2">
            3<span className="text-primary-light ml-2">Projects</span>
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
                      Title
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-white px-6 py-4"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="bg-gray-800 cursor-pointer hover:bg-secondary-main"
                    onClick={goStudy}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      1
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap text-left">
                      GRK Medical Lab Demo Project
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                      Nov. 01 2022
                    </td>
                  </tr>
                  <tr
                    className="bg-gray-900 cursor-pointer hover:bg-secondary-main"
                    onClick={goStudy}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      2
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap text-left">
                      Quantitative Measurement of Hepatocellular Carcinoma
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                      Oct. 27 2022
                    </td>
                  </tr>
                  <tr
                    className="bg-gray-800 cursor-pointer hover:bg-secondary-main"
                    onClick={goStudy}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      3
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap text-left">
                      Imaging-Based Diagnostic System
                    </td>
                    <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                      Sep. 11 2022
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectList;
