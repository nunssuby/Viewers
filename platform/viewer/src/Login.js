import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ViewerbaseDragDropContext } from '@ohif/ui';
import { withRouter } from 'react-router';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import './Login.css';
import OHIFLogo from './components/OHIFLogo/OHIFLogo.js';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  parseToken = tk => {
    let tokenData = {};
    try {
      tokenData = jwt_decode(tk);
    } catch (error) {
      throw new Error(error);
    }
    return tokenData;
  };

  getUserFromAccessToken = accessToken => {
    let tokenData = {};
    let user = {};
    tokenData = this.parseToken(accessToken);
    user = {
      jti: tokenData.jti,
      userIdx: tokenData.userIdx,
      userId: tokenData.userId,
      username: tokenData.username,
      iat: tokenData.iat,
      exp: tokenData.exp,
      //profileFileId: tokenData.profileFileId,
    };
    return user;
  };

  handleLogin = async e => {
    e.preventDefault();

    try {
      const { username, password } = this.state;
      const response = await axios.post(
        'http://grk-backend.medical-lab.co.kr/api/v1/token/',
        {
          userId: username,
          password: password,
        }
      );

      // 로그인 성공 후 처리할 작업을 여기에 추가합니다.
      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;
      const loginUser = this.getUserFromAccessToken(accessToken);

      localStorage.setItem('saveId', username);
      localStorage.setItem(
        'accessTokenPotal',
        JSON.stringify({
          token: accessToken,
          exp: this.parseToken(accessToken).exp,
        })
      );
      localStorage.setItem(
        'refreshTokenPotal',
        JSON.stringify({
          token: refreshToken,
          exp: this.parseToken(refreshToken).exp,
        })
      );
      localStorage.setItem('loginUserPotal', JSON.stringify(loginUser));
      localStorage.setItem('isLogin', 'OK');
      // navigate('/project');
      console.error('test message: 로그인 성공: ' + username);
      alert('로그인 성공');
    } catch (error) {
      console.error('test message: 로그인 실패:', error);
      // 로그인 실패 처리를 여기에 추가합니다.
    }
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    const { username, password } = this.state;
    const handleSubmit = () => {};

    const errors = { id: 'false' };
    // const isSubmitting = 'disabled'

    return (
      <section>
        <div className="login-box">
          <div className="text-center">
            <h4>LOGIN</h4>
          </div>
          <form onSubmit={this.handleLogin}>
            <div className="input-box">
              <input
                type="text"
                name="username"
                value={username}
                onChange={this.handleChange}
                // {...register('id', {
                //   required: '아이디를 입력바랍니다.',
                // })}
              />
              {errors.id && <small role="alert">{errors.id.message}</small>}
            </div>
            <div className="input-box">
              <input
                type="password"
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
            <div className="bottom-box">
              <label class="checkbox-container">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Remember ID
              </label>

              <a href="#">Forgot Password?</a>
            </div>

            <div className="bottom-area">
              <button type="submit">Login</button>
              <p>
                Don't have an account?
                <a href="#">Sing Up</a>
              </p>
            </div>
          </form>
          <div className="logo-box">{OHIFLogo()}</div>
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

export default ViewerbaseDragDropContext(withRouter(ConnectedLogin));
