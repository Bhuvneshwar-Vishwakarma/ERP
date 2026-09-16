/**
 * posting_control_module.js
 * 
 * Modern ERP Design for Posting Control Details Master (ERP-FIN-MAS-012):
 * - Fields from screenshot:
 *   - Filters: Company (active enabled select), Posting Type, Code Part Name, Control Type,
 *              Default Value No Details, Default Value No CT Value, Valid From, Search Button (magnifying glass)
 *   - Table: Multi-select Checkbox, Control Type, Code Part, Code Part Desc, Specific Control Type,
 *            Specific Control Type Desc, Specific Default No Details, Specific Default No CT Value, Valid From, Actions
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), Pagination (Page X of Y, rows dropdown e.g. 1000, record count)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Posting Controls, Governed Posting Types, Active Code Parts, Default Fallback Rules)
 *   - Clean cards, modern typography, color-coded badges, and responsive tables
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add/Edit modal opening and button handlers (inline onclick, module listener, document delegation)
 *   - Edit & Delete per row, bulk delete, multi-criteria search and filter
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data for Laxmico Ltd, B&S International, and B&S UK Trading
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_POSTING_CONTROL_V1';

    const POSTING_TYPES = [
        { code: 'IP1', name: 'Customer Invoicing (Revenue & Trade Debtors)', module: 'AR', defaultCodePart: 'A' },
        { code: 'IP2', name: 'Customer Invoicing VAT / Output Tax', module: 'AR', defaultCodePart: 'A' },
        { code: 'PP1', name: 'Supplier Invoicing (Direct Cost & AP Creditors)', module: 'AP', defaultCodePart: 'A' },
        { code: 'PP2', name: 'Supplier Invoicing Input VAT / Deductible Tax', module: 'AP', defaultCodePart: 'A' },
        { code: 'GP1', name: 'Goods Received Not Invoiced (GRNI Clearing)', module: 'INV', defaultCodePart: 'A' },
        { code: 'GP2', name: 'Purchase Price Variance (PPV Clearing)', module: 'INV', defaultCodePart: 'B' },
        { code: 'M1', name: 'Manual GL Journal Balancing & Adjustments', module: 'GL', defaultCodePart: 'A' },
        { code: 'AP1', name: 'Supplier Payment Withholding & Prepayments', module: 'AP', defaultCodePart: 'A' },
        { code: 'AR1', name: 'Customer Direct Wire & Overpayment Clearing', module: 'AR', defaultCodePart: 'A' },
        { code: 'FA1', name: 'Fixed Asset Monthly Depreciation Expense', module: 'ASSET', defaultCodePart: 'B' },
        { code: 'FA2', name: 'Fixed Asset Accumulated Depreciation', module: 'ASSET', defaultCodePart: 'A' },
        { code: 'BNK1', name: 'Bank Account Transit & Clearing Transfers', module: 'BANK', defaultCodePart: 'A' }
    ];

    const CODE_PARTS = [
        { code: 'A', name: 'Nominal Account', desc: 'Primary General Ledger Account (Mandatory Root Balance)', color: '#2563eb', bg: '#eff6ff' },
        { code: 'B', name: 'Cost Center', desc: 'Departmental Cost Center Allocation (Operating Units)', color: '#059669', bg: '#ecfdf5' },
        { code: 'C', name: 'Project', desc: 'Capital Expenditure or Commercial Project Identifier', color: '#7c3aed', bg: '#f5f3ff' },
        { code: 'D', name: 'Product Group', desc: 'Inventory Merchandise / Finished Goods Category', color: '#ea580c', bg: '#fff7ed' },
        { code: 'E', name: 'Market Region', desc: 'Geographical Revenue Segment (UK, EU, International)', color: '#0891b2', bg: '#ecfeff' }
    ];

    const CONTROL_TYPES = [
        { code: 'AC1', name: 'Fixed Nominal Account', desc: 'Single fixed nominal code for all transactions' },
        { code: 'AC2', name: 'By Supplier Group', desc: 'Account derived from Supplier Master posting group' },
        { code: 'AC3', name: 'By Customer Group', desc: 'Account derived from Customer Master category' },
        { code: 'CC1', name: 'By Operating Department', desc: 'Cost center determined by initiating user department' },
        { code: 'CC2', name: 'Fixed Cost Center', desc: 'Pre-defined static cost center code' },
        { code: 'PR1', name: 'By Product Category', desc: 'Ledger split determined by item inventory classification' },
        { code: 'TX1', name: 'By Tax Code Linkage', desc: 'Tax nominal mapped from applied VAT / Duty rate code' }
    ];

    const SEED_DATA = [
        {
            id: 'pcd-001',
            company: 'Laxmico Ltd',
            postingType: 'IP1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '3010',
            specificDefaultNoCTValue: '3010',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Default UK domestic customer invoice revenue account'
        },
        {
            id: 'pcd-002',
            company: 'Laxmico Ltd',
            postingType: 'IP1',
            controlType: 'CC1',
            codePart: 'B',
            codePartDesc: 'Cost Center',
            specificControlType: 'CC1',
            specificControlTypeDesc: 'By Operating Department',
            specificDefaultNoDetails: '100',
            specificDefaultNoCTValue: '100',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Headquarters sales department cost allocation'
        },
        {
            id: 'pcd-003',
            company: 'Laxmico Ltd',
            postingType: 'IP2',
            controlType: 'TX1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'TX1',
            specificControlTypeDesc: 'By Tax Code Linkage',
            specificDefaultNoDetails: '2200',
            specificDefaultNoCTValue: '2200',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'HMRC Output VAT 20% Standard Rate liability account'
        },
        {
            id: 'pcd-004',
            company: 'Laxmico Ltd',
            postingType: 'PP1',
            controlType: 'AC2',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC2',
            specificControlTypeDesc: 'By Supplier Group',
            specificDefaultNoDetails: '2110',
            specificDefaultNoCTValue: '2110',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Commercial trade supplier creditors ledger control'
        },
        {
            id: 'pcd-005',
            company: 'Laxmico Ltd',
            postingType: 'PP1',
            controlType: 'CC1',
            codePart: 'B',
            codePartDesc: 'Cost Center',
            specificControlType: 'CC1',
            specificControlTypeDesc: 'By Operating Department',
            specificDefaultNoDetails: '200',
            specificDefaultNoCTValue: '200',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Procurement and logistics operating cost center'
        },
        {
            id: 'pcd-006',
            company: 'Laxmico Ltd',
            postingType: 'PP2',
            controlType: 'TX1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'TX1',
            specificControlTypeDesc: 'By Tax Code Linkage',
            specificDefaultNoDetails: '2210',
            specificDefaultNoCTValue: '2210',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'HMRC Input VAT recovery control account'
        },
        {
            id: 'pcd-007',
            company: 'Laxmico Ltd',
            postingType: 'GP1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '2120',
            specificDefaultNoCTValue: '2120',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'GRNI accrual clearing for pending goods in transit'
        },
        {
            id: 'pcd-008',
            company: 'Laxmico Ltd',
            postingType: 'GP2',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '5030',
            specificDefaultNoCTValue: '5030',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Purchase price variance between PO and GRN valuation'
        },
        {
            id: 'pcd-009',
            company: 'Laxmico Ltd',
            postingType: 'M1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '9999',
            specificDefaultNoCTValue: '9999',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Manual suspense clearing fallback'
        },
        {
            id: 'pcd-010',
            company: 'Laxmico Ltd',
            postingType: 'FA1',
            controlType: 'CC1',
            codePart: 'B',
            codePartDesc: 'Cost Center',
            specificControlType: 'CC1',
            specificControlTypeDesc: 'By Operating Department',
            specificDefaultNoDetails: '500',
            specificDefaultNoCTValue: '500',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Plant & machinery monthly depreciation expense center'
        },
        {
            id: 'pcd-011',
            company: 'B&S International',
            postingType: 'IP1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '3100',
            specificDefaultNoCTValue: '3100',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Global cross-border export sales revenue'
        },
        {
            id: 'pcd-012',
            company: 'B&S International',
            postingType: 'PP1',
            controlType: 'AC2',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC2',
            specificControlTypeDesc: 'By Supplier Group',
            specificDefaultNoDetails: '2150',
            specificDefaultNoCTValue: '2150',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Foreign currency overseas trade liabilities'
        },
        {
            id: 'pcd-013',
            company: 'B&S UK Trading',
            postingType: 'IP1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '3020',
            specificDefaultNoCTValue: '3020',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'UK Trading wholesale distribution revenue'
        },
        {
            id: 'pcd-014',
            company: 'B&S UK Trading',
            postingType: 'GP1',
            controlType: 'AC1',
            codePart: 'A',
            codePartDesc: 'Nominal Account',
            specificControlType: 'AC1',
            specificControlTypeDesc: 'Fixed Nominal Account',
            specificDefaultNoDetails: '2125',
            specificDefaultNoCTValue: '2125',
            validFrom: '2026-01-01',
            status: 'Active',
            notes: 'Wholesale logistics goods receipt in transit clearing'
        }
    ];

    const PostingControlModule = {
        data: [],
        postingTypes: POSTING_TYPES,
        codeParts: CODE_PARTS,
        controlTypes: CONTROL_TYPES,
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
            defNoCT: '',
            validFrom: '',
            search: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('PostingControlModule initialized successfully.');
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
                console.warn('[PostingControl] Error loading localStorage:', err);
            }
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.saveData();
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.warn('[PostingControl] Error saving localStorage:', err);
            }
        },

        getFilteredData() {
            let list = [...this.data];

            const c = (this.filters.company || '').trim().toLowerCase();
            const pt = (this.filters.postingType || '').trim().toUpperCase();
            const cpn = (this.filters.codePartName || '').trim().toLowerCase();
            const ct = (this.filters.controlType || '').trim().toLowerCase();
            const dnd = (this.filters.defNoDetails || '').trim().toLowerCase();
            const dnct = (this.filters.defNoCT || '').trim().toLowerCase();
            const vf = (this.filters.validFrom || '').trim();
            const q = (this.filters.search || '').trim().toLowerCase();

            if (c && c !== 'all') {
                list = list.filter(item => (item.company || '').toLowerCase().includes(c));
            }
            if (pt && pt !== 'ALL') {
                list = list.filter(item => (item.postingType || '').toUpperCase() === pt);
            }
            if (cpn) {
                list = list.filter(item => (item.codePartDesc || '').toLowerCase().includes(cpn) || (item.codePart || '').toLowerCase().includes(cpn));
            }
            if (ct) {
                list = list.filter(item => (item.controlType || '').toLowerCase().includes(ct) || (item.specificControlType || '').toLowerCase().includes(ct));
            }
            if (dnd) {
                list = list.filter(item => (item.specificDefaultNoDetails || '').toLowerCase().includes(dnd));
            }
            if (dnct) {
                list = list.filter(item => (item.specificDefaultNoCTValue || '').toLowerCase().includes(dnct));
            }
            if (vf) {
                list = list.filter(item => (item.validFrom || '').startsWith(vf));
            }
            if (q) {
                list = list.filter(item => {
                    const haystack = `${item.company} ${item.postingType} ${item.controlType} ${item.codePart} ${item.codePartDesc} ${item.specificControlType} ${item.specificControlTypeDesc} ${item.specificDefaultNoDetails} ${item.specificDefaultNoCTValue} ${item.notes || ''}`.toLowerCase();
                    return haystack.includes(q);
                });
            }

            return list;
        },

        renderKPIs() {
            const total = this.data.length;
            const uniqueTypes = new Set(this.data.map(d => d.postingType)).size;
            const uniqueCodeParts = new Set(this.data.map(d => d.codePart)).size;
            const fallbackCount = this.data.filter(d => Boolean(d.specificDefaultNoDetails && d.specificDefaultNoDetails !== 'N/A')).length;

            const elTotal = document.getElementById('pcd-kpi-total');
            const elTypes = document.getElementById('pcd-kpi-types');
            const elParts = document.getElementById('pcd-kpi-parts');
            const elDefaults = document.getElementById('pcd-kpi-defaults');

            if (elTotal) elTotal.textContent = `${total} Rules`;
            if (elTypes) elTypes.textContent = `${uniqueTypes} Types`;
            if (elParts) elParts.textContent = `${uniqueCodeParts} Code Parts`;
            if (elDefaults) elDefaults.textContent = `${fallbackCount} Fallbacks`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-pcd-list');
            if (!tbody) return;

            const filtered = this.getFilteredData();
            const total = filtered.length;
            const totalPages = Math.ceil(total / this.pageSize) || 1;
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            const startIdx = (this.currentPage - 1) * this.pageSize;
            const paginated = filtered.slice(startIdx, startIdx + this.pageSize);

            // Update badge / counter
            const countBadge = document.getElementById('pcd-total-count');
            if (countBadge) {
                countBadge.textContent = `${total} Records`;
            }

            const pageInfo = document.getElementById('pcd-page-info');
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${total} total records)`;
            }

            const pageInput = document.getElementById('pcd-page-input');
            if (pageInput) {
                pageInput.value = this.currentPage;
            }

            if (paginated.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                            <div style="font-size: 38px; margin-bottom: 8px;">⚙️</div>
                            <div style="font-size: 14px; font-weight: 600; color: #334155;">No Posting Control Rules Found</div>
                            <div style="font-size: 12px; margin-top: 4px;">Try modifying your search criteria or click "Clear Filters"</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            tbody.innerHTML = paginated.map(item => {
                const isSelected = this.selectedIds.includes(item.id);
                const codePartMeta = CODE_PARTS.find(cp => cp.code === item.codePart) || { color: '#2563eb', bg: '#eff6ff' };

                return `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${isSelected ? 'background-color: #eff6ff;' : ''}" class="hover-row">
                        <td style="text-align: center; padding: 10px 8px;">
                            <input type="checkbox" class="cb-pcd-row" data-id="${escapeHtml(item.id)}" ${isSelected ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 10px 12px; font-weight: 700; color: #1e293b; font-size: 12.5px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1;">
                                    ${escapeHtml(item.postingType)}
                                </span>
                            </div>
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; color: #334155; font-weight: 600;">
                            <span style="font-family: 'JetBrains Mono', monospace; color: #475569;">${escapeHtml(item.controlType)}</span>
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: ${codePartMeta.color}; background: ${codePartMeta.bg};">
                                ${escapeHtml(item.codePart)}
                            </span>
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; color: #1e293b; font-weight: 500;">
                            ${escapeHtml(item.codePartDesc)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #0f172a;">
                            ${escapeHtml(item.specificControlType)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; color: #475569;">
                            ${escapeHtml(item.specificControlTypeDesc)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #059669;">
                            ${escapeHtml(item.specificDefaultNoDetails)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; font-family: 'JetBrains Mono', monospace; color: #64748b;">
                            ${escapeHtml(item.specificDefaultNoCTValue)}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
                            ${escapeHtml(item.validFrom)}
                        </td>
                        <td style="padding: 10px 12px; text-align: right; white-space: nowrap;">
                            <button type="button" class="btn-pcd-edit btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 26px; padding: 0 8px; font-size: 11px; margin-right: 4px;" title="Edit Rule">
                                ✏️ Edit
                            </button>
                            <button type="button" class="btn-pcd-delete-row btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 26px; padding: 0 8px; font-size: 11px; color: #ef4444;" title="Delete Rule">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind row checkboxes
            const rowCheckboxes = tbody.querySelectorAll('.cb-pcd-row');
            rowCheckboxes.forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (e.target.checked) {
                        if (!this.selectedIds.includes(id)) this.selectedIds.push(id);
                    } else {
                        this.selectedIds = this.selectedIds.filter(x => x !== id);
                    }
                    this.updateDeleteButton();
                    const tr = e.target.closest('tr');
                    if (tr) {
                        tr.style.backgroundColor = e.target.checked ? '#eff6ff' : '';
                    }
                });
            });

            // Bind row action buttons
            tbody.querySelectorAll('.btn-pcd-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.openEditModal(id);
                });
            });

            tbody.querySelectorAll('.btn-pcd-delete-row').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.deleteRow(id);
                });
            });

            // Update master select-all state
            const selectAllCb = document.getElementById('cb-pcd-select-all');
            if (selectAllCb) {
                const allSelected = paginated.length > 0 && paginated.every(p => this.selectedIds.includes(p.id));
                selectAllCb.checked = allSelected;
            }

            this.updateDeleteButton();
        },

        updateDeleteButton() {
            const delBtn = document.getElementById('btn-pcd-delete');
            if (!delBtn) return;

            const count = this.selectedIds.length;
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
        },

        showFormError(msg) {
            const alertBox = document.getElementById('pcd-form-alert');
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
            const alertBox = document.getElementById('pcd-form-alert');
            if (alertBox) {
                alertBox.textContent = '';
                alertBox.style.display = 'none';
            }
        },

        openAddModal() {
            this.editingId = null;
            this.clearFormError();
            const modal = document.getElementById('modal-add-posting-control-details');
            const title = document.getElementById('modal-pcd-title');
            const saveBtn = document.getElementById('btn-pcd-save');

            if (title) title.innerHTML = '<span>⚙️</span> Add Posting Control Details';
            if (saveBtn) saveBtn.textContent = 'Save Posting Control';

            // Populate defaults from filter values
            const fComp = document.getElementById('filter-pcd-company');
            const fType = document.getElementById('filter-pcd-type');

            const compSelect = document.getElementById('pcd-form-company');
            const typeSelect = document.getElementById('pcd-form-posting-type');
            const codePartSelect = document.getElementById('pcd-form-code-part');
            const ctInput = document.getElementById('pcd-form-control-type');
            const specCtInput = document.getElementById('pcd-form-spec-control-type');
            const specDescInput = document.getElementById('pcd-form-spec-desc');
            const defDetailsInput = document.getElementById('pcd-form-def-no-details');
            const defCtInput = document.getElementById('pcd-form-def-no-ct');
            const validFromInput = document.getElementById('pcd-form-valid-from');
            const notesInput = document.getElementById('pcd-form-notes');

            if (compSelect) compSelect.value = (fComp && fComp.value && fComp.value !== 'all') ? fComp.value : 'Laxmico Ltd';
            if (typeSelect) typeSelect.value = (fType && fType.value && fType.value !== 'all') ? fType.value : 'IP1';
            if (codePartSelect) codePartSelect.value = 'A';
            if (ctInput) ctInput.value = 'AC1';
            if (specCtInput) specCtInput.value = 'AC1';
            if (specDescInput) specDescInput.value = 'Fixed Nominal Account';
            if (defDetailsInput) defDetailsInput.value = '3010';
            if (defCtInput) defCtInput.value = '3010';
            if (validFromInput) validFromInput.value = new Date().toISOString().slice(0, 10);
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
            const modal = document.getElementById('modal-add-posting-control-details');
            const title = document.getElementById('modal-pcd-title');
            const saveBtn = document.getElementById('btn-pcd-save');

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            if (title) title.innerHTML = `<span>✏️</span> Edit Posting Control: <strong>${escapeHtml(item.postingType)} - ${escapeHtml(item.codePart)} (${escapeHtml(item.company)})</strong>`;
            if (saveBtn) saveBtn.textContent = 'Update Posting Control';

            const compSelect = document.getElementById('pcd-form-company');
            const typeSelect = document.getElementById('pcd-form-posting-type');
            const codePartSelect = document.getElementById('pcd-form-code-part');
            const ctInput = document.getElementById('pcd-form-control-type');
            const specCtInput = document.getElementById('pcd-form-spec-control-type');
            const specDescInput = document.getElementById('pcd-form-spec-desc');
            const defDetailsInput = document.getElementById('pcd-form-def-no-details');
            const defCtInput = document.getElementById('pcd-form-def-no-ct');
            const validFromInput = document.getElementById('pcd-form-valid-from');
            const notesInput = document.getElementById('pcd-form-notes');

            if (compSelect) compSelect.value = item.company || 'Laxmico Ltd';
            if (typeSelect) typeSelect.value = item.postingType || 'IP1';
            if (codePartSelect) codePartSelect.value = item.codePart || 'A';
            if (ctInput) ctInput.value = item.controlType || 'AC1';
            if (specCtInput) specCtInput.value = item.specificControlType || '';
            if (specDescInput) specDescInput.value = item.specificControlTypeDesc || '';
            if (defDetailsInput) defDetailsInput.value = item.specificDefaultNoDetails || '';
            if (defCtInput) defCtInput.value = item.specificDefaultNoCTValue || '';
            if (validFromInput) validFromInput.value = item.validFrom || '';
            if (notesInput) notesInput.value = item.notes || '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-posting-control-details');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
            this.clearFormError();
        },

        saveForm() {
            this.clearFormError();

            const compSelect = document.getElementById('pcd-form-company');
            const typeSelect = document.getElementById('pcd-form-posting-type');
            const codePartSelect = document.getElementById('pcd-form-code-part');
            const ctInput = document.getElementById('pcd-form-control-type');
            const specCtInput = document.getElementById('pcd-form-spec-control-type');
            const specDescInput = document.getElementById('pcd-form-spec-desc');
            const defDetailsInput = document.getElementById('pcd-form-def-no-details');
            const defCtInput = document.getElementById('pcd-form-def-no-ct');
            const validFromInput = document.getElementById('pcd-form-valid-from');
            const notesInput = document.getElementById('pcd-form-notes');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const postingType = typeSelect ? typeSelect.value.trim().toUpperCase() : 'IP1';
            const codePart = codePartSelect ? codePartSelect.value.trim().toUpperCase() : 'A';
            const controlType = ctInput ? ctInput.value.trim().toUpperCase() : 'AC1';
            const specificControlType = specCtInput ? specCtInput.value.trim().toUpperCase() : controlType;
            const specificControlTypeDesc = specDescInput ? specDescInput.value.trim() : 'Fixed Control Type';
            const specificDefaultNoDetails = defDetailsInput ? defDetailsInput.value.trim() : '';
            const specificDefaultNoCTValue = defCtInput ? defCtInput.value.trim() : '';
            const validFrom = validFromInput ? validFromInput.value.trim() : new Date().toISOString().slice(0, 10);
            const notes = notesInput ? notesInput.value.trim() : '';

            // Validation
            if (!company) {
                this.showFormError('Company is required.');
                return;
            }
            if (!postingType) {
                this.showFormError('Posting Type is required.');
                return;
            }
            if (!codePart) {
                this.showFormError('Code Part is required.');
                return;
            }
            if (!controlType) {
                this.showFormError('Control Type is required.');
                return;
            }
            if (!specificDefaultNoDetails) {
                this.showFormError('Specific Default No Details value is required.');
                return;
            }

            const codePartMeta = CODE_PARTS.find(cp => cp.code === codePart) || { name: 'Nominal Account' };

            if (this.editingId) {
                // Update existing record
                const idx = this.data.findIndex(d => d.id === this.editingId);
                if (idx !== -1) {
                    this.data[idx] = {
                        ...this.data[idx],
                        company,
                        postingType,
                        codePart,
                        codePartDesc: codePartMeta.name,
                        controlType,
                        specificControlType,
                        specificControlTypeDesc,
                        specificDefaultNoDetails,
                        specificDefaultNoCTValue: specificDefaultNoCTValue || specificDefaultNoDetails,
                        validFrom,
                        notes
                    };
                }
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Posting control rule for ${postingType} (${codePart}) updated successfully.`, 'success');
                }
            } else {
                // Check if duplicate posting rule already exists for company + postingType + codePart + controlType
                const existingIdx = this.data.findIndex(d => 
                    d.company.toLowerCase() === company.toLowerCase() &&
                    d.postingType.toUpperCase() === postingType.toUpperCase() &&
                    d.codePart.toUpperCase() === codePart.toUpperCase() &&
                    d.controlType.toUpperCase() === controlType.toUpperCase()
                );

                if (existingIdx !== -1) {
                    // Frictionless update without blocking popup
                    this.data[existingIdx] = {
                        ...this.data[existingIdx],
                        specificControlType,
                        specificControlTypeDesc,
                        specificDefaultNoDetails,
                        specificDefaultNoCTValue: specificDefaultNoCTValue || specificDefaultNoDetails,
                        validFrom,
                        notes
                    };
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Existing rule for ${company} (${postingType} / ${codePart}) automatically updated.`, 'success');
                    }
                } else {
                    // Create new record
                    const newId = `pcd-${String(Date.now()).slice(-6)}`;
                    this.data.unshift({
                        id: newId,
                        company,
                        postingType,
                        codePart,
                        codePartDesc: codePartMeta.name,
                        controlType,
                        specificControlType,
                        specificControlTypeDesc,
                        specificDefaultNoDetails,
                        specificDefaultNoCTValue: specificDefaultNoCTValue || specificDefaultNoDetails,
                        validFrom,
                        status: 'Active',
                        notes
                    });

                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`New posting control rule for ${postingType} (${codePart}) created successfully.`, 'success');
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
                window.showNotification(`Deleted posting control rule ${item.postingType} (${item.codePart}).`, 'info');
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
                window.showNotification(`Deleted ${count} posting control rules.`, 'info');
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
                'Control Type',
                'Code Part',
                'Code Part Description',
                'Specific Control Type',
                'Specific Control Type Description',
                'Specific Default No Details',
                'Specific Default No CT Value',
                'Valid From',
                'Notes'
            ];

            const rows = filtered.map(d => [
                d.company,
                d.postingType,
                d.controlType,
                d.codePart,
                d.codePartDesc,
                d.specificControlType,
                d.specificControlTypeDesc,
                d.specificDefaultNoDetails,
                d.specificDefaultNoCTValue,
                d.validFrom,
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
            a.download = `posting_control_details_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Exported ${filtered.length} posting control records to CSV.`, 'success');
            }
        },

        bindEvents() {
            // Filter Search button
            const btnSearch = document.getElementById('btn-pcd-filter-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => this.applyFilter());
            }

            // Filter Clear button
            const btnClear = document.getElementById('btn-pcd-filter-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => this.clearFilter());
            }

            // Filter Inputs (Enter key triggering search)
            const filterInputs = [
                'filter-pcd-search',
                'filter-pcd-code-part',
                'filter-pcd-control-type',
                'filter-pcd-def-details',
                'filter-pcd-def-ct',
                'filter-pcd-valid-from'
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
            const fComp = document.getElementById('filter-pcd-company');
            if (fComp) {
                fComp.addEventListener('change', () => this.applyFilter());
            }
            const fType = document.getElementById('filter-pcd-type');
            if (fType) {
                fType.addEventListener('change', () => this.applyFilter());
            }

            // Select All Checkbox
            const selectAllCb = document.getElementById('cb-pcd-select-all');
            if (selectAllCb) {
                selectAllCb.addEventListener('change', (e) => {
                    this.toggleSelectAll(e.target.checked);
                });
            }

            // Top Add button
            const btnAddTop = document.getElementById('btn-add-fin-posting-control-details');
            if (btnAddTop) {
                btnAddTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }

            // Bottom Add button
            const btnAddBottom = document.getElementById('btn-pcd-add');
            if (btnAddBottom) {
                btnAddBottom.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }

            // Delete selected button
            const btnDelete = document.getElementById('btn-pcd-delete');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.deleteSelected();
                });
            }

            // Download CSV button
            const btnDownload = document.getElementById('btn-pcd-download');
            if (btnDownload) {
                btnDownload.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }
            const btnExportCsv = document.getElementById('btn-pcd-export-csv');
            if (btnExportCsv) {
                btnExportCsv.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }

            // Modal Close & Cancel
            const btnClose = document.getElementById('btn-modal-pcd-close');
            if (btnClose) {
                btnClose.addEventListener('click', () => this.closeModal());
            }
            const btnCancel = document.getElementById('btn-pcd-cancel');
            if (btnCancel) {
                btnCancel.addEventListener('click', () => this.closeModal());
            }

            // Modal Save
            const btnSave = document.getElementById('btn-pcd-save');
            if (btnSave) {
                btnSave.addEventListener('click', () => this.saveForm());
            }

            // Modal Code Part change -> update Code Part Desc
            const formCodePart = document.getElementById('pcd-form-code-part');
            if (formCodePart) {
                formCodePart.addEventListener('change', (e) => {
                    const cp = CODE_PARTS.find(x => x.code === e.target.value);
                    if (cp) {
                        const formDesc = document.getElementById('pcd-form-spec-desc');
                        if (formDesc && !this.editingId) {
                            formDesc.value = `${cp.name} Posting Rule`;
                        }
                    }
                });
            }

            // Pagination Controls
            const btnFirst = document.getElementById('pcd-page-first');
            if (btnFirst) {
                btnFirst.addEventListener('click', () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            const btnPrev = document.getElementById('pcd-page-prev');
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.renderTable();
                    }
                });
            }

            const btnNext = document.getElementById('pcd-page-next');
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

            const btnLast = document.getElementById('pcd-page-last');
            if (btnLast) {
                btnLast.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize);
                    this.currentPage = totalPages > 0 ? totalPages : 1;
                    this.renderTable();
                });
            }

            const pageInput = document.getElementById('pcd-page-input');
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

            const rowsSelect = document.getElementById('pcd-rows-select');
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
            const checkboxes = document.querySelectorAll('.cb-pcd-row');
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
            this.updateDeleteButton();
        },

        applyFilter() {
            const fComp = document.getElementById('filter-pcd-company');
            const fType = document.getElementById('filter-pcd-type');
            const fCodePart = document.getElementById('filter-pcd-code-part');
            const fCtrlType = document.getElementById('filter-pcd-control-type');
            const fDefDetails = document.getElementById('filter-pcd-def-details');
            const fDefCt = document.getElementById('filter-pcd-def-ct');
            const fValidFrom = document.getElementById('filter-pcd-valid-from');
            const fSearch = document.getElementById('filter-pcd-search');

            this.filters.company = fComp ? fComp.value : '';
            this.filters.postingType = fType ? fType.value : '';
            this.filters.codePartName = fCodePart ? fCodePart.value.trim() : '';
            this.filters.controlType = fCtrlType ? fCtrlType.value.trim() : '';
            this.filters.defNoDetails = fDefDetails ? fDefDetails.value.trim() : '';
            this.filters.defNoCT = fDefCt ? fDefCt.value.trim() : '';
            this.filters.validFrom = fValidFrom ? fValidFrom.value.trim() : '';
            this.filters.search = fSearch ? fSearch.value.trim().toLowerCase() : '';

            this.currentPage = 1;
            this.renderTable();
        },

        clearFilter() {
            const fComp = document.getElementById('filter-pcd-company');
            const fType = document.getElementById('filter-pcd-type');
            const fCodePart = document.getElementById('filter-pcd-code-part');
            const fCtrlType = document.getElementById('filter-pcd-control-type');
            const fDefDetails = document.getElementById('filter-pcd-def-details');
            const fDefCt = document.getElementById('filter-pcd-def-ct');
            const fValidFrom = document.getElementById('filter-pcd-valid-from');
            const fSearch = document.getElementById('filter-pcd-search');

            if (fComp) fComp.value = 'all';
            if (fType) fType.value = 'all';
            if (fCodePart) fCodePart.value = '';
            if (fCtrlType) fCtrlType.value = '';
            if (fDefDetails) fDefDetails.value = '';
            if (fDefCt) fDefCt.value = '';
            if (fValidFrom) fValidFrom.value = '';
            if (fSearch) fSearch.value = '';

            this.filters = {
                company: '',
                postingType: '',
                codePartName: '',
                controlType: '',
                defNoDetails: '',
                defNoCT: '',
                validFrom: '',
                search: ''
            };
            this.currentPage = 1;
            this.renderTable();
        }
    };

    // Global document delegation for modal opening
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-posting-control-details, #btn-pcd-add');
        if (addBtn) {
            e.preventDefault();
            if (window.PostingControlModule && typeof window.PostingControlModule.openAddModal === 'function') {
                window.PostingControlModule.openAddModal();
            } else {
                const modal = document.getElementById('modal-add-posting-control-details');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }
        }
    });

    window.PostingControlModule = PostingControlModule;

    // Auto-init on DOMContentLoaded or immediate if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PostingControlModule.init());
    } else {
        PostingControlModule.init();
    }

})(window);
