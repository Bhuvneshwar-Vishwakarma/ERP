/**
 * accounting_years_module.js
 * 
 * Modern ERP Design for Accounting Years Master (ERP-FIN-MAS-009):
 * - Fields from screenshot:
 *   - Filters: Company (active enabled select), Year, Search Button
 *   - Table: Multi-select Checkbox, Year, Opening Balances, Closing Balances, Year Status, Opening Balances Consolidated
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), View Periods, Pagination (Page X of Y, rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Accounting Years, Active Fiscal Year, Closed Years, Balances Consolidated)
 *   - Clean cards, modern typography, color-coded status badges for Year Status, Balances, and Consolidation
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Multi-layer resilient Add modal opening (inline onclick, module listener, document delegation)
 *   - "View Periods" seamless navigation to Master 8 (Accounting Periods) with year filter preselected
 *   - Edit & Delete per row, bulk delete, search and multi-criteria filters
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data for Laxmico Ltd and B&S International
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_ACCOUNTING_YEARS_V1';

    const SEED_DATA = [
        {
            id: 'ay-2027',
            company: 'Laxmico Ltd',
            year: '2027',
            startDate: '2027-01-01',
            endDate: '2027-12-31',
            openingBalances: 'Pending',
            closingBalances: 'Open',
            yearStatus: 'Future',
            openingBalancesConsolidated: 'No',
            notes: 'Next financial year setup - budget planning & forward projections'
        },
        {
            id: 'ay-2026',
            company: 'Laxmico Ltd',
            year: '2026',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Open',
            yearStatus: 'Open',
            openingBalancesConsolidated: 'Yes',
            notes: 'Current active operational financial year for Laxmico Ltd'
        },
        {
            id: 'ay-2025',
            company: 'Laxmico Ltd',
            year: '2025',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Closed',
            yearStatus: 'Closed',
            openingBalancesConsolidated: 'Yes',
            notes: 'FY 2025 statutory audit completed, CT600 tax returns filed'
        },
        {
            id: 'ay-2024',
            company: 'Laxmico Ltd',
            year: '2024',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Closed',
            yearStatus: 'Closed',
            openingBalancesConsolidated: 'Yes',
            notes: 'Audited historical year, consolidated statutory accounts approved'
        },
        {
            id: 'ay-2023',
            company: 'Laxmico Ltd',
            year: '2023',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Closed',
            yearStatus: 'Closed',
            openingBalancesConsolidated: 'Yes',
            notes: 'Archived statutory year, books locked'
        },
        {
            id: 'ay-bs-2026',
            company: 'B&S International',
            year: '2026',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Open',
            yearStatus: 'Open',
            openingBalancesConsolidated: 'Yes',
            notes: 'B&S International active fiscal year operations'
        },
        {
            id: 'ay-bs-2025',
            company: 'B&S International',
            year: '2025',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            openingBalances: 'Yes',
            closingBalances: 'Closed',
            yearStatus: 'Closed',
            openingBalancesConsolidated: 'Yes',
            notes: 'B&S International FY 2025 consolidated closure'
        }
    ];

    const AccountingYearsModule = {
        data: [],
        selectedIds: new Set(),
        currentPage: 1,
        pageSize: 1000,
        editingId: null,
        filters: {
            company: '',
            year: '',
            quickSearch: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('AccountingYearsModule initialized successfully.');
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
                console.error('[AccountingYears] Error loading data from localStorage:', err);
                this.data = JSON.parse(JSON.stringify(SEED_DATA));
            }
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.error('[AccountingYears] Error saving data to localStorage:', err);
            }
        },

        getFilteredData() {
            const company = (this.filters.company || '').trim().toLowerCase();
            const year = (this.filters.year || '').trim().toLowerCase();
            const q = (this.filters.quickSearch || '').trim().toLowerCase();

            return this.data.filter(item => {
                if (company && item.company.toLowerCase() !== company) return false;
                if (year && !item.year.toLowerCase().includes(year)) return false;

                if (q) {
                    const matchText = [
                        item.year,
                        item.company,
                        item.openingBalances,
                        item.closingBalances,
                        item.yearStatus,
                        item.openingBalancesConsolidated,
                        item.notes || ''
                    ].join(' ').toLowerCase();

                    if (!matchText.includes(q)) return false;
                }

                return true;
            });
        },

        renderKPIs() {
            const totalYearsEl = document.getElementById('ay-kpi-total-years');
            const activeYearEl = document.getElementById('ay-kpi-active-year');
            const closedYearsEl = document.getElementById('ay-kpi-closed-years');
            const consolCountEl = document.getElementById('ay-kpi-consol-count');

            const total = this.data.length;
            const openYears = this.data.filter(d => d.yearStatus === 'Open');
            const activeYearText = openYears.length > 0 ? openYears.map(d => d.year).join(', ') : 'None';
            const closedCount = this.data.filter(d => d.yearStatus === 'Closed').length;
            const consolCount = this.data.filter(d => d.openingBalancesConsolidated === 'Yes').length;

            if (totalYearsEl) totalYearsEl.textContent = `${total} Years`;
            if (activeYearEl) activeYearEl.textContent = activeYearText;
            if (closedYearsEl) closedYearsEl.textContent = `${closedCount} Closed`;
            if (consolCountEl) consolCountEl.textContent = `${consolCount} Consolidated`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-ay-list');
            const countEl = document.getElementById('ay-total-count');
            const pageInfo = document.getElementById('ay-page-info');
            const selectAll = document.getElementById('cb-ay-select-all');

            if (!tbody) return;

            const filtered = this.getFilteredData();
            const totalCount = filtered.length;
            if (countEl) countEl.textContent = `${totalCount} records`;

            const totalPages = Math.ceil(totalCount / this.pageSize) || 1;
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
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
                        <td colspan="7" style="text-align: center; padding: 45px 20px; color: var(--color-text-muted);">
                            <div style="font-size: 36px; margin-bottom: 8px;">📆</div>
                            <div style="font-size: 14px; font-weight: 600; color: #475569;">No Accounting Years Found</div>
                            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 4px;">Try adjusting your company or year search criteria, or click "+ Add" to create a new fiscal year.</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            const rowsHtml = pageData.map(item => {
                const isChecked = this.selectedIds.has(item.id);

                // Status Badge Color Coding
                let statusBadge = '';
                if (item.yearStatus === 'Open') {
                    statusBadge = `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>Open</span>`;
                } else if (item.yearStatus === 'Closed') {
                    statusBadge = `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #64748b;"></span>Closed</span>`;
                } else if (item.yearStatus === 'Future') {
                    statusBadge = `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #3b82f6;"></span>Future</span>`;
                } else {
                    statusBadge = `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #fffbeb; color: #b45309; border: 1px solid #fde68a;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #f59e0b;"></span>${escapeHtml(item.yearStatus)}</span>`;
                }

                // Opening Balances Badge
                let opBalBadge = '';
                if (item.openingBalances === 'Yes' || item.openingBalances === 'Done') {
                    opBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;">✓ Yes</span>`;
                } else if (item.openingBalances === 'Pending') {
                    opBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #fffbeb; color: #b45309; border: 1px solid #fef08a;">⏳ Pending</span>`;
                } else {
                    opBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">${escapeHtml(item.openingBalances)}</span>`;
                }

                // Closing Balances Badge
                let clBalBadge = '';
                if (item.closingBalances === 'Closed') {
                    clBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">🔒 Closed</span>`;
                } else if (item.closingBalances === 'Open') {
                    clBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">🟢 Open</span>`;
                } else {
                    clBalBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa;">${escapeHtml(item.closingBalances)}</span>`;
                }

                // Opening Balances Consolidated Badge
                const isConsol = item.openingBalancesConsolidated === 'Yes';
                const consolBadge = isConsol
                    ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">✓ Yes</span>`
                    : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 500; background: #f8fafc; color: #94a3b8; border: 1px solid #e2e8f0;">No</span>`;

                return `
                    <tr style="border-bottom: 1px solid var(--color-border-light); transition: background 0.15s ease;" class="ay-table-row" data-id="${item.id}">
                        <td style="text-align: center; padding: 10px 8px;">
                            <input type="checkbox" class="cb-ay-row" data-id="${item.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; transform: scale(1.15);">
                        </td>
                        <td style="padding: 10px 14px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #0f172a; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">${escapeHtml(item.year)}</span>
                                <span style="font-size: 11.5px; color: #64748b;">${escapeHtml(item.company)}</span>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                                ${escapeHtml(item.startDate || '')} to ${escapeHtml(item.endDate || '')}
                            </div>
                        </td>
                        <td style="padding: 10px 14px;">
                            ${opBalBadge}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${clBalBadge}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${statusBadge}
                        </td>
                        <td style="padding: 10px 14px;">
                            ${consolBadge}
                        </td>
                        <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                            <button class="btn btn-sm btn-secondary btn-ay-view-periods" data-id="${item.id}" data-year="${escapeHtml(item.year)}" data-company="${escapeHtml(item.company)}" title="View Accounting Periods for ${item.year}" style="height: 28px; padding: 0 8px; font-size: 11.5px; color: #2563eb; border-color: #bfdbfe; margin-right: 4px;">
                                <span>👁️</span> Periods
                            </button>
                            <button class="btn btn-sm btn-secondary btn-ay-edit" data-id="${item.id}" title="Edit Accounting Year" style="height: 28px; padding: 0 8px; font-size: 12px; margin-right: 4px;">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-secondary btn-ay-del" data-id="${item.id}" title="Delete Accounting Year" style="height: 28px; padding: 0 8px; font-size: 12px; color: #dc2626;">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.innerHTML = rowsHtml;
            this.updateDeleteButton();
        },

        updateDeleteButton() {
            const btnBulkDelete = document.getElementById('btn-ay-bulk-delete');
            if (!btnBulkDelete) return;

            const count = this.selectedIds.size;
            if (count > 0) {
                btnBulkDelete.removeAttribute('disabled');
                btnBulkDelete.style.opacity = '1';
                btnBulkDelete.style.cursor = 'pointer';
                btnBulkDelete.innerHTML = `<span>🗑️</span> Delete (${count})`;
            } else {
                btnBulkDelete.setAttribute('disabled', 'true');
                btnBulkDelete.style.opacity = '0.5';
                btnBulkDelete.style.cursor = 'not-allowed';
                btnBulkDelete.innerHTML = `<span>🗑️</span> Delete`;
            }
        },

        openAddModal() {
            this.editingId = null;
            const modal = document.getElementById('modal-add-accounting-year');
            const title = document.getElementById('modal-ay-title');
            const form = document.getElementById('form-add-accounting-year');

            if (!modal) return;
            if (title) title.textContent = 'Add Accounting Year';
            if (form) form.reset();

            // Prefill sensible defaults
            const compSelect = document.getElementById('ay-form-company');
            const yearInput = document.getElementById('ay-form-year');
            const startInput = document.getElementById('ay-form-start');
            const endInput = document.getElementById('ay-form-end');
            const opBalSelect = document.getElementById('ay-form-op-bal');
            const clBalSelect = document.getElementById('ay-form-cl-bal');
            const statusSelect = document.getElementById('ay-form-status');
            const consolSelect = document.getElementById('ay-form-consol');

            if (compSelect) {
                compSelect.removeAttribute('disabled');
                compSelect.value = this.filters.company || 'Laxmico Ltd';
            }

            const currentNextYear = new Date().getFullYear() + 1;
            if (yearInput) yearInput.value = currentNextYear.toString();
            if (startInput) startInput.value = `${currentNextYear}-01-01`;
            if (endInput) endInput.value = `${currentNextYear}-12-31`;
            if (opBalSelect) opBalSelect.value = 'Pending';
            if (clBalSelect) clBalSelect.value = 'Open';
            if (statusSelect) statusSelect.value = 'Future';
            if (consolSelect) consolSelect.value = 'No';

            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        },

        openEditModal(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.editingId = id;
            const modal = document.getElementById('modal-add-accounting-year');
            const title = document.getElementById('modal-ay-title');

            if (!modal) return;
            if (title) title.textContent = `Edit Accounting Year: ${item.year} (${item.company})`;

            const compSelect = document.getElementById('ay-form-company');
            const yearInput = document.getElementById('ay-form-year');
            const startInput = document.getElementById('ay-form-start');
            const endInput = document.getElementById('ay-form-end');
            const opBalSelect = document.getElementById('ay-form-op-bal');
            const clBalSelect = document.getElementById('ay-form-cl-bal');
            const statusSelect = document.getElementById('ay-form-status');
            const consolSelect = document.getElementById('ay-form-consol');
            const notesInput = document.getElementById('ay-form-notes');

            if (compSelect) {
                compSelect.removeAttribute('disabled');
                compSelect.value = item.company;
            }
            if (yearInput) yearInput.value = item.year;
            if (startInput) startInput.value = item.startDate || `${item.year}-01-01`;
            if (endInput) endInput.value = item.endDate || `${item.year}-12-31`;
            if (opBalSelect) opBalSelect.value = item.openingBalances;
            if (clBalSelect) clBalSelect.value = item.closingBalances;
            if (statusSelect) statusSelect.value = item.yearStatus;
            if (consolSelect) consolSelect.value = item.openingBalancesConsolidated;
            if (notesInput) notesInput.value = item.notes || '';

            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        },

        closeModal() {
            const modal = document.getElementById('modal-add-accounting-year');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
        },

        saveForm() {
            const compSelect = document.getElementById('ay-form-company');
            const yearInput = document.getElementById('ay-form-year');
            const startInput = document.getElementById('ay-form-start');
            const endInput = document.getElementById('ay-form-end');
            const opBalSelect = document.getElementById('ay-form-op-bal');
            const clBalSelect = document.getElementById('ay-form-cl-bal');
            const statusSelect = document.getElementById('ay-form-status');
            const consolSelect = document.getElementById('ay-form-consol');
            const notesInput = document.getElementById('ay-form-notes');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const year = yearInput ? yearInput.value.trim() : '';
            const startDate = startInput ? startInput.value : `${year}-01-01`;
            const endDate = endInput ? endInput.value : `${year}-12-31`;
            const openingBalances = opBalSelect ? opBalSelect.value : 'Pending';
            const closingBalances = clBalSelect ? clBalSelect.value : 'Open';
            const yearStatus = statusSelect ? statusSelect.value : 'Open';
            const openingBalancesConsolidated = consolSelect ? consolSelect.value : 'No';
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!company) {
                alert('Please select a Company.');
                return;
            }
            if (!year || isNaN(year) || parseInt(year) < 1900 || parseInt(year) > 2100) {
                alert('Please enter a valid 4-digit fiscal year (e.g. 2026).');
                return;
            }

            if (this.editingId) {
                // Update
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    item.company = company;
                    item.year = year;
                    item.startDate = startDate;
                    item.endDate = endDate;
                    item.openingBalances = openingBalances;
                    item.closingBalances = closingBalances;
                    item.yearStatus = yearStatus;
                    item.openingBalancesConsolidated = openingBalancesConsolidated;
                    item.notes = notes;
                }
            } else {
                // Check duplicate
                const exists = this.data.some(d => d.company.toLowerCase() === company.toLowerCase() && d.year === year);
                if (exists) {
                    alert(`Accounting Year ${year} already exists for ${company}.`);
                    return;
                }

                const newYear = {
                    id: 'ay-' + Date.now(),
                    company,
                    year,
                    startDate,
                    endDate,
                    openingBalances,
                    closingBalances,
                    yearStatus,
                    openingBalancesConsolidated,
                    notes
                };
                this.data.unshift(newYear);
            }

            this.saveData();
            this.renderKPIs();
            this.renderTable();
            this.closeModal();
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            if (confirm(`Are you sure you want to delete Accounting Year ${item.year} for ${item.company}?`)) {
                this.data = this.data.filter(d => d.id !== id);
                this.selectedIds.delete(id);
                this.saveData();
                this.renderKPIs();
                this.renderTable();
            }
        },

        bulkDelete() {
            if (this.selectedIds.size === 0) return;

            if (confirm(`Are you sure you want to delete ${this.selectedIds.size} selected Accounting Year(s)?`)) {
                this.data = this.data.filter(d => !this.selectedIds.has(d.id));
                this.selectedIds.clear();
                this.saveData();
                this.renderKPIs();
                this.renderTable();
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                alert('No accounting year records to export.');
                return;
            }

            const headers = ['Company', 'Year', 'Start Date', 'End Date', 'Opening Balances', 'Closing Balances', 'Year Status', 'Opening Balances Consolidated', 'Notes'];
            const rows = filtered.map(d => [
                `"${(d.company || '').replace(/"/g, '""')}"`,
                `"${(d.year || '').replace(/"/g, '""')}"`,
                `"${(d.startDate || '').replace(/"/g, '""')}"`,
                `"${(d.endDate || '').replace(/"/g, '""')}"`,
                `"${(d.openingBalances || '').replace(/"/g, '""')}"`,
                `"${(d.closingBalances || '').replace(/"/g, '""')}"`,
                `"${(d.yearStatus || '').replace(/"/g, '""')}"`,
                `"${(d.openingBalancesConsolidated || '').replace(/"/g, '""')}"`,
                `"${(d.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Accounting_Years_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        viewPeriods(targetYear, targetCompany) {
            // Find target year if not provided
            if (!targetYear && this.selectedIds.size > 0) {
                const firstId = Array.from(this.selectedIds)[0];
                const item = this.data.find(d => d.id === firstId);
                if (item) {
                    targetYear = item.year;
                    targetCompany = item.company;
                }
            }

            if (!targetYear) {
                const filtered = this.getFilteredData();
                if (filtered.length > 0) {
                    targetYear = filtered[0].year;
                    targetCompany = filtered[0].company;
                } else {
                    targetYear = '2026';
                    targetCompany = 'Laxmico Ltd';
                }
            }

            // Switch to panel-fin-accounting-periods
            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-accounting-periods');
            } else {
                const navItem = document.querySelector('[data-fin-nav="fin-accounting-periods"]');
                if (navItem) navItem.click();
            }

            // Pass year and company filter to Accounting Periods Module
            setTimeout(() => {
                const fYear = document.getElementById('filter-aper-year');
                const fComp = document.getElementById('filter-aper-company');
                if (fYear && targetYear) fYear.value = targetYear;
                if (fComp && targetCompany) fComp.value = targetCompany;

                if (window.AccountingPeriodsModule && typeof window.AccountingPeriodsModule.applyFiltersFromInputs === 'function') {
                    window.AccountingPeriodsModule.applyFiltersFromInputs();
                } else {
                    const searchBtn = document.getElementById('btn-aper-search');
                    if (searchBtn) searchBtn.click();
                }
            }, 100);
        },

        bindEvents() {
            // Filter Search Button
            const btnSearch = document.getElementById('btn-ay-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    this.applyFiltersFromInputs();
                });
            }

            // Filter Reset Button
            const btnReset = document.getElementById('btn-ay-reset');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    const fCompany = document.getElementById('filter-ay-company');
                    const fYear = document.getElementById('filter-ay-year');
                    const fQuick = document.getElementById('search-fin-accounting-years');

                    if (fCompany) fCompany.value = '';
                    if (fYear) fYear.value = '';
                    if (fQuick) fQuick.value = '';

                    this.filters.company = '';
                    this.filters.year = '';
                    this.filters.quickSearch = '';
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Quick search input
            const quickSearch = document.getElementById('search-fin-accounting-years');
            if (quickSearch) {
                quickSearch.addEventListener('input', (e) => {
                    this.filters.quickSearch = e.target.value;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Filter inputs enter key trigger
            const fYear = document.getElementById('filter-ay-year');
            if (fYear) {
                fYear.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyFiltersFromInputs();
                    }
                });
            }

            // Add buttons (top toolbar and table toolbar)
            const btnAddTop = document.getElementById('btn-add-fin-accounting-years');
            const btnAddRow = document.getElementById('btn-ay-add-row');
            if (btnAddTop) {
                btnAddTop.addEventListener('click', () => this.openAddModal());
            }
            if (btnAddRow) {
                btnAddRow.addEventListener('click', () => this.openAddModal());
            }

            // Bulk delete
            const btnBulkDelete = document.getElementById('btn-ay-bulk-delete');
            if (btnBulkDelete) {
                btnBulkDelete.addEventListener('click', () => this.bulkDelete());
            }

            // Download CSV buttons
            const btnDownload = document.getElementById('btn-ay-download');
            const btnExportTop = document.getElementById('btn-ay-export-top');
            if (btnDownload) {
                btnDownload.addEventListener('click', () => this.exportCSV());
            }
            if (btnExportTop) {
                btnExportTop.addEventListener('click', () => this.exportCSV());
            }

            // View Periods toolbar button
            const btnViewPeriods = document.getElementById('btn-ay-view-periods');
            if (btnViewPeriods) {
                btnViewPeriods.addEventListener('click', () => {
                    this.viewPeriods();
                });
            }

            // Modal cancel and close buttons
            const btnCloseModal = document.getElementById('btn-modal-ay-close');
            const btnCancelModal = document.getElementById('btn-ay-cancel');
            const btnSaveModal = document.getElementById('btn-ay-save');
            const modal = document.getElementById('modal-add-accounting-year');

            if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeModal());
            if (btnCancelModal) btnCancelModal.addEventListener('click', () => this.closeModal());
            if (btnSaveModal) btnSaveModal.addEventListener('click', () => this.saveForm());

            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.closeModal();
                });
            }

            // Escape key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const m = document.getElementById('modal-add-accounting-year');
                    if (m && !m.classList.contains('hidden') && m.style.display !== 'none') {
                        this.closeModal();
                    }
                }
            });

            // Pagination Controls
            const btnPrev = document.getElementById('btn-ay-prev-page');
            const btnNext = document.getElementById('btn-ay-next-page');
            const pageSizeSelect = document.getElementById('ay-page-size');

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
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    this.pageSize = parseInt(e.target.value, 10) || 1000;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Table Select All checkbox
            const selectAll = document.getElementById('cb-ay-select-all');
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

            // Event Delegation for Table Rows (Checkbox, Edit, Delete, View Periods)
            const tbody = document.getElementById('tbody-ay-list');
            if (tbody) {
                tbody.addEventListener('click', (e) => {
                    // Checkbox
                    if (e.target.classList.contains('cb-ay-row')) {
                        const id = e.target.getAttribute('data-id');
                        if (e.target.checked) {
                            this.selectedIds.add(id);
                        } else {
                            this.selectedIds.delete(id);
                        }
                        this.updateDeleteButton();
                        const selectAllCheckbox = document.getElementById('cb-ay-select-all');
                        if (selectAllCheckbox) {
                            const filtered = this.getFilteredData();
                            const startIdx = (this.currentPage - 1) * this.pageSize;
                            const pageData = filtered.slice(startIdx, startIdx + this.pageSize);
                            selectAllCheckbox.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                        }
                        return;
                    }

                    // View Periods button
                    const btnView = e.target.closest('.btn-ay-view-periods');
                    if (btnView) {
                        e.stopPropagation();
                        const year = btnView.getAttribute('data-year');
                        const company = btnView.getAttribute('data-company');
                        this.viewPeriods(year, company);
                        return;
                    }

                    // Edit button
                    const btnEdit = e.target.closest('.btn-ay-edit');
                    if (btnEdit) {
                        e.stopPropagation();
                        const id = btnEdit.getAttribute('data-id');
                        this.openEditModal(id);
                        return;
                    }

                    // Delete button
                    const btnDel = e.target.closest('.btn-ay-del');
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
            const fCompany = document.getElementById('filter-ay-company');
            const fYear = document.getElementById('filter-ay-year');

            this.filters.company = fCompany ? fCompany.value : '';
            this.filters.year = fYear ? fYear.value.trim() : '';

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

    // Export module globally
    window.AccountingYearsModule = AccountingYearsModule;

    // Document delegation fallback for + Add buttons and Modal buttons
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-accounting-years, #btn-ay-add-row, [data-action="open-ay-modal"]');
        if (addBtn && window.AccountingYearsModule) {
            e.preventDefault();
            window.AccountingYearsModule.openAddModal();
            return;
        }

        const closeBtn = e.target.closest('#btn-modal-ay-close, #btn-ay-cancel');
        if (closeBtn) {
            e.preventDefault();
            if (window.AccountingYearsModule && typeof window.AccountingYearsModule.closeModal === 'function') {
                window.AccountingYearsModule.closeModal();
            } else {
                const modal = document.getElementById('modal-add-accounting-year');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            }
            return;
        }

        const saveBtn = e.target.closest('#btn-ay-save');
        if (saveBtn) {
            e.preventDefault();
            if (window.AccountingYearsModule && typeof window.AccountingYearsModule.saveForm === 'function') {
                window.AccountingYearsModule.saveForm();
            }
            return;
        }
    });

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AccountingYearsModule.init());
    } else {
        AccountingYearsModule.init();
    }

})(window);
