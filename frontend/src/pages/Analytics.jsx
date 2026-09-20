import React from "react";
import "../styles/analytics.css";

export default function Analytics() {
  return (
    <>
      <main className="analytics-page">  <header className="analytics-header"> <h1>
                11. ANALYTICS & REPORTS
            </h1> <div className="analytics-controls"> <select className="period-select"> <option>Today</option> <option>7 Days</option> <option>30 Days</option> <option>Custom</option> </select> <button className="calendar-btn" aria-label="Select date">

                    📅

                </button> </div> </header>  <section className="analytics-stats">  <div className="analytics-stat-card"> <div className="stat-icon blue">
                    ♟
                </div> <div className="stat-content"> <span>
                        Total Visitors
                    </span> <strong>
                        18,450
                    </strong> </div> </div>  <div className="analytics-stat-card"> <div className="stat-icon blue">
                    ◷
                </div> <div className="stat-content"> <span>
                        Peak Hour
                    </span> <strong>
                        7 PM - 8 PM
                    </strong> </div> </div>  <div className="analytics-stat-card"> <div className="stat-icon blue">
                    ⏱
                </div> <div className="stat-content"> <span>
                        Average Wait
                    </span> <strong>
                        42 min
                    </strong> </div> </div>  <div className="analytics-stat-card"> <div className="stat-icon blue">
                    ◔
                </div> <div className="stat-content"> <span>
                        Slot Utilization
                    </span> <strong>
                        78%
                    </strong> </div> </div> </section>  <section className="chart-grid top-charts">  <div className="chart-card"> <h2>
                    Crowd Trend
                </h2> <div className="chart-area"> <div className="y-axis"> <span>6K</span> <span>5K</span> <span>4K</span> <span>3K</span> <span>2K</span> <span>1K</span> </div> <div className="line-chart"> <div className="grid-lines"> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span> </div> <svg viewBox="0 0 500 180" preserveAspectRatio="none"> <polyline points="
                                10,125
                                55,102
                                100,72
                                145,86
                                190,63
                                235,106
                                280,75
                                325,115
                                370,25
                                415,90
                                455,65
                                490,68
                                " fill="none" stroke="#1769d1" strokeWidth="3"></polyline> <circle cx="10" cy="125" r="4"></circle> <circle cx="55" cy="102" r="4"></circle> <circle cx="100" cy="72" r="4"></circle> <circle cx="145" cy="86" r="4"></circle> <circle cx="190" cy="63" r="4"></circle> <circle cx="235" cy="106" r="4"></circle> <circle cx="280" cy="75" r="4"></circle> <circle cx="325" cy="115" r="4"></circle> <circle cx="370" cy="25" r="4"></circle> <circle cx="415" cy="90" r="4"></circle> <circle cx="455" cy="65" r="4"></circle> <circle cx="490" cy="68" r="4"></circle> </svg> <div className="x-axis"> <span>12 AM</span> <span>04 AM</span> <span>08 AM</span> <span>12 PM</span> <span>04 PM</span> <span>12 AM</span> </div> </div> </div> </div>  <div className="chart-card"> <h2>
                    Booking Trend
                </h2> <div className="bar-chart"> <div className="bar-y-axis"> <span>50</span> <span>40</span> <span>30</span> <span>20</span> <span>10</span> <span>0</span> </div> <div className="bars"> <div className="bar-group"> <div className="bar" style={{height: "72%"}}> </div> <span>3rd</span> </div> <div className="bar-group"> <div className="bar" style={{height: "40%"}}> </div> <span>5th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "96%"}}> </div> <span>10th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "76%"}}> </div> <span>15th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "55%"}}> </div> <span>20th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "78%"}}> </div> <span>25th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "70%"}}> </div> <span>28th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "28%"}}> </div> <span>30th</span> </div> <div className="bar-group"> <div className="bar" style={{height: "100%"}}> </div> <span>31st</span> </div> </div> </div> </div>  <div className="chart-card"> <h2>
                    Wait Time Trend
                </h2> <div className="chart-area"> <div className="y-axis"> <span>500</span> <span>400</span> <span>300</span> <span>200</span> <span>100</span> </div> <div className="line-chart"> <div className="grid-lines"> <span></span> <span></span> <span></span> <span></span> <span></span> </div> <svg viewBox="0 0 500 180" preserveAspectRatio="none"> <polyline points="
                                10,115
                                60,35
                                110,95
                                160,145
                                210,68
                                260,80
                                310,67
                                360,87
                                410,42
                                460,12
                                490,25
                                " fill="none" stroke="#1769d1" strokeWidth="3"></polyline> <circle cx="10" cy="115" r="4"></circle> <circle cx="60" cy="35" r="4"></circle> <circle cx="110" cy="95" r="4"></circle> <circle cx="160" cy="145" r="4"></circle> <circle cx="210" cy="68" r="4"></circle> <circle cx="260" cy="80" r="4"></circle> <circle cx="310" cy="67" r="4"></circle> <circle cx="360" cy="87" r="4"></circle> <circle cx="410" cy="42" r="4"></circle> <circle cx="460" cy="12" r="4"></circle> <circle cx="490" cy="25" r="4"></circle> </svg> <div className="x-axis"> <span>12 AM</span> <span>04 AM</span> <span>08 AM</span> <span>12 PM</span> <span>04 PM</span> <span>12 AM</span> </div> </div> </div> </div> </section>  <section className="chart-grid bottom-charts">  <div className="chart-card donut-card"> <h2>
                    Gate Occupancy
                </h2> <div className="donut-wrapper"> <div className="donut gate-donut"> <div className="donut-hole"></div> </div> <div className="legend"> <div> <i className="red"></i>
                            High
                            <strong>35%</strong> </div> <div> <i className="orange"></i>
                            Medium
                            <strong>40%</strong> </div> <div> <i className="green"></i>
                            Low
                            <strong>25%</strong> </div> </div> </div> </div>  <div className="chart-card donut-card"> <h2>
                    Parking Occupancy
                </h2> <div className="donut-wrapper"> <div className="donut parking-donut"> <div className="donut-hole"></div> </div> <div className="legend"> <div> <i className="dark-green"></i>
                            Available
                            <strong>45%</strong> </div> <div> <i className="light-green"></i>
                            Partially Full
                            <strong>35%</strong> </div> <div> <i className="orange"></i>
                            Full
                            <strong>20%</strong> </div> </div> </div> </div>  <div className="chart-card"> <h2>
                    Emergency Response Time
                </h2> <div className="emergency-bars"> <div className="emergency-y"> <span>50</span> <span>40</span> <span>30</span> <span>20</span> <span>10</span> <span>0</span> </div> <div className="emergency-chart"> <div className="emergency-bar" style={{height: "66%"}}> <span>2nd</span> </div> <div className="emergency-bar" style={{height: "40%"}}> <span>5th</span> </div> <div className="emergency-bar" style={{height: "84%"}}> <span>10th</span> </div> <div className="emergency-bar" style={{height: "57%"}}> <span>15th</span> </div> <div className="emergency-bar" style={{height: "70%"}}> <span>20th</span> </div> <div className="emergency-bar" style={{height: "84%"}}> <span>25th</span> </div> <div className="emergency-bar" style={{height: "100%"}}> <span>30th</span> </div> <div className="emergency-bar" style={{height: "118%"}}> <span>31st</span> </div> </div> </div> </div> </section> </main>
    </>
  );
}
