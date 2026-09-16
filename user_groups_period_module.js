/**
 * user_groups_period_module.js
 * 
 * Modern ERP Design for User Groups per Period Master (ERP-FIN-MAS-007):
 * - Fields from screenshot:
 *   - Filters: Company (enabled select), Year, Period, Description, GL Status, IL Status, Search Button
 *   - Table: Multi-select Checkbox, User Group, Description, GL Period Status, IL Period Status
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), Pagination (Page X of Y, rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Rules, Open GL Groups, Open IL Groups, Active Fiscal Period)
 *   - Clean cards, modern typography, color-coded status badges for GL and IL
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add modal opening (inline onclick, module listener, document delegation)
 *   - Edit & Delete per row, bulk delete, search and multi-criteria filters
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with rich seed data
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_USER_GROUPS_PERIOD_V1';

    const SEED_DATA = [
        {
            id: 'ugp-001',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'FIN-ADMIN',
            description: 'Financial Controllers & Period Closing Admins',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Unrestricted posting access across GL and IL'
        },
        {
            id: 'ugp-002',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'GL-ACCOUNTANT',
            description: 'General Ledger Senior Accountants & Posting Staff',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Routine journal voucher and recurring entries'
        },
        {
            id: 'ugp-003',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'AP-CLERK',
            description: 'Accounts Payable Processing Clerks',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Supplier invoice verification and payment generation'
        },
        {
            id: 'ugp-004',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'AR-CLERK',
            description: 'Accounts Receivable & Billing Specialists',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Customer sales invoicing and cash receipts'
        },
        {
            id: 'ugp-005',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'AUDITOR',
            description: 'Statutory Internal & External Auditors',
            glStatus: 'Audit Only',
            ilStatus: 'Audit Only',
            notes: 'Read-only enquiry and audit trail reporting'
        },
        {
            id: 'ugp-006',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'PAYROLL',
            description: 'Payroll & Remuneration Accounting Staff',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Monthly salary distribution journals'
        },
        {
            id: 'ugp-007',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            userGroup: 'TAX-CONSULT',
            description: 'Indirect & Direct Corporate Tax Advisors',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            notes: 'Period 09 VAT return pending submission'
        },
        {
            id: 'ugp-008',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            userGroup: 'FIN-ADMIN',
            description: 'Financial Controllers & Period Closing Admins',
            glStatus: 'Audit Only',
            ilStatus: 'Closed',
            notes: 'Post-close adjustments authorized by CFO only'
        },
        {
            id: 'ugp-009',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            userGroup: 'GL-ACCOUNTANT',
            description: 'General Ledger Senior Accountants & Posting Staff',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            notes: 'Hard closed for regular accounting staff'
        },
        {
            id: 'ugp-010',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            userGroup: 'AP-CLERK',
            description: 'Accounts Payable Processing Clerks',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            notes: 'Period locked for voucher entry'
        },
        {
            id: 'ugp-011',
            company: 'B&S International',
            year: '2026',
            period: '09',
            userGroup: 'FIN-ADMIN',
            description: 'Financial Controllers & Period Closing Admins',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Global entity consolidation group'
        },
        {
            id: 'ugp-012',
            company: 'B&S International',
            year: '2026',
            period: '09',
            userGroup: 'GL-ACCOUNTANT',
            description: 'General Ledger Senior Accountants & Posting Staff',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'General ledger postings for international operations'
        },
        {
            id: 'ugp-013',
            company: 'B&S UK Trading',
            year: '2026',
            period: '09',
            userGroup: 'FIN-ADMIN',
            description: 'Financial Controllers & Period Closing Admins',
            glStatus: 'Open',
            ilStatus: 'Open',
            notes: 'Active trading entity accounting admin'
        }
    ];

    const UserGroupsPeriodModule = {
        data: [],
        selectedIds: new Set(),
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            year: '',
            period: '',
            description: '',
            glStatus: '',
            ilStatus: '',
            query: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.render();
            console.log('UserGroupsPeriodModule initialized successfully.');
        },

        loadData() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    this.data = JSON.parse(stored);
                } else {
                    this.data = JSON.parse(JSON.stringify(SEED_DATA));
                    this.saveData();
                }
            } catch (err) {
                console.error('Error loading User Groups per Period from storage:', err);
                this.data = JSON.parse(JSON.stringify(SEED_DATA));
            }
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.error('Error saving User Groups per Period:', err);
            }
        },

        getFilteredData() {
            const f = this.filters;
            return this.data.filter(item => {
                if (f.company && f.company !== 'All' && item.company !== f.company) return false;
                if (f.year && !item.year.toLowerCase().includes(f.year.toLowerCase().trim())) return false;
                if (f.period && !item.period.toLowerCase().includes(f.period.toLowerCase().trim())) return false;
                if (f.description && !item.description.toLowerCase().includes(f.description.toLowerCase().trim())) return false;
                if (f.glStatus && f.glStatus !== 'All' && item.glStatus.toLowerCase() !== f.glStatus.toLowerCase()) return false;
                if (f.ilStatus && f.ilStatus !== 'All' && item.ilStatus.toLowerCase() !== f.ilStatus.toLowerCase()) return false;
                if (f.query) {
                    const q = f.query.toLowerCase().trim();
                    const match = item.userGroup.toLowerCase().includes(q) ||
                                  item.description.toLowerCase().includes(q) ||
                                  item.company.toLowerCase().includes(q) ||
                                  item.year.includes(q) ||
                                  item.period.includes(q) ||
                                  item.glStatus.toLowerCase().includes(q) ||
                                  item.ilStatus.toLowerCase().includes(q);
                    if (!match) return false;
                }
                return true;
            });
        },

        renderKPIs() {
            const totalRecords = this.data.length;
            const openGL = this.data.filter(d => d.glStatus === 'Open').length;
            const openIL = this.data.filter(d => d.ilStatus === 'Open').length;
            const closedRules = this.data.filter(d => d.glStatus === 'Closed' || d.ilStatus === 'Closed').length;

            const elTotal = document.getElementById('kpi-ugp-total');
            const elOpenGL = document.getElementById('kpi-ugp-open-gl');
            const elOpenIL = document.getElementById('kpi-ugp-open-il');
            const elClosed = document.getElementById('kpi-ugp-closed');

            if (elTotal) elTotal.textContent = totalRecords;
            if (elOpenGL) elOpenGL.textContent = openGL;
            if (elOpenIL) elOpenIL.textContent = openIL;
            if (elClosed) elClosed.textContent = closedRules;
        },

        renderTable() {
            const filtered = this.getFilteredData();
            const tbody = document.getElementById('tbody-ugp-list');
            const totalCountEl = document.getElementById('ugp-total-count');
            const pageInfoEl = document.getElementById('ugp-page-info');
            const selectAllCheckbox = document.getElementById('cb-ugp-select-all');

            if (totalCountEl) totalCountEl.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

            // Pagination calculation
            const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            if (pageInfoEl) pageInfoEl.textContent = `Page ${this.currentPage} of ${totalPages}`;

            const startIdx = (this.currentPage - 1) * this.pageSize;
            const pageData = filtered.slice(startIdx, startIdx + this.pageSize);

            if (selectAllCheckbox) {
                const allSelected = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                selectAllCheckbox.checked = allSelected;
            }

            if (!tbody) return;

            if (pageData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
                            <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--color-text-main);">No User Group Rules Found</div>
                            <div style="font-size: 12.5px; margin-top: 4px;">Try adjusting your filter criteria or click "<strong>+ Add</strong>" to create a new period rule.</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                this.renderKPIs();
                return;
            }

            tbody.innerHTML = pageData.map(item => {
                const isSelected = this.selectedIds.has(item.id);
                
                // Badges for GL and IL status
                const getStatusBadge = (status) => {
                    const s = (status || '').toLowerCase();
                    if (s === 'open') {
                        return `<span class="badge" style="background: #dcfce7; color: #166534; font-weight: 600; border: 1px solid #bbf7d0; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
                                    Open
                                </span>`;
                    } else if (s === 'closed') {
                        return `<span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 600; border: 1px solid #e2e8f0; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;"></span>
                                    Closed
                                </span>`;
                    } else if (s === 'audit only') {
                        return `<span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 600; border: 1px solid #fde68a; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #d97706;"></span>
                                    Audit Only
                                </span>`;
                    } else {
                        return `<span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 600; border: 1px solid #fecaca; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #dc2626;"></span>
                                    ${escapeHtml(status)}
                                </span>`;
                    }
                };

                return `
                    <tr style="cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor=''">
                        <td style="text-align: center; width: 44px; padding: 10px 8px;">
                            <input type="checkbox" class="ugp-row-cb" data-id="${item.id}" ${isSelected ? 'checked' : ''} style="cursor: pointer; transform: scale(1.15);">
                        </td>
                        <td style="padding: 10px 14px; font-weight: 700; color: #1e3a8a;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #bfdbfe; font-family: 'Consolas', monospace; font-size: 12.5px; color: #1d4ed8;">
                                    ${escapeHtml(item.userGroup)}
                                </span>
                            </div>
                        </td>
                        <td style="padding: 10px 14px; color: var(--color-text-main); font-weight: 500;">
                            <div>${escapeHtml(item.description)}</div>
                            <div style="font-size: 11.5px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                                <span>🏢 ${escapeHtml(item.company)}</span>
                                <span>•</span>
                                <span>📅 Year ${escapeHtml(item.year)} / Period ${escapeHtml(item.period)}</span>
                            </div>
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getStatusBadge(item.glStatus)}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getStatusBadge(item.ilStatus)}
                        </td>
                        <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                            <button class="btn btn-secondary btn-ugp-edit" data-id="${item.id}" style="padding: 4px 10px; font-size: 11.5px; height: 28px; margin-right: 6px;" title="Edit Rule">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-secondary btn-ugp-del" data-id="${item.id}" style="padding: 4px 10px; font-size: 11.5px; height: 28px; color: #dc2626;" title="Delete Rule">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            this.updateDeleteButton();
            this.renderKPIs();
        },

        render() {
            this.renderTable();
        },

        updateDeleteButton() {
            const delBtn = document.getElementById('btn-ugp-bulk-delete');
            if (delBtn) {
                const count = this.selectedIds.size;
                if (count > 0) {
                    delBtn.disabled = false;
                    delBtn.style.opacity = '1';
                    delBtn.style.cursor = 'pointer';
                    delBtn.innerHTML = `🗑️ Delete (${count})`;
                } else {
                    delBtn.disabled = true;
                    delBtn.style.opacity = '0.5';
                    delBtn.style.cursor = 'not-allowed';
                    delBtn.innerHTML = `🗑️ Delete`;
                }
            }
        },

        openAddModal() {
            console.log('UserGroupsPeriodModule: Opening Add Modal');
            this.editingId = null;
            const modalTitle = document.getElementById('modal-ugp-title');
            if (modalTitle) modalTitle.innerHTML = '<span>➕</span> Add User Group per Period';

            // Reset form fields
            const fCompany = document.getElementById('ugp-form-company');
            const fYear = document.getElementById('ugp-form-year');
            const fPeriod = document.getElementById('ugp-form-period');
            const fUserGroup = document.getElementById('ugp-form-user-group');
            const fDesc = document.getElementById('ugp-form-description');
            const fGLStatus = document.getElementById('ugp-form-gl-status');
            const fILStatus = document.getElementById('ugp-form-il-status');
            const fNotes = document.getElementById('ugp-form-notes');

            // Set current defaults
            if (fCompany) fCompany.value = this.filters.company && this.filters.company !== 'All' ? this.filters.company : 'Laxmico Ltd';
            if (fYear) fYear.value = this.filters.year || '2026';
            if (fPeriod) fPeriod.value = this.filters.period || '09';
            if (fUserGroup) fUserGroup.value = '';
            if (fDesc) fDesc.value = '';
            if (fGLStatus) fGLStatus.value = 'Open';
            if (fILStatus) fILStatus.value = 'Open';
            if (fNotes) fNotes.value = '';

            const modal = document.getElementById('modal-add-user-group-period');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                if (fUserGroup) setTimeout(() => fUserGroup.focus(), 80);
            }
        },

        openEditModal(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.editingId = id;
            const modalTitle = document.getElementById('modal-ugp-title');
            if (modalTitle) modalTitle.innerHTML = '<span>✏️</span> Edit User Group per Period';

            const fCompany = document.getElementById('ugp-form-company');
            const fYear = document.getElementById('ugp-form-year');
            const fPeriod = document.getElementById('ugp-form-period');
            const fUserGroup = document.getElementById('ugp-form-user-group');
            const fDesc = document.getElementById('ugp-form-description');
            const fGLStatus = document.getElementById('ugp-form-gl-status');
            const fILStatus = document.getElementById('ugp-form-il-status');
            const fNotes = document.getElementById('ugp-form-notes');

            if (fCompany) fCompany.value = item.company;
            if (fYear) fYear.value = item.year;
            if (fPeriod) fPeriod.value = item.period;
            if (fUserGroup) fUserGroup.value = item.userGroup;
            if (fDesc) fDesc.value = item.description;
            if (fGLStatus) fGLStatus.value = item.glStatus;
            if (fILStatus) fILStatus.value = item.ilStatus;
            if (fNotes) fNotes.value = item.notes || '';

            const modal = document.getElementById('modal-add-user-group-period');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                if (fDesc) setTimeout(() => fDesc.focus(), 80);
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-user-group-period');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
        },

        saveForm() {
            const fCompany = document.getElementById('ugp-form-company');
            const fYear = document.getElementById('ugp-form-year');
            const fPeriod = document.getElementById('ugp-form-period');
            const fUserGroup = document.getElementById('ugp-form-user-group');
            const fDesc = document.getElementById('ugp-form-description');
            const fGLStatus = document.getElementById('ugp-form-gl-status');
            const fILStatus = document.getElementById('ugp-form-il-status');
            const fNotes = document.getElementById('ugp-form-notes');

            const company = fCompany ? fCompany.value.trim() : 'Laxmico Ltd';
            const year = fYear ? fYear.value.trim() : '2026';
            let period = fPeriod ? fPeriod.value.trim() : '09';
            if (period.length === 1) period = '0' + period;
            const userGroup = fUserGroup ? fUserGroup.value.trim().toUpperCase() : '';
            const description = fDesc ? fDesc.value.trim() : '';
            const glStatus = fGLStatus ? fGLStatus.value : 'Open';
            const ilStatus = fILStatus ? fILStatus.value : 'Open';
            const notes = fNotes ? fNotes.value.trim() : '';

            if (!userGroup) {
                alert('Please enter or select a User Group code.');
                if (fUserGroup) fUserGroup.focus();
                return;
            }
            if (!description) {
                alert('Please enter a Description for the User Group.');
                if (fDesc) fDesc.focus();
                return;
            }
            if (!year) {
                alert('Please enter a Fiscal Year (e.g. 2026).');
                if (fYear) fYear.focus();
                return;
            }
            if (!period) {
                alert('Please enter a Period (e.g. 01 through 12).');
                if (fPeriod) fPeriod.focus();
                return;
            }

            if (this.editingId) {
                // Update existing
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    item.company = company;
                    item.year = year;
                    item.period = period;
                    item.userGroup = userGroup;
                    item.description = description;
                    item.glStatus = glStatus;
                    item.ilStatus = ilStatus;
                    item.notes = notes;
                }
            } else {
                // Add new record
                const newRecord = {
                    id: 'ugp-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
                    company,
                    year,
                    period,
                    userGroup,
                    description,
                    glStatus,
                    ilStatus,
                    notes
                };
                this.data.unshift(newRecord);
            }

            this.saveData();
            this.closeModal();
            this.render();
            if (window.showNotification) {
                window.showNotification(`User Group rule ${userGroup} (Period ${period}/${year}) saved successfully.`, 'success');
            }
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;
            if (confirm(`Are you sure you want to delete period authorization rule for "${item.userGroup}" (${item.company}, Year ${item.year}, Period ${item.period})?`)) {
                this.data = this.data.filter(d => d.id !== id);
                this.selectedIds.delete(id);
                this.saveData();
                this.render();
                if (window.showNotification) {
                    window.showNotification(`Rule ${item.userGroup} deleted.`, 'info');
                }
            }
        },

        deleteSelected() {
            const count = this.selectedIds.size;
            if (count === 0) return;
            if (confirm(`Are you sure you want to delete ${count} selected period authorization rule${count === 1 ? '' : 's'}?`)) {
                this.data = this.data.filter(d => !this.selectedIds.has(d.id));
                this.selectedIds.clear();
                this.saveData();
                this.render();
                if (window.showNotification) {
                    window.showNotification(`${count} record${count === 1 ? '' : 's'} deleted successfully.`, 'info');
                }
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                alert('No records available to export.');
                return;
            }

            const headers = ['Company', 'Year', 'Period', 'User Group', 'Description', 'GL Period Status', 'IL Period Status', 'Notes'];
            const rows = filtered.map(item => [
                item.company,
                item.year,
                item.period,
                item.userGroup,
                item.description,
                item.glStatus,
                item.ilStatus,
                item.notes || ''
            ]);

            let csvContent = 'data:text/csv;charset=utf-8,' +
                [headers.join(','), ...rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `ERP_User_Groups_per_Period_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        bindEvents() {
            // Apply Search button click
            const btnSearch = document.getElementById('btn-ugp-apply-filters');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    this.applyFiltersFromInputs();
                });
            }

            // Quick search input enter key
            const searchInput = document.getElementById('search-fin-user-groups-period');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filters.query = e.target.value;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Filter bar change events
            const fCompany = document.getElementById('filter-ugp-company');
            const fYear = document.getElementById('filter-ugp-year');
            const fPeriod = document.getElementById('filter-ugp-period');
            const fDesc = document.getElementById('filter-ugp-desc');
            const fGLStatus = document.getElementById('filter-ugp-gl-status');
            const fILStatus = document.getElementById('filter-ugp-il-status');

            if (fCompany) fCompany.addEventListener('change', () => this.applyFiltersFromInputs());
            if (fYear) fYear.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.applyFiltersFromInputs(); });
            if (fPeriod) fPeriod.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.applyFiltersFromInputs(); });
            if (fDesc) fDesc.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.applyFiltersFromInputs(); });
            if (fGLStatus) fGLStatus.addEventListener('change', () => this.applyFiltersFromInputs());
            if (fILStatus) fILStatus.addEventListener('change', () => this.applyFiltersFromInputs());

            // Reset filters
            const btnReset = document.getElementById('btn-ugp-reset-filters');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    if (fCompany) fCompany.value = 'All';
                    if (fYear) fYear.value = '';
                    if (fPeriod) fPeriod.value = '';
                    if (fDesc) fDesc.value = '';
                    if (fGLStatus) fGLStatus.value = 'All';
                    if (fILStatus) fILStatus.value = 'All';
                    if (searchInput) searchInput.value = '';
                    this.filters = { company: '', year: '', period: '', description: '', glStatus: '', ilStatus: '', query: '' };
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Select All Checkbox
            const selectAll = document.getElementById('cb-ugp-select-all');
            if (selectAll) {
                selectAll.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    const filtered = this.getFilteredData();
                    const startIdx = (this.currentPage - 1) * this.pageSize;
                    const pageData = filtered.slice(startIdx, startIdx + this.pageSize);

                    pageData.forEach(item => {
                        if (checked) {
                            this.selectedIds.add(item.id);
                        } else {
                            this.selectedIds.delete(item.id);
                        }
                    });
                    this.renderTable();
                });
            }

            // Page size dropdown
            const pageSizeSelect = document.getElementById('ugp-page-size');
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    this.pageSize = parseInt(e.target.value, 10) || 1000;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Pagination prev/next
            const btnPrev = document.getElementById('btn-ugp-prev-page');
            const btnNext = document.getElementById('btn-ugp-next-page');
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.renderTable();
                    }
                });
            }
            if (btnNext) {
                btnNext.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.renderTable();
                    }
                });
            }

            // Add buttons (both header and table toolbar)
            const btnAddTop = document.getElementById('btn-add-fin-user-groups-period');
            const btnAddBottom = document.getElementById('btn-ugp-add-row');

            if (btnAddTop) {
                btnAddTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }
            if (btnAddBottom) {
                btnAddBottom.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }

            // Bulk delete
            const btnBulkDelete = document.getElementById('btn-ugp-bulk-delete');
            if (btnBulkDelete) {
                btnBulkDelete.addEventListener('click', () => {
                    this.deleteSelected();
                });
            }

            // Export Download
            const btnExport = document.getElementById('btn-ugp-download');
            const btnExportTop = document.getElementById('btn-ugp-export-top');
            if (btnExport) btnExport.addEventListener('click', () => this.exportCSV());
            if (btnExportTop) btnExportTop.addEventListener('click', () => this.exportCSV());

            // Modal action buttons
            const btnSave = document.getElementById('btn-ugp-save');
            const btnCancel = document.getElementById('btn-ugp-cancel');
            const btnCloseModal = document.getElementById('btn-ugp-close-modal');

            if (btnSave) btnSave.addEventListener('click', () => this.saveForm());
            if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());
            if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeModal());

            // Delegated table clicks (row checkboxes, edit, delete)
            const tbody = document.getElementById('tbody-ugp-list');
            if (tbody) {
                tbody.addEventListener('click', (e) => {
                    // Row checkbox
                    const cb = e.target.closest('.ugp-row-cb');
                    if (cb) {
                        const id = cb.getAttribute('data-id');
                        if (cb.checked) {
                            this.selectedIds.add(id);
                        } else {
                            this.selectedIds.delete(id);
                        }
                        this.updateDeleteButton();
                        const selectAllCheckbox = document.getElementById('cb-ugp-select-all');
                        if (selectAllCheckbox) {
                            const filtered = this.getFilteredData();
                            const startIdx = (this.currentPage - 1) * this.pageSize;
                            const pageData = filtered.slice(startIdx, startIdx + this.pageSize);
                            selectAllCheckbox.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                        }
                        return;
                    }

                    // Edit button
                    const btnEdit = e.target.closest('.btn-ugp-edit');
                    if (btnEdit) {
                        e.stopPropagation();
                        const id = btnEdit.getAttribute('data-id');
                        this.openEditModal(id);
                        return;
                    }

                    // Delete button
                    const btnDel = e.target.closest('.btn-ugp-del');
                    if (btnDel) {
                        e.stopPropagation();
                        const id = btnDel.getAttribute('data-id');
                        this.deleteRow(id);
                        return;
                    }
                });
            }
        },

        applyFiltersFromInputs() {
            const fCompany = document.getElementById('filter-ugp-company');
            const fYear = document.getElementById('filter-ugp-year');
            const fPeriod = document.getElementById('filter-ugp-period');
            const fDesc = document.getElementById('filter-ugp-desc');
            const fGLStatus = document.getElementById('filter-ugp-gl-status');
            const fILStatus = document.getElementById('filter-ugp-il-status');

            this.filters.company = fCompany ? fCompany.value : '';
            this.filters.year = fYear ? fYear.value.trim() : '';
            this.filters.period = fPeriod ? fPeriod.value.trim() : '';
            this.filters.description = fDesc ? fDesc.value.trim() : '';
            this.filters.glStatus = fGLStatus ? fGLStatus.value : '';
            this.filters.ilStatus = fILStatus ? fILStatus.value : '';

            this.currentPage = 1;
            this.renderTable();
        }
    };

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Export module
    window.UserGroupsPeriodModule = UserGroupsPeriodModule;

    // Document delegation fallback for + Add buttons
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-user-groups-period, #btn-ugp-add-row, [data-action="open-ugp-modal"]');
        if (addBtn && window.UserGroupsPeriodModule) {
            window.UserGroupsPeriodModule.openAddModal();
        }
    });

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UserGroupsPeriodModule.init());
    } else {
        UserGroupsPeriodModule.init();
    }

})(window);
