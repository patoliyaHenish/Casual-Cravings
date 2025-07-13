import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Button,
  IconButton,
  Box,
  Typography,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add, Remove, Edit, Save, Cancel, Delete, FormatListBulleted, TextFields } from '@mui/icons-material';
import { useSearchIngredientsQuery, useCreateIngredientMutation, useDeleteIngredientMutation, useGetIngredientsPaginatedQuery as useGetIngredientsPaginatedQueryRaw, useGetAllIngredientsQuery } from '../features/api/ingredientApi';
import { toast } from 'sonner';

function splitFraction(formatted) {
  if (!formatted) return { whole: '', fraction: '' };
  const knownFractions = ['1⁄2','1⁄3','2⁄3','1⁄4','3⁄4','1⁄8','3⁄8','5⁄8','7⁄8'];
  if (knownFractions.includes(formatted)) {
    return { whole: '', fraction: formatted };
  }
  const mixedMatch = formatted.match(/^(\d+)\s+([\d]+⁄[\d]+)$/);
  if (mixedMatch) {
    return { whole: mixedMatch[1], fraction: mixedMatch[2] };
  }
  if (/^\d+$/.test(formatted)) {
    return { whole: formatted, fraction: '' };
  }
  const parts = formatted.split(' ');
  if (parts.length === 2 && knownFractions.includes(parts[1])) {
    return { whole: parts[0], fraction: parts[1] };
  }
  for (const frac of knownFractions) {
    if (formatted.endsWith(frac)) {
      return { whole: formatted.replace(frac, '').trim(), fraction: frac };
    }
  }
  return { whole: formatted, fraction: '' };
}

const fractionOptions = [
  '', '1⁄2', '1⁄3', '2⁄3', '1⁄4', '3⁄4', '1⁄8', '3⁄8', '5⁄8', '7⁄8'
];

const IngredientItem = ({ ingredient, index, onUpdate, onRemove, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(() => {
    if (ingredient.isFreeText) {
      return {
        freeText: ingredient.freeText || '',
      };
    } else {
      const { whole, fraction } = splitFraction(formatFraction(ingredient.quantity));
      return {
        whole,
        fraction,
        unit: ingredient.unit,
      };
    }
  });

  useEffect(() => {
    if (ingredient.isFreeText) {
      setEditValues({
        freeText: ingredient.freeText || '',
      });
    } else {
      const { whole, fraction } = splitFraction(formatFraction(ingredient.quantity));
      setEditValues({
        whole,
        fraction,
        unit: ingredient.unit,
      });
    }
  }, [ingredient]);

  const handleSave = () => {
    if (ingredient.isFreeText) {
      if (editValues.freeText.trim()) {
        onUpdate({
          ...ingredient,
          freeText: editValues.freeText.trim(),
        });
        setIsEditing(false);
      }
    } else {
      if ((editValues.whole || editValues.fraction) && editValues.unit) {
        const combined = `${editValues.whole}${editValues.fraction ? ' ' + editValues.fraction : ''}`.trim();
        onUpdate({
          ...ingredient,
          quantity: parseFraction(combined),
          unit: editValues.unit,
        });
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    if (ingredient.isFreeText) {
      setEditValues({
        freeText: ingredient.freeText || '',
      });
    } else {
      const { whole, fraction } = splitFraction(formatFraction(ingredient.quantity));
      setEditValues({
        whole,
        fraction,
        unit: ingredient.unit,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    if (ingredient.isFreeText) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <span className="min-w-[30px] font-bold">{index + 1}.</span>
          <TextField
            value={editValues.freeText}
            onChange={(e) => setEditValues({ ...editValues, freeText: e.target.value })}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
            autoFocus
            placeholder="e.g., Salt – to taste"
          />
          <IconButton
            size="small"
            color="primary"
            onClick={handleSave}
            disabled={disabled || !editValues.freeText.trim()}
          >
            <Save />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={handleCancel}
            disabled={disabled}
          >
            <Cancel />
          </IconButton>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="min-w-[30px] font-bold">{index + 1}.</span>
        <div className="flex-1 p-2 bg-gray-100 rounded">
          <Typography variant="body2" className="font-medium">
            {ingredient.ingredient_name}
          </Typography>
        </div>
        <div className="flex gap-1">
          <TextField
            value={editValues.whole}
            onChange={(e) => setEditValues({ ...editValues, whole: e.target.value.replace(/[^\d]/g, '') })}
            onKeyDown={handleKeyDown}
            size="small"
            type="text"
            sx={{ width: 40 }}
            autoFocus
            placeholder="0"
          />
          <TextField
            select
            value={editValues.fraction}
            onChange={(e) => setEditValues({ ...editValues, fraction: e.target.value })}
            size="small"
            sx={{ width: 60 }}
          >
            <MenuItem value="">None</MenuItem>
            {fractionOptions.slice(1).map((f) => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </TextField>
        </div>
        <TextField
          select
          value={editValues.unit || ""}
          onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{ width: 100 }}
        >
          <MenuItem value="">Select unit</MenuItem>
          <MenuItem value="g">g</MenuItem>
          <MenuItem value="kg">kg</MenuItem>
          <MenuItem value="ml">ml</MenuItem>
          <MenuItem value="l">l</MenuItem>
          <MenuItem value="tbsp">tbsp</MenuItem>
          <MenuItem value="tsp">tsp</MenuItem>
          <MenuItem value="cup">cup</MenuItem>
          <MenuItem value="piece">piece</MenuItem>
          <MenuItem value="slice">slice</MenuItem>
          <MenuItem value="clove">clove</MenuItem>
          <MenuItem value="pinch">pinch</MenuItem>
          <MenuItem value="dash">dash</MenuItem>
          <MenuItem value="ounce">ounce</MenuItem>
          <MenuItem value="can">can</MenuItem>
          {editValues.unit &&
            ![
              "g","kg","ml","l","tbsp","tsp","cup","piece","slice","clove","pinch","dash","ounce","can"
            ].includes(editValues.unit) && (
              <MenuItem value={editValues.unit}>{editValues.unit}</MenuItem>
            )}
        </TextField>
        <IconButton
          size="small"
          color="primary"
          onClick={handleSave}
          disabled={disabled || (!editValues.whole && !editValues.fraction) || !editValues.unit}
        >
          <Save />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={handleCancel}
          disabled={disabled}
        >
          <Cancel />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="min-w-[30px] font-bold">{index + 1}.</span>
      <div className="flex-1 p-2 bg-gray-100 rounded">
        <Typography variant="body2" className="font-medium">
          {ingredient.isFreeText ? ingredient.freeText : ingredient.ingredient_name}
        </Typography>
      </div>
      {!ingredient.isFreeText && (
        <Typography variant="body2" className="min-w-[60px] text-center">
          {formatFraction(ingredient.quantity)} {ingredient.unit}
        </Typography>
      )}
      <IconButton
        size="small"
        color="primary"
        onClick={() => setIsEditing(true)}
        disabled={disabled}
      >
        <Edit />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        disabled={disabled}
      >
        <Remove />
      </IconButton>
    </div>
  );
};

const IngredientInput = ({ value = [], onChange, disabled = false, dialogOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [inputMode, setInputMode] = useState('structured');
  const [freeTextInput, setFreeTextInput] = useState('');
  const inputRef = useRef();

  const { data: prefetchData } = useGetIngredientsPaginatedQueryRaw({ page: 1, limit: 20 }, { skip: false });

  useEffect(() => {
    if (dialogOpen === undefined || dialogOpen) {
      setSearchQuery('');
      setPage(1);
      setHasMore(true);
      setFreeTextInput('');
    }
  }, [dialogOpen, prefetchData]);

  const addedIngredientIds = value.filter(item => !item.isFreeText).map(item => item.ingredient_id);
  const excludeParam = addedIngredientIds.length > 0 ? addedIngredientIds.join(',') : undefined;
  
  const { data: searchResultsData } = useSearchIngredientsQuery(
    { query: searchQuery, exclude: excludeParam },
    {
      skip: !searchQuery || searchQuery.length < 2,
    }
  );

  const searchResults = Array.isArray(searchResultsData?.data) ? searchResultsData.data : [];

  const [createIngredient] = useCreateIngredientMutation();
  const [deleteIngredient] = useDeleteIngredientMutation();

  const { data: paginatedData, isFetching: isPaginatedFetching } = useGetIngredientsPaginatedQueryRaw({ page, limit: 20 }, { skip: !isOpen || !!searchQuery });

  useEffect(() => {
    if (paginatedData?.data) {
      setHasMore(paginatedData.data.length === 20);
    }
  }, [paginatedData, page]);

  useEffect(() => {
    if (searchQuery) {
      setPage(1);
      setHasMore(true);
    }
  }, [searchQuery]);

  const { data: allIngredientsData, isFetching: isAllIngredientsFetching } = useGetAllIngredientsQuery(excludeParam, { skip: !isOpen || !!searchQuery });

  const handleListScroll = (event) => {
    const listNode = event.currentTarget;
    if (
      listNode.scrollTop + listNode.clientHeight >= listNode.scrollHeight - 1 &&
      !isPaginatedFetching &&
      hasMore &&
      !searchQuery
    ) {
      setPage(prev => prev + 1);
    }
  };

  const handleIngredientSelect = (ingredient) => {
    if (ingredient) {
      setSelectedIngredient(ingredient);
      setShowQuantityInput(true);
    }
  };

  const handleAddIngredient = async () => {
    if (selectedIngredient && quantity && unit) {
      const exists = value.some(item => item.ingredient_id === selectedIngredient.ingredient_id);
      if (exists) {
        toast.info('This ingredient is already added to the recipe.');
        return;
      }

      const newIngredient = {
        ingredient_id: selectedIngredient.ingredient_id,
        ingredient_name: selectedIngredient.name,
        quantity: parseFraction(quantity),
        quantity_display: quantity,
        unit: unit,
        isFreeText: false,
      };

      onChange([...value, newIngredient]);
      
      setSelectedIngredient(null);
      setQuantity('');
      setUnit('g');
      setShowQuantityInput(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleAddFreeTextIngredient = () => {
    if (freeTextInput.trim()) {
      const newIngredient = {
        freeText: freeTextInput.trim(),
        isFreeText: true,
      };

      onChange([...value, newIngredient]);
      setFreeTextInput('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleCreateNewIngredient = async () => {
    if (searchQuery.trim()) {
      try {
        const result = await createIngredient({ name: searchQuery.trim() }).unwrap();
        
        setSelectedIngredient(result.data);
        setShowQuantityInput(true);
        if (!quantity) {
          setQuantity('1');
        }
        
        setSearchQuery('');
        
        toast.success(`Ingredient "${result.data.name}" created successfully!`);
      } catch {
        toast.error('Failed to create ingredient. Please try again.');
      }
    }
  };

  const handleUpdateIngredient = (index, updatedIngredient) => {
    const newIngredients = [...value];
    if (updatedIngredient.isFreeText) {
      newIngredients[index] = updatedIngredient;
    } else {
      newIngredients[index] = {
        ...updatedIngredient,
        quantity: parseFraction(updatedIngredient.quantity_display || updatedIngredient.quantity),
        quantity_display: updatedIngredient.quantity_display || updatedIngredient.quantity,
        isFreeText: false,
      };
    }
    onChange(newIngredients);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = value.filter((_, i) => i !== index);
    onChange(newIngredients);
  };

  const ingredientExists = (name, list) =>
    list.some(item => item.name.toLowerCase() === name.toLowerCase());

  let options = searchQuery.length > 0 ? searchResults : (allIngredientsData?.data || []);
  
  options = options.filter(option => !option.isAddNew && !addedIngredientIds.includes(option.ingredient_id));
  
  if (
    searchQuery &&
    !ingredientExists(searchQuery, options) &&
    searchQuery.length >= 2
  ) {
    options = [
      { isAddNew: true, name: searchQuery },
      ...options,
    ];
  }

  return (
    <div className="mb-4">
      <div className="mb-4">
        <ToggleButtonGroup
          value={inputMode}
          exclusive
          onChange={(event, newMode) => {
            if (newMode !== null) {
              setInputMode(newMode);
              setSearchQuery('');
              setSelectedIngredient(null);
              setShowQuantityInput(false);
              setFreeTextInput('');
            }
          }}
          size="small"
          className="mb-3"
        >
          <ToggleButton value="structured" aria-label="structured">
            <FormatListBulleted sx={{ mr: 1 }} />
            Structured
          </ToggleButton>
          <ToggleButton value="freeText" aria-label="free text">
            <TextFields sx={{ mr: 1 }} />
            Free Text
          </ToggleButton>
        </ToggleButtonGroup>

        {inputMode === 'freeText' ? (
          <div className="mb-4">
            <TextField
              label="Add Free Text Ingredient"
              value={freeTextInput}
              onChange={(e) => setFreeTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && freeTextInput.trim()) {
                  e.preventDefault();
                  handleAddFreeTextIngredient();
                }
              }}
              fullWidth
              margin="normal"
              disabled={disabled}
              placeholder="e.g., Salt – to taste, Fresh parsley – for garnish"
              helperText="Enter ingredients like 'Salt – to taste' or 'Fresh parsley – for garnish'"
            />
            <Button
              variant="outlined"
              color="primary"
              className="mt-2"
              disabled={!freeTextInput.trim() || disabled}
              onClick={handleAddFreeTextIngredient}
            >
              Add Free Text Ingredient
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <Autocomplete
              freeSolo
              options={options}
              getOptionLabel={option =>
                option.isAddNew
                  ? `➕ Add new ingredient: "${option.name}"`
                  : option.name || ''
              }
              inputValue={searchQuery}
              onInputChange={(event, newInputValue) => {
                setSearchQuery(newInputValue);
                setShowQuantityInput(false);
                if (newInputValue && newInputValue.length >= 2 && Array.isArray(searchResults)) {
                  const exactMatch = searchResults.find(item => 
                    item.name.toLowerCase() === newInputValue.toLowerCase()
                  );
                  if (!exactMatch) {
                    setShowQuantityInput(true);
                    if (!quantity) {
                      setQuantity('1');
                    }
                  }
                }
              }}
              onFocus={() => {
                setIsOpen(true);
                setSearchQuery('');
                setPage(1);
                setHasMore(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsOpen(false), 200);
              }}
              onChange={(event, newValue) => {
                if (newValue && newValue.isAddNew) {
                  handleCreateNewIngredient();
                  return;
                }
                if (newValue && typeof newValue === 'object') {
                  handleIngredientSelect(newValue);
                }
              }}
              ListboxProps={{
                onScroll: handleListScroll,
                style: { maxHeight: 300, overflow: 'auto' },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  label="Search or add ingredient"
                  fullWidth
                  disabled={disabled}
                  helperText={searchQuery && searchQuery.length >= 2 ? "Type to search existing ingredients or create new ones" : "Enter quantity and select fraction if needed"}
                  onFocus={() => {
                    setIsOpen(true);
                    setSearchQuery('');
                    setPage(1);
                    setHasMore(true);
                  }}
                  onClick={() => {
                    setIsOpen(true);
                    setSearchQuery('');
                    setPage(1);
                    setHasMore(true);
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>
                    {option.isAddNew
                      ? `➕ Add new ingredient: "${option.name}"`
                      : option.name}
                  </Typography>
                  {!option.isAddNew && option.ingredient_id && (
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={e => {
                        e.stopPropagation();
                        deleteIngredient(option.ingredient_id)
                          .unwrap()
                          .then(() => {
                            toast.success('Ingredient deleted!');
                          })
                          .catch(() => toast.error('Failed to delete ingredient.'));
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </li>
              )}
              noOptionsText={
                (searchQuery.length === 0 && isAllIngredientsFetching)
                  ? <span style={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={18} style={{ marginRight: 8 }} />Loading...</span>
                  : (searchQuery && searchQuery.length >= 2
                      ? `No ingredients found for "${searchQuery}". You can create it as a new ingredient.`
                      : "No ingredients available. Start typing to search or create new ones.")
              }
              open={isOpen}
              onOpen={() => {
                setIsOpen(true);
                setSearchQuery('');
                setPage(1);
                setHasMore(true);
              }}
              onClose={() => setIsOpen(false)}
            />

            {showQuantityInput && (
              <div className="flex gap-2 mt-2">
                <div className="flex gap-1">
                  <TextField
                    label="Quantity"
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    size="small"
                    sx={{ width: 80 }}
                    disabled={disabled}
                    placeholder="1"
                    helperText="Enter number"
                  />
                  <TextField
                    select
                    label="Fraction"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setQuantity(prev => {
                          const numericPart = String(prev || '').replace(/[^\d.]/g, '');
                          return numericPart ? `${numericPart} ${e.target.value}` : e.target.value;
                        });
                      }
                    }}
                    size="small"
                    sx={{ width: 100 }}
                    disabled={disabled}
                    helperText="Optional"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="1⁄2">1⁄2</MenuItem>
                    <MenuItem value="1⁄3">1⁄3</MenuItem>
                    <MenuItem value="2⁄3">2⁄3</MenuItem>
                    <MenuItem value="1⁄4">1⁄4</MenuItem>
                    <MenuItem value="3⁄4">3⁄4</MenuItem>
                    <MenuItem value="1⁄8">1⁄8</MenuItem>
                    <MenuItem value="3⁄8">3⁄8</MenuItem>
                    <MenuItem value="5⁄8">5⁄8</MenuItem>
                    <MenuItem value="7⁄8">7⁄8</MenuItem>
                  </TextField>
                </div>
                <TextField
                  select
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  disabled={disabled}
                >
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="l">l</MenuItem>
                  <MenuItem value="tbsp">tbsp</MenuItem>
                  <MenuItem value="tsp">tsp</MenuItem>
                  <MenuItem value="cup">cup</MenuItem>
                  <MenuItem value="piece">piece</MenuItem>
                  <MenuItem value="slice">slice</MenuItem>
                  <MenuItem value="clove">clove</MenuItem>
                  <MenuItem value="pinch">pinch</MenuItem>
                  <MenuItem value="dash">dash</MenuItem>
                  <MenuItem value="ounce">ounce</MenuItem>
                  <MenuItem value="can">can</MenuItem>
                </TextField>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddIngredient}
                  disabled={disabled || !selectedIngredient || !quantity || !unit}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div>
          <Typography variant="subtitle1" className="mb-2">
            Added Ingredients:
          </Typography>
          {value.map((ingredient, index) => (
            <IngredientItem
              key={index}
              ingredient={ingredient}
              index={index}
              onUpdate={(updatedIngredient) => handleUpdateIngredient(index, updatedIngredient)}
              onRemove={() => handleRemoveIngredient(index)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function parseFraction(input) {
  if (!input && input !== 0) return null;
  
  const inputStr = String(input || '').trim();
  
  const fractionMap = {
    '1⁄2': 0.5,
    '1⁄3': 1/3,
    '2⁄3': 2/3,
    '1⁄4': 0.25,
    '3⁄4': 0.75,
    '1⁄8': 0.125,
    '3⁄8': 0.375,
    '5⁄8': 0.625,
    '7⁄8': 0.875,
  };
  
  if (fractionMap[inputStr]) {
    return fractionMap[inputStr];
  }
  
  const parts = inputStr.split(' ');
  if (parts.length === 2) {
    const wholeNumber = parseFloat(parts[0]);
    const fraction = fractionMap[parts[1]];
    if (!isNaN(wholeNumber) && fraction !== undefined) {
      return wholeNumber + fraction;
    }
  }
  
  if (inputStr.includes('/')) {
    const [num, denom] = inputStr.split('/').map(Number);
    if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
      return num / denom;
    }
  }
  
  const asNumber = Number(inputStr);
  return isNaN(asNumber) ? null : asNumber;
}

function formatFraction(value) {
  if (value === null || value === undefined) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return String(value || '');
  
  const fractionMap = {
    0.5: '1⁄2',
    0.25: '1⁄4',
    0.75: '3⁄4',
    0.125: '1⁄8',
    0.375: '3⁄8',
    0.625: '5⁄8',
    0.875: '7⁄8',
    0.3333333333333333: '1⁄3',
    0.6666666666666666: '2⁄3',
  };
  
  if (Number.isInteger(num)) {
    return num.toString();
  }
  
  if (fractionMap[num]) {
    return fractionMap[num];
  }
  
  const wholePart = Math.floor(num);
  const decimalPart = num - wholePart;
  
  if (wholePart > 0 && fractionMap[decimalPart]) {
    return `${wholePart} ${fractionMap[decimalPart]}`;
  }
  
  return num.toString();
}

export { formatFraction };
export default IngredientInput; 