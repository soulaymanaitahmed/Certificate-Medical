import React, { useState } from "react";
import axios from "axios";
import img5 from "../Components/Images/scaned.png";

function AjouterImg(props) {
  axios.defaults.withCredentials = true;
  const id = props.id;

  const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const port = 8081;
    return `${protocol}//${hostname}:${port}`;
  };

  const baseURL = getBaseURL();

  const [img, setImg] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = (event) => {
    setImg(event.target.files[0]);
    const fileName = event.target.files[0].name;
    setSelectedFileName(fileName);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("img", img);
    formData.append("id", id);

    try {
      const response = await axios.post(`${baseURL}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Image uploaded successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <form className="grid1" onSubmit={handleSubmit}>
      <input
        required
        style={{ display: "none" }}
        id="user_img"
        name="user_img"
        type="file"
        accept="image/png, image/jpeg, application/pdf"
        onChange={handleFileChange}
      />
      <label htmlFor="user_img" className="ddvv7">
        <div className="upload1">
          <img src={img5} className="usergg" width="80px" alt="Upload icon" />
          <span>Sélectionner une image</span>
        </div>
      </label>
      {selectedFileName && (
        <p>
          Nom de fichier : <span className="llmm6">{selectedFileName}</span>
        </p>
      )}
      <button type="submit">Upload</button>
    </form>
  );
}

export default AjouterImg;
