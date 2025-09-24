import { Router } from 'express'
import {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  setHeroBanner,
  getHeroBanner
} from '../controllers/banner.controller.js'
import isAuthenticated from '../middlewares/auth.middleware.js'
import { checkRole, validate } from '../utils/helper.js'
import { createBannerValidation, updateBannerValidation } from '../validations/bannerValidation.js'

const router = Router()

router.post('/', isAuthenticated, checkRole(['admin']), validate(createBannerValidation), createBanner)
router.put('/:id', isAuthenticated, checkRole(['admin']), validate(updateBannerValidation), updateBanner)
router.delete('/:id', isAuthenticated, checkRole(['admin']), deleteBanner)
router.get('/', isAuthenticated, checkRole(['admin']), getAllBanners)
router.get('/hero', getHeroBanner)
router.post('/:id/set-hero', isAuthenticated, checkRole(['admin']), setHeroBanner)
router.get('/:id', isAuthenticated, checkRole(['admin']), getBannerById)

export default router 