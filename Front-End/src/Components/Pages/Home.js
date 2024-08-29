import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { HiUserCircle } from "react-icons/hi";
import { HiOutlineExternalLink } from "react-icons/hi";

import Header from "../Header";
import img1 from "../Images/crowd.png";
import img2 from "../Images/certification.png";
import img4 from "../Images/alert-sign.png";
import img5 from "../Images/repeat.png";
import img6 from "../Images/clock.png";
import load from "../Images/loading.gif";

function Home() {
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
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [patients, setPatients] = useState([]);
  const [certifs, setCertifs] = useState([]);

  const [search, setSearch] = useState("");
  const [search2, setSearch2] = useState("");
  const [order1, setOrder1] = useState("1");
  const [order2, setOrder2] = useState("1");
  const currentDate = new Date();

  useEffect(() => {
    fetchPatients();
    fetchCertificates();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${baseURL}/patient`, {
        withCredentials: true,
      });
      setPatients(response.data);
    } catch (error) {}
  };

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${baseURL}/certificate-all`, {
        withCredentials: true,
      });
      setCertifs(response.data);
    } catch (error) {}
  };

  // -------------------------------------------------- Calcul numbre of Active Certifs
  const count = certifs.filter(
    (certif) => new Date(certif.date_fin) >= currentDate
  ).length;

  // -------------------------------------------------- Calcul Durée (+1)
  function calculateDaysDifference(dd, df) {
    const diffInMs = new Date(df) - new Date(dd);
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  }

  // -------------------------------------------------- Reforme date to DD-MM-YYYY
  function formatDate(dt) {
    const date = new Date(dt);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  // -------------------------------------------------- Search Certifs
  const certifAll = certifs.filter(
    (item) =>
      item.patient_nom.toLowerCase().includes(search.toLowerCase()) ||
      item.patient_prenom.toLowerCase().includes(search.toLowerCase()) ||
      item.patient_address.toLowerCase().includes(search.toLowerCase()) ||
      item.patient_cin.toLowerCase().includes(search.toLowerCase()) ||
      item.patient_phone.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().toLowerCase().includes(search.toLowerCase())
  );

  // -------------------------------------------------- Add nbr_certifs and total_days
  const patientsWithCertifCount = patients.map((patient) => {
    const certifsForPatient = certifs.filter(
      (certif) => certif.patient_id === patient.id
    );
    const totalDays = certifsForPatient.reduce((total, certif) => {
      const days = calculateDaysDifference(certif.date_debut, certif.date_fin);
      return total + days;
    }, 0);

    const certifCount = certifsForPatient.length;

    return { ...patient, nbr_certifs: certifCount, total_days: totalDays };
  });

  // -------------------------------------------------- Search Patients
  const patientAll = patientsWithCertifCount.filter(
    (item) =>
      item.nom.toLowerCase().includes(search2.toLowerCase()) ||
      item.prenom.toLowerCase().includes(search2.toLowerCase()) ||
      item.address.toLowerCase().includes(search2.toLowerCase()) ||
      item.cin.toLowerCase().includes(search2.toLowerCase()) ||
      item.phone.toLowerCase().includes(search2.toLowerCase())
  );

  let orderedCertifAll = [...certifAll];
  let orderedPatiefAll = [...patientAll];

  // -------------------------------------------------- Order Certifs
  if (order1 === "1") {
    orderedCertifAll = orderedCertifAll.sort((a, b) => b.id - a.id);
  } else if (order1 === "2") {
    orderedCertifAll = orderedCertifAll.sort(
      (a, b) => b.patient_nom - a.patient_nom
    );
  } else if (order1 === "3") {
    orderedCertifAll = orderedCertifAll.sort((a, b) =>
      a.patient_address.localeCompare(b.patient_address)
    );
  } else if (order1 === "4") {
    orderedCertifAll = orderedCertifAll.sort(
      (a, b) =>
        calculateDaysDifference(a.date_debut, a.date_fin) -
        calculateDaysDifference(b.date_debut, b.date_fin)
    );
  } else if (order1 === "5") {
    orderedCertifAll = orderedCertifAll.sort(
      (a, b) =>
        calculateDaysDifference(b.date_debut, b.date_fin) -
        calculateDaysDifference(a.date_debut, a.date_fin)
    );
  }

  // -------------------------------------------------- Order Ptaients
  if (order2 === "1") {
    orderedPatiefAll = orderedPatiefAll.sort(
      (a, b) => b.total_days - a.total_days
    );
  } else if (order2 === "2") {
    orderedPatiefAll = orderedPatiefAll.sort(
      (a, b) => b.nbr_certifs - a.nbr_certifs
    );
  } else if (order2 === "3") {
    orderedPatiefAll = orderedPatiefAll.sort((a, b) =>
      a.nom.localeCompare(b.nom)
    );
  } else if (order2 === "4") {
    orderedPatiefAll = orderedPatiefAll.sort((a, b) =>
      a.address.localeCompare(b.address)
    );
  }

  // -------------------------------------------------- Navigation Certifs
  const [currentCertPage, setCurrentCertPage] = useState(1);
  const [certCardsPerPage] = useState(5);
  const indexOfLastCertCard = currentCertPage * certCardsPerPage;
  const indexOfFirstCertCard = indexOfLastCertCard - certCardsPerPage;
  const currentCertCards = orderedCertifAll.slice(
    indexOfFirstCertCard,
    indexOfLastCertCard
  );
  const totalCertPages = Math.ceil(orderedCertifAll.length / certCardsPerPage);
  const handleCertNextPage = () => {
    setCurrentCertPage(currentCertPage + 1);
  };
  const handleCertPrevPage = () => {
    setCurrentCertPage(currentCertPage - 1);
  };

  // -------------------------------------------------- Navigation Patients
  const [currentPatPage, setCurrentPatPage] = useState(1);
  const [patCardsPerPage] = useState(8);
  const indexOfLastPatCard = currentPatPage * patCardsPerPage;
  const indexOfFirstPatCard = indexOfLastPatCard - patCardsPerPage;
  const currentPatCards = orderedPatiefAll.slice(
    indexOfFirstPatCard,
    indexOfLastPatCard
  );
  const totalPatPages = Math.ceil(orderedPatiefAll.length / patCardsPerPage);
  const handlePatNextPage = () => {
    setCurrentPatPage(currentPatPage + 1);
  };
  const handlePatPrevPage = () => {
    setCurrentPatPage(currentPatPage - 1);
  };

  // -------------------------------------------------- Over 90 days
  const patientsWith90DaysOrMore = patientsWithCertifCount.filter(
    (patient) => patient.total_days >= 90
  );
  const numberOfPatientsWith90DaysOrMore = patientsWith90DaysOrMore.length;

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
        <main>
          <aside>
            <div className="articlee2">
              <div className="titre">
                <span>Certificates</span>
                <img src={img2} alt="Icon" className="icon1" />
              </div>
              <span className="value">{certifs.length}</span>
            </div>
            <div className="articlee4">
              <div className="titre">
                <span>Actif</span>
                <img src={img5} alt="Icon" className="icon1" />
              </div>
              <span className="value">{count}</span>
            </div>
            <div className="articlee3" id="vvbb6">
              <div className="titre">
                <span>Non Actif</span>
                <img src={img6} alt="Icon" className="icon1" />
              </div>
              <span className="value">{certifs.length - count}</span>
            </div>
            <Link to="/patients" className="articlee1">
              <div className="titre">
                <span>Patients</span>
                <img src={img1} alt="Icon" className="icon1" />
              </div>
              <span className="value">{patients.length}</span>
            </Link>
            <div className="articlee1">
              <div className="titre">
                <span>Décision</span>
                <img src={img4} alt="Icon" className="icon1" />
              </div>
              <span className="value">{numberOfPatientsWith90DaysOrMore}</span>
            </div>
            <div className="articlee1">
              <div className="titre">
                <span>Test</span>
                <img src={""} alt="Icon" className="icon1" />
              </div>
              <span className="value">{"--"}</span>
            </div>
          </aside>
          <div className="main-container">
            <div className="cetif-cards1">
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
                <select
                  name="order1"
                  className="order"
                  value={order1}
                  onChange={(e) => setOrder1(e.target.value)}
                >
                  <option value="1">Trier par N°</option>
                  <option value="2">Trier par Nom</option>
                  <option value="3">Trier par Address</option>
                  <option value="5">Trier par Durée</option>
                  <option value="4">Durée (Descendant)</option>
                </select>
              </div>
              <hr />
              {currentCertCards.map((card, index) => {
                const dd = new Date(card.date_fin) >= currentDate;
                return (
                  <div
                    className="card-all"
                    key={index}
                    style={
                      dd === true
                        ? {
                            border: "1px solid #25a158",
                            backgroundColor: "#25a15918",
                          }
                        : {}
                    }
                  >
                    <div className="header2">
                      <span className="mmm1" id="mm1">
                        N° : {card.id}
                      </span>
                      <span
                        className="hd2"
                        id="mm1"
                        style={{
                          color: "#406eac",
                          width: "50%",
                          backgroundColor: "#406fac23",
                          borderRadius: "5px",
                          paddingLeft: "5%",
                        }}
                      >
                        {card.patient_nom + " - " + card.patient_prenom}
                      </span>
                    </div>
                    <hr />
                    <div className="header2">
                      <span className="hd3">
                        Date début :{" "}
                        <span id="mm1">{formatDate(card.date_debut)}</span>
                      </span>
                      <span className="hd3">
                        Date fin :{" "}
                        <span id="mm1">{formatDate(card.date_fin)}</span>
                      </span>
                      <span className="hd4">
                        Durée :{" "}
                        <span className="cct1">
                          {calculateDaysDifference(
                            card.date_debut,
                            card.date_fin
                          )}
                        </span>
                      </span>
                    </div>
                    <div className="header2">
                      <span>
                        Mode contre visit :{" "}
                        <span id="mm1">
                          {card.contre_visit === 1 ? "Oui" : "No"}
                        </span>
                      </span>
                      <span>
                        Address : <span id="mm1">{card.patient_address}</span>
                      </span>
                      <span>
                        Phone : <span id="mm1">{card.patient_phone}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pagination">
                <button
                  onClick={handleCertPrevPage}
                  disabled={currentCertPage === 1}
                >
                  Précédente
                </button>
                <span>
                  Page {currentCertPage} of {totalCertPages}
                </span>
                <button
                  onClick={handleCertNextPage}
                  disabled={currentCertPage === totalCertPages}
                >
                  Suivante
                </button>
              </div>
            </div>
            <div className="cetif-cards2">
              <div className="search">
                <input
                  className="searcher"
                  placeholder="Recherche"
                  type="text"
                  value={search2}
                  onChange={(e) => {
                    setSearch2(e.target.value);
                  }}
                />
                <select
                  name="order2"
                  className="order"
                  value={order2}
                  onChange={(e) => setOrder2(e.target.value)}
                >
                  <option value="1">Trier par Total</option>
                  <option value="2">Nombre de certificats</option>
                  <option value="3">Trier par Nom</option>
                  <option value="4">Trier par Address</option>
                </select>
              </div>
              <hr />
              {currentPatCards.map((pat, index) => {
                return (
                  <div
                    className="patients-all"
                    key={index}
                    style={
                      pat.total_days >= 90
                        ? {
                            backgroundColor: "rgba(255, 0, 0, 0.107)",
                            border: "0.5px solid red",
                          }
                        : {}
                    }
                  >
                    <Link to={`/add/${pat?.id}`} className="llnk3">
                      {pat.nbr_certifs}
                      <HiOutlineExternalLink />
                    </Link>
                    <div className="img-contt">
                      <HiUserCircle className="img3" />
                    </div>
                    <div className="infos3">
                      <div className="name3">
                        <h3>{pat.nom + " - " + pat.prenom}</h3>
                        <span>{"Total : " + pat.total_days + " Jours"}</span>
                      </div>
                      <div className="pat-infos3">
                        <div className="inf35">
                          <span className="inf4">Address : </span>
                          <span className="inf5">{pat.address}</span>
                        </div>
                        <div className="inf36">
                          <span className="inf4">Phone : </span>
                          <span className="inf5">{pat.phone}</span>
                        </div>
                        <div className="inf37">
                          <span className="inf4">CIN : </span>
                          <span className="inf5">{pat.cin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="pagination">
                <button
                  onClick={handlePatPrevPage}
                  disabled={currentPatPage === 1}
                >
                  Suivante
                </button>
                <span>
                  Page {currentPatPage} of {totalPatPages}
                </span>
                <button
                  onClick={handlePatNextPage}
                  disabled={currentPatPage === totalPatPages}
                >
                  Suivante
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  } else if (!userData) {
    window.location.href = "/login";
    return null;
  }
}

export default Home;
