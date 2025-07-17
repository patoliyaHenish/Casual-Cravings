import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';

const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  pagination = { page: 1, totalPages: 1 },
  limit = 10,
  onLimitChange,
  onPrevPage,
  onNextPage,
  emptyMessage = "No data found.",
  maxHeight = 500,
}) => {
  return (
    <>
      <TableContainer
        component={Paper}
        className="shadow rounded mb-4 max-h-[500px] overflow-auto custom-scrollbar"
        sx={{ maxHeight }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow className="bg-orange-100">
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  className="!font-bold"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    background: '#FFEDD5',
                    zIndex: 2,
                    ...column.headerStyle
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress color="warning" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="py-4 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-orange-50">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render ? column.render(row, rowIndex) : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(onLimitChange && onPrevPage && onNextPage) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={limit}
                onChange={(e) => onLimitChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-4 self-center justify-center sm:self-auto sm:justify-start">
            <Button
              variant="contained"
              color="warning"
              onClick={onPrevPage}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="contained"
              color="warning"
              onClick={onNextPage}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable; 