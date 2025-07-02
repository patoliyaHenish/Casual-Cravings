import React, { useState, useEffect } from 'react';
import AddIngredientDialog from './AddIngredientDialog';
import EditIngredientDialog from './EditIngredientDialog';
import ViewIngredientDialog from './ViewIngredientDialog';
import DeleteIngredientDialog from './DeleteIngredientDialog';
import {
  useGetAllIngredientsQuery,
  useAddNewIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useGetIngredientByIdMutation,
} from '../../../features/api/ingredientApi';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, CircularProgress, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'sonner';

const Ingredient = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', uses: '', substitutes: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', uses: '', substitutes: '' });

  const { data, isLoading } = useGetAllIngredientsQuery({ search, page, limit });
  const [addNewIngredient, { isLoading: isAdding }] = useAddNewIngredientMutation();
  const [updateIngredient, { isLoading: isUpdating }] = useUpdateIngredientMutation();
  const [deleteIngredient, { isLoading: isDeleting }] = useDeleteIngredientMutation();
  const [getIngredientById] = useGetIngredientByIdMutation();

  const ingredients = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  // Handlers
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage(page + 1);
  };

  // Add Ingredient
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setAddForm({ name: '', description: '', uses: '', substitutes: '' });
  };
  const handleAddFormChange = (e) => {
    setAddForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleAddSubmit = async (values, { resetForm }) => {
  try {
    await addNewIngredient(values).unwrap();
    toast.success('Ingredient added successfully');
    handleAddClose();
    resetForm();
  } catch (error) {
    toast.error(error?.data?.message || 'Failed to add ingredient');
  }
};

  const handleEditOpen = (id) => setEditId(id);
  const handleEditClose = () => {
    setEditId(null);
    setEditForm({ name: '', description: '', uses: '', substitutes: '' });
  };
  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleEditSubmit = async (values, { resetForm }) => {
  try {
    await updateIngredient({ ingredientId: editId, ...values }).unwrap();
    toast.success('Ingredient updated successfully');
    handleEditClose();
    resetForm();
  } catch (error) {
    toast.error(error?.data?.message || 'Failed to update ingredient');
  }
};

  const handleViewOpen = async (id) => {
    setViewId(id);
    setIsViewLoading(true);
    try {
      const result = await getIngredientById({ ingredientId: id }).unwrap();
      setViewData(result.data);
    } catch {
      setViewData(null);
    }
    setIsViewLoading(false);
  };
  const handleViewClose = () => {
    setViewId(null);
    setViewData(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteIngredient({ ingredientId: deleteId }).unwrap();
        setDeleteId(null);
        toast.success('Ingredient deleted successfully');
      } catch (error) {
        setDeleteId(null);
        toast.error(error?.data?.message || 'Failed to delete ingredient');
      }
    }
  };

  useEffect(() => {
    const fetchEditData = async () => {
      if (editId) {
        try {
          const result = await getIngredientById({ ingredientId: editId }).unwrap();
          const ing = result.data;
          setEditForm({
            name: ing.name || '',
            description: ing.description || '',
            uses: ing.uses || '',
            substitutes: ing.substitutes || '',
          });
        } catch {
          setEditForm({ name: '', description: '', uses: '', substitutes: '' });
          toast.error('Failed to load ingredient');
        }
      }
    };
    fetchEditData();
  }, [editId]);

  return (
    <div className="p-6 mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <h2 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
          Manage Ingredients
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <TextField
            label="Search ingredients"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            className="bg-white rounded w-full sm:w-auto"
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          />
          <Button
            variant="contained"
            color="warning"
            onClick={handleAddOpen}
            className="w-full sm:w-auto"
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            Add Ingredient
          </Button>
        </div>
      </div>
      <TableContainer
        component={Paper}
        className="shadow rounded mb-4 max-h-[500px] overflow-auto custom-scrollbar"
      >
        <Table>
          <TableHead stickyHeader>
            <TableRow className="bg-orange-100">
              <TableCell className="!font-bold">#</TableCell>
              <TableCell className="!font-bold">Name</TableCell>
              <TableCell className="!font-bold">Description</TableCell>
              <TableCell className="!font-bold">Uses</TableCell>
              <TableCell className="!font-bold">Substitutes</TableCell>
              <TableCell className="!font-bold">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress color="warning" />
                </TableCell>
              </TableRow>
            ) : ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-4 text-gray-500">
                  No ingredients found.
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ing, idx) => (
                <TableRow key={ing.ingredient_id || idx} className="hover:bg-orange-50">
                  <TableCell>{(pagination.page - 1) * limit + idx + 1}</TableCell>
                  <TableCell>{ing.name}</TableCell>
                  <TableCell>{ing.description}</TableCell>
                  <TableCell>{ing.uses}</TableCell>
                  <TableCell>{ing.substitutes}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <IconButton
                        color="warning"
                        onClick={() => handleViewOpen(ing.ingredient_id)}
                        aria-label="View"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditOpen(ing.ingredient_id)}
                        aria-label="Edit"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteId(ing.ingredient_id)}
                        aria-label="Delete"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="contained"
          color="warning"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="contained"
          color="warning"
          onClick={handleNextPage}
          disabled={page === pagination.totalPages}
        >
          Next
        </Button>
      </div>

      <AddIngredientDialog
        open={addOpen}
        onClose={handleAddClose}
        form={addForm}
        onFormChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
      />

      <EditIngredientDialog
        open={!!editId}
        onClose={handleEditClose}
        form={editForm}
        onFormChange={handleEditFormChange}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
      />

      <ViewIngredientDialog
        open={!!viewId}
        onClose={handleViewClose}
        isLoading={isViewLoading}
        data={viewData}
      />

      <DeleteIngredientDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Ingredient;