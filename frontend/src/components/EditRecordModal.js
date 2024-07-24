import React, { useState, useEffect } from "react";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/material/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import Stack from "@mui/joy/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip } from '@mui/material';
import Fade from './Fade'
import { useLocation } from 'react-router-dom';

const EditRowModal = ({ selected, row, setEditOpen }) => {
    const [CityID, setCityID] = useState("");
    const [CityName, setCityName] = useState("");
    const [District, setDistrict] = useState("");
    const [CityPopulation, setCityPopulation] = useState("");
    const [CountryName, setCountryName] = useState("");
    const [Region, setRegion] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [isEditDisabled, setEditDisabled] = useState(true);
    const location = useLocation();

    const handleOpen = () => {
        setOpen(true);
        setEditOpen(true);
    };

    useEffect(() => {
        // Parse the query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const state = queryParams.get("edit");

        // Set the state based on the URL parameter
        if (state === "true") {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [location.search]);

    useEffect(() => {
        if (open) {
            setCityID(row.CityID);
            setCityName(row.CityName); // Set cityName from initialCity
            setDistrict(row.District);
            setCityPopulation(row.CityPopulation);
            setCountryName(row.CountryName);
            setRegion(row.Region);
        }
    }, [open, row]);

    useEffect(() => {
        if (selected.length === 1) {
          setEditDisabled(false);
        }
        else {
          setEditDisabled(true);
        }
      }, [selected.length])

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            if (!Number.isInteger(Number(CityPopulation))) {
                setError("Population must be an integer");
                return;
            }

            const response = await fetch(
                "http://localhost:3000/api/cities/edit",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        CityID: CityID,
                        CityName: CityName,
                        District: District,
                        CityPopulation: CityPopulation,
                        CountryName: CountryName,
                        Region: Region,
                    }),
                }
            );
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error("Error adding data", error);
        }
        // setCityName('');
        // setDistrict('');
        // setCityPopulation('');
        // setCountryName('');
        // setRegion('');
        // setError('');
        handleClose(); // Close the modal
    };

    const handleClose = () => {
        setCityName("");
        setDistrict("");
        setCityPopulation("");
        setCountryName("");
        setRegion("");
        setError("");
        setEditOpen(false);
        setOpen(false);
    };

    return (
        <div>
            <Tooltip title="Edit">
                <span>
                    <IconButton
                        onClick={handleOpen}
                        disabled={isEditDisabled}
                        sx={{ color: 'orange' }}
                    >
                        <EditIcon />
                    </IconButton>
                </span>
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
                            <DialogTitle>Edit existing data entry</DialogTitle>
                            <IconButton
                                aria-label="close"
                                onClick={handleClose}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <DialogContent>
                                Fill in the information for the table
                            </DialogContent>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2}>
                                    <FormControl>
                                        <FormLabel>City Name</FormLabel>
                                        <Input
                                            required
                                            value={CityName}
                                            onChange={(e) =>
                                                setCityName(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>District</FormLabel>
                                        <Input
                                            required
                                            value={District}
                                            onChange={(e) =>
                                                setDistrict(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Population</FormLabel>
                                        <Input
                                            required
                                            value={CityPopulation}
                                            onChange={(e) =>
                                                setCityPopulation(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Country</FormLabel>
                                        <Input
                                            required
                                            value={CountryName}
                                            onChange={(e) =>
                                                setCountryName(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Region</FormLabel>
                                        <Input
                                            required
                                            value={Region}
                                            onChange={(e) =>
                                                setRegion(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    {error && (
                                        <p style={{ color: "red" }}>{error}</p>
                                    )}
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

export default EditRowModal;
