import { useState } from "react";
import axios from "axios";

function User() {
  const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const port = 8081;
    return `${protocol}//${hostname}:${port}`;
  };

  const baseURL = getBaseURL();
  const [formData, setFormData] = useState({
    username: "",
    nom: "",
    prenom: "",
    password: "",
  });
  const [usernameExists, setUsernameExists] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/users`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.message) {
        console.log("User added successfully");
        window.location.reload();
      } else {
        console.error("Error:", response.data.error);
        if (response.data.error === "Username already exists") {
          setUsernameExists(true);
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setUsernameExists(false);
  };

  return (
    <form className="ajouter1" onSubmit={handleSubmit}>
      <div className="ajouter-header">Créer un nouveau compte utilisateur</div>
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="nom"
          name="nom"
          type="text"
          minLength={3}
          placeholder=""
          value={formData.nom}
          onChange={handleChange}
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
          minLength={3}
          placeholder=""
          value={formData.prenom}
          onChange={handleChange}
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
          minLength={4}
          maxLength={20}
          placeholder=""
          value={formData.username}
          onChange={handleChange}
        />
        <label htmlFor="username" className="label">
          Username
        </label>
      </div>
      {usernameExists && <p className="allert">Username existe déjà</p>}
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="password"
          name="password"
          type="text"
          minLength={4}
          maxLength={20}
          placeholder=""
          value={formData.password}
          onChange={handleChange}
        />
        <label htmlFor="password" className="label">
          Password
        </label>
      </div>
      <div className="subk">
        <button type="submit">Ajouter</button>
      </div>
    </form>
  );
}

export default User;
