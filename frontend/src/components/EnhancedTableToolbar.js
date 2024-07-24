import PropTypes from "prop-types";
import { Toolbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import AddRecordModal from "./AddRecordModal";
import DeleteRecordDialog from "./DeleteRecordDialog";
import EditRowModal from "./EditRecordModal";

function EnhancedTableToolbar(props) {
    const { numSelected, selected, setAddOpen, setDeleteOpen, setEditOpen, row } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action.activatedOpacity
                        ),
                }),
                border: "2px solid",
                borderColor: (theme) => theme.palette.divider,
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                    align="center"
                >
                    Cities of the World
                </Typography>
            )}
            <AddRecordModal setAddOpen={setAddOpen} />
            <EditRowModal
                selected={selected}
                row={row}
                setEditOpen={setEditOpen}
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
    setDeleteOpen: PropTypes.any.isRequired,
    setEditOpen: PropTypes.any.isRequired,
    row: PropTypes.any.isRequired
};

export default EnhancedTableToolbar;
