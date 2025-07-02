import React, { useEffect, useState } from 'react';
import { useGetRecipeCategoriesQuery, useGetRecipeCategoryByIdQuery, useDeleteRecipeCategoryByIdMutation, useUpdateRecipeCategoryByIdMutation, useCreateRecipeCategoryMutation } from '../../../features/api/categoryApi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'sonner';
import ViewCategoryDialog from './ViewCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import AddCategoryDialog from './AddCategoryDialog';

const RecipeCategory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [viewId, setViewId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [viewCancelHighlight, setViewCancelHighlight] = useState(false);
  const [editCancelHighlight, setEditCancelHighlight] = useState(false);
  const [deleteCancelHighlight, setDeleteCancelHighlight] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', image: null, imagePreview: null });
  const [addHighlight, setAddHighlight] = useState(false);

  const { data, isLoading, isError } = useGetRecipeCategoriesQuery({ search, page, limit });
  const { data: viewData, isLoading: isViewLoading } = useGetRecipeCategoryByIdQuery(viewId, { skip: !viewId });
  const { data: editData, isLoading: isEditLoading } = useGetRecipeCategoryByIdQuery(editId, { skip: !editId });
  const [deleteRecipeCategoryById, { isLoading: isDeleting }] = useDeleteRecipeCategoryByIdMutation();
  const [updateRecipeCategoryById, { isLoading: isUpdating }] = useUpdateRecipeCategoryByIdMutation();
  const [createRecipeCategory, { isLoading: isAdding }] = useCreateRecipeCategoryMutation();

  useEffect(() => {
    if (editId && editData?.data) {
      setEditForm({
        name: editData.data.name || '',
        description: editData.data.description || '',
        image: editData.data.image || null,
        imagePreview: null,
        removeImage: false,
      });
    }
  }, [editId, editData]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-40">
      <CircularProgress color="warning" />
    </div>
  );
  if (isError) return <div className="text-red-500 text-center mt-10">Failed to load categories.</div>;

  const categories = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const isAnyDialogOpen = !!(viewId || editId || deleteId || addOpen);

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
    setEditForm({ name: '', description: '' });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        removeImage: false,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      toast.error('Name is required');
      return;
    }
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    if (editForm.image instanceof File) {
      formData.append('recipeCategoryProfileImage', editForm.image);
    }
    if (editForm.removeImage) {
      formData.append('removeImage', 'true');
    }
    try {
      await updateRecipeCategoryById({ id: editId, inputData: formData }).unwrap();
      toast.success('Category updated successfully');
      handleEditClose();
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        'Failed to update category';
      toast.error(errMsg);
    }
  };


  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setAddForm({ name: '', description: '', image: null, imagePreview: null });
  };

  const handleAddFormChange = (e) => {
    setAddForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleAddSubmit = async (values) => {
    if (!values.name) {
      toast.error('Name is required');
      return;
    }
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    if (values.image) {
      formData.append('recipeCategoryProfileImage', values.image);
    }
    try {
      await createRecipeCategory(formData).unwrap();
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


  return (
   <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <h2 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
          Manage Recipe Categories
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <TextField
            label="Search categories"
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
            Add Category
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
              <TableCell className="!font-bold">Image</TableCell>
              <TableCell className="!font-bold">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat, idx) => (
              <TableRow key={cat.category_id || idx} className="hover:bg-orange-50">
                <TableCell>{(pagination.page - 1) * limit + idx + 1}</TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <IconButton
                      color="warning"
                      onClick={() => setViewId(cat.category_id)}
                      aria-label="View"
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditOpen(cat.category_id)}
                      aria-label="Edit"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(cat.category_id)}
                      aria-label="Delete"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-4 text-gray-500">
                  No categories found.
                </TableCell>
              </TableRow>
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
          className="disabled:bg-gray-300"
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
          className="disabled:bg-gray-300"
        >
          Next
        </Button>
      </div>

      <ViewCategoryDialog
        open={!!viewId}
        onClose={() => setViewId(null)}
        highlight={viewCancelHighlight}
        setHighlight={setViewCancelHighlight}
        isLoading={isViewLoading}
        data={viewData?.data}
      />

      <EditCategoryDialog
        open={!!editId}
        onClose={handleEditClose}
        highlight={editCancelHighlight}
        setHighlight={setEditCancelHighlight}
        isLoading={isEditLoading}
        isUpdating={isUpdating}
        form={editForm}
        onFormChange={handleEditChange}
        onImageChange={handleEditImageChange}
        onSubmit={handleEditSubmit}
      />

      <DeleteCategoryDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        highlight={deleteCancelHighlight}
        setHighlight={setDeleteCancelHighlight}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <AddCategoryDialog
        open={addOpen}
        onClose={handleAddClose}
        form={addForm}
        onFormChange={handleAddFormChange}
        onImageChange={handleAddImageChange}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
        highlight={addHighlight}
        setHighlight={setAddHighlight}
      />
    </div>
  );
};

export default RecipeCategory;