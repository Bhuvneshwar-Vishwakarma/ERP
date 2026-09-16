/**
 * account_groups_module.js
 * 
 * Modern ERP Design for Account Groups Master (ERP-FIN-MAS-004):
 * - Fields from screenshot:
 *   - Filters: Company, Account Group, Search
 *   - Table: Checkbox, Account Group, Account Group Desc
 *   - Actions: + Add, Delete (Bulk), Download (CSV)
 * - Modern ERP features:
 *   - Top KPI metric cards (Total Groups, Balance Sheet Groups, P&L Groups, Reporting Standard)
 *   - Filter toolbar with active, enabled Company dropdown
 *   - Live search, classification badges, and row action buttons (Edit ✏️, Delete 🗑️)
 *   - Add / Edit Modal with validation and active Company dropdown
 *   - Pagination with custom page sizes (10, 25, 50, 1000/All)
 *   - LocalStorage persistence with UK GAAP / IFRS standard seed groups
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_ACCOUNT_GROUPS_V1';

    const DEFAULT_ACCOUNT_GROUPS = [
        {
            id: 'AG-001',
            company: 'Laxmico Ltd',
            groupCode: '1000',
            groupName: 'CURRENT ASSETS',
            description: 'Cash, bank balances, trade debtors, and inventory holdings',
            category: 'Asset',
            normalBalance: 'Debit',
            glRange: '1000 - 1499',
            status: 'Active'
        },
        {
            id: 'AG-002',
            company: 'Laxmico Ltd',
            groupCode: '1500',
            groupName: 'FIXED ASSETS',
            description: 'Tangible plant, machinery, fixtures, IT hardware and intangible licenses',
            category: 'Asset',
            normalBalance: 'Debit',
            glRange: '1500 - 1999',
            status: 'Active'
        },
        {
            id: 'AG-003',
            company: 'Laxmico Ltd',
            groupCode: '2000',
            groupName: 'CURRENT LIABILITIES',
            description: 'Trade creditors, VAT payable, PAYE/NIC, and short-term obligations',
            category: 'Liability',
            normalBalance: 'Credit',
            glRange: '2000 - 2499',
            status: 'Active'
        },
        {
            id: 'AG-004',
            company: 'Laxmico Ltd',
            groupCode: '2500',
            groupName: 'LONG TERM LIABILITIES',
            description: 'Commercial mortgages, bank loans, and long-term financial liabilities',
            category: 'Liability',
            normalBalance: 'Credit',
            glRange: '2500 - 2999',
            status: 'Active'
        },
        {
            id: 'AG-005',
            company: 'Laxmico Ltd',
            groupCode: '3000',
            groupName: 'EQUITY & CAPITAL',
            description: 'Ordinary share capital, share premium, and cumulative retained earnings',
            category: 'Equity',
            normalBalance: 'Credit',
            glRange: '3000 - 3999',
            status: 'Active'
        },
        {
            id: 'AG-006',
            company: 'Laxmico Ltd',
            groupCode: '4000',
            groupName: 'REVENUE & SALES',
            description: 'Domestic wholesale sales, export turnover, and service income',
            category: 'Income',
            normalBalance: 'Credit',
            glRange: '4000 - 4999',
            status: 'Active'
        },
        {
            id: 'AG-007',
            company: 'Laxmico Ltd',
            groupCode: '5000',
            groupName: 'COST OF GOODS SOLD',
            description: 'Direct materials, pharmaceutical purchases, and freight-in charges',
            category: 'Expense',
            normalBalance: 'Debit',
            glRange: '5000 - 5999',
            status: 'Active'
        },
        {
            id: 'AG-008',
            company: 'Laxmico Ltd',
            groupCode: '6000',
            groupName: 'OPERATING EXPENSES',
            description: 'Staff salaries, warehouse rent, logistics, utility and administrative costs',
            category: 'Expense',
            normalBalance: 'Debit',
            glRange: '6000 - 6999',
            status: 'Active'
        },
        {
            id: 'AG-009',
            company: 'Laxmico Ltd',
            groupCode: '7000',
            groupName: 'TAXATION & FINANCE',
            description: 'Bank interest, corporation tax provision, and foreign exchange gains/losses',
            category: 'Expense',
            normalBalance: 'Debit',
            glRange: '7000 - 7999',
            status: 'Active'
        }
    ];

    let groupsData = [];
    let currentPage = 1;
    let pageSize = 1000;
    let selectedIds = new Set();
    let editingGroupId = null;

    function loadAccountGroups() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                groupsData = JSON.parse(raw);
            } else {
                groupsData = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT_GROUPS));
                saveAccountGroups();
            }
        } catch (e) {
            console.warn('[AccountGroups] Error reading from localStorage, using default seed', e);
            groupsData = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT_GROUPS));
        }
    }

    function saveAccountGroups() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(groupsData));
        } catch (e) {
            console.error('[AccountGroups] Error saving to localStorage', e);
        }
    }

    function getFilteredGroups() {
        const companyFilter = document.getElementById('ag-filter-company')?.value || '';
        const codeFilter = (document.getElementById('ag-filter-code')?.value || '').trim().toLowerCase();
        const descFilter = (document.getElementById('ag-filter-desc')?.value || '').trim().toLowerCase();
        const quickSearch = (document.getElementById('ag-quick-search')?.value || '').trim().toLowerCase();

        return groupsData.filter(g => {
            if (companyFilter && companyFilter !== 'Select Company' && g.company !== companyFilter) {
                return false;
            }
            if (codeFilter && !g.groupCode.toLowerCase().includes(codeFilter) && !g.groupName.toLowerCase().includes(codeFilter)) {
                return false;
            }
            if (descFilter && !g.description.toLowerCase().includes(descFilter)) {
                return false;
            }
            if (quickSearch) {
                const combined = `${g.groupCode} ${g.groupName} ${g.description} ${g.category} ${g.glRange}`.toLowerCase();
                if (!combined.includes(quickSearch)) return false;
            }
            return true;
        });
    }

    function updateKPIs(filteredCount) {
        const totalEl = document.getElementById('kpi-ag-total');
        const bsEl = document.getElementById('kpi-ag-bs');
        const plEl = document.getElementById('kpi-ag-pl');
        const badgeCount = document.getElementById('ag-badge-count');

        if (totalEl) totalEl.textContent = `${filteredCount} Groups`;
        if (badgeCount) badgeCount.textContent = `${filteredCount} Active Groups`;

        const bsCount = groupsData.filter(g => ['Asset', 'Liability', 'Equity'].includes(g.category)).length;
        const plCount = groupsData.filter(g => ['Income', 'Expense'].includes(g.category)).length;

        if (bsEl) bsEl.textContent = `${bsCount} Balance Sheet`;
        if (plEl) plEl.textContent = `${plCount} P&L Groups`;
    }

    function renderTable() {
        const tbody = document.getElementById('ag-table-body');
        const statusEl = document.getElementById('ag-record-status');
        const totalPagesEl = document.getElementById('ag-total-pages');
        const pageNumDisplay = document.getElementById('ag-current-page-display');
        const selectAllCb = document.getElementById('ag-select-all');

        if (!tbody) return;

        const filtered = getFilteredGroups();
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
                    <td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
                        <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">No Accounting Groups Found</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">No account groups match your active filter criteria.</div>
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

            let catBadge = 'background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe;';
            if (r.category === 'Asset') catBadge = 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
            else if (r.category === 'Liability') catBadge = 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;';
            else if (r.category === 'Equity') catBadge = 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
            else if (r.category === 'Income') catBadge = 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
            else if (r.category === 'Expense') catBadge = 'background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa;';

            html += `
                <tr style="background: ${rowBg}; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast);" data-id="${r.id}">
                    <td style="text-align: center; padding: 12px 8px; width: 44px;">
                        <input type="checkbox" class="ag-row-cb" data-id="${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);">
                    </td>
                    <td style="padding: 12px 14px; width: 220px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="badge" style="background: #f1f5f9; color: var(--color-primary); font-weight: 700; font-size: 12px; padding: 3px 8px; border: 1px solid var(--color-border-light); border-radius: 4px; font-family: monospace;">
                                ${r.groupCode}
                            </span>
                            <strong style="color: var(--color-text-main); font-size: 13px;">${r.groupName}</strong>
                        </div>
                    </td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: var(--color-text-main); line-height: 1.4;">
                        ${r.description}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 120px;">
                        <span class="badge" style="${catBadge} font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
                            ${r.category}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 130px;">
                        <span style="font-family: monospace; font-size: 11.5px; color: #475569; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
                            ${r.glRange || '—'}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 90px;">
                        <span class="badge badge-success" style="font-size: 11px; padding: 2px 7px;">${r.status}</span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 100px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <button type="button" class="btn-ag-edit-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-primary);" title="Edit Account Group">
                                ✏️
                            </button>
                            <button type="button" class="btn-ag-del-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-danger);" title="Delete Account Group">
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

        // Row checkbox event handlers
        tbody.querySelectorAll('.ag-row-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderTable();
            });
        });

        // Edit row handler
        tbody.querySelectorAll('.btn-ag-edit-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Delete row handler
        tbody.querySelectorAll('.btn-ag-del-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                deleteSingleGroup(id);
            });
        });
    }

    function openEditModal(groupId) {
        editingGroupId = groupId;
        const modal = document.getElementById('modal-add-account-group');
        const titleEl = document.getElementById('modal-ag-title');
        const companyInput = document.getElementById('modal-ag-company');
        const codeInput = document.getElementById('modal-ag-code');
        const nameInput = document.getElementById('modal-ag-name');
        const descInput = document.getElementById('modal-ag-desc');
        const catSelect = document.getElementById('modal-ag-category');
        const balSelect = document.getElementById('modal-ag-balance');
        const rangeInput = document.getElementById('modal-ag-range');
        const statusSelect = document.getElementById('modal-ag-status');

        if (!modal) return;

        const group = groupsData.find(g => g.id === groupId);
        if (group) {
            if (titleEl) titleEl.innerHTML = `<span>✏️</span> Edit Account Group (${group.groupCode})`;
            if (companyInput) {
                companyInput.value = group.company || 'Laxmico Ltd';
                companyInput.disabled = false;
            }
            if (codeInput) {
                codeInput.value = group.groupCode;
                codeInput.disabled = true; // Lock code in edit
            }
            if (nameInput) nameInput.value = group.groupName;
            if (descInput) descInput.value = group.description;
            if (catSelect) catSelect.value = group.category || 'Asset';
            if (balSelect) balSelect.value = group.normalBalance || 'Debit';
            if (rangeInput) rangeInput.value = group.glRange || '';
            if (statusSelect) statusSelect.value = group.status || 'Active';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function openCreateModal() {
        editingGroupId = null;
        const modal = document.getElementById('modal-add-account-group');
        const titleEl = document.getElementById('modal-ag-title');
        const companyInput = document.getElementById('modal-ag-company');
        const codeInput = document.getElementById('modal-ag-code');
        const nameInput = document.getElementById('modal-ag-name');
        const descInput = document.getElementById('modal-ag-desc');
        const catSelect = document.getElementById('modal-ag-category');
        const balSelect = document.getElementById('modal-ag-balance');
        const rangeInput = document.getElementById('modal-ag-range');
        const statusSelect = document.getElementById('modal-ag-status');

        if (!modal) {
            console.error('modal-add-account-group not found');
            return;
        }

        if (titleEl) titleEl.innerHTML = `<span>📁</span> Add Account Group`;
        if (companyInput) {
            const curFilterComp = document.getElementById('ag-filter-company')?.value;
            companyInput.value = (curFilterComp && curFilterComp !== 'Select Company') ? curFilterComp : 'Laxmico Ltd';
            companyInput.disabled = false;
        }
        if (codeInput) {
            codeInput.value = '';
            codeInput.disabled = false;
        }
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (catSelect) catSelect.value = 'Asset';
        if (balSelect) balSelect.value = 'Debit';
        if (rangeInput) rangeInput.value = '';
        if (statusSelect) statusSelect.value = 'Active';

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function closeModal() {
        const modal = document.getElementById('modal-add-account-group');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        editingGroupId = null;
    }

    function deleteSingleGroup(id) {
        const group = groupsData.find(g => g.id === id);
        const name = group ? `${group.groupCode} - ${group.groupName}` : 'this group';
        if (!confirm(`Are you sure you want to delete Account Group '${name}'?`)) {
            return;
        }
        groupsData = groupsData.filter(g => g.id !== id);
        selectedIds.delete(id);
        saveAccountGroups();
        renderTable();

        if (typeof window.showToast === 'function') {
            window.showToast(`Account Group '${name}' deleted successfully.`, 'success');
        }
    }

    function initListeners() {
        // Quick Search input
        const quickSearchInput = document.getElementById('ag-quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Apply Search button
        const btnSearch = document.getElementById('btn-ag-search');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Account Groups filtered successfully.', 'info');
                }
            });
        }

        // Reset button
        const btnReset = document.getElementById('btn-ag-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const comp = document.getElementById('ag-filter-company');
                const code = document.getElementById('ag-filter-code');
                const desc = document.getElementById('ag-filter-desc');
                if (comp) comp.value = 'Laxmico Ltd';
                if (code) code.value = '';
                if (desc) desc.value = '';
                if (quickSearchInput) quickSearchInput.value = '';

                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Account Group filters reset.', 'info');
                }
            });
        }

        // Company filter dropdown change
        const companySelect = document.getElementById('ag-filter-company');
        if (companySelect) {
            companySelect.addEventListener('change', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('ag-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', () => {
                const filtered = getFilteredGroups();
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
        document.getElementById('btn-ag-first')?.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('btn-ag-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('btn-ag-next')?.addEventListener('click', () => {
            const filtered = getFilteredGroups();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        document.getElementById('btn-ag-last')?.addEventListener('click', () => {
            const filtered = getFilteredGroups();
            currentPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            renderTable();
        });

        document.getElementById('ag-page-size')?.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 1000;
            currentPage = 1;
            renderTable();
        });

        // Add Account Group button & Modal controls
        const btnAddRow = document.getElementById('btn-ag-add-row');
        if (btnAddRow) btnAddRow.addEventListener('click', openCreateModal);

        const btnCloseModal = document.getElementById('btn-close-add-ag-modal');
        const btnCancelModal = document.getElementById('btn-cancel-add-ag');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        const modal = document.getElementById('modal-add-account-group');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Save Modal Form
        const btnSaveModal = document.getElementById('btn-save-add-ag');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const companyInput = document.getElementById('modal-ag-company');
                const codeInput = document.getElementById('modal-ag-code');
                const nameInput = document.getElementById('modal-ag-name');
                const descInput = document.getElementById('modal-ag-desc');
                const catSelect = document.getElementById('modal-ag-category');
                const balSelect = document.getElementById('modal-ag-balance');
                const rangeInput = document.getElementById('modal-ag-range');
                const statusSelect = document.getElementById('modal-ag-status');

                const company = (companyInput?.value || 'Laxmico Ltd').trim();
                const code = (codeInput?.value || '').trim().toUpperCase();
                const name = (nameInput?.value || '').trim().toUpperCase();
                const desc = (descInput?.value || '').trim();
                const category = catSelect?.value || 'Asset';
                const balance = balSelect?.value || 'Debit';
                const range = (rangeInput?.value || '').trim();
                const status = statusSelect?.value || 'Active';

                if (!code) {
                    alert('Please enter an Account Group Code (e.g. 1000 or ASST-CURR).');
                    codeInput?.focus();
                    return;
                }
                if (!name) {
                    alert('Please enter an Account Group Name (e.g. CURRENT ASSETS).');
                    nameInput?.focus();
                    return;
                }
                if (!desc) {
                    alert('Please enter an Account Group Description.');
                    descInput?.focus();
                    return;
                }

                if (editingGroupId) {
                    const idx = groupsData.findIndex(g => g.id === editingGroupId);
                    if (idx !== -1) {
                        groupsData[idx].company = company;
                        groupsData[idx].groupName = name;
                        groupsData[idx].description = desc;
                        groupsData[idx].category = category;
                        groupsData[idx].normalBalance = balance;
                        groupsData[idx].glRange = range;
                        groupsData[idx].status = status;

                        saveAccountGroups();
                        closeModal();
                        renderTable();

                        if (typeof window.showToast === 'function') {
                            window.showToast(`Account Group '${code} - ${name}' updated successfully.`, 'success');
                        }
                    }
                } else {
                    const exists = groupsData.some(g => g.company === company && g.groupCode === code);
                    if (exists) {
                        alert(`Account Group '${code}' already exists for ${company}.`);
                        return;
                    }

                    const newId = 'AG-' + String(Date.now()).slice(-4);
                    groupsData.unshift({
                        id: newId,
                        company: company,
                        groupCode: code,
                        groupName: name,
                        description: desc,
                        category: category,
                        normalBalance: balance,
                        glRange: range,
                        status: status
                    });

                    saveAccountGroups();
                    closeModal();
                    renderTable();

                    if (typeof window.showToast === 'function') {
                        window.showToast(`New Account Group '${code} - ${name}' created successfully.`, 'success');
                    }
                }
            });
        }

        // Bulk Delete
        const btnBulkDelete = document.getElementById('btn-ag-delete');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', () => {
                if (selectedIds.size === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Please select at least one account group using the checkboxes.', 'warning');
                    } else {
                        alert('Please select at least one account group using the checkboxes.');
                    }
                    return;
                }

                const count = selectedIds.size;
                if (!confirm(`Are you sure you want to delete ${count} selected account group(s)?`)) {
                    return;
                }

                groupsData = groupsData.filter(g => !selectedIds.has(g.id));
                selectedIds.clear();
                saveAccountGroups();
                renderTable();

                if (typeof window.showToast === 'function') {
                    window.showToast(`${count} account group(s) removed successfully.`, 'success');
                }
            });
        }

        // Export CSV
        const btnDownload = document.getElementById('btn-ag-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const filtered = getFilteredGroups();
                if (filtered.length === 0) {
                    alert('No records available to export.');
                    return;
                }

                let csv = 'Company,Account Group,Group Name,Description,Category,Normal Balance,GL Range,Status\n';
                filtered.forEach(g => {
                    csv += `"${g.company}","${g.groupCode}","${g.groupName}","${g.description}","${g.category}","${g.normalBalance}","${g.glRange}","${g.status}"\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Account_Groups_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('Account groups exported to CSV successfully.', 'success');
                }
            });
        }

        // Document-level delegation for Add Account Group button
        document.addEventListener('click', function (e) {
            const addBtn = e.target && (e.target.id === 'btn-ag-add-row' || (e.target.closest && e.target.closest('#btn-ag-add-row')));
            if (addBtn) {
                e.preventDefault();
                openCreateModal();
            }
        });
    }

    function init() {
        loadAccountGroups();
        initListeners();
        renderTable();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AccountGroupsModule = {
        init: init,
        renderTable: renderTable,
        getFilteredGroups: getFilteredGroups,
        openCreateModal: openCreateModal,
        openEditModal: openEditModal,
        closeModal: closeModal,
        getAccountGroups: () => groupsData
    };
    window.openCreateAccountGroupModal = openCreateModal;
})();
