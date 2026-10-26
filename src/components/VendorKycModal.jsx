import React, { useState, useEffect } from 'react';
import { Pill, RoleChip, initials, roleColor } from './common';
import { toast } from './toast';

export default function VendorKycModal({ vendor, onClose, onApprove, onReject, onUpdate }) {
  if (!vendor) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...vendor });
  const [saving, setSaving] = useState(false);
  const [lightboxDoc, setLightboxDoc] = useState(null); // { url, title, sub }

  useEffect(() => {
    setFormData({ ...vendor });
  }, [vendor]);

  const photo = formData.photo || formData.profileImage || formData.avatar || formData.banner;
  const aadhaarFront = formData.aadhaarFront || formData.idCardFront || formData.docs?.aadhaarFront || formData.docs?.aadhaar;
  const aadhaarBack = formData.aadhaarBack || formData.idCardBack || formData.docs?.aadhaarBack;
  const panFront = formData.panFront || formData.panCardPhoto || formData.docs?.panFront || formData.docs?.pan;
  const certificate = formData.certificatePhoto || formData.degreePhoto || formData.docs?.certificate;

  const formatAadhaar = (val) => {
    if (!val) return '—';
    const digits = String(val).replace(/\D/g, '').slice(0, 12);
    if (!digits) return '—';
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const copyToClipboard = (text, label) => {
    if (!text || text === '—') return;
    try {
      navigator.clipboard.writeText(text);
      toast(`Copied ${label} to clipboard!`);
    } catch {
      toast(`Copied: ${text}`);
    }
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNestedChange = (parent, field, val) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: val,
      },
    }));
  };

  const handleSaveAmendments = async () => {
    setSaving(true);
    try {
      if (onUpdate) {
        await onUpdate(vendor.id, formData);
      }
      setIsEditing(false);
      toast('Vendor KYC details successfully amended & saved!');
    } catch (e) {
      toast('Failed to save amendments: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 14, 10, 0.72)',
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
          borderRadius: 22,
          width: '100%',
          maxWidth: 780,
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 28px 60px rgba(0,0,0,0.32)',
          padding: 26,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div
              style={{ position: 'relative', cursor: photo ? 'pointer' : 'default' }}
              onClick={() => photo && setLightboxDoc({ url: photo, title: `${formData.name || 'Vendor'} — Live Profile Photo` })}
              title={photo ? 'Click to inspect full photo' : ''}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={formData.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    objectFit: 'cover',
                    border: '2.5px solid var(--accent)',
                    boxShadow: '0 4px 12px rgba(230,126,0,0.25)',
                  }}
                />
              ) : (
                <span
                  className="av"
                  style={{
                    background: roleColor[formData.role] || 'var(--maroon)',
                    width: 58,
                    height: 58,
                    fontSize: 20,
                    borderRadius: 16,
                  }}
                >
                  {initials(formData.name)}
                </span>
              )}
              {photo && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                  }}
                >
                  🔍
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                {formData.name || 'Unnamed Partner'}
                {photo && (
                  <span
                    style={{
                      fontSize: 11,
                      background: 'var(--good-soft, #E4F3EA)',
                      color: 'var(--good, #1C9A5E)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✓ Live Photo
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                <span className="cellsub" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {formData.id}
                </span>
                <RoleChip r={formData.role} />
                <Pill s={formData.kyc || 'Pending'} />
                <Pill s={formData.status || 'Review'} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`act ${isEditing ? 'pri' : ''}`}
              style={{ padding: '7px 15px', fontSize: 13, fontWeight: 700 }}
            >
              {isEditing ? '👁 View Mode' : '✏️ Edit / Amend Details'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 10,
                width: 34,
                height: 34,
                fontSize: 16,
                cursor: 'pointer',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Section 1: Personal & Contact */}
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            1. संपर्क व व्यक्तिगत विवरण (Personal & Contact)
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              background: 'var(--surface2)',
              padding: 14,
              borderRadius: 12,
            }}
          >
            <div>
              <div className="cellsub">नाम (Full Name)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.name || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">भूमिका (Partner Role)</div>
              {isEditing ? (
                <select
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, background: 'var(--surface)' }}
                  value={formData.role || 'pandit'}
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <option value="pandit">Pandit (वैदिक कर्मकांडी)</option>
                  <option value="astro">Astrologer (ज्योतिष विशेषज्ञ)</option>
                  <option value="mandali">Mandali (भजन/संकीर्तन मंडली)</option>
                  <option value="merchant">Merchant (पूजा सामग्री विक्रेता)</option>
                </select>
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>{formData.role || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">फ़ोन नंबर (Phone)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {formData.phone || '—'}
                  {formData.phone && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.phone, 'Phone number')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                      title="Copy phone"
                    >
                      📋
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="cellsub">ईमेल (Email)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.email || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">मूल निवास / शहर (City)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Varanasi, UP"
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.city || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">सेवा दायरा (Service Radius)</div>
              {isEditing ? (
                <input
                  type="number"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.radius || formData.radiusKm || 15}
                  onChange={(e) => handleChange('radius', Number(e.target.value))}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.radius ? `${formData.radius} km` : '15 km'}</div>
              )}
            </div>

            {isEditing && (
              <div style={{ gridColumn: 'span 2' }}>
                <div className="cellsub">Live Photo / Avatar URL</div>
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.photo || ''}
                  onChange={(e) => handleChange('photo', e.target.value)}
                  placeholder="https://... (Cloudinary or Image URL)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Credentials & Experience */}
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            2. वैदिक योग्यता, अनुभव व संस्थान (Credentials & Experience)
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              background: 'var(--surface2)',
              padding: 14,
              borderRadius: 12,
            }}
          >
            <div>
              <div className="cellsub">गुरुकुल / संस्कृत संस्थान (Gurukul)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.gurukul || ''}
                  onChange={(e) => handleChange('gurukul', e.target.value)}
                  placeholder="e.g. Sampurnanand Sanskrit Vishwavidyalaya"
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.gurukul || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">शास्त्रीय उपाधि / डिग्री (Degree)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.degree || ''}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="e.g. Shastri, Acharya"
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.degree || '—'}</div>
              )}
            </div>

            <div>
              <div className="cellsub">अनुभव वर्ष (Experience in Years)</div>
              {isEditing ? (
                <input
                  type="number"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.experienceYears || formData.experience || 5}
                  onChange={(e) => handleChange('experienceYears', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>
                  {formData.experienceYears ? `${formData.experienceYears} वर्ष` : '—'}
                </div>
              )}
            </div>

            <div>
              <div className="cellsub">संबद्ध मंडली (Mandali)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.mandali || ''}
                  onChange={(e) => handleChange('mandali', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2 }}>{formData.mandali || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Identity & KYC Documents (Aadhaar, PAN, Live Photo) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted)',
                margin: 0,
                fontWeight: 700,
              }}
            >
              3. पहचान व केवाईसी दस्तावेज़ (Identity & KYC Document Verification)
            </h4>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: formData.kyc === 'Verified' ? 'var(--good)' : 'var(--warn)',
                background: formData.kyc === 'Verified' ? 'var(--good-soft)' : 'var(--warn-soft)',
                padding: '2px 8px',
                borderRadius: 8,
              }}
            >
              {formData.kyc === 'Verified' ? '✓ UIDAI & IT Dept Verified' : '⏳ Verification Pending'}
            </span>
          </div>

          <div style={{ background: 'var(--surface2)', padding: 16, borderRadius: 14 }}>
            {/* ID Numbers Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                paddingBottom: 14,
                borderBottom: '1px dashed var(--border)',
                marginBottom: 14,
              }}
            >
              <div>
                <div className="cellsub">पहचान पत्र प्रकार (ID Type)</div>
                {isEditing ? (
                  <select
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, background: 'var(--surface)' }}
                    value={formData.preferredIdType || 'both'}
                    onChange={(e) => handleChange('preferredIdType', e.target.value)}
                  >
                    <option value="aadhaar">Aadhaar Card (आधार कार्ड)</option>
                    <option value="pan">PAN Card (पैन कार्ड)</option>
                    <option value="both">Both (आधार व पैन दोनों)</option>
                  </select>
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>
                    {formData.preferredIdType === 'both' ? 'Aadhaar + PAN' : (formData.preferredIdType || 'Aadhaar Card')}
                  </div>
                )}
              </div>

              <div>
                <div className="cellsub">आधार संख्या (Aadhaar Number)</div>
                {isEditing ? (
                  <input
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, fontFamily: 'monospace' }}
                    value={formData.aadhaarNumber || ''}
                    onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                    placeholder="12 digits"
                  />
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formatAadhaar(formData.aadhaarNumber)}
                    {formData.aadhaarNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.aadhaarNumber, 'Aadhaar Number')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                        title="Copy Aadhaar"
                      >
                        📋
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="cellsub">पैन कार्ड संख्या (PAN Number)</div>
                {isEditing ? (
                  <input
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    value={formData.panNumber || ''}
                    onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                  />
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formData.panNumber || '—'}
                    {formData.panNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.panNumber, 'PAN Number')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                        title="Copy PAN"
                      >
                        📋
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Document Image Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
              {/* Card 1: Live User Photo / Selfie */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)' }}>📸 Live User Selfie</span>
                  <span style={{ fontSize: 10, color: photo ? 'var(--good)' : 'var(--muted)', fontWeight: 700 }}>
                    {photo ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                {photo ? (
                  <div
                    style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000' }}
                    onClick={() => setLightboxDoc({ url: photo, title: 'Live User Selfie Photo', sub: `${formData.name} (${formData.id})` })}
                  >
                    <img
                      src={photo}
                      alt="Live User Selfie"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      🔍 Click to Inspect Full HD
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: 130,
                      borderRadius: 8,
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      fontSize: 12,
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    फ़ोटो प्रतीक्षित (Photo Pending)
                  </div>
                )}
                {photo && (
                  <button
                    type="button"
                    onClick={() => setLightboxDoc({ url: photo, title: 'Live User Selfie Photo', sub: `${formData.name} (${formData.id})` })}
                    style={{
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 View Full Size
                  </button>
                )}
                {isEditing && (
                  <input
                    style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11 }}
                    value={formData.photo || ''}
                    onChange={(e) => handleChange('photo', e.target.value)}
                    placeholder="Paste Live Photo URL"
                  />
                )}
              </div>

              {/* Card 2: Aadhaar Card Front */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)' }}>🪪 Aadhaar Front (मुख्य पृष्ठ)</span>
                  <span style={{ fontSize: 10, color: aadhaarFront ? 'var(--good)' : 'var(--muted)', fontWeight: 700 }}>
                    {aadhaarFront ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                {aadhaarFront ? (
                  <div
                    style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000' }}
                    onClick={() => setLightboxDoc({ url: aadhaarFront, title: 'Aadhaar Card (Front Page)', sub: `Aadhaar No: ${formatAadhaar(formData.aadhaarNumber)}` })}
                  >
                    <img
                      src={aadhaarFront}
                      alt="Aadhaar Front"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      🔍 Click to Inspect Full HD
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: 130,
                      borderRadius: 8,
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      fontSize: 12,
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    आधार मुख्य पृष्ठ प्रतीक्षित
                  </div>
                )}
                {aadhaarFront && (
                  <button
                    type="button"
                    onClick={() => setLightboxDoc({ url: aadhaarFront, title: 'Aadhaar Card (Front Page)', sub: `Aadhaar No: ${formatAadhaar(formData.aadhaarNumber)}` })}
                    style={{
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 View Full Size
                  </button>
                )}
                {isEditing && (
                  <input
                    style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11 }}
                    value={formData.aadhaarFront || ''}
                    onChange={(e) => handleChange('aadhaarFront', e.target.value)}
                    placeholder="Paste Aadhaar Front URL"
                  />
                )}
              </div>

              {/* Card 3: Aadhaar Card Back */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)' }}>🪪 Aadhaar Back (पता पृष्ठ)</span>
                  <span style={{ fontSize: 10, color: aadhaarBack ? 'var(--good)' : 'var(--muted)', fontWeight: 700 }}>
                    {aadhaarBack ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                {aadhaarBack ? (
                  <div
                    style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000' }}
                    onClick={() => setLightboxDoc({ url: aadhaarBack, title: 'Aadhaar Card (Back Page - Address)', sub: `Address Verification` })}
                  >
                    <img
                      src={aadhaarBack}
                      alt="Aadhaar Back"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      🔍 Click to Inspect Full HD
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: 130,
                      borderRadius: 8,
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      fontSize: 12,
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    आधार बैक पृष्ठ प्रतीक्षित
                  </div>
                )}
                {aadhaarBack && (
                  <button
                    type="button"
                    onClick={() => setLightboxDoc({ url: aadhaarBack, title: 'Aadhaar Card (Back Page - Address)', sub: `Address Verification` })}
                    style={{
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 View Full Size
                  </button>
                )}
                {isEditing && (
                  <input
                    style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11 }}
                    value={formData.aadhaarBack || ''}
                    onChange={(e) => handleChange('aadhaarBack', e.target.value)}
                    placeholder="Paste Aadhaar Back URL"
                  />
                )}
              </div>

              {/* Card 4: PAN Card Front */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg)' }}>📄 PAN Card (आयकर विभाग)</span>
                  <span style={{ fontSize: 10, color: panFront ? 'var(--good)' : 'var(--muted)', fontWeight: 700 }}>
                    {panFront ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                {panFront ? (
                  <div
                    style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000' }}
                    onClick={() => setLightboxDoc({ url: panFront, title: 'PAN Card Verification', sub: `PAN No: ${formData.panNumber || '—'}` })}
                  >
                    <img
                      src={panFront}
                      alt="PAN Card Front"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      🔍 Click to Inspect Full HD
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: 130,
                      borderRadius: 8,
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      fontSize: 12,
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    पैन कार्ड प्रतीक्षित (PAN Pending)
                  </div>
                )}
                {panFront && (
                  <button
                    type="button"
                    onClick={() => setLightboxDoc({ url: panFront, title: 'PAN Card Verification', sub: `PAN No: ${formData.panNumber || '—'}` })}
                    style={{
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 View Full Size
                  </button>
                )}
                {isEditing && (
                  <input
                    style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11 }}
                    value={formData.panFront || ''}
                    onChange={(e) => handleChange('panFront', e.target.value)}
                    placeholder="Paste PAN Card URL"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3b: Astrologer Consultation Rates */}
        {formData.role === 'astro' && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10, fontWeight: 700 }}>
              ज्योतिष परामर्श दर (Consultation Rates)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'var(--surface2)', padding: 14, borderRadius: 12 }}>
              <div>
                <div className="cellsub">Chat शुल्क (₹/min)</div>
                {isEditing ? (
                  <input
                    type="number"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                    value={formData.rates?.chat || 25}
                    onChange={(e) => handleNestedChange('rates', 'chat', Number(e.target.value))}
                  />
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2 }}>₹{formData.rates?.chat || 25}/min</div>
                )}
              </div>
              <div>
                <div className="cellsub">Call शुल्क (₹/min)</div>
                {isEditing ? (
                  <input
                    type="number"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                    value={formData.rates?.call || 35}
                    onChange={(e) => handleNestedChange('rates', 'call', Number(e.target.value))}
                  />
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2 }}>₹{formData.rates?.call || 35}/min</div>
                )}
              </div>
              <div>
                <div className="cellsub">Video शुल्क (₹/min)</div>
                {isEditing ? (
                  <input
                    type="number"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                    value={formData.rates?.video || 50}
                    onChange={(e) => handleNestedChange('rates', 'video', Number(e.target.value))}
                  />
                ) : (
                  <div style={{ fontWeight: 700, marginTop: 2 }}>₹{formData.rates?.video || 50}/min</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Bank & Payout Details */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10, fontWeight: 700 }}>
            4. बैंक खाता व UPI विवरण (Bank & Payout)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'var(--surface2)', padding: 14, borderRadius: 12 }}>
            <div>
              <div className="cellsub">खाता संख्या (A/C No)</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.bank?.account || ''}
                  onChange={(e) => handleNestedChange('bank', 'account', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>{formData.bank?.account || '—'}</div>
              )}
            </div>
            <div>
              <div className="cellsub">IFSC कोड</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.bank?.ifsc || ''}
                  onChange={(e) => handleNestedChange('bank', 'ifsc', e.target.value.toUpperCase())}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>{formData.bank?.ifsc || '—'}</div>
              )}
            </div>
            <div>
              <div className="cellsub">UPI ID</div>
              {isEditing ? (
                <input
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4 }}
                  value={formData.bank?.upi || ''}
                  onChange={(e) => handleNestedChange('bank', 'upi', e.target.value)}
                />
              ) : (
                <div style={{ fontWeight: 700, marginTop: 2, color: 'var(--accent)' }}>{formData.bank?.upi || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Verification & Status Amendments */}
        {isEditing && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10, fontWeight: 700 }}>
              5. व्यवस्थापक स्थिति संशोधन (Status & KYC Flags)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, background: 'var(--surface2)', padding: 14, borderRadius: 12 }}>
              <div>
                <div className="cellsub">KYC स्थिति</div>
                <select
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, background: 'var(--surface)' }}
                  value={formData.kyc || 'Pending'}
                  onChange={(e) => handleChange('kyc', e.target.value)}
                >
                  <option value="Pending">Pending (समीक्षा लंबित)</option>
                  <option value="Verified">Verified (सत्यापित व स्वीकृत)</option>
                  <option value="Rejected">Rejected (अस्वीकृत)</option>
                </select>
              </div>
              <div>
                <div className="cellsub">खाता स्थिति (Account Status)</div>
                <select
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 4, background: 'var(--surface)' }}
                  value={formData.status || 'Review'}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="Review">Review (अंडर रिव्यू)</option>
                  <option value="Active">Active (सक्रिय - ऑनलाइन बुकिंग हेतु)</option>
                  <option value="Incomplete">Incomplete (अपूर्ण)</option>
                  <option value="Suspended">Suspended (निलंबित)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <button onClick={onClose} className="act" style={{ padding: '8px 18px', fontSize: 13 }}>
            Close
          </button>

          {isEditing ? (
            <button
              onClick={handleSaveAmendments}
              className="act pri"
              disabled={saving}
              style={{ padding: '8px 22px', fontSize: 13, fontWeight: 800 }}
            >
              {saving ? 'Saving…' : '💾 Save Amendments'}
            </button>
          ) : (
            <>
              {formData.kyc !== 'Rejected' && (
                <button
                  onClick={() => onReject(formData)}
                  className="act no"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                >
                  Reject Application
                </button>
              )}
              {formData.kyc !== 'Verified' && (
                <button
                  onClick={() => onApprove(formData)}
                  className="act ok"
                  style={{ padding: '8px 22px', fontSize: 13, fontWeight: 800 }}
                >
                  ✓ Approve & Activate (Live)
                </button>
              )}
            </>
          )}
        </div>

        {/* Lightbox Modal for Full Screen Document Inspection */}
        {lightboxDoc && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.88)',
              zIndex: 100000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setLightboxDoc(null)}
          >
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  color: '#fff',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{lightboxDoc.title}</h3>
                  {lightboxDoc.sub && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#ccc' }}>{lightboxDoc.sub}</p>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={lightboxDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    ↗ Open in New Tab
                  </a>
                  <button
                    onClick={() => setLightboxDoc(null)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <img
                src={lightboxDoc.url}
                alt={lightboxDoc.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
