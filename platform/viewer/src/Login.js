import React, { Component } from 'react';
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
      isSave: false,
      errors: { id: { message: '' }, password: { message: '' } },
    };
    this.inputRef = React.createRef();
    this.inputPassRef = React.createRef();
  }

  componentDidMount() {
    let saveId = localStorage.getItem('saveId');
    if (saveId) {
      this.setState({ username: saveId, isSave: true });
      this.inputPassRef.current.focus();
    } else {
      this.inputRef.current.focus();
    }


    window.ohif.app.hotkeysManager.destroy();
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
    const { username, password, isSave, errors } = this.state;

    if (!username) {
      //alert('Please enter a username');
      errors.id.message = 'Please enter a username';
      this.setState({
        ...this.state,
        errors: errors,
      });
      this.inputRef.current.focus();
      return;
    }

    if (!password) {
      errors.password.message = 'Please enter a password';
      this.setState({
        ...this.state,
        errors: errors,
      });
      this.inputPassRef.current.focus();
      return;
    }

    try {
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

      if (isSave) {
        localStorage.setItem('saveId', username);
      }

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
      //console.log('test message: 로그인 성공: ' + username);
      //alert('');
      window.location.assign('../grkstudy');
    } catch (error) {
                      //console.error('test message: 로그인 실패:', error);
                      alert(
                        '로그인 실패하였습니다. 아이디와 비밀번호를 확인해 주세요'
                      );
                      // 로그인 실패 처리를 여기에 추가합니다.
                    }
  };

  handleCheckboxChange = event => {
    this.setState({ isSave: event.target.checked }); // 체크 여부를 상태에 업데이트
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { id: { message: '' }, password: { message: '' } },
    });
  };

  render() {
    const { username, password, isSave, errors } = this.state;

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
                ref={this.inputRef}
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
                ref={this.inputPassRef}
              />
              {errors.password && (
                <small role="alert">{errors.password.message}</small>
              )}
            </div>
            <div className="bottom-box">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={this.state.isSave} // 체크 여부를 상태 변수로 설정
                  onChange={this.handleCheckboxChange}
                />
                <span className="checkmark"></span>
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

export default Login;
