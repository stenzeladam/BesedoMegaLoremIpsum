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

const EditRowModal = ({ open, handleClose, rows }) => {
  const [CityID, setCityID] = useState('');
  const [CityName, setCityName] = useState('');
  const [District, setDistrict] = useState('');
  const [CityPopulation, setCityPopulation] = useState('');
  const [CountryName, setCountryName] = useState('');
  const [Region, setRegion] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setCityID(rows.CityID);
      setCityName(rows.CityName);  // Set cityName from initialCity
      setDistrict(rows.District);
      setCityPopulation(rows.CityPopulation);
      setCountryName(rows.CountryName);
      setRegion(rows.Region);
    }
  }, [open, rows]);

  const handleSubmit = async (event) => {
    
    //setCityID(id);
    event.preventDefault();
    event.stopPropagation();
    
    try {

      if (!Number.isInteger(Number(CityPopulation))) {
        setError('Population must be an integer');
        return;
      }

      const response = await fetch('http://localhost:3000/api/cities/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          CityID: CityID,
          CityName: CityName, 
          District: District, 
          CityPopulation: CityPopulation, 
          CountryName: CountryName, 
          Region: Region 
        })
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error adding data', error);
    }
    setCityName('');
    setDistrict('');
    setCityPopulation('');
    setCountryName('');
    setRegion('');
    setError('');
    handleClose(); // Close the modal
  };

  const handleExit = (event) => {
    setCityName('');
    setDistrict('');
    setCityPopulation('');
    setCountryName('');
    setRegion('');
    setError('');
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
                value={CityName}
                onChange={(e) => setCityName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>District</FormLabel>
              <Input
                required
                value={District}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Population</FormLabel>
              <Input
                required
                value={CityPopulation}
                onChange={(e) => setCityPopulation(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Country</FormLabel>
              <Input
                required
                value={CountryName}
                onChange={(e) => setCountryName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Region</FormLabel>
              <Input
                required
                value={Region}
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
