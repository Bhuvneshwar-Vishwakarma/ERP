/**
 * posting_control_header_module.js
 * 
 * Modern ERP Design for Posting Control Header Master (ERP-FIN-MAS-012):
 * - Fields from screenshot:
 *   - Filters: Company (active enabled select), Posting Type, Code Part Name, Control Type,
 *              Default Value No Details, Search Button (magnifying glass)
 *   - Table Columns: Checkbox, Posting Type, Posting Type Desc, Code Part Name, Control Type,
 *                    Control Type Desc, Default Value No Details, Default Value No CT Value,
 *                    Override, Valid From, Module, Actions
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), View Details (navigates to Posting Control Details),
 *                    Pagination (Page X of Y, rows dropdown e.g. 1000, record count)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Posting Controls, Governed Modules, Active Code Parts, Overrides Allowed)
 *   - Clean cards, modern typography, color-coded badges, and responsive table
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add/Edit modal opening and button handlers (inline onclick, module listener, document delegation)
 *   - Seamless cross-module navigation between "Posting Control" and "Posting Control Details"
 *   - Edit & Delete per row, bulk delete, multi-criteria search and filter
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_POSTING_CONTROL_HEADER_V1';

    const MODULES = [
        { code: 'INVOIC', name: 'Customer Invoicing (AR)', color: '#2563eb', bg: '#eff6ff' },
        { code: 'PURORD', name: 'Purchase Order & AP', color: '#ea580c', bg: '#fff7ed' },
        { code: 'INVENT', name: 'Inventory & Warehousing', color: '#059669', bg: '#ecfdf5' },
        { code: 'GENLED', name: 'General Ledger', color: '#7c3aed', bg: '#f5f3ff' },
        { code: 'FIXASS', name: 'Fixed Assets', color: '#0891b2', bg: '#ecfeff' },
        { code: 'PAYROL', name: 'Payroll & HR', color: '#db2777', bg: '#fdf2f8' }
    ];

    const SEED_DATA = [
        {
            id: 'pc-001',
            company: 'Laxmico Ltd',
            postingType: 'IP1',
            postingTypeDesc: 'Customer Invoicing Gross Revenue & Debtors',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '3010',
            defaultValueNoCTValue: '3010',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'INVOIC',
            notes: 'Primary sales ledger posting control'
        },
        {
            id: 'pc-002',
            company: 'Laxmico Ltd',
            postingType: 'IP1',
            postingTypeDesc: 'Customer Invoicing Gross Revenue & Debtors',
            codePartName: 'Cost Center',
            controlType: 'CC1',
            controlTypeDesc: 'By Operating Department',
            defaultValueNoDetails: '100',
            defaultValueNoCTValue: '100',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'INVOIC',
            notes: 'Commercial department default sales credit'
        },
        {
            id: 'pc-003',
            company: 'Laxmico Ltd',
            postingType: 'IP2',
            postingTypeDesc: 'Customer Invoicing Output VAT Liability',
            codePartName: 'Nominal Account',
            controlType: 'TX1',
            controlTypeDesc: 'By Applied Tax Code Rate',
            defaultValueNoDetails: '2200',
            defaultValueNoCTValue: '2200',
            override: 'Forbidden',
            validFrom: '2026-01-01',
            module: 'INVOIC',
            notes: 'Statutory HMRC tax liability ledger'
        },
        {
            id: 'pc-004',
            company: 'Laxmico Ltd',
            postingType: 'PP1',
            postingTypeDesc: 'Supplier Invoicing Net Trade Liabilities',
            codePartName: 'Nominal Account',
            controlType: 'AC2',
            controlTypeDesc: 'By Supplier Posting Group',
            defaultValueNoDetails: '2110',
            defaultValueNoCTValue: '2110',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'PURORD',
            notes: 'Trade creditors supplier ledger control'
        },
        {
            id: 'pc-005',
            company: 'Laxmico Ltd',
            postingType: 'PP1',
            postingTypeDesc: 'Supplier Invoicing Net Trade Liabilities',
            codePartName: 'Cost Center',
            controlType: 'CC1',
            controlTypeDesc: 'By Operating Department',
            defaultValueNoDetails: '200',
            defaultValueNoCTValue: '200',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'PURORD',
            notes: 'Procurement operating department allocation'
        },
        {
            id: 'pc-006',
            company: 'Laxmico Ltd',
            postingType: 'PP2',
            postingTypeDesc: 'Supplier Invoicing Deductible Input VAT',
            codePartName: 'Nominal Account',
            controlType: 'TX1',
            controlTypeDesc: 'By Applied Tax Code Rate',
            defaultValueNoDetails: '2210',
            defaultValueNoCTValue: '2210',
            override: 'Forbidden',
            validFrom: '2026-01-01',
            module: 'PURORD',
            notes: 'HMRC input tax recovery nominal code'
        },
        {
            id: 'pc-007',
            company: 'Laxmico Ltd',
            postingType: 'GP1',
            postingTypeDesc: 'Goods Received Not Invoiced (GRNI Clearing)',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '2120',
            defaultValueNoCTValue: '2120',
            override: 'Forbidden',
            validFrom: '2026-01-01',
            module: 'INVENT',
            notes: 'Warehouse GRN receipt interim accrual'
        },
        {
            id: 'pc-008',
            company: 'Laxmico Ltd',
            postingType: 'GP2',
            postingTypeDesc: 'Purchase Price Variance (PPV Clearing)',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '5030',
            defaultValueNoCTValue: '5030',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'INVENT',
            notes: 'Cost variance between PO pricing and standard cost'
        },
        {
            id: 'pc-009',
            company: 'Laxmico Ltd',
            postingType: 'M1',
            postingTypeDesc: 'Manual Journal Balancing & Cost Redistribution',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '9999',
            defaultValueNoCTValue: '9999',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'GENLED',
            notes: 'Suspense fallback nominal balancing'
        },
        {
            id: 'pc-010',
            company: 'Laxmico Ltd',
            postingType: 'FA1',
            postingTypeDesc: 'Fixed Asset Monthly Depreciation Expense',
            codePartName: 'Cost Center',
            controlType: 'CC1',
            controlTypeDesc: 'By Operating Department',
            defaultValueNoDetails: '500',
            defaultValueNoCTValue: '500',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'FIXASS',
            notes: 'Plant and operational equipment depreciation allocation'
        },
        {
            id: 'pc-011',
            company: 'B&S International',
            postingType: 'IP1',
            postingTypeDesc: 'Customer Invoicing Gross Revenue & Debtors',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '3100',
            defaultValueNoCTValue: '3100',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'INVOIC',
            notes: 'Cross-border foreign currency export revenue'
        },
        {
            id: 'pc-012',
            company: 'B&S International',
            postingType: 'PP1',
            postingTypeDesc: 'Supplier Invoicing Net Trade Liabilities',
            codePartName: 'Nominal Account',
            controlType: 'AC2',
            controlTypeDesc: 'By Supplier Posting Group',
            defaultValueNoDetails: '2150',
            defaultValueNoCTValue: '2150',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'PURORD',
            notes: 'Overseas vendor liabilities control'
        },
        {
            id: 'pc-013',
            company: 'B&S UK Trading',
            postingType: 'IP1',
            postingTypeDesc: 'Customer Invoicing Gross Revenue & Debtors',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '3020',
            defaultValueNoCTValue: '3020',
            override: 'Allowed',
            validFrom: '2026-01-01',
            module: 'INVOIC',
            notes: 'Domestic wholesale distribution sales revenue'
        },
        {
            id: 'pc-014',
            company: 'B&S UK Trading',
            postingType: 'GP1',
            postingTypeDesc: 'Goods Received Not Invoiced (GRNI Clearing)',
            codePartName: 'Nominal Account',
            controlType: 'AC1',
            controlTypeDesc: 'Fixed Nominal Account',
            defaultValueNoDetails: '2125',
            defaultValueNoCTValue: '2125',
            override: 'Forbidden',
            validFrom: '2026-01-01',
            module: 'INVENT',
            notes: 'UK logistics distribution receipt clearing'
        }
    ];

    const PostingControlHeaderModule = {
        data: [],
        modules: MODULES,
        selectedIds: [],
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            postingType: '',
            codePartName: '',
            controlType: '',
            defNoDetails: '',
            search: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('PostingControlHeaderModule initialized successfully.');
        },

        loadData() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this.data = parsed;
                        return;
                    }
                }
            } catch (err) {
                console.warn('[PostingControlHeader] Error loading localStorage:', err);
            }
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.saveData();
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.warn('[PostingControlHeader] Error saving localStorage:', err);
            }
        },

        getFilteredData() {
            let list = [...this.data];

            const c = (this.filters.company || '').trim().toLowerCase();
            const pt = (this.filters.postingType || '').trim().toUpperCase();
            const cpn = (this.filters.codePartName || '').trim().toLowerCase();
            const ct = (this.filters.controlType || '').trim().toLowerCase();
            const dnd = (this.filters.defNoDetails || '').trim().toLowerCase();
            const q = (this.filters.search || '').trim().toLowerCase();

            if (c && c !== 'all') {
                list = list.filter(item => (item.company || '').toLowerCase().includes(c));
            }
            if (pt) {
                list = list.filter(item => (item.postingType || '').toUpperCase().includes(pt));
            }
            if (cpn) {
                list = list.filter(item => (item.codePartName || '').toLowerCase().includes(cpn));
            }
            if (ct) {
                list = list.filter(item => (item.controlType || '').toLowerCase().includes(ct));
            }
            if (dnd) {
                list = list.filter(item => (item.defaultValueNoDetails || '').toLowerCase().includes(dnd));
            }
            if (q) {
                list = list.filter(item => {
                    const haystack = `${item.company} ${item.postingType} ${item.postingTypeDesc} ${item.codePartName} ${item.controlType} ${item.controlTypeDesc} ${item.defaultValueNoDetails} ${item.defaultValueNoCTValue} ${item.module} ${item.notes || ''}`.toLowerCase();
                    return haystack.includes(q);
                });
            }

            return list;
        },

        renderKPIs() {
            const total = this.data.length;
            const uniqueModules = new Set(this.data.map(d => d.module)).size;
            const uniqueCodeParts = new Set(this.data.map(d => d.codePartName)).size;
            const overridesAllowed = this.data.filter(d => d.override === 'Allowed').length;

            const elTotal = document.getElementById('pc-kpi-total');
            const elModules = document.getElementById('pc-kpi-modules');
            const elParts = document.getElementById('pc-kpi-parts');
            const elOverrides = document.getElementById('pc-kpi-overrides');

            if (elTotal) elTotal.textContent = `${total} Controls`;
            if (elModules) elModules.textContent = `${uniqueModules} Modules`;
            if (elParts) elParts.textContent = `${uniqueCodeParts} Code Parts`;
            if (elOverrides) elOverrides.textContent = `${overridesAllowed} Overrides`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-pc-list');
            if (!tbody) return;

            const filtered = this.getFilteredData();
            const total = filtered.length;
            const totalPages = Math.ceil(total / this.pageSize) || 1;
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            const startIdx = (this.currentPage - 1) * this.pageSize;
            const paginated = filtered.slice(startIdx, startIdx + this.pageSize);

            const countBadge = document.getElementById('pc-total-count');
            if (countBadge) {
                countBadge.textContent = `${total} Records`;
            }

            const pageInfo = document.getElementById('pc-page-info');
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${total} total records)`;
            }

            const pageInput = document.getElementById('pc-page-input');
            if (pageInput) {
                pageInput.value = this.currentPage;
            }

            if (paginated.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="12" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                            <div style="font-size: 38px; margin-bottom: 8px;">📊</div>
                            <div style="font-size: 14px; font-weight: 600; color: #334155;">No Posting Controls Found</div>
                            <div style="font-size: 12px; margin-top: 4px;">Try modifying your search criteria or click "Clear Filters"</div>
                        </td>
                    </tr>
                `;
                this.updateActionButtons();
                return;
            }

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            tbody.innerHTML = paginated.map(item => {
                const isSelected = this.selectedIds.includes(item.id);
                const modMeta = MODULES.find(m => m.code === item.module) || { color: '#475569', bg: '#f1f5f9' };
                const isOverride = item.override === 'Allowed';

                return `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${isSelected ? 'background-color: #eff6ff;' : ''}" class="hover-row">
                        <td style="text-align: center; padding: 10px 8px;">
                            <input type="checkbox" class="cb-pc-row" data-id="${escapeHtml(item.id)}" ${isSelected ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 10px 12px; font-weight: 700; color: #1e293b; font-size: 12.5px;">
                            <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1;">
                                ${escapeHtml(item.postingType)}
                            </span>
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; color: #1e293b; font-weight: 500;">
                            ${escapeHtml(item.postingTypeDesc)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; color: #334155; font-weight: 600;">
                            ${escapeHtml(item.codePartName)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #475569; font-weight: 600;">
                            ${escapeHtml(item.controlType)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; color: #64748b;">
                            ${escapeHtml(item.controlTypeDesc)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #059669;">
                            ${escapeHtml(item.defaultValueNoDetails)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #64748b;">
                            ${escapeHtml(item.defaultValueNoCTValue)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 11px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: ${isOverride ? '#047857' : '#b91c1c'}; background: ${isOverride ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${isOverride ? '#a7f3d0' : '#fecaca'};">
                                ${escapeHtml(item.override)}
                            </span>
                        </td>
                        <td style="padding: 10px 12px; font-size: 11.5px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
                            ${escapeHtml(item.validFrom)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 11px;">
                            <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: ${modMeta.color}; background: ${modMeta.bg};">
                                ${escapeHtml(item.module)}
                            </span>
                        </td>
                        <td style="padding: 10px 12px; text-align: right; white-space: nowrap;">
                            <button type="button" class="btn-pc-view-details btn btn-secondary" data-type="${escapeHtml(item.postingType)}" data-company="${escapeHtml(item.company)}" style="height: 26px; padding: 0 8px; font-size: 11px; margin-right: 4px; color: #2563eb;" title="View Posting Control Details">
                                ↗️ Details
                            </button>
                            <button type="button" class="btn-pc-edit btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 26px; padding: 0 8px; font-size: 11px; margin-right: 4px;" title="Edit Control">
                                ✏️
                            </button>
                            <button type="button" class="btn-pc-delete-row btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 26px; padding: 0 8px; font-size: 11px; color: #ef4444;" title="Delete Control">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind row checkboxes
            const rowCheckboxes = tbody.querySelectorAll('.cb-pc-row');
            rowCheckboxes.forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (e.target.checked) {
                        if (!this.selectedIds.includes(id)) this.selectedIds.push(id);
                    } else {
                        this.selectedIds = this.selectedIds.filter(x => x !== id);
                    }
                    this.updateActionButtons();
                    const tr = e.target.closest('tr');
                    if (tr) {
                        tr.style.backgroundColor = e.target.checked ? '#eff6ff' : '';
                    }
                });
            });

            // Bind row action buttons
            tbody.querySelectorAll('.btn-pc-view-details').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = e.currentTarget.getAttribute('data-type');
                    this.navigateToDetails(type);
                });
            });

            tbody.querySelectorAll('.btn-pc-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.openEditModal(id);
                });
            });

            tbody.querySelectorAll('.btn-pc-delete-row').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.deleteRow(id);
                });
            });

            // Update master select-all state
            const selectAllCb = document.getElementById('cb-pc-select-all');
            if (selectAllCb) {
                const allSelected = paginated.length > 0 && paginated.every(p => this.selectedIds.includes(p.id));
                selectAllCb.checked = allSelected;
            }

            this.updateActionButtons();
        },

        updateActionButtons() {
            const delBtn = document.getElementById('btn-pc-delete');
            const viewDetailsBtn = document.getElementById('btn-pc-view-details');

            const count = this.selectedIds.length;
            if (delBtn) {
                if (count > 0) {
                    delBtn.disabled = false;
                    delBtn.style.opacity = '1';
                    delBtn.style.cursor = 'pointer';
                    delBtn.innerHTML = `<span>🗑️</span> Delete (${count})`;
                } else {
                    delBtn.disabled = true;
                    delBtn.style.opacity = '0.6';
                    delBtn.style.cursor = 'not-allowed';
                    delBtn.innerHTML = '<span>🗑️</span> Delete';
                }
            }

            if (viewDetailsBtn) {
                if (count === 1) {
                    viewDetailsBtn.disabled = false;
                    viewDetailsBtn.style.opacity = '1';
                    viewDetailsBtn.style.cursor = 'pointer';
                } else {
                    viewDetailsBtn.disabled = false; // keep accessible or navigate first selected
                    viewDetailsBtn.style.opacity = '1';
                    viewDetailsBtn.style.cursor = 'pointer';
                }
            }
        },

        showFormError(msg) {
            const alertBox = document.getElementById('pc-form-alert');
            if (alertBox) {
                alertBox.textContent = msg;
                alertBox.style.display = 'block';
                alertBox.style.backgroundColor = '#fef2f2';
                alertBox.style.color = '#b91c1c';
                alertBox.style.border = '1px solid #fecaca';
            }
            if (typeof window.showNotification === 'function') {
                window.showNotification(msg, 'warning');
            }
        },

        clearFormError() {
            const alertBox = document.getElementById('pc-form-alert');
            if (alertBox) {
                alertBox.textContent = '';
                alertBox.style.display = 'none';
            }
        },

        openAddModal() {
            this.editingId = null;
            this.clearFormError();
            const modal = document.getElementById('modal-add-posting-control');
            const title = document.getElementById('modal-pc-title');
            const saveBtn = document.getElementById('btn-pc-save');

            if (title) title.innerHTML = '<span>📊</span> Add Posting Control';
            if (saveBtn) saveBtn.textContent = 'Save Posting Control';

            const fComp = document.getElementById('filter-pc-company');
            const compSelect = document.getElementById('pc-form-company');
            const typeInput = document.getElementById('pc-form-posting-type');
            const descInput = document.getElementById('pc-form-posting-desc');
            const cpnInput = document.getElementById('pc-form-code-part');
            const ctInput = document.getElementById('pc-form-control-type');
            const ctDescInput = document.getElementById('pc-form-control-desc');
            const defDetailsInput = document.getElementById('pc-form-def-details');
            const defCtInput = document.getElementById('pc-form-def-ct');
            const overrideSelect = document.getElementById('pc-form-override');
            const validFromInput = document.getElementById('pc-form-valid-from');
            const moduleSelect = document.getElementById('pc-form-module');
            const notesInput = document.getElementById('pc-form-notes');

            if (compSelect) compSelect.value = (fComp && fComp.value && fComp.value !== 'all') ? fComp.value : 'Laxmico Ltd';
            if (typeInput) typeInput.value = 'IP1';
            if (descInput) descInput.value = 'Customer Invoicing Gross Revenue & Debtors';
            if (cpnInput) cpnInput.value = 'Nominal Account';
            if (ctInput) ctInput.value = 'AC1';
            if (ctDescInput) ctDescInput.value = 'Fixed Nominal Account';
            if (defDetailsInput) defDetailsInput.value = '3010';
            if (defCtInput) defCtInput.value = '3010';
            if (overrideSelect) overrideSelect.value = 'Allowed';
            if (validFromInput) validFromInput.value = new Date().toISOString().slice(0, 10);
            if (moduleSelect) moduleSelect.value = 'INVOIC';
            if (notesInput) notesInput.value = '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        openEditModal(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.editingId = id;
            this.clearFormError();
            const modal = document.getElementById('modal-add-posting-control');
            const title = document.getElementById('modal-pc-title');
            const saveBtn = document.getElementById('btn-pc-save');

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            if (title) title.innerHTML = `<span>✏️</span> Edit Posting Control: <strong>${escapeHtml(item.postingType)} - ${escapeHtml(item.codePartName)} (${escapeHtml(item.company)})</strong>`;
            if (saveBtn) saveBtn.textContent = 'Update Posting Control';

            const compSelect = document.getElementById('pc-form-company');
            const typeInput = document.getElementById('pc-form-posting-type');
            const descInput = document.getElementById('pc-form-posting-desc');
            const cpnInput = document.getElementById('pc-form-code-part');
            const ctInput = document.getElementById('pc-form-control-type');
            const ctDescInput = document.getElementById('pc-form-control-desc');
            const defDetailsInput = document.getElementById('pc-form-def-details');
            const defCtInput = document.getElementById('pc-form-def-ct');
            const overrideSelect = document.getElementById('pc-form-override');
            const validFromInput = document.getElementById('pc-form-valid-from');
            const moduleSelect = document.getElementById('pc-form-module');
            const notesInput = document.getElementById('pc-form-notes');

            if (compSelect) compSelect.value = item.company || 'Laxmico Ltd';
            if (typeInput) typeInput.value = item.postingType || '';
            if (descInput) descInput.value = item.postingTypeDesc || '';
            if (cpnInput) cpnInput.value = item.codePartName || '';
            if (ctInput) ctInput.value = item.controlType || '';
            if (ctDescInput) ctDescInput.value = item.controlTypeDesc || '';
            if (defDetailsInput) defDetailsInput.value = item.defaultValueNoDetails || '';
            if (defCtInput) defCtInput.value = item.defaultValueNoCTValue || '';
            if (overrideSelect) overrideSelect.value = item.override || 'Allowed';
            if (validFromInput) validFromInput.value = item.validFrom || '';
            if (moduleSelect) moduleSelect.value = item.module || 'INVOIC';
            if (notesInput) notesInput.value = item.notes || '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-posting-control');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
            this.clearFormError();
        },

        saveForm() {
            this.clearFormError();

            const compSelect = document.getElementById('pc-form-company');
            const typeInput = document.getElementById('pc-form-posting-type');
            const descInput = document.getElementById('pc-form-posting-desc');
            const cpnInput = document.getElementById('pc-form-code-part');
            const ctInput = document.getElementById('pc-form-control-type');
            const ctDescInput = document.getElementById('pc-form-control-desc');
            const defDetailsInput = document.getElementById('pc-form-def-details');
            const defCtInput = document.getElementById('pc-form-def-ct');
            const overrideSelect = document.getElementById('pc-form-override');
            const validFromInput = document.getElementById('pc-form-valid-from');
            const moduleSelect = document.getElementById('pc-form-module');
            const notesInput = document.getElementById('pc-form-notes');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const postingType = typeInput ? typeInput.value.trim().toUpperCase() : '';
            const postingTypeDesc = descInput ? descInput.value.trim() : 'General Posting Control';
            const codePartName = cpnInput ? cpnInput.value.trim() : 'Nominal Account';
            const controlType = ctInput ? ctInput.value.trim().toUpperCase() : 'AC1';
            const controlTypeDesc = ctDescInput ? ctDescInput.value.trim() : 'Fixed Control Type';
            const defaultValueNoDetails = defDetailsInput ? defDetailsInput.value.trim() : '';
            const defaultValueNoCTValue = defCtInput ? defCtInput.value.trim() : defaultValueNoDetails;
            const override = overrideSelect ? overrideSelect.value : 'Allowed';
            const validFrom = validFromInput ? validFromInput.value.trim() : new Date().toISOString().slice(0, 10);
            const module = moduleSelect ? moduleSelect.value : 'INVOIC';
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!company) {
                this.showFormError('Company is required.');
                return;
            }
            if (!postingType) {
                this.showFormError('Posting Type is required.');
                return;
            }
            if (!codePartName) {
                this.showFormError('Code Part Name is required.');
                return;
            }
            if (!controlType) {
                this.showFormError('Control Type is required.');
                return;
            }
            if (!defaultValueNoDetails) {
                this.showFormError('Default Value No Details is required.');
                return;
            }

            if (this.editingId) {
                const idx = this.data.findIndex(d => d.id === this.editingId);
                if (idx !== -1) {
                    this.data[idx] = {
                        ...this.data[idx],
                        company,
                        postingType,
                        postingTypeDesc,
                        codePartName,
                        controlType,
                        controlTypeDesc,
                        defaultValueNoDetails,
                        defaultValueNoCTValue,
                        override,
                        validFrom,
                        module,
                        notes
                    };
                }
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Posting control for ${postingType} updated successfully.`, 'success');
                }
            } else {
                const existingIdx = this.data.findIndex(d => 
                    d.company.toLowerCase() === company.toLowerCase() &&
                    d.postingType.toUpperCase() === postingType.toUpperCase() &&
                    d.codePartName.toLowerCase() === codePartName.toLowerCase()
                );

                if (existingIdx !== -1) {
                    this.data[existingIdx] = {
                        ...this.data[existingIdx],
                        controlType,
                        controlTypeDesc,
                        defaultValueNoDetails,
                        defaultValueNoCTValue,
                        override,
                        validFrom,
                        module,
                        notes
                    };
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Existing posting control for ${company} (${postingType}) automatically updated.`, 'success');
                    }
                } else {
                    const newId = `pc-${String(Date.now()).slice(-6)}`;
                    this.data.unshift({
                        id: newId,
                        company,
                        postingType,
                        postingTypeDesc,
                        codePartName,
                        controlType,
                        controlTypeDesc,
                        defaultValueNoDetails,
                        defaultValueNoCTValue,
                        override,
                        validFrom,
                        module,
                        notes
                    });

                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`New posting control ${postingType} created successfully.`, 'success');
                    }
                }
            }

            this.saveData();
            this.closeModal();
            this.renderKPIs();
            this.renderTable();
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.data = this.data.filter(d => d.id !== id);
            this.selectedIds = this.selectedIds.filter(x => x !== id);
            this.saveData();
            this.renderKPIs();
            this.renderTable();

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Deleted posting control ${item.postingType}.`, 'info');
            }
        },

        bulkDelete() {
            if (this.selectedIds.length === 0) return;

            const count = this.selectedIds.length;
            this.data = this.data.filter(d => !this.selectedIds.includes(d.id));
            this.selectedIds = [];
            this.saveData();
            this.renderKPIs();
            this.renderTable();

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Deleted ${count} posting control records.`, 'info');
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No posting control records to export.', 'warning');
                }
                return;
            }

            const headers = [
                'Company',
                'Posting Type',
                'Posting Type Description',
                'Code Part Name',
                'Control Type',
                'Control Type Description',
                'Default Value No Details',
                'Default Value No CT Value',
                'Override',
                'Valid From',
                'Module',
                'Notes'
            ];

            const rows = filtered.map(d => [
                d.company,
                d.postingType,
                d.postingTypeDesc,
                d.codePartName,
                d.controlType,
                d.controlTypeDesc,
                d.defaultValueNoDetails,
                d.defaultValueNoCTValue,
                d.override,
                d.validFrom,
                d.module,
                d.notes || ''
            ]);

            const csvContent = [
                headers.map(h => `"${h}"`).join(','),
                ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `posting_control_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Exported ${filtered.length} posting control records to CSV.`, 'success');
            }
        },

        navigateToDetails(postingType) {
            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-posting-control-details');
                if (postingType && window.PostingControlModule) {
                    const fType = document.getElementById('filter-pcd-type');
                    if (fType) {
                        fType.value = postingType;
                    }
                    if (window.PostingControlModule.filters) {
                        window.PostingControlModule.filters.postingType = postingType;
                        window.PostingControlModule.renderTable();
                    }
                }
            }
        },

        bindEvents() {
            // Filter Search button
            const btnSearch = document.getElementById('btn-pc-filter-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => this.applyFilter());
            }

            // Filter Clear button
            const btnClear = document.getElementById('btn-pc-filter-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => this.clearFilter());
            }

            // Filter Inputs (Enter key triggering search)
            const filterInputs = [
                'filter-pc-search',
                'filter-pc-type',
                'filter-pc-code-part',
                'filter-pc-control-type',
                'filter-pc-def-details'
            ];
            filterInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.applyFilter();
                        }
                    });
                }
            });

            // Filter Dropdown change triggers
            const fComp = document.getElementById('filter-pc-company');
            if (fComp) {
                fComp.addEventListener('change', () => this.applyFilter());
            }

            // Select All Checkbox
            const selectAllCb = document.getElementById('cb-pc-select-all');
            if (selectAllCb) {
                selectAllCb.addEventListener('change', (e) => {
                    this.toggleSelectAll(e.target.checked);
                });
            }

            // Top & Bottom Add buttons
            const btnAddTop = document.getElementById('btn-add-fin-posting-control');
            if (btnAddTop) {
                btnAddTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }
            const btnAddBottom = document.getElementById('btn-pc-add');
            if (btnAddBottom) {
                btnAddBottom.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }

            // Delete selected button
            const btnDelete = document.getElementById('btn-pc-delete');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.deleteSelected();
                });
            }

            // Download CSV button
            const btnDownload = document.getElementById('btn-pc-download');
            if (btnDownload) {
                btnDownload.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }
            const btnExportCsv = document.getElementById('btn-pc-export-csv');
            if (btnExportCsv) {
                btnExportCsv.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }

            // Bottom "View Details" button
            const btnViewDetails = document.getElementById('btn-pc-view-details');
            if (btnViewDetails) {
                btnViewDetails.addEventListener('click', (e) => {
                    e.preventDefault();
                    let targetType = 'IP1';
                    if (this.selectedIds.length > 0) {
                        const firstItem = this.data.find(d => d.id === this.selectedIds[0]);
                        if (firstItem) targetType = firstItem.postingType;
                    }
                    this.navigateToDetails(targetType);
                });
            }

            // Modal Close & Cancel
            const btnClose = document.getElementById('btn-modal-pc-close');
            if (btnClose) {
                btnClose.addEventListener('click', () => this.closeModal());
            }
            const btnCancel = document.getElementById('btn-pc-cancel');
            if (btnCancel) {
                btnCancel.addEventListener('click', () => this.closeModal());
            }

            // Modal Save
            const btnSave = document.getElementById('btn-pc-save');
            if (btnSave) {
                btnSave.addEventListener('click', () => this.saveForm());
            }

            // Pagination Controls
            const btnFirst = document.getElementById('pc-page-first');
            if (btnFirst) {
                btnFirst.addEventListener('click', () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            const btnPrev = document.getElementById('pc-page-prev');
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.renderTable();
                    }
                });
            }

            const btnNext = document.getElementById('pc-page-next');
            if (btnNext) {
                btnNext.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize);
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.renderTable();
                    }
                });
            }

            const btnLast = document.getElementById('pc-page-last');
            if (btnLast) {
                btnLast.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize);
                    this.currentPage = totalPages > 0 ? totalPages : 1;
                    this.renderTable();
                });
            }

            const pageInput = document.getElementById('pc-page-input');
            if (pageInput) {
                pageInput.addEventListener('change', (e) => {
                    const val = parseInt(e.target.value, 10);
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                        this.currentPage = val;
                    }
                    this.renderTable();
                });
            }

            const rowsSelect = document.getElementById('pc-rows-select');
            if (rowsSelect) {
                rowsSelect.addEventListener('change', (e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                        this.pageSize = val;
                        this.currentPage = 1;
                        this.renderTable();
                    }
                });
            }
        },

        openModal() {
            this.openAddModal();
        },

        deleteSelected() {
            this.bulkDelete();
        },

        downloadCSV() {
            this.exportCSV();
        },

        toggleSelectAll(checked) {
            const checkboxes = document.querySelectorAll('.cb-pc-row');
            if (checkboxes) {
                checkboxes.forEach(cb => {
                    cb.checked = checked;
                    const id = cb.getAttribute('data-id');
                    if (checked) {
                        if (!this.selectedIds.includes(id)) this.selectedIds.push(id);
                    }
                });
                if (!checked) this.selectedIds = [];
            }
            this.updateActionButtons();
        },

        applyFilter() {
            const fComp = document.getElementById('filter-pc-company');
            const fType = document.getElementById('filter-pc-type');
            const fCodePart = document.getElementById('filter-pc-code-part');
            const fCtrlType = document.getElementById('filter-pc-control-type');
            const fDefDetails = document.getElementById('filter-pc-def-details');
            const fSearch = document.getElementById('filter-pc-search');

            this.filters.company = fComp ? fComp.value : '';
            this.filters.postingType = fType ? fType.value.trim() : '';
            this.filters.codePartName = fCodePart ? fCodePart.value.trim() : '';
            this.filters.controlType = fCtrlType ? fCtrlType.value.trim() : '';
            this.filters.defNoDetails = fDefDetails ? fDefDetails.value.trim() : '';
            this.filters.search = fSearch ? fSearch.value.trim().toLowerCase() : '';

            this.currentPage = 1;
            this.renderTable();
        },

        clearFilter() {
            const fComp = document.getElementById('filter-pc-company');
            const fType = document.getElementById('filter-pc-type');
            const fCodePart = document.getElementById('filter-pc-code-part');
            const fCtrlType = document.getElementById('filter-pc-control-type');
            const fDefDetails = document.getElementById('filter-pc-def-details');
            const fSearch = document.getElementById('filter-pc-search');

            if (fComp) fComp.value = 'all';
            if (fType) fType.value = '';
            if (fCodePart) fCodePart.value = '';
            if (fCtrlType) fCtrlType.value = '';
            if (fDefDetails) fDefDetails.value = '';
            if (fSearch) fSearch.value = '';

            this.filters = {
                company: '',
                postingType: '',
                codePartName: '',
                controlType: '',
                defNoDetails: '',
                search: ''
            };
            this.currentPage = 1;
            this.renderTable();
        }
    };

    // Global document delegation for modal opening
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-posting-control, #btn-pc-add');
        if (addBtn) {
            e.preventDefault();
            if (window.PostingControlHeaderModule && typeof window.PostingControlHeaderModule.openAddModal === 'function') {
                window.PostingControlHeaderModule.openAddModal();
            } else {
                const modal = document.getElementById('modal-add-posting-control');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }
        }
    });

    window.PostingControlHeaderModule = PostingControlHeaderModule;

    // Auto-init on DOMContentLoaded or immediate if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PostingControlHeaderModule.init());
    } else {
        PostingControlHeaderModule.init();
    }

})(window);
