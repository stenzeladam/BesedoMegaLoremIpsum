import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles'
import { TableRow, TableCell, Checkbox, selectClasses, Skeleton } from '@mui/material';
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
  const { numSelected, selected, setAddOpen } = props;

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
      />
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.any.isRequired,
  setAddOpen: PropTypes.any.isRequired
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

  // URL state management for adding an entry
  useEffect(() => {
    const queryParams = new URLSearchParams(); 
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

  // URL state management for selecting entries example: http://localhost:3001/?selected=_2_
   useEffect(() => { //this one sets selected based on the URL
    const queryParams = new URLSearchParams(location.search); 
    let URLnum = [];
    const state = queryParams.get('selected');
    if (state != null && state.includes('_')) {
      URLnum = state.split('_')
                    .filter(substring => substring !== "")
                    .map(substring => parseInt(substring, 10));
    }
    console.log(URLnum)
  //   // now need to check every index of URLnum for if there is a row with a corresponding cityID
  //   // if there is a cityID equal to an index of arr, select the row with that cityID
  //   // if not, ignore that index and don't add it to selected
  //  *** CHECK URL if all of the numbers are already selected. 
  //   If yes, then do nothing. Only setSelect the numbers not already selected
  
    for (let index = 0; index < URLnum.length; index++) {
      for (let j = 0; j < rows.length; j++) {
        if (rows[j]) { //make sure rows[j] is defined to avoid runtime error
          if (URLnum[index] === rows[j].CityID) { 
            console.log("HERE")
            if(!selected.includes(URLnum[index])) {
              console.log("ADD", selected)
              setSelected(prevSelected => [...prevSelected, URLnum[index]]);
            }
            //setSelected(prevSelected => [...prevSelected, parseInt(arr[index], 10)]);
          }
        }
      }
    }
   }, [location.search], rows);

  //  useEffect(() => { //This one updates the URL whenever selected changes
  //    let URLnums = [];
  //    let numsToAddToURL = "";
  //    let numsToReplaceURL = ""
  //    const queryParams = new URLSearchParams(location.search); 
     
  //     const currentURL = queryParams.get('selected'); //get the URL, and check to see what IDs are selected. 
  //     // If all of the IDs in the URL are already in selected, do nothing, as there is no reason to update the URL
  //     if (currentURL && currentURL.includes('_')) {
  //       URLnums = currentURL.split('_')
  //                .filter(substring => substring !== "")
  //                .map(substring => parseInt(substring, 10));
  //     }
  //     else if (currentURL == null) {
  //       URLnums = [];
  //     }
  //     if (URLnums.length < selected.length) { //means something was added to selected, and the URL needs this number added
  //       for (let i = 0; i < selected.length; i++) {
  //         if (!URLnums.includes(selected[i])) {
  //           numsToAddToURL += String(selected[i]) + "_"; 
  //         }
  //       }
  //       if (currentURL) {
  //         queryParams.set('selected', currentURL + numsToAddToURL);
  //       }
  //       else {
  //         queryParams.set('selected', numsToAddToURL);
  //       }
  //        // add numsToAddToURL to the existing URL for 'selected'
  //       navigate(`?${queryParams.toString()}`, { replace: true });
  //     }
  //     else if (URLnums.length > selected.length) { //something was removed from selected, and the URL needs this number removed
  //       for (let i = 0; i < URLnums.length; i++) {
  //         if (selected.includes(URLnums[i])) {
  //           numsToReplaceURL += String(URLnums[i]) + "_"; //this will exclude any nums not selected, thus removing them when this replaces the URL
  //         }
  //       }
  //       if (numsToReplaceURL === "") { //nothing is selected
  //         queryParams.delete('selected');
  //       }
  //       else {
  //         queryParams.set('selected', numsToReplaceURL); // replace the URL for 'selected' with numsToReplaceURL
  //       }
  //       navigate(`?${queryParams.toString()}`, { replace: true });
  //     }
  //     else if (URLnums === selected.length) {
  //       //do nothing
  //       return;
  //     }
     
  
  //  }, [ navigate, selected ]);

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
    <Box sx={{ margin: '2rem' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          selected={selected}
          setAddOpen={setAddOpen}
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