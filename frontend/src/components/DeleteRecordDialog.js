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

const DeleteDialog = ({selected}) => {
  const [open, setOpen] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (selected.length > 0) {
      setIsDeleteDisabled(false);
    }
    else {
      setIsDeleteDisabled(true);
    }
  }, [selected.length])

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleYes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cities/delete`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({selected})
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
        console.error('Error deleting selection: ', error);
    }
    handleClose();
  }

  const handleNo = () => {
    handleClose();
  }

  return (
    <div>
      <Tooltip title="Delete">
        <span>
          <IconButton 
            sx={{ color: 'red' }}
            disabled={isDeleteDisabled}
            onClick={handleOpen}
          >
            <DeleteIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <React.Fragment>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
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
        </Dialog>
      </React.Fragment>
    </div>
  );
}
export default DeleteDialog;