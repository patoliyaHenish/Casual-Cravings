import {combineReducers} from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"
import loadingReducer from "../features/loadingSlice"
import { authApi } from "../features/api/authApi";
import { categoryApi } from "../features/api/categoryApi";
import { subCategoryApi } from "../features/api/subCategoryApi";
import { recipeApi } from "../features/api/recipeApi";
import { ingredientApi } from "../features/api/ingredientApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [subCategoryApi.reducerPath]: subCategoryApi.reducer,
    [recipeApi.reducerPath]: recipeApi.reducer,
    [ingredientApi.reducerPath]: ingredientApi.reducer,
    auth: authReducer,
    loading: loadingReducer,
})

export default rootReducer;