import React from "react";
import LoginPage from "./LoginPage.jsx";

/**
 * Alias route/page for auth systems that import Login.jsx.
 * Keeps a single production login implementation.
 */
export default function Login() {
  return <LoginPage />;
}
