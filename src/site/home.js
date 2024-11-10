import React, { useEffect, useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import Countdown from 'react-countdown';
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
  justifyContent: 'space-between',
}));

const StyledCard = styled(Card)(({ theme, isCurrent }) => ({
  margin: theme.spacing(2),
  minWidth: 200,
  maxWidth: 300,
  cursor: 'pointer',
  backgroundColor: isCurrent ? 'gold' : undefined,
  color: isCurrent ? 'black' : undefined,
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const StyledButton = styled(Button)(({ theme, variantType }) => ({
  margin: variantType === 'teamSwitch' ? theme.spacing(1) : theme.spacing(2),
}));

export default function Home() {
  const [items, setItems] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [opponentCurrentCard, setOpponentCurrentCard] = useState(null);
  const opponentCurrentCardNotification = useRef(false);
  const [teamName, setTeamName] = useState('');
  const [teamTypeId, setTeamTypeId] = useState('');
  const [teamTimeout, setTeamTimeout] = useState(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [transports, setTransports] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gpsPenaltydialogOpen, setGPSPenaltyDialogOpen] = useState(false);
  const [travelTime, setTravelTime] = useState('');
  const [gpsPenaltyTime, setGPSPenaltyTime] = useState('');
  const [travelCost, setTravelCost] = useState(0);
  const [selectedTransportId, setSelectedTransportId] = useState(null);
  const [teamSwitchDialogOpen, setTeamSwitchDialogOpen] = useState(false);

  const ingredientTimestamp = process.env.REACT_APP_INGREDIENT_TIME * 1000;
  const ingredientSentRef = useRef(false);

  const fetchActiveCards = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/cards/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setItems(data.data);
    } catch (error) {
      console.error('Error fetching active cards:', error);
    }
  };

  const fetchNotifications = async () => {
    console.log("Fetch notification", ingredientSentRef.current)
    var ingredient = null
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
      ingredient = data.Ingredient;
    } catch (error) {
      console.error('Error fetching transports:', error);
    }

    // Check if the ingredient has been sent already using ref
    if (!ingredientSentRef.current) {
      console.log("Send Not", ingredient, Date.now() > ingredientTimestamp)
      if (Date.now() > ingredientTimestamp && ingredient) {

        const registration = await navigator.serviceWorker.ready;
        const options = {
          body: 'A special event has been spawned! Please check the website and reload it!',
          icon: null,
        };
        registration.showNotification('SPECIAL EVENT!', options);
        // Mark the ingredient as sent using ref
        ingredientSentRef.current = true;
        window.location.href = '/';
      }
    }
  };

  const fetchCurrentCard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/player`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCurrentCard(data.data.team.card.id ? data.data.team.card : null);
      if (data.data.team.opponentCard.id) {
        if (!opponentCurrentCardNotification.current) {
          setOpponentCurrentCard(data.data.team.opponentCard)
          const registration = await navigator.serviceWorker.ready;
          const options = {
            body: 'Your opponent just selected a card! You can try to veto it',
            icon: null,
          };
          registration.showNotification('Veto your opponents card!', options);
          opponentCurrentCardNotification.current = true;
        }
      } else {
        opponentCurrentCardNotification.current = false;
        setOpponentCurrentCard(null);
      }
      setTeamName(data.data.team.typeName);
      setTeamTypeId(data.data.team.typeID);
      setTeamTimeout(data.data.team.timeout);
      setCoinBalance(data.data.team.teamBalance);
    } catch (error) {
      console.error('Error fetching current card:', error);
    }
  };

  const fetchTransports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/transport/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTransports(data.data);
    } catch (error) {
      console.error('Error fetching transports:', error);
    }
  };

  useEffect(() => {
    fetchActiveCards();
    fetchCurrentCard();
    fetchTransports();
    ingredientSentRef.current = false;

    const intervalId = setInterval(() => {
      console.log('Reload')
      fetchActiveCards();
      fetchCurrentCard();
      fetchNotifications();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCardClick = async (cardId) => {
    if (window.confirm("Are you sure you want to select this card?")) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/cards/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cardId: String(cardId) }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        await fetchActiveCards();
        await fetchCurrentCard();
      } catch (error) {
        console.error('Error selecting card:', error);
      }
    }
  };

  const handleCurrentCardCompletion = async () => {
    if (currentCard && window.confirm("Are you sure you want to complete this card?")) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/cards/completed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cardId: currentCard.id, balance: currentCard.cost }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        setCurrentCard(null);
        await fetchActiveCards();
        await fetchCurrentCard();
      } catch (error) {
        console.error('Error completing card:', error);
      }
    }
  };

  const handleCurrentCardVeto = async () => {
    if (currentCard && window.confirm("Are you sure you want to veto this card?")) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/cards/veto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cardId: currentCard.id, balance: currentCard.cost }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        setCurrentCard(null);
        await fetchActiveCards();
        await fetchCurrentCard();
      } catch (error) {
        console.error('Error completing card:', error);
      }
    }
  };

  const handleCurrentCardOpponentVeto = async () => {
    if (opponentCurrentCard && window.confirm("Are you sure you want to veto your opponents card?")) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/cards/vetoOpponent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cardId: opponentCurrentCard.id }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        setOpponentCurrentCard(null);
        opponentCurrentCardNotification.current = false;
        await fetchCurrentCard();
      } catch (error) {
        console.error('Error vetoing opponent card:', error);
      }
    }
  };

  const handleTransportClick = (transportId, transportCostIn) => {
    setSelectedTransportId(transportId);
    setTravelCost(transportCostIn);
    setDialogOpen(true);
  };

  const handleGPSPenaltyClick = () => {
    setGPSPenaltyDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTravelTime('');
    setTravelCost(0);
    setSelectedTransportId(null);
  };

  const handleGPSPenaltyDialogClose = () => {
    setGPSPenaltyDialogOpen(false);
    setGPSPenaltyTime('');
  };

  const handleDialogConfirm = async () => {
    if (travelTime && travelTime * travelCost <= coinBalance) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/transport/ride`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ travelTime: Number(travelTime), travelModeId: selectedTransportId }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        setCoinBalance(result.balance);
        handleDialogClose();
      } catch (error) {
        console.error('Error sending ride request:', error);
      }
    } else {
      toast.warn('Travel costs more than your balance allows!');
    }
  };

  const handleGPSPenaltyDialogConfirm = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/team/gpsPenalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ penaltyTime: Number(gpsPenaltyTime) }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setCoinBalance(result.balance);
      handleGPSPenaltyDialogClose();
    } catch (error) {
      console.error('Error sending gps penalty request:', error);
    }
  };

  const handleTeamSwitchClick = () => {
    setTeamSwitchDialogOpen(true);
  };

  const handleTeamSwitchConfirm = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/team/swap`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      setTeamSwitchDialogOpen(false);
      await fetchCurrentCard();
    } catch (error) {
      console.error('Error switching team:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          <TitleContainer>
            <Typography variant="h6">
              {teamName} Coins: {coinBalance}
            </Typography>
          </TitleContainer>
        </Toolbar>
      </AppBar>



      {teamTypeId === 2 ? (
        <div>

          {currentCard ? (
            <div>
              <Typography variant="h4" align="center" gutterBottom>
                Selected Card
              </Typography>
              <StyledCard isCurrent variant="outlined">
                <CardContent>
                  <Typography variant="h5">{currentCard.description}</Typography>
                  <Typography variant="body2">Reward: ${currentCard.cost}</Typography>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handleCurrentCardCompletion}
                  >
                    Complete Card
                  </StyledButton>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handleCurrentCardVeto}
                  >
                    Veto Card
                  </StyledButton>
                </CardContent>
              </StyledCard>
            </div>
          ) : (
            <div>

              {teamTimeout ? (
                <div>
                  <Typography variant="h6" color="secondary" align="center" gutterBottom>
                    You're in timeout for:<br />
                    <Countdown date={teamTimeout} />
                  </Typography>

                </div>
              ) : (
                <div>
                  <Container>
                    <Typography variant="h4" align="center" gutterBottom>
                      Pickable Cards
                    </Typography>
                    {items.slice(0, 4).map((item, index) => (
                      <StyledCard key={index} onClick={() => handleCardClick(item.ID)} variant="outlined">
                        <CardContent>
                          <Typography variant="h5">{item.Description}</Typography>
                          <Typography variant="body2">Reward: ${item.Cost}</Typography>
                          <Typography variant="body2">Time added: {format(item.TimeAdded, "HH:mm")} (Expires after 1h)</Typography>
                        </CardContent>
                      </StyledCard>
                    ))}
                  </Container>
                </div>
              )}
            </div>
          )}

          <Container>
            <Typography variant="h4" align="center" gutterBottom>
              Ride Transport
            </Typography>
            {transports.map((transport) => (
              <StyledButton
                key={transport.ID}
                variant="contained"
                onClick={() => handleTransportClick(transport.ID, transport.Cost)}
                disabled={(teamTimeout || currentCard) && transport.AllowTimeout === 0}
              >
                {transport.Name} (Cost: ${transport.Cost}/min)
              </StyledButton>
            ))}
          </Container>

          <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Enter Travel Time</DialogTitle>
            <DialogContent>
              <Typography>Trip price: {travelTime * travelCost}</Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Travel Time (minutes)"
                type="number"
                fullWidth
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDialogConfirm} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={teamSwitchDialogOpen} onClose={() => setTeamSwitchDialogOpen(false)}>
            <DialogTitle>Confirm Team Switch</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to switch to the Chaser role?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTeamSwitchDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleTeamSwitchConfirm} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={gpsPenaltydialogOpen} onClose={handleGPSPenaltyDialogClose}>
            <DialogTitle>Enter Penalty Time</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Penalty Time (minutes)"
                type="number"
                fullWidth
                value={gpsPenaltyTime}
                onChange={(e) => setGPSPenaltyTime(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleGPSPenaltyDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleGPSPenaltyDialogConfirm} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Container>
            <Typography variant="h4" align="center" gutterBottom>
              The Sad Buttons
            </Typography>
          </Container>
          <Container>
            <StyledButton
              key={'gpsPenalty'}
              variant="contained"
              variantType="teamSwitch"
              color="secondary"
              onClick={() => handleGPSPenaltyClick()}
            >📌 GPS Penalty 📌
            </StyledButton>

            <StyledButton
              variant="contained"
              onClick={handleTeamSwitchClick}
              color="secondary"
              variantType="teamSwitch"
            >
              🏹 I've been cought 🏹
            </StyledButton>
          </Container>
        </div>
      ) :
        <div>
          <Typography variant="h6" align="center" gutterBottom>
            Cards are only visible for Runners. Go chase them!
          </Typography>

          {teamTimeout && (
            <div>
              <Typography variant="h6" color="secondary" align="center" gutterBottom>
                You're in timeout for:<br />
                <Countdown date={teamTimeout} />
              </Typography>

            </div>
          )}
          {!teamTimeout && opponentCurrentCard && (
            <div>
              <Typography variant="h4" align="center" gutterBottom>
                Opponent Selected Card
              </Typography>
              <div align="center">
                <StyledCard isCurrent variant="outlined">
                  <CardContent>
                    <Typography variant="h5">{opponentCurrentCard.description}</Typography>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      onClick={handleCurrentCardOpponentVeto}
                    >
                      Veto Card
                    </StyledButton>
                  </CardContent>
                </StyledCard>
              </div>
            </div>
          )}

        </div>}
      <br />
      <br />
      <br />
      <br />
      <Container>
        <Button
          variant="contained"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Container>
      <ToastContainer />
    </Root>
  );
}
