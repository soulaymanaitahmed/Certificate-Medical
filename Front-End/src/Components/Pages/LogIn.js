import React, { useState, useEffect } from "react";
import axios from "axios";

import load from "../Images/loading.png";

function SignIn() {
  axios.defaults.withCredentials = true;
  const [not, setNot] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const port = 8081;
    return `${protocol}//${hostname}:${port}`;
  };

  const baseURL = getBaseURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/`, {
          withCredentials: true,
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/users/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
      setNot(true);
    }
  };

  useEffect(() => {
    setNot(false);
  }, [username, password]);

  if (loading) {
    return (
      <div className="loading">
        <img className="loading-img" src={load} />
      </div>
    );
  }

  if (!userData && loading) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="log">
      <form className="singin" onSubmit={handleSignIn}>
        <div className="hl">
          <h2>Certificate Médicale</h2>
        </div>
        {not && (
          <div className="all44">
            Nom d'utilisateur ou mot de passe incorrect!
          </div>
        )}
        <div className="inputdiv">
          <input
            required
            className="addInput"
            id="username"
            name="username"
            type="text"
            minLength={4}
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username" className="label">
            Username
          </label>
        </div>
        <div className="inputdiv">
          <input
            required
            className="addInput"
            id="password"
            name="password"
            type="password"
            minLength={4}
            maxLength={20}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password" className="label">
            Password
          </label>
        </div>
        <button type="submit" className="btnn">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default SignIn;
