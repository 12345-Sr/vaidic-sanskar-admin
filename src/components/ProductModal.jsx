import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export const STORE_CATEGORIES = [
  {
    id: 'kits',
    name: 'Pooja Kits',
    nameHi: 'पूजा किट्स',
    icon: '📦',
    image: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'diya',
    name: 'Diya & Deepak',
    nameHi: 'दीपक व आरती',
    icon: '🪔',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'havan',
    name: 'Havan Samagri',
    nameHi: 'हवन सामग्री',
    icon: '🔥',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'dhoop',
    name: 'Dhoop & Agarbatti',
    nameHi: 'धूप व अगरबत्ती',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'murti',
    name: 'Murtis & Idols',
    nameHi: 'मूर्तियां एवं विग्रह',
    icon: '🕉️',
    image: 'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'bartan',
    name: 'Brass Utensils',
    nameHi: 'पीतल के बर्तन',
    icon: '🥣',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mala',
    name: 'Rudraksha & Mala',
    nameHi: 'रुद्राक्ष एवं माला',
    icon: '📿',
    image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'vastra',
    name: 'Vastra & Aasan',
    nameHi: 'वस्त्र एवं आसन',
    icon: '👘',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'pavitra',
    name: 'Gangajal & Dravya',
    nameHi: 'कलश एवं गंगाजल',
    icon: '💧',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'yantra',
    name: 'Yantra & Jyotish',
    nameHi: 'यंत्र एवं वास्तु',
    icon: '⭐',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'books',
    name: 'Vedic Books',
    nameHi: 'धार्मिक पुस्तकें',
    icon: '📖',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'prasad',
    name: 'Prasad & Bhog',
    nameHi: 'प्रसाद एवं भोग',
    icon: '🍯',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80',
  },
];

export default function ProductModal({ product, onClose, onSave }) {
  const isEdit = Boolean(product && product.id);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Core state - start with NO predefined photos for clean live product creation
  const [name, setName] = useState('');
  const [category, setCategory] = useState('kits');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('50');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [description, setDescription] = useState('');

  // Secondary/Advanced fields
  const [merchant, setMerchant] = useState('Vaidic Sanskar Official');
  const [status, setStatus] = useState('Live');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || product.title || '');
      setCategory(product.category || product.cat || 'kits');
      setPrice(String(product.price || ''));
      setMrp(String(product.mrp || ''));
      setStock(String(product.stock != null ? product.stock : '50'));
      const initialImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image || product.imageUrl].filter(Boolean);
      setImages(initialImages);
      setImage(initialImages[0] || '');
      setDescription(product.description || product.significance || '');
      setMerchant(product.merchant || 'Vaidic Sanskar Official');
      setStatus(product.status || 'Live');
    } else {
      setName('');
      setCategory('kits');
      setPrice('');
      setMrp('');
      setStock('50');
      setImage('');
      setImages([]);
      setDescription('');
      setMerchant('Vaidic Sanskar Official');
      setStatus('Live');
      setShowAdvanced(false);
      setShowUrlInput(false);
    }
    setError('');
  }, [product]);

  // Handle image upload from computer (multiple angles supported with direct Cloud/Server upload)
  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} to storage...`);
    setError('');

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', 'vaidic_sanskar_products');

      let uploadedUrls = [];

      // 1. Try uploading via Admin API client
      try {
        const res = await client.post('upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res?.urls && res.urls.length) {
          uploadedUrls = res.urls;
        } else if (res?.url) {
          uploadedUrls = [res.url];
        }
      } catch (clientErr) {
        console.warn('client.post upload failed, trying fallback endpoints:', clientErr);
      }

      // 2. Direct fallback endpoints if client was intercepted
      if (uploadedUrls.length === 0) {
        const fallbackEndpoints = [
          'http://localhost:4000/api/admin/upload',
          'http://localhost:4000/api/upload',
          'http://localhost:4000/api/partner/upload',
          '/api/upload',
          '/api/partner/upload',
        ];
        for (const ep of fallbackEndpoints) {
          try {
            const resp = await fetch(ep, { method: 'POST', body: formData });
            if (resp.ok) {
              const data = await resp.json();
              if (data?.urls && data.urls.length) {
                uploadedUrls = data.urls;
                break;
              } else if (data?.url) {
                uploadedUrls = [data.url];
                break;
              }
            }
          } catch (_) {}
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => {
          const merged = [...prev, ...uploadedUrls];
          setImage(merged[0] || '');
          return merged;
        });
      } else {
        throw new Error('Upload failed: Storage server did not return image URLs.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError('Upload failed: ' + (err.message || 'Please check backend server'));
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const addPhotoFromUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const splitUrls = newPhotoUrl
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/'));

    if (splitUrls.length === 0) {
      setError('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    setImages((prev) => {
      const updated = [...prev, ...splitUrls];
      setImage(updated[0] || '');
      return updated;
    });
    setNewPhotoUrl('');
    setError('');
  };

  const removePhoto = (idx) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setImage(updated[0] || '');
      return updated;
    });
  };

  const setAsCover = (idx) => {
    setImages((prev) => {
      const selected = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      const reordered = [selected, ...rest];
      setImage(selected);
      return reordered;
    });
  };

  const movePhoto = (idx, direction) => {
    setImages((prev) => {
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      setImage(copy[0] || '');
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a product name.');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setError('Please enter a valid price in ₹ (e.g. 450).');
      return;
    }

    const finalImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    if (finalImages.length === 0) {
      setError('Please take a live photo or upload at least one product photo.');
      return;
    }

    const numMrp = mrp ? Number(mrp) : Math.round(numPrice * 1.25);
    const catObj = STORE_CATEGORIES.find((c) => c.id === category) || STORE_CATEGORIES[0];

    const payload = {
      ...(product || {}),
      name: cleanName,
      title: cleanName,
      category,
      cat: category,
      categoryName: catObj.name,
      price: numPrice,
      mrp: numMrp,
      stock: Number(stock) || 1,
      image: finalImages[0],
      imageUrl: finalImages[0],
      images: finalImages,
      description: description.trim() || '100% pure and authentic Vedic spiritual item.',
      significance: description.trim() || '100% pure and authentic Vedic spiritual item.',
      status,
      isKit: category === 'kits',
      merchant: merchant.trim() || 'Vaidic Sanskar Official',
      rating: product?.rating || 5.0,
      reviewsCount: product?.reviewsCount || 12,
      variants: [
        {
          id: `v-${product?.id || Date.now()}`,
          name: 'Standard Pack',
          price: numPrice,
          mrp: numMrp,
          stock: Number(stock) || 1,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const discount = price && mrp && Number(mrp) > Number(price)
    ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 10, 5, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          padding: '24px 26px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛍️</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--fg)' }}>
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h2>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Instantly visible in Devotee Mobile App E-Store
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--crit-soft)',
              color: 'var(--crit)',
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Product Photography Section (Live Photo & Multiple Photos) */}
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: 'var(--surface2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Hidden file inputs for Camera and Gallery */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--fg)', display: 'block' }}>
                  📸 Product Photos ({images.length})
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>
                  First photo is your Main Cover. Upload more photos for devotee swipe gallery.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    backgroundColor: uploading ? '#9ca3af' : '#8B1A1A',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(139, 26, 26, 0.25)',
                  }}
                >
                  📷 Take Live Photo
                </button>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    backgroundColor: uploading ? '#9ca3af' : 'var(--accent, #e67e00)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(230, 126, 0, 0.25)',
                  }}
                >
                  {uploading ? '⏳ Uploading...' : '📁 Upload Photos'}
                </button>
              </div>
            </div>

            {/* Empty State: Prompt user to upload or take live photo */}
            {images.length === 0 && !uploading && (
              <div
                style={{
                  padding: '24px 16px',
                  border: '2px dashed var(--border)',
                  borderRadius: 12,
                  textAlign: 'center',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 32 }}>📸</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
                  No product photos added yet
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', maxWidth: 340 }}>
                  Take a live photo using your camera or choose multiple pictures from your computer or phone.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      backgroundColor: '#8B1A1A',
                      color: '#fff',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    📷 Take Live Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      backgroundColor: 'var(--accent, #e67e00)',
                      color: '#fff',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    📁 Choose Photos
                  </button>
                </div>
              </div>
            )}

            {/* Photos Strip (Cover & Additional Photos) */}
            {(images.length > 0 || uploading) && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {images.map((imgUri, idx) => (
                  <div
                    key={`img-photo-${idx}`}
                    style={{
                      position: 'relative',
                      width: 86,
                      height: 86,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: idx === 0 ? '2.5px solid #d97706' : '1px solid var(--border)',
                      backgroundColor: 'var(--surface)',
                      flexShrink: 0,
                      boxShadow: idx === 0 ? '0 3px 10px rgba(217, 119, 6, 0.3)' : 'none',
                    }}
                  >
                    <img
                      src={imgUri}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Main Cover vs Photo Index Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: 3,
                        backgroundColor: idx === 0 ? '#d97706' : 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: 8.5,
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 4,
                        letterSpacing: 0.3,
                      }}
                    >
                      {idx === 0 ? '⭐ MAIN COVER' : `Photo ${idx + 1}`}
                    </div>

                    {/* Move Left / Right Buttons */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        right: 3,
                        display: 'flex',
                        gap: 2,
                      }}
                    >
                      {idx > 0 && (
                        <button
                          type="button"
                          title="Move photo left"
                          onClick={() => movePhoto(idx, -1)}
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            border: 'none',
                            fontSize: 9,
                            borderRadius: 3,
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                        >
                          ◀
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          title="Move photo right"
                          onClick={() => movePhoto(idx, 1)}
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            border: 'none',
                            fontSize: 9,
                            borderRadius: 3,
                            padding: '2px 4px',
                            cursor: 'pointer',
                          }}
                        >
                          ▶
                        </button>
                      )}
                    </div>

                    {/* Set as Cover button */}
                    {idx !== 0 && (
                      <button
                        type="button"
                        title="Set as Main Cover photo"
                        onClick={() => setAsCover(idx)}
                        style={{
                          position: 'absolute',
                          bottom: 3,
                          left: 3,
                          backgroundColor: '#d97706',
                          color: '#fff',
                          border: 'none',
                          fontSize: 8,
                          fontWeight: 700,
                          borderRadius: 3,
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        Set as Main
                      </button>
                    )}

                    {/* Delete photo button */}
                    <button
                      type="button"
                      title="Remove this photo"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        backgroundColor: 'rgba(220, 38, 38, 0.9)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 9,
                        width: 17,
                        height: 17,
                        borderRadius: 9,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Uploading Progress Box */}
                {uploading && (
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: 10,
                      border: '2px dashed var(--accent, #e67e00)',
                      backgroundColor: 'rgba(230, 126, 0, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>⏳</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--accent, #e67e00)' }}>
                      Uploading…
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Direct URL input to add photo via link */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="url"
                placeholder="Or paste photo link (supports multiple URLs separated by comma)..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPhotoFromUrl();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--fg)',
                  fontSize: 12,
                }}
              />
              <button
                type="button"
                onClick={addPhotoFromUrl}
                style={{
                  padding: '7px 14px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--fg)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add URL
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 5 }}>
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pure Brass Panchaarti Diya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface2)',
                color: 'var(--fg)',
                fontSize: 14,
                fontWeight: 600,
              }}
            />
          </div>

          {/* Category & Selling Price in 1 Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 5 }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--fg)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {STORE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 5 }}>
                Selling Price (₹) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 10, fontWeight: 700, color: 'var(--muted)' }}>₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface2)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          </div>

          {/* MRP & Stock in 1 Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                MRP / Strikethrough (₹) <span style={{ fontSize: 11 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 9, fontWeight: 600, color: 'var(--muted)' }}>₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="1200"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 28px',
                    borderRadius: 9,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface2)',
                    color: 'var(--fg)',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
                Stock Units Available
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--fg)',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>
              Product Details / Description
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 100% pure brass Panchaarti Diya. Ideal for daily evening prayers and temple rituals."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 9,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface2)',
                color: 'var(--fg)',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Expandable Advanced Options (Merchant, Status) */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: 0,
              }}
            >
              <span>{showAdvanced ? '▼' : '▶'}</span>
              <span>Extra Options (Merchant, Status)</span>
            </button>

            {showAdvanced && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 12,
                  backgroundColor: 'var(--surface2)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 4 }}>
                      Merchant / Brand
                    </label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--fg)',
                        fontSize: 12.5,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 4 }}>
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--fg)',
                        fontSize: 12.5,
                      }}
                    >
                      <option value="Live">🟢 Live (Visible)</option>
                      <option value="Low">🟡 Low Stock</option>
                      <option value="Out">🔴 Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 6,
              borderTop: '1px solid var(--border)',
              paddingTop: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #FFB24D, #E67E00)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(230, 126, 0, 0.35)',
              }}
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
