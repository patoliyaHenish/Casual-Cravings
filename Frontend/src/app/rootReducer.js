import {combineReducers} from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"
import loadingReducer from "../features/loadingSlice"
import { authApi } from "../features/api/authApi";
import { categoryApi } from "../features/api/categoryApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    auth: authReducer,
    loading: loadingReducer,
})

export default rootReducer;