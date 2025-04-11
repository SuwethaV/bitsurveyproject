import React, { useState } from "react";
import axios from "axios";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    Rollno: "",
    Name: "",
    Year: "",
    Email: "",
    Department: "", // Added Department field
    Mentor: "",
    Rp: "",
    C_levels: "",
    Python_levels: "",
    Java_levels: "",
    Dbms_levels: "",
    ProblemSolving: "",
    Uiux: "",
    Aptitude: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.post("http://localhost:5000/student", formData)
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        console.error('Error saving student details:', err);
        alert('Failed to save student details. Please try again.');
      });
  };

  const handleUpdate = () => {
    axios.put(`http://localhost:5000/student/${formData.Rollno}`, formData)
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        console.error('Error updating student details:', err);
        alert('Failed to update student details. Please try again.');
      });
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "100vw",
        minHeight: "100vh",
        boxSizing: "border-box",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#fff",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "lightviolet" }}>Student Details Form</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", color: "#555" }}>
                {key.replace(/_/g, " ")}:
              </label>
              <input
                type={key === "Email" ? "email" : "text"}
                name={key}
                placeholder={`Enter ${key.replace(/_/g, " ")}`}
                value={formData[key]}
                onChange={handleChange}
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "70%", // Reduced width to 50%
                }}
              />
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              style={{
                backgroundColor: "#7B61FF",
                color: "#fff",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                flex: "1",
                minWidth: "120px",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              style={{
                backgroundColor: "#7B61FF",
                color: "#fff",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                flex: "1",
                minWidth: "120px",
              }}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;