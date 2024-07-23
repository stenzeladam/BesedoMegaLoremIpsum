import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles'
import { TableRow, TableCell, Checkbox } from '@mui/material';
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
import { visuallyHidden } from '@mui/utils';
import AddRecordModal from './AddRecordModal'
import EditRecordModal from './EditRecordModal'
import DeleteRecordDialog from './DeleteRecordDialog'
import './TableStyles.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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
  // {
  //   id: 'edit_col',
  //   align: 'right',
  //   numeric: false,
  //   label: 'Edit',
  // }
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
  const { numSelected, selected, setAddOpen, setDeleteOpen } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
        border: '2px solid', 
        borderColor: (theme) => theme.palette.divider
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
          align='center'
        >
          Cities of the World
        </Typography>
      )}
      <AddRecordModal
        setAddOpen={setAddOpen}
      />
      <DeleteRecordDialog 
        selected={selected}
        setDeleteOpen={setDeleteOpen}
      />
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.any.isRequired,
  setAddOpen: PropTypes.any.isRequired,
  setDeleteOpen: PropTypes.any.isRequired
};

const TableMain = () => {
  
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('Population');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error404Flag, set404] = useState(false);
  const [error500Flag, set500] = useState(false);
  const [otherErrorFlag, setOtherError] = useState(false);
  const [cityData, setCityData] = useState([]);
  const [isAddOpen, setAddOpen] = useState(); 
  const [initialLoad, setInitialLoad] = useState(true); 
  const [isEditOpen, setEditOpen] = useState();
  const [isDeleteOpen, setDeleteOpen] = useState();

  // URL state management for adding an entry
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search); 
    if (isAddOpen === undefined) {
      // Do nothing if isAddOpen is undefined. This prevents the value from automatically defaulting to false
      return;
    }
    if (isAddOpen) {
      queryParams.set('add', 'true'); // Add the parameter if isAddOpen is true
    } else {
      queryParams.delete('add'); // Remove the parameter if isAddOpen is false
    }
    navigate(`?${queryParams.toString()}`, { replace: true });
  }, [isAddOpen, navigate]);

  // *** this NEEDS to be here, because the useEffect after it relies on rows being initialized or else it crashes
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
  // *** end of code section that NEEDS to be here

  //initial api call to display the database in the table
  useEffect(() => {
    fetchData(`http://localhost:3000/api/cities`, setCityData);
  }, []);

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

  const validIds = rows.map(row => row.id);

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

  useEffect(() => {
    if (initialLoad) {
      const queryParams = new URLSearchParams(location.search);
      const selectedParam = queryParams.get("selected");

      if (selectedParam) {
        const ids = selectedParam.split("_").map(id => parseInt(id, 10));
        const validIds = ids.filter(id => rows.some(row => row.id === id));
        setSelected(prevSelected => {
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // URL state management for editing modal
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search); 
    if (isEditOpen === undefined) {
      return;
    }
    if (isEditOpen) {
      queryParams.set('edit', 'true'); // Add the parameter if isEditOpen is true
    } else {
      queryParams.delete('edit'); // Remove the parameter if isEditOpen is false
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
      queryParams.set('delete', 'true'); // Add the parameter if isDeleteOpen is true
    } else {
      queryParams.delete('delete'); // Remove the parameter if IsDeleteOpen is false
    }
    navigate(`?${queryParams.toString()}`, { replace: true });
  }, [isDeleteOpen, location.search, navigate])

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
    <Box sx={{ margin: '2rem' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          selected={selected}
          setAddOpen={setAddOpen}
          setDeleteOpen={setDeleteOpen}
        />
        <TableContainer className="table-container">
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
              className="table-header"
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
                    className="table-row"
                  >
                    <TableCell className="table-cell col-id" padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell className="table-cell col-name" component="th" id={labelId} scope="row" align="center">
                      {row.CityID}
                    </TableCell>
                    <TableCell className="table-cell col-name" align="right">
                      {row.CityName}
                    </TableCell>
                    <TableCell className="table-cell col-district" align="right">
                      {row.District}
                    </TableCell>
                    <TableCell className="table-cell col-population" align="right">
                      {row.CityPopulation}
                    </TableCell>
                    <TableCell className="table-cell col-country" align="right">
                      {row.CountryName}
                    </TableCell>
                    <TableCell className="table-cell col-region" align="right">
                      {row.Region}
                    </TableCell>
                    <TableCell className="table-cell-left col-actions" padding='none'>
                      <EditRecordModal
                        align="center"
                        row={row}
                        setEditOpen={setEditOpen}
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
                  <TableCell/>
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