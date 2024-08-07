import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import Fade from './Fade';

const DeleteDialog = ({ selected, setDeleteOpen }) => {
  const [open, setOpen] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpen = () => {
    setDeleteOpen(true);
    setOpen(true);
  };

  const handleClose = () => {
    setDeleteOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    // reads parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const state = queryParams.get('delete');

    // sets the state based on URL parameters
    if (state === 'true') {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (selected.length > 0) {
      setIsDeleteDisabled(false);
    } else {
      setIsDeleteDisabled(true);
    }
  }, [selected.length]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (open) {
      queryParams.set('delete', 'true');
    } else {
      queryParams.delete('delete');
    }
    navigate(`?${queryParams.toString()}`, { replace: true });
  }, [open, navigate, location.search]);

  const handleYes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cities/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      console.error('Error deleting selection: ', error);
    }
    handleClose();
  };

  const handleNo = () => {
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Delete">
        <span>
          <IconButton
            sx={{ color: 'red' }}
            disabled={isDeleteDisabled}
            onClick={handleOpen}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
      <React.Fragment>
        <Dialog
          fullScreen={fullScreen}
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
            <div>
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
              <DialogTitle id="responsive-dialog-title">
                {"Delete selection?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the selected rows from the table?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button autoFocus onClick={handleNo}>
                  No, don't delete
                </Button>
                <Button onClick={handleYes} autoFocus>
                  Yes, delete
                </Button>
              </DialogActions>
            </div>
          </Fade>
        </Dialog>
      </React.Fragment>
    </div>
  );
};

export default DeleteDialog;
