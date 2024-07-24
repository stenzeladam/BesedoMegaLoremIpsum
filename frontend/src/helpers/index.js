function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
export function stableSort(array, comparator) {
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

export const fetchData = async (url, setData, setError) => {
    //data_param is supposed to be the setter from a useState
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // If the response status is not in the range 200-299 (success), throw an error
            const statusCode = response.status;
            if (statusCode === 404) {
                setError({ status: 404, message: "404 Error: Page not found" });
            } else if (statusCode === 500) {
                setError({
                    status: 500,
                    message: "500 Error: Internal Server Error",
                });
            } else {
                setError({
                    status: statusCode,
                    message: "An error has occurred",
                });
            }
        }
        const data = await response.json();
        setData(data);
    } catch (error) {
        console.error("Error: ", error);
    }
};
