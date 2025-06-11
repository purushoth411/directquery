import React, { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useModal } from "../utils/ModalContext";


const Modal = ({ showModal, setShowModal, setIsAuthenticated, loading, setLoading, STORAGE_KEY }) => {
  const {changeCodeModal, setChangeCodeModal, noBack, setNoBack} = useModal();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);

  const handleChangeCodeModel = () => {
    setShowModal(false);
    setCode("");
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
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (data.status) {
        setChangeCodeModal(false);
        setCode("");
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
        body: JSON.stringify({ code }),
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
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h5 className="modal-title mb-3">Enter 4-digit Security Code</h5>
              <input
                type="password"
                className="form-control text-center mb-3"
                maxLength="4"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={handleCodeSubmit} disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                {!loading && (
                  <button className="btn btn-secondary" onClick={handleChangeCodeModel}>
                    Change Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Code Modal */}
      {changeCodeModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h5 className="modal-title mb-3 d-flex justify-content-between">Change Web Code  
                
             <X sixe={17} onClick={handleClose} style={{cursor:"pointer"}}/>
            
            </h5>
              <input
                type="email"
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              {!verifyEmail && (
                <button className="btn btn-primary w-100" onClick={handleVerifyEmail} disabled={loading}>
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              )}
              {verifyEmail && (
                <>
                  <input
                    type="text"
                    maxLength="4"
                    className="form-control mt-3 text-center"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 4-digit code"
                  />
                  <button className="btn btn-success w-100 mt-3" onClick={handleChangeCode} disabled={loading}>
                    {loading ? "Changing..." : "Change Code"}
                  </button>
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
