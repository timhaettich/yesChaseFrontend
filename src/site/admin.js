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

const FormContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(4),
}));

// Updated StatsContainer to display in a row
const StatsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(4),
}));

export default function Admin() {
  const [oldCoinValue, setOldCoinValue] = useState('');
  const [newCoinValue, setNewCoinValue] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardCost, setCardCost] = useState('');
  const [cardStats, setCardStats] = useState([]);
  const [totalCardLogCount, setTotalCardLogCount] = useState(0);

  // Fetch card stats on component mount
  useEffect(() => {
    async function fetchCardStats() {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/admin/cardStats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch card stats');

        const data = await response.json();
        setCardStats(data.data); // List of costs with their card counts
        setTotalCardLogCount(data.count); // Total used card count
      } catch (error) {
        console.error('Error fetching card stats:', error);
        toast.error('Error fetching card stats');
      }
    }

    fetchCardStats();
  }, []);

  const handleUpdate = async () => {
    if (!oldCoinValue || !newCoinValue) {
      toast.warn('Please fill in both fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/updateCoins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          costOld: oldCoinValue,
          costNew: newCoinValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to update coin values');

      toast.success('Coin values updated successfully!');
    } catch (error) {
      console.error('Error updating coin values:', error);
      toast.error('Error updating coin values');
    }
  };

  const handleAddCard = async () => {
    if (!cardDescription || !cardCost) {
      toast.warn('Please fill in both fields for the new card');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/addCard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: cardDescription,
          cost: parseInt(cardCost, 10),
        }),
      });

      if (!response.ok) throw new Error('Failed to add new card');

      toast.success('New card added successfully!');
      setCardDescription('');
      setCardCost('');
    } catch (error) {
      console.error('Error adding new card:', error);
      toast.error('Error adding new card');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          <TitleContainer>
            <Typography variant="h6">
              Admin Panel
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

      <StatsContainer>
        <Card style={{ width: '150px', margin: '0 10px' }}>
          <CardContent>
            <Typography variant="h6">Total Used Cards</Typography>
            <Typography variant="body1">{totalCardLogCount}</Typography>
          </CardContent>
        </Card>

        {cardStats.map((stat) => (
          <Card key={stat.Cost} style={{ width: '150px', margin: '0 10px' }}>
            <CardContent>
              <Typography variant="h6">Cost: {stat.Cost}</Typography>
              <Typography variant="body1">Card Count: {stat.CardCount}</Typography>
            </CardContent>
          </Card>
        ))}
      </StatsContainer>

      <FormContainer>
        <TextField
          label="Old Coin Value"
          variant="outlined"
          type="number"
          value={oldCoinValue}
          onChange={(e) => setOldCoinValue(e.target.value)}
          margin="normal"
        />
        <TextField
          label="New Coin Value"
          variant="outlined"
          type="number"
          value={newCoinValue}
          onChange={(e) => setNewCoinValue(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          style={{ marginTop: 16 }}
        >
          Update Coin Values
        </Button>
      </FormContainer>

      <FormContainer>
        <Typography variant="h6" gutterBottom style={{ marginTop: 32 }}>
          Add New Card
        </Typography>
        <TextField
          label="Card Description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={cardDescription}
          onChange={(e) => setCardDescription(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Card Cost"
          variant="outlined"
          type="number"
          value={cardCost}
          onChange={(e) => setCardCost(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCard}
          style={{ marginTop: 16 }}
        >
          Add New Card
        </Button>
      </FormContainer>

      <ToastContainer />
    </Root>
  );
}
