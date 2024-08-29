import { useEffect, useState } from "react";
import axios from "axios";

import User from "../User";
import Header from "../Header";
import load from "../Images/loading.png";

function App() {
  axios.defaults.withCredentials = true;
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

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameExists, setUsernameExists] = useState(false);
  const [users, setUsers] = useState([]);
  const [specificUser, setSpecificUser] = useState(null);
  const [action, setAction] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users`, {
        withCredentials: true,
      });
      const data = response.data;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const handleDelete = async (event) => {
    try {
      const id = specificUser.id;
      await axios.delete(`${baseURL}/users/${id}`);
      fetchUsers();
      setSpecificUser(null);
      console.log("User Deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const updateUser = async (event) => {
    event.preventDefault();
    try {
      const id = specificUser.id;
      const updatedUserData = { nom, prenom, username, password };
      await axios.put(`${baseURL}/users/${id}`, updatedUserData);
      fetchUsers();
      setAction(1);
      setSpecificUser(null);
      console.log("User Updated");
    } catch (error) {
      setUsernameExists(true);
    }
  };

  useEffect(() => {
    setUsernameExists(false);
  }, [username]);

  if (loading) {
    return (
      <div className="loading">
        <img className="loading-img" src={load} />
      </div>
    );
  }

  if (userData) {
    function UsersAll() {
      if (users.length > 0)
        return users.map((user) => {
          return (
            <div
              style={
                specificUser !== null
                  ? specificUser.id === user.id
                    ? { backgroundColor: "#406eac", color: "white" }
                    : {}
                  : {}
              }
              className="user-card"
              key={user.id}
              onClick={() => {
                setSpecificUser(user);
                setAction(2);
                setNom(user.nom);
                setPrenom(user.prenom);
                setUsername(user.username);
                setPassword(user.password);
              }}
            >
              <span className="tnom">
                {user.prenom} - {user.nom}
              </span>
              <span className="tpre">{user.username}</span>
              <span className="tnbr">{user.id}</span>
            </div>
          );
        });
      else
        return (
          <>
            Erreur ! Impossible de récupérer les utilisateurs, vérifiez la
            connexion au serveur.
          </>
        );
    }
    return (
      <>
        <Header />
        <div className="app">
          <div className="show">
            <div className="users-show">
              <div className="user-card" id="users-header">
                <span className="tnom" id="tnom">
                  Nom
                </span>
                <span className="tpre" id="tpre">
                  Username
                </span>
                <span className="tnbr" id="tnbr">
                  User Id
                </span>
              </div>
              <UsersAll />
            </div>
            {action === 1 ? <User fetchUsers={fetchUsers} /> : null}
            {action === 2 ? (
              <form className="ajouter1" onSubmit={updateUser}>
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="nom"
                    name="nom"
                    type="text"
                    placeholder=""
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                  <label htmlFor="nom" className="label">
                    Nom
                  </label>
                </div>
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder=""
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                  <label htmlFor="prenom" className="label">
                    Prénom
                  </label>
                </div>
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="username"
                    name="username"
                    type="text"
                    placeholder=""
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <label htmlFor="username" className="label">
                    Username
                  </label>
                </div>
                {usernameExists && (
                  <p className="allert">Ce nom d'utilisateur existe déjà</p>
                )}
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="password"
                    name="password"
                    type="text"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                </div>
                <div className="subk" id="act">
                  <button
                    id="cancel"
                    onClick={() => {
                      setAction(1);
                      setNom("");
                      setPrenom("");
                      setUsername("");
                      setPassword("");
                      setSpecificUser(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit">Edit</button>
                  <button
                    id="delete"
                    onClick={() => {
                      handleDelete();
                      setAction(1);
                      setNom("");
                      setPrenom("");
                      setUsername("");
                      setPassword("");
                      setSpecificUser(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (!userData && loading) {
    window.location.href = "/login";
    return null;
  }
}

export default App;
