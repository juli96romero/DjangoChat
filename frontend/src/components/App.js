import React, { useState } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import { TextField, Grid, Typography } from "@mui/material";

export default function App(props) {
  const initialState = {
    userName: "",
    habilitado: false,
  };

  const [room, setRoom] = useState(initialState);

  const handleTextFieldChange = (e) => {
    setRoom((data) => ({
      ...data,
      userName: e.target.value,
    }));
  };


  return (
    <div>
      <nav className="flex items-center justify-between px-4 py-6 bg-teal-800">
        <Grid item xs={16} align="center">
          <Typography variant="h4" color="white">
            Django Chat
          </Typography>
        </Grid>
        <Grid item xs={12} align="right">
          <TextField
            label="UserName"
            placeholder="Enter a User name"
            value={room.userName}
            helperText={""}
            variant="outlined"
            InputProps={{
              style: {
                backgroundColor: "white", // Set the background color to match the navigation bar
              },
              notchedOutline: {
                borderColor: "white", // Set the outline color to match the navigation bar text color
              },
            }}
            onChange={handleTextFieldChange}
          />
        </Grid>
      </nav>
      <HomePage userName={room.userName}/>
    </div>
  );
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
