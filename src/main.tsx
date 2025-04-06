
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "./components/ui/toaster"

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  const rootDiv = document.createElement("div");
  rootDiv.id = "root";
  document.body.appendChild(rootDiv);
}

// Create root and render the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>
);
