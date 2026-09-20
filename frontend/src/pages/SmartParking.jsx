import React from "react";
import "../styles/smart_parking.css";

export default function SmartParking() {
  return (
    <>
      <main className="parking-page">  <h1 className="page-title">
            9. SMART PARKING
        </h1>  <section className="parking-cards">  <div className="parking-card"> <div className="parking-title"> <span className="parking-icon">
                        P
                    </span> <h2>
                        Parking A
                    </h2> </div> <div className="parking-info"> <div className="info-row"> <span>Capacity</span> <strong>500</strong> </div> <div className="info-row"> <span>Occupied</span> <strong>410</strong> </div> <div className="info-row"> <span>Available</span> <strong className="available">
                            90
                        </strong> </div> </div> <div className="occupancy"> <div className="occupancy-text"> <strong className="high">
                            82%
                        </strong> <span>
                            Occupied
                        </span> </div> <div className="progress-bar"> <div className="progress-fill high-fill" style={{width: "82%"}}></div> </div> </div> </div>  <div className="parking-card"> <div className="parking-title"> <span className="parking-icon">
                        P
                    </span> <h2>
                        Parking B
                    </h2> </div> <div className="parking-info"> <div className="info-row"> <span>Capacity</span> <strong>350</strong> </div> <div className="info-row"> <span>Occupied</span> <strong>140</strong> </div> <div className="info-row"> <span>Available</span> <strong className="available">
                            210
                        </strong> </div> </div> <div className="occupancy"> <div className="occupancy-text"> <strong className="low">
                            40%
                        </strong> <span>
                            Occupied
                        </span> </div> <div className="progress-bar"> <div className="progress-fill low-fill" style={{width: "40%"}}></div> </div> </div> </div>  <div className="parking-card"> <div className="parking-title"> <span className="parking-icon">
                        P
                    </span> <h2>
                        Parking C
                    </h2> </div> <div className="parking-info"> <div className="info-row"> <span>Capacity</span> <strong>200</strong> </div> <div className="info-row"> <span>Occupied</span> <strong>160</strong> </div> <div className="info-row"> <span>Available</span> <strong className="critical">
                            40
                        </strong> </div> </div> <div className="occupancy"> <div className="occupancy-text"> <strong className="high">
                            80%
                        </strong> <span>
                            Occupied
                        </span> </div> <div className="progress-bar"> <div className="progress-fill high-fill" style={{width: "80%"}}></div> </div> </div> </div> </section>  <section className="parking-recommendation"> <div className="car-icon"> <img src="/assets/parking_illustration.png" alt="Parking illustration" /> </div> <div className="recommendation-text"> <h2>
                    Recommended Parking:
                    <strong>Parking B</strong> </h2> <p>
                    More available slots & faster exit.
                </p> </div> </section> </main>
    </>
  );
}
