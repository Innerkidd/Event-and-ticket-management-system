import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import adminService from '../../services/adminService';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const loadUsers = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page: params.page || page,
        limit: 20,
      };
      if (params.search !== undefined && params.search !== '') query.search = params.search;
      if (params.role !== undefined && params.role !== 'ALL') query.role = params.role;

      const data = await adminService.getUsers(query);
      setUsers(data?.users || []);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Error fetching user directory:', err);
      setError('Unable to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers({ search: searchTerm, role: roleFilter, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    loadUsers({ search: searchTerm, role: roleFilter, page: nextPage });
  };

  const handleRetry = () => {
    loadUsers({ search: searchTerm, role: roleFilter, page });
  };

  return (
    <div className="admin-page-container">
      {/* Controls & Search Header */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          {/* Role Filter */}
          <div className="filter-item">
            <label className="filter-label">Role</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ORGANIZER">ORGANIZER</option>
              <option value="ATTENDEE">ATTENDEE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>User Accounts Directory</h3>
          <span className="results-count">Showing {users.length} user(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : users.length === 0 ? (
          <EmptyState message="No users found matching criteria." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name || 'Anonymous User'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge badge-${(u.role || 'ATTENDEE').toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;