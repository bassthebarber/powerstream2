import React from "react";
import RegisterPage from "./RegisterPage.jsx";

/**
 * Alias route/page for auth systems that import Register.jsx.
 * Keeps a single production registration implementation.
 */
export default function Register() {
  return <RegisterPage />;
}
