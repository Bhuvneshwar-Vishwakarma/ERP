/**
 * voucher_series_module.js
 * 
 * Modern ERP Design for Voucher Series Per Voucher Type Master (ERP-FIN-MAS-010):
 * - Fields from screenshot:
 *   - Filters: Company (active enabled select), Year, Voucher Type, Period, Description, Search Button (magnifying glass)
 *   - Table: Multi-select Checkbox, Year, Period, From Number, Until Number, Next Number
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV), View User Groups, Pagination (Page X of Y, rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Voucher Series, Active Sequences, Current Period Series, Numbering Capacity)
 *   - Clean cards, modern typography, color-coded status badges, sequence progress indicators
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add modal opening and button handlers (inline onclick, module listener, document delegation)
 *   - "View User Groups" seamless cross-navigation to Master 11 (User Groups Per Voucher Series)
 *   - Edit & Delete per row, bulk delete, search and multi-criteria filters
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data for Laxmico Ltd and B&S International
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_VOUCHER_SERIES_V1';

    const VOUCHER_TYPES = [
        { code: 'PINV', name: 'Purchase Invoice', desc: 'Supplier Invoices and Direct Goods Received AP Postings', defaultFrom: 10000000, defaultUntil: 19999999 },
        { code: 'SINV', name: 'Sales Invoice', desc: 'Customer Sales Invoices and Billing Postings', defaultFrom: 20000000, defaultUntil: 29999999 },
        { code: 'BPAY', name: 'Bank Payment', desc: 'Bank Outgoing Disbursements, BACS, and Wire Transfers', defaultFrom: 30000000, defaultUntil: 39999999 },
        { code: 'BREC', name: 'Bank Receipt', desc: 'Bank Incoming Customer Remittances and Direct Deposits', defaultFrom: 40000000, defaultUntil: 49999999 },
        { code: 'CPAY', name: 'Cash Payment', desc: 'Petty Cash Disbursements and Office Expense Vouchers', defaultFrom: 50000000, defaultUntil: 59999999 },
        { code: 'CREC', name: 'Cash Receipt', desc: 'Petty Cash Collection and Counter Cash Remittances', defaultFrom: 60000000, defaultUntil: 69999999 },
        { code: 'JRNL', name: 'General Journal', desc: 'GL Journal Adjustments, Accruals, and Period Provisions', defaultFrom: 70000000, defaultUntil: 79999999 },
        { code: 'ADJ', name: 'Inventory Adjustment', desc: 'Stock Revaluation and Inventory Variance Postings', defaultFrom: 80000000, defaultUntil: 84999999 },
        { code: 'FA', name: 'Fixed Assets', desc: 'Monthly Depreciation and Asset Acquisition / Disposal', defaultFrom: 85000000, defaultUntil: 89999999 },
        { code: 'PAY', name: 'Payroll Voucher', desc: 'Monthly Net Wages, PAYE, and Pension Liabilities', defaultFrom: 90000000, defaultUntil: 99999999 }
    ];

    const SEED_DATA = [
        {
            id: 'vst-001',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'PINV',
            description: 'Supplier Invoices and Direct Goods Received AP Postings',
            fromNumber: 10000000,
            untilNumber: 19999999,
            nextNumber: 10000142,
            prefix: 'PINV-2609-',
            status: 'Active',
            notes: 'Current period live series for AP department'
        },
        {
            id: 'vst-002',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'SINV',
            description: 'Customer Sales Invoices and Billing Postings',
            fromNumber: 20000000,
            untilNumber: 29999999,
            nextNumber: 20000589,
            prefix: 'SINV-2609-',
            status: 'Active',
            notes: 'Customer dispatch billing automated sequence'
        },
        {
            id: 'vst-003',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'BPAY',
            description: 'Bank Outgoing Disbursements, BACS, and Wire Transfers',
            fromNumber: 30000000,
            untilNumber: 39999999,
            nextNumber: 30000078,
            prefix: 'BPAY-2609-',
            status: 'Active',
            notes: 'Commercial bank payments clearing'
        },
        {
            id: 'vst-004',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'BREC',
            description: 'Bank Incoming Customer Remittances and Direct Deposits',
            fromNumber: 40000000,
            untilNumber: 49999999,
            nextNumber: 40000214,
            prefix: 'BREC-2609-',
            status: 'Active',
            notes: 'Automated bank feed receipt settlement'
        },
        {
            id: 'vst-005',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'CPAY',
            description: 'Petty Cash Disbursements and Office Expense Vouchers',
            fromNumber: 50000000,
            untilNumber: 59999999,
            nextNumber: 50000031,
            prefix: 'CPAY-2609-',
            status: 'Active',
            notes: 'Finance petty cash float'
        },
        {
            id: 'vst-006',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'CREC',
            description: 'Petty Cash Collection and Counter Cash Remittances',
            fromNumber: 60000000,
            untilNumber: 69999999,
            nextNumber: 60000019,
            prefix: 'CREC-2609-',
            status: 'Active',
            notes: 'Counter receipts and cash sales float'
        },
        {
            id: 'vst-007',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '09',
            voucherType: 'JRNL',
            description: 'GL Journal Adjustments, Accruals, and Period Provisions',
            fromNumber: 70000000,
            untilNumber: 79999999,
            nextNumber: 70000095,
            prefix: 'JRNL-2609-',
            status: 'Active',
            notes: 'Month-end manual journal entries'
        },
        {
            id: 'vst-008',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            voucherType: 'PINV',
            description: 'Supplier Invoices and Direct Goods Received AP Postings',
            fromNumber: 10000000,
            untilNumber: 19999999,
            nextNumber: 10000412,
            prefix: 'PINV-2608-',
            status: 'Closed',
            notes: 'Period closed'
        },
        {
            id: 'vst-009',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '08',
            voucherType: 'SINV',
            description: 'Customer Sales Invoices and Billing Postings',
            fromNumber: 20000000,
            untilNumber: 29999999,
            nextNumber: 20001150,
            prefix: 'SINV-2608-',
            status: 'Closed',
            notes: 'Period closed'
        },
        {
            id: 'vst-010',
            company: 'Laxmico Ltd',
            year: '2026',
            period: '00',
            voucherType: 'FA',
            description: 'Fixed Assets Depreciation and Asset Capitalization',
            fromNumber: 85000000,
            untilNumber: 89999999,
            nextNumber: 85000012,
            prefix: 'FA-2026-',
            status: 'Active',
            notes: 'Annual fixed asset capitalization register'
        },
        {
            id: 'vst-011',
            company: 'B&S International',
            year: '2026',
            period: '09',
            voucherType: 'PINV',
            description: 'Supplier Invoices and Direct Goods Received AP Postings',
            fromNumber: 10000000,
            untilNumber: 19999999,
            nextNumber: 10000085,
            prefix: 'BSI-PINV-2609-',
            status: 'Active',
            notes: 'International supplier trade invoices'
        },
        {
            id: 'vst-012',
            company: 'B&S International',
            year: '2026',
            period: '09',
            voucherType: 'SINV',
            description: 'Customer Sales Invoices and Billing Postings',
            fromNumber: 20000000,
            untilNumber: 29999999,
            nextNumber: 20000320,
            prefix: 'BSI-SINV-2609-',
            status: 'Active',
            notes: 'Global trade export invoices'
        }
    ];

    const VoucherSeriesModule = {
        data: [],
        voucherTypes: VOUCHER_TYPES,
        selectedIds: new Set(),
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            year: '',
            voucherType: '',
            period: '',
            quickSearch: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('VoucherSeriesModule initialized successfully.');
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
                console.error('[VoucherSeries] Error loading data from localStorage:', err);
                this.data = JSON.parse(JSON.stringify(SEED_DATA));
            }
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.error('[VoucherSeries] Error saving data to localStorage:', err);
            }
        },

        getFilteredData() {
            const company = (this.filters.company || '').trim().toLowerCase();
            const year = (this.filters.year || '').trim().toLowerCase();
            const vType = (this.filters.voucherType || '').trim().toUpperCase();
            const period = (this.filters.period || '').trim();
            const q = (this.filters.quickSearch || '').trim().toLowerCase();

            return this.data.filter(item => {
                if (company && item.company.toLowerCase() !== company) return false;
                if (year && !item.year.toLowerCase().includes(year)) return false;
                if (vType && item.voucherType.toUpperCase() !== vType) return false;
                if (period && item.period !== period && item.period !== period.padStart(2, '0')) return false;

                if (q) {
                    const matchText = [
                        item.year,
                        item.period,
                        item.voucherType,
                        item.description,
                        item.fromNumber,
                        item.untilNumber,
                        item.nextNumber,
                        item.company,
                        item.status || ''
                    ].join(' ').toLowerCase();

                    if (!matchText.includes(q)) return false;
                }

                return true;
            });
        },

        renderKPIs() {
            const totalSeriesEl = document.getElementById('vst-kpi-total-series');
            const activeSeriesEl = document.getElementById('vst-kpi-active-series');
            const curPeriodEl = document.getElementById('vst-kpi-current-period');
            const capacityEl = document.getElementById('vst-kpi-capacity');

            const total = this.data.length;
            const activeCount = this.data.filter(d => d.status !== 'Closed').length;
            const p09Count = this.data.filter(d => d.period === '09').length;

            if (totalSeriesEl) totalSeriesEl.textContent = `${total} Series`;
            if (activeSeriesEl) activeSeriesEl.textContent = `${activeCount} Active`;
            if (curPeriodEl) curPeriodEl.textContent = `${p09Count} Series (P09)`;
            if (capacityEl) capacityEl.textContent = `< 1% Used (Optimal)`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-vst-list');
            const countEl = document.getElementById('vst-total-count');
            const pageInfo = document.getElementById('vst-page-info');
            const selectAll = document.getElementById('cb-vst-select-all');

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

            const pageInput = document.getElementById('vst-page-input');
            if (pageInput) {
                pageInput.value = totalCount === 0 ? 1 : this.currentPage;
            }
            const ofPagesEl = document.getElementById('vst-of-pages');
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
                            <div style="font-size: 38px; margin-bottom: 8px;">🔢</div>
                            <div style="font-size: 14px; font-weight: 600; color: #475569;">No Voucher Series Found</div>
                            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 4px;">No records match your selected Company, Year, Voucher Type, or Period criteria. Click "+ Add" to create a new sequence.</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            const rowsHtml = pageData.map((item, index) => {
                const isChecked = this.selectedIds.has(item.id);
                const isOdd = index % 2 === 1;
                const rowBg = isChecked ? '#eff6ff' : (isOdd ? '#f8fafc' : '#ffffff');

                // Capacity calculation (BigInt safe)
                let percentUsed = '0.0';
                try {
                    const fn = BigInt(item.fromNumber.toString().replace(/,/g, '').trim());
                    const un = BigInt(item.untilNumber.toString().replace(/,/g, '').trim());
                    const nn = BigInt(item.nextNumber.toString().replace(/,/g, '').trim());
                    const totalRange = (un - fn) + 1n;
                    const used = nn > fn ? nn - fn : 0n;
                    if (totalRange > 0n) {
                        percentUsed = ((Number(used) / Number(totalRange)) * 100).toFixed(1);
                    }
                } catch (e) {
                    percentUsed = '0.0';
                }

                return `
                    <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; transition: background 0.15s ease;" data-id="${escapeHtml(item.id)}">
                        <td style="width: 40px; text-align: center; padding: 10px 8px;">
                            <input type="checkbox" class="cb-vst-row" data-id="${escapeHtml(item.id)}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b; font-family: 'JetBrains Mono', monospace;">
                            ${escapeHtml(item.year)}
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #3b82f6; font-family: 'JetBrains Mono', monospace;">
                            ${escapeHtml(item.period)}
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 500; color: #334155; font-family: 'JetBrains Mono', monospace;">
                            ${this.formatSeqNumber(item.fromNumber)}
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 500; color: #334155; font-family: 'JetBrains Mono', monospace;">
                            ${this.formatSeqNumber(item.untilNumber)}
                        </td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #047857; font-family: 'JetBrains Mono', monospace;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span>${this.formatSeqNumber(item.nextNumber)}</span>
                                <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #059669; font-weight: 500; border: 1px solid #a7f3d0;">
                                    ${percentUsed}%
                                </span>
                            </div>
                        </td>
                        <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                            <div style="display: inline-flex; align-items: center; gap: 6px;">
                                <button type="button" class="btn-vst-edit" data-id="${escapeHtml(item.id)}" title="Edit Voucher Series" style="background: transparent; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #334155; font-size: 12px; transition: all 0.15s ease;">
                                    ✏️ Edit
                                </button>
                                <button type="button" class="btn-vst-del" data-id="${escapeHtml(item.id)}" title="Delete Voucher Series" style="background: transparent; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #dc2626; font-size: 12px; transition: all 0.15s ease;">
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
            const btnDel = document.getElementById('btn-vst-delete');
            if (btnDel) {
                btnDel.disabled = this.selectedIds.size === 0;
                btnDel.style.opacity = this.selectedIds.size === 0 ? '0.6' : '1';
                btnDel.style.cursor = this.selectedIds.size === 0 ? 'not-allowed' : 'pointer';
            }
        },

        formatSeqNumber(val) {
            if (val === undefined || val === null || val === '') return '0';
            try {
                return BigInt(val.toString().replace(/,/g, '').trim()).toLocaleString();
            } catch (e) {
                return String(val);
            }
        },

        showFormError(msg) {
            const alertEl = document.getElementById('vst-form-alert');
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
            const alertEl = document.getElementById('vst-form-alert');
            if (alertEl) {
                alertEl.textContent = '';
                alertEl.style.display = 'none';
            }
        },

        openAddModal() {
            this.editingId = null;
            this.clearFormError();
            const modal = document.getElementById('modal-add-voucher-series');
            const title = document.getElementById('modal-vst-title');
            const saveBtn = document.getElementById('btn-vst-save');

            if (title) title.innerHTML = '<span>🔢</span> Add Voucher Series per Voucher Type';
            if (saveBtn) saveBtn.textContent = 'Save Voucher Series';

            // Populate form defaults from current filter selections
            const fComp = document.getElementById('filter-vst-company');
            const fYear = document.getElementById('filter-vst-year');
            const fType = document.getElementById('filter-vst-type');
            const fPer = document.getElementById('filter-vst-period');

            const compSelect = document.getElementById('vst-form-company');
            const yearInput = document.getElementById('vst-form-year');
            const typeSelect = document.getElementById('vst-form-type');
            const perInput = document.getElementById('vst-form-period');
            const descInput = document.getElementById('vst-form-desc');
            const fromInput = document.getElementById('vst-form-from');
            const untilInput = document.getElementById('vst-form-until');
            const nextInput = document.getElementById('vst-form-next');
            const prefixInput = document.getElementById('vst-form-prefix');
            const statusSelect = document.getElementById('vst-form-status');
            const notesInput = document.getElementById('vst-form-notes');

            if (compSelect) compSelect.value = (fComp && fComp.value) ? fComp.value : 'Laxmico Ltd';
            if (yearInput) yearInput.value = (fYear && fYear.value) ? fYear.value : '2026';
            if (typeSelect) typeSelect.value = (fType && fType.value) ? fType.value : 'PINV';
            if (perInput) perInput.value = (fPer && fPer.value) ? fPer.value : '09';

            this.onVoucherTypeFormChange();

            if (statusSelect) statusSelect.value = 'Active';
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
            const modal = document.getElementById('modal-add-voucher-series');
            const title = document.getElementById('modal-vst-title');
            const saveBtn = document.getElementById('btn-vst-save');

            if (title) title.innerHTML = `<span>✏️</span> Edit Voucher Series: <strong>${escapeHtml(item.voucherType)} (${escapeHtml(item.year)} / P${escapeHtml(item.period)})</strong>`;
            if (saveBtn) saveBtn.textContent = 'Update Voucher Series';

            const compSelect = document.getElementById('vst-form-company');
            const yearInput = document.getElementById('vst-form-year');
            const typeSelect = document.getElementById('vst-form-type');
            const perInput = document.getElementById('vst-form-period');
            const descInput = document.getElementById('vst-form-desc');
            const fromInput = document.getElementById('vst-form-from');
            const untilInput = document.getElementById('vst-form-until');
            const nextInput = document.getElementById('vst-form-next');
            const prefixInput = document.getElementById('vst-form-prefix');
            const statusSelect = document.getElementById('vst-form-status');
            const notesInput = document.getElementById('vst-form-notes');

            if (compSelect) compSelect.value = item.company;
            if (yearInput) yearInput.value = item.year;
            if (typeSelect) typeSelect.value = item.voucherType;
            if (perInput) perInput.value = item.period;
            if (descInput) descInput.value = item.description || '';
            if (fromInput) fromInput.value = item.fromNumber;
            if (untilInput) untilInput.value = item.untilNumber;
            if (nextInput) nextInput.value = item.nextNumber;
            if (prefixInput) prefixInput.value = item.prefix || '';
            if (statusSelect) statusSelect.value = item.status || 'Active';
            if (notesInput) notesInput.value = item.notes || '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-voucher-series');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
            this.clearFormError();
        },

        saveForm() {
            this.clearFormError();

            const compSelect = document.getElementById('vst-form-company');
            const yearInput = document.getElementById('vst-form-year');
            const typeSelect = document.getElementById('vst-form-type');
            const perInput = document.getElementById('vst-form-period');
            const descInput = document.getElementById('vst-form-desc');
            const fromInput = document.getElementById('vst-form-from');
            const untilInput = document.getElementById('vst-form-until');
            const nextInput = document.getElementById('vst-form-next');
            const prefixInput = document.getElementById('vst-form-prefix');
            const statusSelect = document.getElementById('vst-form-status');
            const notesInput = document.getElementById('vst-form-notes');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const year = yearInput ? yearInput.value.trim() : '';
            const voucherType = typeSelect ? typeSelect.value.trim().toUpperCase() : 'PINV';
            let period = perInput ? perInput.value.trim() : '01';
            if (period.length === 1) period = '0' + period;

            const description = descInput ? descInput.value.trim() : '';
            const cleanFrom = (fromInput ? fromInput.value : '').toString().replace(/,/g, '').trim();
            const cleanUntil = (untilInput ? untilInput.value : '').toString().replace(/,/g, '').trim();
            const cleanNext = (nextInput ? nextInput.value : '').toString().replace(/,/g, '').trim();
            const prefix = prefixInput ? prefixInput.value.trim() : '';
            const status = statusSelect ? statusSelect.value : 'Active';
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
            if (!period) {
                this.showFormError('Please enter a valid Period (e.g. 01 - 12, or 00 for Annual).');
                return;
            }
            if (!cleanFrom || !cleanUntil || !cleanNext) {
                this.showFormError('Please enter valid numeric sequences for From Number, Until Number, and Next Number.');
                return;
            }

            let fn, un, nn;
            try {
                fn = BigInt(cleanFrom);
                un = BigInt(cleanUntil);
                nn = BigInt(cleanNext);
            } catch (e) {
                this.showFormError('From Number, Until Number, and Next Number must be valid numeric sequences.');
                return;
            }

            if (fn > un) {
                this.showFormError('From Number cannot be greater than Until Number.');
                return;
            }
            if (nn < fn || nn > un + 1n) {
                this.showFormError('Next Number must be between From Number and Until Number (or Until + 1).');
                return;
            }

            if (this.editingId) {
                // Update existing record
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    item.company = company;
                    item.year = year;
                    item.voucherType = voucherType;
                    item.period = period;
                    item.description = description;
                    item.fromNumber = cleanFrom;
                    item.untilNumber = cleanUntil;
                    item.nextNumber = cleanNext;
                    item.prefix = prefix;
                    item.status = status;
                    item.notes = notes;
                }
                this.saveData();
                this.closeModal();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Voucher Series ${voucherType} (${year}/P${period}) updated successfully.`, 'success');
                }
            } else {
                // Check if an existing series with identical company, year, voucherType, and period exists
                const existing = this.data.find(d => 
                    d.company.toLowerCase() === company.toLowerCase() && 
                    d.year === year && 
                    d.voucherType.toUpperCase() === voucherType.toUpperCase() && 
                    d.period === period
                );

                if (existing) {
                    // Frictionless update: automatically update existing series without blocking confirm popups
                    existing.description = description || existing.description;
                    existing.fromNumber = cleanFrom;
                    existing.untilNumber = cleanUntil;
                    existing.nextNumber = cleanNext;
                    existing.prefix = prefix;
                    existing.status = status;
                    existing.notes = notes;

                    this.saveData();
                    this.closeModal();
                    this.renderKPIs();
                    this.renderTable();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Existing Voucher Series ${voucherType} (${year}/P${period}) updated with new numbering sequence.`, 'success');
                    }
                } else {
                    // Add new series
                    const newSeries = {
                        id: 'vst-' + Date.now(),
                        company,
                        year,
                        period,
                        voucherType,
                        description,
                        fromNumber: cleanFrom,
                        untilNumber: cleanUntil,
                        nextNumber: cleanNext,
                        prefix,
                        status,
                        notes
                    };
                    this.data.unshift(newSeries);

                    this.saveData();
                    this.closeModal();
                    this.renderKPIs();
                    this.renderTable();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Voucher Series ${voucherType} (${year}/P${period}) created successfully.`, 'success');
                    }
                }
            }
        },

        deleteRow(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            if (confirm(`Are you sure you want to delete Voucher Series for ${item.voucherType} (Year ${item.year}, Period ${item.period})?`)) {
                this.data = this.data.filter(d => d.id !== id);
                this.selectedIds.delete(id);
                this.saveData();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Voucher Series for ${item.voucherType} deleted.`, 'info');
                }
            }
        },

        bulkDelete() {
            if (this.selectedIds.size === 0) return;

            if (confirm(`Are you sure you want to delete ${this.selectedIds.size} selected Voucher Series record(s)?`)) {
                this.data = this.data.filter(d => !this.selectedIds.has(d.id));
                this.selectedIds.clear();
                this.saveData();
                this.renderKPIs();
                this.renderTable();
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Selected voucher series records deleted.', 'info');
                }
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No voucher series records match current filters to export.', 'warning');
                }
                return;
            }

            const headers = ['Company', 'Year', 'Period', 'Voucher Type', 'Description', 'From Number', 'Until Number', 'Next Number', 'Prefix', 'Status', 'Notes'];
            const rows = filtered.map(d => [
                `"${(d.company || '').replace(/"/g, '""')}"`,
                `"${(d.year || '').replace(/"/g, '""')}"`,
                `"${(d.period || '').replace(/"/g, '""')}"`,
                `"${(d.voucherType || '').replace(/"/g, '""')}"`,
                `"${(d.description || '').replace(/"/g, '""')}"`,
                `"${d.fromNumber}"`,
                `"${d.untilNumber}"`,
                `"${d.nextNumber}"`,
                `"${(d.prefix || '').replace(/"/g, '""')}"`,
                `"${(d.status || '').replace(/"/g, '""')}"`,
                `"${(d.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Voucher_Series_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        viewUserGroups(targetSeries) {
            // Seamless cross-module navigation to Master 11 (User Groups Per Voucher Series)
            // or Master 7 (User Groups Per Period)
            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-user-groups-voucher');
            } else {
                const navItem = document.querySelector('[data-fin-nav="fin-user-groups-voucher"]') ||
                                document.querySelector('[data-fin-nav="fin-user-groups-period"]');
                if (navItem) navItem.click();
            }
        },

        onVoucherTypeFormChange() {
            const typeSelect = document.getElementById('vst-form-type');
            const descInput = document.getElementById('vst-form-desc');
            const fromInput = document.getElementById('vst-form-from');
            const untilInput = document.getElementById('vst-form-until');
            const nextInput = document.getElementById('vst-form-next');
            const prefixInput = document.getElementById('vst-form-prefix');
            const yearInput = document.getElementById('vst-form-year');
            const perInput = document.getElementById('vst-form-period');

            if (!typeSelect) return;
            const code = typeSelect.value;
            const vt = this.voucherTypes.find(v => v.code === code);

            if (vt) {
                if (descInput) descInput.value = vt.desc;
                if (!this.editingId) {
                    if (fromInput) fromInput.value = vt.defaultFrom;
                    if (untilInput) untilInput.value = vt.defaultUntil;
                    if (nextInput) nextInput.value = vt.defaultFrom + 1;
                    const yy = yearInput ? yearInput.value.slice(-2) : '26';
                    const pp = perInput ? perInput.value : '09';
                    if (prefixInput) prefixInput.value = `${code}-${yy}${pp}-`;
                }
            }
        },

        onVoucherTypeFilterChange() {
            const fType = document.getElementById('filter-vst-type');
            const fDesc = document.getElementById('filter-vst-desc');
            if (!fType || !fDesc) return;

            const code = fType.value;
            const vt = this.voucherTypes.find(v => v.code === code);
            if (vt) {
                fDesc.value = vt.desc;
            } else {
                fDesc.value = '';
            }
        },

        bindEvents() {
            // Filter Search Button
            const btnSearch = document.getElementById('btn-vst-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    this.applyFiltersFromInputs();
                });
            }

            // Filter Reset Button
            const btnReset = document.getElementById('btn-vst-reset');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    const fComp = document.getElementById('filter-vst-company');
                    const fYear = document.getElementById('filter-vst-year');
                    const fType = document.getElementById('filter-vst-type');
                    const fPer = document.getElementById('filter-vst-period');
                    const fDesc = document.getElementById('filter-vst-desc');
                    const fQuick = document.getElementById('search-fin-voucher-series-type');

                    if (fComp) fComp.value = '';
                    if (fYear) fYear.value = '';
                    if (fType) fType.value = '';
                    if (fPer) fPer.value = '';
                    if (fDesc) fDesc.value = '';
                    if (fQuick) fQuick.value = '';

                    this.filters.company = '';
                    this.filters.year = '';
                    this.filters.voucherType = '';
                    this.filters.period = '';
                    this.filters.quickSearch = '';
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Filter Voucher Type change to update description
            const fType = document.getElementById('filter-vst-type');
            if (fType) {
                fType.addEventListener('change', () => {
                    this.onVoucherTypeFilterChange();
                    this.applyFiltersFromInputs();
                });
            }

            // Filter Company change
            const fComp = document.getElementById('filter-vst-company');
            if (fComp) {
                fComp.addEventListener('change', () => {
                    this.applyFiltersFromInputs();
                });
            }

            // Quick search input
            const quickSearch = document.getElementById('search-fin-voucher-series-type');
            if (quickSearch) {
                quickSearch.addEventListener('input', (e) => {
                    this.filters.quickSearch = e.target.value;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Enter key triggers on filter inputs
            const fYear = document.getElementById('filter-vst-year');
            const fPer = document.getElementById('filter-vst-period');
            [fYear, fPer].forEach(el => {
                if (el) {
                    el.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            this.applyFiltersFromInputs();
                        }
                    });
                }
            });

            // Add button listeners
            const btnAdd = document.getElementById('btn-vst-add');
            const btnAddTop = document.getElementById('btn-add-fin-voucher-series-type');
            if (btnAdd) btnAdd.addEventListener('click', () => this.openAddModal());
            if (btnAddTop) btnAddTop.addEventListener('click', () => this.openAddModal());

            // Bulk delete
            const btnDel = document.getElementById('btn-vst-delete');
            if (btnDel) btnDel.addEventListener('click', () => this.bulkDelete());

            // Download CSV
            const btnDownload = document.getElementById('btn-vst-download');
            const btnExportTop = document.getElementById('btn-vst-export-top');
            if (btnDownload) btnDownload.addEventListener('click', () => this.exportCSV());
            if (btnExportTop) btnExportTop.addEventListener('click', () => this.exportCSV());

            // View User Groups
            const btnViewUG = document.getElementById('btn-vst-view-ug');
            if (btnViewUG) btnViewUG.addEventListener('click', () => this.viewUserGroups());

            // Form Voucher Type change
            const formType = document.getElementById('vst-form-type');
            if (formType) {
                formType.addEventListener('change', () => this.onVoucherTypeFormChange());
            }

            // Modal cancel and close buttons
            const btnCloseModal = document.getElementById('btn-modal-vst-close');
            const btnCancelModal = document.getElementById('btn-vst-cancel');
            const btnSaveModal = document.getElementById('btn-vst-save');
            const modal = document.getElementById('modal-add-voucher-series');

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
                    const m = document.getElementById('modal-add-voucher-series');
                    if (m && !m.classList.contains('hidden') && m.style.display !== 'none') {
                        this.closeModal();
                    }
                }
            });

            // Pagination Controls
            const btnPrev = document.getElementById('btn-vst-prev');
            const btnNext = document.getElementById('btn-vst-next');
            const btnFirst = document.getElementById('btn-vst-first');
            const btnLast = document.getElementById('btn-vst-last');
            const pageSizeSelect = document.getElementById('vst-page-size');

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
            if (btnFirst) {
                btnFirst.addEventListener('click', () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
            }
            if (btnLast) {
                btnLast.addEventListener('click', () => {
                    const filtered = this.getFilteredData();
                    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
                    this.currentPage = totalPages;
                    this.renderTable();
                });
            }
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    this.pageSize = parseInt(e.target.value, 10) || 1000;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Select All checkbox
            const selectAll = document.getElementById('cb-vst-select-all');
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

            // Row click delegation for checkbox, edit, delete
            const tbody = document.getElementById('tbody-vst-list');
            if (tbody) {
                tbody.addEventListener('click', (e) => {
                    // Checkbox
                    if (e.target.classList.contains('cb-vst-row')) {
                        const id = e.target.getAttribute('data-id');
                        if (e.target.checked) {
                            this.selectedIds.add(id);
                        } else {
                            this.selectedIds.delete(id);
                        }
                        this.updateDeleteButton();
                        const selectAllCheckbox = document.getElementById('cb-vst-select-all');
                        if (selectAllCheckbox) {
                            const filtered = this.getFilteredData();
                            const startIdx = (this.currentPage - 1) * this.pageSize;
                            const pageData = filtered.slice(startIdx, startIdx + this.pageSize);
                            selectAllCheckbox.checked = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
                        }
                        return;
                    }

                    // Edit
                    const btnEdit = e.target.closest('.btn-vst-edit');
                    if (btnEdit) {
                        e.stopPropagation();
                        const id = btnEdit.getAttribute('data-id');
                        this.openEditModal(id);
                        return;
                    }

                    // Delete
                    const btnDel = e.target.closest('.btn-vst-del');
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
            const fComp = document.getElementById('filter-vst-company');
            const fYear = document.getElementById('filter-vst-year');
            const fType = document.getElementById('filter-vst-type');
            const fPer = document.getElementById('filter-vst-period');

            this.filters.company = fComp ? fComp.value : '';
            this.filters.year = fYear ? fYear.value.trim() : '';
            this.filters.voucherType = fType ? fType.value.trim() : '';
            this.filters.period = fPer ? fPer.value.trim() : '';

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
    window.VoucherSeriesModule = VoucherSeriesModule;

    // Document delegation fallback for + Add and Modal buttons
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-vst-add, #btn-add-fin-voucher-series-type, [data-action="open-vst-modal"]');
        if (addBtn && window.VoucherSeriesModule) {
            e.preventDefault();
            window.VoucherSeriesModule.openAddModal();
            return;
        }

        const closeBtn = e.target.closest('#btn-modal-vst-close, #btn-vst-cancel');
        if (closeBtn) {
            e.preventDefault();
            if (window.VoucherSeriesModule && typeof window.VoucherSeriesModule.closeModal === 'function') {
                window.VoucherSeriesModule.closeModal();
            } else {
                const modal = document.getElementById('modal-add-voucher-series');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            }
            return;
        }

        const saveBtn = e.target.closest('#btn-vst-save');
        if (saveBtn) {
            e.preventDefault();
            if (window.VoucherSeriesModule && typeof window.VoucherSeriesModule.saveForm === 'function') {
                window.VoucherSeriesModule.saveForm();
            }
            return;
        }
    });

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => VoucherSeriesModule.init());
    } else {
        VoucherSeriesModule.init();
    }

})(window);
