import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getYouTubeThumbnail, getYouTubeVideoTitle } from '../../../utils/helper';
import { useGetIngredientByIdMutation } from '../../../features/api/ingredientApi';

const ViewRecipeDialog = ({ open, onClose, isLoading, data }) => {
  const [videoTitle, setVideoTitle] = useState(null);
  const [ingredientDetails, setIngredientDetails] = useState([]);
  const [getIngredientById] = useGetIngredientByIdMutation();

  useEffect(() => {
    const fetchVideoTitle = async () => {
      if (data?.video_url) {
        const title = await getYouTubeVideoTitle(data.video_url);
        setVideoTitle(title);
      }
    };
    fetchVideoTitle();
  }, [data?.video_url]);

  useEffect(() => {
    const fetchIngredientDetails = async () => {
      if (data?.ingredients_id?.length > 0 && data?.ingredient_unit?.length > 0 && data?.ingredient_quantity?.length > 0) {
        try {
          const promises = data.ingredients_id.map((id) =>
            getIngredientById({ ingredientId: id }).unwrap()
          );
          const results = await Promise.all(promises);
          
          const details = results.map((res, index) => ({
            name: res.data.name,
            unit: data.ingredient_unit[index] || '',
            quantity: data.ingredient_quantity[index] || ''
          }));
          
          setIngredientDetails(details);
        } catch (error) {
          console.error('Failed to fetch ingredient details:', error);
          setIngredientDetails([]);
        }
      } else {
        setIngredientDetails([]);
      }
    };
    fetchIngredientDetails();
  }, [data?.ingredients_id, data?.ingredient_unit, data?.ingredient_quantity, getIngredientById]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Recipe Details</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress color="warning" />
          </div>
        ) : !data ? (
          <div className="text-gray-500 text-center">No data found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.image_url && (
              <img
                src={data.image_url}
                alt={data.title}
                style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              />
            )}
            <div><strong>Title:</strong> {data.title}</div>
            <div><strong>Description:</strong> {data.description}</div>
            <div><strong>Prep Time:</strong> {data.prep_time} min</div>
            <div><strong>Cook Time:</strong> {data.cook_time} min</div>
            <div><strong>Serving Size:</strong> {data.serving_size}</div>
            <div><strong>Category:</strong> {data.category_name}</div>
            {data.sub_category_name && (
              <div><strong>Sub Category:</strong> {data.sub_category_name}</div>
            )}
            <div>
              <strong>Video URL:</strong>{' '}
              <a
                href={data.video_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1a73e8', textDecoration: 'underline' }}
              >
                {data.video_url}
              </a>
            </div>
            {data.video_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <img
                  src={getYouTubeThumbnail(data.video_url)}
                  alt="YouTube Thumbnail"
                  style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 8 }}
                />
                {videoTitle && <div><strong>Video Title:</strong> {videoTitle}</div>}
              </div>
            )}
            <div><strong>Created At:</strong> {data.created_at && new Date(data.created_at).toLocaleDateString()}</div>
            
            <div>
              <strong>Ingredients details:</strong>
              {ingredientDetails.length > 0 ? (
                <TableContainer component={Paper} style={{ marginTop: 8 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Ingredient</strong></TableCell>
                        <TableCell><strong>Quantity</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ingredientDetails.map((ingredient, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{ingredient.name}</TableCell>
                          <TableCell>{ingredient.quantity}</TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div style={{ marginTop: 8, color: '#666' }}>No ingredients found</div>
              )}
            </div>
            
            <div>
              <strong>Recipe Instructions:</strong>
              <ol>
                {(data.recipe_instructions || []).map((instr, idx) => (
                  <li key={instr.instruction_id || idx}>
                    <strong className='text-gray-500 text-sm'>Step {idx + 1}:</strong> {instr.instruction_text || instr}
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <strong className="text-gray-700">Approval Information:</strong>
              <div className="mt-2 space-y-1">
                <div><strong>Added By User:</strong> {data.added_by_user ? 'Yes' : 'No'}</div>
                <div><strong>Added By Admin:</strong> {data.added_by_admin ? 'Yes' : 'No'}</div>
                <div><strong>Admin Approved Status:</strong> {data.admin_approved_status}</div>
                <div>
                  <strong>Public Approved:</strong>{' '}
                  {data.admin_approved_status?.toLowerCase() === 'approved' 
                    ? (data.public_approved ? 'Yes' : 'No')
                    : <span className="text-gray-400 italic text-sm">Admin approval required</span>
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="warning" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRecipeDialog;