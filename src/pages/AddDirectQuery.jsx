import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Modal from "../components/Modal";
import { useModal } from "../utils/ModalContext";

const VALID_HOURS = 4;


const AddDirectQuery = () => {
  
  const {showModal, setShowModal,isAuthenticated, setIsAuthenticated,STORAGE_KEY} = useModal();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const access = sessionStorage.getItem(STORAGE_KEY);
    if (access) {
      const parsed = JSON.parse(access);
      const now = new Date().getTime();
      if (now - parsed.timestamp < VALID_HOURS * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        return;
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setShowModal(true);
  }, []);

  const handleQuerySubmit = async (e) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/directqueryapi/submit-add-query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Query added successfully!");
        setQuery("");
      } else {
        toast.error(data.message || "Failed to add query. Please try again.");
      }
    } catch (error) {
      console.error("Error Submitting query:", error);
      toast.error("Error submitting query. Please try again.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        setIsAuthenticated={setIsAuthenticated}
        loading={loading}
        setLoading={setLoading}
        STORAGE_KEY={STORAGE_KEY}
      />

      {/* Main Authenticated Content */}
      {isAuthenticated && (
        <div className="bg-white p-3 rounded shadow">
          <h3 className="fs-4">Add Direct Query</h3>
          <form>
            <div className="mb-3">
              <ReactQuill
                value={query}
                onChange={setQuery}
                placeholder="Enter Query Details ..."
              />
            </div>
            <div className="text-end">
              <button
                type="button"
                onClick={handleQuerySubmit}
                className="btn btn-warning btn-sm n-btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Minimal inline modal styles
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "8px",
  textAlign: "center",
};

export default AddDirectQuery;
