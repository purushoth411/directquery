import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAuth } from "../utils/idb";

const DirectQueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
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
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getStatusBadge = (isAssigned) => {
    return isAssigned === 1 ? (
      <span style={{ color: "green", fontWeight: "bold" }}>Assigned</span>
    ) : (
      <span style={{ color: "red", fontWeight: "bold" }}>Not Assigned</span>
    );
  };
  return (
    <div style={{ padding: "20px" }}>
      <h2>Direct Queries</h2>
      {loading ? (
        <p>Loading...</p>
      ) : queries.length === 0 ? (
        <p>No queries found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="10"
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th>#</th>
                <th>Query Details</th>
                <th>Added On</th>
                <th>Status</th>
                <th>Assigned On</th>
                <th>Ref ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td style={{ maxWidth: "400px", wordWrap: "break-word" }}>
                    {stripHtml(item.query_details).substring(0, 100)}
                    {item.query_details.length > 100 && "..."}
                  </td>
                  <td>{formatDate(item.added_on)}</td>
                  <td>{getStatusBadge(item.is_assigned)}</td>
                  <td>{formatDate(item.assigned_on)}</td>
                  <td>{item.ref_id || "N/A"}</td>
                  <td>
                    {item.is_assigned === 1 ? (
                      <span>Already Assigned</span>
                    ) : (
                      <a
                        href={`https://instacrm.rapidcollaborate.com/workspace/addworkspace?direct_id=${btoa(
                          item.id.toString()
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        Assign
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DirectQueryList;
