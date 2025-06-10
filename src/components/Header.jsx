import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut, CircleUserRound, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function Header() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  return (
    <header className="bg-white text-dark shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between px-4 py-2">
        <h1 className="h2 mb-0 fw-bold d-flex align-items-center" style={{ cursor: "pointer" }}>
          <span role="img" aria-label="plate">
            InstaCrm
          </span>
        </h1>
      </div>
    </header>
  );
}