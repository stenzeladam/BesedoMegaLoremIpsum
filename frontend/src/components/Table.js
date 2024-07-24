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

import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableToolbar from "./EnhancedTableToolbar";
import { fetchData, getComparator, stableSort } from "../helpers";

import "./TableStyles.css";

const TableMain = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState("asc"); // State for sorting order
    const [orderBy, setOrderBy] = useState("Population"); // State for sorting column
    const [selected, setSelected] = useState([]); // State for selected rows
    const [page, setPage] = useState(0); // State for current pagination page
    const [rowsPerPage, setRowsPerPage] = useState(10); // State for rows per page
    const [error, setError] = useState({}); // State for error handling
    const [cityData, setCityData] = useState([]); // State for storing city data
    const [isAddOpen, setAddOpen] = useState(false); // State for add modal
    const [initialLoad, setInitialLoad] = useState(true); // State for initial load flag
    const [isEditOpen, setEditOpen] = useState(false); // State for edit modal
    const [isDeleteOpen, setDeleteOpen] = useState(false); // State for delete modal

    const rows = cityData;

    const visibleRows = useMemo(
        () =>
            stableSort(rows, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [order, orderBy, page, rowsPerPage, rows]
    );

    // Initial API call to display the database in the table
    useEffect(() => {
        fetchData(`http://localhost:3000/api/cities`, setCityData, setError);
    }, []);

    // Handle initial load and URL state for selected rows
    useEffect(() => {
        if (initialLoad) {
            const queryParams = new URLSearchParams(location.search);
            const selectedParam = queryParams.get("selected");
            const addParam = queryParams.get("add");
            const editParam = queryParams.get("edit");
            const deleteParam = queryParams.get("delete");
            const orderParam = queryParams.get("order");
            const orderByParam = queryParams.get("orderBy");
            const pageParam = queryParams.get("page");
            const rowsPerPageParam = queryParams.get("rowsPerPage");

            if (selectedParam) {
                const ids = selectedParam.split("_").map((id) => parseInt(id, 10));
                setSelected(ids);
            }

            setAddOpen(addParam === "true");
            setEditOpen(editParam === "true");
            setDeleteOpen(deleteParam === "true");

            if (orderParam) {
                setOrder(orderParam);
            }
            if (orderByParam) {
                setOrderBy(orderByParam);
            }
            if (pageParam) {
                setPage(parseInt(pageParam, 10));
            }
            if (rowsPerPageParam) {
                setRowsPerPage(parseInt(rowsPerPageParam, 10));
            }

            setInitialLoad(false);
        }
    }, [location.search, initialLoad]);

    // Ensures the page state is within the valid range
    useEffect(() => {
        if (page >= Math.ceil(rows.length / rowsPerPage)) {
            setPage(0);
        }
    }, [rows, page, rowsPerPage]);

    // URL parameter updates
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        if (selected.length > 0) {
            queryParams.set("selected", selected.join("_"));
        } else {
            queryParams.delete("selected");
        }

        if (isAddOpen) {
            queryParams.set("add", "true");
        } else {
            queryParams.delete("add");
        }

        if (isEditOpen) {
            queryParams.set("edit", "true");
        } else {
            queryParams.delete("edit");
        }

        if (isDeleteOpen) {
            queryParams.set("delete", "true");
        } else {
            queryParams.delete("delete");
        }

        queryParams.set("order", order);
        queryParams.set("orderBy", orderBy);
        queryParams.set("page", page);
        queryParams.set("rowsPerPage", rowsPerPage);

        navigate(`?${queryParams.toString()}`, { replace: true });
    }, [selected, isAddOpen, isEditOpen, isDeleteOpen, order, orderBy, page, rowsPerPage, navigate, location.search]);

    // Handle page change for pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle sorting request
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    // Handle select all rows
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = visibleRows.map((n) => n.CityID);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    // Handle row selection
    const handleClick = (event, id, updateURL = true) => {
        const selectedIndex = selected.indexOf(id);
        const newSelected = [...selected];

        if (selectedIndex === -1) {
            newSelected.push(id);
        } else {
            newSelected.splice(selectedIndex, 1);
        }

        setSelected(newSelected);

        if (updateURL) {
            const queryParams = new URLSearchParams(location.search);
            if (newSelected.length > 0) {
                queryParams.set("selected", newSelected.join("_"));
            } else {
                queryParams.delete("selected");
            }
            navigate(`?${queryParams.toString()}`, { replace: true });
        }
    };

    // Handle change in rows per page for pagination
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Check if a row is selected
    const isSelected = (id) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    // Display error message if there is any
    if (error?.status) {
        return <div>{error?.message}</div>;
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%" }}>
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
                        sx={{ minWidth: 750, tableLayout: "fixed" }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={visibleRows.length}
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
                                            align="left"
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
                                            className="table-cell col-id"
                                            component="th"
                                            id={labelId}
                                        >
                                            {row.CityID}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-name"
                                        >
                                            {row.CityName}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-district"
                                        >
                                            {row.District}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-population"
                                        >
                                            {row.CityPopulation}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-country"
                                        >
                                            {row.CountryName}
                                        </TableCell>
                                        <TableCell
                                            className="table-cell col-region"
                                        >
                                            {row.Region}
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
