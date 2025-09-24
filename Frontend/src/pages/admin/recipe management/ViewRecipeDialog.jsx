import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { getYouTubeThumbnail, getYouTubeVideoTitle } from '../../../utils/helper';
import { formatFraction } from '../../../components/IngredientInput';

const ViewRecipeDialog = ({ open, onClose, isLoading, data }) => {
  const [videoTitle, setVideoTitle] = useState(null);

  useEffect(() => {
    const fetchVideoTitle = async () => {
      if (data?.video_url) {
        const title = await getYouTubeVideoTitle(data.video_url);
        setVideoTitle(title);
      }
    };
    fetchVideoTitle();
  }, [data?.video_url]);

  const parseKeywords = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    try {
      return JSON.parse(keywords);
    } catch {
      return [];
    }
  };

  const keywords = parseKeywords(data?.keywords);

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
            {data.image && (
              <img
                src={data.image}
                alt={data.title}
                className="w-45 h-30 object-cover rounded-lg mb-3"
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
              <strong>Keywords:</strong>
              {keywords && keywords.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      color="primary"
                      variant="outlined"
                      className="text-xs"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 ml-2">No keywords available</span>
              )}
            </div>
            
            <div>
              <strong>Video URL:</strong>{' '}
              <a
                href={data.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {data.video_url}
              </a>
            </div>
            {data.video_url && (
              <div className="flex items-center gap-4 mt-2">
                <img
                  src={getYouTubeThumbnail(data.video_url)}
                  alt="YouTube Thumbnail"
                  className="w-45 h-30 object-cover rounded-lg"
                />
                {videoTitle && <div><strong>Video Title:</strong> {videoTitle}</div>}
              </div>
            )}
            <div>
              <strong>Ingredients details:</strong>
              {data.ingredients && data.ingredients.length > 0 ? (
                <TableContainer component={Paper} className="mt-2">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Ingredient</strong></TableCell>
                        <TableCell><strong>Quantity</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.ingredients.map((ingredient, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{ingredient.ingredient_name}</TableCell>
                          <TableCell>{formatFraction(ingredient.quantity)}</TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="mt-2 text-gray-600">No ingredients found</div>
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
            
            <div><strong>Created At:</strong> {data.created_at && new Date(data.created_at).toLocaleDateString()}</div>
            
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