InterviewManagement.tsx 

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, Video, MessageSquare } from "lucide-react";
import FeedbackModal from '../../components/FeedbackComponent/FeedbackModal';
import api from "../../services/axiosInstance";

export default function InterviewManagement() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRound, setFilterRound] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (user?.UserId) {
      fetchInterviews(user.UserId);
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("http://localhost:5109/api/interviews/interviewer");
      const data = Array.isArray(res.data) ? res.data : [res.data];

      const now = new Date();
      const normalized = data.map((i: any) => {
        const scheduledDate = new Date(i.scheduledTime);
        let status = i.status
          ? i.status.charAt(0).toUpperCase() + i.status.slice(1).toLowerCase()
          : scheduledDate > now
            ? "Scheduled"
            : "Completed";

        return {
          ...i,
          status,
          roundNumber: i.roundNumber || 1,
        };
      });

      console.log("✅ Interviews fetched:", normalized);
      setInterviews(normalized);
    } catch (error) {
      console.error("❌ Failed to fetch interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (interviewId: number) => {
    if (!window.confirm("Are you sure you want to cancel this interview?")) return;

    try {
      await api.put(`/interviewer/interviews/${interviewId}/cancel`);
      alert("Interview cancelled successfully!");
      fetchInterviews(user.UserId);
    } catch (error) {
      console.error("Failed to cancel interview:", error);
      alert("Failed to cancel interview. Please try again.");
    }
  };

  const handleCompleteInterview = async (interviewId: number) => {
    try {
      await api.put(`/interviewer/interviews/${interviewId}/complete`);
      alert("Interview completed successfully!");
      fetchInterviews(user.UserId);
    } catch (error) {
      console.error("Failed to complete interview:", error);
      alert("Failed to complete interview. Please try again.");
    }
  };

  const handleProvideFeedback = (interview: any) => {
    setSelectedInterview(interview);
    setShowFeedbackModal(true);
  };

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

  const getStatusActions = (interview: any) => {
    switch (interview.status) {
      case "Scheduled":
        return (
          <div className="d-flex gap-2">
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
           
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleCancelInterview(interview.interviewId)}
            >
              Cancel
            </button>
          </div>
        );
      case "Completed":
        return (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleProvideFeedback(interview)}
            >
              <MessageSquare size={14} className="me-1" />
              View/Edit Feedback
            </button>
          </div>
        );
      case "In Progress":
        return (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleCompleteInterview(interview.interviewId)}
            >
              Complete
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleProvideFeedback(interview)}
            >
              <MessageSquare size={14} className="me-1" />
              Feedback
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesStatus =
      filterStatus === "all" || interview.status === filterStatus;
    const matchesRound =
      filterRound === "all" || interview.roundNumber?.toString() === filterRound;
    return matchesStatus && matchesRound;
  });

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Interview Management</h1>
        <p className="text-muted">
          Manage your assigned interviews and provide feedback
        </p>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
          >
            <option value="all">All Rounds</option>
            {[1, 2, 3, 4, 5].map((round) => (
              <option key={round} value={round}>
                Round {round}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-center text-muted">
          <Calendar size={16} className="me-1" />
          <small>{filteredInterviews.length} interviews</small>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Candidate</th>
                  <th>Round</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview.interviewId}>
                    <td>
                      <div className="d-flex align-items-center">
                        
                        <div>
                          <div className="fw-medium">
                            {interview.applicantName || "Unknown Candidate"}
                          </div>
                          <small className="text-muted">{interview.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        Round {interview.roundNumber || 1}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">
                          {new Date(interview.scheduledTime).toLocaleDateString()}
                        </div>
                        <small className="text-muted">
                          {new Date(interview.scheduledTime).toLocaleTimeString()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeColor(
                          interview.status || "Scheduled"
                        )}`}
                      >
                        {interview.status || "Scheduled"}
                      </span>
                    </td>
                    <td>{getStatusActions(interview)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredInterviews.length === 0 && (
        <div className="text-center py-5">
          <Calendar size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No interviews found</h5>
          <p className="text-muted">
            Try adjusting your filters or check back later for new assignments.
          </p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedInterview && (
        <FeedbackModal
          interview={selectedInterview}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            fetchInterviews(user.UserId);
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
}
