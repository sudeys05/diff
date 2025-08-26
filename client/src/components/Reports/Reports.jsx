import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Download,
  Printer,
  BarChart3
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [obEntries, setObEntries] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [inmates, setInmates] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail'
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    'Incident Report',
    'Custodial Report', 
    'Evidence Report',
    'Officer Activity Report',
    'Vehicle Report',
    'Monthly Summary',
    'Investigation Report',
    'Compliance Report'
  ];

  const reportStatuses = ['Draft', 'Generated', 'Reviewed', 'Approved', 'Archived'];

  useEffect(() => {
    fetchReports();
    fetchRelatedData();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching reports from MongoDB API...');
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received reports from API:', data);
        setReports(data.reports || []);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch reports:', response.status, errorText);
        setError(`Failed to fetch reports: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Network error fetching reports:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [obRes, evidenceRes, inmatesRes, officersRes, vehiclesRes] = await Promise.all([
        fetch('/api/ob-entries'),
        fetch('/api/evidence'),
        fetch('/api/custodial-records'),
        fetch('/api/officers'),
        fetch('/api/police-vehicles')
      ]);

      const [obData, evidenceData, inmatesData, officersData, vehiclesData] = await Promise.all([
        obRes.ok ? obRes.json() : { obEntries: [] },
        evidenceRes.ok ? evidenceRes.json() : { evidence: [] },
        inmatesRes.ok ? inmatesRes.json() : { inmates: [] },
        officersRes.ok ? officersRes.json() : { officers: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] }
      ]);

      setObEntries(obData.obEntries || []);
      setEvidence(evidenceData.evidence || []);
      setInmates(inmatesData.inmates || []);
      setOfficers(officersData.officers || []);
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const searchContent = report.metadata?.title || report.reportNumber || '';
    const matchesSearch = searchContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || report.metadata?.type === typeFilter;
    const matchesStatus = !statusFilter || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const navigateToView = (view, report = null) => {
    setCurrentView(view);
    setSelectedReport(report);
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedReport(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return <Clock size={16} className="status-draft" />;
      case 'generated': return <CheckCircle size={16} className="status-generated" />;
      case 'reviewed': return <Eye size={16} className="status-reviewed" />;
      case 'approved': return <CheckCircle size={16} className="status-approved" />;
      case 'archived': return <XCircle size={16} className="status-archived" />;
      default: return <Clock size={16} />;
    }
  };

  const ReportsList = () => (
    <div className="reports-list">
      <div className="reports-header">
        <div className="header-content">
          <BarChart3 className="header-icon" />
          <div>
            <h1>Generate Reports</h1>
            <p>Create comprehensive reports from your police management data</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchReports}
            disabled={isLoading}
            title="Refresh reports list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="add-report-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Generate New Report
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {reportTypes.map(type => (
              <option key={type} value={type.toLowerCase().replace(/ /g, '_')}>{type}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {reportStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="reports-grid">
        {isLoading ? (
          <div className="loading-state">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={48} />
            <h3>No reports found</h3>
            <p>Generate your first report or adjust your search filters</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report._id} className="report-card" onClick={() => navigateToView('detail', report)}>
              <div className="report-header">
                <div className="report-info">
                  <h3>{report.reportNumber}</h3>
                  <p className="report-title">{report.metadata?.title || 'Untitled Report'}</p>
                </div>
                <div className="report-type">
                  <FileText size={16} />
                  <span>{report.metadata?.type?.replace(/_/g, ' ') || 'Report'}</span>
                </div>
              </div>
              <div className="report-body">
                <div className="status-info">
                  {getStatusIcon(report.status || 'Generated')}
                  <span className="status-text">{report.status || 'Generated'}</span>
                </div>
                <div className="report-details">
                  <p className="content-preview">
                    {Array.isArray(report.content) && report.content.length > 0 
                      ? report.content[0].content?.substring(0, 100) + '...'
                      : (report.content?.substring(0, 100) + '...' || 'No content available')
                    }
                  </p>
                  <p className="created-date">
                    <Calendar size={14} />
                    Generated: {new Date(report.metadata?.generatedAt || report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreateReportForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      type: 'incident_report',
      description: '',
      modules: ['ob'],
      dateRange: 'week',
      criteria: {
        status: '',
        incidentType: '',
        inmateStatus: '',
        riskLevel: '',
        evidenceType: '',
        department: '',
        startDate: '',
        endDate: ''
      }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const moduleOptions = [
      { id: 'ob', label: 'Occurrence Book Entries', count: obEntries.length },
      { id: 'custodial', label: 'Custodial Records', count: inmates.length },
      { id: 'evidence', label: 'Evidence Management', count: evidence.length },
      { id: 'officers', label: 'Officer Records', count: officers.length },
      { id: 'vehicles', label: 'Vehicle Registry', count: vehicles.length }
    ];

    const dateRangeOptions = [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'year', label: 'This Year' },
      { value: 'custom', label: 'Custom Range' }
    ];

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.startsWith('criteria.')) {
        const criteriaKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          criteria: { ...prev.criteria, [criteriaKey]: value }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const handleModuleChange = (moduleId) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.includes(moduleId)
          ? prev.modules.filter(m => m !== moduleId)
          : [...prev.modules, moduleId]
      }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.title.trim()) newErrors.title = 'Report title is required';
      if (formData.modules.length === 0) newErrors.modules = 'Select at least one data module';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const generateReportContent = () => {
      const content = [];

      // Executive Summary
      content.push({
        title: 'Executive Summary',
        content: `
        This ${formData.type.replace(/_/g, ' ')} report covers the period from ${formData.dateRange} and includes comprehensive data from multiple police management modules.

        Key Highlights:
        • Total Incidents Recorded: ${obEntries.length}
        • Active Inmates: ${inmates.filter(i => i.status === 'Active').length}
        • Vehicles Registered: ${vehicles.length}
        • Evidence Items: ${evidence.length}
        • Officers Involved: ${officers.length}

        This report provides integrated analysis across occurrence book entries, custodial records, vehicle registrations, and evidence management to support operational decision-making.
        `
      });

      // Module-specific content
      if (formData.modules.includes('ob')) {
        const recentIncidents = obEntries.slice(0, 10);
        content.push({
          title: 'Occurrence Book Analysis',
          content: `
          Total Incidents: ${obEntries.length}

          Recent Incidents:
          ${recentIncidents.map(ob => `• ${ob.obNumber}: ${ob.incidentType || ob.type} - ${ob.status}`).join('\n')}

          Case Classifications:
          ${[...new Set(obEntries.map(ob => ob.caseClassification).filter(Boolean))].map(cls => `• ${cls}`).join('\n')}
          `
        });
      }

      if (formData.modules.includes('custodial')) {
        content.push({
          title: 'Custodial Records Summary',
          content: `
          Total Inmates: ${inmates.length}
          Active Inmates: ${inmates.filter(i => i.status === 'Active').length}

          Risk Level Distribution:
          ${[...new Set(inmates.map(i => i.riskLevel).filter(Boolean))].map(level => 
            `• ${level}: ${inmates.filter(i => i.riskLevel === level).length} inmates`
          ).join('\n')}

          Security Classifications:
          ${[...new Set(inmates.map(i => i.classification).filter(Boolean))].map(cls => 
            `• ${cls}: ${inmates.filter(i => i.classification === cls).length} inmates`
          ).join('\n')}
          `
        });
      }

      if (formData.modules.includes('evidence')) {
        content.push({
          title: 'Evidence Management Report',
          content: `
          Total Evidence Items: ${evidence.length}

          Evidence Types:
          ${[...new Set(evidence.map(e => e.type).filter(Boolean))].map(type => 
            `• ${type}: ${evidence.filter(e => e.type === type).length} items`
          ).join('\n')}

          Storage Locations:
          ${[...new Set(evidence.map(e => e.storageLocation).filter(Boolean))].map(loc => 
            `• ${loc}: ${evidence.filter(e => e.storageLocation === loc).length} items`
          ).join('\n')}
          `
        });
      }

      if (formData.modules.includes('officers')) {
        content.push({
          title: 'Officer Activity Summary',
          content: `
          Total Officers: ${officers.length}
          Active Officers: ${officers.filter(o => o.status === 'Active').length}

          Departments:
          ${[...new Set(officers.map(o => o.department).filter(Boolean))].map(dept => 
            `• ${dept}: ${officers.filter(o => o.department === dept).length} officers`
          ).join('\n')}

          Ranks:
          ${[...new Set(officers.map(o => o.rank).filter(Boolean))].map(rank => 
            `• ${rank}: ${officers.filter(o => o.rank === rank).length} officers`
          ).join('\n')}
          `
        });
      }

      if (formData.modules.includes('vehicles')) {
        content.push({
          title: 'Vehicle Registry Report',
          content: `
          Total Vehicles: ${vehicles.length}

          Vehicle Status:
          ${[...new Set(vehicles.map(v => v.status).filter(Boolean))].map(status => 
            `• ${status}: ${vehicles.filter(v => v.status === status).length} vehicles`
          ).join('\n')}

          Vehicle Types:
          ${[...new Set(vehicles.map(v => v.type).filter(Boolean))].map(type => 
            `• ${type}: ${vehicles.filter(v => v.type === type).length} vehicles`
          ).join('\n')}
          `
        });
      }

      return content;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const reportData = {
          metadata: {
            title: formData.title,
            type: formData.type,
            description: formData.description,
            modules: formData.modules,
            dateRange: formData.dateRange,
            criteria: formData.criteria,
            generatedBy: 'System User',
            generatedAt: new Date().toISOString()
          },
          content: generateReportContent(),
          status: 'Generated',
          generatedAt: new Date().toISOString()
        };

        console.log('🔍 Generating report with data:', reportData);
        const response = await fetch('/api/custodial-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Report generated successfully:', result);
          await fetchReports();
          goBack();
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to generate report:', errorData);
          setErrors({ submit: errorData.message || 'Failed to generate report' });
        }
      } catch (error) {
        console.error('❌ Network error during report generation:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="report-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <BarChart3 size={20} />
            Back to Reports
          </button>
          <h1>Generate New Report</h1>
        </div>

        <form onSubmit={handleSubmit} className="report-generation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Report Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter report title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Report Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {reportTypes.map(type => (
                  <option key={type} value={type.toLowerCase().replace(/ /g, '_')}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateRange">Date Range *</label>
              <select
                id="dateRange"
                name="dateRange"
                value={formData.dateRange}
                onChange={handleInputChange}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Report Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description for this report..."
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label>Data Modules to Include *</label>
            <div className="modules-grid">
              {moduleOptions.map(module => (
                <div key={module.id} className="module-option">
                  <label className="module-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.modules.includes(module.id)}
                      onChange={() => handleModuleChange(module.id)}
                    />
                    <div className="module-info">
                      <span className="module-label">{module.label}</span>
                      <span className="module-count">{module.count} records</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {errors.modules && <span className="error-text">{errors.modules}</span>}
          </div>

          {formData.dateRange === 'custom' && (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="criteria.startDate">Start Date</label>
                <input
                  type="date"
                  id="criteria.startDate"
                  name="criteria.startDate"
                  value={formData.criteria.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="criteria.endDate">End Date</label>
                <input
                  type="date"
                  id="criteria.endDate"
                  name="criteria.endDate"
                  value={formData.criteria.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const ReportDetail = () => {
    const reportContent = selectedReport?.content || [];

    return (
      <div className="report-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={goBack}>
            <BarChart3 size={20} />
            Back to Reports
          </button>
          <div className="detail-actions">
            <button onClick={() => window.print()}>
              <Printer size={16} />
              Print Report
            </button>
            <button>
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        <div className="report-info-panel">
          <div className="panel-header">
            <div className="report-display">
              <BarChart3 size={32} />
              <div>
                <h1>{selectedReport?.metadata?.title || selectedReport?.reportNumber}</h1>
                <p className="report-subtitle">{selectedReport?.metadata?.type?.replace(/_/g, ' ') || 'System Report'}</p>
              </div>
              <div className="status-badge">
                {getStatusIcon(selectedReport?.status)}
                {selectedReport?.status || 'Generated'}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Report Information</h3>
              <div className="info-grid">
                <div><strong>Report Number:</strong> {selectedReport?.reportNumber}</div>
                <div><strong>Type:</strong> {selectedReport?.metadata?.type?.replace(/_/g, ' ')}</div>
                <div><strong>Status:</strong> {selectedReport?.status || 'Generated'}</div>
                <div><strong>Date Range:</strong> {selectedReport?.metadata?.dateRange}</div>
                <div><strong>Generated:</strong> {new Date(selectedReport?.metadata?.generatedAt || selectedReport?.createdAt).toLocaleString()}</div>
                <div><strong>Generated By:</strong> {selectedReport?.metadata?.generatedBy}</div>
              </div>
            </div>

            <div className="report-content">
              {Array.isArray(selectedReport.content) ? (
                selectedReport.content.map((section, index) => (
                  <div key={index} className="report-section">
                    <h4>{section.title}</h4>
                    <pre>{section.content}</pre>
                  </div>
                ))
              ) : (
                <pre>{selectedReport.content || 'No content available'}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (currentView) {
    case 'detail':
      return <ReportDetail />;
    case 'create':
      return <CreateReportForm />;
    default:
      return <ReportsList />;
  }
};

export default Reports;