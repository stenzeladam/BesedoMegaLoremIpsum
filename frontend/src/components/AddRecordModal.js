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
import PropTypes from 'prop-types';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSpring, animated } from '@react-spring/web';

const Fade = React.forwardRef(function Fade(props, ref) {
  const {
    children,
    in: open,
    onClick,
    onEnter,
    onExited,
    ownerState,
    ...other
  } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter(null, true);
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited(null, true);
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {React.cloneElement(children, { onClick })}
    </animated.div>
  );
});

Fade.propTypes = {
  children: PropTypes.element.isRequired,
  in: PropTypes.bool,
  onClick: PropTypes.any,
  onEnter: PropTypes.func,
  onExited: PropTypes.func,
  ownerState: PropTypes.any,
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AddRowModal = ({ open, handleClose }) => {
  const [cityName, setCityName] = useState('');
  const [district, setDistrict] = useState('');
  const [population, setPopulation] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');

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
    handleClose(); // Close the modal
  };

  const handleExit = () => {
    setCityName('');
    setDistrict('');
    setPopulation('');
    setCountry('');
    setRegion('');
    setError('');
    handleClose();
  }

  return (
    <Modal 
      aria-labelledby="spring-modal-title"
      aria-describedby="spring-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
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
        </Box>
       </Fade>        
    </Modal>
  );
};

export default AddRowModal;
