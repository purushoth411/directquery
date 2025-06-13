import { createContext, useContext, useState } from 'react';

// Create Context
const ModalContext = createContext();

// Create a provider component
export const ModalProvider = ({ children }) => {
  const [changeCodeModal, setChangeCodeModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noBack, setNoBack] = useState(false);
const STORAGE_KEY = "direct_query_access";
const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(STORAGE_KEY) ? true : false
  );
   const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setShowModal(true);
  };

  return (
    <ModalContext.Provider value={{
      showModal,
      setShowModal,
      changeCodeModal,
      setChangeCodeModal,
      noBack,
      setNoBack,
      isAuthenticated,
      setIsAuthenticated,
      STORAGE_KEY,
       logout, 
    }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to access the selected user context
export const useModal = () => {
  return useContext(ModalContext);
};