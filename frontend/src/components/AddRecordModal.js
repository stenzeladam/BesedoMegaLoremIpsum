import React, { useState, useEffect } from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/material/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import { Tooltip } from '@mui/material';
import Fade from './Fade'
import { useLocation } from 'react-router-dom';

const AddRowModal = ({setAddOpen}) => {
  const [cityName, setCityName] = useState('');
  const [district, setDistrict] = useState('');
  const [population, setPopulation] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // reads parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const state = queryParams.get('add');
    
    // sets the state based on URL parameters
    if (state === 'true') {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [location.search]);

  const handleOpen = () => {
    setOpen(true);
    setAddOpen(true);
  }
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!Number.isInteger(Number(population))) {
        setError('Population must be an integer');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/cities/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cityName: cityName, 
          district: district, 
          population: population, 
          country: country, 
          region: region 
        })
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error adding data', error);
    }
    setCityName('');
    setDistrict('');
    setPopulation('');
    setCountry('');
    setRegion('');
    setError('');
    handleClose();
  };

  const handleClose = () => {
    setCityName('');
    setDistrict('');
    setPopulation('');
    setCountry('');
    setRegion('');
    setError('');
    setAddOpen(false);
    setOpen(false);
  }

  return (
    <div>
      <Tooltip title="Add">
        <IconButton 
              sx={{ color: 'green' }}
              onClick={handleOpen}>
              <AddCircleOutlinedIcon/>
        </IconButton> 
      </Tooltip>
      <Modal 
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            TransitionComponent: Fade,
          },
        }}
      >
      <Fade in={open}>
        <Box>
          <ModalDialog>
            <DialogTitle>Create new data entry</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>Fill in the information for the table</DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>City Name</FormLabel>
                  <Input
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>District</FormLabel>
                  <Input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Population</FormLabel>
                  <Input
                    required
                    value={population}
                    onChange={(e) => setPopulation(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Region</FormLabel>
                  <Input
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </FormControl>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button type="submit">Submit</Button>
              </Stack>
            </form>
          </ModalDialog>
        </Box>
      </Fade>        
      </Modal>
    </div>
  );
};

export default AddRowModal;
