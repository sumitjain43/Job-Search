import { useContext, useEffect, useState } from "react";
import { Button, Chip, Grid, Paper, TextField, Typography } from "@material-ui/core";
import axios from "axios";
import apiList from "../lib/apiList";
import { SetPopupContext } from "../App";

const Preferences = () => {
  const setPopup = useContext(SetPopupContext);
  const [prefs, setPrefs] = useState({
    keywords: [],
    locations: [],
    jobTypes: [],
    minSalary: 0,
    remoteOnly: false,
    excludedCompanies: [],
    autoApply: false,
    maxApplicationsPerDay: 5,
  });
  const [newKeyword, setNewKeyword] = useState("");

  const get = async () => {
    try {
      const resp = await axios.get(apiList.preferences, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPrefs(resp.data);
    } catch (e) {
      setPopup({ open: true, severity: "error", message: "Failed to load preferences" });
    }
  };

  const save = async () => {
    try {
      const resp = await axios.put(apiList.preferences, prefs, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPopup({ open: true, severity: "success", message: resp.data.message });
    } catch (e) {
      setPopup({ open: true, severity: "error", message: "Failed to save" });
    }
  };

  useEffect(() => { get(); }, []);

  return (
    <Grid container direction="column" style={{ padding: 20, maxWidth: 900 }}>
      <Typography variant="h4" style={{ marginBottom: 16 }}>Preferences</Typography>
      <Paper style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <TextField label="Add keyword" variant="outlined" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} />
          <Button onClick={() => { if (!newKeyword.trim()) return; setPrefs({ ...prefs, keywords: [...(prefs.keywords||[]), newKeyword.trim()] }); setNewKeyword(""); }} variant="contained" color="primary">Add</Button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {(prefs.keywords || []).map((k, idx) => (
            <Chip key={idx} label={k} onDelete={() => setPrefs({ ...prefs, keywords: prefs.keywords.filter((_, i) => i !== idx) })} />
          ))}
        </div>
        <TextField label="Min Salary" type="number" variant="outlined" value={prefs.minSalary || 0} onChange={(e) => setPrefs({ ...prefs, minSalary: parseInt(e.target.value||"0", 10) })} style={{ marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={save} variant="contained" color="primary">Save Preferences</Button>
          <Button onClick={async ()=> { try { const r = await axios.post(apiList.aiAutoApply, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); setPopup({ open: true, severity: "success", message: r.data.message }); } catch(e){ setPopup({ open: true, severity: "error", message: "Auto-apply failed" }); } }} variant="outlined" color="secondary">Run Auto-Apply Now</Button>
        </div>
      </Paper>
    </Grid>
  );
};

export default Preferences;

