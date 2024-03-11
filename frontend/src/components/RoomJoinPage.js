import React, { Component, useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function RoomJoinPage(props) {
  const navigate = useNavigate();
  const initialState = {
    roomCode: "",
    errorCode: "",
  };

  const [room, setRoom] = useState(initialState);

  const handleTextFieldChange = (e) => {
    setRoom((data) => ({
      ...data,
      roomCode: e.target.value,
    }));
  };

  const roomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: room.roomCode,
      }),
    };
    fetch("/image_loader/join-room", requestOptions)
      .then((response) => {
        if (response.ok) {
          navigate(`/room/${room.roomCode}`);
        } else {
          setRoom((data) => ({
            ...data,
            errorCode: "Room not found.",
          }));
        }
      })

      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="center">
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Join a Room{console.log(room.errorCode)}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <TextField
          error={Boolean(room.errorCode)}
          label="Code"
          placeholder="Enter a Room Code"
          value={room.roomCode}
          helperText={room.errorCode}
          variant="outlined"
          onChange={handleTextFieldChange}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button variant="contained" color="primary" onClick={roomButtonPressed}>
          Enter Room
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button variant="contained" color="secondary" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
    </div>
  );
}
