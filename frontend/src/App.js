import { createContext, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Grid, makeStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
import { indigo, deepOrange } from "@material-ui/core/colors";

import Welcome, { ErrorPage } from "./component/Welcome";
import Navbar from "./component/Navbar";
import Login from "./component/Login";
import Logout from "./component/Logout";
import Signup from "./component/Signup";
import Home from "./component/Home";
import Applications from "./component/Applications";
import Profile from "./component/Profile";
import CreateJobs from "./component/recruiter/CreateJobs";
import MyJobs from "./component/recruiter/MyJobs";
import JobApplications from "./component/recruiter/JobApplications";
import AcceptedApplicants from "./component/recruiter/AcceptedApplicants";
import RecruiterProfile from "./component/recruiter/Profile";
import MessagePopup from "./lib/MessagePopup";
import isAuth, { userType } from "./lib/isAuth";

const useStyles = makeStyles((theme) => ({
  body: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "98vh",
    paddingTop: "64px",
    boxSizing: "border-box",
    width: "100%",
  },
}));

export const SetPopupContext = createContext();

function App() {
  const classes = useStyles();
  let theme = createMuiTheme({
    palette: {
      primary: indigo,
      secondary: deepOrange,
      background: {
        default: "#f7f9fc",
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        "Roboto",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Helvetica",
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });
  theme = responsiveFontSizes(theme);
  const [popup, setPopup] = useState({
    open: false,
    severity: "",
    message: "",
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <SetPopupContext.Provider value={setPopup}>
          <Grid container direction="column">
            <Grid item xs>
              <Navbar />
            </Grid>
            <Grid item className={classes.body}>
              <Switch>
                <Route exact path="/">
                  <Welcome />
                </Route>
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route exact path="/signup">
                  <Signup />
                </Route>
                <Route exact path="/logout">
                  <Logout />
                </Route>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/applications">
                  <Applications />
                </Route>
                <Route exact path="/profile">
                  {userType() === "recruiter" ? (
                    <RecruiterProfile />
                  ) : (
                    <Profile />
                  )}
                </Route>
                <Route exact path="/addjob">
                  <CreateJobs />
                </Route>
                <Route exact path="/myjobs">
                  <MyJobs />
                </Route>
                <Route exact path="/job/applications/:jobId">
                  <JobApplications />
                </Route>
                <Route exact path="/employees">
                  <AcceptedApplicants />
                </Route>
                <Route>
                  <ErrorPage />
                </Route>
              </Switch>
            </Grid>
          </Grid>
          <MessagePopup
            open={popup.open}
            setOpen={(status) =>
              setPopup({
                ...popup,
                open: status,
              })
            }
            severity={popup.severity}
            message={popup.message}
          />
        </SetPopupContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
