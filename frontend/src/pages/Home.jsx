import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession } from "../api/client";
import "../styles/style.css";
import "../styles/responsive.css";

export default function Home() {
    const navigate = useNavigate();
    const handleLogout = () => {
        clearSession();
        navigate('/login', { replace: true });
    };

  return (
    <>
      <header className="navbar"> <div className="nav-container">  <a href="/" className="logo"> <span className="logo-icon">♜</span> <span>
                    DarshanSetu 
                </span> </a>  <nav className="nav-links"> <a href="/" className="active">
                    Home
                </a> <a href="/admin" className="nav-link">
                    Admin
                </a> <a href="/live-crowd">
                    Live Crowd
                </a> <Link to="/darshan-booking">
                    Book Darshan
                </Link> <a href="/virtual-darshan">
                    Virtual Darshan
                </a> <a href="/services">
                    Services <span className="arrow">⌄</span> </a> </nav>  <div className="nav-right"> <span className="language">
                    EN <span>|</span> हिंदी
                </span> <a href="/login" className="login-btn">
                    Login
                </a> </div> </div> </header><main> <section className="hero"> <div className="hero-container">  <div className="hero-content"> <h1>
                        DarshanSetu
                    </h1> <h2>
                        Predictive Crowd Intelligence
                        <br />
                        for Safer Darshan
                    </h2> <p>
                        Estimate today’s crowd, predict tomorrow’s
                        risks and help temple authorities act before
                        congestion becomes dangerous.
                    </p>  <div className="hero-buttons"> <a href="/live-crowd" className="hero-btn btn-maroon"> <span>♟</span>
                            Check Live Crowd
                        </a> <Link to="/darshan-booking" className="hero-btn btn-orange"> <span>▣</span>
                            Book Darshan
                        </Link> <a href="/emergency" className="hero-btn btn-outline-red"> <span>♙</span>
                            Emergency Help
                        </a> </div> </div>  <div className="hero-image"> <img src="/assets/temple_image.png" alt="Temple illustration" /> </div> </div> </section>  <section className="stats-section"> <div className="stats-container">  <div className="stat-card"> <div className="stat-content"> <span className="stat-title">
                            Current Visitors
                        </span> <strong className="stat-number">
                            7,850
                        </strong> <span className="stat-subtitle">
                            Estimated
                        </span> </div> <div className="stat-icon visitors">
                        ♟
                    </div> </div>  <div className="stat-card"> <div className="stat-content"> <span className="stat-title">
                            Temple Capacity
                        </span> <strong className="stat-number">
                            10,000
                        </strong> <span className="stat-subtitle">
                            Maximum
                        </span> </div> <div className="stat-icon capacity">
                        ♜
                    </div> </div>  <div className="stat-card"> <div className="stat-content"> <span className="stat-title">
                            Occupancy
                        </span> <strong className="stat-number">
                            78.5%
                        </strong> <span className="stat-subtitle">
                            of Capacity
                        </span> </div> <div className="occupancy-ring"> <div className="ring-inner"></div> </div> </div>  <div className="stat-card"> <div className="stat-content"> <span className="stat-title">
                            Estimated Wait
                        </span> <strong className="stat-number">
                            42 min
                        </strong> <span className="stat-subtitle">
                            Average
                        </span> </div> <div className="stat-icon wait">
                        ◷
                    </div> </div>  <div className="stat-card"> <div className="stat-content"> <span className="stat-title">
                            Risk
                        </span> <strong className="risk-number">
                            HIGH
                        </strong> <span className="stat-subtitle">
                            Crowd Risk
                        </span> </div> <div className="stat-icon danger">
                        !
                    </div> </div> </div> </section>  <section className="works-section"> <div className="works-container">  <div className="works-main"> <h2>
                        How DarshanSetu Works
                    </h2> <div className="steps-container">  <div className="step"> <div className="step-number">
                                1
                            </div> <div className="step-icon">
                                ▤
                            </div> <h3>
                                Collect
                            </h3> <p>
                                Digital bookings, QR check-ins,
                                staff inputs & operational data
                            </p> </div> <div className="step-arrow">
                            →
                        </div>  <div className="step"> <div className="step-number">
                                2
                            </div> <div className="step-icon">
                                ▥
                            </div> <h3>
                                Estimate
                            </h3> <p>
                                Calculate current crowd from
                                multiple data sources
                            </p> </div> <div className="step-arrow">
                            →
                        </div>  <div className="step"> <div className="step-number">
                                3
                            </div> <div className="step-icon">
                                ♧
                            </div> <h3>
                                Predict
                            </h3> <p>
                                AI prototype predicts future
                                crowd & demand
                            </p> </div> <div className="step-arrow">
                            →
                        </div>  <div className="step"> <div className="step-number">
                                4
                            </div> <div className="step-icon">
                                ♢
                            </div> <h3>
                                Recommend
                            </h3> <p>
                                Smart actions to prevent
                                congestion & risk
                            </p> </div> <div className="step-arrow">
                            →
                        </div>  <div className="step"> <div className="step-number">
                                5
                            </div> <div className="step-icon">
                                ◀
                            </div> <h3>
                                Respond
                            </h3> <p>
                                Execute actions, manage &
                                measure impact
                            </p> </div> </div> </div>  <div className="hardware-card"> <h3>
                        No New Hardware Required
                    </h3> <p>
                        DarshanSetu works using digital
                        bookings, QR check-ins, staff inputs
                        and operational data.
                    </p> <p>
                        Existing CCTV/IoT systems can
                        optionally be integrated later.
                    </p> <div className="cloud-icon">
                        ☁
                    </div> </div> </div> </section>  <section className="data-flow-section"> <div className="data-flow"> <div className="flow-item"> <span>▤</span>
                    DATA
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>▥</span>
                    ESTIMATE
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>♧</span>
                    PREDICT
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>♢</span>
                    IDENTIFY RISK
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>◀</span>
                    RECOMMEND
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>▷</span>
                    ACT
                </div> <span className="flow-arrow">→</span> <div className="flow-item"> <span>⌁</span>
                    MEASURE
                </div> </div> </section> </main>
    </>
  );
}
