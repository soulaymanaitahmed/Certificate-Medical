import ReactDOM from "react-dom";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./Components/Styles/Index.css";
import Users from "./Components/Pages/Users";
import Patients from "./Components/Pages/Patients";
import LogIn from "./Components/Pages/LogIn";
import Add from "./Components/Pages/Add";
import Home from "./Components/Pages/Home";
import NotFound from "./Components/Pages/NotFound";

const root = document.getElementById("root");

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/users" element={<Users />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/add/:id" element={<Add />} />
      <Route path="/patients" element={<Patients />} />
    </Routes>
  </BrowserRouter>,
  root
);
