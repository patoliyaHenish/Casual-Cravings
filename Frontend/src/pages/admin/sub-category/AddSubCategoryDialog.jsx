import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { useGetRecipeCategoriesQuery } from '../../../features/api/categoryApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    categoryId: Yup.number().required('Select any one Category'),
    name: Yup.string()
        .required('Sub-category name is required')
        .min(2, 'Sub-category name must be at least 2 characters')
        .max(100, 'Sub-category name must be at most 100 characters'),
    description: Yup.string()
        .required('Sub-category Description is required')
        .min(10, 'Sub-category description must be at least 10 characters'),
    image: Yup.mixed()
        .required('Image is required')
        .test('fileSize', 'File size is too large', (value) => {
            if (!value) return true;
            return value.size <= 2 * 1024 * 1024;
        })
        .test('fileType', 'Unsupported file format', (value) => {
            if (!value) return true;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            return allowedTypes.includes(value.type);
        }),
});

const AddSubCategoryDialog = ({
    open,
    onClose,
    onSubmit,
    isLoading,
}) => {
    const fileInputRef = useRef();
    const [dragActive, setDragActive] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const { data: categoriesData, isLoading: isCategoriesLoading } = useGetRecipeCategoriesQuery({ search: '', page: 1, limit: 100 });
    const categories = categoriesData?.data || [];

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            categoryId: '',
            image: null,
        },
        validationSchema,
        onSubmit: (values, helpers) => {
            const submitValues = {
                ...values,
                categoryId: Number(values.categoryId),
            };
            onSubmit(submitValues, helpers);
            helpers.resetForm();
            setImagePreview(null);
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        formik.setFieldValue('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            formik.setFieldValue('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={(event, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                onClose();
            }}
            maxWidth="sm" 
            fullWidth
        >
            <DialogTitle>Add Recipe Sub-Category</DialogTitle>
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <DialogContent dividers>
                    <TextField
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        margin="normal"
                        required
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        required
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                    />
                    <TextField
                        select
                        label="Category"
                        name="categoryId"
                        value={formik.values.categoryId ?? ''}
                        onChange={e => formik.setFieldValue('categoryId', Number(e.target.value))}
                        onBlur={formik.handleBlur}
                        fullWidth
                        margin="normal"
                        required
                        disabled={isCategoriesLoading}
                        error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                        helperText={formik.touched.categoryId && formik.errors.categoryId}
                    >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat.category_id} value={cat.category_id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <div
                        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer mb-2 mt-4 transition-colors ${
                            dragActive 
                                ? 'border-[#f59e42] bg-[#fff7ed]' 
                                : 'border-gray-300 bg-gray-50'
                        }`}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Button
                            variant="outlined"
                            component="span"
                        >
                            {formik.values.image ? "Change Image" : "Upload Image"}
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <div className="mt-2 text-gray-500 text-sm">
                            or drag and drop image here
                        </div>
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-20 w-20 object-cover rounded mt-2 block mx-auto"
                            />
                        )}
                        {formik.touched.image && formik.errors.image && (
                            <div className="text-red-500 mt-2 text-xs">
                                {formik.errors.image}
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="warning"
                        disabled={isLoading || !formik.isValid || !formik.dirty}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Add'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddSubCategoryDialog;