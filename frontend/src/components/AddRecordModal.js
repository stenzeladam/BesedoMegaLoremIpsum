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

const AddRowModal = ({ open, handleClose }) => {

  const [cityID, setCityID] = useState('');
  const [cityName, setCityName] = useState('');
  const [error, setError] = useState('');

  const checkCityIDUnique = async (id) => {
    try {
      const response = await fetch(`/api/cities/check-id/${id}`);
      const data = await response.json();
      return response.data.isUnique;
    } catch (error) {
      console.error('Error checking City ID uniqueness:', error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const isUnique = await checkCityIDUnique(cityID);

    if (!isUnique) {
      setError('The City ID is already in use. Please choose a different ID.');
      return;
    }

    // Clear error if ID is unique
    setError('');

    // Perform your submit logic here
    console.log('City ID:', cityID);
    console.log('City Name:', cityName);
    
    handleClose(); // Close the modal
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleClose(); // Close the modal after form submission
          }}
        >
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>City ID</FormLabel>
              <Input
                autoFocus
                required
                value={cityID}
                onChange={(e) => setCityID(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>City Name</FormLabel>
              <Input required />
            </FormControl>
            <FormControl>
              <FormLabel>District</FormLabel>
              <Input required />
            </FormControl>
            <FormControl>
              <FormLabel>Population</FormLabel>
              <Input required />
            </FormControl>
            <FormControl>
              <FormLabel>Country</FormLabel>
              <Input required />
            </FormControl>
            <FormControl>
              <FormLabel>Region</FormLabel>
              <Input required />
            </FormControl>
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default AddRowModal;
