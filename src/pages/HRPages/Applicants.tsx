import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Briefcase, Download } from 'lucide-react';
import { useHR } from '../../contexts/HRContext';
import { getApplicationsByJob } from "../../services/api/applications";
import { Application } from '../../data';

const statusMap: Record<number, string> = {
  0: 'Applied',
  1: 'UnderReview',
  2: 'InterviewScheduled',
  3: 'InProgress',
  4: 'Selected',
  5: 'Rejected',
  };
const Applicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [sortBy, setSortBy] = useState<string>('Sort by Date');
  const [jobApplicants, setJobApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { jobs } = useHR();

  const job = jobs.find(j => j.jobId === Number(jobId));
  
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true); // Set loading to true before fetching.
      try {
        const data = await getApplicationsByJob(Number(jobId));
        setJobApplicants(data);
      } catch (error) {
        console.error("Failed to fetch job applicants", error);
      } finally {
        setLoading(false); // Set loading to false when done.
      }
    };

    fetchApplicants();
  }, [jobId]);

  if (!job) {
    return <div className="container py-4">Job not found</div>;
  }

  // Memoize filtered and sorted applicants to avoid re-calculating on every render.
  const filteredAndSortedApplicants = useMemo(() => {
    let applicants = [...jobApplicants];

    // 1. Filter applicants based on statusFilter.
    if (statusFilter !== 'All Status') {
      // Normalize filter values to match data for comparison.
      const normalizedFilter = statusFilter.replace(/ /g, '');
      applicants = applicants.filter(applicant => applicant.status === normalizedFilter);
    }

    // 2. Sort applicants based on sortBy value.
    applicants.sort((a, b) => {
      switch (sortBy) {
        case 'Sort by Score':
          return b.keywordScore - a.keywordScore;
        case 'Sort by Name':
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          return nameA.localeCompare(nameB);
        case 'Sort by Date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return applicants;
  }, [jobApplicants, statusFilter, sortBy]);

  const getStatusBadge = (status?: string | number) => {
    const finalStatus = statusMap[Number(status)] || status || 'UnderReview';
    console.log("printin the status of the candidate", status);
    switch (finalStatus) {
      case 'InterviewScheduled':
        return <span className="badge bg-success">Interview Scheduled</span>;
      case 'InProgress':
        return <span className="badge bg-warning text-dark">In Progress</span>;
      case 'Applied':
        return <span className="badge bg-primary">Applied</span>;
      case 'UnderReview':
        return <span className="badge bg-info">Under Review</span>;
      case 'Selected':
        return <span className="badge bg-success">Selected</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'Pending':
        return <span className="badge bg-secondary">Pending</span>;
      case 'Approved':
        return <span className="badge bg-success">Approved</span>;
      default:
        return <span className="badge bg-secondary">{finalStatus}</span>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <Link to="/hr/dashboard" className="btn btn-primary btn-sm mb-3">
          
          Back to Dashboard
        </Link>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="card-title h3 fw-bold mb-3">{job.jobTitle}</h2>
          <p className="text-muted mb-3">{job.jobDescription}</p>
          
          <div className="row text-muted">
            <div className="col-auto">
              <Clock size={16} className="me-1" />
              {job.yearsExperience} years
            </div>
            <div className="col-auto">
              <Briefcase size={16} className="me-1" />
              {job.numberOfOpenings} openings
            </div>
            <div className="col-auto">
              <span className="text-warning">🎯</span>
              {job.numberOfRounds} rounds
            </div>
            <div className="col-auto">
              <span className="badge bg-light text-primary">
                {job.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0 fw-bold">
                <Users size={20} className="me-2" />
                Applicants ({filteredAndSortedApplicants.length})
              </h5>
            </div>
            <div className="col-auto">
              <div className="row g-2">
                <div className="col-auto">
                  <select 
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All Status">All Status</option>
                    <option value="Applied">Applied</option>
                    <option value="UnderReview">Under Review</option>
                    <option value="InterviewScheduled">Interview Scheduled</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-auto">
                  <select 
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Sort by Date">Sort by Date</option>
                    <option value="Sort by Score">Sort by Score</option>
                    <option value="Sort by Name">Sort by Name</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredAndSortedApplicants.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No applicants found for this job.
            </div>
          ) : (
            filteredAndSortedApplicants.map((applicant, index) => (
              <div key={applicant.applicationId} className={`p-4 ${index < filteredAndSortedApplicants.length - 1 ? 'border-bottom' : ''}`}>
                <div className="row align-items-center">
                  <div className="col">
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="mb-0 me-3 fw-bold">{applicant.firstName} {applicant.lastName}</h6>
                      <small className="text-muted">ID: {applicant.applicationId}</small>
                      <div className="ms-auto">
                        {getStatusBadge(applicant.status)}
                      </div>
                    </div>
                    <div className="text-muted mb-2">
                      <div>{applicant.email}</div>
                      <div>{applicant.phone}</div>
                    </div>
                    <div className="row text-muted small">
                      <div className="col-auto">Score: {applicant.keywordScore}/10</div>
                      <div className="col-auto">Applied: {new Date(applicant.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="text-end mb-2">
                      <small className="text-muted">Round {applicant.currentRound}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {applicant.resumePath && (
                        <a
                          href={applicant.resumePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm"
                          title="Download Resume"
                        >
                          <Download size={14} />
                        </a>
                      )}
                      <Link
                              to={`/hr/applicant/${applicant.applicationId}`}
                              className="btn btn-sm btn-outline-primary mt-2"
                            >
                              Review Application
                            </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
