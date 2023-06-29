import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode'

class ProjectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
    };
  }

  // navigate = useNavigate();
  goStudy = () => {
    // this.navigate('/');
    console.log("목록 눌림");
  };

  test_data = [
    {"title": "GRK Medical Lab Demo Project", "Date": "Nov. 01 2022"},
    {"title": "GRK Medical Lab Demo Project", "Date": "Nov. 02 2022"},
    {"title": "GRK Medical Lab Demo Project", "Date": "Nov. 03 2022"},
    {"title": "GRK Medical Lab Demo Project", "Date": "Nov. 06 2022"},
  ]

  get_study_list = () =>{
    const accessTokenPotal = localStorage.getItem('accessTokenPotal');
    const refreshToken = localStorage.getItem('refreshToken');
  }

  fetchData = async () => {
    try {
      const userToken = localStorage.getItem("accessTokenPotal");
      console.log(userToken);
      console.log(`Bearer ${userToken}`);
      const response = await axios.get('http://grk-backend.medical-lab.co.kr/api/v1/study', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  render() {
    const { token } = this.state;
    this.fetchData();
    return (
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
            <h3 className="text-white text-bold text-2xl">Project List</h3>
            <p className="text-white text-bold text-base mt-2">
              {this.test_data.length}<span className="text-primary-light ml-2">Projects</span>
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
                    {this.test_data.map((row, index) => (
                      <tr
                      key = {index}
                      className="bg-gray-800 cursor-pointer hover:bg-secondary-main"
                      onClick={this.goStudy}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {index+1}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap text-left">
                        {row.title}
                      </td>
                      <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                        {row.Date}
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
  }
}

const mapStateToProps = state => {
  return {
    user: state.oidc.user,
  };
};


const ConnectedLogin = connect(
  mapStateToProps,
  null
)(ProjectList);

export default ViewerbaseDragDropContext(
  withRouter(ConnectedLogin)
);
