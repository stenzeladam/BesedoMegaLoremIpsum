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
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip } from "@mui/material";
import Fade from "./Fade";
import { useLocation } from "react-router-dom";

const EditRowModal = ({ selected, row, setEditOpen }) => {
    const [CityID, setCityID] = useState("");
    const [CityName, setCityName] = useState("");
    const [District, setDistrict] = useState("");
    const [CityPopulation, setCityPopulation] = useState("");
    const [CountryName, setCountryName] = useState("");
    const [Region, setRegion] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [isEditDisabled, setEditDisabled] = useState(selected.length !== 1);
    const location = useLocation();
    const [selectedRow, setSelectedRow] = useState(null);

    const findRowIndexByCityID = (selectedParam, rowParam) => {
        if (selectedParam.length === 0) {
            return -1; // No selected items
        }
    
        const cityID = selectedParam[0];
        return rowParam.findIndex(item => item.CityID === cityID);
    };

    const handleOpen = () => {
        let rowIndex = findRowIndexByCityID(selected, row);
        setSelectedRow(row[rowIndex]);
        setOpen(true);
        setEditOpen(true);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const state = queryParams.get("edit");

        if (state === "true") {
            let rowIndex = findRowIndexByCityID(selected, row);
            if (rowIndex !== -1) {
                setSelectedRow(row[rowIndex]);
                setOpen(true);
            } else {
                setOpen(false);
            }
        } else {
            setOpen(false);
        }
    }, [location.search, selected, row]);

    useEffect(() => {
        if (open && selectedRow) {
            setCityID(selectedRow.CityID || "");
            setCityName(selectedRow.CityName || "");
            setDistrict(selectedRow.District || "");
            setCityPopulation(selectedRow.CityPopulation || "");
            setCountryName(selectedRow.CountryName || "");
            setRegion(selectedRow.Region || "");
        }
    }, [open, selectedRow]);

    useEffect(() => {
        setEditDisabled(selected.length !== 1);
    }, [selected.length]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            if (!Number.isInteger(Number(CityPopulation))) {
                setError("Population must be an integer");
                return;
            }

            const response = await fetch("http://localhost:3000/api/cities/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    CityID,
                    CityName,
                    District,
                    CityPopulation,
                    CountryName,
                    Region,
                }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error("Error adding data", error);
        }

        handleClose();
    };

    const handleClose = () => {
        setCityID("");
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
                        sx={{ color: "orange" }}
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
                            {selectedRow && (
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
                            )}
                        </ModalDialog>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};

export default EditRowModal;
