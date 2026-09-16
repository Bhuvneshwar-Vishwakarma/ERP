/**
 * accounts_module.js
 * 
 * Modern ERP Design for Accounts Master (ERP-FIN-MAS-005):
 * - Fields from screenshot:
 *   - Filters: Company, Account, Account Type, Account Group, Valid From, Valid Until, Ledger Account, Tax Account, Search
 *   - Table: Checkbox, Account, Account Desc, Account Type, Account Type Desc, Account Group, Account Group Desc, Valid From, Valid Until, Ledger Account, Tax Account
 *   - Actions: + Add, Delete, Download (Export CSV)
 * - Modern ERP features:
 *   - Top KPI cards (Total Accounts, Ledger Accounts, Tax Linked Accounts, Balance Sheet / P&L)
 *   - Filter toolbar matching all screenshot fields with active Company dropdown
 *   - Modern grid table with status badges, GL tags, and row action buttons (Edit ✏️, Delete 🗑️)
 *   - Add / Edit Modal with enabled Company dropdown and full field validation
 *   - Pagination controls with custom page sizes (10, 25, 50, 1000/All)
 *   - LocalStorage persistence with rich seed data
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_ACCOUNTS_V1';

    const DEFAULT_ACCOUNTS = [
        {
            id: 'ACC-001',
            company: 'Laxmico Ltd',
            account: '1110',
            accountDesc: 'Cash in Hand - GBP Float',
            accountType: 'Cash',
            accountTypeDesc: 'Liquid Cash & Petty Float',
            accountGroup: '1000',
            accountGroupDesc: 'CURRENT ASSETS',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-002',
            company: 'Laxmico Ltd',
            account: '1200',
            accountDesc: 'Barclays GBP Commercial Clearing',
            accountType: 'Bank',
            accountTypeDesc: 'Corporate Bank Current Account',
            accountGroup: '1000',
            accountGroupDesc: 'CURRENT ASSETS',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-003',
            company: 'Laxmico Ltd',
            account: '1300',
            accountDesc: 'Trade Debtors Control Account',
            accountType: 'Receivable',
            accountTypeDesc: 'Customer Subledger Clearing Control',
            accountGroup: '1000',
            accountGroupDesc: 'CURRENT ASSETS',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-004',
            company: 'Laxmico Ltd',
            account: '1400',
            accountDesc: 'Input VAT Recoverable (Customs & Supplies)',
            accountType: 'Tax',
            accountTypeDesc: 'HMRC Input Tax Asset Recovery',
            accountGroup: '1000',
            accountGroupDesc: 'CURRENT ASSETS',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'Yes'
        },
        {
            id: 'ACC-005',
            company: 'Laxmico Ltd',
            account: '1510',
            accountDesc: 'IT Equipment, Servers & Hardware',
            accountType: 'Asset',
            accountTypeDesc: 'Tangible Capital Asset Ledger',
            accountGroup: '1500',
            accountGroupDesc: 'FIXED ASSETS',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-006',
            company: 'Laxmico Ltd',
            account: '2000',
            accountDesc: 'Trade Creditors Control Account',
            accountType: 'Payable',
            accountTypeDesc: 'Supplier Subledger Clearing Control',
            accountGroup: '2000',
            accountGroupDesc: 'CURRENT LIABILITIES',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-007',
            company: 'Laxmico Ltd',
            account: '2200',
            accountDesc: 'Output VAT Standard 20% & Reduced',
            accountType: 'Tax',
            accountTypeDesc: 'HMRC Output Sales VAT Liability',
            accountGroup: '2000',
            accountGroupDesc: 'CURRENT LIABILITIES',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'Yes'
        },
        {
            id: 'ACC-008',
            company: 'Laxmico Ltd',
            account: '3000',
            accountDesc: 'Ordinary Paid-Up Share Capital',
            accountType: 'Equity',
            accountTypeDesc: 'Shareholder Capital Account',
            accountGroup: '3000',
            accountGroupDesc: 'EQUITY & CAPITAL',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-009',
            company: 'Laxmico Ltd',
            account: '4000',
            accountDesc: 'Domestic Wholesale Sales Turnover',
            accountType: 'Income',
            accountTypeDesc: 'Trading Commercial Revenue',
            accountGroup: '4000',
            accountGroupDesc: 'REVENUE & SALES',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-010',
            company: 'Laxmico Ltd',
            account: '5000',
            accountDesc: 'Direct Pharmaceutical Inward Purchases',
            accountType: 'Expense',
            accountTypeDesc: 'Cost of Sales Inventory Inward',
            accountGroup: '5000',
            accountGroupDesc: 'COST OF GOODS SOLD',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-011',
            company: 'Laxmico Ltd',
            account: '6100',
            accountDesc: 'Warehouse Rent & Commercial Rates',
            accountType: 'Expense',
            accountTypeDesc: 'Property & Facilities Overhead',
            accountGroup: '6000',
            accountGroupDesc: 'OPERATING EXPENSES',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        },
        {
            id: 'ACC-012',
            company: 'Laxmico Ltd',
            account: '6200',
            accountDesc: 'Staff Salaries, Wages & Employer NI',
            accountType: 'Expense',
            accountTypeDesc: 'Payroll & Staff Employment Costs',
            accountGroup: '6000',
            accountGroupDesc: 'OPERATING EXPENSES',
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            ledgerAccount: 'Yes',
            taxAccount: 'No'
        }
    ];

    let accountsData = [];
    let currentPage = 1;
    let pageSize = 1000;
    let selectedIds = new Set();
    let editingAccountId = null;

    function loadAccounts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                accountsData = JSON.parse(raw);
            } else {
                accountsData = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
                saveAccounts();
            }
        } catch (e) {
            console.warn('[AccountsModule] Error reading from localStorage, using seed data', e);
            accountsData = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
        }
    }

    function saveAccounts() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accountsData));
        } catch (e) {
            console.error('[AccountsModule] Error saving to localStorage', e);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = months[parseInt(parts[1], 10) - 1] || parts[1];
                return `${parts[2]}-${monthName}-${parts[0]}`;
            }
        } catch (e) {}
        return dateStr;
    }

    function getFilteredAccounts() {
        const compFilter = document.getElementById('acc-filter-company')?.value || '';
        const acctFilter = (document.getElementById('acc-filter-account')?.value || '').trim().toLowerCase();
        const typeFilter = (document.getElementById('acc-filter-type')?.value || '').trim().toLowerCase();
        const groupFilter = (document.getElementById('acc-filter-group')?.value || '').trim().toLowerCase();
        const validFromFilter = document.getElementById('acc-filter-valid-from')?.value || '';
        const validUntilFilter = document.getElementById('acc-filter-valid-until')?.value || '';
        const ledgerFilter = document.getElementById('acc-filter-ledger')?.value || 'All';
        const taxFilter = document.getElementById('acc-filter-tax')?.value || 'All';
        const quickSearch = (document.getElementById('acc-quick-search')?.value || '').trim().toLowerCase();

        return accountsData.filter(a => {
            if (compFilter && compFilter !== 'Select Company' && a.company !== compFilter) {
                return false;
            }
            if (acctFilter && !a.account.toLowerCase().includes(acctFilter) && !a.accountDesc.toLowerCase().includes(acctFilter)) {
                return false;
            }
            if (typeFilter && !a.accountType.toLowerCase().includes(typeFilter) && !a.accountTypeDesc.toLowerCase().includes(typeFilter)) {
                return false;
            }
            if (groupFilter && !a.accountGroup.toLowerCase().includes(groupFilter) && !a.accountGroupDesc.toLowerCase().includes(groupFilter)) {
                return false;
            }
            if (validFromFilter && a.validFrom < validFromFilter) {
                return false;
            }
            if (validUntilFilter && a.validUntil > validUntilFilter) {
                return false;
            }
            if (ledgerFilter !== 'All' && a.ledgerAccount !== ledgerFilter) {
                return false;
            }
            if (taxFilter !== 'All' && a.taxAccount !== taxFilter) {
                return false;
            }
            if (quickSearch) {
                const combined = `${a.account} ${a.accountDesc} ${a.accountType} ${a.accountTypeDesc} ${a.accountGroup} ${a.accountGroupDesc}`.toLowerCase();
                if (!combined.includes(quickSearch)) return false;
            }
            return true;
        });
    }

    function updateKPIs(filteredCount) {
        const totalEl = document.getElementById('kpi-acc-total');
        const ledgerEl = document.getElementById('kpi-acc-ledger');
        const taxEl = document.getElementById('kpi-acc-tax');
        const badgeCount = document.getElementById('acc-badge-count');
        const kpiDashboardAccounts = document.getElementById('kpi-fin-accounts');

        if (totalEl) totalEl.textContent = `${filteredCount} Nominal Accounts`;
        if (badgeCount) badgeCount.textContent = `${filteredCount} Active Accounts`;
        if (kpiDashboardAccounts) kpiDashboardAccounts.textContent = String(accountsData.length);

        const ledgerCount = accountsData.filter(a => a.ledgerAccount === 'Yes').length;
        const taxCount = accountsData.filter(a => a.taxAccount === 'Yes').length;

        if (ledgerEl) ledgerEl.textContent = `${ledgerCount} Active Ledger Accounts`;
        if (taxEl) taxEl.textContent = `${taxCount} Tax Accounts (VAT/WHT)`;
    }

    function renderTable() {
        const tbody = document.getElementById('acc-table-body');
        const statusEl = document.getElementById('acc-record-status');
        const totalPagesEl = document.getElementById('acc-total-pages');
        const pageNumDisplay = document.getElementById('acc-current-page-display');
        const selectAllCb = document.getElementById('acc-select-all');

        if (!tbody) return;

        const filtered = getFilteredAccounts();
        const totalRecords = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

        updateKPIs(totalRecords);

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        if (pageNumDisplay) pageNumDisplay.textContent = currentPage;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalRecords);
        const pageRows = filtered.slice(startIndex, endIndex);

        if (selectAllCb) {
            selectAllCb.checked = pageRows.length > 0 && pageRows.every(r => selectedIds.has(r.id));
        }

        if (pageRows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
                        <div style="font-size: 32px; margin-bottom: 8px;">🏦</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">No Accounts Found</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">No chart of accounts match your active search filters.</div>
                    </td>
                </tr>
            `;
            if (statusEl) statusEl.textContent = 'Showing 0 records';
            return;
        }

        let html = '';
        pageRows.forEach((r, idx) => {
            const isChecked = selectedIds.has(r.id);
            const rowBg = isChecked ? '#eef2ff' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');

            let typeBadge = 'background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;';
            if (r.accountType === 'Bank') typeBadge = 'background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe;';
            else if (r.accountType === 'Cash') typeBadge = 'background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;';
            else if (r.accountType === 'Receivable') typeBadge = 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
            else if (r.accountType === 'Payable') typeBadge = 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;';
            else if (r.accountType === 'Tax') typeBadge = 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
            else if (r.accountType === 'Income') typeBadge = 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;';
            else if (r.accountType === 'Expense') typeBadge = 'background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa;';

            const ledgerPill = r.ledgerAccount === 'Yes' 
                ? '<span class="badge badge-success" style="font-size: 11px; padding: 2px 7px;">Yes</span>'
                : '<span class="badge" style="background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 7px;">No</span>';

            const taxPill = r.taxAccount === 'Yes'
                ? '<span class="badge badge-warning" style="font-size: 11px; padding: 2px 7px;">Yes</span>'
                : '<span class="badge" style="background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 7px;">No</span>';

            html += `
                <tr style="background: ${rowBg}; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast);" data-id="${r.id}">
                    <td style="text-align: center; padding: 12px 8px; width: 44px;">
                        <input type="checkbox" class="acc-row-cb" data-id="${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);">
                    </td>
                    <td style="padding: 12px 14px; width: 110px;">
                        <span class="badge" style="background: #f1f5f9; color: var(--color-primary); font-weight: 700; font-size: 12px; padding: 3px 8px; border: 1px solid var(--color-border-light); border-radius: 4px; font-family: monospace;">
                            ${r.account}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-weight: 600; color: var(--color-text-main); font-size: 12.5px; min-width: 220px;">
                        ${r.accountDesc}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 100px;">
                        <span class="badge" style="${typeBadge} font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
                            ${r.accountType}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-size: 12px; color: #475569; min-width: 170px;">
                        ${r.accountTypeDesc}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 100px;">
                        <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #1e293b; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; border: 1px solid #bae6fd;">
                            ${r.accountGroup}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-size: 12px; font-weight: 600; color: #334155; min-width: 150px;">
                        ${r.accountGroupDesc}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; font-size: 12px; color: var(--color-text-muted); width: 100px;">
                        ${formatDate(r.validFrom)}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; font-size: 12px; color: var(--color-text-muted); width: 100px;">
                        ${formatDate(r.validUntil)}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 90px;">
                        ${ledgerPill}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 85px;">
                        ${taxPill}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 90px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <button type="button" class="btn-acc-edit-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-primary);" title="Edit Account">
                                ✏️
                            </button>
                            <button type="button" class="btn-acc-del-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-danger);" title="Delete Account">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        if (statusEl) {
            statusEl.textContent = `Showing ${startIndex + 1} - ${endIndex} of ${totalRecords} records`;
        }

        // Row checkbox handlers
        tbody.querySelectorAll('.acc-row-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderTable();
            });
        });

        // Edit row button handlers
        tbody.querySelectorAll('.btn-acc-edit-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Delete row button handlers
        tbody.querySelectorAll('.btn-acc-del-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                deleteSingleAccount(id);
            });
        });
    }

    function openEditModal(accountId) {
        editingAccountId = accountId;
        const modal = document.getElementById('modal-add-account');
        const titleEl = document.getElementById('modal-acc-title');
        const compSelect = document.getElementById('modal-acc-company');
        const acctInput = document.getElementById('modal-acc-account');
        const descInput = document.getElementById('modal-acc-desc');
        const typeSelect = document.getElementById('modal-acc-type');
        const typeDescInput = document.getElementById('modal-acc-type-desc');
        const groupSelect = document.getElementById('modal-acc-group');
        const fromInput = document.getElementById('modal-acc-valid-from');
        const untilInput = document.getElementById('modal-acc-valid-until');
        const ledgerSelect = document.getElementById('modal-acc-ledger');
        const taxSelect = document.getElementById('modal-acc-tax');

        if (!modal) return;

        const acct = accountsData.find(a => a.id === accountId);
        if (acct) {
            if (titleEl) titleEl.innerHTML = `<span>✏️</span> Edit Account (${acct.account})`;
            if (compSelect) {
                compSelect.value = acct.company || 'Laxmico Ltd';
                compSelect.disabled = false;
            }
            if (acctInput) {
                acctInput.value = acct.account;
                acctInput.disabled = true; // Lock code in edit
            }
            if (descInput) descInput.value = acct.accountDesc;
            if (typeSelect) typeSelect.value = acct.accountType;
            if (typeDescInput) typeDescInput.value = acct.accountTypeDesc;
            if (groupSelect) groupSelect.value = acct.accountGroup;
            if (fromInput) fromInput.value = acct.validFrom;
            if (untilInput) untilInput.value = acct.validUntil;
            if (ledgerSelect) ledgerSelect.value = acct.ledgerAccount;
            if (taxSelect) taxSelect.value = acct.taxAccount;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function openCreateModal() {
        editingAccountId = null;
        const modal = document.getElementById('modal-add-account');
        const titleEl = document.getElementById('modal-acc-title');
        const compSelect = document.getElementById('modal-acc-company');
        const acctInput = document.getElementById('modal-acc-account');
        const descInput = document.getElementById('modal-acc-desc');
        const typeSelect = document.getElementById('modal-acc-type');
        const typeDescInput = document.getElementById('modal-acc-type-desc');
        const groupSelect = document.getElementById('modal-acc-group');
        const fromInput = document.getElementById('modal-acc-valid-from');
        const untilInput = document.getElementById('modal-acc-valid-until');
        const ledgerSelect = document.getElementById('modal-acc-ledger');
        const taxSelect = document.getElementById('modal-acc-tax');

        if (!modal) {
            console.error('modal-add-account not found');
            return;
        }

        if (titleEl) titleEl.innerHTML = `<span>🏦</span> Add New Account`;
        if (compSelect) {
            const curFilterComp = document.getElementById('acc-filter-company')?.value;
            compSelect.value = (curFilterComp && curFilterComp !== 'Select Company') ? curFilterComp : 'Laxmico Ltd';
            compSelect.disabled = false;
        }
        if (acctInput) {
            acctInput.value = '';
            acctInput.disabled = false;
        }
        if (descInput) descInput.value = '';
        if (typeSelect) typeSelect.value = 'Bank';
        if (typeDescInput) typeDescInput.value = 'Corporate Bank Clearing Account';
        if (groupSelect) groupSelect.value = '1000';
        if (fromInput) fromInput.value = new Date().toISOString().split('T')[0];
        if (untilInput) untilInput.value = '2099-12-31';
        if (ledgerSelect) ledgerSelect.value = 'Yes';
        if (taxSelect) taxSelect.value = 'No';

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function closeModal() {
        const modal = document.getElementById('modal-add-account');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        editingAccountId = null;
    }

    function deleteSingleAccount(id) {
        const acct = accountsData.find(a => a.id === id);
        const name = acct ? `${acct.account} - ${acct.accountDesc}` : 'this account';
        if (!confirm(`Are you sure you want to delete Account '${name}'?`)) {
            return;
        }
        accountsData = accountsData.filter(a => a.id !== id);
        selectedIds.delete(id);
        saveAccounts();
        renderTable();

        if (typeof window.showToast === 'function') {
            window.showToast(`Account '${name}' deleted successfully.`, 'success');
        }
    }

    function getGroupDesc(groupCode) {
        const map = {
            '1000': 'CURRENT ASSETS',
            '1500': 'FIXED ASSETS',
            '2000': 'CURRENT LIABILITIES',
            '2500': 'LONG TERM LIABILITIES',
            '3000': 'EQUITY & CAPITAL',
            '4000': 'REVENUE & SALES',
            '5000': 'COST OF GOODS SOLD',
            '6000': 'OPERATING EXPENSES',
            '7000': 'TAXATION & FINANCE'
        };
        return map[groupCode] || 'GENERAL LEDGER';
    }

    function initListeners() {
        // Quick Search input
        const quickSearchInput = document.getElementById('acc-quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Apply Search button
        const btnSearch = document.getElementById('btn-acc-search');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Accounts filtered successfully.', 'info');
                }
            });
        }

        // Reset button
        const btnReset = document.getElementById('btn-acc-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const comp = document.getElementById('acc-filter-company');
                const acct = document.getElementById('acc-filter-account');
                const type = document.getElementById('acc-filter-type');
                const group = document.getElementById('acc-filter-group');
                const from = document.getElementById('acc-filter-valid-from');
                const until = document.getElementById('acc-filter-valid-until');
                const ledger = document.getElementById('acc-filter-ledger');
                const tax = document.getElementById('acc-filter-tax');

                if (comp) comp.value = 'Laxmico Ltd';
                if (acct) acct.value = '';
                if (type) type.value = '';
                if (group) group.value = '';
                if (from) from.value = '';
                if (until) until.value = '';
                if (ledger) ledger.value = 'All';
                if (tax) tax.value = 'All';
                if (quickSearchInput) quickSearchInput.value = '';

                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Account filters reset.', 'info');
                }
            });
        }

        // Dropdown filter change handlers
        ['acc-filter-company', 'acc-filter-ledger', 'acc-filter-tax'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    currentPage = 1;
                    renderTable();
                });
            }
        });

        // Select All Checkbox
        const selectAllCb = document.getElementById('acc-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', () => {
                const filtered = getFilteredAccounts();
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, filtered.length);
                const pageRows = filtered.slice(startIndex, endIndex);

                if (selectAllCb.checked) {
                    pageRows.forEach(r => selectedIds.add(r.id));
                } else {
                    pageRows.forEach(r => selectedIds.delete(r.id));
                }
                renderTable();
            });
        }

        // Pagination buttons
        document.getElementById('btn-acc-first')?.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('btn-acc-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('btn-acc-next')?.addEventListener('click', () => {
            const filtered = getFilteredAccounts();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        document.getElementById('btn-acc-last')?.addEventListener('click', () => {
            const filtered = getFilteredAccounts();
            currentPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            renderTable();
        });

        document.getElementById('acc-page-size')?.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 1000;
            currentPage = 1;
            renderTable();
        });

        // Add Account button & Modal controls
        const btnAddRow = document.getElementById('btn-acc-add-row');
        if (btnAddRow) btnAddRow.addEventListener('click', openCreateModal);

        const btnCloseModal = document.getElementById('btn-close-add-acc-modal');
        const btnCancelModal = document.getElementById('btn-cancel-add-acc');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        const modal = document.getElementById('modal-add-account');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Type select automatic description helper
        const modalTypeSelect = document.getElementById('modal-acc-type');
        if (modalTypeSelect) {
            modalTypeSelect.addEventListener('change', (e) => {
                const typeDescInput = document.getElementById('modal-acc-type-desc');
                if (!typeDescInput) return;
                const val = e.target.value;
                const map = {
                    'Bank': 'Corporate Bank Clearing Account',
                    'Cash': 'Liquid Cash & Petty Float',
                    'Receivable': 'Customer Subledger Clearing Control',
                    'Payable': 'Supplier Subledger Clearing Control',
                    'Tax': 'HMRC Tax Authority Clearing Account',
                    'Asset': 'Tangible Capital Asset Ledger',
                    'Liability': 'Short & Long-term Financial Obligation',
                    'Equity': 'Shareholder Equity & Retained Earnings',
                    'Income': 'Trading Commercial Revenue Stream',
                    'Expense': 'Operating & Administrative Expenditure'
                };
                typeDescInput.value = map[val] || `${val} Account`;
            });
        }

        // Save Modal Form
        const btnSaveModal = document.getElementById('btn-save-add-acc');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const compSelect = document.getElementById('modal-acc-company');
                const acctInput = document.getElementById('modal-acc-account');
                const descInput = document.getElementById('modal-acc-desc');
                const typeSelect = document.getElementById('modal-acc-type');
                const typeDescInput = document.getElementById('modal-acc-type-desc');
                const groupSelect = document.getElementById('modal-acc-group');
                const fromInput = document.getElementById('modal-acc-valid-from');
                const untilInput = document.getElementById('modal-acc-valid-until');
                const ledgerSelect = document.getElementById('modal-acc-ledger');
                const taxSelect = document.getElementById('modal-acc-tax');

                const company = (compSelect?.value || 'Laxmico Ltd').trim();
                const account = (acctInput?.value || '').trim().toUpperCase();
                const desc = (descInput?.value || '').trim();
                const type = typeSelect?.value || 'Bank';
                const typeDesc = (typeDescInput?.value || '').trim() || `${type} Account`;
                const group = groupSelect?.value || '1000';
                const groupDesc = getGroupDesc(group);
                const validFrom = (fromInput?.value || '').trim() || new Date().toISOString().split('T')[0];
                const validUntil = (untilInput?.value || '').trim() || '2099-12-31';
                const ledger = ledgerSelect?.value || 'Yes';
                const tax = taxSelect?.value || 'No';

                if (!account) {
                    alert('Please enter an Account Number/Code (e.g. 1110).');
                    acctInput?.focus();
                    return;
                }
                if (!desc) {
                    alert('Please enter an Account Description.');
                    descInput?.focus();
                    return;
                }

                if (editingAccountId) {
                    const idx = accountsData.findIndex(a => a.id === editingAccountId);
                    if (idx !== -1) {
                        accountsData[idx].company = company;
                        accountsData[idx].accountDesc = desc;
                        accountsData[idx].accountType = type;
                        accountsData[idx].accountTypeDesc = typeDesc;
                        accountsData[idx].accountGroup = group;
                        accountsData[idx].accountGroupDesc = groupDesc;
                        accountsData[idx].validFrom = validFrom;
                        accountsData[idx].validUntil = validUntil;
                        accountsData[idx].ledgerAccount = ledger;
                        accountsData[idx].taxAccount = tax;

                        saveAccounts();
                        closeModal();
                        renderTable();

                        if (typeof window.showToast === 'function') {
                            window.showToast(`Account '${account} - ${desc}' updated successfully.`, 'success');
                        }
                    }
                } else {
                    const exists = accountsData.some(a => a.company === company && a.account === account);
                    if (exists) {
                        alert(`Account '${account}' already exists for ${company}.`);
                        return;
                    }

                    const newId = 'ACC-' + String(Date.now()).slice(-4);
                    accountsData.unshift({
                        id: newId,
                        company: company,
                        account: account,
                        accountDesc: desc,
                        accountType: type,
                        accountTypeDesc: typeDesc,
                        accountGroup: group,
                        accountGroupDesc: groupDesc,
                        validFrom: validFrom,
                        validUntil: validUntil,
                        ledgerAccount: ledger,
                        taxAccount: tax
                    });

                    saveAccounts();
                    closeModal();
                    renderTable();

                    if (typeof window.showToast === 'function') {
                        window.showToast(`New Account '${account} - ${desc}' created successfully.`, 'success');
                    }
                }
            });
        }

        // Bulk Delete
        const btnBulkDelete = document.getElementById('btn-acc-delete');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', () => {
                if (selectedIds.size === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Please select at least one account using the checkboxes.', 'warning');
                    } else {
                        alert('Please select at least one account using the checkboxes.');
                    }
                    return;
                }

                const count = selectedIds.size;
                if (!confirm(`Are you sure you want to delete ${count} selected account(s)?`)) {
                    return;
                }

                accountsData = accountsData.filter(a => !selectedIds.has(a.id));
                selectedIds.clear();
                saveAccounts();
                renderTable();

                if (typeof window.showToast === 'function') {
                    window.showToast(`${count} account(s) removed successfully.`, 'success');
                }
            });
        }

        // Export CSV
        const btnDownload = document.getElementById('btn-acc-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const filtered = getFilteredAccounts();
                if (filtered.length === 0) {
                    alert('No records available to export.');
                    return;
                }

                let csv = 'Company,Account,Account Desc,Account Type,Account Type Desc,Account Group,Account Group Desc,Valid From,Valid Until,Ledger Account,Tax Account\n';
                filtered.forEach(a => {
                    csv += `"${a.company}","${a.account}","${a.accountDesc}","${a.accountType}","${a.accountTypeDesc}","${a.accountGroup}","${a.accountGroupDesc}","${a.validFrom}","${a.validUntil}","${a.ledgerAccount}","${a.taxAccount}"\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Chart_of_Accounts_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('Accounts exported to CSV successfully.', 'success');
                }
            });
        }

        // Document-level delegation for Add Account button
        document.addEventListener('click', function (e) {
            const addBtn = e.target && (e.target.id === 'btn-acc-add-row' || (e.target.closest && e.target.closest('#btn-acc-add-row')));
            if (addBtn) {
                e.preventDefault();
                openCreateModal();
            }
        });
    }

    function init() {
        loadAccounts();
        initListeners();
        renderTable();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AccountsModule = {
        init: init,
        renderTable: renderTable,
        getFilteredAccounts: getFilteredAccounts,
        openCreateModal: openCreateModal,
        openEditModal: openEditModal,
        closeModal: closeModal,
        getAccounts: () => accountsData
    };
    window.openCreateAccountModal = openCreateModal;
})();
