import { pool } from '../config/db.js'
import {
  insertBannerQuery,
  updateBannerQuery,
  deleteBannerQuery,
  selectAllBannersQuery,
  selectBannerByIdQuery,
  selectHeroBannerQuery,
  unsetAllHeroBannersQuery
} from '../query/banner.js'
import { insertFileStorage } from '../query/fileStorage.js'
import fs from 'fs'

export const createBanner = async (req, res) => {
  try {
    const { title, button_text, keywords, is_hero, imageData } = req.body
    let parsedKeywords = keywords
    if (typeof keywords === 'string') {
      try { parsedKeywords = JSON.parse(keywords) } catch { parsedKeywords = [keywords] }
    }
    const hero = is_hero === 'true' || is_hero === true
    if (hero) await pool.query(unsetAllHeroBannersQuery)
    const result = await pool.query(insertBannerQuery, [title, button_text, parsedKeywords, hero])
    const bannerId = result.rows[0].banner_id

    if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
      const imageBuffer = Buffer.from(imageData.image_data, 'base64')
      
      await pool.query(insertFileStorage, [
        'banner',
        bannerId,
        imageData.filename,
        imageData.mime_type,
        imageBuffer
      ])
    }

    const bannerResult = await pool.query(selectBannerByIdQuery, [bannerId])
    const bannerData = bannerResult.rows[0]
    res.status(201).json(bannerData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create banner' })
  }
}

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params
    const { title, button_text, keywords, is_hero, imageData } = req.body
    let parsedKeywords = keywords
    if (typeof keywords === 'string') {
      try { parsedKeywords = JSON.parse(keywords) } catch { parsedKeywords = [keywords] }
    }
    const hero = is_hero === 'true' || is_hero === true
    if (hero) await pool.query(unsetAllHeroBannersQuery)
    const result = await pool.query(updateBannerQuery, [title, button_text, parsedKeywords, hero, id])

    if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
      await pool.query('DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2', ['banner', id])
      
      const imageBuffer = Buffer.from(imageData.image_data, 'base64')
      
      await pool.query(insertFileStorage, [
        'banner',
        id,
        imageData.filename,
        imageData.mime_type,
        imageBuffer
      ])
    }

    const bannerResult = await pool.query(selectBannerByIdQuery, [id])
    const bannerData = bannerResult.rows[0]
    res.json(bannerData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner' })
  }
}

export const setHeroBanner = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(unsetAllHeroBannersQuery)
    await pool.query('UPDATE banner SET is_hero = true WHERE banner_id = $1', [id])
    const result = await pool.query(selectBannerByIdQuery, [id])
    const bannerData = result.rows[0]
    res.json(bannerData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to set hero banner' })
  }
}

export const getHeroBanner = async (req, res) => {
  try {
    const result = await pool.query(selectHeroBannerQuery)
    const bannerData = result.rows[0]
    res.json(bannerData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero banner' })
  }
}

export const deleteBanner = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2', ['banner', id])
    
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
    const bannerData = result.rows[0]
    res.json(bannerData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banner' })
  }
} 