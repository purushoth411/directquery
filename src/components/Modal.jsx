import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useModal } from "../utils/ModalContext";


const Modal = ({ showModal, setShowModal, setIsAuthenticated, loading, setLoading, STORAGE_KEY }) => {
  const {changeCodeModal, setChangeCodeModal, noBack, setNoBack} = useModal();
  const [code, setCode] = useState(["", "", "", ""]);
  const [username, setUsername] = useState("");
  const [verifyUsername, setVerifyUsername] = useState(false);

  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow digits or empty

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleChangeCodeModel = () => {
    setShowModal(false);
    setCode(["", "", "", ""]);
    setChangeCodeModal(true);
  };

  const handleVerifyUsername = async () => {
    if (!username ) {
      toast.error("Please enter a valid username.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/verifyUsername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.status) {
        setVerifyUsername(true);
        toast.success("Username verified successfully!OTP will display in Instacrm dashboard .");
      } else {
        toast.error(data.message || "Failed to verify username. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying username:", error);
      toast.error("Error verifying username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = async () => {
    try {
      setLoading(true);
      if (!code || code.length !== 4) {
        toast.error("Please enter a valid 4-digit code.");
        return;
      }
      const response = await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/updatewebcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, code : code.join("") }),
      });
      const data = await response.json();
      if (data.status) {
        setChangeCodeModal(false);
        setCode(["", "", "", ""]);
        setUsername("");
        if (!sessionStorage.getItem(STORAGE_KEY)) {
          setShowModal(true);
        }
        toast.success("Code changed successfully!");
      } else {
        toast.error(data.message || "Cannot change code. Please try again.");
      }
    } catch (error) {
      console.error("Error Changing code:", error);
      toast.error("Error in changing code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    try {
      if(code.join("").length != 4){
        toast.error("Pls enter 4 digits");
        return;
      }
      setLoading(true);
      if (!code || code.length !== 4) {
        toast.error("Please enter a valid 4-digit code.");
        return;
      }
      const response = await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/verifycode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, code : code.join("") }),
      });
      const data = await response.json();
      if (data.status) {
        setIsAuthenticated(true);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: new Date().getTime() }));
        setShowModal(false);
        setCode(["", "", "", ""]);
        setUsername("");
        setVerifyUsername(false);
        toast.success("Code verified successfully!");
      } else {
        toast.error(data.message || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Error verifying code. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Security Code Modal */}
      {showModal && (
         <div className="modal modal-sm d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h5 className="modal-title mb-3 d-flex justify-content-between align-items-center fs-6">
                InstaCrm - Login
               
              </h5>
              <div className="d-flex flex-column gap-2 align-items-end">
                <div className="w-100">
                  <label className="mb-1">Enter your username</label>
                  <input
                    type="text"
                    className="form-control form-control-sm f-13"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your Username"
                  />
                </div>
                {!verifyUsername && (
                  <div>
                     <button className="btn btn-success btn-sm n-btn word-break-nowrap " onClick={handleVerifyUsername} disabled={loading}>
                    {loading ? "Generating..." : "Generate OTP "}
                  </button>
                  </div>
                )}
              </div>
              {verifyUsername && (
                <>
                  <div className="gap-3 d-flex align-items-end">
                    <div className=" mt-3">
                      <label className="mb-1">Enter 4-digit code</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {code.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            className="form-control form-control-sm f-13 text-center"
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputs.current[index] = el)}
                            style={{ width: "35px" }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-end">
                      <button className="btn btn-success btn-sm n-btn mt-3" onClick={handleCodeSubmit} disabled={loading}>
                        {loading ? "Verifying..." : "Verify Code"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Code Modal */}
     
    </>
  );
};

export default Modal;
