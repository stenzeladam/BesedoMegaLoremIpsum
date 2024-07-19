import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const heading = document.querySelector("#instructions");
  if (heading) {
    heading.textContent = 'Select a root note, a mode, and a tuning:';
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
