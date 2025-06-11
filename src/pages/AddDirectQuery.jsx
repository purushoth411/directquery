import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";


const VALID_HOURS = 4;
const STORAGE_KEY = "direct_query_access";

const AddDirectQuery = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(STORAGE_KEY) ? true : false);
  const [showModal, setShowModal] = useState(false);
  const [changeCodeModal, setChangeCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);
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

  const handleChangeCodeModel =()=>{
    setShowModal(false);
    setCode("");
    setChangeCodeModal(true);
}
const handleVerifyEmail=async ()=>{
    if(!email || !email.includes("@")) {
        toast.error("Please enter a valid email address.");
        return;
    }
   
    try{
 setLoading(true);
   const response= await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/verifyemail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    })
    const data=await response.json();
   
        if(data.status) {
            setVerifyEmail(true);
            toast.success("Email verified successfully! Please check your inbox for the code.");
        } else {
            toast.error(data.message || "Failed to verify email. Please try again.");
        }
    }
    catch(error) {
        console.error("Error verifying email:", error);
        toast.error("Error verifying email. Please try again.");
    }
    finally{
        setLoading(false);
    }

}

const handleChangeCode=async ()=>{
    try{
        setLoading(true);
        if(!code || code.length !== 4) {
          toast.error("Please enter a valid 4-digit code.");
            return;
        }
        const response= await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/updatewebcode",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ email,code }),
        })
        const data = await response.json();
        if(data.status){
           
        
            setChangeCodeModal(false);
            if(!isAuthenticated) {
                setShowModal(true);
                
            }
            setCode("");
            setEmail("");
            toast.success("Code changed successfully!");
        }else{
            toast.error(data.message || "Cannot change code. Please try again.");
        }
    }catch (error) {
      console.error("Error Changing code:", error);
      toast.error("Error in changing code. Please try again.");
      return;
    }finally{
        setLoading(false);
    }

}

  const handleCodeSubmit = async () => {
    try{
        setLoading(true);
        if(!code || code.length !== 4) {
          toast.error("Please enter a valid 4-digit code.");
            return;
        }
        const response= await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/verifycode",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ code }),
        })
        const data = await response.json();
        if(data.status){
            setIsAuthenticated(true);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: new Date().getTime() }));
            setShowModal(false);
            toast.success("Code verified successfully!");
        }else{
            toast.error(data.message || "Invalid code. Please try again.");
        }
    }catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Error verifying code. Please try again.");
      return;
    }finally{
        setLoading(false);
    }
    
  };

  const handleQuerySubmit = async (e) => {
    
    try{
        setLoading(true);
       const response= await fetch("https://instacrm.rapidcollaborate.com/directqueryapi/submit-add-query", {
            method:"POST",
            headers:{
                "Content-Type":"application/json",

            },
            body:JSON.stringify({query})
        })
        const data= await response.json();
        if(data.status){
            toast.success("Query added successfully!");
             setQuery("");
        }else{
            toast.error(data.message || "Failed to add query. Please try again.");
        }
        
    }catch(error){
        console.error("Error Submitting query:", error);
      toast.error("Error submitting query. Please try again.");
      return;
    }finally{
        setLoading(false); 
    }

  };

 return (
    <div className="container mt-5">
      {/* Security Code Modal */}
      {showModal && !isAuthenticated && (
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
                <button
                  className="btn btn-primary"
                  onClick={handleCodeSubmit}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                   { !loading && (
                <button className="btn btn-secondary" onClick={handleChangeCodeModel} disabled={loading}>
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
              <h5 className="modal-title mb-3">Change Web Code</h5>
              <input
                type="email"
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              {!verifyEmail && (
                <button
                  className="btn btn-primary w-100"
                  onClick={handleVerifyEmail}
                  disabled={loading}
                >
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
                  <button
                    className="btn btn-success w-100 mt-3"
                    onClick={handleChangeCode}
                    disabled={loading}
                  >
                    {loading ? "Changing..." : "Change Code"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Authenticated Content */}
      {isAuthenticated && (
        <div>
          <h3>Add Direct Query</h3>
          <form onSubmit={handleQuerySubmit}>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="6"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query here..."
                required
              ></textarea>
            </div>
            <div className="text-end">
            <button className="btn btn-warning" disabled={loading}>
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
