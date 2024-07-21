import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles'
import { TableRow, TableCell, Checkbox, IconButton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { visuallyHidden } from '@mui/utils';
import AddRecordModal from './AddRecordModal'
import EditRecordModal from './EditRecordModal'
import DeleteRecordDialog from './DeleteRecordDialog'

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'CityID',
    align: 'left',
    numeric: true,
    label: 'City ID',
  },
  {
    id: 'CityName',
    numeric: false,
    label: 'City Name',
  },
  {
    id: 'District',
    numeric: false,
    label: 'District',
  },
  {
    id: 'CityPopulation',
    numeric: true,
    label: 'Population',
  },
  {
    id: 'CountryName',
    numeric: false,
    label: 'Country',
  },
  {
    id: 'Region',
    numeric: false,
    label: 'Region'
  },
  {
    id: 'edit_col',
    align: 'left',
    numeric: false,
    label: 'Edit',
  }
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all cities',
            }}
          />
        </TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={'right'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {index === 6 ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, selected } = props;
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);

  useEffect(() => {
    if (selected.length > 0) {
      setIsDeleteDisabled(false);
    }
    else {
      setIsDeleteDisabled(true);
    }
  })

  const handleAddRecordModal = () => {
    setIsAddRecordModalOpen(true);
  };

  const handleAddRecordModalClose = () => {
    setIsAddRecordModalOpen(false);
  };

  const handleDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  } 

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Cities of the World
        </Typography>
      )}
      <Tooltip title="Add">
        <IconButton 
          sx={{ color: 'green' }}
          onClick={handleAddRecordModal}>
          <AddCircleOutlinedIcon/>
        </IconButton>
      </Tooltip>
      <AddRecordModal 
        open={isAddRecordModalOpen} 
        handleClose={handleAddRecordModalClose} />
      <Tooltip title="Delete">
        <span>
          <IconButton 
            sx={{ color: 'black' }}
            onClick={handleDeleteDialog}
            disabled={isDeleteDisabled}>
            <DeleteIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <DeleteRecordDialog 
        open={isDeleteDialogOpen} 
        handleClose={handleDeleteDialogClose} 
        selected={selected}/>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.any.isRequired
};

const TableMain = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('Population');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [error404Flag, set404] = useState(false);
  const [error500Flag, set500] = useState(false);
  const [otherErrorFlag, setOtherError] = useState(false);
  const [cityData, setCityData] = useState([]);
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);

  useEffect(() => {
    fetchData(`http://localhost:3000/api/cities`, setCityData);
  }, []);
  const rows = cityData;
  const fetchData = async (url, setData) => { //data_param is supposed to be the setter from a useState
    try {
      const response = await fetch(url);
      if (!response.ok) { // If the response status is not in the range 200-299 (success), throw an error
        const statusCode = response.status;
        if (statusCode === 404) {
          console.log(`ERROR: ${statusCode}`);
          set404(true);
        }
        else if (statusCode === 500) {
          set500(true);
        }
        else {
          setOtherError(true);
        }
      }
      const data = await response.json()
      setData(data);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  const handleEdit = (event) => {
    event.stopPropagation();
    setIsEditRecordModalOpen(true);
  }

  const handleEditClose = (event) => {
    setIsEditRecordModalOpen(false);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
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

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage, rows],
  );

  if (error404Flag) {
    return (
        <div>404 Error: Page not found</div>
    );
  }
  if (error500Flag) {
      return (
          <div>500 Error: Internal Server Error</div>
      );
  }
  if (otherErrorFlag) {
      return (
          <div>An error has occurred</div>
      )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          selected={selected}/>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.CityID);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.CityID)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.CityID}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      align="center"
                    >
                      {row.CityID}
                    </TableCell>
                    <TableCell align="right">{row.CityName}</TableCell>
                    <TableCell align="right">{row.District}</TableCell>
                    <TableCell align="right">{row.CityPopulation}</TableCell>
                    <TableCell align="right">{row.CountryName}</TableCell>
                    <TableCell align="right">{row.Region}</TableCell>
                    <TableCell align="right" padding="none">
                      <Tooltip title="Edit">
                      <IconButton onClick={handleEdit}>
                        <EditIcon/>
                        </IconButton>
                      </Tooltip>
                      <EditRecordModal 
                        open={isEditRecordModalOpen} 
                        handleClose={handleEditClose}
                        id={row.CityID} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
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
}

export default TableMain;