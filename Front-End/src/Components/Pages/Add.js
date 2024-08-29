import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

import AjouterImg from "../AjouterImg";
import Ajouter from "../Ajouter";
import Header from "../Header";

import img1 from "../Images/scan.png";
import img2 from "../Images/scan2.png";
import bin1 from "../Images/bin.png";
import load from "../Images/loading.png";
import vvw from "../Images/research.png";
function Add() {
  const currentYear = new Date().getFullYear();
  const [annee, setAnnee] = useState(currentYear);

  useEffect(() => {
    fetchUserCertif();
  }, [annee]);

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

  const { id } = useParams();

  const [cookies, setCookie] = useCookies(["viewstate"]);
  const [viewstate, setViewstate] = useState(
    cookies.viewstate ? parseInt(cookies.viewstate) : 0
  );
  useEffect(() => {
    setCookie("viewstate", viewstate.toString(), { path: "/" });
  }, [viewstate, setCookie]);

  const [date_debut, setDate_debut] = useState("");
  const [date_depot, setDate_depot] = useState("");
  const [date_fin, setDate_fin] = useState("");
  const [contreVisit, setContreVisit] = useState("");
  const [dateCV, setDateCV] = useState("");
  const [fait, setFait] = useState("");
  const [resultat, setResultat] = useState("");
  const [explication, setExplication] = useState("");
  const [type, setType] = useState("");
  const [duree, setDuree] = useState(null);
  const [view, setView] = useState(0);

  const [userCertif, setUserCertif] = useState([]);
  const [last, setLast] = useState([]);
  const [yesrsUser, setYesrsUser] = useState([]);
  const [patient, setPatient] = useState([]);
  const [images, setImages] = useState([]);
  const [im, setIm] = useState(null);
  const [spesificCertif, setSpesificCertif] = useState(false);

  const [confirm, setConfirm] = useState(false);
  const [error1, setError1] = useState("");

  const today = new Date();

  useEffect(() => {
    fetchUserCertif();
    fetchPatient();
    fetchImages();
    fetchUseryears();
    fetchActive();
  }, []);

  const fetchActive = async () => {
    try {
      const response = await axios.get(`${baseURL}/certificate-active/${id}`, {
        withCredentials: true,
      });
      setLast(response.data);
    } catch (error) {
      console.error("Error fetching Years:", error);
    }
  };
  const fetchUserCertif = async () => {
    try {
      const response = await axios.get(`${baseURL}/certificate/${id}`, {
        params: { annee },
        withCredentials: true,
      });
      setUserCertif(response.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };
  const fetchUseryears = async () => {
    try {
      const response = await axios.get(`${baseURL}/certificate-years/${id}`, {
        params: { annee },
        withCredentials: true,
      });
      setYesrsUser(response.data);
    } catch (error) {
      console.error("Error fetching Years:", error);
    }
  };
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${baseURL}/images/${id}`, {
        withCredentials: true,
      });
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  const fetchPatient = async () => {
    try {
      const response = await axios.get(`${baseURL}/patient/${id}`, {
        withCredentials: true,
      });
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };
  const count = userCertif.filter(
    (certif) => new Date(certif.date_fin) >= today
  ).length;
  function calculateDaysDifference(dd, df) {
    const diffInMs = new Date(df) - new Date(dd);
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  }
  const TotalDays = userCertif.reduce((totalDays, certif) => {
    const days = calculateDaysDifference(certif.date_debut, certif.date_fin);
    return totalDays + days;
  }, 0);
  function formatDate(dt) {
    const date = new Date(dt);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  function calculateDaysLeft(date_fin) {
    const endDate = new Date(date_fin);
    const differenceInMs = endDate - today;
    const daysLeft = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    return daysLeft;
  }
  const hasActiveCertifToday = () => {
    const today = new Date();
    for (const certif of last) {
      if (new Date(certif.date_fin) >= today) {
        return true;
      }
    }
    return false;
  };

  const lastDateDepot = userCertif.reduce((latestDate, certif) => {
    const certifDate = new Date(certif.date_depot);
    return certifDate > latestDate ? certifDate : latestDate;
  }, new Date(0));
  const lastDateFin = userCertif.reduce((latestDate, certif) => {
    const certifDate = new Date(certif.date_fin);
    return certifDate > latestDate ? certifDate : latestDate;
  }, new Date(0));

  const handleCheckRequired = () => {
    if (!date_debut || !date_depot || !date_fin) {
      setError1("S'il-vous-plaît remplissez tous les champs requis.");
      setConfirm(false);
    } else if (contreVisit === "0" || (contreVisit === "1" && dateCV)) {
      setConfirm(true);
      setError1("");
    } else {
      setError1("Veuillez insérer la date de la Contre Visite.");
      setConfirm(false);
    }
  };
  useEffect(() => {
    setDuree(calculateDaysDifference(date_debut, date_fin));
  }, [date_debut, date_fin]);

  useEffect(() => {
    if (spesificCertif && spesificCertif.date_cv)
      setDateCV(spesificCertif.date_cv.substring(0, 10));
  }, [spesificCertif]);

  function formatDateTime(dateString) {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", options);

    return formattedDate.replace(",", "");
  }
  const handleSubmit = async () => {
    try {
      const id = spesificCertif.id;
      const updatedUserData = {
        contreVisit,
        dateCV,
        fait,
        resultat,
        explication,
        type,
      };
      await axios.put(`${baseURL}/certificate/${id}`, updatedUserData);
      window.location.reload();
      console.log("Certif Updated");
    } catch (error) {
      console.error("Error updating certif:", error);
    }
  };
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const id = spesificCertif.id;
      await axios.delete(`${baseURL}/certificate/${id}`, {
        withCredentials: true,
      });
      fetchUserCertif();
      setSpesificCertif(null);
    } catch (error) {
      console.error("Error deleting Certif:", error);
    }
  };
  const deleteImg = async (aa) => {
    try {
      await axios.delete(`${baseURL}/images/${aa}`, {
        withCredentials: true,
      });
      fetchImages();
    } catch (error) {
      console.error("Error deleting Img:", error);
    }
  };
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
        <div>
          <div className="show22">
            <div className="pat-info">
              <div className="f1">
                <h3 className="nnhht4">
                  {patient.prenom}
                  <br />
                  {patient.nom}
                </h3>
                <div className="infos1" id="jjbb">
                  <p>
                    <span id="mmbb1">CIN</span>
                    <span id="mmbb">{patient.cin}</span>
                  </p>
                  <p>
                    <span id="mmbb1">Phone</span>
                    <span id="mmbb">{patient.phone}</span>
                  </p>
                  <p>
                    <span id="mmbb1">Address</span>
                    <span id="mmbb">{patient.address}</span>
                  </p>
                </div>
              </div>
              <div className="f1">
                <div className="infos1">
                  <p>
                    <span>Nombre de certificats :</span>
                    <input
                      className="ffvv"
                      disabled
                      value={
                        annee === "*"
                          ? "Toute" + " - " + userCertif.length
                          : annee + " - " + userCertif.length
                      }
                    />
                  </p>
                  <p>
                    <span>Active :</span>
                    <input
                      className="ffvv"
                      id="kk55"
                      disabled
                      style={
                        hasActiveCertifToday() === true
                          ? { backgroundColor: "green" }
                          : hasActiveCertifToday() === false
                          ? { backgroundColor: "red" }
                          : {}
                      }
                    />
                  </p>
                  <p>
                    <span>Total :</span>
                    {TotalDays > 90 ? (
                      <input
                        className="ffvv1"
                        disabled
                        style={{
                          color: "#406eac",
                          backgroundColor: "#ffffff00",
                          border: "none",
                        }}
                        value={"+ " + (TotalDays - 90) + " - Jours"}
                      />
                    ) : null}
                    <input
                      className="ffvv1"
                      disabled
                      style={
                        TotalDays <= 90
                          ? { color: "green" }
                          : TotalDays > 90
                          ? { color: "red" }
                          : {}
                      }
                      value={TotalDays + " - Jours"}
                    />
                  </p>
                </div>
              </div>
              <div className="f3">
                <div className="infos1">
                  <p>
                    <span>Nombre de Scannés :</span>
                    <input className="ffvv" disabled value={images.length} />
                  </p>
                  <p>
                    <span>Dernier dépot :</span>
                    <span className="iitt88">{formatDate(lastDateDepot)}</span>
                  </p>
                  <p>
                    <span>Dernier date de fin :</span>
                    <span className="iitt88">{formatDate(lastDateFin)}</span>
                  </p>
                </div>
              </div>
              <div
                className="f2"
                style={
                  viewstate === 1
                    ? {
                        backgroundColor: "#406eac",
                        color: "white",
                      }
                    : {}
                }
                onClick={() => {
                  if (viewstate === 0) {
                    setViewstate(1);
                  } else setViewstate(0);
                }}
              >
                <span>Scannés</span>
                <img src={view === 0 ? img1 : img2} width="50px" />
              </div>
            </div>
            {viewstate === 0 ? (
              <div className="cartif">
                {spesificCertif ? (
                  <form className="ajouter5">
                    {/* ------------------------- Basic Informations ------------------------- */}
                    <div className="ajouter-header">
                      <span className="idnum">
                        Certificate N°
                        <input id="bbxx1" value={spesificCertif.id} disabled />
                        {spesificCertif.year}
                      </span>
                      <span id="jj33">
                        <span id="bgf">Date de création : </span>
                        {formatDateTime(spesificCertif.created_date)}
                      </span>
                    </div>
                    <>
                      <div className="inputdiv">
                        <label htmlFor="date_debut" className="label2">
                          Date de Début
                        </label>
                        <input
                          disabled
                          className="addInput"
                          id="date_debut"
                          name="date_debut"
                          type="date"
                          value={
                            spesificCertif?.date_depot?.split("T")[0] || ""
                          }
                        />
                      </div>
                      <div className="duree">
                        <div className="duree-cont">
                          Durée
                          <input
                            disabled
                            className="dur"
                            value={duree > 0 ? duree + " Jours" : 0 + " Jours"}
                          />
                        </div>
                      </div>
                      <div className="inputdiv">
                        <label htmlFor="date_fin" className="label2">
                          Date de Fin
                        </label>
                        <input
                          disabled
                          className="addInput"
                          id="date_fin"
                          name="date_fin"
                          type="date"
                          value={spesificCertif?.date_fin?.split("T")[0] || ""}
                        />
                      </div>
                      <div className="inputdiv">
                        <label htmlFor="date_depot" className="label2">
                          Date de Dépot
                        </label>
                        <input
                          disabled
                          className="addInput"
                          id="date_depot"
                          name="date_depot"
                          type="date"
                          value={
                            spesificCertif?.date_depot?.split("T")[0] || ""
                          }
                        />
                      </div>
                      {/* ------------------------- Details ------------------------- */}
                      <div className="inputdiv">
                        <div className="duree-cont1">
                          <span className="qs">Mode Contre Visit :</span>
                          <div className="radio-inputs">
                            <label className="radio">
                              <input
                                required
                                type="radio"
                                name="contrevisit"
                                value={0}
                                checked={contreVisit === "0"}
                                onChange={(e) => {
                                  setContreVisit(e.target.value);
                                }}
                                defaultChecked
                              />
                              <span className="na">No</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="contrevisit"
                                value={1}
                                checked={contreVisit === "1"}
                                onChange={(e) => {
                                  setContreVisit(e.target.value);
                                }}
                                defaultChecked
                              />
                              <span className="na">Oui</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      {!duree && contreVisit === "1" ? (
                        <>
                          <br />
                          <span className="alert6">
                            Durée doit être supérieur ou égal à un jour!
                          </span>
                        </>
                      ) : duree && contreVisit === "1" && duree < 3 ? (
                        <>
                          <br />
                          <span className="alert6">
                            Contre Visit ne peut être sélectionné que si la
                            durée est supérieure ou égale à 3 jours
                          </span>
                        </>
                      ) : null}
                      {contreVisit === "1" && duree >= 3 ? (
                        <div className="sub">
                          <div className="inputdiv">
                            <label htmlFor="datecv" className="label2">
                              Date
                            </label>
                            <input
                              required
                              className="addInput"
                              id="datecv"
                              name="datecv"
                              type="date"
                              min={
                                spesificCertif?.date_debut?.split("T")[0] || ""
                              }
                              max={
                                spesificCertif?.date_fin?.split("T")[0] || ""
                              }
                              value={dateCV}
                              onChange={(e) => {
                                setDateCV(e.target.value);
                              }}
                            />
                          </div>
                          <div className="inputdiv" id="duree">
                            <div className="duree-cont1">
                              <span className="qs">Fait / Non Fait :</span>
                              <div className="radio-inputs">
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="fait"
                                    value={1}
                                    checked={fait === "1"}
                                    onChange={(e) => {
                                      setFait(e.target.value);
                                    }}
                                    defaultChecked
                                  />
                                  <span className="na">Oui</span>
                                </label>
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="fait"
                                    value={0}
                                    checked={fait === "0"}
                                    onChange={(e) => {
                                      setFait(e.target.value);
                                    }}
                                    defaultChecked
                                  />
                                  <span className="na">No</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          {fait === "1" ? (
                            <div className="sub">
                              <div className="inputdiv1" id="duree">
                                <div className="duree-cont1">
                                  <span className="qs">Résultat :</span>
                                  <div className="radio-inputs">
                                    <label className="radio">
                                      <input
                                        type="radio"
                                        name="resultat"
                                        value={1}
                                        checked={resultat === "1"}
                                        onChange={(e) => {
                                          setResultat(e.target.value);
                                        }}
                                        defaultChecked
                                      />
                                      <span className="na">Justifier</span>
                                    </label>
                                    <label className="radio">
                                      <input
                                        type="radio"
                                        name="resultat"
                                        value={0}
                                        checked={resultat === "0"}
                                        onChange={(e) => {
                                          setResultat(e.target.value);
                                        }}
                                        defaultChecked
                                      />
                                      <span className="na">Non Justifier</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                              {resultat === "1" ? (
                                <div className="inputdiv1" id="duree">
                                  <div className="duree-cont1">
                                    <span className="qs">Type de Congé:</span>
                                    <div className="radio-inputs">
                                      <label className="radio">
                                        <input
                                          type="radio"
                                          name="type"
                                          value={1}
                                          checked={type === "1"}
                                          onChange={(e) => {
                                            setType(e.target.value);
                                          }}
                                          defaultChecked
                                        />
                                        <span className="na">
                                          Courte Période
                                        </span>
                                      </label>
                                      <label className="radio">
                                        <input
                                          type="radio"
                                          name="type"
                                          value={2}
                                          checked={type === "2"}
                                          onChange={(e) => {
                                            setType(e.target.value);
                                          }}
                                          defaultChecked
                                        />
                                        <span className="na">
                                          Période Intermédiaire
                                        </span>
                                      </label>
                                      <label className="radio">
                                        <input
                                          type="radio"
                                          name="type"
                                          value={3}
                                          checked={type === "3"}
                                          onChange={(e) => {
                                            setType(e.target.value);
                                          }}
                                          defaultChecked
                                        />
                                        <span className="na">
                                          Longue Période
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : fait === "0" ? (
                            <div className="sub">
                              <div className="inputdiv1" id="duree">
                                <div className="duree-cont1">
                                  <span className="qs">Explication :</span>
                                  <div className="radio-inputs">
                                    <label className="radio">
                                      <input
                                        type="radio"
                                        name="explication"
                                        value={1}
                                        checked={explication === "1"}
                                        onChange={(e) => {
                                          setExplication(e.target.value);
                                        }}
                                        defaultChecked
                                      />
                                      <span className="na">Justifier</span>
                                    </label>
                                    <label className="radio">
                                      <input
                                        type="radio"
                                        name="explication"
                                        value={0}
                                        checked={explication === "0"}
                                        onChange={(e) => {
                                          setExplication(e.target.value);
                                        }}
                                        defaultChecked
                                      />
                                      <span className="na">Non Justifier</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="mm4">
                        <button
                          className="sbt22"
                          onClick={() => {
                            setSpesificCertif(null);
                          }}
                        >
                          Annuler
                        </button>
                        <button
                          className="sbt"
                          type="button"
                          onClick={handleCheckRequired}
                        >
                          Update
                        </button>
                        {userData.admin === 2 ? (
                          <button className="sbt33" onClick={handleDelete}>
                            Supprimer
                          </button>
                        ) : null}
                      </div>
                      {error1 && (
                        <>
                          <br />
                          <span className="allert1">{error1}</span>
                        </>
                      )}
                    </>
                    {confirm && (
                      <div className="all-cont">
                        <div className="llqq">
                          <div className="ffg">
                            <span className="jjs1">Date début : </span>
                            <span className="jjs2">
                              {formatDate(date_debut)}
                            </span>
                          </div>
                          <div className="ffg">
                            <span className="jjs1">Date fin : </span>
                            <span className="jjs2">{formatDate(date_fin)}</span>
                          </div>
                          <div className="ffg">
                            <span className="jjs1">Date dépot : </span>
                            <span className="jjs2">
                              {formatDate(date_depot)}
                            </span>
                          </div>
                          <div className="ffg">
                            <span className="jjs1">Duration : </span>
                            <span className="jjs2">{duree} - Jours</span>
                          </div>
                          <div className="ffg">
                            <span className="jjs1">Contre Visit : </span>
                            <span className="jjs2">
                              {contreVisit === "1" ? "Oui" : "No"}
                            </span>
                          </div>
                          {contreVisit === "1" ? (
                            <>
                              <div className="ffg">
                                <span className="jjs1">Date : </span>
                                <span className="jjs2">
                                  {formatDate(dateCV)}
                                </span>
                              </div>
                              {/* Additional fields for Contre Visit */}
                              <div className="ffg">
                                <span className="jjs1">Fait : </span>
                                <span className="jjs2">
                                  {fait === "1" ? "Oui" : "No"}
                                </span>
                              </div>
                              {fait === "1" ? (
                                <>
                                  <div className="ffg">
                                    <span className="jjs1">Résultat : </span>
                                    <span className="jjs2">
                                      {resultat === "1"
                                        ? "Justifier"
                                        : "Non Justifier"}
                                    </span>
                                  </div>
                                  {resultat === "1" ? (
                                    <div className="ffg">
                                      <span className="jjs1">
                                        Type de congé:{" "}
                                      </span>
                                      <span className="jjs2">
                                        {type === "1"
                                          ? "Courte Période"
                                          : type === "2"
                                          ? "Intermédiaire"
                                          : type === "3"
                                          ? "Longue Période"
                                          : null}
                                      </span>
                                    </div>
                                  ) : null}
                                </>
                              ) : fait === "0" ? (
                                <div className="ffg">
                                  <span className="jjs1">Explication: </span>
                                  <span className="jjs2">
                                    {explication === "1"
                                      ? "Justifier"
                                      : "Non Justifier"}
                                  </span>
                                </div>
                              ) : null}
                            </>
                          ) : null}
                          <div className="ffg" id="kk3">
                            <button
                              className="sbt"
                              id="ccl"
                              onClick={() => {
                                setConfirm(false);
                              }}
                            >
                              Annuler
                            </button>
                            <button className="confirm" onClick={handleSubmit}>
                              Confirmer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <Ajouter
                    id={id}
                    pas={hasActiveCertifToday()}
                    id_user={userData.id}
                  />
                )}
                <div className="cetif-cards">
                  <div className="dates">
                    <input className="date111" value={"Année"} readOnly />
                    <select
                      className="date123"
                      onChange={(e) => setAnnee(e.target.value)}
                    >
                      <option value={"*"}>Toute</option>
                      {yesrsUser.map((yr, index) => (
                        <option
                          key={index}
                          value={yr.year}
                          selected={yr.year === annee}
                        >
                          {yr.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  {userCertif.length > 0 ? (
                    userCertif.map((certif, index) => {
                      const daysDifference = calculateDaysDifference(
                        certif.date_debut,
                        certif.date_fin
                      );
                      const remaining = calculateDaysLeft(certif.date_fin);
                      return (
                        <div
                          className="certif5"
                          key={index}
                          onClick={() => {
                            const specificCertif = certif;
                            if (specificCertif) {
                              setSpesificCertif(specificCertif);
                              setDate_debut(specificCertif.date_debut);
                              setDate_depot(specificCertif.date_depot);
                              setDate_fin(specificCertif.date_fin);
                              setContreVisit(
                                specificCertif.contre_visit.toString()
                              );
                              setDateCV(specificCertif.date_cv);
                              setFait(specificCertif.fait.toString());
                              setResultat(specificCertif.resultat.toString());
                              setExplication(
                                specificCertif.explication.toString()
                              );
                              setType(specificCertif.type_conge.toString());
                              const dt1 = new Date(specificCertif.date_debut);
                              const dt2 = new Date(specificCertif.date_fin);
                              const daysDifference = calculateDaysDifference(
                                dt2,
                                dt1
                              );
                            }
                          }}
                          style={
                            spesificCertif && spesificCertif.id === certif.id
                              ? {
                                  backgroundColor: "#406eac",
                                  color: "white",
                                }
                              : remaining > 0
                              ? {
                                  border: "2px solid green",
                                  backgroundColor: "#25a1590b",
                                }
                              : {}
                          }
                        >
                          <div className="card-hd">N° - {certif.id}</div>
                          <div className="llrr1">
                            <div>
                              <span>Date de dépot : </span>{" "}
                              <span id="ddn">
                                {formatDate(certif.date_depot)}
                              </span>
                            </div>
                            <div>
                              <span>Mode contre visit : </span>{" "}
                              <span id="ddn">
                                {certif.contre_visit === 1 ? "Oui" : "Non"}
                              </span>
                            </div>
                            <div>
                              <span>
                                {remaining > 0
                                  ? "Reste :"
                                  : remaining <= 0
                                  ? "Écoulés :"
                                  : null}
                              </span>{" "}
                              <input
                                id="ddn"
                                className="kkn5"
                                disabled
                                value={
                                  remaining >= 0
                                    ? remaining - 1 + " Jours"
                                    : remaining < 0
                                    ? remaining + " Jours"
                                    : null
                                }
                              />
                            </div>
                          </div>
                          <div className="llrr1">
                            <div>
                              <span>Date de Début : </span>{" "}
                              <span id="ddn">
                                {formatDate(certif.date_debut)}
                              </span>
                            </div>
                            <div>
                              <span>Date de Fin : </span>{" "}
                              <span id="ddn">
                                {formatDate(certif.date_fin)}
                              </span>
                            </div>
                            <div>
                              <span>Duration : </span>{" "}
                              <input
                                id="ddn"
                                className="kkn5"
                                style={
                                  daysDifference > 90
                                    ? {
                                        border: "1px solid red",
                                      }
                                    : {}
                                }
                                disabled
                                value={daysDifference + " Jours"}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <h4>Il n'y a aucun certificat pour ce patient.</h4>
                  )}
                </div>
              </div>
            ) : (
              <div className="cartif11">
                <AjouterImg id={id} />
                {images.map((img) => {
                  const fullUrl = `${baseURL}${img.url}`;
                  return (
                    <div className="grid2" key={img.id}>
                      <img
                        src={vvw}
                        alt="Preview"
                        className="pvvvvl"
                        width="50px"
                        onClick={() => {
                          setIm(img);
                        }}
                      />
                      {img.filename === ".pdf" ? (
                        <iframe
                          className="ooppm"
                          src={fullUrl}
                          width="100%"
                          height="100%"
                          title="PDF Viewer"
                        ></iframe>
                      ) : (
                        <img
                          className="ooppm"
                          src={fullUrl}
                          width="100%"
                          alt="Certif Image"
                        />
                      )}
                      <p className="nnddw">
                        <span>Date ajoutée:</span>
                        <span className="ll32">
                          {formatDateTime(img.created_date)}
                        </span>
                        {userData.admin === 2 ? (
                          <img
                            src={bin1}
                            width="30px"
                            className="klfehuie"
                            onClick={() => deleteImg(img.id)}
                          />
                        ) : null}
                      </p>
                    </div>
                  );
                })}

                {im ? (
                  <div className="nnkk57">
                    <button
                      onClick={() => {
                        setIm(null);
                      }}
                    >
                      ✖
                    </button>
                    {im.url.endsWith(".pdf") ? (
                      <iframe
                        src={`${baseURL}${im.url}`}
                        width="100%"
                        height="600px"
                      ></iframe>
                    ) : (
                      <img src={`${baseURL}${im.url}`} alt="Selected Image" />
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else if (!userData && loading) {
    window.location.href = "/login";
    return null;
  }
}

export default Add;
