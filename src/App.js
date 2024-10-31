import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [elaImageUrl, setElaImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setPreviewUrl(URL.createObjectURL(event.target.files[0]));
    setElaImageUrl(null); // Reset ELA image when a new file is uploaded
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      // Check if response is a blob (for forgery detected)
      if (response.headers["content-type"] === "image/jpeg") {
        const imageBlob = new Blob([response.data], { type: "image/jpeg" });
        setElaImageUrl(URL.createObjectURL(imageBlob));
      } else {
        // Otherwise, treat it as JSON
        const data = response.data;
        alert(data.message); // Display the message from the server
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to perform ELA analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>ELA Forgery Detection</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Original Image Preview</h3>
          <img
            src={previewUrl}
            alt="Original"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: "20px" }}
      >
        {loading ? "Processing..." : "Upload and Analyze"}
      </button>
      {elaImageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>ELA Result</h3>
          <img
            src={elaImageUrl}
            alt="ELA"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
