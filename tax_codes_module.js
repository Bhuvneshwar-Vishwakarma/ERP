/**
 * tax_codes_module.js
 * 
 * Modern ERP Design for Tax Codes Master (ERP-FIN-MAS-002):
 * - Fields from screenshot: Company, Tax Code, Tax Code Desc, Tax(%), Valid From,
 *   Valid Until, Tax Type, Tax Received, Tax Disbursed, Deductible(%)
 * - Modern ERP layout: KPI stats, filters, live table search, status badges,
 *   modal dialog (Add/Edit), CSV export, bulk delete, and pagination.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_TAX_CODES_V1';

    const DEFAULT_TAX_CODES = [
        {
            id: 'TC-001',
            company: 'Laxmico Ltd',
            code: 'VAT-STD-20',
            desc: 'Standard Rate VAT 20%',
            rate: 20.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Both (Sales & Purchase)',
            taxReceived: '2200 - Output VAT',
            taxDisbursed: '1400 - Input VAT',
            deductible: 100.00
        },
        {
            id: 'TC-002',
            company: 'Laxmico Ltd',
            code: 'VAT-RED-5',
            desc: 'Reduced Rate VAT (Fuel & Power) 5%',
            rate: 5.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Both (Sales & Purchase)',
            taxReceived: '2200 - Output VAT',
            taxDisbursed: '1400 - Input VAT',
            deductible: 100.00
        },
        {
            id: 'TC-003',
            company: 'Laxmico Ltd',
            code: 'VAT-ZERO-0',
            desc: 'Zero Rated Commodities (Exports, Books, Food)',
            rate: 0.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Sales Tax',
            taxReceived: '2210 - Zero Output Tax',
            taxDisbursed: '1400 - Input VAT',
            deductible: 100.00
        },
        {
            id: 'TC-004',
            company: 'Laxmico Ltd',
            code: 'VAT-EXEMPT',
            desc: 'Exempt Financial & Healthcare Supplies',
            rate: 0.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Both (Sales & Purchase)',
            taxReceived: '—',
            taxDisbursed: '—',
            deductible: 0.00
        },
        {
            id: 'TC-005',
            company: 'Laxmico Ltd',
            code: 'IMPORT-VAT',
            desc: 'Postponed / Import Customs VAT 20%',
            rate: 20.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Purchase Tax',
            taxReceived: '—',
            taxDisbursed: '1420 - Customs Import VAT',
            deductible: 100.00
        },
        {
            id: 'TC-006',
            company: 'Laxmico Ltd',
            code: 'WHT-SERVICES',
            desc: 'Withholding Tax on Non-Resident Subcontractors',
            rate: 10.00,
            validFrom: '2024-01-01',
            validUntil: '2099-12-31',
            type: 'Withholding Tax',
            taxReceived: '—',
            taxDisbursed: '2240 - WHT Payable',
            deductible: 0.00
        }
    ];

    let taxCodesData = [];
    let currentPage = 1;
    let pageSize = 1000;
    let selectedIds = new Set();
    let editingTaxCodeId = null;

    function loadTaxCodes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    taxCodesData = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error('Error loading tax codes from storage:', e);
        }
        taxCodesData = [...DEFAULT_TAX_CODES];
        saveTaxCodes();
    }

    function saveTaxCodes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(taxCodesData));
        } catch (e) {
            console.error('Error saving tax codes:', e);
        }
    }

    function getFilteredTaxCodes() {
        const companyFilter = (document.getElementById('tc-filter-company')?.value || '').trim();
        const codeFilter = (document.getElementById('tc-filter-code')?.value || '').trim().toLowerCase();
        const descFilter = (document.getElementById('tc-filter-desc')?.value || '').trim().toLowerCase();
        const quickSearch = (document.getElementById('tc-quick-search')?.value || '').trim().toLowerCase();

        return taxCodesData.filter(t => {
            if (companyFilter && t.company !== companyFilter) return false;
            if (codeFilter && !t.code.toLowerCase().includes(codeFilter)) return false;
            if (descFilter && !t.desc.toLowerCase().includes(descFilter)) return false;

            if (quickSearch) {
                const matchCode = t.code.toLowerCase().includes(quickSearch);
                const matchDesc = t.desc.toLowerCase().includes(quickSearch);
                const matchType = t.type.toLowerCase().includes(quickSearch);
                const matchRate = String(t.rate).includes(quickSearch);
                if (!matchCode && !matchDesc && !matchType && !matchRate) return false;
            }

            return true;
        });
    }

    function updateKPIs(filteredCount) {
        const totalEl = document.getElementById('kpi-tc-total-codes');
        const badgeCount = document.getElementById('tc-badge-count');
        const stdRateEl = document.getElementById('kpi-tc-std-rate');
        const companySelect = document.getElementById('tc-filter-company');

        if (totalEl) totalEl.textContent = `${filteredCount} Tax Codes`;
        if (badgeCount) badgeCount.textContent = `${filteredCount} Active Codes`;

        const std = taxCodesData.find(t => t.code.includes('STD') || t.rate === 20);
        if (stdRateEl && std) {
            stdRateEl.textContent = `${std.rate.toFixed(2)}% (${std.code})`;
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

    function renderTable() {
        const tbody = document.getElementById('tc-table-body');
        const statusEl = document.getElementById('tc-record-status');
        const totalPagesEl = document.getElementById('tc-total-pages');
        const pageNumDisplay = document.getElementById('tc-current-page-display');
        const selectAllCb = document.getElementById('tc-select-all');

        if (!tbody) return;

        const filtered = getFilteredTaxCodes();
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
                    <td colspan="10" style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
                        <div style="font-size: 32px; margin-bottom: 8px;">🏷️</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">No Tax Codes Found</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">No tax codes match your active filter criteria.</div>
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

            let typeBadgeStyle = 'background: #e0e7ff; color: #4338ca;';
            if (r.type.includes('Sales')) typeBadgeStyle = 'background: #dbeafe; color: #1e40af;';
            else if (r.type.includes('Purchase')) typeBadgeStyle = 'background: #fef3c7; color: #92400e;';
            else if (r.type.includes('Withholding')) typeBadgeStyle = 'background: #fee2e2; color: #991b1b;';

            html += `
                <tr style="background: ${rowBg}; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast);" data-id="${r.id}">
                    <td style="text-align: center; padding: 12px 8px;">
                        <input type="checkbox" class="tc-row-cb" data-id="${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);">
                    </td>
                    <td style="padding: 12px 14px;">
                        <span class="badge" style="background: #f1f5f9; color: var(--color-primary); font-weight: 700; font-size: 12px; padding: 4px 8px; border: 1px solid var(--color-border-light); border-radius: 4px;">
                            ${r.code}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-weight: 600; color: var(--color-text-main); font-size: 12.5px;">
                        ${r.desc}
                    </td>
                    <td style="padding: 12px 14px; text-align: right;">
                        <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: #0f172a; background: #e0f2fe; padding: 3px 8px; border-radius: 4px; border: 1px solid #bae6fd;">
                            ${Number(r.rate).toFixed(2)}%
                        </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center; font-size: 12px; color: var(--color-text-muted);">
                        ${formatDate(r.validFrom)}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; font-size: 12px; color: var(--color-text-muted);">
                        ${formatDate(r.validUntil)}
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <span class="badge" style="${typeBadgeStyle} font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
                            ${r.type}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-size: 12px; color: #475569;">
                        ${r.taxReceived}
                    </td>
                    <td style="padding: 12px 14px; font-size: 12px; color: #475569;">
                        ${r.taxDisbursed}
                    </td>
                    <td style="padding: 12px 14px; text-align: right; font-weight: 600; font-size: 12px; color: var(--color-text-main);">
                        ${Number(r.deductible).toFixed(2)}%
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <button type="button" class="btn-tc-edit-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-primary);" title="Edit Tax Code">
                                ✏️
                            </button>
                            <button type="button" class="btn-tc-del-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-danger);" title="Delete Tax Code">
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

        // Attach event handlers
        tbody.querySelectorAll('.tc-row-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderTable();
            });
        });

        tbody.querySelectorAll('.btn-tc-edit-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        tbody.querySelectorAll('.btn-tc-del-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteSingleTaxCode(id);
            });
        });
    }

    function openEditModal(taxCodeId) {
        editingTaxCodeId = taxCodeId;
        const modal = document.getElementById('modal-add-tax-code');
        const titleEl = document.getElementById('modal-tc-title');
        const codeInput = document.getElementById('modal-tc-code');
        const descInput = document.getElementById('modal-tc-desc');
        const rateInput = document.getElementById('modal-tc-rate');
        const validFromInput = document.getElementById('modal-tc-valid-from');
        const validUntilInput = document.getElementById('modal-tc-valid-until');
        const typeSelect = document.getElementById('modal-tc-type');
        const receivedInput = document.getElementById('modal-tc-received');
        const disbursedInput = document.getElementById('modal-tc-disbursed');
        const deductibleInput = document.getElementById('modal-tc-deductible');
        const companyInput = document.getElementById('modal-tc-company');

        if (!modal) return;

        const taxObj = taxCodesData.find(t => t.id === taxCodeId);
        if (taxObj) {
            if (titleEl) titleEl.innerHTML = `<span>✏️</span> Edit Tax Code (${taxObj.code})`;
            if (companyInput) {
                companyInput.value = taxObj.company || 'Laxmico Ltd';
                companyInput.disabled = false;
            }
            if (codeInput) {
                codeInput.value = taxObj.code;
                codeInput.disabled = true; // Lock code during edit
            }
            if (descInput) descInput.value = taxObj.desc;
            if (rateInput) rateInput.value = taxObj.rate;
            if (validFromInput) validFromInput.value = taxObj.validFrom;
            if (validUntilInput) validUntilInput.value = taxObj.validUntil;
            if (typeSelect) typeSelect.value = taxObj.type;
            if (receivedInput) receivedInput.value = taxObj.taxReceived;
            if (disbursedInput) disbursedInput.value = taxObj.taxDisbursed;
            if (deductibleInput) deductibleInput.value = taxObj.deductible;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function openCreateModal() {
        editingTaxCodeId = null;
        const modal = document.getElementById('modal-add-tax-code');
        const titleEl = document.getElementById('modal-tc-title');
        const codeInput = document.getElementById('modal-tc-code');
        const descInput = document.getElementById('modal-tc-desc');
        const rateInput = document.getElementById('modal-tc-rate');
        const validFromInput = document.getElementById('modal-tc-valid-from');
        const validUntilInput = document.getElementById('modal-tc-valid-until');
        const typeSelect = document.getElementById('modal-tc-type');
        const receivedInput = document.getElementById('modal-tc-received');
        const disbursedInput = document.getElementById('modal-tc-disbursed');
        const deductibleInput = document.getElementById('modal-tc-deductible');
        const companyInput = document.getElementById('modal-tc-company');

        if (!modal) {
            console.error('modal-add-tax-code not found');
            return;
        }

        if (titleEl) titleEl.innerHTML = `<span>🏷️</span> Add Tax Code`;
        if (codeInput) {
            codeInput.value = '';
            codeInput.disabled = false;
        }
        if (descInput) descInput.value = '';
        if (rateInput) rateInput.value = '20.00';
        if (validFromInput) validFromInput.value = new Date().toISOString().split('T')[0];
        if (validUntilInput) validUntilInput.value = '2099-12-31';
        if (typeSelect) typeSelect.value = 'Both (Sales & Purchase)';
        if (receivedInput) receivedInput.value = '2200 - Output VAT';
        if (disbursedInput) disbursedInput.value = '1400 - Input VAT';
        if (deductibleInput) deductibleInput.value = '100.00';

        const compVal = document.getElementById('tc-filter-company')?.value || 'Laxmico Ltd';
        if (companyInput) {
            companyInput.value = compVal;
            companyInput.disabled = false;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function closeModal() {
        const modal = document.getElementById('modal-add-tax-code');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        editingTaxCodeId = null;
    }

    function deleteSingleTaxCode(id) {
        const taxObj = taxCodesData.find(t => t.id === id);
        const code = taxObj ? taxObj.code : 'this';
        if (!confirm(`Are you sure you want to delete Tax Code '${code}'?`)) {
            return;
        }
        taxCodesData = taxCodesData.filter(t => t.id !== id);
        selectedIds.delete(id);
        saveTaxCodes();
        renderTable();

        if (typeof window.showToast === 'function') {
            window.showToast(`Tax Code '${code}' deleted successfully.`, 'success');
        }
    }

    function initListeners() {
        // Quick Search input
        const quickSearchInput = document.getElementById('tc-quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Apply Search button
        const btnSearch = document.getElementById('btn-tc-search');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Tax codes filtered successfully.', 'info');
                }
            });
        }

        // Reset button
        const btnReset = document.getElementById('btn-tc-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const comp = document.getElementById('tc-filter-company');
                const code = document.getElementById('tc-filter-code');
                const desc = document.getElementById('tc-filter-desc');
                if (comp) comp.value = 'Laxmico Ltd';
                if (code) code.value = '';
                if (desc) desc.value = '';
                if (quickSearchInput) quickSearchInput.value = '';

                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Tax code filters reset.', 'info');
                }
            });
        }

        // Company filter change
        const companySelect = document.getElementById('tc-filter-company');
        if (companySelect) {
            companySelect.addEventListener('change', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('tc-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', () => {
                const filtered = getFilteredTaxCodes();
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
        document.getElementById('btn-tc-first')?.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('btn-tc-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('btn-tc-next')?.addEventListener('click', () => {
            const filtered = getFilteredTaxCodes();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        document.getElementById('btn-tc-last')?.addEventListener('click', () => {
            const filtered = getFilteredTaxCodes();
            currentPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            renderTable();
        });

        document.getElementById('tc-page-size')?.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 1000;
            currentPage = 1;
            renderTable();
        });

        // Add Tax Code button & Modal controls
        const btnAddRow = document.getElementById('btn-tc-add-row');
        if (btnAddRow) btnAddRow.addEventListener('click', openCreateModal);

        const btnCloseModal = document.getElementById('btn-close-add-tc-modal');
        const btnCancelModal = document.getElementById('btn-cancel-add-tc');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        const modal = document.getElementById('modal-add-tax-code');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Save Modal Form
        const btnSaveModal = document.getElementById('btn-save-add-tc');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const codeInput = document.getElementById('modal-tc-code');
                const descInput = document.getElementById('modal-tc-desc');
                const rateInput = document.getElementById('modal-tc-rate');
                const validFromInput = document.getElementById('modal-tc-valid-from');
                const validUntilInput = document.getElementById('modal-tc-valid-until');
                const typeSelect = document.getElementById('modal-tc-type');
                const receivedInput = document.getElementById('modal-tc-received');
                const disbursedInput = document.getElementById('modal-tc-disbursed');
                const deductibleInput = document.getElementById('modal-tc-deductible');

                const code = (codeInput?.value || '').trim().toUpperCase();
                const desc = (descInput?.value || '').trim();
                const rate = parseFloat(rateInput?.value || '0');
                const validFrom = (validFromInput?.value || '').trim();
                const validUntil = (validUntilInput?.value || '').trim() || '2099-12-31';
                const type = (typeSelect?.value || '').trim();
                const received = (receivedInput?.value || '').trim() || '—';
                const disbursed = (disbursedInput?.value || '').trim() || '—';
                const deductible = parseFloat(deductibleInput?.value || '100');

                if (!code) {
                    alert('Please enter a Tax Code.');
                    codeInput?.focus();
                    return;
                }
                if (!desc) {
                    alert('Please enter a Tax Code Description.');
                    descInput?.focus();
                    return;
                }
                if (isNaN(rate) || rate < 0) {
                    alert('Please enter a valid non-negative tax percentage.');
                    rateInput?.focus();
                    return;
                }
                if (!validFrom) {
                    alert('Please select a Valid From date.');
                    validFromInput?.focus();
                    return;
                }

                if (editingTaxCodeId) {
                    const idx = taxCodesData.findIndex(t => t.id === editingTaxCodeId);
                    if (idx !== -1) {
                        const company = document.getElementById('modal-tc-company')?.value || taxCodesData[idx].company;
                        taxCodesData[idx].company = company;
                        taxCodesData[idx].desc = desc;
                        taxCodesData[idx].rate = rate;
                        taxCodesData[idx].validFrom = validFrom;
                        taxCodesData[idx].validUntil = validUntil;
                        taxCodesData[idx].type = type;
                        taxCodesData[idx].taxReceived = received;
                        taxCodesData[idx].taxDisbursed = disbursed;
                        taxCodesData[idx].deductible = deductible;

                        saveTaxCodes();
                        closeModal();
                        renderTable();

                        if (typeof window.showToast === 'function') {
                            window.showToast(`Tax Code '${code}' updated successfully.`, 'success');
                        }
                    }
                } else {
                    const company = document.getElementById('modal-tc-company')?.value || 'Laxmico Ltd';
                    const exists = taxCodesData.some(t => t.company === company && t.code === code);
                    if (exists) {
                        alert(`Tax Code '${code}' already exists for ${company}.`);
                        return;
                    }

                    const newId = 'TC-' + String(Date.now()).slice(-4);
                    taxCodesData.unshift({
                        id: newId,
                        company: company,
                        code: code,
                        desc: desc,
                        rate: rate,
                        validFrom: validFrom,
                        validUntil: validUntil,
                        type: type,
                        taxReceived: received,
                        taxDisbursed: disbursed,
                        deductible: deductible
                    });

                    saveTaxCodes();
                    closeModal();
                    renderTable();

                    if (typeof window.showToast === 'function') {
                        window.showToast(`New Tax Code '${code}' created successfully.`, 'success');
                    }
                }
            });
        }

        // Bulk Delete
        const btnBulkDelete = document.getElementById('btn-tc-delete');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', () => {
                if (selectedIds.size === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Please select at least one tax code using the checkboxes.', 'warning');
                    } else {
                        alert('Please select at least one tax code using the checkboxes.');
                    }
                    return;
                }

                const count = selectedIds.size;
                if (!confirm(`Are you sure you want to delete ${count} selected tax code(s)?`)) {
                    return;
                }

                taxCodesData = taxCodesData.filter(t => !selectedIds.has(t.id));
                selectedIds.clear();
                saveTaxCodes();
                renderTable();

                if (typeof window.showToast === 'function') {
                    window.showToast(`${count} tax code(s) removed successfully.`, 'success');
                }
            });
        }

        // Export CSV
        const btnDownload = document.getElementById('btn-tc-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const filtered = getFilteredTaxCodes();
                if (filtered.length === 0) {
                    alert('No records available to export.');
                    return;
                }

                let csv = 'Company,Tax Code,Description,Tax(%),Valid From,Valid Until,Tax Type,Tax Received,Tax Disbursed,Deductible(%)\n';
                filtered.forEach(t => {
                    csv += `"${t.company}","${t.code}","${t.desc}",${t.rate},"${t.validFrom}","${t.validUntil}","${t.type}","${t.taxReceived}","${t.taxDisbursed}",${t.deductible}\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Tax_Codes_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('Tax codes exported to CSV successfully.', 'success');
                }
            });
        }

        // Document-level delegation for Add Tax Code
        document.addEventListener('click', function (e) {
            const addBtn = e.target && (e.target.id === 'btn-tc-add-row' || (e.target.closest && e.target.closest('#btn-tc-add-row')));
            if (addBtn) {
                e.preventDefault();
                openCreateModal();
            }
        });
    }

    function init() {
        loadTaxCodes();
        initListeners();
        renderTable();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.TaxCodesModule = {
        init: init,
        renderTable: renderTable,
        getFilteredTaxCodes: getFilteredTaxCodes,
        openCreateModal: openCreateModal,
        openEditModal: openEditModal,
        closeModal: closeModal,
        getTaxCodes: () => taxCodesData
    };
    window.openCreateTaxCodeModal = openCreateModal;
})();
