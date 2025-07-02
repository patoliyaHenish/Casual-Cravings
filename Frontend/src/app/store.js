import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "../features/api/authApi";
import { categoryApi } from "../features/api/categoryApi";
import { subCategoryApi } from "../features/api/subCategoryApi";
import { ingredientApi } from "../features/api/ingredientApi";

export const appStore = configureStore({
    reducer: rootReducer,
    middleware: (defaultMiddleware) =>
        defaultMiddleware().concat(
            authApi.middleware,
            categoryApi.middleware,
            subCategoryApi.middleware,
            ingredientApi.middleware
        )
});

const initializeApp = async () => {
  await appStore.dispatch(
    authApi.endpoints.myProfile.initiate({}, { forceRefetch: true })
  );
};
initializeApp();
