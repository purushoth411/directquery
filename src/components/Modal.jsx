import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useModal } from "../utils/ModalContext";


const Modal = ({ showModal, setShowModal, setIsAuthenticated, loading, setLoading, STORAGE_KEY }) => {
  const {changeCodeModal, setChangeCodeModal, noBack, setNoBack} = useModal();
  const [code, setCode] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);

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

  const handleVerifyEmail = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/verifyemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.status) {
        setVerifyEmail(true);
        toast.success("Email verified successfully! Please check your inbox for the code.");
      } else {
        toast.error(data.message || "Failed to verify email. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("Error verifying email. Please try again.");
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
        body: JSON.stringify({ email, code : code.join("") }),
      });
      const data = await response.json();
      if (data.status) {
        setChangeCodeModal(false);
        setCode(["", "", "", ""]);
        setEmail("");
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
        toast.error("pls enter 4 digits");
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
        body: JSON.stringify({ code:code.join("") }),
      });
      const data = await response.json();
      if (data.status) {
        setIsAuthenticated(true);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: new Date().getTime() }));
        setShowModal(false);
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

  const handleClose= () =>{
    if(noBack){
        setShowModal(false);
        setChangeCodeModal(false);
        setNoBack(false);
    }else{
        setShowModal(true);
        setChangeCodeModal(false);
    }
  }

  return (
    <>
      {/* Security Code Modal */}
      {showModal && (
        <div className="modal  d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="modal-title mb-0 fs-6">Security Code</h5>
                
              </div>
              <div className="d-flex gap-2 align-items-end">
                <div className="w-100">
                  <label className="mb-1">Enter 4-digit Security Code</label>
                  <div style={{ display: "flex", gap: "8px" }}>
      {code && code.map((digit, index) => (
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
                {/* <div className="d-flex justify-content-between"> */}
                  <div>
                    <button className="btn btn-success btn-sm word-break-nowrap n-btn" onClick={handleCodeSubmit} disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  </div>
                  
                {/* </div> */}
              </div>
              <div className="mt-2">
                {!loading && (
                  <a href="javascript:void(0)" className="word-break-nowrap text-danger pointer" onClick={handleChangeCodeModel}>
                    Change Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Code Modal */}
      {changeCodeModal && (
        <div className="modal modal-sm d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h5 className="modal-title mb-3 d-flex justify-content-between align-items-center fs-6">
                Change Web Code  
                <button className="btn btn-danger n-close-btn btn-sm" onClick={handleClose}>
                  <X size={12}  />
                </button>
              </h5>
              <div className="d-flex flex-column gap-2 align-items-end">
                <div className="w-100">
                  <label className="mb-1">Enter your email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm f-13"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                {!verifyEmail && (
                  <div>
                     <button className="btn btn-success btn-sm n-btn word-break-nowrap " onClick={handleVerifyEmail} disabled={loading}>
                    {loading ? "Verifying..." : "Verify Email"}
                  </button>
                  </div>
                )}
              </div>
              {verifyEmail && (
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
                      <button className="btn btn-success btn-sm n-btn mt-3" onClick={handleChangeCode} disabled={loading}>
                        {loading ? "Changing..." : "Change Code"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
