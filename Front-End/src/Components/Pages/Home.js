import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Header from "../Header";
import img1 from "../Images/crowd.png";
import img2 from "../Images/certification.png";
import img4 from "../Images/alert-sign.png";
import img5 from "../Images/repeat.png";
import img6 from "../Images/clock.png";
import load from "../Images/loading.gif";

import exportToExcel from "../exportToExcel";

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
  // -------------------------------------------------- Over 90 days
  const patientsWith90DaysOrMore = patientsWithCertifCount.filter(
    (patient) => patient.total_days >= 90
  );
  const numberOfPatientsWith90DaysOrMore = patientsWith90DaysOrMore.length;

  console.log(currentCertCards);

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
                <button
                  className="exporter"
                  onClick={() => exportToExcel(currentCertCards)}
                >
                  Exporter au format Excel
                </button>
              </div>
              <hr />
              <br />
              <div className="titles44">
                <p className="ddf1 t1">N°</p>
                <p className="ddf1 t2">Nom & Prenom</p>
                <p className="ddf1 t3">Date</p>
                <p className="ddf1 t4">CIN / PPR</p>
                <p className="ddf1 t5">Durée</p>
                <p className="ddf1 t3">Du</p>
                <p className="ddf1 t3">Au</p>
                <p className="ddf1 t8">Specialite medecin debut</p>
                <p className="ddf1 t8">Médecin traitant</p>
                <p className="ddf1 t10">Resultat de la commission</p>
                <p className="ddf1 t11">Type</p>
                <p className="ddf1 t12">Administration</p>
                <p className="ddf1 t13">Hors province</p>
              </div>
              {currentCertCards.map((m) => {
                const dd = new Date(m.date_fin) >= currentDate;
                return (
                  <div
                    className="titles446"
                    key={m.id}
                    style={
                      dd === true
                        ? {
                            border: "1px solid #25a158",
                          }
                        : {}
                    }
                  >
                    <p className="ddf1 t1">{m.id}</p>
                    <p className="ddf1 t2">
                      {m.patient_nom + " " + m.patient_prenom}
                    </p>
                    <p className="ddf1 t3">{formatDate(m.date_depot)}</p>
                    <p className="ddf1 t4">
                      {m.patient_ppr ? m.patient_ppr : m.patient_cin}
                    </p>
                    <p className="ddf1 t5">{m.duration}</p>
                    <p className="ddf1 t3">{formatDate(m.date_debut)}</p>
                    <p className="ddf1 t3">{formatDate(m.date_fin)}</p>
                    <p className="ddf1 t8">{m.spd ? m.spd : "- - -"}</p>
                    <p className="ddf1 t8">{m.mt ? m.mt : "- - -"}</p>
                    <p className="ddf1 t10">
                      {m.resultat === 1
                        ? "Justifié"
                        : m.resultat === 0
                        ? "Non Justifié"
                        : m.resultat === 2
                        ? "Ne s'est Présenté"
                        : m.resultat === 3
                        ? "Hors délai"
                        : "?"}
                    </p>
                    <p className="ddf1 t11">
                      {m.type_conge === 1
                        ? "Courte Durée"
                        : m.type_conge === 2
                        ? "Durée Intermédiaire"
                        : m.type_conge === 3
                        ? "Longue Durée"
                        : m.type_conge === 4
                        ? "Accident de travail"
                        : m.type_conge === 5
                        ? "Dérogation"
                        : "- - -"}
                    </p>
                    <p className="ddf1 t12">{m.patient_address}</p>
                    <p className="ddf1 t13">{m.prov ? m.prov : "- - -"}</p>
                  </div>
                );
              })}
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
