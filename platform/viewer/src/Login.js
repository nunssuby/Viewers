import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
import axios from 'axios';
import jwt_decode from 'jwt-decode'


class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  parseToken = (tk) => {
    let tokenData = {}
    try {
      tokenData = jwt_decode(tk)
    } catch (error) {
      throw new Error(error)
    }
    return tokenData
  }

  getUserFromAccessToken = (accessToken) => {
    let tokenData = {}
    let user = {}
    tokenData = this.parseToken(accessToken)
    user = {
      jti: tokenData.jti,
      userIdx: tokenData.userIdx,
      userId: tokenData.userId,
      username: tokenData.username,
      iat: tokenData.iat,
      exp: tokenData.exp,
      //profileFileId: tokenData.profileFileId,
    }
    return user
  }

  handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { username, password } = this.state;
      const response = await axios.post('http://grk-backend.medical-lab.co.kr/api/v1/token/', {
        'userId': username,
        'password': password,
      });

      console.log('test message: 로그인 성공:', response.data);
      console.log( response.data.data.accessToken)
      // 로그인 성공 후 처리할 작업을 여기에 추가합니다.
      const accessToken = response.data.data.accessToken
      const refreshToken = response.data.data.refreshToken
      const loginUser = this.getUserFromAccessToken(accessToken)

      localStorage.setItem('saveId', username);
      localStorage.setItem('accessTokenPotal', {
        token: accessToken,
        exp: this.parseToken(accessToken).exp,
      })
      localStorage.setItem('refreshTokenPotal', {
        token: refreshToken,
        exp: this.parseToken(refreshToken).exp,
      })
      localStorage.setItem('loginUserPotal', loginUser)
      localStorage.setItem('isLogin', 'OK');
      // navigate('/project');
    } catch (error) {
      console.error('test message: 로그인 실패:', error);
      // 로그인 실패 처리를 여기에 추가합니다.
    }
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    const { username, password } = this.state;
    const handleSubmit = () =>{
    }

    const errors = {'id':  'false'}
    // const isSubmitting = 'disabled'

    return (
      <section className="h-full gradient-form bg-black md:h-screen">
      <div className="w-full py-12 px-12 h-full">
        <div className="flex justify-center items-center flex-wrap h-full g-6  text-white">
          <div className="w-80">
            <div className="lg:flex-wrap g-0">
              <div className="text-center">
                <h4 className="text-2xl font-semibold mt-1 mb-4 pb-1">LOGIN</h4>
              </div>
              <form onSubmit={this.handleLogin}>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control block w-full px-3 py-2 text-base font-normal text-gray-300 bg-gray-900 bg-clip-padding border border-solid border-gray-800 rounded transition ease-in-out m-0 focus:text-gray-300 focus:bg-gray-800 focus:border-cyan-600 focus:outline-none"
                    name="username"
                    value={username}
                    onChange={this.handleChange}
                    // {...register('id', {
                    //   required: '아이디를 입력바랍니다.',
                    // })}
                  />
                  {errors.id && (
                    <small className="mt-2 text-red-600" role="alert">
                      {errors.id.message}
                    </small>
                  )}
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    className="form-control block w-full px-3 py-2 text-base font-normal text-gray-300 bg-gray-900 bg-clip-padding border border-solid border-gray-800 rounded transition ease-in-out m-0 focus:text-gray-300 focus:bg-gray-800 focus:border-cyan-600 focus:outline-none"
                    name="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={this.handleChange}
                    // {...register('password', {
                    //   required: '비밀번호는 필수 입력입니다.',
                    //   minLength: {
                    //     value: 8,
                    //     message: '8자리 이상 비밀번호를 사용하세요.',
                    //   },
                    // })}
                  />
                  {errors.password && (
                    <small className="mt-2 text-red-600" role="alert">
                      {errors.password.message}
                    </small>
                  )}
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="form-group form-check">
                    <input
                      type="checkbox"
                      className="form-check-input appearance-none h-4 w-4 border border-gray-800 rounded-sm bg-gray-900 checked:bg-primary-light checked:border-cyan-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                      id="exampleCheck2"
                      // {...register('saveId')}
                    />
                    <label
                      className="form-check-label inline-block text-white text-sm"
                      htmlFor="exampleCheck2"
                    >
                      Remember ID
                    </label>
                  </div>
                  <a
                    href="#!"
                    className="text-white underline underline-offset-1 text-sm"
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="text-center lg:text-left">
                  <button
                    type="submit"
                    className="inline-block w-full px-7 py-3 bg-primary-light text-gray-900 font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-primary-light hover:shadow-lg focus:bg-primary-light focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-light active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Login
                  </button>
                  <p className="text-base mt-6 pt-1 mb-0 text-center">
                    Don't have an account?
                    <a
                      href="#!"
                      className="text-primary-light ml-4 underline hover:text-primary-light focus:text-primary-light transition duration-200 ease-in-out"
                    >
                      Sing Up
                    </a>
                  </p>
                </div>
                {/* <div className="mt-48  flex justify-center">
                  <Svg
                    name="logo-ohif"
                    style={{ width: '180px', height: '40px' }}
                  />
                </div> */}
              </form>
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
)(Login);

export default ViewerbaseDragDropContext(
  withRouter(ConnectedLogin)
);
