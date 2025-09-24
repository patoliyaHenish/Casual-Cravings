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
import { useTheme } from '../../context/ThemeContext';

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
  const { isDarkMode } = useTheme();
  return (
    <>
      <TableContainer
        component={Paper}
        className="shadow rounded mb-4 max-h-[500px] overflow-auto custom-scrollbar"
        sx={{ 
          maxHeight,
          backgroundColor: 'var(--card-bg)',
          border: `1px solid var(--border-color)`,
          transition: 'all 0.3s ease'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  className="!font-bold"
          sx={{
            position: 'sticky',
            top: 0,
            background: 'var(--btn-primary)',
            color: '#ffffff',
            zIndex: 2,
            transition: 'all 0.3s ease',
            fontWeight: 600,
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
                <TableCell 
                  colSpan={columns.length} 
                  align="center"
                  sx={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--card-bg)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CircularProgress color="warning" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  align="center" 
                  className="py-4"
                  sx={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--card-bg)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--bg-secondary)',
                    },
                    backgroundColor: 'var(--card-bg)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex}
                      sx={{
                        color: 'var(--text-primary)',
                        borderBottom: `1px solid var(--border-light)`,
                        transition: 'all 0.3s ease',
                        '& img': {
                          borderRadius: '4px',
                          border: `1px solid var(--border-color)`,
                          backgroundColor: 'var(--card-bg)',
                          padding: '2px'
                        },
                        '& .text-gray-400': {
                          color: 'var(--text-muted) !important'
                        }
                      }}
                    >
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
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4"
          style={{
            color: 'var(--text-primary)',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-primary)' }}>Show:</span>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 80,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: `1px solid var(--border-color)`,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--btn-primary)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--btn-primary)',
                  }
                },
                '& .MuiSelect-icon': {
                  color: 'var(--text-primary)'
                }
              }}
            >
              <Select
                value={limit}
                onChange={(e) => onLimitChange(e.target.value)}
                displayEmpty
                sx={{
                  color: 'var(--text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-color)',
                  }
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <span style={{ color: 'var(--text-primary)' }}>entries</span>
          </div>
          <div className="flex items-center gap-4 self-center justify-center sm:self-auto sm:justify-start">
            <Button
              variant="contained"
              color="warning"
              onClick={onPrevPage}
              disabled={pagination.page === 1}
              sx={{
                backgroundColor: 'var(--btn-primary)',
                '&:hover': {
                  backgroundColor: 'var(--btn-primary-hover)',
                },
                '&:disabled': {
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  opacity: 0.6
                },
                transition: 'all 0.3s ease'
              }}
            >
              Previous
            </Button>
            <span style={{ color: 'var(--text-primary)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="contained"
              color="warning"
              onClick={onNextPage}
              disabled={pagination.page === pagination.totalPages}
              sx={{
                backgroundColor: 'var(--btn-primary)',
                '&:hover': {
                  backgroundColor: 'var(--btn-primary-hover)',
                },
                '&:disabled': {
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  opacity: 0.6
                },
                transition: 'all 0.3s ease'
              }}
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