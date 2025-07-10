import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';

const FileUploadField = ({
  label = "Upload Image",
  value,
  onChange,
  error,
  helperText,
  preview,
  setPreview,
  accept = "image/*",
  required = false,
  style = {},
  ...props
}) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange(file);
    if (file && setPreview) setPreview(URL.createObjectURL(file));
    else if (setPreview) setPreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onChange(file);
      if (setPreview) setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      style={{
        border: dragActive ? '2px dashed #f59e42' : '2px dashed #ccc',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
        background: dragActive ? '#fff7ed' : '#fafafa',
        marginBottom: 8,
        marginTop: 16,
        cursor: 'pointer',
        ...style,
      }}
      onClick={() => fileInputRef.current.click()}
      {...props}
    >
      <Button variant="outlined" component="span">
        {value ? "Change Image" : label}
      </Button>
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
        or drag and drop image here
      </div>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="h-20 w-20 object-cover rounded mt-2"
          style={{ display: 'block', margin: '12px auto 0' }}
        />
      )}
      {error && (
        <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FileUploadField;