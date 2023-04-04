// frontend/src/components/LoginFormModal/index.js
import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(
        async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
        }
      );
  };

  const demoUserLogin = (e) =>{
    e.preventDefault()
    return dispatch(sessionActions.login({
      credential: 'Demo-lition',
      password: 'password'
    }))
    .then(closeModal)
  }

  const isFormValid = () => {
    return credential.length >= 4 && password.length >= 6;
  }
 
  return (
    <div className="login-container">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <ul>
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <label>
        
          <input
          className="input-field"
          placeholder=" Username or Email"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <br/>
        <label>
          
          <input
           className="input-field"
           placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br/>
        </label>
        
        <button type="submit"
        disabled={!isFormValid()}
         >Log In</button>

          <div onClick={demoUserLogin} style={{ marginTop: '10px', marginBottom: '10px' }}>
            <button >Demo User Login</button>
            </div>
       
      </form>
    </div>
  );
}

export default LoginFormModal;