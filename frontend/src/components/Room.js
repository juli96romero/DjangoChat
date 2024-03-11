import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, Paper,TextField } from "@mui/material";

const Room = (props) => {
  const { roomCode } = useParams();
  const [buttonText, setButtonText] = useState("Leave Room");
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const navigate = useNavigate();
  const [chat, setChat] = useState({
    messages: [],
  });

  const [newMessageContent, setNewMessageContent] = useState("");

  const postMessage = async () => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode,
          content: newMessageContent,
          sender: props.userName,
        }),
      };
      const response = await fetch(
        "/image_loader/post-message",
        requestOptions
      );
      if (response.ok) {
        // Refresh messages after posting
        getChatDetails();
        setNewMessageContent(""); // Clear the input field
      } else {
        if(props.userName=="")
          console.error("Empty UserName");
        else
          console.error("Empty Message");
      }
    } catch (error) {
      console.error("Error posting message:", error);
    }
  };

  const getChatDetails= async() =>{
    try {
      const mensajes = await fetch(
        "/image_loader/get-mensajes" + "?code=" + roomCode
      );
      const dataMensajes = await mensajes.json();
      setChat({
        messages: dataMensajes || [], // Ensure messages is an array
      });
      setChat((prevChat) => {
        // Ensure messages is an array and only update if there are new messages
        const newMessages = dataMensajes || [];
        const updatedChat = {
          messages: newMessages.length > 0 ? newMessages : prevChat.messages,
        };

        return updatedChat;
      });
    } catch (error) {
      console.error("Error fetching message details:", error);
    }
  }

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const response = await fetch(
          "/image_loader/get-room" + "?code=" + roomCode
        );
        if (!response.ok) {
          props.leaveRoomCallback();
          navigate("/");
          return;
        }

        if (!response.ok) {
          return;
        }
        
        const data = await response.json();
        setRoomDetails({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
      
    };
    getRoomDetails();
    getChatDetails();
  }, [roomCode, props, navigate]);

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/image_loader/leave-room", requestOptions).then((_response) => {
      props.leaveRoomCallback();
      navigate("/");
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setButtonText((prevText) =>
        prevText === "Leave Room" ? "Room leave" : "Leave Room"
      );
      getChatDetails();
    }, 2000);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []); // Run this effect once when the component mounts

  return (
    <div className="center">
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes: {roomDetails.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guest control: {roomDetails.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Host: {roomDetails.isHost.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveButtonPressed}
          >
            {buttonText}
          </Button>
        </Grid>
        <Grid item xs={12} md={12} align="left">
          <TextField
            label="New Message"
            variant="outlined"
            fullWidth
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={postMessage}
            style={{ marginTop: "10px" }}
          >
            Post Message
          </Button>
          <Paper
            style={{
              padding: "20px",
              height: "300px",
              overflowY: "auto",
              textAlign: "center",
            }}
          >
            {chat.messages.map((message, index) => (
              <Typography
                key={index}
                variant="body1"
                style={{
                  fontSize: "1.2rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  {`${message.sender}: `}
                </span>
                {message.content}
              </Typography>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Room;
