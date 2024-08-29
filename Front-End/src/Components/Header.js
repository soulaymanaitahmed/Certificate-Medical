import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { LuUserCircle2 } from "react-icons/lu";
import { BiHomeAlt } from "react-icons/bi";

import delegationLogo from "./Images/deleg-logo.png";

function Header() {
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
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const logout = async () => {
    try {
      await axios.get(`${baseURL}/logout`, {
        withCredentials: true,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userData) {
    return (
      <div className="header-container">
        <header>
          <Link to="/" className="logos">
            <img
              src={delegationLogo}
              alt="Logo Image"
              className="logoimg"
              width="60px"
            />
            <span>Certificats Médicaux</span>
          </Link>
          <nav>
            <ul>
              <li>
                <Link to="/" className="lnk">
                  <BiHomeAlt />
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/patients" className="lnk">
                  <LuUserCircle2 />
                  Patients
                </Link>
              </li>
              {userData.admin === 2 ? (
                <li>
                  <Link to="/users" className="lnk">
                    <MdOutlineAdminPanelSettings />
                    Users
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
          <div className="user">
            <span>{userData ? userData.name : null}</span>
            <button onClick={logout}>Se Déconnecter</button>
          </div>
        </header>
      </div>
    );
  } else if (!userData && loading) {
    window.location.href = "/login";
    return null;
  }
}

export default Header;
