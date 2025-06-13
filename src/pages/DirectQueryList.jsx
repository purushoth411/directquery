import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";
import { Funnel, RefreshCcw } from "lucide-react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { getSocket } from "../Socket";
import dayjs from "dayjs";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DirectQueryList = () => {
  const socket = getSocket();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
const formattedToday = today.toISOString().split("T")[0];
const oneDayInMs = 24 * 60 * 60 * 1000;

const [startDate, setStartDate] = useState(today);
const [endDate, setEndDate] = useState(today);
const [filters, setFilters] = useState({
  startDate: new Date(today.getTime() + oneDayInMs).toISOString().split("T")[0],
  endDate: new Date(today.getTime() + oneDayInMs).toISOString().split("T")[0],
  keyword: "",
  status: "",
});
  const { user, userFetched, permissionDenied } = useAuth();
  const [fetching, setFetching] = useState(false);

  DataTable.use(DT);

  useEffect(() => {
    if (user) {
      fetchQueries(true);
    }
  }, [user]);

 useEffect(() => {
  socket.on("newRequestCreated", (data) => {
    toast("New Query Added", {
      icon: "💬",
    });

    const newQuery = {
      added_by: 1,
      added_on: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      assigned_by: null,
      assigned_on: null,
      assigned_to: 0,
      id: Date.now(), // temporary ID
      is_assigned: 2,
      profile_id: 0,
      query_details: data.query,
      ref_id: null,
      directQueryId: data.directQueryId || null // if available
    };

    setQueries((prev) => [newQuery, ...prev]);
  });

  socket.on("newRefAssigned", (data) => {
    toast("Query Assigned", {
      icon: "✅",
    });

    // Update the query with matching directQueryId
    setQueries((prevQueries) =>
      prevQueries.map((query) =>
        query.id == data.directQueryId
          ? {
              ...query,
              ref_id: data.ref_id,
              assigned_on: data.assigned_on,
              is_assigned: 1
            }
          : query
      )
    );
  });

  return () => {
    socket.off("newRequestCreated");
    socket.off("newRefAssigned");
  };
}, []);

  useEffect(() => {
    // Apply tippy after queries are rendered
    const interval = setTimeout(() => {
      tippy(".tippy-html", {
        allowHTML: true,
        interactive: true,
        maxWidth: 500,
        theme: "light-border",
        placement: "auto",
      });
    }, 100); // Short delay to ensure DOM is ready

    return () => clearTimeout(interval);
  }, [queries]);

  const fetchQueries = async (needfilters = false) => {
    if (!user || fetching) return;
    setFetching(true);
    setLoading(true);
    let payload = {
      user_id: user?.id,
      user_type: user?.user_type,
    };

    if (needfilters) {
      payload.filters = filters;
    }

    try {
      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/directqueryapi/get-direct-queries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
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
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // use false for 24-hour format
    }).format(date);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Please select both From and End Date");
      return;
    }
    fetchQueries(true);
  };

  const handleRefresh = async () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      keyword: "",
    });
    setStartDate(null);
    setEndDate(null);
    await fetchQueries(false);
  };

  const columns = [
    {
      title: "Query Details",
      data: "query_details",
      orderable: false,
      render: function (data, type, row) {
        const fullHTML = data || "";

        // Trim the HTML string (not plain text), safe up to 100 characters
        const shortHTML =
          fullHTML.length > 100 ? fullHTML.substring(0, 100) + "..." : fullHTML;

        return `
      <div class="query-details-cell tippy-html" 
           data-tippy-content='${fullHTML.replace(
             /'/g,
             "&apos;"
           )}' data-theme="custom">
        ${shortHTML}
      </div>
    `;
      },
    },
    {
      title: "Added On",
      data: "added_on",
      orderable: false,
      render: function (data) {
        const date = new Date(data);
        return isNaN(date.getTime()) ? "N/A" : formatDate(date);
      },
    },

    {
      title: "Assigned On",
      data: "assigned_on",
      orderable: false,
      render: function (data) {
        return data ? formatDate(data) : "N/A";
      },
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: function (data, type, row) {
        if (row.is_assigned === 1) {
          const refId = row.ref_id || "N/A";
          return `
    <div class="d-flex align-items-center gap-2">
      <span class="">${refId}</span>
      <span 
        class="copy-ref-btn" 
        data-ref="${refId}"
       
        style="cursor: pointer;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="16" height="16" 
             viewBox="0 0 24 24" 
             fill="none" 
             stroke="currentColor" 
             stroke-width="2" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             class="lucide lucide-copy text-primary">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </span>
    </div>
  `;
        } else {
          const encodedId = btoa(row.id.toString());
          return `
        <a 
          href="https://instacrm.rapidcollaborate.com/workspace/addworkspace?direct_id=${encodedId}" 
          target="" 
          rel="noopener noreferrer" 
          class="btn btn-sm n-btn btn-success"
        >
          Assign
        </a>
      `;
        }
      },
    },
  ];

  const handleCopy = (data) => {
    navigator.clipboard
      .writeText(data.ref_id)
      .then(() => {
        toast.success("RefId copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy QuoteID:", err);
      });
  };

  return permissionDenied ? (
    <div className="container text-center py-5">
      <h2 className="mb-4">Permission Not Allowed </h2>
      <p className="text-muted">You don’t have access to this page.</p>
    </div>
  ) : (
    <div className="f-13 f-source bg-sec">
      <div className="py-3 px-5 ">
        <div className="d-flex justify-content-between align-items-center mb-4 ">
          <h2 className="fs-5 mb-0">Direct Queries</h2>

          {/* Filter Form */}
          <form onSubmit={handleFilterSubmit} className="">
            <div className="d-flex gap-2 align-items-center justify-content-end">
              <div className="">
                {/* <label className="form-label">Date Range</label> */}
                <div>
                  <DatePicker
                    className="form-control form-control-sm f-13"
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
                    maxDate={new Date()}
                  />
                </div>
              </div>
              <div className="">
                {/* <label className="form-label">Status</label> */}
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select form-select-sm f-13"
                >
                  <option value="">Status All</option>
                  <option value="1">Assigned</option>
                  <option value="2">Not Assigned</option>
                </select>
              </div>
              <div className="">
                {/* <label className="form-label">Keyword</label> */}
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Search by keyword"
                  className="form-control form-control-sm f-13"
                />
              </div>
              {/* <div className="col-md-3 d-flex gap-2"> */}
              <div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="btn btn-sm n-btn btn-outline-dark"
                >
                  <RefreshCcw size={11} />
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-sm n-btn btn-warning text-white w-100"
                >
                  Apply Filters <Funnel size={12} />
                </button>
              </div>

              {/* </div> */}
            </div>
          </form>
        </div>
        {/* Data Table */}
        <div className="sec-border-top">
          <div className="">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <DataTable
                data={queries}
                columns={columns}
                className="table table-striped  table-hover"
                options={{
                  pageLength: 25,
                  ordering: true,
                  order: [],
                  createdRow: (row, data) => {
                    $(row)
                      .find(".copy-ref-btn")
                      .on("click", () => handleCopy(data));
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="main-footer">Powered by EMarketz India Pvt Ltd</div>
    </div>
  );
};

export default DirectQueryList;
