import { useContext, useState } from "react";
import { Button, Grid, Paper, TextField, Typography } from "@material-ui/core";
import axios from "axios";
import apiList from "../lib/apiList";
import { SetPopupContext } from "../App";

const Assistant = () => {
  const setPopup = useContext(SetPopupContext);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");

  const send = async () => {
    const message = input.trim();
    if (!message) return;
    setInput("");
    const newHistory = [...history, { role: "user", content: message }];
    setHistory(newHistory);
    try {
      const resp = await axios.post(
        apiList.aiChat,
        { history: newHistory, message },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const reply = resp.data.reply || "";
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setPopup({ open: true, severity: "error", message: "AI request failed" });
    }
  };

  return (
    <Grid container direction="column" style={{ padding: 20, maxWidth: 900 }}>
      <Typography variant="h4" style={{ marginBottom: 16 }}>
        AI Assistant
      </Typography>
      <Paper style={{ padding: 16, marginBottom: 16, minHeight: 360 }}>
        {history.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {m.role === "user" ? "You" : "Assistant"}
            </Typography>
            <Typography variant="body1">{m.content}</Typography>
          </div>
        ))}
      </Paper>
      <div style={{ display: "flex", gap: 8 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          variant="outlined"
          placeholder="Ask anything about your job search..."
          fullWidth
        />
        <Button color="primary" variant="contained" onClick={send}>
          Send
        </Button>
      </div>
    </Grid>
  );
};

export default Assistant;

