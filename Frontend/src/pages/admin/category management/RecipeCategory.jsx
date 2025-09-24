import React, { useState } from 'react';
import { useGetRecipeCategoriesQuery, useDeleteRecipeCategoryByIdMutation, useCreateRecipeCategoryMutation } from '../../../features/api/categoryApi';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import ViewCategoryDialog from './ViewCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import AddCategoryDialog from './AddCategoryDialog';
import {
  DataTable,
  PageHeader,
  SearchBar,
  ActionButtons,
  ConfirmDialog
} from '../../../components/common';
import { CircularProgress } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';

const RecipeCategory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewId, setViewId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const { data, isLoading, isError } = useGetRecipeCategoriesQuery({ search, page, limit });
  const [deleteRecipeCategoryById, { isLoading: isDeleting }] = useDeleteRecipeCategoryByIdMutation();
  const [createRecipeCategory, { isLoading: isAdding }] = useCreateRecipeCategoryMutation();

  if (isLoading) return (
    <div 
      className="flex justify-center items-center h-40"
      style={{
        backgroundColor: 'var(--bg-primary)',
        transition: 'background-color 0.3s ease'
      }}
    >
      <CircularProgress color="warning" />
    </div>
  );
  if (isError) return (
    <div 
      className="text-center mt-10"
      style={{
        color: '#d32f2f',
        backgroundColor: 'var(--bg-primary)',
        transition: 'all 0.3s ease'
      }}
    >
      Failed to load categories.
    </div>
  );

  const categories = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const isAnyDialogOpen = !!(viewId || editId || deleteId);

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
        await deleteRecipeCategoryById(deleteId).unwrap();
        setDeleteId(null);
        toast.success('Category deleted successfully');
      } catch (error) {
        setDeleteId(null);
        const errMsg =
          error?.data?.message ||
          error?.error ||
          error?.message ||
          'Failed to delete category';
        toast.error(errMsg);
      }
    }
  };

  const handleEditOpen = (id) => {
    setEditId(id);
  };

  const handleEditClose = () => {
    setEditId(null);
  };


  const handleAddOpen = () => {
    setAddOpen(true);
  };
  const handleAddClose = () => {
    setAddOpen(false);
  };

  const handleAddSubmit = async (values) => {
    if (!values.name) {
      toast.error('Name is required');
      return;
    }
    try {
      await createRecipeCategory(values).unwrap();
      toast.success('Category added successfully');
      handleAddClose();
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        'Failed to add category';
      toast.error(errMsg);
    }
  };


  const columns = [
    {
      header: '#',
      field: 'index',
      headerStyle: { width: 60 },
      render: (row, index) => (page - 1) * limit + index + 1
    },
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { 
      header: 'Image', 
      field: 'image',
      render: (row) => (
        row.image ? (
          <img 
            src={row.image} 
            alt={row.name} 
            className="h-12 w-12 object-cover rounded"
            style={{
              border: `1px solid var(--border-color)`,
              backgroundColor: 'var(--card-bg)',
              padding: '2px'
            }}
          />
        ) : (
          <div 
            className="h-12 w-12 flex items-center justify-center rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: `1px solid var(--border-color)`,
              color: 'var(--text-muted)'
            }}
          >
            <span className="text-xs">No Image</span>
          </div>
        )
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => setViewId(row.category_id)}
          onEdit={() => handleEditOpen(row.category_id)}
          onDelete={() => setDeleteId(row.category_id)}
        />
      )
    }
  ];

  return (
   <div 
     className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}
     style={{
       backgroundColor: 'var(--bg-primary)',
       minHeight: '100vh',
       transition: 'all 0.3s ease'
     }}
   >
      <PageHeader title="Manage Recipe Categories">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search categories..."
          label="Search categories"
        />
        <Button
          variant="contained"
          color="warning"
          onClick={handleAddOpen}
          className="w-full sm:w-auto"
          sx={{ 
            mt: { xs: 1, sm: 0 },
            backgroundColor: 'var(--btn-primary)',
            color: '#ffffff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'var(--btn-primary-hover)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add Category
        </Button>
      </PageHeader>
      <DataTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        limit={limit}
        onLimitChange={handleLimitChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        emptyMessage="No categories found."
      />

      <AddCategoryDialog
        open={addOpen}
        onClose={handleAddClose}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
      />

      <ViewCategoryDialog
        open={!!viewId}
        onClose={() => setViewId(null)}
        categoryId={viewId}
      />

      <EditCategoryDialog
        open={!!editId}
        onClose={handleEditClose}
        categoryId={editId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        loadingText="Deleting..."
        severity="error"
      />
    </div>
  );
};

export default RecipeCategory;