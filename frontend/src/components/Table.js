import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    TableRow,
    TableCell,
    Checkbox,
    Box,
    Table,
    TableBody,
    TableContainer,
    TablePagination,
    Paper,
} from "@mui/material";

import EditRecordModal from "./EditRecordModal";
import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableToolbar from "./EnhancedTableToolbar";
import { fetchData, getComparator, stableSort } from "../helpers";

import "./TableStyles.css";

const TableMain = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("Population");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [error, setError] = useState({});
    const [cityData, setCityData] = useState([]);
    const [isAddOpen, setAddOpen] = useState();
    const [initialLoad, setInitialLoad] = useState(true);
    const [isEditOpen, setEditOpen] = useState();
    const [isDeleteOpen, setDeleteOpen] = useState();
    const rows = cityData;

    const visibleRows = useMemo(
        () =>
            stableSort(rows, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [order, orderBy, page, rowsPerPage, rows]
    );

    //initial api call to display the database in the table
    useEffect(() => {
        fetchData(`http://localhost:3000/api/cities`, setCityData, setError);
    }, []);

    // URL state management for adding an entry
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (isAddOpen === undefined) {
            // Do nothing if isAddOpen is undefined. This prevents the value from automatically defaulting to false
            return;
        }
        if (isAddOpen) {
            queryParams.set("add", "true"); // Add the parameter if isAddOpen is true
        } else {
            queryParams.delete("add"); // Remove the parameter if isAddOpen is false
        }
        navigate(`?${queryParams.toString()}`, { replace: true });
    }, [isAddOpen, navigate]);

    useEffect(() => {
        if (initialLoad) {
            const queryParams = new URLSearchParams(location.search);
            const selectedParam = queryParams.get("selected");

            if (selectedParam) {
                const ids = selectedParam
                    .split("_")
                    .map((id) => parseInt(id, 10));
                const validIds = ids.filter((id) =>
                    rows.some((row) => row.id === id)
                );
                setSelected((prevSelected) => {
                    const newSelected = [...prevSelected, ...validIds];
                    return Array.from(new Set(newSelected));
                });
            }

            setInitialLoad(false);
        }
    }, [location.search, initialLoad, rows]);

    useEffect(() => {
        if (!initialLoad) {
            const queryParams = new URLSearchParams(location.search);

            if (selected.length > 0) {
                queryParams.set("selected", selected.join("_"));
            } else {
                queryParams.delete("selected");
            }

            navigate(`?${queryParams.toString()}`, { replace: true });
        }
    }, [selected, initialLoad, navigate, location.search]);

    // URL state management for editing modal
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (isEditOpen === undefined) {
            return;
        }
        if (isEditOpen) {
            queryParams.set("edit", "true"); // Add the parameter if isEditOpen is true
        } else {
            queryParams.delete("edit"); // Remove the parameter if isEditOpen is false
        }
        navigate(`?${queryParams.toString()}`, { replace: true });
    }, [isEditOpen, location.search, navigate]);

    //UR: state management for deleting selected rows
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (isDeleteOpen === undefined) {
            return;
        }
        if (isDeleteOpen) {
            queryParams.set("delete", "true"); // Add the parameter if isDeleteOpen is true
        } else {
            queryParams.delete("delete"); // Remove the parameter if IsDeleteOpen is false
        }
        navigate(`?${queryParams.toString()}`, { replace: true });
    }, [isDeleteOpen, location.search, navigate]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.CityID);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id, updateURL = true) => {
        const selectedIndex = selected.indexOf(id);
        const queryParams = new URLSearchParams(location.search);

        let newSelected = [...selected];

        if (selectedIndex === -1) {
            newSelected.push(id);
        } else {
            newSelected.splice(selectedIndex, 1);
        }

        if (updateURL) {
            if (newSelected.length > 0) {
                queryParams.set("selected", newSelected.join("_"));
            } else {
                queryParams.delete("selected");
            }
            navigate(`?${queryParams.toString()}`, { replace: true });
        }

        setSelected(newSelected);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    if (error?.status) {
        return <div>{error?.message}</div>;
    }

    return (
        <Box sx={{ margin: "2rem" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    selected={selected}
                    setAddOpen={setAddOpen}
                    setDeleteOpen={setDeleteOpen}
                    setEditOpen={setEditOpen}
                    row={rows}
                />
                <TableContainer className="table-container">
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            className="table-header"
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.CityID);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) =>
                                            handleClick(event, row.CityID)
                                        }
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.CityID}
                                        selected={isItemSelected}
                                        sx={{ cursor: "pointer" }}
                                        className="table-row"
                                    >
                                        <TableCell
                                            className="table-cell col-id"
                                            padding="checkbox"
                                        >
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    "aria-labelledby": labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-name"
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            align="center"
                                        >
                                            {row.CityID}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-name"
                                            align="right"
                                        >
                                            {row.CityName}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-district"
                                            align="right"
                                        >
                                            {row.District}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-population"
                                            align="right"
                                        >
                                            {row.CityPopulation}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-country"
                                            align="right"
                                        >
                                            {row.CountryName}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-region"
                                            align="right"
                                        >
                                            {row.Region}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell-left col-actions"
                                            padding="none"
                                        >
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 20, 30]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default TableMain;
