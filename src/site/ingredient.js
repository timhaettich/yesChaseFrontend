import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// Styled components
const Root = styled('div')(({ theme }) => ({
  flexGrow: 1,
}));

const TitleContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const StyledButton = styled(Button)(({ theme, variantType }) => ({
  margin: variantType === 'teamSwitch' ? theme.spacing(1) : theme.spacing(2),
}));

export default function Admin() {

  const [ingredient, setIngredient] = useState(null);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login'; // Redirect to login page
  };
  
  const handleIngredientBought = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_BASE_URL}/player/ingredientDone`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    window.location.href = '/';
  };

  const fetchIngredients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/player/ingredient`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setIngredient(data.Ingredient);
    } catch (error) {
      console.error('Error fetching transports:', error);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          <TitleContainer>
            <Typography variant="h6">
              Special Challenge
            </Typography>
          </TitleContainer>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
            style={{ marginLeft: 'auto' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Typography variant="h4" align="center" gutterBottom>
        Special Task!
      </Typography>
      <Typography variant="h6" align="left" margin="10%" gutterBottom>
                You most stop your tasks immediately and leave any transport you're currently on.<br/>
                Once you bought the following ingredient(s) you're free to continue your tasks.<br/>
                Note that both Runners AND Chasers need to do this task and BOTH players need to do so (They have their own ingredients)<br/><br/>
                ATTENTION! As of 12:00, the following cantons have been blocked! You're no longer allowed to stay in them. You must take the next direct train/route out of the cantons!<br/>
                Graubünden, Tessin, Wallis, Waadt, Genf.
              </Typography>
              <Typography variant="h6" align="center" gutterBottom>🛒 {ingredient} 🛒</Typography>
      <Container>
        <StyledButton
          key={'ingredientBought'}
          variant="contained"
          variantType="teamSwitch"
          color="secondary"
          onClick={() => handleIngredientBought()}
        >Ingredient bought!
        </StyledButton>
      </Container>
    </Root>
  );
}
