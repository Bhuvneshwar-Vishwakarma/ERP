/**
 * tax_proposal_details_module.js
 * 
 * Modern ERP Design for Tax Proposal Details Master (ERP-FIN-MAS-013):
 * - Fields from user legacy screenshot:
 *   - Filters: Company (active enabled select), Creation Date, Proposal ID, User ID, Description, Proposal Status, Search Button (magnifying glass)
 *   - Table Columns:
 *     - Tax ID No, Voucher No, Voucher Type, Voucher Date, Acc Year, Acc Period, Account,
 *     - Tax Code, Tax %, Tax Type, Tax Direction, Tax Method, Identity, Name, Party Type,
 *     - Delivery Address, Tax Base Amount, Tax Amount, Actions
 *   - Bottom Toolbar: + Add, Delete, Download (Export CSV matching screenshot specs), Pagination (Page X of Y, rows dropdown e.g. 1000)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Tax Lines, Gross Tax Base, Total Tax Amount, Proposal Status)
 *   - Clean cards, modern typography, color-coded badges, and responsive tables
 *   - Active Company dropdown filter and form inputs (strictly enabled)
 *   - Triple-layer resilient Add/Edit modal opening and button handlers (inline onclick, module listener, document delegation)
 *   - Edit & Delete per row, bulk delete, multi-criteria search and filter
 *   - Full CSV export matching screenshot specs
 *   - LocalStorage persistence with realistic seed data for Laxmico Ltd, B&S International, and B&S UK Trading
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_TAX_PROPOSAL_DETAILS_V1';

    const TAX_CODES = [
        { code: 'VAT20', rate: 20.0, desc: 'UK Standard VAT Rate', type: 'VAT' },
        { code: 'VAT05', rate: 5.0, desc: 'UK Reduced VAT Rate', type: 'VAT' },
        { code: 'VAT00', rate: 0.0, desc: 'UK Zero-Rated Exports & Basic Foods', type: 'Zero' },
        { code: 'EXEMPT', rate: 0.0, desc: 'Exempt Financial & Medical Services', type: 'Exempt' },
        { code: 'RC20', rate: 20.0, desc: 'Reverse Charge Import Services', type: 'Reverse Charge' }
    ];

    const SEED_DATA = [
        {
            id: 'tpd-001',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2601-001',
            voucherNo: '26001042',
            voucherType: 'SINV',
            voucherDate: '2026-01-14',
            accYear: '2026',
            accPeriod: '01',
            account: '3010',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Output Tax',
            taxMethod: 'Invoice',
            identity: 'CUST-10024',
            name: 'Apex Global Distribution Ltd',
            partyType: 'Customer',
            deliveryAddress: 'Unit 4, Gateway Industrial Estate, Birmingham B11 2AZ',
            taxBaseAmount: 45000.00,
            taxAmount: 9000.00,
            notes: 'Commercial trade sales standard UK delivery'
        },
        {
            id: 'tpd-002',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2601-002',
            voucherNo: '26001089',
            voucherType: 'PINV',
            voucherDate: '2026-01-19',
            accYear: '2026',
            accPeriod: '01',
            account: '2110',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Input Tax',
            taxMethod: 'Invoice',
            identity: 'SUPP-30018',
            name: 'Midland Industrial Supplies Plc',
            partyType: 'Supplier',
            deliveryAddress: 'Tyseley Works, Wharf Road, Birmingham B11 2FE',
            taxBaseAmount: 32000.00,
            taxAmount: 6400.00,
            notes: 'Raw material procurement input tax recovery'
        },
        {
            id: 'tpd-003',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2602-003',
            voucherNo: '26002015',
            voucherType: 'SINV',
            voucherDate: '2026-02-08',
            accYear: '2026',
            accPeriod: '02',
            account: '3010',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Output Tax',
            taxMethod: 'Invoice',
            identity: 'CUST-10088',
            name: 'Sterling Retail Enterprises Ltd',
            partyType: 'Customer',
            deliveryAddress: 'High Street Commercial Center, Manchester M1 4BT',
            taxBaseAmount: 68500.00,
            taxAmount: 13700.00,
            notes: 'Bulk retail finished goods dispatch'
        },
        {
            id: 'tpd-004',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2602-004',
            voucherNo: '26002077',
            voucherType: 'PINV',
            voucherDate: '2026-02-22',
            accYear: '2026',
            accPeriod: '02',
            account: '2110',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Input Tax',
            taxMethod: 'Invoice',
            identity: 'SUPP-30045',
            name: 'Precision Engineering Tools Co',
            partyType: 'Supplier',
            deliveryAddress: 'Parkside Industrial Park, Coventry CV3 4PW',
            taxBaseAmount: 18400.00,
            taxAmount: 3680.00,
            notes: 'Machining spare components'
        },
        {
            id: 'tpd-005',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2603-005',
            voucherNo: '26003012',
            voucherType: 'SINV',
            voucherDate: '2026-03-05',
            accYear: '2026',
            accPeriod: '03',
            account: '3020',
            taxCode: 'VAT00',
            taxRate: 0.0,
            taxType: 'Zero Rate',
            taxDirection: 'Output Tax',
            taxMethod: 'Invoice',
            identity: 'CUST-10095',
            name: 'Nordic Trans-Baltic Logistics AS',
            partyType: 'Customer',
            deliveryAddress: 'Freeport Logistics Hub, Oslo Port 0150, Norway',
            taxBaseAmount: 85000.00,
            taxAmount: 0.00,
            notes: 'Direct export to non-UK European territory'
        },
        {
            id: 'tpd-006',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            proposalStatus: 'Acknowledged',
            taxIdNo: 'TX-2603-006',
            voucherNo: '26003098',
            voucherType: 'PINV',
            voucherDate: '2026-03-24',
            accYear: '2026',
            accPeriod: '03',
            account: '2110',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Input Tax',
            taxMethod: 'Invoice',
            identity: 'SUPP-30062',
            name: 'Crest Freight & Logistics Ltd',
            partyType: 'Supplier',
            deliveryAddress: 'Docklands Container Freight Station, Felixstowe IP11 3SY',
            taxBaseAmount: 14200.00,
            taxAmount: 2840.00,
            notes: 'Domestic freight shipping services'
        },
        {
            id: 'tpd-007',
            company: 'B&S International',
            proposalId: 'TAX-2026-INTL-Q1',
            creationDate: '2026-03-31',
            userId: 'BSI-CONTROLLER',
            description: 'International Export VAT Settlement',
            proposalStatus: 'Created',
            taxIdNo: 'TX-BSI-001',
            voucherNo: '88001014',
            voucherType: 'SINV',
            voucherDate: '2026-02-15',
            accYear: '2026',
            accPeriod: '02',
            account: '3100',
            taxCode: 'VAT00',
            taxRate: 0.0,
            taxType: 'Zero Rate',
            taxDirection: 'Output Tax',
            taxMethod: 'Invoice',
            identity: 'CUST-20015',
            name: 'Euro-Asian Trading AG',
            partyType: 'Customer',
            deliveryAddress: 'Industriestrasse 44, Zurich 8005, Switzerland',
            taxBaseAmount: 120000.00,
            taxAmount: 0.00,
            notes: 'Overseas wholesale trade dispatch'
        },
        {
            id: 'tpd-008',
            company: 'B&S UK Trading',
            proposalId: 'TAX-2026-UKT-M02',
            creationDate: '2026-02-28',
            userId: 'UKT-ACCOUNTANT',
            description: 'February Monthly VAT Settlement',
            proposalStatus: 'Settled',
            taxIdNo: 'TX-UKT-001',
            voucherNo: '77001045',
            voucherType: 'SINV',
            voucherDate: '2026-02-18',
            accYear: '2026',
            accPeriod: '02',
            account: '3020',
            taxCode: 'VAT20',
            taxRate: 20.0,
            taxType: 'Standard VAT',
            taxDirection: 'Output Tax',
            taxMethod: 'Invoice',
            identity: 'CUST-30040',
            name: 'Vanguard Retail Wholesale Ltd',
            partyType: 'Customer',
            deliveryAddress: 'Leeds Logistics Park, Leeds LS10 1RW',
            taxBaseAmount: 52000.00,
            taxAmount: 10400.00,
            notes: 'UK Trading wholesale distribution invoice'
        }
    ];

    const TaxProposalDetailsModule = {
        data: [],
        taxCodes: TAX_CODES,
        selectedIds: [],
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            creationDate: '',
            proposalId: '',
            userId: '',
            description: '',
            proposalStatus: '',
            search: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('TaxProposalDetailsModule initialized successfully.');
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
                console.warn('[TaxProposalDetails] Error loading localStorage:', err);
            }
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.saveData();
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.warn('[TaxProposalDetails] Error saving localStorage:', err);
            }
        },

        getFilteredData() {
            let list = [...this.data];

            const c = (this.filters.company || '').trim().toLowerCase();
            const cd = (this.filters.creationDate || '').trim();
            const pid = (this.filters.proposalId || '').trim().toLowerCase();
            const uid = (this.filters.userId || '').trim().toLowerCase();
            const desc = (this.filters.description || '').trim().toLowerCase();
            const status = (this.filters.proposalStatus || '').trim().toLowerCase();
            const q = (this.filters.search || '').trim().toLowerCase();

            if (c && c !== 'all') {
                list = list.filter(item => (item.company || '').toLowerCase().includes(c));
            }
            if (cd) {
                list = list.filter(item => (item.creationDate || '').startsWith(cd));
            }
            if (pid) {
                list = list.filter(item => (item.proposalId || '').toLowerCase().includes(pid));
            }
            if (uid) {
                list = list.filter(item => (item.userId || '').toLowerCase().includes(uid));
            }
            if (desc) {
                list = list.filter(item => (item.description || '').toLowerCase().includes(desc));
            }
            if (status && status !== 'all') {
                list = list.filter(item => (item.proposalStatus || '').toLowerCase().includes(status));
            }
            if (q) {
                list = list.filter(item => {
                    const haystack = `${item.company} ${item.proposalId} ${item.taxIdNo} ${item.voucherNo} ${item.voucherType} ${item.account} ${item.taxCode} ${item.taxDirection} ${item.identity} ${item.name} ${item.partyType} ${item.deliveryAddress} ${item.notes || ''}`.toLowerCase();
                    return haystack.includes(q);
                });
            }

            return list;
        },

        renderKPIs() {
            const filtered = this.getFilteredData();
            const totalLines = filtered.length;
            const grossBase = filtered.reduce((acc, d) => acc + (parseFloat(d.taxBaseAmount) || 0), 0);
            const totalTax = filtered.reduce((acc, d) => acc + (parseFloat(d.taxAmount) || 0), 0);
            const activeStatus = filtered[0] ? filtered[0].proposalStatus : 'Acknowledged';

            const elTotal = document.getElementById('tpd-kpi-total');
            const elBase = document.getElementById('tpd-kpi-base');
            const elTax = document.getElementById('tpd-kpi-tax');
            const elStatus = document.getElementById('tpd-kpi-status');

            if (elTotal) elTotal.textContent = `${totalLines} Lines`;
            if (elBase) elBase.textContent = `£${grossBase.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (elTax) elTax.textContent = `£${totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (elStatus) elStatus.textContent = activeStatus;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-tpd-list');
            if (!tbody) return;

            const filtered = this.getFilteredData();
            const total = filtered.length;
            const totalPages = Math.ceil(total / this.pageSize) || 1;
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            const startIdx = (this.currentPage - 1) * this.pageSize;
            const paginated = filtered.slice(startIdx, startIdx + this.pageSize);

            const countBadge = document.getElementById('tpd-total-count');
            if (countBadge) {
                countBadge.textContent = `${total} Records`;
            }

            const pageInfo = document.getElementById('tpd-page-info');
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${total} total records)`;
            }

            const pageInput = document.getElementById('tpd-page-input');
            if (pageInput) {
                pageInput.value = this.currentPage;
            }

            if (paginated.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="19" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                            <div style="font-size: 38px; margin-bottom: 8px;">📑</div>
                            <div style="font-size: 14px; font-weight: 600; color: #334155;">No Tax Proposal Lines Found</div>
                            <div style="font-size: 12px; margin-top: 4px;">Modify your search criteria or click "Clear Filters"</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const formatCurrency = (val) => (parseFloat(val) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            tbody.innerHTML = paginated.map(item => {
                const isSelected = this.selectedIds.includes(item.id);
                const isCustomer = item.partyType === 'Customer';
                const isOutput = item.taxDirection === 'Output Tax';

                return `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${isSelected ? 'background-color: #eff6ff;' : ''}" class="hover-row">
                        <td style="text-align: center; padding: 8px 6px;">
                            <input type="checkbox" class="cb-tpd-row" data-id="${escapeHtml(item.id)}" ${isSelected ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; color: #1e293b;">
                            ${escapeHtml(item.taxIdNo)}
                        </td>
                        <td style="padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 600; color: #2563eb;">
                            ${escapeHtml(item.voucherNo)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 11px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">
                                ${escapeHtml(item.voucherType)}
                            </span>
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; color: #64748b;">
                            ${escapeHtml(item.voucherDate)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; text-align: center;">
                            ${escapeHtml(item.accYear)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; text-align: center;">
                            ${escapeHtml(item.accPeriod)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #475569;">
                            ${escapeHtml(item.account)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                                ${escapeHtml(item.taxCode)}
                            </span>
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; text-align: right; font-weight: 600;">
                            ${Number(item.taxRate).toFixed(1)}%
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; color: #475569;">
                            ${escapeHtml(item.taxType)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: ${isOutput ? '#047857' : '#b45309'}; background: ${isOutput ? '#ecfdf5' : '#fffbeb'}; border: 1px solid ${isOutput ? '#a7f3d0' : '#fde68a'};">
                                ${escapeHtml(item.taxDirection)}
                            </span>
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; color: #64748b;">
                            ${escapeHtml(item.taxMethod)}
                        </td>
                        <td style="padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #334155;">
                            ${escapeHtml(item.identity)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11.5px; font-weight: 600; color: #1e293b; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.name)}">
                            ${escapeHtml(item.name)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 11px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: ${isCustomer ? '#2563eb' : '#d97706'}; background: ${isCustomer ? '#eff6ff' : '#fffbeb'}; border: 1px solid ${isCustomer ? '#bfdbfe' : '#fde68a'};">
                                ${escapeHtml(item.partyType)}
                            </span>
                        </td>
                        <td style="padding: 8px 10px; font-size: 11px; color: #64748b; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.deliveryAddress)}">
                            ${escapeHtml(item.deliveryAddress)}
                        </td>
                        <td style="padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; text-align: right; font-weight: 600; color: #0f172a;">
                            £${formatCurrency(item.taxBaseAmount)}
                        </td>
                        <td style="padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; text-align: right; font-weight: 700; color: #059669;">
                            £${formatCurrency(item.taxAmount)}
                        </td>
                        <td style="padding: 8px 10px; text-align: right; white-space: nowrap;">
                            <button type="button" class="btn-tpd-edit btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 24px; padding: 0 6px; font-size: 11px; margin-right: 4px;" title="Edit Line">
                                ✏️
                            </button>
                            <button type="button" class="btn-tpd-delete-row btn btn-secondary" data-id="${escapeHtml(item.id)}" style="height: 24px; padding: 0 6px; font-size: 11px; color: #ef4444;" title="Delete Line">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind checkboxes
            const rowCheckboxes = tbody.querySelectorAll('.cb-tpd-row');
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
                    if (tr) tr.style.backgroundColor = e.target.checked ? '#eff6ff' : '';
                });
            });

            // Bind action buttons
            tbody.querySelectorAll('.btn-tpd-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.openEditModal(id);
                });
            });

            tbody.querySelectorAll('.btn-tpd-delete-row').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.deleteRow(id);
                });
            });

            // Update master select-all
            const selectAllCb = document.getElementById('cb-tpd-select-all');
            if (selectAllCb) {
                const allSelected = paginated.length > 0 && paginated.every(p => this.selectedIds.includes(p.id));
                selectAllCb.checked = allSelected;
            }

            this.updateDeleteButton();
        },

        updateDeleteButton() {
            const delBtn = document.getElementById('btn-tpd-delete');
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
            const alertBox = document.getElementById('tpd-form-alert');
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
            const alertBox = document.getElementById('tpd-form-alert');
            if (alertBox) {
                alertBox.textContent = '';
                alertBox.style.display = 'none';
            }
        },

        openAddModal() {
            this.editingId = null;
            this.clearFormError();
            const modal = document.getElementById('modal-add-tax-proposal-details');
            const title = document.getElementById('modal-tpd-title');
            const saveBtn = document.getElementById('btn-tpd-save');

            if (title) title.innerHTML = '<span>📑</span> Add Tax Proposal Detail Line';
            if (saveBtn) saveBtn.textContent = 'Save Tax Line';

            const fComp = document.getElementById('filter-tpd-company');
            const fPid = document.getElementById('filter-tpd-proposal-id');

            const compSelect = document.getElementById('tpd-form-company');
            const pidInput = document.getElementById('tpd-form-proposal-id');
            const vNoInput = document.getElementById('tpd-form-voucher-no');
            const vTypeSelect = document.getElementById('tpd-form-voucher-type');
            const vDateInput = document.getElementById('tpd-form-voucher-date');
            const accInput = document.getElementById('tpd-form-account');
            const tcSelect = document.getElementById('tpd-form-tax-code');
            const baseInput = document.getElementById('tpd-form-tax-base');
            const identInput = document.getElementById('tpd-form-identity');
            const nameInput = document.getElementById('tpd-form-name');
            const partySelect = document.getElementById('tpd-form-party-type');
            const addrInput = document.getElementById('tpd-form-address');

            if (compSelect) compSelect.value = (fComp && fComp.value && fComp.value !== 'all') ? fComp.value : 'Laxmico Ltd';
            if (pidInput) pidInput.value = (fPid && fPid.value) ? fPid.value : 'TAX-2026-Q1';
            if (vNoInput) vNoInput.value = `2600${Math.floor(1000 + Math.random() * 9000)}`;
            if (vTypeSelect) vTypeSelect.value = 'SINV';
            if (vDateInput) vDateInput.value = new Date().toISOString().slice(0, 10);
            if (accInput) accInput.value = '3010';
            if (tcSelect) tcSelect.value = 'VAT20';
            if (baseInput) baseInput.value = '10000.00';
            if (identInput) identInput.value = 'CUST-10024';
            if (nameInput) nameInput.value = 'Apex Global Distribution Ltd';
            if (partySelect) partySelect.value = 'Customer';
            if (addrInput) addrInput.value = 'Birmingham, West Midlands';

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
            const modal = document.getElementById('modal-add-tax-proposal-details');
            const title = document.getElementById('modal-tpd-title');
            const saveBtn = document.getElementById('btn-tpd-save');

            const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            if (title) title.innerHTML = `<span>✏️</span> Edit Tax Line: <strong>${escapeHtml(item.taxIdNo)} (${escapeHtml(item.voucherNo)})</strong>`;
            if (saveBtn) saveBtn.textContent = 'Update Tax Line';

            const compSelect = document.getElementById('tpd-form-company');
            const pidInput = document.getElementById('tpd-form-proposal-id');
            const vNoInput = document.getElementById('tpd-form-voucher-no');
            const vTypeSelect = document.getElementById('tpd-form-voucher-type');
            const vDateInput = document.getElementById('tpd-form-voucher-date');
            const accInput = document.getElementById('tpd-form-account');
            const tcSelect = document.getElementById('tpd-form-tax-code');
            const baseInput = document.getElementById('tpd-form-tax-base');
            const identInput = document.getElementById('tpd-form-identity');
            const nameInput = document.getElementById('tpd-form-name');
            const partySelect = document.getElementById('tpd-form-party-type');
            const addrInput = document.getElementById('tpd-form-address');

            if (compSelect) compSelect.value = item.company || 'Laxmico Ltd';
            if (pidInput) pidInput.value = item.proposalId || 'TAX-2026-Q1';
            if (vNoInput) vNoInput.value = item.voucherNo || '';
            if (vTypeSelect) vTypeSelect.value = item.voucherType || 'SINV';
            if (vDateInput) vDateInput.value = item.voucherDate || '';
            if (accInput) accInput.value = item.account || '3010';
            if (tcSelect) tcSelect.value = item.taxCode || 'VAT20';
            if (baseInput) baseInput.value = String(item.taxBaseAmount || 0);
            if (identInput) identInput.value = item.identity || '';
            if (nameInput) nameInput.value = item.name || '';
            if (partySelect) partySelect.value = item.partyType || 'Customer';
            if (addrInput) addrInput.value = item.deliveryAddress || '';

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            const modal = document.getElementById('modal-add-tax-proposal-details');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingId = null;
            this.clearFormError();
        },

        saveForm() {
            this.clearFormError();

            const compSelect = document.getElementById('tpd-form-company');
            const pidInput = document.getElementById('tpd-form-proposal-id');
            const vNoInput = document.getElementById('tpd-form-voucher-no');
            const vTypeSelect = document.getElementById('tpd-form-voucher-type');
            const vDateInput = document.getElementById('tpd-form-voucher-date');
            const accInput = document.getElementById('tpd-form-account');
            const tcSelect = document.getElementById('tpd-form-tax-code');
            const baseInput = document.getElementById('tpd-form-tax-base');
            const identInput = document.getElementById('tpd-form-identity');
            const nameInput = document.getElementById('tpd-form-name');
            const partySelect = document.getElementById('tpd-form-party-type');
            const addrInput = document.getElementById('tpd-form-address');

            const company = compSelect ? compSelect.value.trim() : 'Laxmico Ltd';
            const proposalId = pidInput ? pidInput.value.trim() : 'TAX-2026-Q1';
            const voucherNo = vNoInput ? vNoInput.value.trim() : '';
            const voucherType = vTypeSelect ? vTypeSelect.value : 'SINV';
            const voucherDate = vDateInput ? vDateInput.value : new Date().toISOString().slice(0, 10);
            const account = accInput ? accInput.value.trim() : '3010';
            const taxCode = tcSelect ? tcSelect.value : 'VAT20';
            const taxBaseAmount = parseFloat(baseInput ? baseInput.value : 0) || 0;
            const identity = identInput ? identInput.value.trim() : 'CUST-001';
            const name = nameInput ? nameInput.value.trim() : 'Commercial Trade Client';
            const partyType = partySelect ? partySelect.value : 'Customer';
            const deliveryAddress = addrInput ? addrInput.value.trim() : 'United Kingdom';

            if (!company) {
                this.showFormError('Company is required.');
                return;
            }
            if (!voucherNo) {
                this.showFormError('Voucher Number is required.');
                return;
            }
            if (taxBaseAmount <= 0) {
                this.showFormError('Tax Base Amount must be greater than zero.');
                return;
            }

            const tcMeta = TAX_CODES.find(t => t.code === taxCode) || { rate: 20.0, desc: 'VAT 20%' };
            const taxRate = tcMeta.rate;
            const taxAmount = parseFloat(((taxBaseAmount * taxRate) / 100).toFixed(2));
            const taxDirection = partyType === 'Customer' ? 'Output Tax' : 'Input Tax';
            const yearStr = voucherDate.slice(0, 4);
            const periodStr = voucherDate.slice(5, 7);

            if (this.editingId) {
                const idx = this.data.findIndex(d => d.id === this.editingId);
                if (idx !== -1) {
                    this.data[idx] = {
                        ...this.data[idx],
                        company,
                        proposalId,
                        voucherNo,
                        voucherType,
                        voucherDate,
                        accYear: yearStr,
                        accPeriod: periodStr,
                        account,
                        taxCode,
                        taxRate,
                        taxType: tcMeta.desc,
                        taxDirection,
                        identity,
                        name,
                        partyType,
                        deliveryAddress,
                        taxBaseAmount,
                        taxAmount
                    };
                }
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Updated tax line for voucher ${voucherNo}.`, 'success');
                }
            } else {
                const newId = `tpd-${String(Date.now()).slice(-6)}`;
                this.data.unshift({
                    id: newId,
                    company,
                    proposalId,
                    creationDate: new Date().toISOString().slice(0, 10),
                    userId: 'FIN-ADMIN',
                    description: `${proposalId} Tax Proposal`,
                    proposalStatus: 'Acknowledged',
                    taxIdNo: `TX-${yearStr.slice(-2)}${periodStr}-${String(Date.now()).slice(-3)}`,
                    voucherNo,
                    voucherType,
                    voucherDate,
                    accYear: yearStr,
                    accPeriod: periodStr,
                    account,
                    taxCode,
                    taxRate,
                    taxType: tcMeta.desc,
                    taxDirection,
                    taxMethod: 'Invoice',
                    identity,
                    name,
                    partyType,
                    deliveryAddress,
                    taxBaseAmount,
                    taxAmount,
                    notes: 'Manually added tax proposal ledger entry'
                });

                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Created tax line for voucher ${voucherNo}.`, 'success');
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
                window.showNotification(`Deleted tax line ${item.taxIdNo}.`, 'info');
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
                window.showNotification(`Deleted ${count} tax proposal lines.`, 'info');
            }
        },

        exportCSV() {
            const filtered = this.getFilteredData();
            if (filtered.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No tax proposal records to export.', 'warning');
                }
                return;
            }

            const headers = [
                'Company',
                'Proposal ID',
                'Tax ID No',
                'Voucher No',
                'Voucher Type',
                'Voucher Date',
                'Acc Year',
                'Acc Period',
                'Account',
                'Tax Code',
                'Tax Rate %',
                'Tax Type',
                'Tax Direction',
                'Tax Method',
                'Identity',
                'Party Name',
                'Party Type',
                'Delivery Address',
                'Tax Base Amount',
                'Tax Amount'
            ];

            const rows = filtered.map(d => [
                d.company,
                d.proposalId,
                d.taxIdNo,
                d.voucherNo,
                d.voucherType,
                d.voucherDate,
                d.accYear,
                d.accPeriod,
                d.account,
                d.taxCode,
                d.taxRate,
                d.taxType,
                d.taxDirection,
                d.taxMethod,
                d.identity,
                d.name,
                d.partyType,
                d.deliveryAddress,
                d.taxBaseAmount,
                d.taxAmount
            ]);

            const csvContent = [
                headers.map(h => `"${h}"`).join(','),
                ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tax_proposal_details_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof window.showNotification === 'function') {
                window.showNotification(`Exported ${filtered.length} tax proposal records to CSV.`, 'success');
            }
        },

        bindEvents() {
            // Filter Search button
            const btnSearch = document.getElementById('btn-tpd-filter-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => this.applyFilter());
            }

            // Filter Clear button
            const btnClear = document.getElementById('btn-tpd-filter-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => this.clearFilter());
            }

            // Filter inputs Enter key
            const filterInputs = [
                'filter-tpd-proposal-id',
                'filter-tpd-user-id',
                'filter-tpd-desc',
                'filter-tpd-search'
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

            // Filter Dropdowns
            const fComp = document.getElementById('filter-tpd-company');
            if (fComp) fComp.addEventListener('change', () => this.applyFilter());

            const fStatus = document.getElementById('filter-tpd-status');
            if (fStatus) fStatus.addEventListener('change', () => this.applyFilter());

            const fDate = document.getElementById('filter-tpd-creation-date');
            if (fDate) fDate.addEventListener('change', () => this.applyFilter());

            // Select all checkbox
            const selectAllCb = document.getElementById('cb-tpd-select-all');
            if (selectAllCb) {
                selectAllCb.addEventListener('change', (e) => {
                    this.toggleSelectAll(e.target.checked);
                });
            }

            // Top & Bottom Add buttons
            const btnAddTop = document.getElementById('btn-add-fin-tax-proposal-details');
            if (btnAddTop) {
                btnAddTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }
            const btnAddBottom = document.getElementById('btn-tpd-add');
            if (btnAddBottom) {
                btnAddBottom.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }

            // Delete button
            const btnDelete = document.getElementById('btn-tpd-delete');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.deleteSelected();
                });
            }

            // Download buttons (matches screenshot Download button)
            const btnDownload = document.getElementById('btn-tpd-download');
            if (btnDownload) {
                btnDownload.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }
            const btnExportCsv = document.getElementById('btn-tpd-export-csv');
            if (btnExportCsv) {
                btnExportCsv.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCSV();
                });
            }

            // Modal Close & Cancel
            const btnClose = document.getElementById('btn-modal-tpd-close');
            if (btnClose) btnClose.addEventListener('click', () => this.closeModal());

            const btnCancel = document.getElementById('btn-tpd-cancel');
            if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

            // Modal Save
            const btnSave = document.getElementById('btn-tpd-save');
            if (btnSave) btnSave.addEventListener('click', () => this.saveForm());

            // Pagination Controls
            const btnFirst = document.getElementById('tpd-page-first');
            if (btnFirst) btnFirst.addEventListener('click', () => { this.currentPage = 1; this.renderTable(); });

            const btnPrev = document.getElementById('tpd-page-prev');
            if (btnPrev) btnPrev.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.renderTable(); } });

            const btnNext = document.getElementById('tpd-page-next');
            if (btnNext) btnNext.addEventListener('click', () => {
                const filtered = this.getFilteredData();
                const totalPages = Math.ceil(filtered.length / this.pageSize);
                if (this.currentPage < totalPages) { this.currentPage++; this.renderTable(); }
            });

            const btnLast = document.getElementById('tpd-page-last');
            if (btnLast) btnLast.addEventListener('click', () => {
                const filtered = this.getFilteredData();
                const totalPages = Math.ceil(filtered.length / this.pageSize);
                this.currentPage = totalPages > 0 ? totalPages : 1;
                this.renderTable();
            });

            const pageInput = document.getElementById('tpd-page-input');
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

            const rowsSelect = document.getElementById('tpd-rows-select');
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
            const checkboxes = document.querySelectorAll('.cb-tpd-row');
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
            const fComp = document.getElementById('filter-tpd-company');
            const fDate = document.getElementById('filter-tpd-creation-date');
            const fPid = document.getElementById('filter-tpd-proposal-id');
            const fUid = document.getElementById('filter-tpd-user-id');
            const fDesc = document.getElementById('filter-tpd-desc');
            const fStatus = document.getElementById('filter-tpd-status');
            const fSearch = document.getElementById('filter-tpd-search');

            this.filters.company = fComp ? fComp.value : '';
            this.filters.creationDate = fDate ? fDate.value : '';
            this.filters.proposalId = fPid ? fPid.value.trim() : '';
            this.filters.userId = fUid ? fUid.value.trim() : '';
            this.filters.description = fDesc ? fDesc.value.trim() : '';
            this.filters.proposalStatus = fStatus ? fStatus.value : '';
            this.filters.search = fSearch ? fSearch.value.trim().toLowerCase() : '';

            this.currentPage = 1;
            this.renderKPIs();
            this.renderTable();
        },

        clearFilter() {
            const fComp = document.getElementById('filter-tpd-company');
            const fDate = document.getElementById('filter-tpd-creation-date');
            const fPid = document.getElementById('filter-tpd-proposal-id');
            const fUid = document.getElementById('filter-tpd-user-id');
            const fDesc = document.getElementById('filter-tpd-desc');
            const fStatus = document.getElementById('filter-tpd-status');
            const fSearch = document.getElementById('filter-tpd-search');

            if (fComp) fComp.value = 'all';
            if (fDate) fDate.value = '';
            if (fPid) fPid.value = '';
            if (fUid) fUid.value = '';
            if (fDesc) fDesc.value = '';
            if (fStatus) fStatus.value = 'all';
            if (fSearch) fSearch.value = '';

            this.filters = {
                company: '',
                creationDate: '',
                proposalId: '',
                userId: '',
                description: '',
                proposalStatus: '',
                search: ''
            };
            this.currentPage = 1;
            this.renderKPIs();
            this.renderTable();
        }
    };

    // Global document delegation for modal opening
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-tax-proposal-details, #btn-tpd-add');
        if (addBtn) {
            e.preventDefault();
            if (window.TaxProposalDetailsModule && typeof window.TaxProposalDetailsModule.openAddModal === 'function') {
                window.TaxProposalDetailsModule.openAddModal();
            } else {
                const modal = document.getElementById('modal-add-tax-proposal-details');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }
        }
    });

    window.TaxProposalDetailsModule = TaxProposalDetailsModule;

    // Auto-init on DOMContentLoaded or immediate if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TaxProposalDetailsModule.init());
    } else {
        TaxProposalDetailsModule.init();
    }

})(window);
