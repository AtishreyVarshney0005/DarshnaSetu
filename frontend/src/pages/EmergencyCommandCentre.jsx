import React from "react";
import "../styles/emergency_command.css";

export default function EmergencyCommandCentre() {
  return (
    <>
      <main className="emergency-page">  <h1 className="page-title">
            8. EMERGENCY COMMAND CENTER
        </h1>  <section className="command-center">  <header className="command-header"> <div className="command-title"> <span className="command-icon">
                        🚨
                    </span> <span>
                        Emergency Command Center
                    </span> </div> <button type="button" onClick={() => alert("Emergency simulation started.")} className="simulate-btn"> <span>⚠</span>

                    Simulate Emergency

                </button> </header>  <div className="incident-tabs"> <button className="tab active">
                    Active Incidents
                </button> <button className="tab">
                    All Incidents
                </button> <button className="tab">
                    Resolved
                </button> </div>  <div className="incident-table-wrapper"> <table className="incident-table"> <thead> <tr> <th>ID</th> <th>Type</th> <th>Location</th> <th>Priority</th> <th>Created</th> <th>Status</th> <th>Actions</th> </tr> </thead> <tbody>  <tr> <td className="incident-id">
                                INC-1004
                            </td> <td>
                                Medical Emergency
                            </td> <td>
                                Gate 3
                            </td> <td> <span className="priority high">
                                    HIGH
                                </span> </td> <td>
                                7:42 PM
                            </td> <td> <span className="status assigned">
                                    ASSIGNED
                                </span> </td> <td className="actions"> <button>▷</button> <button>♧</button> <button>⊙</button> </td> </tr>  <tr> <td className="incident-id">
                                INC-1023
                            </td> <td>
                                Crowd Surge
                            </td> <td>
                                Queue Zone B
                            </td> <td> <span className="priority high">
                                    HIGH
                                </span> </td> <td>
                                7:20 PM
                            </td> <td> <span className="status responding">
                                    RESPONDING
                                </span> </td> <td className="actions"> <button>▷</button> <button>♧</button> <button>⊙</button> </td> </tr>  <tr> <td className="incident-id">
                                INC-1022
                            </td> <td>
                                Missing Person
                            </td> <td>
                                Parking B
                            </td> <td> <span className="priority medium">
                                    MEDIUM
                                </span> </td> <td>
                                6:55 PM
                            </td> <td> <span className="status resolved">
                                    RESOLVED
                                </span> </td> <td className="actions"> <button>▷</button> <button>♧</button> <button>⊙</button> </td> </tr> </tbody> </table> </div>  <section className="timeline-card"> <h2>
                    Incident Timeline – INC-1004
                </h2> <div className="timeline">  <div className="timeline-event"> <div className="timeline-dot completed">
                            ✓
                        </div> <div className="timeline-line"></div> <h3>
                            Alert Created
                        </h3> <p>
                            7:42 PM
                        </p> </div>  <div className="timeline-event"> <div className="timeline-dot completed">
                            ✓
                        </div> <div className="timeline-line"></div> <h3>
                            Security Notified
                        </h3> <p>
                            7:43 PM
                        </p> </div>  <div className="timeline-event"> <div className="timeline-dot completed">
                            ✓
                        </div> <div className="timeline-line"></div> <h3>
                            Medical Notified
                        </h3> <p>
                            7:44 PM
                        </p> </div>  <div className="timeline-event"> <div className="timeline-dot completed">
                            ✓
                        </div> <div className="timeline-line"></div> <h3>
                            Responder<br />
                            Assigned
                        </h3> <p>
                            7:45 PM
                        </p> </div>  <div className="timeline-event"> <div className="timeline-dot completed">
                            ✓
                        </div> <div className="timeline-line"></div> <h3>
                            Responding
                        </h3> </div>  <div className="timeline-event"> <div className="timeline-dot pending"> </div> <h3>
                            Resolved
                        </h3> <p>
                            7:58 PM
                        </p> </div> </div> </section> </section> </main>
    </>
  );
}