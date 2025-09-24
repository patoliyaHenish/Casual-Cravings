import React, { useState, useEffect, useRef } from 'react';
import RecipeDialog from './AddRecipeDialog';
import ViewRecipeDialog from './ViewRecipeDialog';
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
import { toast } from 'react-toastify';
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
  const [editForm, setEditForm] = useState({ title: '', description: '', prep_time: '', cook_time: '', serving_size: '', ingredients_id: [], recipe_instructions: [], keywords: [] });
  const [addOpen, setAddOpen] = useState(false);
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [nutritionRecipeId, setNutritionRecipeId] = useState(null);
  const usdaApiKey = import.meta.env.VITE_USDA_FOOD_NUTRI_API;

  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [addedByUser, setAddedByUser] = useState('');
  const [addedByAdmin, setAddedByAdmin] = useState('');
  const [adminApprovedStatus, setAdminApprovedStatus] = useState('');
  const [publicApproved, setPublicApproved] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef();

  let defaultForm = {
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    serving_size: '',
    category_id: '',
    sub_category_id: null,
    ingredients: [],
    recipe_instructions: [],
    keywords: [],
    video_url: '',
    image_url: '',
  };


  function singularize(word) {
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }

  async function fetchUSDAIngredientNutrition(ingredient, qty, unit) {
    let searchAttempts = [];
    let searchNames = [];
    let cleaned = ingredient.toLowerCase().replace(/[^a-zA-Z ]/g, ' ').replace(/\b(fresh|chopped|minced|sliced|diced|large|small|medium|extra|organic|raw|cooked|boiled|baked|grilled|roasted|peeled|seeded|boneless|skinless|pieces|cups|tablespoons|teaspoons|tbsp|tsp|cup|slice|can|packet|stick|clove|pinch|lb|oz|g|kg|ml|l)\b/g, '').replace(/\s+/g, ' ').trim();
    if (!cleaned) cleaned = ingredient;
    searchNames.push(cleaned);
    if (!usdaApiKey) {
      return { notFound: true, name: ingredient, searchAttempts, apiError: true, apiKeyMissing: true };
    }
    let searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(cleaned)}&pageSize=1`);
    let searchData = await searchRes.json();
    searchAttempts.push({ tried: cleaned, found: !!(searchData.foods && searchData.foods[0]) });
    if (!searchData.foods || !searchData.foods[0]) {
      let firstWord = cleaned.split(' ')[0];
      if (firstWord && firstWord !== cleaned) {
        searchNames.push(firstWord);
        searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(firstWord)}&pageSize=1`);
        searchData = await searchRes.json();
        searchAttempts.push({ tried: firstWord, found: !!(searchData.foods && searchData.foods[0]) });
      }
    }
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
    const nutrients = {
      calories: 0,
      fat: 0,
      satFat: 0,
      cholesterol: 0,
      sodium: 0,
      carbs: 0,
      fiber: 0,
      sugars: 0,
      protein: 0
    };
    foodData.foodNutrients.forEach(n => {
      const name = n.nutrient?.name?.toLowerCase();
      const unitName = n.nutrient?.unitName?.toLowerCase();
      if (name === 'energy' && (unitName === 'kcal')) nutrients.calories = n.amount;
      if (name === 'energy' && unitName === 'kj' && !nutrients.calories) nutrients.calories = n.amount * 0.239006;
      if (name === 'total lipid (fat)') nutrients.fat = n.amount;
      if (name === 'fatty acids, total saturated') nutrients.satFat = n.amount;
      if (name === 'cholesterol') nutrients.cholesterol = n.amount;
      if (name === 'sodium, na') nutrients.sodium = n.amount;
      if (name === 'carbohydrate, by difference') nutrients.carbs = n.amount;
      if (name === 'fiber, total dietary') nutrients.fiber = n.amount;
      if (name === 'sugars, total including nlea') nutrients.sugars = n.amount;
      if (name === 'protein') nutrients.protein = n.amount;
    });
    const unitToGram = {
      g: 1,
      kg: 1000,
      mg: 0.001,
      lb: 453.592,
      oz: 28.3495,
      ml: 1,
      l: 1000,
      tbsp: 15,
      tsp: 5,
      cup: 240,
      piece: 50,
      slice: 30,
      clove: 5,
      pinch: 0.36,
      dash: 0.6,
      ounce: 28.3495,
      can: 400
    };
    let factor = 1;
    if (!qty || isNaN(qty) || qty <= 0) { qty = 100; unit = 'g'; }
    if (!unit) unit = 'g';
    if (unitToGram[unit]) {
      factor = (qty * unitToGram[unit]) / 100;
    } else {
      factor = qty / 100;
    }
    Object.keys(nutrients).forEach(key => { nutrients[key] = nutrients[key] * factor; });
    return {
      ...nutrients,
      caloriesFromFat: nutrients.fat * 9,
      name: ingredient,
      searched: searchNames,
      notFound: false,
      searchAttempts,
      qty,
      unit
    };
  }



  useEffect(() => {
    if (!nutritionModalOpen) {
      setNutritionRecipeId(null);
      setNutritionData(null);
      setNutritionLoading(false);
    }
  }, [nutritionModalOpen]);

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

  const { data: nutritionRecipeData, isLoading: isNutritionLoading } = useGetRecipeByIdForAdminQuery(nutritionRecipeId, { skip: !nutritionRecipeId });

  useEffect(() => {
    if (nutritionModalOpen && nutritionRecipeData?.data) {
      setNutritionLoading(true);
      setNutritionData(null);
      (async () => {
        const recipe = nutritionRecipeData.data;
        const { ingredients = [], serving_size = 1, serving_size_display = '' } = recipe;
        let total = { calories: 0, fat: 0, satFat: 0, cholesterol: 0, sodium: 0, carbs: 0, fiber: 0, sugars: 0, protein: 0 };
        let details = [];
        let notFound = [];
        let apiError = false;
        for (const ingredient of ingredients) {
          const ingredientName = ingredient.ingredient_name;
          const qty = parseFloat(ingredient.quantity);
          const unit = (ingredient.unit || '').toLowerCase();
          try {
            const nut = await fetchUSDAIngredientNutrition(ingredientName, qty, unit);
            if (nut && !nut.notFound) {
              total.calories += nut.calories;
              total.fat += nut.fat;
              total.satFat += nut.satFat;
              total.cholesterol += nut.cholesterol;
              total.sodium += nut.sodium;
              total.carbs += nut.carbs;
              total.fiber += nut.fiber;
              total.sugars += nut.sugars;
              total.protein += nut.protein;
              details.push({ ...nut, qty, unit });
            } else {
              notFound.push({ name: nut.name, searchAttempts: nut.searchAttempts, apiError: nut.apiError });
              if (nut.apiError) apiError = true;
            }
          } catch (e) {
            notFound.push({ name: ingredientName, searchAttempts: [], apiError: true });
            apiError = true;
          }
        }
        const servings = parseFloat(serving_size) || 1;
        setNutritionData({
          perServing: {
            calories: total.calories / servings,
            fat: total.fat / servings,
            satFat: total.satFat / servings,
            cholesterol: total.cholesterol / servings,
            sodium: total.sodium / servings,
            carbs: total.carbs / servings,
            fiber: total.fiber / servings,
            sugars: total.sugars / servings,
            protein: total.protein / servings,
          },
          servings,
          details,
          notFound,
          apiError,
          serving_size_display: serving_size_display || ''
        });
        setNutritionLoading(false);
      })();
    }
  }, [nutritionModalOpen, nutritionRecipeData]);

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

  const { data: editRecipeData, isLoading: isEditLoading } = useGetRecipeByIdForAdminQuery(editId, { skip: !editId });
  const { data: viewRecipeData, isLoading: isViewLoading } = useGetRecipeByIdForAdminQuery(viewId, { skip: !viewId });
  
  const { data: categoriesData } = useGetRecipeCategoriesQuery({ page: 1, limit: 100 });
  const { data: subCategoriesData } = useGetAllRecipeSubCategorieDetailsQuery({ page: 1, limit: 100 });
  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];

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
      toast.error(error?.data?.message || 'Failed to update admin approved status');
    }
  };

  const handlePublicApprovedStatusChange = async (recipeId, newStatus) => {
    try {
      await updateRecipePublicApprovedStatus({ id: recipeId, public_approved: newStatus }).unwrap();
      toast.success('Public approved status updated successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update public approved status');
    }
  };



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
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        recipe_instructions: Array.isArray(r.recipe_instructions)
          ? r.recipe_instructions.map(i => typeof i === 'string' ? i : i.instruction_text || '')
          : [],
        keywords: Array.isArray(r.keywords) ? r.keywords : [],
        video_url: r.video_url || '',
        image_url: r.image_url || '',
        image: r.image || '',
      });
    }
  }, [editId, editRecipeData]);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
  };

  const handleAddSubmit = async (values, { resetForm }) => {
  try {
    const recipeData = {
      ...values,
      sub_category_id: values.sub_category_id ? Number(values.sub_category_id) : null,
      imageData: values.imageData
    };

    await createRecipeByAdmin(recipeData).unwrap();
    toast.success('Recipe added successfully');
    handleAddClose();
    resetForm();
  } catch (error) {
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
      toast.error(error?.data?.message || 'Failed to delete recipe');
    }
  };

  const handleEditSubmit = async (values, { resetForm }) => {
    try {
      const recipeData = {
        ...values,
        sub_category_id: values.sub_category_id ? Number(values.sub_category_id) : null,
        imageData: values.imageData
      };

      await updateRecipeByAdmin({ id: editId, inputData: recipeData }).unwrap();
      toast.success('Recipe updated successfully');
      setEditId(null);
      resetForm();
    } catch (error) {
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
      field: 'image', 
      render: (row) => (
        row.image ? (
          <img
            src={row.image}
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
          className="px-3 py-1 rounded text-xs font-medium transition"
          style={{
            backgroundColor: 'var(--btn-secondary)',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'var(--btn-secondary-hover)'
            }
          }}
          onClick={() => { 
            setNutritionRecipeId(row.recipe_id); 
            setNutritionModalOpen(true); 
          }}
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



  return (
    <div className={`p-6 mt-16 transition-all duration-200 ${isAnyDialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <PageHeader title="Manage Recipes">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title or keywords..."
            label="Search recipes"
          />
          <button
            className="px-4 py-2 rounded transition font-semibold"
            style={{
              backgroundColor: 'var(--btn-primary)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'var(--btn-primary-hover)'
              }
            }}
            onClick={() => setShowFilters((v) => !v)}
            type="button"
          >
            Filter
          </button>
          {showFilters && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={() => setShowFilters(false)} />
              <div 
                ref={filterRef} 
                className="fixed left-1/2 top-28 z-50 -translate-x-1/2 p-4 rounded shadow-lg flex flex-col gap-2 min-w-[260px]"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}
              >
                <label className="font-semibold">Category</label>
                <select
                  className="border rounded px-2 py-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
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
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
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
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
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
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
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
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
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
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  value={publicApproved}
                  onChange={e => { setPublicApproved(e.target.value); setPage(1); }}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <button
                  className="mt-2 rounded px-3 py-1 text-sm font-medium transition"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--btn-secondary)',
                      color: '#ffffff'
                    }
                  }}
                  onClick={() => {
                    setCategoryName('');
                    setSubCategoryName('');
                    setAddedByUser('');
                    setAddedByAdmin('');
                    setAdminApprovedStatus('');
                    setPublicApproved('');
                    setSearch('');
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
            onClick={handleAddOpen}
            className="w-full sm:w-auto"
            sx={{ 
              mt: { xs: 1, sm: 0 },
              backgroundColor: 'var(--btn-primary)',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'var(--btn-primary-hover)'
              },
              transition: 'all 0.3s ease'
            }}
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
      {nutritionModalOpen && nutritionRecipeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0 mt-0 md:mt-12" style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.10)' }}>
          <div
            className="absolute inset-0 w-full h-full cursor-pointer"
            style={{ zIndex: 1 }}
            onClick={() => setNutritionModalOpen(false)}
          />
          <div
            className="bg-white shadow-lg relative w-full max-w-[300px] min-w-0 box-border"
            style={{
              width: '100vw',
              maxWidth: 300,
              minWidth: 0,
              border: '2px solid #111',
              borderRadius: 8,
              padding: 0,
              boxSizing: 'border-box',
              fontFamily: 'Inter, Arial, sans-serif',
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
              zIndex: 2
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-700 hover:text-black text-xl font-light"
              onClick={() => setNutritionModalOpen(false)}
              type="button"
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <div className="px-3 pt-4 pb-2">
              <div
                className="mb-2"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8
                }}
              >
                NUTRITION INFO
              </div>
              {nutritionData ? (
                 <>
                    <div className="mb-2" style={{ fontSize: '0.92rem' }}>
                      <div style={{ fontWeight: 700, display: 'inline' }}>Servings Per Recipe: </div>
                      <span style={{ fontWeight: 400, color: '#444' }}>
                        {nutritionData.servings}
                      </span>
                    </div>
                    <div style={{ border: '2px solid #111', borderRadius: 4 }}>
                      <table style={{ width: '100%', fontSize: '0.92rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '7px 6px 7px 6px',
                                fontWeight: 700,
                                borderBottom: '2px solid #111',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                fontSize: '0.92rem'
                              }}
                            >
                              AMT. PER SERVING
                            </th>
                            <th
                              style={{
                                textAlign: 'right',
                                padding: '7px 6px 7px 6px',
                                fontWeight: 700,
                                borderBottom: '2px solid #111',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                fontSize: '0.92rem'
                              }}
                            >
                              % DAILY VALUE
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: 700, padding: '6px 6px 2px 6px', fontSize: '1rem', borderBottom: '1px solid #eee' }}>
                              Calories: {nutritionData.perServing.calories.toFixed(1)}
                            </td>
                            <td style={{ padding: '6px 6px 2px 6px', borderBottom: '1px solid #eee' }}></td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 6px 2px 18px', color: '#222' }}>
                              Calories from Fat {(nutritionData.perServing.fat * 9).toFixed(0)} g
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 6px 2px 6px' }}>
                              {((nutritionData.perServing.fat/78)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2}>
                              <div style={{ borderTop: '1px solid #222', margin: '4px 0' }}></div>
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                fontWeight: 700,
                                padding: '4px 6px 2px 18px',
                                borderBottom: '1px dotted #888'
                              }}
                            >
                              Total Fat {nutritionData.perServing.fat.toFixed(1)} g
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                padding: '4px 6px 2px 6px',
                                fontWeight: 400,
                                borderBottom: '1px dotted #888'
                              }}
                            >
                              {((nutritionData.perServing.fat/78)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 6px 2px 30px', color: '#222' }}>
                              Saturated Fat {nutritionData.perServing.satFat ? nutritionData.perServing.satFat.toFixed(1) : 0} g
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 6px 2px 6px' }}>
                              {((nutritionData.perServing.satFat/20)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2}>
                              <div style={{ borderTop: '1px solid #222', margin: '4px 0' }}></div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, padding: '4px 6px 2px 6px' }}>
                              Cholesterol {nutritionData.perServing.cholesterol ? nutritionData.perServing.cholesterol.toFixed(1) : 0} mg
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 6px 2px 6px' }}>
                              {((nutritionData.perServing.cholesterol/300)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, padding: '2px 6px 2px 6px' }}>
                              Sodium {nutritionData.perServing.sodium ? nutritionData.perServing.sodium.toFixed(1) : 0} mg
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 6px 2px 6px' }}>
                              {((nutritionData.perServing.sodium/2300)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2}>
                              <div style={{ borderTop: '1px solid #222', margin: '4px 0' }}></div>
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                fontWeight: 700,
                                padding: '4px 6px 2px 6px',
                                borderBottom: '1px dotted #888'
                              }}
                            >
                              Total Carbohydrate {nutritionData.perServing.carbs.toFixed(1)} g
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                padding: '4px 6px 2px 6px',
                                fontWeight: 400,
                                borderBottom: '1px dotted #888'
                              }}
                            >
                              {((nutritionData.perServing.carbs/275)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 6px 2px 30px', color: '#222' }}>
                              Dietary Fiber {nutritionData.perServing.fiber ? nutritionData.perServing.fiber.toFixed(1) : 0} g
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 6px 2px 6px' }}>
                              {((nutritionData.perServing.fiber/28)*100).toFixed(0)} %
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 6px 2px 30px', color: '#222' }}>
                              Sugars {nutritionData.perServing.sugars ? nutritionData.perServing.sugars.toFixed(1) : 0} g
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 6px 2px 6px' }}>
                              26 %
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2}>
                              <div style={{ borderTop: '1px solid #222', margin: '4px 0' }}></div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, padding: '4px 6px 6px 6px' }}>
                              Protein {nutritionData.perServing.protein.toFixed(1)} g
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 6px 6px 6px' }}>
                              {((nutritionData.perServing.protein/50)*100).toFixed(0)} %
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                 </>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center h-32 text-lg"
                  style={{
                    color: 'var(--text-secondary)',
                    transition: 'color 0.3s ease'
                  }}
                >
                  <div className="mb-2 flex space-x-1">
                    <span 
                      className="inline-block w-2 h-2 rounded-full animate-ellipsis"
                      style={{
                        backgroundColor: 'var(--btn-primary)',
                        transition: 'background-color 0.3s ease'
                      }}
                    ></span>
                    <span 
                      className="inline-block w-2 h-2 rounded-full animate-ellipsis" 
                      style={{ 
                        animationDelay: '0.2s',
                        backgroundColor: 'var(--btn-primary)',
                        transition: 'background-color 0.3s ease'
                      }}
                    ></span>
                    <span 
                      className="inline-block w-2 h-2 rounded-full animate-ellipsis" 
                      style={{ 
                        animationDelay: '0.4s',
                        backgroundColor: 'var(--btn-primary)',
                        transition: 'background-color 0.3s ease'
                      }}
                    ></span>
                  </div>
                  <div>Loading nutrition info...</div>
                  <style>{`
                    @keyframes ellipsis {
                      0% { opacity: 0.2; }
                      20% { opacity: 1; }
                      100% { opacity: 0.2; }
                    }
                    .animate-ellipsis {
                      animation: ellipsis 1.2s infinite;
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <RecipeDialog
        open={addOpen}
        onClose={handleAddClose}
        form={defaultForm}
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
        data={viewRecipeData?.data}
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