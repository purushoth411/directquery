import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";
// import DataTable from "react-data-table-component";
import { Funnel, RefreshCcw } from "lucide-react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const DirectQueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    keyword: "",
    status: "",
  });
  DataTable.use(DT);

  const { user, userFetched, permissionDenied } = useAuth();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (user ) {
      fetchQueries();
    }
  }, [user]);

  const fetchQueries = async () => {
    if (!user ) return;
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
    if(startDate || endDate){
      if(startDate && endDate){

      }else{
        toast.error("Please select both From and End Date");
        return;
      }
    }
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

  /**
 * Safely truncate HTML string to a given number of characters,
 * preserving valid tags.
 */
function truncateHTML(html, limit) {
  const div = document.createElement('div');
  div.innerHTML = html;

  let charCount = 0;

  function truncateNode(node) {
    if (charCount >= limit) {
      node.parentNode.removeChild(node);
      return true; // Removed
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const remaining = limit - charCount;
      if (node.textContent.length > remaining) {
        node.textContent = node.textContent.slice(0, remaining) + '…';
        charCount = limit;
      } else {
        charCount += node.textContent.length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (truncateNode(child)) break;
      }
    }

    return false;
  }

  truncateNode(div);
  return div.innerHTML;
}


 const columns = [
   
    {
        title: 'Query Details',
        data: 'query_details',
        orderable: false,
        render: function (data, type, row) {
            const div = document.createElement('div');
            div.innerHTML = data || '';
            const truncated = div.innerText.length > 100
                ? div.innerText.substring(0, 100) + '...'
                : div.innerText;
            return `<div title="${div.innerText.replace(/"/g, '&quot;')}">${truncated}</div>`;
        },
    },
    {
        title: 'Added On',
        data: 'added_on',
        orderable: true,
        render: function (data) {
            const date = new Date(data);
            return isNaN(date.getTime()) ? 'N/A' : formatDate(date);
        },
    },
    {
        title: 'Status',
        data: 'is_assigned',
        orderable: true,
        render: function (data) {
            if (data === 1) {
                return `<span class="badge bg-success">Assigned</span>`;
            } else {
                return `<span class="badge bg-danger">Not Assigned</span>`;
            }
        },
    },
    {
        title: 'Assigned On',
        data: 'assigned_on',
        orderable: false,
        render: function (data) {
           
            return data ?  formatDate(data):"N/A";
        },
    },
    {
        title: 'Ref ID',
        data: 'ref_id',
        orderable: false,
        render: (data) => data || 'N/A',
    },
    {
        title: 'Actions',
        data: null,
        orderable: false,
        render: function (data, type, row) {
            if (row.is_assigned === 1) {
                return `<span class="text-muted">Already Assigned</span>`;
            } else {
                const encodedId = btoa(row.id.toString());
                return `
                    <a 
                        href="https://instacrm.rapidcollaborate.com/workspace/addworkspace?direct_id=${encodedId}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="btn btn-sm btn-success"
                    >
                        Assign
                    </a>
                `;
            }
        },
    },
];


  return permissionDenied ? (
    <div className="container text-center py-5">
      <h2 className="mb-4">Permission Not Allowed </h2>
      <p className="text-muted">You dont have access to this page</p>
    </div>
  ) : (
    <div className="container py-4">
      <h2 className="mb-4">Direct Queries</h2>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Date Range</label>
            <div>
              <DatePicker
                className="form-control form-control-sm"
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);

                  const oneDayInMs = 24 * 60 * 60 * 1000;

                  setFilters((prev) => ({
                    ...prev,
                    startDate: start
                      ? new Date(start.getTime() + oneDayInMs)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    endDate: end
                      ? new Date(end.getTime() + oneDayInMs)
                          .toISOString()
                          .split("T")[0]
                      : "",
                  }));
                }}
                placeholderText="Select Date Range"
                dateFormat="yyyy/MM/dd"
                selectsRange
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()} // Optional: restrict to today or earlier
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-select form-select-sm"
            >
              <option value="">All</option>
              <option value="1">Assigned</option>
              <option value="2">Not Assigned</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label ">Keyword</label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Search by keyword"
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-primary w-100">
              Apply Filters <Funnel size={17} />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="btn btn-sm"
            >
              <RefreshCcw size={17} />
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
            // <DataTable
            //   columns={columns}
            //   data={queries}
            //   pagination
            //   highlightOnHover
            //   striped
            //   responsive
            //   noDataComponent="No queries found."
            // />

            <DataTable
                                data={queries}
                                columns={columns}

                                options={{
                                    pageLength: 25,
                                    ordering: true,
                                    // createdRow: (row, data) => {
                                    //     $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                    // },
                                }}
                            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectQueryList;
