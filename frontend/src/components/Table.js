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

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("Population");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [error, setError] = useState({});
    const [cityData, setCityData] = useState([]);
    const [isAddOpen, setAddOpen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

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

            setInitialLoad(false);
        }
    }, [location.search, initialLoad]);

    // Consolidate URL parameter updates
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

        navigate(`?${queryParams.toString()}`, { replace: true });
    }, [selected, isAddOpen, isEditOpen, isDeleteOpen, order, orderBy, navigate, location.search]);

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
            const newSelected = visibleRows.map((n) => n.CityID);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

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
                            rowCount={visibleRows.length} // Change this to the count of visible rows
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
