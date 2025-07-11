import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./components/pages/DashboardPage.tsx";

import AllRoutes from "./components/pages/AllRoutes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {" "}
    <AllRoutes />
  </StrictMode>
);
