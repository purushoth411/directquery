import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column vh-100 w-100">
      <Header />
      <main className="flex-grow-1 w-100 overflow-auto" id="scroll-container">
        <div className="container-fluid p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
