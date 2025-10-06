import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Video,
} from "lucide-react";
import { getInterviewerInterviewById } from "../../services/api/interviews";
import { useNavigate } from "react-router-dom";

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0,
    averageRating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewerData = async () => {
      try {
        const interviewsData = await getInterviewerInterviewById();
        console.log("printing the interviews data", interviewsData);
        const now = new Date();
        const interviewsWithStats = interviewsData.map((i: any) => {
          const scheduled = new Date(i.scheduledTime);
          let status = "Scheduled";
          if (scheduled < now) status = "Completed";
          return { ...i, status };
        });
        setInterviews(interviewsWithStats);

        // Optional: compute stats
        const completed = interviewsWithStats.filter(
          (i) => i.status == "Completed"
        ).length;
        const scheduled = interviewsWithStats.filter(
          (i) => i.status == "Scheduled"
        ).length;

        setStats({
          totalInterviews: interviewsData.length,
          completedInterviews: completed,
          pendingInterviews: scheduled,
          averageRating: 0, // update if feedback is available
        });
      } catch (error) {
        console.error("Failed to fetch interviewer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewerData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-primary";
      case "Completed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      case "In Progress":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  const getUpcomingInterviews = () => {
    const now = new Date();

    return interviews
      .filter((interview) => {
        const scheduled = new Date(interview.scheduledTime);
        const isUpcoming = interview.status === "Scheduled" && scheduled > now;

        if (!scheduled || isNaN(scheduled.getTime())) {
          console.warn("Invalid scheduledTime for interview:", interview);
          return false;
        }

        return isUpcoming;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      )
      .slice(0, 5);
  };

  // Select the most recent 5 completed interviews
  const getCompletedInterviews = () => {
    const toDate = (v: any) => (v instanceof Date ? v : new Date(v));

    return (interviews ?? [])
      .filter((i: any) => String(i.status ?? "") == "Completed")
      .sort(
        (a: any, b: any) =>
          toDate(b.scheduledTime).getTime() - toDate(a.scheduledTime).getTime()
      )
      .slice(0, 5);
  };
  console.log("Interviews:", interviews);
  console.log("printing the interview details", interviews);
  console.log("Upcoming Interviews:", getUpcomingInterviews());

  ///

  // ...rest of your code

  // InterviewerDashboard.tsx
  // import { useNavigate } from "react-router-dom";

  const handleOpenFeedback = (item: any) => {
    debugger;
    // Go to /interviews/feedback/:id and also pass the interview via state (optional)
    navigate(`/interviews/feedback/${item.interviewId}`, {
      state: {
        interview: {
          interviewId: item.interviewId,
          applicationId: item.applicationId,
          candidateName: item.candidateName ?? item.applicantName ?? null,
          candidateEmail: item.candidateEmail ?? null,
          jobTitle: item.jobTitle ?? "Interview",
          scheduledTime: item.scheduledTime,
          roundNumber: item.roundNumber ?? 1,
          status: item.status ?? "Completed",
          teamsLink: item.teamsLink ?? "",
        },
      },
    });
  };

  ///

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  console.log("printing stats", stats);
  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Interviewer Dashboard</h1>
        <p className="text-muted">
          Welcome back, {user?.FirstName}! Manage your interviews and provide
          feedback.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                  <Calendar size={20} />
                </div>
                <div>
                  <h6 className="mb-0">Total Interviews</h6>
                  <h4 className="mb-0">{stats.totalInterviews}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-sm bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h6 className="mb-0">Completed</h6>
                  <h4 className="mb-0">{stats.completedInterviews}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-sm bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                  <Clock size={20} />
                </div>
                <div>
                  <h6 className="mb-0">Pending</h6>
                  <h4 className="mb-0">{stats.pendingInterviews}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Upcoming Interviews */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">Upcoming Interviews</h5>
            </div>
            <hr />
            <div className="card-body">
              {getUpcomingInterviews().length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No upcoming interviews</h6>
                  <p className="text-muted">
                    You have no scheduled interviews at the moment.
                  </p>
                </div>
              ) : (
                
<div className="row">
          {getUpcomingInterviews().map((interview) => (
            <div key={interview.interviewId} className="col-md-12 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">
                        {interview.jobTitle ?? "Interview"}
                      </h5>
                      <p className="mb-1">
                        <strong>Candidate:</strong> {interview.applicantName}
                      </p>
                      <p className="mb-1 text-muted">
                        <Clock size={14} className="me-1" />
                        {new Date(interview.scheduledTime).toLocaleDateString()} at{" "}
                        {new Date(interview.scheduledTime).toLocaleTimeString()}
                      </p>
                      <span
                        className={`badge ${getStatusBadgeColor(
                          interview.status ?? "Scheduled"
                        )}`}
                      >
                        {interview.status ?? "Scheduled"}
                      </span>
                    </div>
                    <div className="text-end">
                      {!!interview.teamsLink && (
                        <a
                          href={interview.teamsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          title="Join Meeting"
                        >
                          <Video size={16} className="me-1" />
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Interviews */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">Completed Interviews</h5>
            </div>
            <hr />
            <div className="card-body">
              {getCompletedInterviews().length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No completed interviews</h6>
                  <p className="text-muted mb-0">
                    Once interviews are marked completed, they’ll appear here.
                  </p>
                </div>
              ) : (
                
 <div className="row">
          {getCompletedInterviews().map((item: any) => (
            <div key={item.interviewId} className="col-md-12 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    {/* Interview Details */}
                    <div>
                      <h6 className="card-title mb-1">
                        {item.candidateName ?? item.applicantName ?? "Unknown Candidate"}
                      </h6>
                      <small className="text-muted d-block mb-2">
                        {item.jobTitle ?? "Interview"} •{" "}
                        {new Date(item.scheduledTime).toLocaleDateString()}{" "}
                        {new Date(item.scheduledTime).toLocaleTimeString()}
                      </small>
                      <span
                        className={`badge ${getStatusBadgeColor(item.status ?? "Completed")}`}
                      >
                        Completed
                      </span>
                    </div>

                    {/* Feedback Button */}
                    <div className="ms-3">
                      <button
                        className="btn btn-sm btn-outline-success"
                        title="View/Edit Feedback"
                        onClick={() => handleOpenFeedback(item)}
                      >
                        <MessageSquare size={14} className="me-1"/>
                        Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
