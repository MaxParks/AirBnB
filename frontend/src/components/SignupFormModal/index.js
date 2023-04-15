import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import './SignupFormModal.css';

function SignupFormModal() {

  // state variables
  const dispatch = useDispatch();

   const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
   const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState([]);
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
  
    //for email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
  
    // dispatch the signup action to the store
    return dispatch(sessionActions.signup({ email, username, firstName, lastName, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (res.status === 403) {
          setErrors(['Username or Email taken']);
        }
        if (!emailRegex.test(email)) {
          setErrors(errors => [...errors, "Please provide a valid email"]);
        }
        if (username.includes("@")) {
          setErrors(errors => [...errors, "Username cannot be an email"]);
        }
        else if (data && data.errors) {
          setErrors([...data.errors]);
        }
      });
  }

  //form validation
  const isFormValid = () => {
    return (
      email.trim() !== "" &&
      username.trim() !== "" &&
      username.trim().length >= 4 &&
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      password.trim() !== "" &&
      password.trim().length >= 6 &&
      confirmPassword.trim() !== "" &&
      password === confirmPassword
    )
}

//signup form
  return (
    <div id="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <ul>
          {errors.map((error, idx) => <li key={idx}>{error}</li>)}
        </ul>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" 
        disabled={!isFormValid()}
        className="signup-button"
        >Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;