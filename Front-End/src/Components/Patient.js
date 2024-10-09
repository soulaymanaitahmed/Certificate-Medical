import React, { useState, useEffect } from "react";
import axios from "axios";

function Patient() {
  axios.defaults.withCredentials = true;

  const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const port = 8081;
    return `${protocol}//${hostname}:${port}`;
  };

  const baseURL = getBaseURL();

  const [patientExists, setPatientExists] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    address: "",
    ppr: "",
    cin: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/patients`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.message) {
        window.location.reload();
      } else {
        console.error("Error:", response.data.error);
        if (response.data.error === "Patient already exists") {
          setPatientExists(true);
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
    if (name === "nom" || name === "prenom") {
      setPatientExists(false);
    }
  };

  return (
    <form className="ajouter1" onSubmit={handleSubmit}>
      <div className="ajouter-header">Ajouter un Patient</div>
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="nom"
          name="nom"
          type="text"
          minLength={2}
          maxLength={30}
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
          minLength={2}
          maxLength={30}
          placeholder=""
          value={formData.prenom}
          onChange={handleChange}
        />
        <label htmlFor="prenom" className="label">
          Prénom
        </label>
      </div>
      {patientExists && (
        <p className="allert">Patient existe déjà (même Nom et Prenom)</p>
      )}
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="address"
          name="address"
          type="text"
          maxLength={50}
          placeholder=""
          value={formData.address}
          onChange={handleChange}
        />
        <label htmlFor="address" className="label">
          Adress
        </label>
      </div>
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="ppr"
          name="ppr"
          type="text"
          maxLength={10}
          placeholder=""
          value={formData.ppr}
          onChange={handleChange}
        />
        <label htmlFor="ppr" className="label">
          PPR
        </label>
      </div>
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="cin"
          name="cin"
          type="text"
          maxLength={10}
          placeholder=""
          value={formData.cin}
          onChange={handleChange}
        />
        <label htmlFor="cin" className="label">
          CIN
        </label>
      </div>
      <div className="inputdiv">
        <input
          required
          className="addInput"
          id="phone"
          name="phone"
          type="text"
          minLength={2}
          maxLength={50}
          placeholder=""
          value={formData.phone}
          onChange={handleChange}
        />
        <label htmlFor="phone" className="label">
          Phone
        </label>
      </div>
      <div className="subk">
        <button type="submit">Ajouter</button>
      </div>
    </form>
  );
}

export default Patient;
