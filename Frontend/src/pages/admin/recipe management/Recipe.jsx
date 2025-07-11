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
import { useGetRecipeCategoriesQuery } from '../../../features/api/categoryApi';
import { useGetAllRecipeSubCategorieDetailsQuery } from '../../../features/api/subCategoryApi';
import { Button, FormControl, Select, MenuItem } from '@mui/material';
import { toast } from 'sonner';
import {
  DataTable,
  PageHeader,
  SearchBar,
  ActionButtons,
  ConfirmDialog
} from '../../../components/common';
import { useRef } from 'react';

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
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [nutritionRecipe, setNutritionRecipe] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const usdaApiKey = import.meta.env.VITE_USDA_FOOD_NUTRI_API;

  // Filter state
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [addedByUser, setAddedByUser] = useState('');
  const [addedByAdmin, setAddedByAdmin] = useState('');
  const [adminApprovedStatus, setAdminApprovedStatus] = useState('');
  const [publicApproved, setPublicApproved] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef();

  // Utility: Singularize simple plurals
  function singularize(word) {
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }

  async function fetchUSDAIngredientNutrition(ingredient, qty, unit) {
    let searchAttempts = [];
    let searchNames = [];
    // 1. Clean up ingredient name
    let cleaned = ingredient.toLowerCase().replace(/[^a-zA-Z ]/g, ' ').replace(/\b(fresh|chopped|minced|sliced|diced|large|small|medium|extra|organic|raw|cooked|boiled|baked|grilled|roasted|peeled|seeded|boneless|skinless|pieces|cups|tablespoons|teaspoons|tbsp|tsp|cup|slice|can|packet|stick|clove|pinch|lb|oz|g|kg|ml|l)\b/g, '').replace(/\s+/g, ' ').trim();
    if (!cleaned) cleaned = ingredient;
    searchNames.push(cleaned);
    // 2. Try original cleaned name
    let searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(cleaned)}&pageSize=1`);
    let searchData = await searchRes.json();
    searchAttempts.push({ tried: cleaned, found: !!(searchData.foods && searchData.foods[0]) });
    // 3. If not found, try first word
    if (!searchData.foods || !searchData.foods[0]) {
      let firstWord = cleaned.split(' ')[0];
      if (firstWord && firstWord !== cleaned) {
        searchNames.push(firstWord);
        searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(firstWord)}&pageSize=1`);
        searchData = await searchRes.json();
        searchAttempts.push({ tried: firstWord, found: !!(searchData.foods && searchData.foods[0]) });
      }
    }
    // 4. If still not found, try singular
    if (!searchData.foods || !searchData.foods[0]) {
      let singular = singularize(cleaned);
      if (singular && singular !== cleaned) {
        searchNames.push(singular);
        searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(singular)}&pageSize=1`);
        searchData = await searchRes.json();
        searchAttempts.push({ tried: singular, found: !!(searchData.foods && searchData.foods[0]) });
      }
    }
    if (!searchData.foods || !searchData.foods[0]) return { notFound: true, name: ingredient, searchAttempts };
    const fdcId = searchData.foods[0].fdcId;
    let foodData;
    try {
      const foodRes = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${usdaApiKey}`);
      foodData = await foodRes.json();
    } catch (e) {
      return { notFound: true, name: ingredient, searchAttempts, apiError: true };
    }
    const nutrients = { calories: 0, fat: 0, carbs: 0, protein: 0 };
    foodData.foodNutrients.forEach(n => {
      if (n.nutrientName === 'Energy' && n.unitName === 'KCAL') nutrients.calories = n.value;
      if (n.nutrientName === 'Total lipid (fat)') nutrients.fat = n.value;
      if (n.nutrientName === 'Carbohydrate, by difference') nutrients.carbs = n.value;
      if (n.nutrientName === 'Protein') nutrients.protein = n.value;
    });
    // Default to 100g if qty/unit missing
    let factor = 1;
    if (!qty || isNaN(qty) || qty <= 0) { qty = 100; unit = 'g'; }
    if (!unit) unit = 'g';
    if (unit === 'g' || unit === 'gram' || unit === 'grams') factor = qty / 100;
    else if (unit === 'kg') factor = (qty * 1000) / 100;
    else if (unit === 'mg') factor = (qty / 1000) / 100;
    else if (unit === 'lb') factor = (qty * 453.592) / 100;
    else if (unit === 'oz') factor = (qty * 28.3495) / 100;
    else factor = qty / 100;
    return {
      calories: nutrients.calories * factor,
      fat: nutrients.fat * factor,
      carbs: nutrients.carbs * factor,
      protein: nutrients.protein * factor,
      name: ingredient,
      searched: searchNames,
      notFound: false,
      searchAttempts
    };
  }

  // Nutrition Info Modal logic
  useEffect(() => {
    if (nutritionModalOpen && nutritionRecipe) {
      setNutritionLoading(true);
      setNutritionData(null);
      (async () => {
        const { ingredients_id = [], ingredient_quantity = [], ingredient_unit = [], serving_size = 1 } = nutritionRecipe;
        let total = { calories: 0, fat: 0, carbs: 0, protein: 0 };
        let details = [];
        let notFound = [];
        let apiError = false;
        for (let idx = 0; idx < ingredients_id.length; idx++) {
          const ingredient = (typeof ingredients_id[idx] === 'object' && ingredients_id[idx].name) ? ingredients_id[idx].name : String(ingredients_id[idx]);
          let qty = parseFloat(ingredient_quantity[idx]);
          let unit = (ingredient_unit[idx] || '').toLowerCase();
          try {
            const nut = await fetchUSDAIngredientNutrition(ingredient, qty, unit);
            if (nut && !nut.notFound) {
              total.calories += nut.calories;
              total.fat += nut.fat;
              total.carbs += nut.carbs;
              total.protein += nut.protein;
              details.push({ ...nut, qty, unit });
            } else {
              notFound.push({ name: nut.name, searchAttempts: nut.searchAttempts, apiError: nut.apiError });
              if (nut.apiError) apiError = true;
            }
          } catch (e) { notFound.push({ name: ingredient, searchAttempts: [], apiError: true }); apiError = true; }
        }
        const servings = parseFloat(nutritionRecipe.serving_size) || 1;
        setNutritionData({
          perServing: {
            calories: total.calories / servings,
            fat: total.fat / servings,
            carbs: total.carbs / servings,
            protein: total.protein / servings,
          },
          servings,
          details,
          notFound,
          apiError
        });
        setNutritionLoading(false);
      })();
    }
  }, [nutritionModalOpen, nutritionRecipe]);

  // Fetch categories and subcategories for dropdowns
  const { data: categoriesData } = useGetRecipeCategoriesQuery({ page: 1, limit: 100 });
  const { data: subCategoriesData } = useGetAllRecipeSubCategorieDetailsQuery({ page: 1, limit: 100 });
  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];

  const { data, isLoading } = useGetAllRecipesForAdminQuery({
    search,
    page,
    limit,
    category_name: categoryName,
    sub_category_name: subCategoryName,
    added_by_user: addedByUser,
    added_by_admin: addedByAdmin,
    admin_approved_status: adminApprovedStatus,
    public_approved: publicApproved,
  });
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
            className="w-15 h-10 object-cover rounded"
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
      header: 'Nutrition Info',
      field: 'nutrition',
      render: (row) => (
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
          onClick={() => { setNutritionRecipe(row); setNutritionModalOpen(true); }}
          type="button"
        >
          Nutrition Info
        </button>
      )
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

  // Close filter popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <PageHeader title="Manage Recipes">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
            placeholder="Search by title..."
            label="Search by title"
          />
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
            onClick={() => setShowFilters((v) => !v)}
            type="button"
          >
            Filter
          </button>
          {showFilters && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={() => setShowFilters(false)} />
              <div ref={filterRef} className="fixed left-1/2 top-28 z-50 -translate-x-1/2 p-4 bg-white rounded shadow-lg flex flex-col gap-2 min-w-[260px] border border-orange-200">
                <label className="font-semibold">Category</label>
                <select
                  className="border rounded px-2 py-1"
                  value={categoryName}
                  onChange={e => { setCategoryName(e.target.value); setPage(1); }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <label className="font-semibold">Subcategory</label>
                <select
                  className="border rounded px-2 py-1"
                  value={subCategoryName}
                  onChange={e => { setSubCategoryName(e.target.value); setPage(1); }}
                >
                  <option value="">All Subcategories</option>
                  {subCategories.map(sub => (
                    <option key={sub.sub_category_id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
                <label className="font-semibold">Added By User?</label>
                <select
                  className="border rounded px-2 py-1"
                  value={addedByUser}
                  onChange={e => { setAddedByUser(e.target.value); setPage(1); }}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <label className="font-semibold">Added By Admin?</label>
                <select
                  className="border rounded px-2 py-1"
                  value={addedByAdmin}
                  onChange={e => { setAddedByAdmin(e.target.value); setPage(1); }}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <label className="font-semibold">Admin Approved Status</label>
                <select
                  className="border rounded px-2 py-1"
                  value={adminApprovedStatus}
                  onChange={e => { setAdminApprovedStatus(e.target.value); setPage(1); }}
                >
                  <option value="">Any</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <label className="font-semibold">Public Approved?</label>
                <select
                  className="border rounded px-2 py-1"
                  value={publicApproved}
                  onChange={e => { setPublicApproved(e.target.value); setPage(1); }}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <button
                  className="mt-2 bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm"
                  onClick={() => {
                    setCategoryName('');
                    setSubCategoryName('');
                    setAddedByUser('');
                    setAddedByAdmin('');
                    setAdminApprovedStatus('');
                    setPublicApproved('');
                    setShowFilters(false);
                    setPage(1);
                  }}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>
            </>
          )}
        <Button
          variant="contained"
          color="warning"
          onClick={handleAddOpen}
          className="w-full sm:w-auto"
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          Add Recipe
        </Button>
        </div>
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
      {/* Nutrition Info Modal placeholder */}
      {nutritionModalOpen && nutritionRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setNutritionModalOpen(false)}
              type="button"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Nutrition Info</h2>
            {nutritionLoading ? (
              <div className="flex items-center justify-center h-32"><span className="animate-spin mr-2">⏳</span>Loading nutrition...</div>
            ) : nutritionData ? (
              <div>
                {nutritionData.apiError && <div className="text-red-500 mb-2">API/network error. Please check your API key and internet connection.</div>}
                <div className="mb-2 text-sm text-gray-600">Per serving (based on {nutritionData.servings} servings)</div>
                <div className="grid grid-cols-2 gap-2 text-base">
                  <div><span className="font-semibold">Calories:</span> {nutritionData.perServing.calories.toFixed(0)}</div>
                  <div className="text-right text-xs text-gray-500">{((nutritionData.perServing.calories/2000)*100).toFixed(0)}% DV</div>
                  <div><span className="font-semibold">Fat:</span> {nutritionData.perServing.fat.toFixed(1)}g</div>
                  <div className="text-right text-xs text-gray-500">{((nutritionData.perServing.fat/78)*100).toFixed(0)}% DV</div>
                  <div><span className="font-semibold">Carbs:</span> {nutritionData.perServing.carbs.toFixed(1)}g</div>
                  <div className="text-right text-xs text-gray-500">{((nutritionData.perServing.carbs/275)*100).toFixed(0)}% DV</div>
                  <div><span className="font-semibold">Protein:</span> {nutritionData.perServing.protein.toFixed(1)}g</div>
                  <div className="text-right text-xs text-gray-500">{((nutritionData.perServing.protein/50)*100).toFixed(0)}% DV</div>
                </div>
                <div className="mt-4 text-xs text-gray-400">* % Daily Values are based on a 2,000 calorie diet.<br/>Nutrition is estimated from ingredient names and USDA data.</div>
                <div className="mt-4">
                  <div className="font-semibold mb-1">Ingredient Details:</div>
                  <ul className="text-xs text-gray-700 max-h-32 overflow-y-auto">
                    {nutritionData.details.map((d, i) => (
                      <li key={i} className="mb-1">{d.qty} {d.unit} <span className="font-semibold">{d.name}</span> (searched: <span className="italic">{d.searched.join(' / ')}</span>) — {d.calories.toFixed(0)} kcal, {d.fat.toFixed(1)}g fat, {d.carbs.toFixed(1)}g carbs, {d.protein.toFixed(1)}g protein
                        <ul className="ml-2 text-gray-400 text-[10px]">
                          {d.searchAttempts.map((a, j) => <li key={j}>Tried: {a.tried} {a.found ? '✅' : '❌'}</li>)}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  {nutritionData.notFound.length > 0 && (
                    <div className="mt-2 text-xs text-red-500">No nutrition data found for: {nutritionData.notFound.map(n => n.name).join(', ')}
                      <ul className="ml-2 text-gray-400 text-[10px]">
                        {nutritionData.notFound.map((n, i) => n.searchAttempts && n.searchAttempts.map((a, j) => <li key={i + '-' + j}>Tried: {a.tried} {a.found ? '✅' : '❌'}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-red-500">Could not fetch nutrition info for this recipe.</div>
            )}
          </div>
        </div>
      )}

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