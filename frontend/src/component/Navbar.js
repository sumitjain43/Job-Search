import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import PostAddIcon from "@material-ui/icons/PostAdd";
import WorkIcon from "@material-ui/icons/Work";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import isAuth, { userType } from "../lib/isAuth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    letterSpacing: 0.2,
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  list: {
    width: 260,
  },
}));

const Navbar = (props) => {
  const classes = useStyles();
  let history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleClick = (location) => {
    console.log(location);
    history.push(location);
  };

  const toggleDrawer = (open) => () => {
    setMobileOpen(open);
  };

  const buildNavItems = () => {
    if (isAuth()) {
      if (userType() === "recruiter") {
        return [
          { label: "Home", icon: <HomeIcon />, to: "/home" },
          { label: "Add Jobs", icon: <PostAddIcon />, to: "/addjob" },
          { label: "My Jobs", icon: <WorkIcon />, to: "/myjobs" },
          { label: "Employees", icon: <PeopleIcon />, to: "/employees" },
          { label: "Profile", icon: <PersonIcon />, to: "/profile" },
          { label: "Logout", icon: <ExitToAppIcon />, to: "/logout" },
        ];
      }
      return [
        { label: "Home", icon: <HomeIcon />, to: "/home" },
        { label: "Applications", icon: <WorkIcon />, to: "/applications" },
        { label: "Profile", icon: <PersonIcon />, to: "/profile" },
        { label: "Logout", icon: <ExitToAppIcon />, to: "/logout" },
      ];
    }
    return [
      { label: "Login", icon: <VpnKeyIcon />, to: "/login" },
      { label: "Signup", icon: <PersonAddIcon />, to: "/signup" },
    ];
  };

  return (
    <AppBar position="fixed" color="primary" className={classes.root}>
      <Toolbar>
        <div className={classes.sectionMobile}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            className={classes.menuButton}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </div>
        <Typography variant="h6" className={classes.title}>
          Job Portal
        </Typography>
        <div className={classes.sectionDesktop}>
          {buildNavItems().map((item) => (
            <Button key={item.label} color="inherit" onClick={() => handleClick(item.to)} startIcon={item.icon}>
              {item.label}
            </Button>
          ))}
        </div>
        <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer(false)}>
          <div
            className={classes.list}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              {buildNavItems().map((item) => (
                <ListItem button key={item.label} onClick={() => handleClick(item.to)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
