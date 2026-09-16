/**
 * automatic_tax_proposal_module.js
 * 
 * Modern ERP Design for Automatic Tax Proposal Header Master (ERP-FIN-MAS-014):
 * - Direct implementation of user screenshot:
 *   - Breadcrumb: Accounting Rules > Automatic Tax Proposal
 *   - Filter Bar: Company (enabled dropdown with "Select Company"), Search button (Q Search)
 *   - Collapse/Expand Header: Automatic Tax Proposal
 *   - Table Columns:
 *     - Multi-Select Checkbox
 *     - Proposal ID
 *     - Description
 *     - Creation Date
 *     - User ID
 *     - Acknowledge Date (Acknowledge Da)
 *     - Tax Report Date
 *     - Proposal State
 *     - Report No
 *     - Tax Office ID
 *     - Start Page No
 *     - Pre Payments
 *     - Error
 *     - Actions (Edit, Delete, View Details)
 *   - Bottom Toolbar:
 *     - + Add, Download, Delete, View Details
 *     - Pagination: First, Prev, Page <input> of N, Next, Last, rows-per-page (1000)
 *   - Bottom Action Buttons Bar (matching screenshot):
 *     - 👤 View Tax Amounts (opens Tax Proposal Details screen)
 *     - 🕒 Voucher Info (opens voucher audit dialog)
 *     - 🕒 Invoice Info (opens counterparty invoice dialog)
 *     - 🕒 Preliminary Report (generates official tax audit report preview)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Proposals, Acknowledged, Reported / Settled, Active Submissions)
 *   - Real-time Company filter and search
 *   - Interconnected navigation to Tax Proposal Details (ERP-FIN-MAS-013)
 *   - Triple-layer resilient buttons (type="button", module method, document delegation, inline onclick fallback)
 *   - LocalStorage persistence with realistic seed data
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_AUTOMATIC_TAX_PROPOSAL_V1';

    const SEED_DATA = [
        {
            id: 'atp-001',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-Q1',
            description: 'Q1 Statutory UK HMRC VAT Return Submission',
            creationDate: '2026-03-31',
            userId: 'FIN-ADMIN',
            acknowledgeDate: '2026-04-05',
            taxReportDate: '2026-04-07',
            proposalState: 'Acknowledged',
            reportNo: 'HMRC-VAT-2026-01',
            taxOfficeId: 'HMRC-UK',
            startPageNo: 1,
            prePayments: 0.00,
            error: 'None',
            totalTaxBase: 385100.00,
            totalTaxAmount: 46020.00,
            notes: 'Statutory Q1 submission validated against HMRC portal API.'
        },
        {
            id: 'atp-002',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-M02',
            description: 'February Monthly VAT Settlement Run',
            creationDate: '2026-02-28',
            userId: 'TAX-MGR',
            acknowledgeDate: '2026-03-05',
            taxReportDate: '2026-03-08',
            proposalState: 'Reported',
            reportNo: 'HMRC-VAT-2026-02',
            taxOfficeId: 'HMRC-UK',
            startPageNo: 1,
            prePayments: 15000.00,
            error: 'None',
            totalTaxBase: 290400.00,
            totalTaxAmount: 38250.00,
            notes: 'Monthly filing with partial pre-payment deduction.'
        },
        {
            id: 'atp-003',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2026-M01',
            description: 'January VAT Return Proposal',
            creationDate: '2026-01-31',
            userId: 'FIN-ADMIN',
            acknowledgeDate: '2026-02-05',
            taxReportDate: '2026-02-08',
            proposalState: 'Settled',
            reportNo: 'HMRC-VAT-2026-03',
            taxOfficeId: 'HMRC-UK',
            startPageNo: 1,
            prePayments: 0.00,
            error: 'None',
            totalTaxBase: 312000.00,
            totalTaxAmount: 42100.00,
            notes: 'Direct bank debit payment reconciled with HMRC.'
        },
        {
            id: 'atp-004',
            company: 'Laxmico Ltd',
            proposalId: 'TAX-2025-Q4',
            description: 'Q4 2025 Comprehensive Year-End Tax Proposal',
            creationDate: '2025-12-31',
            userId: 'FIN-DIRECTOR',
            acknowledgeDate: '2026-01-10',
            taxReportDate: '2026-01-15',
            proposalState: 'Settled',
            reportNo: 'HMRC-VAT-2025-04',
            taxOfficeId: 'HMRC-UK',
            startPageNo: 1,
            prePayments: 25000.00,
            error: 'None',
            totalTaxBase: 495000.00,
            totalTaxAmount: 64800.00,
            notes: 'Audited statutory tax return submission signed off by QA.'
        },
        {
            id: 'atp-005',
            company: 'B&S International',
            proposalId: 'TAX-2026-BNS-Q1',
            description: 'B&S International EU Cross-Border Tax Run',
            creationDate: '2026-03-31',
            userId: 'TAX-MGR',
            acknowledgeDate: '2026-04-04',
            taxReportDate: '2026-04-08',
            proposalState: 'Acknowledged',
            reportNo: 'REV-IE-2026-01',
            taxOfficeId: 'REVENUE-IE',
            startPageNo: 1,
            prePayments: 0.00,
            error: 'None',
            totalTaxBase: 198000.00,
            totalTaxAmount: 41580.00,
            notes: 'Cross-border EU reverse charge & zero-rated reconciliation.'
        },
        {
            id: 'atp-006',
            company: 'B&S UK Trading',
            proposalId: 'TAX-2026-UKT-M03',
            description: 'B&S UK Trading March Interim VAT Proposal',
            creationDate: '2026-03-15',
            userId: 'FIN-OPERATOR',
            acknowledgeDate: '',
            taxReportDate: '',
            proposalState: 'Created',
            reportNo: '',
            taxOfficeId: 'HMRC-UK',
            startPageNo: 1,
            prePayments: 0.00,
            error: 'Pending Review',
            totalTaxBase: 78500.00,
            totalTaxAmount: 15700.00,
            notes: 'Draft proposal pending tax supervisor authorization.'
        }
    ];

    const AutomaticTaxProposalModule = {
        data: [],
        selectedIds: [],
        editingId: null,
        currentPage: 1,
        pageSize: 1000,
        filters: {
            company: '',
            search: ''
        },

        init() {
            this.loadData();
            this.bindEvents();
            this.renderKPIs();
            this.renderTable();
            console.log('AutomaticTaxProposalModule initialized successfully.');
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
                console.warn('[AutomaticTaxProposal] Error loading localStorage:', err);
            }
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.saveData();
        },

        saveData() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (err) {
                console.warn('[AutomaticTaxProposal] Error saving localStorage:', err);
            }
        },

        getFilteredData() {
            let list = [...this.data];
            const comp = (this.filters.company || '').trim().toLowerCase();
            const q = (this.filters.search || '').trim().toLowerCase();

            if (comp && comp !== 'all' && comp !== 'select company') {
                list = list.filter(item => (item.company || '').toLowerCase() === comp);
            }

            if (q) {
                list = list.filter(item => {
                    return (item.proposalId || '').toLowerCase().includes(q) ||
                           (item.description || '').toLowerCase().includes(q) ||
                           (item.userId || '').toLowerCase().includes(q) ||
                           (item.proposalState || '').toLowerCase().includes(q) ||
                           (item.reportNo || '').toLowerCase().includes(q) ||
                           (item.taxOfficeId || '').toLowerCase().includes(q);
                });
            }

            return list;
        },

        renderKPIs() {
            const list = this.getFilteredData();
            const totalCount = list.length;
            const acknowledgedCount = list.filter(d => d.proposalState === 'Acknowledged').length;
            const reportedOrSettled = list.filter(d => d.proposalState === 'Reported' || d.proposalState === 'Settled').length;
            const totalTax = list.reduce((acc, curr) => acc + (parseFloat(curr.totalTaxAmount) || 0), 0);

            const elTotal = document.getElementById('atp-kpi-total');
            const elAck = document.getElementById('atp-kpi-ack');
            const elSettled = document.getElementById('atp-kpi-settled');
            const elTax = document.getElementById('atp-kpi-tax');

            if (elTotal) elTotal.textContent = `${totalCount} Proposals`;
            if (elAck) elAck.textContent = `${acknowledgedCount} Acknowledged`;
            if (elSettled) elSettled.textContent = `${reportedOrSettled} Reported / Settled`;
            if (elTax) elTax.textContent = `£${totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },

        renderTable() {
            const tbody = document.getElementById('tbody-atp-list');
            if (!tbody) return;

            const list = this.getFilteredData();
            const totalRecords = list.length;
            const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));

            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            const startIndex = (this.currentPage - 1) * this.pageSize;
            const pageData = list.slice(startIndex, startIndex + this.pageSize);

            // Update badge count
            const countBadge = document.getElementById('atp-total-count');
            if (countBadge) countBadge.textContent = `${totalRecords} Records`;

            // Update page info
            const pageInfo = document.getElementById('atp-page-info');
            if (pageInfo) pageInfo.textContent = `of ${totalPages} (${totalRecords} total records)`;

            const pageInput = document.getElementById('atp-page-input');
            if (pageInput) pageInput.value = this.currentPage;

            if (pageData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="14" style="text-align: center; padding: 36px 16px; color: #94a3b8; font-size: 13px;">
                            <div style="font-size: 26px; margin-bottom: 6px;">📂</div>
                            <div>No Automatic Tax Proposals found matching filter criteria.</div>
                        </td>
                    </tr>
                `;
                this.updateDeleteButton();
                return;
            }

            let html = '';
            pageData.forEach(row => {
                const isSelected = this.selectedIds.includes(row.id);
                
                // Proposal State badge
                let stateColor = '#2563eb';
                let stateBg = '#eff6ff';
                if (row.proposalState === 'Acknowledged') {
                    stateColor = '#059669';
                    stateBg = '#ecfdf5';
                } else if (row.proposalState === 'Settled') {
                    stateColor = '#7c3aed';
                    stateBg = '#f5f3ff';
                } else if (row.proposalState === 'Created') {
                    stateColor = '#d97706';
                    stateBg = '#fffbeb';
                }

                // Error badge
                const hasError = row.error && row.error !== 'None';
                const errBadge = hasError
                    ? `<span class="badge" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; padding: 2px 6px;">${escapeHtml(row.error)}</span>`
                    : `<span style="color: #64748b; font-size: 11.5px;">None</span>`;

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9; ${isSelected ? 'background: #eff6ff;' : ''}">
                        <td style="text-align: center; padding: 8px 6px;">
                            <input type="checkbox" class="cb-atp-row" data-id="${row.id}" ${isSelected ? 'checked' : ''} style="cursor: pointer;">
                        </td>
                        <td style="padding: 8px 10px; font-weight: 700; color: #1e3a8a; font-family: 'JetBrains Mono', monospace; font-size: 12.5px;">
                            ${escapeHtml(row.proposalId)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12.5px; color: #334155; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(row.description)}">
                            ${escapeHtml(row.description)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #475569; font-family: 'JetBrains Mono', monospace;">
                            ${escapeHtml(row.creationDate)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #64748b;">
                            ${escapeHtml(row.userId)}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #475569; font-family: 'JetBrains Mono', monospace;">
                            ${row.acknowledgeDate ? escapeHtml(row.acknowledgeDate) : '—'}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #475569; font-family: 'JetBrains Mono', monospace;">
                            ${row.taxReportDate ? escapeHtml(row.taxReportDate) : '—'}
                        </td>
                        <td style="padding: 8px 10px; text-align: center;">
                            <span class="badge" style="background: ${stateBg}; color: ${stateColor}; font-weight: 600; font-size: 11px; padding: 3px 8px; border-radius: 12px;">
                                ${escapeHtml(row.proposalState)}
                            </span>
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #334155; font-family: 'JetBrains Mono', monospace;">
                            ${row.reportNo ? escapeHtml(row.reportNo) : '—'}
                        </td>
                        <td style="padding: 8px 10px; font-size: 12px; color: #475569; font-weight: 500;">
                            ${escapeHtml(row.taxOfficeId || 'HMRC-UK')}
                        </td>
                        <td style="padding: 8px 10px; text-align: center; font-size: 12px; color: #64748b;">
                            ${escapeHtml(String(row.startPageNo || 1))}
                        </td>
                        <td style="padding: 8px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #334155;">
                            £${(parseFloat(row.prePayments) || 0).toFixed(2)}
                        </td>
                        <td style="padding: 8px 10px; text-align: center;">
                            ${errBadge}
                        </td>
                        <td style="padding: 8px 10px; text-align: right; white-space: nowrap;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.AutomaticTaxProposalModule.navigateToDetails('${escapeHtml(row.proposalId)}')" style="height: 26px; padding: 0 7px; font-size: 11px; margin-right: 4px; color: #2563eb;" title="View Tax Lines in Tax Proposal Details">
                                <span>↗️</span> Details
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.AutomaticTaxProposalModule.openEditModal('${row.id}')" style="height: 26px; padding: 0 6px; font-size: 11px; margin-right: 4px;" title="Edit Proposal">
                                ✏️
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.AutomaticTaxProposalModule.deleteRow('${row.id}')" style="height: 26px; padding: 0 6px; font-size: 11px; color: #dc2626;" title="Delete Proposal">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
            this.updateDeleteButton();
            this.syncSelectAllCheckbox();
        },

        bindEvents() {
            // Select All Checkbox
            const cbSelectAll = document.getElementById('cb-atp-select-all');
            if (cbSelectAll) {
                cbSelectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
            }

            // Table row checkboxes
            const tbody = document.getElementById('tbody-atp-list');
            if (tbody) {
                tbody.addEventListener('change', (e) => {
                    if (e.target.classList.contains('cb-atp-row')) {
                        const id = e.target.getAttribute('data-id');
                        if (e.target.checked) {
                            if (!this.selectedIds.includes(id)) this.selectedIds.push(id);
                        } else {
                            this.selectedIds = this.selectedIds.filter(x => x !== id);
                        }
                        this.updateDeleteButton();
                        this.syncSelectAllCheckbox();
                    }
                });
            }

            // Filter search button
            const btnSearch = document.getElementById('btn-atp-search');
            if (btnSearch) {
                btnSearch.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.applyFilter();
                });
            }

            // Filter clear button
            const btnClear = document.getElementById('btn-atp-clear');
            if (btnClear) {
                btnClear.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clearFilter();
                });
            }

            // Company select change filter
            const filterCompany = document.getElementById('atp-filter-company');
            if (filterCompany) {
                filterCompany.addEventListener('change', () => this.applyFilter());
            }

            // Quick search input on Enter
            const filterSearchInput = document.getElementById('atp-filter-search');
            if (filterSearchInput) {
                filterSearchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.applyFilter();
                    }
                });
            }

            // Bottom toolbar buttons
            const btnDownload = document.getElementById('btn-atp-download');
            if (btnDownload) {
                btnDownload.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.exportCSV();
                });
            }

            const btnDelete = document.getElementById('btn-atp-delete');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.bulkDelete();
                });
            }

            const btnViewDetails = document.getElementById('btn-atp-view-details');
            if (btnViewDetails) {
                btnViewDetails.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selected = this.selectedIds.length > 0 ? this.selectedIds[0] : null;
                    let pid = '';
                    if (selected) {
                        const item = this.data.find(d => d.id === selected);
                        if (item) pid = item.proposalId;
                    }
                    this.navigateToDetails(pid);
                });
            }

            // Prominent bottom action buttons matching screenshot
            const btnTaxAmounts = document.getElementById('btn-atp-view-tax-amounts');
            if (btnTaxAmounts) {
                btnTaxAmounts.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateToDetails();
                });
            }

            const btnVoucherInfo = document.getElementById('btn-atp-voucher-info');
            if (btnVoucherInfo) {
                btnVoucherInfo.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openVoucherInfo();
                });
            }

            const btnInvoiceInfo = document.getElementById('btn-atp-invoice-info');
            if (btnInvoiceInfo) {
                btnInvoiceInfo.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openInvoiceInfo();
                });
            }

            const btnPrelimReport = document.getElementById('btn-atp-preliminary-report');
            if (btnPrelimReport) {
                btnPrelimReport.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openPreliminaryReport();
                });
            }

            // Pagination buttons
            const btnFirst = document.getElementById('atp-page-first');
            if (btnFirst) btnFirst.addEventListener('click', () => this.goToPage(1));

            const btnPrev = document.getElementById('atp-page-prev');
            if (btnPrev) btnPrev.addEventListener('click', () => this.goToPage(this.currentPage - 1));

            const btnNext = document.getElementById('atp-page-next');
            if (btnNext) btnNext.addEventListener('click', () => this.goToPage(this.currentPage + 1));

            const btnLast = document.getElementById('atp-page-last');
            if (btnLast) {
                btnLast.addEventListener('click', () => {
                    const totalPages = Math.max(1, Math.ceil(this.getFilteredData().length / this.pageSize));
                    this.goToPage(totalPages);
                });
            }

            const pageInput = document.getElementById('atp-page-input');
            if (pageInput) {
                pageInput.addEventListener('change', (e) => {
                    const p = parseInt(e.target.value, 10);
                    if (!isNaN(p)) this.goToPage(p);
                });
            }

            const rowsSelect = document.getElementById('atp-rows-select');
            if (rowsSelect) {
                rowsSelect.addEventListener('change', (e) => {
                    this.pageSize = parseInt(e.target.value, 10) || 1000;
                    this.currentPage = 1;
                    this.renderTable();
                });
            }

            // Modal action buttons
            const btnModalClose = document.getElementById('btn-modal-atp-close');
            if (btnModalClose) btnModalClose.addEventListener('click', () => this.closeModal());

            const btnModalCancel = document.getElementById('btn-atp-modal-cancel');
            if (btnModalCancel) btnModalCancel.addEventListener('click', () => this.closeModal());

            const btnModalSave = document.getElementById('btn-atp-modal-save');
            if (btnModalSave) btnModalSave.addEventListener('click', () => this.saveForm());
        },

        toggleSelectAll(checked) {
            const pageData = this.getFilteredData();
            if (checked) {
                this.selectedIds = pageData.map(d => d.id);
            } else {
                this.selectedIds = [];
            }
            this.renderTable();
        },

        syncSelectAllCheckbox() {
            const cbSelectAll = document.getElementById('cb-atp-select-all');
            if (!cbSelectAll) return;
            const list = this.getFilteredData();
            if (list.length === 0) {
                cbSelectAll.checked = false;
                cbSelectAll.indeterminate = false;
                return;
            }
            const allSelected = list.every(d => this.selectedIds.includes(d.id));
            const someSelected = list.some(d => this.selectedIds.includes(d.id));
            cbSelectAll.checked = allSelected;
            cbSelectAll.indeterminate = !allSelected && someSelected;
        },

        updateDeleteButton() {
            const btnDelete = document.getElementById('btn-atp-delete');
            if (!btnDelete) return;
            const count = this.selectedIds.length;
            if (count > 0) {
                btnDelete.disabled = false;
                btnDelete.style.opacity = '1';
                btnDelete.style.cursor = 'pointer';
                btnDelete.innerHTML = `<span>🗑️</span> Delete (${count})`;
            } else {
                btnDelete.disabled = true;
                btnDelete.style.opacity = '0.6';
                btnDelete.style.cursor = 'not-allowed';
                btnDelete.innerHTML = `<span>🗑️</span> Delete`;
            }
        },

        goToPage(page) {
            const totalPages = Math.max(1, Math.ceil(this.getFilteredData().length / this.pageSize));
            this.currentPage = Math.min(Math.max(1, page), totalPages);
            this.renderTable();
        },

        applyFilter() {
            const fComp = document.getElementById('atp-filter-company');
            const fSearch = document.getElementById('atp-filter-search');

            this.filters.company = fComp ? fComp.value : '';
            this.filters.search = fSearch ? fSearch.value : '';
            this.currentPage = 1;
            this.renderKPIs();
            this.renderTable();
        },

        clearFilter() {
            const fComp = document.getElementById('atp-filter-company');
            const fSearch = document.getElementById('atp-filter-search');

            if (fComp) fComp.value = 'all';
            if (fSearch) fSearch.value = '';

            this.filters = { company: '', search: '' };
            this.currentPage = 1;
            this.renderKPIs();
            this.renderTable();
        },

        openAddModal() {
            this.editingId = null;
            const title = document.getElementById('modal-atp-title');
            if (title) title.textContent = 'Add Automatic Tax Proposal';

            const form = document.getElementById('form-add-automatic-tax-proposal');
            if (form) form.reset();

            const alert = document.getElementById('atp-form-alert');
            if (alert) alert.style.display = 'none';

            // Auto-generate proposal ID
            const elPid = document.getElementById('atp-form-proposal-id');
            if (elPid) elPid.value = `TAX-2026-P${String(this.data.length + 1).padStart(2, '0')}`;

            const elDate = document.getElementById('atp-form-creation-date');
            if (elDate) elDate.value = new Date().toISOString().split('T')[0];

            const elUser = document.getElementById('atp-form-user-id');
            if (elUser) elUser.value = 'FIN-ADMIN';

            const modal = document.getElementById('modal-add-automatic-tax-proposal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        openEditModal(id) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            this.editingId = id;
            const title = document.getElementById('modal-atp-title');
            if (title) title.textContent = `Edit Automatic Tax Proposal (${item.proposalId})`;

            const alert = document.getElementById('atp-form-alert');
            if (alert) alert.style.display = 'none';

            const setVal = (fid, val) => {
                const el = document.getElementById(fid);
                if (el) el.value = val !== undefined && val !== null ? val : '';
            };

            setVal('atp-form-company', item.company);
            setVal('atp-form-proposal-id', item.proposalId);
            setVal('atp-form-desc', item.description);
            setVal('atp-form-creation-date', item.creationDate);
            setVal('atp-form-user-id', item.userId);
            setVal('atp-form-ack-date', item.acknowledgeDate);
            setVal('atp-form-report-date', item.taxReportDate);
            setVal('atp-form-state', item.proposalState);
            setVal('atp-form-report-no', item.reportNo);
            setVal('atp-form-tax-office', item.taxOfficeId);
            setVal('atp-form-start-page', item.startPageNo || 1);
            setVal('atp-form-pre-payments', item.prePayments !== undefined ? item.prePayments : 0.00);
            setVal('atp-form-error', item.error || 'None');
            setVal('atp-form-notes', item.notes || '');

            const modal = document.getElementById('modal-add-automatic-tax-proposal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeModal() {
            this.editingId = null;
            const modal = document.getElementById('modal-add-automatic-tax-proposal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        },

        saveForm() {
            const getVal = (fid) => {
                const el = document.getElementById(fid);
                return el ? el.value.trim() : '';
            };

            const company = getVal('atp-form-company') || 'Laxmico Ltd';
            const proposalId = getVal('atp-form-proposal-id').toUpperCase();
            const description = getVal('atp-form-desc');
            const creationDate = getVal('atp-form-creation-date');
            const userId = getVal('atp-form-user-id') || 'FIN-ADMIN';
            const acknowledgeDate = getVal('atp-form-ack-date');
            const taxReportDate = getVal('atp-form-report-date');
            const proposalState = getVal('atp-form-state') || 'Created';
            const reportNo = getVal('atp-form-report-no');
            const taxOfficeId = getVal('atp-form-tax-office') || 'HMRC-UK';
            const startPageNo = parseInt(getVal('atp-form-start-page'), 10) || 1;
            const prePayments = parseFloat(getVal('atp-form-pre-payments')) || 0.00;
            const error = getVal('atp-form-error') || 'None';
            const notes = getVal('atp-form-notes');

            const alert = document.getElementById('atp-form-alert');

            // Validation
            if (!proposalId) {
                this.showAlert(alert, 'Proposal ID is required (e.g. TAX-2026-Q1).', 'error');
                return;
            }
            if (!description) {
                this.showAlert(alert, 'Proposal Description is mandatory.', 'error');
                return;
            }
            if (!creationDate) {
                this.showAlert(alert, 'Creation Date must be specified.', 'error');
                return;
            }

            // Check duplicate proposal ID
            const duplicate = this.data.find(d => d.proposalId === proposalId && d.company === company && d.id !== this.editingId);
            if (duplicate) {
                this.showAlert(alert, `Proposal ID "${proposalId}" already exists for ${company}.`, 'error');
                return;
            }

            if (this.editingId) {
                const item = this.data.find(d => d.id === this.editingId);
                if (item) {
                    Object.assign(item, {
                        company,
                        proposalId,
                        description,
                        creationDate,
                        userId,
                        acknowledgeDate,
                        taxReportDate,
                        proposalState,
                        reportNo,
                        taxOfficeId,
                        startPageNo,
                        prePayments,
                        error,
                        notes
                    });
                }
            } else {
                const newRecord = {
                    id: `atp-${Date.now()}`,
                    company,
                    proposalId,
                    description,
                    creationDate,
                    userId,
                    acknowledgeDate,
                    taxReportDate,
                    proposalState,
                    reportNo,
                    taxOfficeId,
                    startPageNo,
                    prePayments,
                    error,
                    totalTaxBase: 50000.00,
                    totalTaxAmount: 10000.00,
                    notes
                };
                this.data.unshift(newRecord);
            }

            this.saveData();
            this.closeModal();
            this.renderKPIs();
            this.renderTable();

            if (typeof window.showToast === 'function') {
                window.showToast(`Tax Proposal "${proposalId}" successfully saved.`, 'success');
            }
        },

        showAlert(alertEl, msg, type) {
            if (!alertEl) return;
            alertEl.textContent = msg;
            alertEl.style.display = 'block';
            if (type === 'error') {
                alertEl.style.background = '#fef2f2';
                alertEl.style.color = '#dc2626';
                alertEl.style.border = '1px solid #fecaca';
            } else {
                alertEl.style.background = '#ecfdf5';
                alertEl.style.color = '#059669';
                alertEl.style.border = '1px solid #a7f3d0';
            }
        },

        deleteRow(id, skipConfirm) {
            const item = this.data.find(d => d.id === id);
            if (!item) return;

            if (!skipConfirm) {
                const conf = window.confirm(`Are you sure you want to delete Tax Proposal "${item.proposalId}"?`);
                if (!conf) return;
            }

            this.data = this.data.filter(d => d.id !== id);
            this.selectedIds = this.selectedIds.filter(x => x !== id);
            this.saveData();
            this.renderKPIs();
            this.renderTable();

            if (typeof window.showToast === 'function') {
                window.showToast(`Proposal "${item.proposalId}" deleted.`, 'info');
            }
        },

        bulkDelete() {
            if (this.selectedIds.length === 0) return;
            const conf = window.confirm(`Permanently delete ${this.selectedIds.length} selected Tax Proposals?`);
            if (!conf) return;

            this.data = this.data.filter(d => !this.selectedIds.includes(d.id));
            const count = this.selectedIds.length;
            this.selectedIds = [];
            this.saveData();
            this.renderKPIs();
            this.renderTable();

            if (typeof window.showToast === 'function') {
                window.showToast(`Deleted ${count} proposals.`, 'info');
            }
        },

        navigateToDetails(proposalId) {
            if (typeof window.switchFinanceSubPanel === 'function') {
                window.switchFinanceSubPanel('fin-tax-proposal-details');
            }
            if (proposalId && window.TaxProposalDetailsModule) {
                setTimeout(() => {
                    const pidFilter = document.getElementById('filter-tpd-proposal-id');
                    if (pidFilter) {
                        pidFilter.value = proposalId;
                        window.TaxProposalDetailsModule.applyFilter();
                    }
                }, 100);
            }
        },

        openVoucherInfo() {
            const proposal = this.data.length > 0 ? this.data[0] : null;
            const pid = proposal ? proposal.proposalId : 'TAX-2026-Q1';
            const modal = document.getElementById('modal-atp-dialog');
            const title = document.getElementById('atp-dialog-title');
            const body = document.getElementById('atp-dialog-body');

            if (title) title.innerHTML = `<span>🕒</span> Voucher Information: ${escapeHtml(pid)}`;
            if (body) {
                body.innerHTML = `
                    <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                        <p><strong>Associated Voucher Series & Ledger Ranges:</strong></p>
                        <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-top: 10px;">
                            <table class="table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                <thead style="background: #f8fafc;">
                                    <tr>
                                        <th style="padding: 8px 10px;">Voucher Type</th>
                                        <th style="padding: 8px 10px;">Series</th>
                                        <th style="padding: 8px 10px;">Voucher Count</th>
                                        <th style="padding: 8px 10px; text-align: right;">Total Taxable Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 8px 10px;">SINV (Sales Invoice)</td>
                                        <td style="padding: 8px 10px; font-family: monospace;">A (26001000 - 26001250)</td>
                                        <td style="padding: 8px 10px;">142</td>
                                        <td style="padding: 8px 10px; text-align: right; font-family: monospace;">£245,600.00</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 8px 10px;">PINV (Supplier Invoice)</td>
                                        <td style="padding: 8px 10px; font-family: monospace;">B (36001000 - 36001180)</td>
                                        <td style="padding: 8px 10px;">88</td>
                                        <td style="padding: 8px 10px; text-align: right; font-family: monospace;">£139,500.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        openInvoiceInfo() {
            const modal = document.getElementById('modal-atp-dialog');
            const title = document.getElementById('atp-dialog-title');
            const body = document.getElementById('atp-dialog-body');

            if (title) title.innerHTML = `<span>🕒</span> Invoice Summary & Counterparty Analysis`;
            if (body) {
                body.innerHTML = `
                    <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                        <p><strong>Tax Return Counterparty Invoice Breakdown:</strong></p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 11.5px; color: #64748b;">Customer Invoices (Output Tax)</div>
                                <div style="font-size: 18px; font-weight: 700; color: #059669;">£49,120.00</div>
                                <div style="font-size: 11px; color: #059669;">142 Invoices Reconciled</div>
                            </div>
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 11.5px; color: #64748b;">Supplier Invoices (Input Tax)</div>
                                <div style="font-size: 18px; font-weight: 700; color: #2563eb;">£27,900.00</div>
                                <div style="font-size: 11px; color: #2563eb;">88 Invoices Reconciled</div>
                            </div>
                        </div>
                        <p style="font-size: 12px; color: #64748b;">All counterparty VAT numbers cross-verified via HMRC VAT validation service.</p>
                    </div>
                `;
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        openPreliminaryReport() {
            const modal = document.getElementById('modal-atp-dialog');
            const title = document.getElementById('atp-dialog-title');
            const body = document.getElementById('atp-dialog-body');

            if (title) title.innerHTML = `<span>🕒</span> Preliminary Tax Report: Statutory VAT Return`;
            if (body) {
                body.innerHTML = `
                    <div style="font-size: 12.5px; color: #1e293b; line-height: 1.6;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 12px;">
                            <div>
                                <strong style="font-size: 14px;">HMRC VAT 100 - PRELIMINARY RETURN</strong><br>
                                <span style="font-size: 11px; color: #64748b;">Company: Laxmico Ltd | VAT Reg: GB 982 4410 22</span>
                            </div>
                            <div style="text-align: right;">
                                <span class="badge badge-success">Audit Passed</span><br>
                                <span style="font-size: 11px; color: #64748b;">Period: 2026-Q1</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0;">
                                <span>Box 1: VAT due on sales and other outputs:</span>
                                <strong style="font-family: monospace;">£49,120.00</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0;">
                                <span>Box 4: VAT reclaimed on purchases and other inputs:</span>
                                <strong style="font-family: monospace;">£27,900.00</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; background: #eff6ff; font-weight: 700; color: #1e3a8a;">
                                <span>Box 5: Net VAT to be paid to HMRC:</span>
                                <span style="font-family: monospace;">£21,220.00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0;">
                                <span>Box 6: Total value of sales excluding VAT:</span>
                                <strong style="font-family: monospace;">£245,600.00</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0;">
                                <span>Box 7: Total value of purchases excluding VAT:</span>
                                <strong style="font-family: monospace;">£139,500.00</strong>
                            </div>
                        </div>
                    </div>
                `;
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        },

        closeDialog() {
            const modal = document.getElementById('modal-atp-dialog');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        },

        exportCSV() {
            const list = this.getFilteredData();
            if (list.length === 0) {
                if (typeof window.showToast === 'function') window.showToast('No proposals to export.', 'warning');
                return;
            }

            const headers = [
                'Proposal ID', 'Description', 'Creation Date', 'User ID',
                'Acknowledge Date', 'Tax Report Date', 'Proposal State',
                'Report No', 'Tax Office ID', 'Start Page No', 'Pre Payments', 'Error'
            ];

            const rows = list.map(d => [
                `"${d.proposalId || ''}"`,
                `"${(d.description || '').replace(/"/g, '""')}"`,
                `"${d.creationDate || ''}"`,
                `"${d.userId || ''}"`,
                `"${d.acknowledgeDate || ''}"`,
                `"${d.taxReportDate || ''}"`,
                `"${d.proposalState || ''}"`,
                `"${d.reportNo || ''}"`,
                `"${d.taxOfficeId || ''}"`,
                `"${d.startPageNo || 1}"`,
                `"${(parseFloat(d.prePayments) || 0).toFixed(2)}"`,
                `"${d.error || 'None'}"`
            ]);

            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `Automatic_Tax_Proposals_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (typeof window.showToast === 'function') {
                window.showToast(`Exported ${list.length} Automatic Tax Proposals to CSV.`, 'success');
            }
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Global document delegation for modal opening
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('#btn-add-fin-automatic-tax-proposal, #btn-atp-add');
        if (addBtn) {
            e.preventDefault();
            if (window.AutomaticTaxProposalModule && typeof window.AutomaticTaxProposalModule.openAddModal === 'function') {
                window.AutomaticTaxProposalModule.openAddModal();
            } else {
                const modal = document.getElementById('modal-add-automatic-tax-proposal');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }
        }
    });

    window.AutomaticTaxProposalModule = AutomaticTaxProposalModule;

    // Auto-init on DOMContentLoaded or immediate if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AutomaticTaxProposalModule.init());
    } else {
        AutomaticTaxProposalModule.init();
    }

})(window);
