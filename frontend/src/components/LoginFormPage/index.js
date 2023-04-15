import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './LoginForm.css';

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  if (sessionUser) return (
    <Redirect to="/" />
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .catch(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          setErrors(['Invalid credentials. Please try again.']);
        } else if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const demoUserLogin = (e) =>{
    e.preventDefault()
    return dispatch(sessionActions.login({
      credential: 'Demo-lition',
      password: 'password'
    }))
  }

  const isFormValid = () => {
    return credential.length >= 4 && password.length >= 6;
  }

  return (
    <form onSubmit={handleSubmit}>
      <ul>
        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
      </ul>
      <label>
        Username or Email
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit"
        disabled={!isFormValid()}
         >Log In</button>

          <div onClick={demoUserLogin} style={{ marginTop: '10px', marginBottom: '10px' }}>
            <button >Demo User Login</button>
            </div>
    </form>
  );
}

export default LoginFormPage;