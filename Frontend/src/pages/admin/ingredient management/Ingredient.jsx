import React, { useState } from 'react';
import { useGetAllIngredientsQuery, useAddNewIngredientMutation, useUpdateIngredientMutation, useDeleteIngredientMutation, useGetIngredientByIdMutation } from '../../../features/api/ingredientApi';
import { Button } from '@mui/material';
import { toast } from 'sonner';
import ViewIngredientDialog from './ViewIngredientDialog';
import EditIngredientDialog from './EditIngredientDialog';
import AddIngredientDialog from './AddIngredientDialog';
import {
  DataTable,
  PageHeader,
  SearchBar,
  ActionButtons,
  ConfirmDialog
} from '../../../components/common';

const Ingredient = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isError } = useGetAllIngredientsQuery({ search, page, limit });

  const [addNewIngredient, { isLoading: isCreating }] = useAddNewIngredientMutation();
  const [updateIngredient, { isLoading: isUpdating }] = useUpdateIngredientMutation();
  const [deleteIngredient, { isLoading: isDeleting }] = useDeleteIngredientMutation();
  const [getIngredientById, { data: viewIngredientData, isLoading: isViewLoading }] = useGetIngredientByIdMutation();
  const [getEditIngredientById, { data: editIngredientData, isLoading: isEditLoading }] = useGetIngredientByIdMutation();

  const ingredients = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const isAnyDialogOpen = !!(deleteId || editId || viewId || addOpen);

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

  const handleEditOpen = async (id) => {
    setEditId(id);
    await getEditIngredientById({ ingredientId: id });
  };
  const handleEditClose = () => setEditId(null);

  const handleViewOpen = async (id) => {
    setViewId(id);
    await getIngredientById({ ingredientId: id });
  };
  const handleViewClose = () => setViewId(null);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  const handleAddSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    if (values.image) {
      formData.append('ingredientProfileImage', values.image);
    }
    try {
      await addNewIngredient(formData).unwrap();
      toast.success('Ingredient added successfully');
      setAddOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add ingredient');
    }
  };

  const handleEditSubmit = async (values) => {
    const formData = new FormData();
    formData.append('ingredientId', editId);  
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('uses', values.uses);
    formData.append('substitutes', values.substitutes);
    if (values.image) {
      formData.append('ingredientProfileImage', values.image);
    }
    try {
      await updateIngredient(formData).unwrap();
      toast.success('Ingredient updated successfully');
      handleEditClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update ingredient');
    }
  };

  const columns = [
    { 
      header: '#', 
      field: 'id', 
      headerStyle: { width: 60 },
      render: (row, rowIndex) => ((page - 1) * limit + rowIndex + 1)
    },
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => handleViewOpen(row.ingredient_id)}
          onEdit={() => handleEditOpen(row.ingredient_id)}
          onDelete={() => setDeleteId(row.ingredient_id)}
        />
      )
    }
  ];

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load ingredients.
      </div>
    );
  }

  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <PageHeader title="Manage Ingredients">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search ingredients..."
          label="Search ingredients"
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
      </PageHeader>

      <DataTable
        data={ingredients}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        limit={limit}
        onLimitChange={handleLimitChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        emptyMessage="No ingredients found."
      />

      <AddIngredientDialog
        open={addOpen}
        onClose={handleAddClose}
        onSubmit={handleAddSubmit}
        isLoading={isCreating}
      />

      <ViewIngredientDialog
        open={!!viewId}
        onClose={handleViewClose}
        isLoading={isViewLoading}
        data={viewIngredientData?.data}
      />

      <EditIngredientDialog
        open={!!editId}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating || isEditLoading}
        ingredientId={editId}
        form={editIngredientData?.data || { name: '', description: '', uses: '', substitutes: '' }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Ingredient"
        message="Are you sure you want to delete this ingredient? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        loadingText="Deleting..."
        severity="error"
      />
    </div>
  );
};

export default Ingredient;