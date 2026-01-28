import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ImportLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get(`/api/import-logs?page=${page}&limit=10`)
      .then((res) => setLogs(res.data.data));
  }, [page]);

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h2>Import History</h2>
          <Link href="/">
            <button className="btn secondary">Back</button>
          </Link>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Feed</th>
              <th>Total</th>
              <th>New</th>
              <th>Updated</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={{ maxWidth: 300, wordBreak: "break-all" }}>
                  {log.fileName}
                </td>
                <td>{log.totalFetched}</td>
                <td>
                  <span className="badge success">{log.newJobs}</span>
                </td>
                <td>
                  <span className="badge warning">{log.updatedJobs}</span>
                </td>
                <td>
                  <span className="badge error">{log.failedJobs}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20 }}>
          <button
            className="btn secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="btn secondary"
            style={{ marginLeft: 10 }}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
