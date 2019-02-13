import React, { Component } from 'react';

import './Auth.css';

import AuthContext from '../context/auth-context';

export default class AuthPage extends Component {
  state = {
    isLogin: true
  }

  //this.context can now be used to access context in '../context/auth-context'
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailElement = React.createRef();
    this.passwordElement = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return {isLogin: !prevState.isLogin}
    })
  }

  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailElement.current.value;
    const password = this.passwordElement.current.value;

    //checking to see if we have any email/password
    if(email.trim().length === 0 || password.trim().length === 0) {
      return;
    };

    //querys sent to graphql
    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email, //first email refers to $emial in Login query, 2nd email is the const unser SsubmitHandler
        password: password
      }
    };


    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password
        }
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody), 
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        console.log(res)
        throw new Error('Failed');
      }
      return res.json();
    })
    .then(resData => {
      if (this.state.isLogin) { //if we are logged in
        //pass the token, userId, and tokenExpiration to login method from auth-context
        this.context.login(
          resData.data.login.token, 
          resData.data.login.userId, 
          resData.data.login.tokenExpiration)
      }
    })
    .catch(err => {
      console.log(err)
    }) 
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={this.emailElement}/>
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordElement}/>
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? 'Sign up' : 'Login'}
          </button>
        </div>
      </form>
    )
  }
}
