import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./LoginPage";
import MainPage from "./MainPage";
import SignUpPage from "./SignUpPage";

const AllRoutes = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<MainPage />}></Route>
          <Route path="/register" element={<SignUpPage />}></Route>

          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default AllRoutes;
