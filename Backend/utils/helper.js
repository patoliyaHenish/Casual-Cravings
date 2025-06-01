import * as yup from 'yup';
import multer from 'multer';

export const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors,
        });
    }
};

export const upload = multer();

export const extractProfilePicInfo = (file) => {
    let profilePicFileName = null;
    let profilePicContentType = null;
    let profilePicData = null;
    let profilePicSize = null;

    if (file) {
        profilePicFileName = file.originalname;
        profilePicContentType = file.mimetype;
        profilePicData = file.buffer;
        profilePicSize = file.size;
    }

    return {
        profilePicFileName,
        profilePicContentType,
        profilePicData,
        profilePicSize
    };
};