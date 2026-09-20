import React from "react";
import "../styles/emergency_command.css";

export default function EmergencySos() {
  return (
    <>
      <section className="emergency-page container">
        <div className="card emergency-report-card">
          <h1>Emergency SOS</h1>
          <p>Report an emergency to temple authorities.</p>
          <label htmlFor="emergency-type">Emergency Type</label>
          <select id="emergency-type" defaultValue="Medical">
            <option>Medical</option>
            <option>Fire</option>
            <option>Crowd Surge</option>
            <option>Missing Person</option>
            <option>Security</option>
            <option>Weather</option>
          </select>
          <label htmlFor="emergency-location">Location</label>
          <input id="emergency-location" type="text" placeholder="Enter location" />
          <label htmlFor="emergency-description">Description</label>
          <textarea
            id="emergency-description"
            className="emergency-description"
            placeholder="Describe the emergency"
            rows="5"
          />
          <button type="button" className="btn btn-primary">
            Send Emergency Alert
          </button>
        </div>
      </section>
    </>
  );
}
