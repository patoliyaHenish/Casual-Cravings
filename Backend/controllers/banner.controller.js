import { pool } from '../config/db.js'
import {
  insertBannerQuery,
  updateBannerQuery,
  deleteBannerQuery,
  selectAllBannersQuery,
  selectBannerByIdQuery,
  selectActiveBannerQuery
} from '../query/banner.js'
import { uploadToClodinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import { uploadImageAndCleanup, safeDeleteLocalFile, deleteCloudinaryImageByUrl } from '../utils/helper.js'

export const createBanner = async (req, res) => {
  let imagePath = null
  try {
    const { title, button_text, keywords } = req.body
    let parsedKeywords = keywords
    if (typeof keywords === 'string') {
      try { parsedKeywords = JSON.parse(keywords) } catch { parsedKeywords = [keywords] }
    }
    let imageUrl = null
    if (req.files && req.files.bannerImage && req.files.bannerImage.length > 0) {
      imagePath = req.files.bannerImage[0].path
      imageUrl = await uploadImageAndCleanup(imagePath, 'banner_images', uploadToClodinary)
    }
    const result = await pool.query(insertBannerQuery, [title, imageUrl, button_text, parsedKeywords])
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (imagePath) await safeDeleteLocalFile(imagePath)
    res.status(500).json({ error: 'Failed to create banner' })
  }
}

export const updateBanner = async (req, res) => {
  let imagePath = null
  try {
    const { id } = req.params
    const { title, button_text, keywords } = req.body
    let parsedKeywords = keywords
    if (typeof keywords === 'string') {
      try { parsedKeywords = JSON.parse(keywords) } catch { parsedKeywords = [keywords] }
    }
    const existing = await pool.query(selectBannerByIdQuery, [id])
    let imageUrl = existing.rows[0]?.image_url || null
    if (req.files && req.files.bannerImage && req.files.bannerImage.length > 0) {
      imagePath = req.files.bannerImage[0].path
      await deleteCloudinaryImageByUrl(imageUrl, 'banner_images', deleteFromCloudinary)
      imageUrl = await uploadImageAndCleanup(imagePath, 'banner_images', uploadToClodinary)
    }
    const result = await pool.query(updateBannerQuery, [title, imageUrl, button_text, parsedKeywords, id])
    res.json(result.rows[0])
  } catch (err) {
    if (imagePath) await safeDeleteLocalFile(imagePath)
    res.status(500).json({ error: 'Failed to update banner' })
  }
}

export const deleteBanner = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await pool.query(selectBannerByIdQuery, [id])
    const imageUrl = existing.rows[0]?.image_url || null
    if (imageUrl) {
      await deleteCloudinaryImageByUrl(imageUrl, 'banner_images', deleteFromCloudinary)
    }
    const result = await pool.query(deleteBannerQuery, [id])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner' })
  }
}

export const getAllBanners = async (req, res) => {
  try {
    const result = await pool.query(selectAllBannersQuery)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' })
  }
}

export const getBannerById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(selectBannerByIdQuery, [id])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banner' })
  }
}

export const getActiveBanner = async (req, res) => {
  try {
    const result = await pool.query(selectActiveBannerQuery)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active banner' })
  }
} 