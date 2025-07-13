import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./LoginPage";
import MainPage from "./MainPage";
import SignUpPage from "./SignUpPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPassword";

const AllRoutes = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<MainPage />}></Route>
          <Route path="/register" element={<SignUpPage />}></Route>

          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default AllRoutes;
