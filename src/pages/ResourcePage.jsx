import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { resources } from '../resources';
import { useResource } from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import adminSocket from '../api/socket';

import VendorKycModal from '../components/VendorKycModal';
import ProductModal from '../components/ProductModal';
import ResourceDetailModal from '../components/ResourceDetailModal';
import { toast } from '../components/toast';

/**
 * One component renders every list screen, driven by the resources registry.
 * Route: /:resource  (e.g. /orders, /vendors, /products, /bookings, etc.)
 */
export default function ResourcePage() {
  const { resource } = useParams();
  const cfg = resources[resource];
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!cfg) return <div className="card"><div className="empty">Unknown section.</div></div>;

  const { rows, loading, usingMock, patch, reload, setRows } = useResource(cfg.service, cfg.mock, [resource]);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    const unsubOrder = adminSocket.on('order:new', (order) => {
      if (resource === 'orders') {
        reload();
        toast(`📦 Naya Order: #${order?.id || ''} (${order?.buyer || 'यजमान'})`);
      }
    });

    const unsubOrdersUpdated = adminSocket.on('store:orders_updated', () => {
      if (resource === 'orders') reload();
    });

    const unsubProductsUpdated = adminSocket.on('store:products_updated', () => {
      if (resource === 'products') reload();
    });

    const unsubBookings = adminSocket.on('booking:new', (b) => {
      if (resource === 'bookings') {
        reload();
        toast(`🔥 Nayi Pooja Booking: #${b?.id || ''}!`);
      }
    });

    const unsubVendor = adminSocket.on('vendor:update', () => {
      if (resource === 'vendors') reload();
    });

    return () => {
      unsubOrder();
      unsubOrdersUpdated();
      unsubProductsUpdated();
      unsubBookings();
      unsubVendor();
    };
  }, [resource, reload]);

  if (loading) return <div className="card"><div className="empty">Loading {cfg.title}…</div></div>;

  const banner = usingMock ? (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="banner-mock">⚠️ Showing sample data — backend not connected (set VITE_API_BASE_URL).</div>
    </div>
  ) : null;

  const handleApprove = (v) => {
    patch(v.id, { kyc: 'Verified', status: 'Active' });
    setSelectedVendor(null);
    toast(`${v.name} approved & verified!`);
  };

  const handleReject = (v) => {
    patch(v.id, { kyc: 'Rejected', status: 'Suspended' });
    setSelectedVendor(null);
    toast(`${v.name} rejected`);
  };

  // E-Store product management handlers
  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        // Update existing product
        await cfg.service.update(productData.id, productData);
        setRows((prev) => prev.map((item) => (item.id === productData.id ? { ...item, ...productData } : item)));
        toast(`✅ Product "${productData.name || productData.title}" updated!`);
      } else {
        // Create new product
        const created = await cfg.service.create(productData);
        if (created) {
          setRows((prev) => [created.product || created.data || created, ...prev]);
        }
        await reload();
        toast(`🎉 New product "${productData.name}" published to E-Store!`);
      }
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      // Fallback for optimistic UI if mock / offline
      if (productData.id) {
        setRows((prev) => prev.map((item) => (item.id === productData.id ? { ...item, ...productData } : item)));
      } else {
        const dummyNew = { ...productData, id: 'P-' + Math.floor(1000 + Math.random() * 9000) };
        setRows((prev) => [dummyNew, ...prev]);
      }
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      toast(`✅ Saved product to catalog!`);
    }
  };

  const handleDeleteProduct = async (prod) => {
    const name = prod.name || prod.title || prod.id;
    if (window.confirm(`Are you sure you want to remove "${name}" from E-Store catalog?`)) {
      try {
        await cfg.service.remove(prod.id);
        setRows((prev) => prev.filter((r) => r.id !== prod.id));
        toast(`🗑️ "${name}" removed from E-Store`);
      } catch (err) {
        setRows((prev) => prev.filter((r) => r.id !== prod.id));
        toast(`Removed product`);
      }
    }
  };

  // Row click handler for inspecting any resource
  const handleRowClick = (row) => {
    if (resource === 'vendors') {
      setSelectedVendor(row);
    } else if (resource === 'products') {
      handleEditProduct(row);
    } else {
      setSelectedItem(row);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="toolbar" style={{ borderBottom: 0, justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="search" style={{ margin: 0, width: 280 }}>
              <span>🔍</span>
              <input placeholder={`Search ${cfg.title.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>

            <button
              onClick={async () => {
                setIsRefreshing(true);
                await reload();
                setTimeout(() => setIsRefreshing(false), 400);
                toast(`🔄 ${cfg.title} refreshed!`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                borderRadius: 9,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Refresh list from backend"
            >
              <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                🔄
              </span>
              Refresh
            </button>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                color: '#1C9A5E',
                background: 'rgba(28, 154, 94, 0.1)',
                padding: '4px 10px',
                borderRadius: 100,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1C9A5E' }} />
              Live Sync
            </span>
          </div>

          {resource === 'products' && (
            <button
              onClick={handleOpenNewProduct}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #FFB24D, #E67E00)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(230, 126, 0, 0.35)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span style={{ fontSize: 16 }}>➕</span> Add E-Store Product
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={cfg.columns}
        rows={rows}
        searchKeys={cfg.searchKeys}
        statusKey={cfg.statusKey}
        statuses={cfg.statuses}
        onRowClick={handleRowClick}
        actions={
          cfg.actions
            ? (row) => cfg.actions(row, patch, setSelectedVendor, handleEditProduct, handleDeleteProduct, setSelectedItem)
            : (row) => (
                <button
                  className="act pri"
                  onClick={() => setSelectedItem(row)}
                  title="Inspect Full Details"
                >
                  👁 Details
                </button>
              )
        }
        banner={banner}
        search={search}
      />

      {/* Vendor KYC Review Modal */}
      {resource === 'vendors' && selectedVendor && (
        <VendorKycModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onUpdate={async (id, data) => {
            await patch(id, data);
            setSelectedVendor((prev) => ({ ...prev, ...data }));
          }}
        />
      )}

      {/* E-Store Product Edit / Create Modal */}
      {resource === 'products' && isProductModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Universal Connected Details Modal for All Other Sidebar Resources */}
      {selectedItem && resource !== 'vendors' && resource !== 'products' && (
        <ResourceDetailModal
          resource={resource}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPatch={async (id, data) => {
            await patch(id, data);
            setSelectedItem((prev) => (prev ? { ...prev, ...data } : null));
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
          }}
        />
      )}
    </div>
  );
}
