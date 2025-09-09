import { useContext, useEffect, useState } from "react";
import { Button, Card, CardContent, Grid, Typography } from "@material-ui/core";
import axios from "axios";
import apiList from "../lib/apiList";
import { SetPopupContext } from "../App";

const RecommendedJobs = () => {
  const setPopup = useContext(SetPopupContext);
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const resp = await axios.get(apiList.aiRecommendJobs, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setJobs(resp.data || []);
    } catch (e) {
      setPopup({ open: true, severity: "error", message: "Failed to load recommendations" });
    }
  };

  const quickApply = async (jobId) => {
    try {
      const resp = await axios.post(`${apiList.jobs}/${jobId}/applications`, { sop: "" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPopup({ open: true, severity: "success", message: resp.data.message });
    } catch (e) {
      setPopup({ open: true, severity: "error", message: e.response?.data?.message || "Apply failed" });
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  return (
    <Grid container direction="column" style={{ padding: 20, maxWidth: 1000 }}>
      <Typography variant="h4" style={{ marginBottom: 16 }}>Recommended Jobs</Typography>
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} key={job._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{job.title}</Typography>
                <Typography variant="body2" color="textSecondary">Type: {job.jobType} • Salary: {job.salary}</Typography>
                <Typography variant="body2">Skills: {(job.skillsets || []).join(', ')}</Typography>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Button color="primary" variant="contained" onClick={() => quickApply(job._id)}>Quick Apply</Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default RecommendedJobs;

