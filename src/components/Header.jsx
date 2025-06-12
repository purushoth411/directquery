import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut, CircleUserRound, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useModal } from "../utils/ModalContext";

export default function Header() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const {showModal, setShowModal} = useModal();
  const { changeCodeModal, setChangeCodeModal } = useModal();
  const { logOutModal, setlogOutModal } = useModal();
  const { noBack, setNoBack } = useModal();
  const {isAuthenticated, setIsAuthenticated}=useModal();

  return (
     isAuthenticated && (
    <header className="bg-white text-dark shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between px-4 py-2">
        <h1 className="fs-4 mb-0 fw-bold d-flex align-items-center" style={{ cursor: "pointer" }}>
          <span role="img" aria-label="plate">
            InstaCrm - DirectQuery
          </span>
        </h1>
         <div className="d-flex gap-2">
          <button
            onClick={()=>{
              setChangeCodeModal(true);
              setNoBack(true);
            }}
              className="btn btn-secondary btn-sm n-btn" >
                      Change Code
                    </button>
            
         </div>
      </div>
    </header>

      )
  );
}