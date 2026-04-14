import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// 💥 GLOBAL ERROR CATCHER
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("🔥 ROOT CRASH:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "white", background: "black" }}>
          <h1>⚠️ PowerStream Recovered</h1>
          <p>App crashed but stayed alive.</p>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
