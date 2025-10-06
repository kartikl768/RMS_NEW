import React from 'react';
import { useCandidate } from '../../contexts/CandidateContext';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, FileText, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Jobs from '../HRPages/Jobs';

const CandidateDashboard: React.FC = () => {
  const { applications, jobs, loading } = useCandidate();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    
    console.log("Getting status badge for status:", status);
    switch (status) {
      case 'Applied':
        return <span className="badge bg-primary">Applied</span>;
      case 'UnderReview':
        return <span className="badge bg-info">Under Review</span>;
      case 'InterviewScheduled':
        return <span className="badge bg-success">Interview Scheduled</span>;
      case 'InProgress':
        return <span className="badge bg-warning text-dark">In Progress</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'Selected':
        return <span className="badge bg-success">Selected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
console.log("printing the applications array", applications);
  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Welcome, {user.Email && user.Email.split('@')[0].charAt(0).toUpperCase()+user.Email.split('@')[0].slice(1)} </h1>
        <p className="text-muted">Track your job applications and explore new opportunities</p>
      </div>

      {/* Metrics Cards */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Available Jobs</h6>
                <Briefcase className="text-primary" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-primary mb-0">
                {jobs.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">My Applications</h6>
                <FileText className="text-info" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-info mb-0">
                {applications.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">In Progress</h6>
                <Clock className="text-warning" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-warning mb-0">
                {applications.filter(a => a.status === "InProgress" || a.status === "InterviewScheduled").length}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Selected</h6>
                <CheckCircle className="text-success" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-success mb-0">
                {applications.filter(a => a.status === "Selected").length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      

      {/* Recent Applications */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title fw-bold mb-0">Recent Applications</h5>
            </div>
            <div className="card-body">
              {applications.length === 0 ? (
                <div className="text-center py-5">
                  <FileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No applications yet</h5>
                  <p className="text-muted">
                    Start by browsing available jobs and applying to positions that interest you.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/candidate/jobs')}
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Job ID</th>
                        <th>Job Title</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Current Round</th>
                      </tr>
                    </thead>
                    <tbody>
                            {applications.slice(0, 5).map((application) => {
                              const job = jobs.find((j) => j.jobId === application.jobId);
                              return (
                                <tr key={application.applicationId}>
                                  <td>
                                    <strong>#{application.job?.jobId}</strong>
                                  </td>
                                  <td>
                                    <strong> {application.job?.jobTitle}</strong>
                                  </td>
                                  <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                                  <td>{getStatusBadge(application.status)}</td>
                                  <td>
                                    <span className="badge bg-light text-dark">
                                      Round {application.currentRound}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                      </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
