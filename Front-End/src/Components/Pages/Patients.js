import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Header from "../Header";
import Patient from "../Patient";
import PatientImg from "../Images/user.png";
import load from "../Images/loading.png";

function Patients() {
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
  const [cin, setCin] = useState("");
  const [ppr, setPpr] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [cinExists, setCinExists] = useState(false);
  const [patients, setPatients] = useState([]);
  const [specificPatient, setSpecificPatient] = useState(null);
  const [action, setAction] = useState(1);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${baseURL}/patient`, {
        withCredentials: true,
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const id = specificPatient.id;
      await axios.delete(`${baseURL}/patients/${id}`);
      setSpecificPatient(null);
      console.log("Patient Deleted");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const updatePatient = async (event) => {
    event.preventDefault();
    try {
      const id = specificPatient.id;
      const updatedUserData = { nom, prenom, address, cin, ppr, phone };
      await axios.put(`${baseURL}/patients/${id}`, updatedUserData);
      fetchPatients();
      setAction(1);
      setSpecificPatient(null);
      console.log("Patient Updated");
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  const filteredPatients = patients.filter(
    (item) =>
      item.nom.toLowerCase().includes(search.toLowerCase()) ||
      item.prenom.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase()) ||
      item.cin.toLowerCase().includes(search.toLowerCase()) ||
      item.ppr.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <img className="loading-img" src={load} />
      </div>
    );
  }
  if (userData) {
    return (
      <>
        <Header />
        <div className="app">
          <div className="show">
            <div className="patient-show">
              <div className="search">
                <input
                  className="searcher"
                  placeholder="Recherche"
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </div>
              {filteredPatients.map((patient) => {
                return (
                  <div
                    className="patient-card"
                    id="kk"
                    style={
                      specificPatient !== null
                        ? patient.id === specificPatient.id
                          ? { backgroundColor: "#406eac" }
                          : {}
                        : {}
                    }
                    key={patient.id}
                    onClick={() => {
                      setSpecificPatient(patient);
                      setAction(2);
                      setNom(patient.nom);
                      setPrenom(patient.prenom);
                      setAddress(patient.address);
                      setCin(patient.cin);
                      setPpr(patient.ppr);
                      setPhone(patient.phone);
                    }}
                    onDoubleClick={() => {
                      window.location.href = `/add/${specificPatient?.id}`;
                    }}
                  >
                    <img
                      className="pat-img"
                      src={PatientImg}
                      alt="Avatar-img"
                    />
                    <span
                      className="namee"
                      style={
                        specificPatient !== null
                          ? patient.id === specificPatient.id
                            ? { color: "white" }
                            : {}
                          : {}
                      }
                    >
                      {patient.prenom} - {patient.nom}
                    </span>
                    <div className="infos">
                      <span
                        className="lo"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "rgb(223, 223, 223)" }
                              : {}
                            : {}
                        }
                      >
                        Address :
                      </span>
                      <span
                        className="ll"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "white" }
                              : {}
                            : {}
                        }
                      >
                        {patient.address}
                      </span>
                      <span
                        className="lo"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "rgb(223, 223, 223)" }
                              : {}
                            : {}
                        }
                      >
                        CIN :
                      </span>
                      <span
                        className="ll"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "white" }
                              : {}
                            : {}
                        }
                      >
                        {patient.cin}
                      </span>
                      <span
                        className="lo"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "rgb(223, 223, 223)" }
                              : {}
                            : {}
                        }
                      >
                        Phone :
                      </span>
                      <span
                        className="ll"
                        style={
                          specificPatient !== null
                            ? patient.id === specificPatient.id
                              ? { color: "white" }
                              : {}
                            : {}
                        }
                      >
                        {patient.phone}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {action === 1 ? <Patient /> : null}
            {action === 2 ? (
              <form className="ajouter1" onSubmit={updatePatient}>
                <div className="create">
                  <Link to={`/add/${specificPatient?.id}`}>
                    <button id="create-certif">Gérer les certificats ▷▶</button>
                  </Link>
                </div>
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
                    id="address"
                    name="address"
                    type="text"
                    placeholder=""
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <label htmlFor="address" className="label">
                    Address
                  </label>
                </div>
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="cin"
                    name="cin"
                    type="text"
                    placeholder=""
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                  />
                  <label htmlFor="cin" className="label">
                    CIN
                  </label>
                </div>
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="ppr"
                    name="ppr"
                    type="text"
                    placeholder=""
                    value={ppr}
                    onChange={(e) => setPpr(e.target.value)}
                  />
                  <label htmlFor="ppr" className="label">
                    PPR
                  </label>
                </div>
                {cinExists && <p className="allert">CIN existe déjà</p>}
                <div className="inputdiv">
                  <input
                    required
                    className="addInput"
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder=""
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <label htmlFor="phone" className="label">
                    Phone
                  </label>
                </div>
                <div className="subk" id="act">
                  <button
                    id="cancel"
                    onClick={() => {
                      setAction(1);
                      setNom("");
                      setPrenom("");
                      setAddress("");
                      setCin("");
                      setPpr("");
                      setPhone("");
                      setSpecificPatient(null);
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
                      setAddress("");
                      setCin("");
                      setPpr("");
                      setPhone("");
                      setSpecificPatient(null);
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

export default Patients;
