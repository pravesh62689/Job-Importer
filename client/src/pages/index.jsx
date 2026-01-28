import axios from "axios";
import Link from "next/link";

export default function Home() {
  const triggerImport = async () => {
    await axios.post("/api/import", {
      url: "https://jobicy.com/?feed=job_feed",
    });
    alert("Import queued successfully");
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Job Importer Admin</h1>
          <button className="btn" onClick={triggerImport}>
            Trigger Import
          </button>
        </div>

        <p>
          This panel allows you to fetch jobs from external feeds and monitor
          import history.
        </p>

        <Link href="/import-logs">
          <button className="btn secondary" style={{ marginTop: 16 }}>
            View Import History
          </button>
        </Link>
      </div>
    </div>
  );
}
