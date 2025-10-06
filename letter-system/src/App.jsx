import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../src/register";
import Login from "../src/login";
import User from "../src/user";
import Show from "../src/show";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<User />} />
        <Route path="/show" element={<Show />} />
      </Routes>
    </Router>
  );
}

export default App;
