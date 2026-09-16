/**
 * accounting_periods_module.js
 * 
 * Modern ERP Design for Accounting Periods Master (ERP-FIN-MAS-008):
 * - Fields from screenshot:
 *   - Filters: Company (active enabled select), Year, Search Button
 *   - Table: Multi-select Checkbox, Period, Description, Valid From, Valid Until, Period Type, GL Period Status, IL Period Status, Balance Consolidated
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), View User Groups, Pagination (Page X of Y, rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Fiscal Periods, Open Posting Period, Closed Periods, Consolidated Periods)
 *   - Clean cards, modern typography, color-coded status badges for GL, IL, and Balance Consolidation
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add modal opening (inline onclick, module listener, document delegation)
 *   - "View User Groups" seamless navigation to Master 7 (User Groups per Period)
 *   - Edit & Delete per row, bulk delete, search and multi-criteria filters
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data for FY 2026 and FY 2025
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_ACCOUNTING_PERIODS_V1';

    const SEED_DATA = [
        {
            id: 'per-2026-01',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '01',
            description: 'January 2026',
            validFrom: '2026-01-01',
            validUntil: '2026-01-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'M1 hard close completed and audited'
        },
        {
            id: 'per-2026-02',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '02',
            description: 'February 2026',
            validFrom: '2026-02-01',
            validUntil: '2026-02-28',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'M2 closed and consolidated'
        },
        {
            id: 'per-2026-03',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '03',
            description: 'March 2026 (Q1 Close)',
            validFrom: '2026-03-01',
            validUntil: '2026-03-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'Q1 quarterly board report finalized'
        },
        {
            id: 'per-2026-04',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '04',
            description: 'April 2026',
            validFrom: '2026-04-01',
            validUntil: '2026-04-30',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'M4 closed'
        },
        {
            id: 'per-2026-05',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '05',
            description: 'May 2026',
            validFrom: '2026-05-01',
            validUntil: '2026-05-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'M5 closed'
        },
        {
            id: 'per-2026-06',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '06',
            description: 'June 2026 (H1 Close)',
            validFrom: '2026-06-01',
            validUntil: '2026-06-30',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'Half-year statutory consolidation completed'
        },
        {
            id: 'per-2026-07',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '07',
            description: 'July 2026',
            validFrom: '2026-07-01',
            validUntil: '2026-07-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'M7 closed'
        },
        {
            id: 'per-2026-08',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            description: 'August 2026',
            validFrom: '2026-08-01',
            validUntil: '2026-08-31',
            periodType: 'Standard',
            glStatus: 'Audit Only',
            ilStatus: 'Closed',
            balanceConsolidated: 'Yes',
            notes: 'Audit review in progress'
        },
        {
            id: 'per-2026-09',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            description: 'September 2026 (Current Period)',
            validFrom: '2026-09-01',
            validUntil: '2026-09-30',
            periodType: 'Standard',
            glStatus: 'Open',
            ilStatus: 'Open',
            balanceConsolidated: 'No',
            notes: 'Active posting period across all ledgers'
        },
        {
            id: 'per-2026-10',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '10',
            description: 'October 2026',
            validFrom: '2026-10-01',
            validUntil: '2026-10-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'No',
            notes: 'Future posting period'
        },
        {
            id: 'per-2026-11',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '11',
            description: 'November 2026',
            validFrom: '2026-11-01',
            validUntil: '2026-11-30',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'No',
            notes: 'Future posting period'
        },
        {
            id: 'per-2026-12',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '12',
            description: 'December 2026 (Year End)',
            validFrom: '2026-12-01',
            validUntil: '2026-12-31',
            periodType: 'Standard',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'No',
            notes: 'Fiscal year-end closing month'
        },
        {
            id: 'per-2026-13',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '13',
            description: 'FY 2026 Year-End Adjustments',
            validFrom: '2026-12-31',
            validUntil: '2026-12-31',
            periodType: 'Year End / Adjustments',
            glStatus: 'Closed',
            ilStatus: 'Closed',
            balanceConsolidated: 'No',
            notes: 'Reserved for statutory year-end audit adjustments'
        }
    ];

    const AccountingPeriodsModule = {
        data: [],
        selectedIds: new Set(),
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            year: '',
            query: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.render();
            console.log('AccountingPeriodsModule initialized successfully.');
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
                console.error('Error loading Accounting Periods from storage:', err);
                this.data = JSON.parse(JSON.stringify(SEED_DATA));
            }
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.error('Error saving Accounting Periods:', err);
            }
        },

        getFilteredData() {
            const f = this.filters;
            return this.data.filter(item => {
                if (f.company && f.company !== 'All' && item.company !== f.company) return false;
                if (f.year && !item.year.toLowerCase().includes(f.year.toLowerCase().trim())) return false;
                if (f.query) {
                    const q = f.query.toLowerCase().trim();
                    const match = item.period.toLowerCase().includes(q) ||
                                  item.description.toLowerCase().includes(q) ||
                                  item.company.toLowerCase().includes(q) ||
                                  item.year.includes(q) ||
                                  item.periodType.toLowerCase().includes(q) ||
                                  item.glStatus.toLowerCase().includes(q) ||
                                  item.ilStatus.toLowerCase().includes(q) ||
                                  item.balanceConsolidated.toLowerCase().includes(q);
                    if (!match) return false;
                }
                return true;
            });
        },

        renderKPIs() {
            const totalPeriods = this.data.length;
            const openPeriods = this.data.filter(d => d.glStatus === 'Open' || d.ilStatus === 'Open').length;
            const closedPeriods = this.data.filter(d => d.glStatus === 'Closed' && d.ilStatus === 'Closed').length;
            const consolidated = this.data.filter(d => d.balanceConsolidated === 'Yes').length;

            const elTotal = document.getElementById('kpi-aper-total');
            const elOpen = document.getElementById('kpi-aper-open');
            const elClosed = document.getElementById('kpi-aper-closed');
            const elConsol = document.getElementById('kpi-aper-consol');

            if (elTotal) elTotal.textContent = totalPeriods;
            if (elOpen) elOpen.textContent = openPeriods;
            if (elClosed) elClosed.textContent = closedPeriods;
            if (elConsol) elConsol.textContent = consolidated;
        },

        renderTable() {
            const filtered = this.getFilteredData();
            const tbody = document.getElementById('tbody-aper-list');
            const totalCountEl = document.getElementById('aper-total-count');
            const pageInfoEl = document.getElementById('aper-page-info');
            const selectAllCheckbox = document.getElementById('cb-aper-select-all');

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
                        <td colspan="10" style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
                            <div style="font-size: 32px; margin-bottom: 8px;">📅</div>
                            <div style="font-weight: 600; font-size: 14px; color: var(--color-text-main);">No Accounting Periods Found</div>
                            <div style="font-size: 12.5px; margin-top: 4px;">Try adjusting your search criteria or click "<strong>+ Add</strong>" to create a new fiscal period.</div>
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

                // Period Type Badge
                const getPeriodTypeBadge = (type) => {
                    if (type === 'Year End / Adjustments' || type === 'Special / Audit') {
                        return `<span class="badge" style="background: #ede9fe; color: #5b21b6; border: 1px solid #ddd6fe; font-weight: 600;">
                                    ${escapeHtml(type)}
                                </span>`;
                    }
                    return `<span class="badge" style="background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; font-weight: 500;">
                                ${escapeHtml(type)}
                            </span>`;
                };

                // Balance Consolidated Badge
                const getConsolBadge = (val) => {
                    if (val === 'Yes') {
                        return `<span class="badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    <span>✓</span> Yes
                                </span>`;
                    }
                    return `<span class="badge" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; font-weight: 500;">
                                No
                            </span>`;
                };

                return `
                    <tr style="cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor=''">
                        <td style="text-align: center; width: 44px; padding: 10px 8px;">
                            <input type="checkbox" class="aper-row-cb" data-id="${item.id}" ${isSelected ? 'checked' : ''} style="cursor: pointer; transform: scale(1.15);">
                        </td>
                        <td style="padding: 10px 14px; font-weight: 700; color: #1e3a8a;">
                            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #bfdbfe; font-family: 'Consolas', monospace; font-size: 13px; color: #1d4ed8;">
                                ${escapeHtml(item.period)}
                            </span>
                        </td>
                        <td style="padding: 10px 14px; color: var(--color-text-main); font-weight: 600;">
                            <div>${escapeHtml(item.description)}</div>
                            <div style="font-size: 11.5px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                                <span>🏢 ${escapeHtml(item.company)}</span>
                                <span>•</span>
                                <span>Fiscal Year: ${escapeHtml(item.year)}</span>
                            </div>
                        </td>
                        <td style="padding: 10px 14px; font-family: 'Consolas', monospace; font-size: 12.5px; color: #334155;">
                            ${escapeHtml(item.validFrom)}
                        </td>
                        <td style="padding: 10px 14px; font-family: 'Consolas', monospace; font-size: 12.5px; color: #334155;">
                            ${escapeHtml(item.validUntil)}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getPeriodTypeBadge(item.periodType)}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getStatusBadge(item.glStatus)}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getStatusBadge(item.ilStatus)}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${getConsolBadge(item.balanceConsolidated)}
                        </td>
                        <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                            <button class="btn btn-secondary btn-aper-edit" data-id="${item.id}" style="padding: 4px 10px; font-size: 11.5px; height: 28px; margin-right: 6px;" title="Edit Period">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-secondary btn-aper-del" data-id="${item.id}" style="padding: 4px 10px; font-size: 11.5px; height: 28px; color: #dc2626;" title="Delete Period">
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
            const delBtn = document.getElementById('btn-aper-bulk-delete');
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
            console.log('AccountingPeriodsModule: Opening Add Modal');
            this.editingId = null;
            const modalTitle = document.getElementById('modal-aper-title');
            if (modalTitle) modalTitle.innerHTML = '<span>➕</span> Add Accounting Period';

            // Reset form fields
            const fCompany = document.getElementById('aper-form-company');
            const fYear = document.getElementById('aper-form-year');
            const fPeriod = document.getElementById('aper-form-period');
            const fDesc = document.getElementById('aper-form-description');
            const fValidFrom = document.getElementById('aper-form-valid-from');
            const fValidUntil = document.getElementById('aper-form-valid-until');
            const fPeriodType = document.getElementById('aper-form-period-type');
            const fGLStatus = document.getElementById('aper-form-gl-status');
            const fILStatus = document.getElementById('aper-form-il-status');
            const fConsol = document.getElementById('aper-form-consol');
            const fNotes = document.getElementById('aper-form-notes');

            if (fCompany) fCompany.value = this.filters.company && this.filters.company !== 'All' ? this.filters.company : 'Laxmico Ltd';
            if (fYear) fYear.value = this.filters.year || '2026';
            if (fPeriod) fPeriod.value = '';
            if (fDesc) fDesc.value = '';
            if (fValidFrom) fValidFrom.value = '';
            if (fValidUntil) fValidUntil.value = '';
            if (fPeriodType) fPeriodType.value = 'Standard';
            if (fGLStatus) fGLStatus.value = 'Open';
            if (fILStatus) fILStatus.value = 'Open';
            if (fConsol) fConsol.value = 'No';
            if (fNotes) fNotes.value = '';

            const modal = document.getElementById('modal-add-accounting-period');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                if (fPeriod) setTimeout(() => fPeriod.focus(), 80);
            }
        },

        openEditModal(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.editingId = id;
            const modalTitle = document.getElementById('modal-aper-title');
            if (modalTitle) modalTitle.innerHTML = '<span>✏️</span> Edit Accounting Period';

            const fCompany = document.getElementById('aper-form-company');
            const fYear = document.getElementById('aper-form-year');
            const fPeriod = document.getElementById('aper-form-period');
            const fDesc = document.getElementById('aper-form-description');
            const fValidFrom = document.getElementById('aper-form-valid-from');
            const fValidUntil = document.getElementById('aper-form-valid-until');
            const fPeriodType = document.getElementById('aper-form-period-type');
            const fGLStatus = document.getElementById('aper-form-gl-status');
            const fILStatus = document.getElementById('aper-form-il-status');
            const fConsol = document.getElementById('aper-form-consol');
            const fNotes = document.getElementById('aper-form-notes');

            if (fCompany) fCompany.value = item.company;
            if (fYear) fYear.value = item.year;
            if (fPeriod) fPeriod.value = item.period;
            if (fDesc) fDesc.value = item.description;
            if (fValidFrom) fValidFrom.value = item.validFrom;
            if (fValidUntil) fValidUntil.value = item.validUntil;
            if (fPeriodType) fPeriodType.value = item.periodType;
            if (fGLStatus) fGLStatus.value = item.glStatus;
            if (fILStatus) fILStatus.value = item.ilStatus;
            if (fConsol) fConsol.value = item.balanceConsolidated;
            if (fNotes) fNotes.value = item.notes || '';

            const modal = document.getElementById('modal-add-accounting-period');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                if (fDesc) setTimeout(() => fDesc.focus(), 80);
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-accounting-period');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
        },

        saveForm() {
            const fCompany = document.getElementById('aper-form-company');
            const fYear = document.getElementById('aper-form-year');
            const fPeriod = document.getElementById('aper-form-period');
            const fDesc = document.getElementById('aper-form-description');
            const fValidFrom = document.getElementById('aper-form-valid-from');
            const fValidUntil = document.getElementById('aper-form-valid-until');
            const fPeriodType = document.getElementById('aper-form-period-type');
            const fGLStatus = document.getElementById('aper-form-gl-status');
            const fILStatus = document.getElementById('aper-form-il-status');
            const fConsol = document.getElementById('aper-form-consol');
            const fNotes = document.getElementById('aper-form-notes');

            const company = fCompany ? fCompany.value.trim() : 'Laxmico Ltd';
            const year = fYear ? fYear.value.trim() : '2026';
            let period = fPeriod ? fPeriod.value.trim() : '';
            if (period.length === 1) period = '0' + period;
            const description = fDesc ? fDesc.value.trim() : '';
            const validFrom = fValidFrom ? fValidFrom.value.trim() : '';
            const validUntil = fValidUntil ? fValidUntil.value.trim() : '';
            const periodType = fPeriodType ? fPeriodType.value : 'Standard';
            const glStatus = fGLStatus ? fGLStatus.value : 'Open';
            const ilStatus = fILStatus ? fILStatus.value : 'Open';
            const balanceConsolidated = fConsol ? fConsol.value : 'No';
            const notes = fNotes ? fNotes.value.trim() : '';

            if (!period) {
                alert('Please enter a Period code (e.g. 01 through 13).');
                if (fPeriod) fPeriod.focus();
                return;
            }
            if (!description) {
                alert('Please enter a Description for the Accounting Period.');
                if (fDesc) fDesc.focus();
                return;
            }
            if (!validFrom) {
                alert('Please enter a Valid From start date.');
                if (fValidFrom) fValidFrom.focus();
                return;
            }
            if (!validUntil) {
                alert('Please enter a Valid Until end date.');
                if (fValidUntil) fValidUntil.focus();
                return;
            }

            if (this.editingId) {
                // Update existing
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    item.company = company;
                    item.year = year;
                    item.period = period;
                    item.description = description;
                    item.validFrom = validFrom;
                    item.validUntil = validUntil;
                    item.periodType = periodType;
                    item.glStatus = glStatus;
                    item.ilStatus = ilStatus;
                    item.balanceConsolidated = balanceConsolidated;
                    item.notes = notes;
                }
            } else {
                // Add new record
                const newRecord = {
                    id: 'per-' + year + '-' + period + '-' + Date.now().toString(36),
                    company,
                    year,
                    period,
                    description,
                    validFrom,
                    validUntil,
                    periodType,
                    glStatus,
                    ilStatus,
                    balanceConsolidated,
                    notes
                };
                this.data.unshift(newRecord);
            }

            this.saveData();
            this.closeModal();
            this.render();
            if (window.showNotification) {
                window.showNotification(`Accounting Period ${period} (${year}) saved successfully.`, 'success');
            }
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;
            if (confirm(`Are you sure you want to delete Accounting Period "${item.period} - ${item.description}" (${item.company}, Year ${item.year})?`)) {
                this.data = this.data.filter(d => d.id !== id);
                this.selectedIds.delete(id);
                this.saveData();
                this.render();
                if (window.showNotification) {
                    window.showNotification(`Period ${item.period} deleted.`, 'info');
                }
            }
        },

        deleteSelected() {
            const count = this.selectedIds.size;
            if (count === 0) return;
            if (confirm(`Are you sure you want to delete ${count} selected accounting period${count === 1 ? '' : 's'}?`)) {
                this.data = this.data.filter(d => !this.selectedIds.has(d.id));
                this.selectedIds.clear();
                this.saveData();
                this.render();
                if (window.showNotification) {
                    window.showNotification(`${count} period${count === 1 ? '' : 's'} deleted successfully.`, 'info');
                }
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                alert('No records available to export.');
                return;
            }

            const headers = ['Company', 'Year', 'Period', 'Description', 'Valid From', 'Valid Until', 'Period Type', 'GL Period Status', 'IL Period Status', 'Balance Consolidated', 'Notes'];
            const rows = filtered.map(item => [
                item.company,
                item.year,
                item.period,
                item.description,
                item.validFrom,
                item.validUntil,
                item.periodType,
                item.glStatus,
                item.ilStatus,
                item.balanceConsolidated,
                item.notes || ''
            ]);

            let csvContent = 'data:text/csv;charset=utf-8,' +
                [headers.join(','), ...rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `ERP_Accounting_Periods_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        viewUserGroupsForSelected() {
            // View User Groups for first selected item, or current active period
            let targetPeriod = '09';
            let targetYear = '2026';

            if (this.selectedIds.size > 0) {
                const firstId = Array.from(this.selectedIds)[0];
                const item = this.data.find(d => d.id === firstId);
                if (item) {
                    targetPeriod = item.period;
                    targetYear = item.year;
                }
            }

            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-user-groups-period');
                if (window.UserGroupsPeriodModule) {
                    window.UserGroupsPeriodModule.filters.period = targetPeriod;
                    window.UserGroupsPeriodModule.filters.year = targetYear;
                    const fP = document.getElementById('filter-ugp-period');
                    const fY = document.getElementById('filter-ugp-year');
                    if (fP) fP.value = targetPeriod;
                    if (fY) fY.value = targetYear;
                    window.UserGroupsPeriodModule.currentPage = 1;
                    window.UserGroupsPeriodModule.renderTable();
                }
                if (window.showNotification) {
                    window.showNotification(`Viewing User Groups per Period for Period ${targetPeriod} (${targetYear}).`, 'info');
                }
            } else {
                alert(`Viewing User Groups for Period: ${targetPeriod}/${targetYear}`);
            }
        },

        bindEvents() {
            // Apply Search button click
            const btnSearch = document.getElementById('btn-aper-apply-filters');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    this.applyFiltersFromInputs();
                });
            }

            // Quick search input enter key
            const searchInput = document.getElementById('search-fin-accounting-periods');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filters.query = e.target.value;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Filter bar change events
            const fCompany = document.getElementById('filter-aper-company');
            const fYear = document.getElementById('filter-aper-year');

            if (fCompany) fCompany.addEventListener('change', () => this.applyFiltersFromInputs());
            if (fYear) fYear.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.applyFiltersFromInputs(); });

            // Reset filters
            const btnReset = document.getElementById('btn-aper-reset-filters');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    if (fCompany) fCompany.value = 'All';
                    if (fYear) fYear.value = '';
                    if (searchInput) searchInput.value = '';
                    this.filters = { company: '', year: '', query: '' };
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Select All Checkbox
            const selectAll = document.getElementById('cb-aper-select-all');
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
            const pageSizeSelect = document.getElementById('aper-page-size');
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    this.pageSize = parseInt(e.target.value, 10) || 1000;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Pagination prev/next
            const btnPrev = document.getElementById('btn-aper-prev-page');
            const btnNext = document.getElementById('btn-aper-next-page');
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
            const btnAddTop = document.getElementById('btn-add-fin-accounting-periods');
            const btnAddBottom = document.getElementById('btn-aper-add-row');

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
            const btnBulkDelete = document.getElementById('btn-aper-bulk-delete');
            if (btnBulkDelete) {
                btnBulkDelete.addEventListener('click', () => {
                    this.deleteSelected();
                });
            }

            // Export Download
            const btnExport = document.getElementById('btn-aper-download');
            const btnExportTop = document.getElementById('btn-aper-export-top');
            if (btnExport) btnExport.addEventListener('click', () => this.exportCSV());
            if (btnExportTop) btnExportTop.addEventListener('click', () => this.exportCSV());

            // View User Groups Button
            const btnViewUG = document.getElementById('btn-aper-view-ug');
            if (btnViewUG) {
                btnViewUG.addEventListener('click', () => {
                    this.viewUserGroupsForSelected();
                });
            }

            // Modal action buttons
            const btnSave = document.getElementById('btn-aper-save');
            const btnCancel = document.getElementById('btn-aper-cancel');
            const btnCloseModal = document.getElementById('btn-aper-close-modal');

            if (btnSave) btnSave.addEventListener('click', () => this.saveForm());
            if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());
            if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeModal());

            // Delegated table clicks (row checkboxes, edit, delete)
            const tbody = document.getElementById('tbody-aper-list');
            if (tbody) {
                tbody.addEventListener('click', (e) => {
                    // Row checkbox
                    const cb = e.target.closest('.aper-row-cb');
                    if (cb) {
                        const id = cb.getAttribute('data-id');
                        if (cb.checked) {
                            this.selectedIds.add(id);
                        } else {
                            this.selectedIds.delete(id);
                        }
                        this.updateDeleteButton();
                        const selectAllCheckbox = document.getElementById('cb-aper-select-all');
                        if (selectAllCheckbox) {
                            const filtered = this.getFilteredData();
                            const startIdx = (this.currentPage - 1) * this.pageSize;
                            const pageData = filtered.slice(startIdx, startIdx + this.pageSize);
                            selectAllCheckbox.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                        }
                        return;
                    }

                    // Edit button
                    const btnEdit = e.target.closest('.btn-aper-edit');
                    if (btnEdit) {
                        e.stopPropagation();
                        const id = btnEdit.getAttribute('data-id');
                        this.openEditModal(id);
                        return;
                    }

                    // Delete button
                    const btnDel = e.target.closest('.btn-aper-del');
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
            const fCompany = document.getElementById('filter-aper-company');
            const fYear = document.getElementById('filter-aper-year');

            this.filters.company = fCompany ? fCompany.value : '';
            this.filters.year = fYear ? fYear.value.trim() : '';

            this.currentPage = 1;
            this.renderTable();
        },

        setYearFilter(company, year) {
            const fCompany = document.getElementById('filter-aper-company');
            const fYear = document.getElementById('filter-aper-year');

            if (fCompany && company) fCompany.value = company;
            if (fYear && year) fYear.value = year;

            this.applyFiltersFromInputs();
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
    window.AccountingPeriodsModule = AccountingPeriodsModule;

    // Document delegation fallback for + Add buttons
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-accounting-periods, #btn-aper-add-row, [data-action="open-aper-modal"]');
        if (addBtn && window.AccountingPeriodsModule) {
            window.AccountingPeriodsModule.openAddModal();
        }
    });

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AccountingPeriodsModule.init());
    } else {
        AccountingPeriodsModule.init();
    }

})(window);
