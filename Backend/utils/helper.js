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

export const storeFile = async (pool, {
    tableName,
    tableId,
    fieldName,
    fileName,
    contentType,
    fileData,
    fileSize
}) => {
    if (fileName && contentType && fileData && fileSize) {
        const buffer = Buffer.from(fileData, 'base64');
        try {
            await pool.query(
                `INSERT INTO store_files 
                    (table_name, table_id, field_name, file_name, content_type, file_data, file_size)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    tableName,
                    tableId,
                    fieldName,
                    fileName,
                    contentType,
                    buffer,
                    fileSize
                ]
            );
            console.log(`File stored for ${tableName} id:`, tableId);
        } catch (fileErr) {
            console.error('Error storing file:', fileErr);
            throw fileErr;
        }
    }
};