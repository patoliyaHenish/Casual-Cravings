import React, { useState, useEffect } from 'react';
import RecipeDialog from './AddRecipeDialog';
import ViewRecipeDialog from './ViewRecipeDialog';
import DeleteRecipeDialog from './DeleteRecipeDialog';
import {
  useGetAllRecipesForAdminQuery,
  useCreateRecipeByAdminMutation,
  useGetRecipeByIdForAdminQuery,
  useDeleteRecipeByAdminMutation,
  useUpdateRecipeByAdminMutation,
  useUpdateRecipeAdminApprovedStatusMutation,
  useUpdateRecipePublicApprovedStatusMutation
} from '../../../features/api/recipeApi';
import { Button, FormControl, Select, MenuItem } from '@mui/material';
import { toast } from 'sonner';
import {
  DataTable,
  PageHeader,
  SearchBar,
  ActionButtons,
  ConfirmDialog
} from '../../../components/common';

const Recipe = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1); 
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', prep_time: '', cook_time: '', serving_size: '', ingredients_id: [], recipe_instructions: [] });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', prep_time: '', cook_time: '', serving_size: '', ingredients_id: [], recipe_instructions: [] });

  const { data, isLoading } = useGetAllRecipesForAdminQuery({ search, page, limit });
  const [createRecipeByAdmin, { isLoading: isAdding }] = useCreateRecipeByAdminMutation();
  const [deleteRecipeByAdmin, { isLoading: isDeleting }] = useDeleteRecipeByAdminMutation();
  const [updateRecipeByAdmin, { isLoading: isUpdating }] = useUpdateRecipeByAdminMutation();
  const [updateRecipeAdminApprovedStatus] = useUpdateRecipeAdminApprovedStatusMutation();
  const [updateRecipePublicApprovedStatus] = useUpdateRecipePublicApprovedStatusMutation();
  const {
    data: viewRecipeResponse,
    error: viewRecipeError,
  } = useGetRecipeByIdForAdminQuery(viewId, { skip: !viewId });
  const { data: editRecipeData, isLoading: isEditLoading } = useGetRecipeByIdForAdminQuery(editId, { skip: !editId });

  const isAnyDialogOpen = addOpen || !!editId || !!viewId || !!deleteId;

  const recipes = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleAdminApprovedStatusChange = async (recipeId, newStatus) => {
    try {
      await updateRecipeAdminApprovedStatus({ id: recipeId, admin_approved_status: newStatus }).unwrap();
      toast.success('Admin approved status updated successfully');
    } catch (error) {
      console.error('Error updating admin approved status:', error);
      toast.error(error?.data?.message || 'Failed to update admin approved status');
    }
  };

  const handlePublicApprovedStatusChange = async (recipeId, newStatus) => {
    try {
      await updateRecipePublicApprovedStatus({ id: recipeId, public_approved: newStatus }).unwrap();
      toast.success('Public approved status updated successfully');
    } catch (error) {
      console.error('Error updating public approved status:', error);
      toast.error(error?.data?.message || 'Failed to update public approved status');
    }
  };

  useEffect(() => {
    if (viewId) {
      setIsViewLoading(true);
    }
    if (viewRecipeResponse && viewRecipeResponse.data) {
      setViewData(viewRecipeResponse.data);
      setIsViewLoading(false);
    } else if (viewRecipeError) {
      setViewData(null);
      setIsViewLoading(false);
    }
    if (!viewId) {
      setViewData(null);
      setIsViewLoading(false);
    }
  }, [viewId, viewRecipeResponse, viewRecipeError]);

  useEffect(() => {
    if (editId && editRecipeData && editRecipeData.data) {
      const r = editRecipeData.data;
      setEditForm({
        title: r.title || '',
        description: r.description || '',
        prep_time: r.prep_time || '',
        cook_time: r.cook_time || '',
        serving_size: r.serving_size || '',
        category_id: r.category_id || '',
        sub_category_id: r.sub_category_id || null,
        ingredients_id: r.ingredients_id || [],
        ingredient_unit: r.ingredient_unit || [],
        ingredient_quantity: r.ingredient_quantity || [],
        recipe_instructions: Array.isArray(r.recipe_instructions)
          ? r.recipe_instructions.map(i => typeof i === 'string' ? i : i.instruction_text || '')
          : [],
        video_url: r.video_url || '',
        image_url: r.image_url || '',
      });
    }
  }, [editId, editRecipeData]);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setAddForm({
      title: '',
      description: '',
      prep_time: '',
      cook_time: '',
      serving_size: '',
      category_id: '',
      sub_category_id: null,
      ingredients_id: [],
      recipe_instructions: [],
      video_url: '',
      image_url: '',
    });
  };

  const handleAddSubmit = async (values, { resetForm }, imageFile) => {
  try {
    const formData = new FormData();

    formData.append('ingredients_id', JSON.stringify(values.ingredients_id));
    formData.append('ingredient_unit', JSON.stringify(values.ingredient_unit));
    formData.append('ingredient_quantity', JSON.stringify(values.ingredient_quantity));
    formData.append('recipe_instructions', JSON.stringify(values.recipe_instructions));

    Object.entries(values).forEach(([key, value]) => {
      if (!['ingredients_id', 'ingredient_unit', 'ingredient_quantity', 'recipe_instructions'].includes(key)) {
        if (key === 'sub_category_id') {
          const numValue = Number(value);
          formData.append(key, isNaN(numValue) || numValue === 0 ? null : numValue);
        } else {
          formData.append(key, value);
        }
      }
    });

    if (imageFile) {
      formData.append('recipeImage', imageFile);
    }

    await createRecipeByAdmin(formData).unwrap();
    toast.success('Recipe added successfully');
    handleAddClose();
    resetForm();
  } catch (error) {
    console.error('Error adding recipe:', error);
    toast.error(error?.data?.message || 'Failed to add recipe');
  }
};

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteRecipeByAdmin(deleteId).unwrap();
      toast.success('Recipe deleted successfully');
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error(error?.data?.message || 'Failed to delete recipe');
    }
  };

  const handleEditSubmit = async (values, { resetForm }, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('ingredients_id', JSON.stringify(values.ingredients_id));
      formData.append('ingredient_unit', JSON.stringify(values.ingredient_unit));
      formData.append('ingredient_quantity', JSON.stringify(values.ingredient_quantity));
      formData.append('recipe_instructions', JSON.stringify(values.recipe_instructions));
      Object.entries(values).forEach(([key, value]) => {
        if (!['ingredients_id', 'ingredient_unit', 'ingredient_quantity', 'recipe_instructions'].includes(key)) {
          if (key === 'sub_category_id') {
            const numValue = Number(value);
            formData.append(key, isNaN(numValue) || numValue === 0 ? null : numValue);
          } else {
            formData.append(key, value);
          }
        }
      });
      if (imageFile) {
        formData.append('recipeImage', imageFile);
      }
      await updateRecipeByAdmin({ id: editId, formData }).unwrap();
      toast.success('Recipe updated successfully');
      setEditId(null);
      resetForm();
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error(error?.data?.message || 'Failed to update recipe');
    }
  };

  const columns = [
    { 
      header: '#', 
      field: 'id', 
      headerStyle: { width: 60 },
      render: (row, rowIndex) => ((page - 1) * limit + rowIndex + 1)
    },
    { 
      header: 'Image', 
      field: 'image_url', 
      render: (row) => (
        row.image_url ? (
          <img
            src={row.image_url}
            alt={row.title}
            style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : null
      )
    },
    { header: 'Title', field: 'title' },
    { header: 'Category', field: 'category_name' },
    { 
      header: 'Sub Category', 
      field: 'sub_category_name',
      render: (row) => (
        row.sub_category_name ? (
          row.sub_category_name
        ) : (
          <span className="text-red-500 font-bold flex justify-center items-center">Null</span>
        )
      )
    },
    { 
      header: 'Added By User', 
      field: 'added_by_user',
      render: (row) => row.added_by_user ? 'Yes' : 'No'
    },
    { 
      header: 'Added By Admin', 
      field: 'added_by_admin',
      render: (row) => row.added_by_admin ? 'Yes' : 'No'
    },
    {
      header: 'Admin Approved',
      field: 'admin_approved_status',
      render: (row) => (
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <Select
            value={row.admin_approved_status?.toLowerCase() || 'pending'}
            onChange={(e) => handleAdminApprovedStatusChange(row.recipe_id, e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                color: row.admin_approved_status?.toLowerCase() === 'approved' ? 'green' : 
                       row.admin_approved_status?.toLowerCase() === 'rejected' ? 'red' : 'orange',
                fontWeight: 'bold'
              }
            }}
          >
            <MenuItem value="pending" sx={{ color: 'orange', fontWeight: 'bold' }}>Pending</MenuItem>
            <MenuItem value="approved" sx={{ color: 'green', fontWeight: 'bold' }}>Approved</MenuItem>
            <MenuItem value="rejected" sx={{ color: 'red', fontWeight: 'bold' }}>Rejected</MenuItem>
          </Select>
        </FormControl>
      )
    },
    {
      header: 'Public Approved',
      field: 'public_approved',
      render: (row) => {
        // Only show public approval option if admin has approved
        if (row.admin_approved_status?.toLowerCase() !== 'approved') {
          return (
            <span className="text-gray-400 italic text-sm">
              Admin approval required
            </span>
          );
        }
        
        return (
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.public_approved ? 'approved' : 'rejected'}
              onChange={(e) => handlePublicApprovedStatusChange(row.recipe_id, e.target.value === 'approved')}
              sx={{
                '& .MuiSelect-select': {
                  color: row.public_approved ? 'green' : 'red',
                  fontWeight: 'bold'
                }
              }}
            >
              <MenuItem value="approved" sx={{ color: 'green', fontWeight: 'bold' }}>Approved</MenuItem>
              <MenuItem value="rejected" sx={{ color: 'red', fontWeight: 'bold' }}>Rejected</MenuItem>
            </Select>
          </FormControl>
        );
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => setViewId(row.recipe_id)}
          onEdit={() => setEditId(row.recipe_id)}
          onDelete={() => setDeleteId(row.recipe_id)}
        />
      )
    }
  ];

  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <PageHeader title="Manage Recipes">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search recipes..."
          label="Search recipes"
        />
        <Button
          variant="contained"
          color="warning"
          onClick={handleAddOpen}
          className="w-full sm:w-auto"
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          Add Recipe
        </Button>
      </PageHeader>
            <DataTable
        data={recipes}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        limit={limit}
        onLimitChange={handleLimitChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        emptyMessage="No recipes found."
      />

      <RecipeDialog
        open={addOpen}
        onClose={handleAddClose}
        form={addForm}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
        mode="add"
      />

      {editId && (
        <RecipeDialog
          open={!!editId}
          onClose={() => setEditId(null)}
          form={editForm}
          onSubmit={handleEditSubmit}
          isLoading={isUpdating || isEditLoading}
          mode="edit"
        />
      )}

      <ViewRecipeDialog
        open={!!viewId}
        onClose={() => setViewId(null)}
        isLoading={isViewLoading}
        data={viewData}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        loadingText="Deleting..."
        severity="error"
      />
    </div>
  );
};

export default Recipe;