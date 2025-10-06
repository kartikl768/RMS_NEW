import React, { useState } from 'react';
import { useHR } from '../../contexts/HRContext';
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import { Users, Clock, Briefcase, Calendar, Search, Filter } from "lucide-react";

const Dashboard: React.FC = () => {
  const { jobs, allJobRequirements, applications, interviews, loading } = useHR();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();
  // Calculate active jobs from all job requirements (approved and pending)
  let filteredJobs = (jobs || []).filter((job) => {
    // Add null/undefined checks
    if (!job || !job.jobTitle) {
      console.warn("Jobs.tsx: Job object is invalid:", job);
      return false;
    }

    const matchesSearch = job.jobTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filteredJobs = filteredJobs.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.jobTitle.localeCompare(b.jobTitle);
      case "status":
        return a.status.localeCompare(b.status);
      case "date":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    }
  });

  // Calculate metrics based on filtered and available data
  const activeJobsCount = filteredJobs.filter((job) => job.status === "Active").length;
  const totalApplications = applications.length;
  const pendingReviewCount = (applications || []).filter(a => a.status === "Applied" || a.status === "In Progress").length;
  const scheduledInterviewsCount = (interviews || []).filter(i => i.status === "Scheduled").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return <span className="badge bg-primary">Applied</span>;
      case 'Interview Scheduled':
        return <span className="badge bg-success">Interview Scheduled</span>;
      case 'In Progress':
        return <span className="badge bg-warning text-dark">In Progress</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };
  const getStatusBadge1 = (status: string) => {
                switch (status) {
                  case 'Active':
                    return <span className="badge bg-success fs-6">Active</span>;
                  case 'Inactive':
                    return <span className="badge bg-secondary fs-6">Inactive</span>;
                  case 'Closed':
                    return <span className="badge bg-danger fs-6">Closed</span>;
                  default:
                    return <span className="badge bg-secondary fs-6">{status}</span>;
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

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        {/* <h1 className="h2 fw-bold">Welcome : {user.Email && user.Email.split('@')[0].charAt(0).toUpperCase()+user.Email.split('@')[0].slice(1)}</h1> */}
        <h1 className="h2 fw-bold">Welcome HR</h1>
        <p className="text-muted">Overview of recruitment activities and metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Active Jobs</h6>
                <Briefcase className="text-primary" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-primary mb-0">
                {activeJobsCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Total Applications</h6>
                <Users className="text-success" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-success mb-0">
                {totalApplications}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Pending Review</h6>
                <Clock className="text-warning" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-warning mb-0">
                {pendingReviewCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted mb-0">Scheduled Interviews</h6>
                <Calendar className="text-info" size={24} />
              </div>
              <h2 className="display-4 fw-bold text-info mb-0">
                {scheduledInterviewsCount}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              <div className="col-md-1">
                <div className="d-flex align-items-center text-muted">
                  <Filter size={16} className="me-1" />
                  <small>{filteredJobs.length}</small>
                </div>
              </div>
            </div>

      {/* Job Listings Section */}
      <div className="mb-4">
        <h2 className="h3 fw-bold">Active Job Listings</h2>
      </div>
      <div className="row">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.jobId} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="card-title h4 mb-0">{job.jobTitle}</h3>
                    {getStatusBadge1(job.status)}
                  </div>

                  <div className="row text-muted mb-3">
                    <div className="col-auto">
                      <Clock size={16} className="me-1" />
                      {job.yearsExperience} years
                    </div>
                    <div className="col-auto">
                      <Users size={16} className="me-1" />
                      {job.numberOfOpenings} openings
                    </div>
                  </div>

                  <p className="card-text text-muted mb-4">{job.jobDescription}</p>

                  <div className="mb-4">
                    <h6 className="text-muted mb-2">
                      <span className="text-warning">🔧</span> Required Skills
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Array.isArray(job.requiredSkills)
                        ? job.requiredSkills.map((skill, index) => (
                          <span key={index} className="badge bg-light text-dark border">
                            {skill.trim()}
                          </span>
                        ))
                        : (job.requiredSkills || "").split(",").map((skill, index) => (
                          <span key={index} className="badge bg-light text-dark border">
                            {skill.trim()}
                          </span>
                        ))
                      }
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      <span className="text-danger">🎯</span> {job.numberOfRounds} interview rounds
                    </div>
                    
                    {job.status === "Active" ? (
                      <button
                        onClick={() => {
                          console.log("Navigating to jobId:", job.jobId); 
                          navigate(`/hr/applicants/${job.jobId }`);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        View Applicants →
                      </button>
                    ) : (
                      job.status === "Inactive" ? "Job Inactive" : "Not available"
                    )}


                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted py-5">
            <p>No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
