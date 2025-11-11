import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // make sure Tailwind is imported here
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ToastProvider>
  </React.StrictMode>
);
