import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminGetServices, adminCreateService, adminUpdateService, adminDeleteService } from "../../api";
import { formatMoney } from "./orderStatus";
import ConfirmModal from "../../components/admin/ConfirmModal";

const UNITS = ["per_kg", "per_item", "flat"];

const emptyForm = { name: "", description: "", unit: "per_kg", unitPrice: "", isActive: true };

const ServiceFormModal = ({ service, onClose, onSaved }) => {
  const isEdit = !!service;
  const [form, setForm] = useState(
    service
      ? { name: service.name, description: service.description || "", unit: service.unit || "per_kg", unitPrice: service.unitPrice, isActive: service.isActive }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    if (form.unitPrice === "" || isNaN(form.unitPrice) || Number(form.unitPrice) < 0) {
      toast.error("Enter a valid unit price.");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await adminUpdateService(service._id, form);
        toast.success("Service updated.");
      } else {
        await adminCreateService(form);
        toast.success("Service created.");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">{isEdit ? "Edit Service" : "New Service"}</div>

        <label className="admin-side-label">Name</label>
        <input
          className="admin-select admin-select--full"
          type="text"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          disabled={loading}
        />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Description</label>
        <textarea
          className="admin-textarea"
          rows={2}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          disabled={loading}
        />

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="admin-side-label">Unit</label>
            <select className="admin-select admin-select--full" value={form.unit} onChange={(e) => setField("unit", e.target.value)} disabled={loading}>
              {UNITS.map((u) => <option key={u} value={u}>{u.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="admin-side-label">Unit Price</label>
            <input
              className="admin-select admin-select--full"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setField("unitPrice", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <label className="admin-side-label" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} disabled={loading} />
          Active (visible to customers)
        </label>

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={submit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Service"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetServices({ status: status || undefined, search: search || undefined });
      setServices(data.services);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load services.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await adminDeleteService(deleteTarget._id);
      toast.success("Service deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete service.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-filter-bar">
        <input
          className="admin-search-input admin-search-input--wide"
          type="text"
          placeholder="Search by name or description"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All services</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setFormTarget(null)} style={{ marginLeft: "auto" }}>
          + New Service
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">Services {services.length ? <span className="admin-muted">({services.length})</span> : null}</div>

        {error && !loading ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6}><div className="admin-skeleton" style={{ height: 20 }} /></td></tr>
                  ))
                ) : services.length === 0 ? (
                  <tr><td colSpan={6} className="admin-table-empty">No services yet — add your first one.</td></tr>
                ) : (
                  services.map((s) => (
                    <tr key={s._id}>
                      <td className="admin-table-strong">{s.name}</td>
                      <td className="admin-table-ellipsis" title={s.description || ""}>{s.description || "—"}</td>
                      <td>{(s.unit || "per_kg").replace(/_/g, " ")}</td>
                      <td>{formatMoney(s.unitPrice)}</td>
                      <td>
                        <span className={`admin-badge ${s.isActive ? "admin-badge--green" : "admin-badge--gray"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="admin-btn admin-btn--sm" onClick={() => setFormTarget(s)}>Edit</button>
                          <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => setDeleteTarget(s)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget !== undefined && (
        <ServiceFormModal
          service={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => {
            setFormTarget(undefined);
            load();
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this service?"
        message={`"${deleteTarget?.name}" will be removed from the customer app immediately. This cannot be undone.`}
        confirmLabel="Delete Service"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminServices;
