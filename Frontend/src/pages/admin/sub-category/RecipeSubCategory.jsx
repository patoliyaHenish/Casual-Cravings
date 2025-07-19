import React, { useState } from 'react';
import {
  useGetAllRecipeSubCategorieDetailsQuery,
  useCreateRecipeSubCategoryMutation,
  useDeleteRecipeSubCategoryMutation,
} from '../../../features/api/subCategoryApi';
import { Button } from '@mui/material';
import { toast } from 'sonner';
import ViewSubCategoryDialog from './ViewSubCategoryDialog';
import EditSubCategoryDialog from './EditSubCategoryDialog';
import AddSubCategoryDialog from './AddSubCategoryDialog';
import {
  DataTable,
  PageHeader,
  SearchBar,
  ActionButtons,
  ConfirmDialog
} from '../../../components/common';

const RecipeSubCategory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isError } = useGetAllRecipeSubCategorieDetailsQuery({ search, page, limit });

  const [createRecipeSubCategory, { isLoading: isAdding }] = useCreateRecipeSubCategoryMutation();
  const [deleteRecipeSubCategory, { isLoading: isDeleting }] = useDeleteRecipeSubCategoryMutation();

  const subCategories = data?.data || [];
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
        await deleteRecipeSubCategory({ subCategoryId: deleteId }).unwrap();
        setDeleteId(null);
        toast.success('Sub-category deleted successfully');
      } catch (error) {
        setDeleteId(null);
        toast.error(error?.data?.message || 'Failed to delete sub-category');
      }
    }
  };

  const handleEditOpen = (id) => setEditId(id);
  const handleEditClose = () => setEditId(null);

  const handleViewOpen = (id) => setViewId(id);
  const handleViewClose = () => setViewId(null);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  const handleAddSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append('categoryId', Number(values.categoryId));
    formData.append('name', values.name);
    formData.append('description', values.description);
    if (values.image) {
      formData.append('recipeSubCategoryProfileImage', values.image);
    }
    try {
      await createRecipeSubCategory(formData).unwrap();
      toast.success('Sub-category added successfully');
      setAddOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add sub-category');
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
    { header: 'Category', field: 'category_name' },
    { header: 'Description', field: 'description' },
    { 
      header: 'Image', 
      field: 'image',
      render: (row) => (
        row.image ? (
          <img src={row.image} alt={row.name} className="h-12 w-12 object-cover rounded" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => handleViewOpen(row.sub_category_id)}
          onEdit={() => handleEditOpen(row.sub_category_id)}
          onDelete={() => setDeleteId(row.sub_category_id)}
        />
      )
    }
  ];

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load sub-categories.
      </div>
    );
  }

  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <PageHeader title="Manage Recipe Sub-Categories">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search sub-categories..."
          label="Search sub-categories"
        />
        <Button
          variant="contained"
          color="warning"
          onClick={handleAddOpen}
          className="w-full sm:w-auto"
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          Add Sub-Category
        </Button>
      </PageHeader>

      <DataTable
        data={subCategories}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        limit={limit}
        onLimitChange={handleLimitChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        emptyMessage="No sub-categories found."
      />

      <AddSubCategoryDialog
        open={addOpen}
        onClose={handleAddClose}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
      />

      <ViewSubCategoryDialog
        open={!!viewId}
        onClose={handleViewClose}
        subCategoryId={viewId}
      />

      <EditSubCategoryDialog
        open={!!editId}
        onClose={handleEditClose}
        subCategoryId={editId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Sub Category"
        message="Are you sure you want to delete this sub category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        loadingText="Deleting..."
        severity="error"
      />
    </div>
  );
};

export default RecipeSubCategory;