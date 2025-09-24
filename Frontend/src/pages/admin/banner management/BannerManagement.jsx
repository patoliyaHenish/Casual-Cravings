import React, { useState, useEffect, useRef } from 'react'
import { useGetBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation, useSetHeroBannerMutation } from '../../../features/api/bannerApi'
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Stack, Typography, IconButton, Autocomplete, Chip, Paper, Switch, Tooltip } from '@mui/material'
import { toast } from 'react-toastify'
import { DataTable, PageHeader, ActionButtons, ConfirmDialog } from '../../../components/common'
import BannerTableSkeleton from '../../../components/BannerTableSkeleton'
import CloseIcon from '@mui/icons-material/Close'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FileUploadField from '../../../components/FileUploadField'
import { useGetMostUsedKeywordsQuery } from '../../../features/api/recipeApi'
import { convertImageFileToBase64, getImageUrl } from '../../../utils/helper'
import VisibilityIcon from '@mui/icons-material/Visibility'
import StarIcon from '@mui/icons-material/Star'

const bannerSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  button_text: Yup.string().required('Button text is required'),
  keywords: Yup.array().of(Yup.string().trim().required()).min(1, 'At least one keyword is required'),
})

const BannerManagement = () => {
  const { data, isLoading, isError } = useGetBannersQuery()
  const [createBanner, { isLoading: isAdding }] = useCreateBannerMutation()
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation()
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation()
  const [setHeroBanner, { isLoading: isSettingHero }] = useSetHeroBannerMutation()
  const [addOpen, setAddOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', button_text: '', keywords: [], image: null, is_hero: false })
  const [deleteId, setDeleteId] = useState(null)
  const [addImagePreview, setAddImagePreview] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const addImageUrlRef = useRef(null)
  const editImageUrlRef = useRef(null)
  const { data: keywordSuggestionsRaw } = useGetMostUsedKeywordsQuery()
  const [viewBanner, setViewBanner] = useState(null)

  useEffect(() => {
    if (!editId) setEditForm({ title: '', button_text: '', keywords: [], image: null, is_hero: false })
    else {
      const banner = data?.find(b => b.banner_id === editId)
      if (banner) setEditForm({
        title: banner.title,
        button_text: banner.button_text,
        keywords: banner.keywords || [],
        image: null,
        imagePreview: getImageUrl(banner, 'banner'),
        is_hero: banner.is_hero || false
      })
      setEditImagePreview(getImageUrl(banner, 'banner') || null)
    }
  }, [editId, data])

  useEffect(() => {
    return () => {
      if (addImageUrlRef.current) URL.revokeObjectURL(addImageUrlRef.current)
      if (editImageUrlRef.current) URL.revokeObjectURL(editImageUrlRef.current)
    }
  }, [])

  if (isError) return <div className="text-red-500 text-center mt-10">Failed to load banners.</div>

  const banners = data || []

  const handleAddSubmit = async (values, { setSubmitting, resetForm }) => {
    let imageData = null
    if (values.image) {
      try {
        imageData = await convertImageFileToBase64(values.image)
      } catch {
        toast.error('Failed to process image')
        setSubmitting(false)
        return
      }
    }
    
    const bannerData = {
      title: values.title,
      button_text: values.button_text,
      keywords: values.keywords,
      is_hero: values.is_hero,
      imageData: imageData
    }
    
    try {
      await createBanner(bannerData).unwrap()
      toast.success('Banner added successfully')
      setAddOpen(false)
      resetForm()
    } catch {
      toast.error('Failed to add banner')
    }
    setSubmitting(false)
  }

  const handleEditSubmit = async (values, { setSubmitting }) => {
    let imageData = null
    if (values.image instanceof File) {
      try {
        imageData = await convertImageFileToBase64(values.image)
      } catch {
        toast.error('Failed to process image')
        setSubmitting(false)
        return
      }
    }
    
    const bannerData = {
      title: values.title,
      button_text: values.button_text,
      keywords: values.keywords,
      is_hero: values.is_hero,
      imageData: imageData
    }
    
    try {
      await updateBanner({ id: editId, inputData: bannerData }).unwrap()
      toast.success('Banner updated successfully')
      setEditId(null)
    } catch {
      toast.error('Failed to update banner')
    }
    setSubmitting(false)
  }

  const handleSetHero = async (id) => {
    try {
      await setHeroBanner(id).unwrap()
      toast.success('Set as hero banner')
    } catch {
      toast.error('Failed to set hero banner')
    }
  }

  const columns = [
    { header: '#', field: 'index', render: (row, idx) => idx + 1 },
    { header: 'Title', field: 'title' },
    { header: 'Button Text', field: 'button_text' },
    { header: 'Keywords', field: 'keywords', render: row => (row.keywords || []).join(', ') },
    { header: 'Image', field: 'image_url', render: row => getImageUrl(row, 'banner') ? <img src={getImageUrl(row, 'banner')} alt="banner" className="h-12 w-20 object-cover rounded" /> : <span className="text-gray-400">No Image</span> },
    {
      header: 'Hero',
      field: 'is_hero',
      render: row => (
        <Tooltip title={row.is_hero ? 'Current Hero Banner' : 'Set as Hero'}>
          <span>
            <IconButton
              color={row.is_hero ? 'warning' : 'default'}
              disabled={row.is_hero || isSettingHero}
              onClick={() => handleSetHero(row.banner_id)}
              size="small"
            >
              <StarIcon />
            </IconButton>
          </span>
        </Tooltip>
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      render: row => (
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton onClick={() => setViewBanner(row)}><VisibilityIcon /></IconButton>
          <ActionButtons onEdit={() => setEditId(row.banner_id)} onDelete={() => setDeleteId(row.banner_id)} />
        </div>
      )
    }
  ]

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteBanner(deleteId).unwrap()
        toast.success('Banner deleted successfully')
        setDeleteId(null)
      } catch {
        toast.error('Failed to delete banner')
        setDeleteId(null)
      }
    }
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 mt-16 max-w-full">
      <PageHeader title="Manage Banners">
        <Button variant="contained" color="primary" onClick={() => setAddOpen(true)} className="!bg-orange-500 hover:!bg-orange-600 w-full sm:w-auto">Add Banner</Button>
      </PageHeader>
      <div 
        className="overflow-x-auto rounded shadow min-h-[180px] flex items-center justify-center"
        style={{
          backgroundColor: 'var(--card-bg)',
          transition: 'background-color 0.3s ease'
        }}
      >
        {isLoading ? (
          <BannerTableSkeleton />
        ) : (
          <DataTable columns={columns} data={banners} />
        )}
      </div>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: 'rounded-xl w-full max-w-xs sm:max-w-md md:max-w-lg' }}>
        <DialogTitle className="flex items-center justify-between px-2 sm:px-4">
          <span className="text-base sm:text-lg">Add Banner</span>
          <IconButton onClick={() => setAddOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Formik
          initialValues={{ title: '', button_text: '', keywords: [], image: null, is_hero: false }}
          validationSchema={bannerSchema}
          onSubmit={handleAddSubmit}
          validateOnBlur={true}
          validateOnChange={true}
        >
          {({ values, errors, touched, handleChange, setFieldValue, isSubmitting, isValid }) => {
            const keywordOptions = Array.isArray(keywordSuggestionsRaw?.data)
              ? keywordSuggestionsRaw.data
                  .filter(k => !values.keywords.includes(k.keyword))
                  .map(k => ({ label: `${k.keyword} (${k.usage_count})`, value: k.keyword }))
              : []
            const handleFileChange = (file) => {
              setFieldValue('image', file)
              if (addImageUrlRef.current) URL.revokeObjectURL(addImageUrlRef.current)
              if (file) {
                const url = URL.createObjectURL(file)
                addImageUrlRef.current = url
                setAddImagePreview(url)
              } else {
                setAddImagePreview(null)
              }
            }
            return (
              <Form>
                <DialogContent className="px-2 sm:px-4">
                  <Stack spacing={2}>
                    <TextField name="title" label="Title" fullWidth required size="small" className="bg-white" value={values.title} onChange={handleChange} error={touched.title && Boolean(errors.title)} helperText={touched.title && errors.title} inputProps={{ className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.title && Boolean(errors.title) }} />
                    <TextField name="button_text" label="Button Text" fullWidth required size="small" className="bg-white" value={values.button_text} onChange={handleChange} error={touched.button_text && Boolean(errors.button_text)} helperText={touched.button_text && errors.button_text} inputProps={{ className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.button_text && Boolean(errors.button_text) }} />
                    <Autocomplete
                      multiple
                      options={keywordOptions}
                      getOptionLabel={option => typeof option === 'string' ? option : option.label}
                      value={values.keywords.map(val => {
                        const found = keywordOptions.find(opt => opt.value === val)
                        return found ? found : { label: val, value: val }
                      })}
                      onChange={(_, newValue) => setFieldValue('keywords', newValue.map(v => (typeof v === 'string' ? v : v.value)))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip variant="outlined" label={option.label} {...getTagProps({ index })} key={option.value || option.label} />
                        ))
                      }
                      PaperComponent={(props) => <Paper {...props} className="custom-scrollbar" />}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Keywords"
                          fullWidth
                          size="small"
                          className="bg-white"
                          error={touched.keywords && Boolean(errors.keywords)}
                          helperText={touched.keywords && errors.keywords}
                          inputProps={{ ...params.inputProps, className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.keywords && Boolean(errors.keywords) }}
                        />
                      )}
                    />
                    <FileUploadField label="Banner Image" value={values.image} onChange={handleFileChange} accept="image/*" />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch
                        checked={values.is_hero}
                        onChange={(_, checked) => setFieldValue('is_hero', checked)}
                        color="warning"
                        inputProps={{ 'aria-label': 'Set as hero banner' }}
                      />
                      <Typography variant="body2">Set as Hero Banner</Typography>
                    </Box>
                    {addImagePreview && (
                      <img src={addImagePreview} alt="preview" className="h-16 w-full object-cover rounded mt-2" />
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions className="flex flex-col sm:flex-row gap-2 px-2 sm:px-4 pb-4">
                  <Button onClick={() => setAddOpen(false)} color="inherit" variant="outlined" className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={isAdding || isSubmitting || !isValid} className="!bg-orange-500 hover:!bg-orange-600 w-full sm:w-auto">{isAdding || isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Add'}</Button>
                </DialogActions>
              </Form>
            )
          }}
        </Formik>
      </Dialog>
      <Dialog open={!!editId} onClose={() => setEditId(null)} maxWidth="sm" fullWidth PaperProps={{ className: 'rounded-xl w-full max-w-xs sm:max-w-md md:max-w-lg' }}>
        <DialogTitle className="flex items-center justify-between px-2 sm:px-4">
          <span className="text-base sm:text-lg">Edit Banner</span>
          <IconButton onClick={() => setEditId(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Formik
          enableReinitialize
          initialValues={{
            title: editForm.title,
            button_text: editForm.button_text,
            keywords: editForm.keywords,
            image: null,
            is_hero: editForm.is_hero
          }}
          validationSchema={bannerSchema}
          onSubmit={handleEditSubmit}
          validateOnBlur={true}
          validateOnChange={true}
        >
          {({ values, errors, touched, handleChange, setFieldValue, isSubmitting, isValid }) => {
            const keywordOptions = Array.isArray(keywordSuggestionsRaw?.data)
              ? keywordSuggestionsRaw.data
                  .filter(k => !values.keywords.includes(k.keyword))
                  .map(k => ({ label: `${k.keyword} (${k.usage_count})`, value: k.keyword }))
              : []
            const handleFileChange = (file) => {
              setFieldValue('image', file)
              if (editImageUrlRef.current) URL.revokeObjectURL(editImageUrlRef.current)
              if (file) {
                const url = URL.createObjectURL(file)
                editImageUrlRef.current = url
                setEditImagePreview(url)
              } else {
                setEditImagePreview(editForm.imagePreview || null)
              }
            }
            return (
              <Form>
                <DialogContent className="px-2 sm:px-4">
                  <Stack spacing={2}>
                    <TextField name="title" label="Title" fullWidth required size="small" className="bg-white" value={values.title} onChange={handleChange} error={touched.title && Boolean(errors.title)} helperText={touched.title && errors.title} inputProps={{ className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.title && Boolean(errors.title) }} />
                    <TextField name="button_text" label="Button Text" fullWidth required size="small" className="bg-white" value={values.button_text} onChange={handleChange} error={touched.button_text && Boolean(errors.button_text)} helperText={touched.button_text && errors.button_text} inputProps={{ className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.button_text && Boolean(errors.button_text) }} />
                    <Autocomplete
                      multiple
                      options={keywordOptions}
                      getOptionLabel={option => typeof option === 'string' ? option : option.label}
                      value={values.keywords.map(val => {
                        const found = keywordOptions.find(opt => opt.value === val)
                        return found ? found : { label: val, value: val }
                      })}
                      onChange={(_, newValue) => setFieldValue('keywords', newValue.map(v => (typeof v === 'string' ? v : v.value)))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip variant="outlined" label={option.label} {...getTagProps({ index })} key={option.value || option.label} />
                        ))
                      }
                      PaperComponent={(props) => <Paper {...props} className="custom-scrollbar" />}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Keywords"
                          fullWidth
                          size="small"
                          className="bg-white"
                          error={touched.keywords && Boolean(errors.keywords)}
                          helperText={touched.keywords && errors.keywords}
                          inputProps={{ ...params.inputProps, className: 'text-sm sm:text-base', 'aria-required': 'true', 'aria-invalid': touched.keywords && Boolean(errors.keywords) }}
                        />
                      )}
                    />
                    <FileUploadField label="Banner Image" value={values.image} onChange={handleFileChange} accept="image/*" previewUrl={editForm.imagePreview} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch
                        checked={values.is_hero}
                        onChange={(_, checked) => setFieldValue('is_hero', checked)}
                        color="warning"
                        inputProps={{ 'aria-label': 'Set as hero banner' }}
                      />
                      <Typography variant="body2">Set as Hero Banner</Typography>
                    </Box>
                    {editImagePreview && (
                      <img src={editImagePreview} alt="preview" className="h-16 w-full object-cover rounded mt-2" />
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions className="flex flex-col sm:flex-row gap-2 px-2 sm:px-4 pb-4">
                  <Button onClick={() => setEditId(null)} color="inherit" variant="outlined" className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={isUpdating || isSubmitting || !isValid} className="!bg-orange-500 hover:!bg-orange-600 w-full sm:w-auto">{isUpdating || isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Update'}</Button>
                </DialogActions>
              </Form>
            )
          }}
        </Formik>
      </Dialog>
      <Dialog open={!!viewBanner} onClose={() => setViewBanner(null)} maxWidth="sm" fullWidth PaperProps={{ className: 'rounded-xl w-full max-w-xs sm:max-w-md md:max-w-lg' }}>
        <DialogTitle className="flex items-center justify-between px-2 sm:px-4">
          <span className="text-base sm:text-lg">Banner Details</span>
          <IconButton onClick={() => setViewBanner(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="px-2 sm:px-4">
          {viewBanner && (
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Title:</b> {viewBanner.title}</Typography>
              <Typography variant="subtitle1"><b>Button Text:</b> {viewBanner.button_text}</Typography>
              <Typography variant="subtitle1"><b>Keywords:</b> {(viewBanner.keywords || []).join(', ')}</Typography>
              {viewBanner.is_hero && <Typography variant="subtitle1" color="warning.main"><b>Hero Banner</b></Typography>}
              {getImageUrl(viewBanner, 'banner') && <img src={getImageUrl(viewBanner, 'banner')} alt="banner" className="h-32 w-full object-cover rounded" />}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Banner?" description="Are you sure you want to delete this banner?" loading={isDeleting} />
    </div>
  )
}

export default BannerManagement 