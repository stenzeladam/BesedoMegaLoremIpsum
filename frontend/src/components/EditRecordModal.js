import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const EditRowModal = ({ open, handleClose, id }) => {
  const [cityID, setCityID] = useState('');
  const [cityName, setCityName] = useState('');
  const [district, setDistrict] = useState('');
  const [population, setPopulation] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    
    setCityID(id);
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch('http://localhost:3000/api/cities/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cityID: cityID,
          cityName: cityName, 
          district: district, 
          population: population, 
          country: country, 
          region: region 
        })
      });
      const data = await response.json();
    } catch (error) {
      console.error('Error adding data', error);
    }
    setCityName('');
    setDistrict('');
    setPopulation('');
    setCountry('');
    setRegion('');
    handleClose(); // Close the modal
  };

  const handleExit = (event) => {
    setCityName('');
    setDistrict('');
    setPopulation('');
    setCountry('');
    setRegion('');
    event.stopPropagation();
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <DialogTitle>Edit existing data entry</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleExit}
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
    </Modal>
  );
};

export default EditRowModal;
