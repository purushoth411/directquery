import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";
import DataTable from "react-data-table-component";
import { Funnel,RefreshCcw } from 'lucide-react';

const DirectQueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    keyword: "",
    status: "",
  });

  const { user,userFetched,permissionDenied } = useAuth();
  const [fetching, setFetching] = useState(false);

  

  useEffect(() => {
    if (user && userFetched) {
      fetchQueries();
    }
  }, [user,userFetched]);

  const fetchQueries = async () => {
    if (!user || !userFetched) return;
    if (fetching) return; // Prevent multiple fetches
    setFetching(true);
    setLoading(true);
    try {
      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/directqueryapi/get-direct-queries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            user_type: user?.user_type,
            filters,
          }),
        }
      );

      const data = await response.json();
      if (data.status && Array.isArray(data.queries)) {
        setQueries(data.queries);
        

      } else {
        toast.error(data.message || "Failed to load queries.");
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

 const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};


  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchQueries();
  };

  const handleRefresh = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      keyword: "",
    });
    fetchQueries();
  };

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "60px",
    },
    {
      name: "Query Details",
      selector: (row) =>
        stripHtml(row.query_details).substring(0, 100) +
        (row.query_details.length > 100 ? "..." : ""),
      wrap: true,
      sortable: false,
    },
    {
      name: "Added On",
      selector: (row) => formatDate(row.added_on),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) =>
        row.is_assigned === 1 ? (
          <span className="badge bg-success">Assigned</span>
        ) : (
          <span className="badge bg-danger">Not Assigned</span>
        ),
      sortable: true,
    },
    {
      name: "Assigned On",
      selector: (row) => formatDate(row.assigned_on),
    },
    {
      name: "Ref ID",
      selector: (row) => row.ref_id || "N/A",
    },
    {
      name: "Actions",
      cell: (row) =>
        row.is_assigned === 1 ? (
          <span className="text-muted">Already Assigned</span>
        ) : (
          <a
            href={`https://instacrm.rapidcollaborate.com/workspace/addworkspace?direct_id=${btoa(
              row.id.toString()
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-success"
          >
            Assign
          </a>
        ),
    },
  ];

  return (
     permissionDenied ? (
      <div className="container text-center py-5">
      <h2 className="mb-4">Permission Not Allowed </h2>
      <p className="text-muted">You dont have access to this page</p>
      </div>
    ):(
    
    <div className="container py-4">
      <h2 className="mb-4">Direct Queries</h2>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All</option>
              <option value="1">Assigned</option>
              <option value="0">Not Assigned</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Keyword</label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Search by keyword"
              className="form-control"
            />
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary w-100">
              Apply Filters  <Funnel size={18}/>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="btn btn-outline-secondary"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Data Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={queries}
              pagination
              highlightOnHover
              striped
              responsive
              noDataComponent="No queries found."
            />
          )}
        </div>
      </div>
    </div>
        )
  );
};

export default DirectQueryList;
