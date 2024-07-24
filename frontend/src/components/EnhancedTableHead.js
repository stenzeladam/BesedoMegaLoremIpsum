import {
    Box,
    Checkbox,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
} from "@mui/material";
import PropTypes from "prop-types";
import { visuallyHidden } from "@mui/utils";

const headCells = [
    {
        id: "CityID",
        align: "left",
        numeric: true,
        label: "City ID",
    },
    {
        id: "CityName",
        numeric: false,
        label: "City Name",
    },
    {
        id: "District",
        numeric: false,
        label: "District",
    },
    {
        id: "CityPopulation",
        numeric: true,
        label: "Population",
    },
    {
        id: "CountryName",
        numeric: false,
        label: "Country",
    },
    {
        id: "Region",
        numeric: false,
        label: "Region",
    },
    // {
    //   id: 'edit_col',
    //   align: 'right',
    //   numeric: false,
    //   label: 'Edit',
    // }
];

function EnhancedTableHead(props) {
    const {
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort,
    } = props;

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={
                            numSelected > 0 && numSelected < rowCount
                        }
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            "aria-label": "select all cities",
                        }}
                    />
                </TableCell>
                {headCells.map((headCell, index) => (
                    <TableCell
                        key={headCell.id}
                        align={"right"}
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        {index === 6 ? (
                            headCell.label
                        ) : (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={
                                    orderBy === headCell.id ? order : "asc"
                                }
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === "desc"
                                            ? "sorted descending"
                                            : "sorted ascending"}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(["asc", "desc"]).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

export default EnhancedTableHead;
