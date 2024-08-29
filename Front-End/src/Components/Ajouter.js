import React, { useEffect, useState } from "react";
import axios from "axios";

function Ajouter(props) {
  axios.defaults.withCredentials = true;

  const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const port = 8081;
    return `${protocol}//${hostname}:${port}`;
  };

  const baseURL = getBaseURL();

  const id = props.id;
  const id_user = props.id_user;
  const pas1 = false;

  const [current, setCurrent] = useState([]);

  const [date_debut, setDate_debut] = useState("");
  const [date_depot, setDate_depot] = useState("");
  const [date_fin, setDate_fin] = useState("");
  const [contreVisit, setContreVisit] = useState("0");
  const [dateCV, setDateCV] = useState("");
  const [fait, setFait] = useState("0");
  const [resultat, setResultat] = useState("0");
  const [explication, setExplication] = useState("0");
  const [type, setType] = useState("1");
  const [duree, setDuree] = useState(null);

  const [error1, setError1] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (date_debut && duree) {
      const startDate = new Date(date_debut);
      const endDate = new Date(
        startDate.getTime() + (duree - 1) * 24 * 60 * 60 * 1000
      );
      const formattedEndDate = endDate.toISOString().split("T")[0];
      setDate_fin(formattedEndDate);
    }
  }, [date_debut, duree]);

  useEffect(() => {
    fetchUserCertif();
  }, []);

  function getOldestDateDebut(current) {
    if (!current || current.length === 0) {
      return null;
    }
    return current.reduce((oldest, item) => {
      const currentDate = new Date(item.date_debut);
      const oldestDate = new Date(oldest);
      return currentDate < oldestDate ? item.date_debut : oldest;
    }, current[0].date_debut);
  }

  const oldestDateDebut = getOldestDateDebut(current);

  const fetchUserCertif = async () => {
    try {
      const response = await axios.get(`${baseURL}/certificate/${id}`, {
        params: { current },
        withCredentials: true,
      });
      setCurrent(response.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputDate = new Date(date_debut);
    const oldestDate = new Date(oldestDateDebut);
    const oneYearLater = new Date(oldestDate);
    oneYearLater.setFullYear(oldestDate.getFullYear() + 1);
    let year;
    if (
      oldestDateDebut &&
      inputDate >= oldestDate &&
      inputDate < oneYearLater
    ) {
      year = oldestDate.getFullYear();
    } else {
      year = inputDate.getFullYear();
    }

    try {
      const response = await axios.post(`${baseURL}/certificate`, {
        patientId: id,
        created_by: id_user,
        date_debut,
        date_depot,
        date_fin,
        contreVisit,
        dateCV,
        fait,
        resultat,
        explication,
        type,
        year,
      });
      console.log("Form submitted successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
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

  return (
    <form className="ajouter5">
      {/* ------------------------- Basic Informations ------------------------- */}
      <div className="ajouter-header">
        <h3>Ajouter Certificat Medical</h3>
        {pas1 > 0 ? (
          <span className="alert4">Ce patient a déjà un certificat actif</span>
        ) : null}
      </div>
      {pas1 === false ? (
        <>
          <div className="inputdiv">
            <label htmlFor="date_debut" className="label2">
              Date de Début
            </label>
            <input
              required
              className="addInput"
              id="date_debut"
              name="date_debut"
              type="date"
              value={date_debut}
              onChange={(e) => {
                setDate_debut(e.target.value);
              }}
            />
          </div>
          <div className="duree">
            <div className="duree-cont">
              Durée
              <input
                className="dur"
                min={1}
                type="number"
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
              />
            </div>
          </div>
          <div className="inputdiv">
            <label htmlFor="date_fin" className="label2">
              Date de Fin
            </label>
            <input
              readOnly
              className="addInput"
              id="date_fin"
              name="date_fin"
              type="date"
              value={date_fin}
            />
          </div>
          <div className="inputdiv">
            <label htmlFor="date_depot" className="label2">
              Date de Dépot
            </label>
            <input
              required
              className="addInput"
              id="date_depot"
              name="date_depot"
              type="date"
              // min={date_debut}
              value={date_depot}
              onChange={(e) => {
                setDate_depot(e.target.value);
              }}
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
                Contre Visit ne peut être sélectionné que si la durée est
                supérieure ou égale à 3 jours
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
                  min={date_debut}
                  max={date_fin}
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
                            <span className="na">Courte Période</span>
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
                            <span className="na">Période Intermédiaire</span>
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
                            <span className="na">Longue Période</span>
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
            <button className="sbt" type="button" onClick={handleCheckRequired}>
              Submit
            </button>
          </div>
          {error1 && (
            <>
              <br />
              <span className="allert1">{error1}</span>
            </>
          )}
        </>
      ) : null}
      {confirm && (
        <div className="all-cont">
          <div className="llqq">
            <div className="ffg">
              <span className="jjs1">Date début : </span>
              <span className="jjs2">{date_debut}</span>
            </div>
            <div className="ffg">
              <span className="jjs1">Date fin : </span>
              <span className="jjs2">{date_fin}</span>
            </div>
            <div className="ffg">
              <span className="jjs1">Date dépot : </span>
              <span className="jjs2">{date_depot}</span>
            </div>
            <div className="ffg">
              <span className="jjs1">Duration : </span>
              <span className="jjs2">{duree} - Jours</span>
            </div>
            <div className="ffg">
              <span className="jjs1">Contre Visit : </span>
              <span className="jjs2">{contreVisit === "1" ? "Oui" : "No"}</span>
            </div>
            {contreVisit === "1" ? (
              <>
                <div className="ffg">
                  <span className="jjs1">Date : </span>
                  <span className="jjs2">{dateCV}</span>
                </div>
                {/* Additional fields for Contre Visit */}
                <div className="ffg">
                  <span className="jjs1">Fait : </span>
                  <span className="jjs2">{fait === "1" ? "Oui" : "No"}</span>
                </div>
                {fait === "1" ? (
                  <>
                    <div className="ffg">
                      <span className="jjs1">Résultat : </span>
                      <span className="jjs2">
                        {resultat === "1" ? "Justifier" : "Non Justifier"}
                      </span>
                    </div>
                    {resultat === "1" ? (
                      <div className="ffg">
                        <span className="jjs1">Type de congé: </span>
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
                      {explication === "1" ? "Justifier" : "Non Justifier"}
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
  );
}
export default Ajouter;
