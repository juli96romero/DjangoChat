import React, { useState, useEffect } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

const HomePage = (props) => {
  const [roomCode, setRoomCode] = useState(null);

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  useEffect(() => {
    
    const fetchRoomCode = async () => {
      const response = await fetch("/image_loader/user-in-room");
      const data = await response.json();
      setRoomCode(data.code);
    };

    fetchRoomCode();
  }, []);

  const renderHomePage = () => {
    return (
      <div className="center">
        <Grid container spacing={3}>
          <Grid item xs={12} align="center">
            <Typography variant="h3" compact="h3">
              Django Chat
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button color="primary" to="/join" component={Link}>
                Join a Room
              </Button>
              <Button color="secondary" to="/create" component={Link}>
                Create a Room
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            roomCode ? (
              <Navigate to={`/room/${roomCode}`} replace={true} />
            ) : (
              renderHomePage()
            )
          }
        />

        <Route path="/join/*" element={<RoomJoinPage />} />
        <Route path="/create/" element={<CreateRoomPage />} />

        <Route
          path="/room/:roomCode"
          element={
            <Room
              userName={props.userName}
              leaveRoomCallback={clearRoomCode}
            />
          }
        />

      </Routes>
    </Router>
  );
};

export default HomePage;
