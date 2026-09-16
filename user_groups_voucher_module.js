/**
 * user_groups_voucher_module.js
 * 
 * Modern ERP Design for User Groups Per Voucher Series Master (ERP-FIN-MAS-011):
 * - Fields from screenshot:
 *   - Filters: Company (enabled select), Voucher Type, Year, Search button, Clear Filters
 *   - Table: Checkbox, User Group, Description, Authorization Level, Default Type, Function Group, Actions
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), Pagination (|< < Page X of Y > >|, Rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Mappings, User Groups Bound, Full Admin Mappings, Governed Voucher Types)
 *   - Modern card system, clean typography, badge pills for Auth Level and Function Groups
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add modal opening (inline onclick, module method, document delegation)
 *   - Non-blocking validation banner and in-app toast notifications (zero blocking native alerts)
 *   - Full CRUD, bulk delete, multi-criteria filtering, and CSV export
 *   - LocalStorage persistence with realistic seed data for Laxmico Ltd, B&S International, and B&S UK Trading
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_USER_GROUPS_VOUCHER_V1';

    const AUTH_LEVELS = [
        { level: 9, name: 'Level 9 - Full Access (Create, Post, Approve, Reverse)', badgeClass: 'badge-purple', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
        { level: 7, name: 'Level 7 - Entry & Direct Post', badgeClass: 'badge-success', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        { level: 5, name: 'Level 5 - Entry Only (Draft / Verification Required)', badgeClass: 'badge-info', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
        { level: 3, name: 'Level 3 - Approval & Audit Review Only', badgeClass: 'badge-warning', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        { level: 1, name: 'Level 1 - Read Only (Inquiry & Reporting)', badgeClass: 'badge-secondary', color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' }
    ];

    const DEFAULT_TYPES = [
        { code: 'Normal', name: 'Normal (Standard Operational Posting)' },
        { code: 'Automatic', name: 'Automatic (System & Interface Posting)' },
        { code: 'Year-End Closing', name: 'Year-End Closing (Fiscal Closing / Opening)' },
        { code: 'Adjustment', name: 'Adjustment (Variance & Inventory Revaluation)' },
        { code: 'Special Posting', name: 'Special Posting (Manual Journal Adjustments)' }
    ];

    const FUNCTION_GROUPS = [
        { code: 'AP', name: 'Accounts Payable', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' },
        { code: 'AR', name: 'Accounts Receivable', color: '#0284c7', bg: '#f0f9ff', border: '#e0f2fe' },
        { code: 'BANK', name: 'Cash & Banking', color: '#059669', bg: '#ecfdf5', border: '#d1fae5' },
        { code: 'GL', name: 'General Ledger', color: '#4f46e5', bg: '#eef2ff', border: '#e0e7ff' },
        { code: 'INV', name: 'Inventory & Costs', color: '#b45309', bg: '#fffbeb', border: '#fef3c7' },
        { code: 'ASSET', name: 'Fixed Assets', color: '#0f766e', bg: '#f0fdfa', border: '#ccfbf1' },
        { code: 'ADMIN', name: 'System Admin', color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' }
    ];

    const SEED_DATA = [
        {
            id: 'ugvs-001',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'PINV',
            userGroup: 'AP-CLERK',
            description: 'Accounts Payable Senior Clerks',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'AP',
            status: 'Active',
            notes: 'Primary supplier invoice entry and matching privileges'
        },
        {
            id: 'ugvs-002',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'PINV',
            userGroup: 'FIN-ADMIN',
            description: 'Finance System Administrators',
            authLevel: 9,
            defaultType: 'Normal',
            functionGroup: 'ADMIN',
            status: 'Active',
            notes: 'Full administrator override and un-post authority'
        },
        {
            id: 'ugvs-003',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'SINV',
            userGroup: 'AR-CLERK',
            description: 'Accounts Receivable Billing Team',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'AR',
            status: 'Active',
            notes: 'Customer dispatch sales invoicing and credit debit notes'
        },
        {
            id: 'ugvs-004',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'BPAY',
            userGroup: 'FIN-MGR',
            description: 'Finance Managers and Controllers',
            authLevel: 9,
            defaultType: 'Normal',
            functionGroup: 'BANK',
            status: 'Active',
            notes: 'Commercial banking disbursement authorizations'
        },
        {
            id: 'ugvs-004b',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'BPAY',
            userGroup: 'TREASURY',
            description: 'Treasury & Bank Payment Operations',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'BANK',
            status: 'Active',
            notes: 'Operational treasury disbursements and wire transfers'
        },
        {
            id: 'ugvs-005',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'BREC',
            userGroup: 'AR-CLERK',
            description: 'Accounts Receivable Billing Team',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'BANK',
            status: 'Active',
            notes: 'Direct customer wire remittance allocation'
        },
        {
            id: 'ugvs-006',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'JRNL',
            userGroup: 'GL-ACCOUNTANT',
            description: 'General Ledger Accountants',
            authLevel: 7,
            defaultType: 'Special Posting',
            functionGroup: 'GL',
            status: 'Active',
            notes: 'Monthly journal accruals and cost allocations'
        },
        {
            id: 'ugvs-007',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'JRNL',
            userGroup: 'FIN-ADMIN',
            description: 'Finance System Administrators',
            authLevel: 9,
            defaultType: 'Year-End Closing',
            functionGroup: 'ADMIN',
            status: 'Active',
            notes: 'Statutory year-end ledger balance rollover and closing'
        },
        {
            id: 'ugvs-008',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'ADJ',
            userGroup: 'INV-CONTROLLER',
            description: 'Stock & Inventory Valuation Controllers',
            authLevel: 7,
            defaultType: 'Adjustment',
            functionGroup: 'INV',
            status: 'Active',
            notes: 'Stock physical count adjustments and cost revaluations'
        },
        {
            id: 'ugvs-009',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'FA',
            userGroup: 'ASSET-MGR',
            description: 'Fixed Asset Capitalization Team',
            authLevel: 7,
            defaultType: 'Special Posting',
            functionGroup: 'ASSET',
            status: 'Active',
            notes: 'Asset depreciation schedules and disposal write-offs'
        },
        {
            id: 'ugvs-010',
            company: 'Laxmico Ltd',
            year: '2026',
            voucherType: 'PINV',
            userGroup: 'AUDITOR',
            description: 'External & Internal Audit Team',
            authLevel: 1,
            defaultType: 'Normal',
            functionGroup: 'GL',
            status: 'Active',
            notes: 'Read-only voucher audit trail inspection'
        },
        {
            id: 'ugvs-011',
            company: 'B&S International',
            year: '2026',
            voucherType: 'PINV',
            userGroup: 'BSI-AP',
            description: 'International Trade AP Specialists',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'AP',
            status: 'Active',
            notes: 'Multi-currency import purchases and customs postings'
        },
        {
            id: 'ugvs-012',
            company: 'B&S International',
            year: '2026',
            voucherType: 'SINV',
            userGroup: 'BSI-SALES',
            description: 'Global Export Sales Operations',
            authLevel: 7,
            defaultType: 'Normal',
            functionGroup: 'AR',
            status: 'Active',
            notes: 'Cross-border sales invoicing and freight billing'
        },
        {
            id: 'ugvs-013',
            company: 'B&S UK Trading',
            year: '2027',
            voucherType: 'ADJ',
            userGroup: 'INV-CONTROLLER',
            description: 'Stock Revaluation and Inventory Variance Postings',
            authLevel: 7,
            defaultType: 'Adjustment',
            functionGroup: 'INV',
            status: 'Active',
            notes: 'UK warehouse stock variance balancing'
        }
    ];

    const UserGroupsVoucherModule = {
        data: [],
        authLevels: AUTH_LEVELS,
        defaultTypes: DEFAULT_TYPES,
        functionGroups: FUNCTION_GROUPS,
        selectedIds: new Set(),
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            voucherType: '',
            year: '',
            quickSearch: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('UserGroupsVoucherModule initialized successfully.');
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
                console.warn('[UserGroupsVoucher] Error loading localStorage:', err);
            }
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.saveData();
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.warn('[UserGroupsVoucher] Error saving localStorage:', err);
            }
        },

        getFilteredData() {
            let list = [...this.data];

            const c = (this.filters.company || '').trim().toLowerCase();
            const vt = (this.filters.voucherType || '').trim().toUpperCase();
            const y = (this.filters.year || '').trim();
            const q = (this.filters.quickSearch || '').trim().toLowerCase();

            if (c) {
                list = list.filter(item => (item.company || '').toLowerCase().includes(c));
            }
            if (vt) {
                list = list.filter(item => (item.voucherType || '').toUpperCase() === vt);
            }
            if (y) {
                list = list.filter(item => String(item.year || '').includes(y));
            }
            if (q) {
                list = list.filter(item =>
                    (item.userGroup || '').toLowerCase().includes(q) ||
                    (item.description || '').toLowerCase().includes(q) ||
                    (item.voucherType || '').toLowerCase().includes(q) ||
                    (item.functionGroup || '').toLowerCase().includes(q) ||
                    (item.defaultType || '').toLowerCase().includes(q) ||
                    (item.notes || '').toLowerCase().includes(q)
                );
            }

            return list;
        },

        renderKPIs() {
            const totalEl = document.getElementById('ugvs-kpi-total');
            const groupsEl = document.getElementById('ugvs-kpi-groups');
            const fullAccessEl = document.getElementById('ugvs-kpi-full-access');
            const voucherTypesEl = document.getElementById('ugvs-kpi-voucher-types');

            const total = this.data.length;
            const uniqueGroups = new Set(this.data.map(d => d.userGroup)).size;
            const fullAccessCount = this.data.filter(d => Number(d.authLevel) === 9).length;
            const uniqueVoucherTypes = new Set(this.data.map(d => d.voucherType)).size;

            if (totalEl) totalEl.textContent = `${total} Mappings`;
            if (groupsEl) groupsEl.textContent = `${uniqueGroups} User Groups`;
            if (fullAccessEl) fullAccessEl.textContent = `${fullAccessCount} Full Admin (L9)`;
            if (voucherTypesEl) voucherTypesEl.textContent = `${uniqueVoucherTypes} Voucher Types`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-ugvs-list');
            const countEl = document.getElementById('ugvs-total-count');
            const pageInfo = document.getElementById('ugvs-page-info');
            const selectAll = document.getElementById('cb-ugvs-select-all');

            if (!tbody) return;

            const filtered = this.getFilteredData();
            const totalCount = filtered.length;

            if (countEl) {
                if (totalCount === 0) {
                    countEl.textContent = 'No records to view';
                } else {
                    countEl.textContent = `${totalCount} records`;
                }
            }

            const totalPages = Math.ceil(totalCount / this.pageSize) || (totalCount === 0 ? 0 : 1);
            if (this.currentPage > totalPages && totalPages > 0) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            if (pageInfo) {
                pageInfo.textContent = `Page ${totalCount === 0 ? 1 : this.currentPage} of ${totalPages}`;
            }

            const pageInput = document.getElementById('ugvs-page-input');
            if (pageInput) {
                pageInput.value = totalCount === 0 ? 1 : this.currentPage;
            }
            const ofPagesEl = document.getElementById('ugvs-of-pages');
            if (ofPagesEl) {
                ofPagesEl.textContent = `of ${totalPages}`;
            }

            const startIdx = (this.currentPage - 1) * this.pageSize;
            const endIdx = Math.min(startIdx + this.pageSize, totalCount);
            const pageData = filtered.slice(startIdx, endIdx);

            if (selectAll) {
                selectAll.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
            }

            if (pageData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 50px 20px; color: var(--color-text-muted);">
                            <div style="font-size: 38px; margin-bottom: 8px;">🔐</div>
                            <div style="font-size: 14px; font-weight: 600; color: #475569;">No User Groups per Voucher Series Found</div>
                            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 4px;">No records match your selected Company, Voucher Type, or Year criteria. Click "+ Add" to create a new mapping.</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            const rowsHtml = pageData.map((item, index) => {
                const isChecked = this.selectedIds.has(item.id);
                const isOdd = index % 2 === 1;
                const rowBg = isChecked ? '#eff6ff' : (isOdd ? '#f8fafc' : '#ffffff');

                // Auth Level badge
                const al = this.authLevels.find(a => a.level === Number(item.authLevel)) || {
                    name: `Level ${item.authLevel}`,
                    color: '#334155',
                    bg: '#f1f5f9',
                    border: '#cbd5e1'
                };

                // Function Group badge
                const fg = this.functionGroups.find(f => f.code === item.functionGroup) || {
                    name: item.functionGroup,
                    color: '#334155',
                    bg: '#f1f5f9',
                    border: '#cbd5e1'
                };

                return `
                    <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; transition: background 0.15s ease;" data-id="${escapeHtml(item.id)}">
                        <td style="width: 40px; text-align: center; padding: 10px 8px;">
                            <input type="checkbox" class="cb-ugvs-row" data-id="${escapeHtml(item.id)}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: 'JetBrains Mono', monospace;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 14px;">👥</span>
                                <span>${escapeHtml(item.userGroup)}</span>
                                <span style="font-size: 10.5px; font-weight: 500; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${escapeHtml(item.voucherType)} / ${escapeHtml(item.year)}</span>
                            </div>
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; font-weight: 500;">
                            <div>${escapeHtml(item.description || 'No description provided')}</div>
                            ${item.company ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">🏢 ${escapeHtml(item.company)}</div>` : ''}
                        </td>
                        <td style="padding: 10px 14px; font-size: 12.5px;">
                            <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 6px; font-weight: 600; font-size: 11.5px; color: ${al.color}; background: ${al.bg}; border: 1px solid ${al.border};">
                                <span>🛡️</span> ${escapeHtml(al.name)}
                            </span>
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b;">
                            <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px;">
                                ${escapeHtml(item.defaultType || 'Normal')}
                            </span>
                        </td>
                        <td style="padding: 10px 14px; font-size: 12.5px;">
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-weight: 600; font-size: 11.5px; color: ${fg.color}; background: ${fg.bg}; border: 1px solid ${fg.border};">
                                <span>🏷️</span> ${escapeHtml(fg.name || item.functionGroup)}
                            </span>
                        </td>
                        <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                            <div style="display: inline-flex; align-items: center; gap: 6px;">
                                <button type="button" class="btn-ugvs-edit" data-id="${escapeHtml(item.id)}" title="Edit Mapping" style="background: transparent; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #334155; font-size: 12px; transition: all 0.15s ease;">
                                    ✏️ Edit
                                </button>
                                <button type="button" class="btn-ugvs-del" data-id="${escapeHtml(item.id)}" title="Delete Mapping" style="background: transparent; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #dc2626; font-size: 12px; transition: all 0.15s ease;">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.innerHTML = rowsHtml;
            this.updateDeleteButton();
        },

        updateDeleteButton() {
            const btnDel = document.getElementById('btn-ugvs-delete');
            if (btnDel) {
                btnDel.disabled = this.selectedIds.size === 0;
                btnDel.style.opacity = this.selectedIds.size === 0 ? '0.6' : '1';
                btnDel.style.cursor = this.selectedIds.size === 0 ? 'not-allowed' : 'pointer';
            }
        },

        showFormError(msg) {
            const alertEl = document.getElementById('ugvs-form-alert');
            if (alertEl) {
                alertEl.textContent = msg;
                alertEl.style.display = 'block';
                alertEl.style.background = '#fef2f2';
                alertEl.style.color = '#991b1b';
                alertEl.style.border = '1px solid #fecaca';
            }
            if (typeof window.showNotification === 'function') {
                window.showNotification(msg, 'warning');
            }
        },

        clearFormError() {
            const alertEl = document.getElementById('ugvs-form-alert');
            if (alertEl) {
                alertEl.textContent = '';
                alertEl.style.display = 'none';
            }
        },

        openAddModal() {
            this.editingId = null;
            this.clearFormError();
            const modal = document.getElementById('modal-add-user-groups-voucher');
            const title = document.getElementById('modal-ugvs-title');
            const saveBtn = document.getElementById('btn-ugvs-save');

            if (title) title.innerHTML = '<span>🔐</span> Add User Group per Voucher Series';
            if (saveBtn) saveBtn.textContent = 'Save Mapping';

            // Populate defaults from filter values
            const fComp = document.getElementById('filter-ugvs-company');
            const fType = document.getElementById('filter-ugvs-type');
            const fYear = document.getElementById('filter-ugvs-year');

            const compSelect = document.getElementById('ugvs-form-company');
            const yearInput = document.getElementById('ugvs-form-year');
            const typeSelect = document.getElementById('ugvs-form-type');
            const groupInput = document.getElementById('ugvs-form-group');
            const descInput = document.getElementById('ugvs-form-desc');
            const authSelect = document.getElementById('ugvs-form-auth');
            const defaultSelect = document.getElementById('ugvs-form-default-type');
            const funcSelect = document.getElementById('ugvs-form-func-group');
            const notesInput = document.getElementById('ugvs-form-notes');

            if (compSelect) compSelect.value = (fComp && fComp.value) ? fComp.value : 'Laxmico Ltd';
            if (yearInput) yearInput.value = (fYear && fYear.value) ? fYear.value : '2026';
            if (typeSelect) typeSelect.value = (fType && fType.value) ? fType.value : 'PINV';
            if (groupInput) groupInput.value = 'AP-CLERK';
            if (descInput) descInput.value = 'Accounts Payable Staff';
            if (authSelect) authSelect.value = '7';
            if (defaultSelect) defaultSelect.value = 'Normal';
            if (funcSelect) funcSelect.value = 'AP';
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
            const modal = document.getElementById('modal-add-user-groups-voucher');
            const title = document.getElementById('modal-ugvs-title');
            const saveBtn = document.getElementById('btn-ugvs-save');

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            if (title) title.innerHTML = `<span>✏️</span> Edit User Group Mapping: <strong>${escapeHtml(item.userGroup)} (${escapeHtml(item.voucherType)} / ${escapeHtml(item.year)})</strong>`;
            if (saveBtn) saveBtn.textContent = 'Update Mapping';

            const compSelect = document.getElementById('ugvs-form-company');
            const yearInput = document.getElementById('ugvs-form-year');
            const typeSelect = document.getElementById('ugvs-form-type');
            const groupInput = document.getElementById('ugvs-form-group');
            const descInput = document.getElementById('ugvs-form-desc');
            const authSelect = document.getElementById('ugvs-form-auth');
            const defaultSelect = document.getElementById('ugvs-form-default-type');
            const funcSelect = document.getElementById('ugvs-form-func-group');
            const notesInput = document.getElementById('ugvs-form-notes');

            if (compSelect) compSelect.value = item.company || 'Laxmico Ltd';
            if (yearInput) yearInput.value = item.year || '2026';
            if (typeSelect) typeSelect.value = item.voucherType || 'PINV';
            if (groupInput) groupInput.value = item.userGroup || '';
            if (descInput) descInput.value = item.description || '';
            if (authSelect) authSelect.value = String(item.authLevel || 7);
            if (defaultSelect) defaultSelect.value = item.defaultType || 'Normal';
            if (funcSelect) funcSelect.value = item.functionGroup || 'AP';
            if (notesInput) notesInput.value = item.notes || '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-user-groups-voucher');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
            this.clearFormError();
        },

        saveForm() {
            this.clearFormError();

            const compSelect = document.getElementById('ugvs-form-company');
            const yearInput = document.getElementById('ugvs-form-year');
            const typeSelect = document.getElementById('ugvs-form-type');
            const groupInput = document.getElementById('ugvs-form-group');
            const descInput = document.getElementById('ugvs-form-desc');
            const authSelect = document.getElementById('ugvs-form-auth');
            const defaultSelect = document.getElementById('ugvs-form-default-type');
            const funcSelect = document.getElementById('ugvs-form-func-group');
            const notesInput = document.getElementById('ugvs-form-notes');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const year = yearInput ? yearInput.value.trim() : '';
            const voucherType = typeSelect ? typeSelect.value.trim().toUpperCase() : 'PINV';
            const userGroup = groupInput ? groupInput.value.trim().toUpperCase() : '';
            const description = descInput ? descInput.value.trim() : '';
            const authLevel = authSelect ? parseInt(authSelect.value, 10) : 7;
            const defaultType = defaultSelect ? defaultSelect.value : 'Normal';
            const functionGroup = funcSelect ? funcSelect.value : 'GL';
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!company) {
                this.showFormError('Please select a Company.');
                return;
            }
            if (!year || isNaN(year) || parseInt(year) < 1900 || parseInt(year) > 2100) {
                this.showFormError('Please enter a valid 4-digit fiscal year (e.g. 2026).');
                return;
            }
            if (!voucherType) {
                this.showFormError('Please select a Voucher Type.');
                return;
            }
            if (!userGroup) {
                this.showFormError('Please enter or select a User Group.');
                return;
            }

            if (this.editingId) {
                // Update existing record
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    item.company = company;
                    item.year = year;
                    item.voucherType = voucherType;
                    item.userGroup = userGroup;
                    item.description = description;
                    item.authLevel = authLevel;
                    item.defaultType = defaultType;
                    item.functionGroup = functionGroup;
                    item.notes = notes;
                }
                this.saveData();
                this.closeModal();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`User Group Mapping ${userGroup} for ${voucherType} (${year}) updated successfully.`, 'success');
                }
            } else {
                // Check if mapping for same company, year, voucherType, and userGroup already exists
                const existing = this.data.find(d =>
                    d.company.toLowerCase() === company.toLowerCase() &&
                    d.year === year &&
                    d.voucherType.toUpperCase() === voucherType.toUpperCase() &&
                    d.userGroup.toUpperCase() === userGroup.toUpperCase()
                );

                if (existing) {
                    // Update existing mapping seamlessly without blocking popup
                    existing.description = description || existing.description;
                    existing.authLevel = authLevel;
                    existing.defaultType = defaultType;
                    existing.functionGroup = functionGroup;
                    existing.notes = notes;

                    this.saveData();
                    this.closeModal();
                    this.renderKPIs();
                    this.renderTable();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Existing Mapping for ${userGroup} (${voucherType} / ${year}) updated successfully.`, 'success');
                    }
                } else {
                    // Add new mapping
                    const newMapping = {
                        id: 'ugvs-' + Date.now(),
                        company,
                        year,
                        voucherType,
                        userGroup,
                        description,
                        authLevel,
                        defaultType,
                        functionGroup,
                        status: 'Active',
                        notes
                    };
                    this.data.unshift(newMapping);

                    this.saveData();
                    this.closeModal();
                    this.renderKPIs();
                    this.renderTable();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`User Group Mapping for ${userGroup} (${voucherType} / ${year}) created successfully.`, 'success');
                    }
                }
            }
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            if (confirm(`Are you sure you want to delete User Group mapping for ${item.userGroup} (${item.voucherType} / ${item.year})?`)) {
                this.data = this.data.filter(d => d.id !== id);
                this.selectedIds.delete(id);
                this.saveData();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Mapping for ${item.userGroup} deleted.`, 'info');
                }
            }
        },

        bulkDelete() {
            if (this.selectedIds.size === 0) return;

            if (confirm(`Are you sure you want to delete ${this.selectedIds.size} selected User Group mapping(s)?`)) {
                this.data = this.data.filter(d => !this.selectedIds.has(d.id));
                this.selectedIds.clear();
                this.saveData();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Selected user group mappings deleted.', 'info');
                }
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No user group records match current filters to export.', 'warning');
                }
                return;
            }

            const headers = ['Company', 'Year', 'Voucher Type', 'User Group', 'Description', 'Authorization Level', 'Default Type', 'Function Group', 'Notes'];
            const rows = filtered.map(d => [
                `"${(d.company || '').replace(/"/g, '""')}"`,
                `"${(d.year || '').replace(/"/g, '""')}"`,
                `"${(d.voucherType || '').replace(/"/g, '""')}"`,
                `"${(d.userGroup || '').replace(/"/g, '""')}"`,
                `"${(d.description || '').replace(/"/g, '""')}"`,
                `"${d.authLevel}"`,
                `"${(d.defaultType || '').replace(/"/g, '""')}"`,
                `"${(d.functionGroup || '').replace(/"/g, '""')}"`,
                `"${(d.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `User_Groups_Per_Voucher_Series_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Exported ${filtered.length} User Group mappings to CSV.`, 'success');
            }
        },

        bindEvents() {
            // Filter Search button
            const btnSearch = document.getElementById('btn-ugvs-filter-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    const fComp = document.getElementById('filter-ugvs-company');
                    const fType = document.getElementById('filter-ugvs-type');
                    const fYear = document.getElementById('filter-ugvs-year');
                    const fSearch = document.getElementById('search-fin-user-groups-voucher');

                    this.filters.company = fComp ? fComp.value : '';
                    this.filters.voucherType = fType ? fType.value : '';
                    this.filters.year = fYear ? fYear.value : '';
                    this.filters.quickSearch = fSearch ? fSearch.value : '';
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Clear Filters button
            const btnClear = document.getElementById('btn-ugvs-filter-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => {
                    const fComp = document.getElementById('filter-ugvs-company');
                    const fType = document.getElementById('filter-ugvs-type');
                    const fYear = document.getElementById('filter-ugvs-year');
                    const fSearch = document.getElementById('search-fin-user-groups-voucher');

                    if (fComp) fComp.value = '';
                    if (fType) fType.value = '';
                    if (fYear) fYear.value = '';
                    if (fSearch) fSearch.value = '';

                    this.filters = { company: '', voucherType: '', year: '', quickSearch: '' };
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Quick search input on enter or input
            const searchInput = document.getElementById('search-fin-user-groups-voucher');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filters.quickSearch = e.target.value;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Add buttons (top toolbar and table action)
            const btnTopAdd = document.getElementById('btn-add-fin-user-groups-voucher');
            if (btnTopAdd) {
                btnTopAdd.addEventListener('click', () => this.openAddModal());
            }

            const btnRowAdd = document.getElementById('btn-ugvs-add');
            if (btnRowAdd) {
                btnRowAdd.addEventListener('click', () => this.openAddModal());
            }

            // Modal cancel and close
            const btnCancel = document.getElementById('btn-ugvs-cancel');
            if (btnCancel) {
                btnCancel.addEventListener('click', () => this.closeModal());
            }

            const btnClose = document.getElementById('btn-modal-ugvs-close');
            if (btnClose) {
                btnClose.addEventListener('click', () => this.closeModal());
            }

            // Modal save
            const btnSave = document.getElementById('btn-ugvs-save');
            if (btnSave) {
                btnSave.addEventListener('click', () => this.saveForm());
            }

            // Delete & Download toolbar buttons
            const btnDel = document.getElementById('btn-ugvs-delete');
            if (btnDel) {
                btnDel.addEventListener('click', () => this.bulkDelete());
            }

            const btnExport = document.getElementById('btn-ugvs-export-csv');
            if (btnExport) {
                btnExport.addEventListener('click', () => this.exportCSV());
            }

            const btnDownload = document.getElementById('btn-ugvs-download');
            if (btnDownload) {
                btnDownload.addEventListener('click', () => this.exportCSV());
            }

            // Select All checkbox
            const cbAll = document.getElementById('cb-ugvs-select-all');
            if (cbAll) {
                cbAll.addEventListener('change', (e) => {
                    const filtered = this.getFilteredData();
                    const startIdx = (this.currentPage - 1) * this.pageSize;
                    const endIdx = Math.min(startIdx + this.pageSize, filtered.length);
                    const pageData = filtered.slice(startIdx, endIdx);

                    if (e.target.checked) {
                        pageData.forEach(item => this.selectedIds.add(item.id));
                    } else {
                        pageData.forEach(item => this.selectedIds.delete(item.id));
                    }
                    this.renderTable();
                });
            }

            // Row checkbox delegation
            const tbody = document.getElementById('tbody-ugvs-list');
            if (tbody) {
                tbody.addEventListener('change', (e) => {
                    if (e.target && e.target.classList.contains('cb-ugvs-row')) {
                        const id = e.target.getAttribute('data-id');
                        if (e.target.checked) {
                            this.selectedIds.add(id);
                        } else {
                            this.selectedIds.delete(id);
                        }
                        this.updateDeleteButton();
                        const selectAll = document.getElementById('cb-ugvs-select-all');
                        const filtered = this.getFilteredData();
                        const startIdx = (this.currentPage - 1) * this.pageSize;
                        const endIdx = Math.min(startIdx + this.pageSize, filtered.length);
                        const pageData = filtered.slice(startIdx, endIdx);
                        if (selectAll) {
                            selectAll.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                        }
                    }
                });

                // Row edit and delete clicks
                tbody.addEventListener('click', (e) => {
                    const editBtn = e.target.closest('.btn-ugvs-edit');
                    if (editBtn) {
                        const id = editBtn.getAttribute('data-id');
                        this.openEditModal(id);
                        return;
                    }

                    const delBtn = e.target.closest('.btn-ugvs-del');
                    if (delBtn) {
                        const id = delBtn.getAttribute('data-id');
                        this.deleteRow(id);
                        return;
                    }
                });
            }

            // Pagination controls
            const btnFirst = document.getElementById('btn-ugvs-first');
            if (btnFirst) {
                btnFirst.addEventListener('click', () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            const btnPrev = document.getElementById('btn-ugvs-prev');
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.renderTable();
                    }
                });
            }

            const btnNext = document.getElementById('btn-ugvs-next');
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

            const btnLast = document.getElementById('btn-ugvs-last');
            if (btnLast) {
                btnLast.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize);
                    this.currentPage = totalPages > 0 ? totalPages : 1;
                    this.renderTable();
                });
            }

            const pageInput = document.getElementById('ugvs-page-input');
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

            const rowsSelect = document.getElementById('ugvs-rows-select');
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
            const checkboxes = document.querySelectorAll('.cb-ugvs-row');
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
            const fComp = document.getElementById('filter-ugvs-company');
            const fType = document.getElementById('filter-ugvs-type');
            const fYear = document.getElementById('filter-ugvs-year');
            const fSearch = document.getElementById('filter-ugvs-search');

            this.filters.company = fComp ? fComp.value : 'all';
            this.filters.voucherType = fType ? fType.value : 'all';
            this.filters.year = fYear ? fYear.value : 'all';
            this.filters.search = fSearch ? fSearch.value.trim().toLowerCase() : '';
            this.currentPage = 1;
            this.renderTable();
        },

        clearFilter() {
            const fComp = document.getElementById('filter-ugvs-company');
            const fType = document.getElementById('filter-ugvs-type');
            const fYear = document.getElementById('filter-ugvs-year');
            const fSearch = document.getElementById('filter-ugvs-search');

            if (fComp) fComp.value = 'all';
            if (fType) fType.value = 'all';
            if (fYear) fYear.value = 'all';
            if (fSearch) fSearch.value = '';

            this.filters = { company: 'all', voucherType: 'all', year: 'all', search: '' };
            this.currentPage = 1;
            this.renderTable();
        },

        viewVoucherSeries() {
            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-voucher-series-type');
            }
        }
    };

    // Global document delegation for modal opening
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-user-groups-voucher, #btn-ugvs-add');
        if (addBtn) {
            e.preventDefault();
            if (window.UserGroupsVoucherModule && typeof window.UserGroupsVoucherModule.openAddModal === 'function') {
                window.UserGroupsVoucherModule.openAddModal();
            } else {
                const modal = document.getElementById('modal-add-user-groups-voucher');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }
        }
    });

    window.UserGroupsVoucherModule = UserGroupsVoucherModule;

    // Auto-init on DOMContentLoaded or immediate if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UserGroupsVoucherModule.init());
    } else {
        UserGroupsVoucherModule.init();
    }

})(window);
