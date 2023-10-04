import React, { Component } from 'react';
import axios from 'axios';
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

  handleLogin = async e => {
    e.preventDefault();

    try {
      const { username, password } = this.state;

      console.log(username, password);
      if (username == 'admin' && password == 'qwer1234') {
        localStorage.setItem('isLogin', 'OK');
        location.href = '/';
        //console.error('test message: 로그인 성공: ' + username);
        alert('로그인 성공');
      } else {
        alert('아이디와 패스워드를 확인하세요');
      }
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
    localStorage.removeItem('isLogin');
    //console.log(this.props);
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
            {/* <div className="bottom-box">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember ID
              </label>

              <a href="#">Forgot Password?</a>
            </div> */}

            <div className="bottom-area">
              <button type="submit">Login</button>
              {/* <p>
                Don't have an account?
                <a href="#">Sing Up</a>
              </p> */}
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default Login;
