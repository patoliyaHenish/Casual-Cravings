import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

const ViewSubCategoryDialog = ({ open, onClose, isLoading, data }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>Sub-Category Details</DialogTitle>
      <DialogContent dividers className="custom-scrollbar" style={{ maxHeight: 500 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress color="warning" />
          </Box>
        ) : !data ? (
          <Typography color="textSecondary" align="center">
            No data found.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography variant="body1">{data.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body1">{data.category_name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">{data.description}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Image
              </Typography>
              {data.image ? (
                <img
                  src={data.image}
                  alt={data.name}
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                />
              ) : (
                <Typography color="textSecondary">No Image</Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="warning" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSubCategoryDialog;