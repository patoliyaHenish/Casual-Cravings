import React, { useEffect, useState } from 'react';
import {
  useGetAllRecipeSubCategorieDetailsQuery,
  useGetRecipeSubCategoryByIdMutation,
  useCreateRecipeSubCategoryMutation,
  useUpdateRecipeSubCategoryMutation,
  useDeleteRecipeSubCategoryMutation,
} from '../../../features/api/subCategoryApi';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, CircularProgress, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'sonner';
import ViewSubCategoryDialog from './ViewSubCategoryDialog';
import EditSubCategoryDialog from './EditSubCategoryDialog';
import DeleteSubCategoryDialog from './DeleteSubCategoryDialog';
import AddSubCategoryDialog from './AddSubCategoryDialog';
import { skipToken } from '@reduxjs/toolkit/query';

const RecipeSubCategory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', categoryId: '', image: null, imagePreview: null });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', categoryId: '', image: null, imagePreview: null });

  const { data, isLoading, isError } = useGetAllRecipeSubCategorieDetailsQuery({ search, page, limit });

  const [getRecipeSubCategoryById] = useGetRecipeSubCategoryByIdMutation();

  const [createRecipeSubCategory, { isLoading: isAdding }] = useCreateRecipeSubCategoryMutation();
  const [updateRecipeSubCategory, { isLoading: isUpdating }] = useUpdateRecipeSubCategoryMutation();
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
  const handleEditClose = () => {
    setEditId(null);
    setEditForm({ name: '', description: '', categoryId: '', image: null, imagePreview: null });
  };

  const handleViewOpen = async (id) => {
    setViewId(id);
    setIsViewLoading(true);
    try {
      const result = await getRecipeSubCategoryById({ subCategoryId: id }).unwrap();
      setViewData(result.data);
    } catch (error) {
      setViewData(null);
    }
    setIsViewLoading(false);
  };

  const handleViewClose = () => {
    setViewId(null);
    setViewData(null);
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
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.categoryId) {
      toast.error('Name and Category are required');
      return;
    }
    const formData = new FormData();
    formData.append('subCategoryId', editId);
    formData.append('categoryId', editForm.categoryId);
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    if (editForm.image instanceof File) {
      formData.append('recipeSubCategoryProfileImage', editForm.image);
    }
    try {
      await updateRecipeSubCategory(formData).unwrap();
      toast.success('Sub-category updated successfully');
      handleEditClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update sub-category');
    }
  };

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setAddForm({ name: '', description: '', categoryId: '', image: null, imagePreview: null });
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

  useEffect(() => {
    const fetchEditData = async () => {
      if (editId) {
        try {
          const result = await getRecipeSubCategoryById({ subCategoryId: editId }).unwrap();
          const sub = result.data;
          setEditForm({
            name: sub.name || '',
            description: sub.description || '',
            categoryId: sub.category_id ? String(sub.category_id) : '',
            image: sub.image || null,
            imagePreview: sub.image || null,
          });
        } catch (error) {
          setEditForm({ name: '', description: '', categoryId: '', image: null, imagePreview: null });
          toast.error(error?.data?.message || 'Failed to load sub-category');
        }
      }
    };
    fetchEditData();
  }, [editId]);

  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <CircularProgress color="warning" />
        </div>
      )}
      {isError && (
        <div className="text-red-500 text-center mt-10">
          Failed to load sub-categories.
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
            <h2 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
              Manage Recipe Sub-Categories
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <TextField
                label="Search sub-categories"
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
                Add Sub-Category
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
                  <TableCell className="!font-bold">Category</TableCell>
                  <TableCell className="!font-bold">Description</TableCell>
                  <TableCell className="!font-bold">Image</TableCell>
                  <TableCell className="!font-bold">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subCategories.map((sub, idx) => (
                  <TableRow key={sub.sub_category_id || idx} className="hover:bg-orange-50">
                    <TableCell>{(pagination.page - 1) * limit + idx + 1}</TableCell>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.category_name}</TableCell>
                    <TableCell>{sub.description}</TableCell>
                    <TableCell>
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="h-12 w-12 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <IconButton
                          color="warning"
                          onClick={() => handleViewOpen(sub.sub_category_id)}
                          aria-label="View"
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditOpen(sub.sub_category_id)}
                          aria-label="Edit"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteId(sub.sub_category_id)}
                          aria-label="Delete"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-4 text-gray-500">
                      No sub-categories found.
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

          <ViewSubCategoryDialog
            open={!!viewId}
            onClose={handleViewClose}
            isLoading={isViewLoading}
            data={viewData}
          />

          <EditSubCategoryDialog
            open={!!editId}
            onClose={handleEditClose}
            isUpdating={isUpdating}
            form={editForm}
            onFormChange={handleEditChange}
            onImageChange={handleEditImageChange}
            onSubmit={handleEditSubmit}
          />

          <DeleteSubCategoryDialog
            open={!!deleteId}
            onClose={() => setDeleteId(null)}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />

          <AddSubCategoryDialog
            open={addOpen}
            onClose={handleAddClose}
            form={addForm}
            onFormChange={handleAddFormChange}
            onImageChange={handleAddImageChange}
            onSubmit={handleAddSubmit}
            isLoading={isAdding}
          />
        </>
      )}
    </div>
  );
};

export default RecipeSubCategory;