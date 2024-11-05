import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import swal from 'sweetalert';
import { styled } from '@mui/material/styles';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

const BackgroundImage = styled(Grid)(({ theme }) => ({
  backgroundImage: 'url(https://source.unsplash.com/random)',
  backgroundSize: 'cover',
}));

const PaperContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(8, 4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const FormContainer = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/player/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Login failed:', error);
    return { message: 'Network error, please try again later.' };
  }
}

export default function Signin() {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await loginUser({
      username,
      password,
    });
    if ('token' in response) {
      swal('Success', 'Login successful', 'success', {
        buttons: false,
        timer: 2000,
      }).then(() => {
        localStorage.setItem('accessToken', response['token']);
        localStorage.setItem('user', JSON.stringify(response['userId']));
        window.location.href = '/home';
      });
    } else {
      swal('Failed', response.message, 'error');
    }
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      <CssBaseline />
      <BackgroundImage item xs={false} md={7} />
      <Grid item xs={12} md={5} component={Paper} elevation={6} square>
        <PaperContainer>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <FormContainer noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              onChange={(e) => setUserName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Sign In
            </SubmitButton>
          </FormContainer>
        </PaperContainer>
      </Grid>
    </Grid>
  );
}
