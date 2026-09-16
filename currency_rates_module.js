/**
 * currency_rates_module.js
 * 
 * Modern ERP Design for Currency Rates Master:
 * - Compatible with ERP theme and design system tokens
 * - Fields from screenshot: Company, Ref Curr Code, Curr Rate Type, Curr Rate Type Desc,
 *   Show Only Valid Rates, Currency Code, Rate, Valid From, Conversion Factor
 * - Rich features: KPI stats, live quick search, status badges, inline edit/delete,
 *   CSV export, modal dialogs, and pagination.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_CURRENCY_RATES_V2';

    const CURRENCY_INFO = {
        'USD': { name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
        'EUR': { name: 'Euro', flag: '🇪🇺', symbol: '€' },
        'JPY': { name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
        'CAD': { name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
        'AUD': { name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
        'INR': { name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹' },
        'CHF': { name: 'Swiss Franc', flag: '🇨🇭', symbol: 'CHF' },
        'AED': { name: 'UAE Dirham', flag: '🇦🇪', symbol: 'AED' },
        'SGD': { name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
        'CNY': { name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' }
    };

    const DEFAULT_RATES = [
        { id: 'CR-001', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'USD', rate: 1.2850, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-002', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'EUR', rate: 1.1720, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-003', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'JPY', rate: 191.4500, validFrom: '2026-01-01', factor: 100 },
        { id: 'CR-004', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'CAD', rate: 1.7230, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-005', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'AUD', rate: 1.9420, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-006', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'INR', rate: 107.5000, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-007', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'CHF', rate: 1.1240, validFrom: '2026-01-01', factor: 1 },
        { id: 'CR-008', company: 'Laxmico Ltd', rateType: 'STANDARD', code: 'AED', rate: 4.7200, validFrom: '2026-01-01', factor: 1 }
    ];

    let ratesData = [];
    let currentPage = 1;
    let pageSize = 1000;
    let selectedIds = new Set();
    let editingRateId = null;

    function loadRates() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    ratesData = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error('Error loading currency rates from storage:', e);
        }
        ratesData = [...DEFAULT_RATES];
        saveRates();
    }

    function saveRates() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ratesData));
        } catch (e) {
            console.error('Error saving currency rates:', e);
        }
    }

    function getFilteredRates() {
        const companyFilter = (document.getElementById('cr-filter-company')?.value || '').trim();
        const rateTypeFilter = (document.getElementById('cr-filter-rate-type')?.value || '').trim();
        const validOnlyFilter = document.getElementById('cr-filter-valid-only')?.checked || false;
        const quickSearch = (document.getElementById('cr-quick-search')?.value || '').trim().toLowerCase();

        const todayStr = new Date().toISOString().split('T')[0];

        return ratesData.filter(r => {
            if (companyFilter && r.company !== companyFilter) return false;
            if (rateTypeFilter && r.rateType !== rateTypeFilter) return false;
            if (validOnlyFilter && r.validFrom > todayStr) return false;

            if (quickSearch) {
                const info = CURRENCY_INFO[r.code] || { name: '' };
                const matchCode = r.code.toLowerCase().includes(quickSearch);
                const matchName = info.name.toLowerCase().includes(quickSearch);
                const matchRate = String(r.rate).includes(quickSearch);
                if (!matchCode && !matchName && !matchRate) return false;
            }

            return true;
        });
    }

    function updateKPIs(filteredCount) {
        const totalEl = document.getElementById('kpi-cr-total-pairs');
        const refEl = document.getElementById('kpi-cr-ref-currency');
        const typeEl = document.getElementById('kpi-cr-rate-type');
        const badgeCount = document.getElementById('cr-badge-count');
        const companySelect = document.getElementById('cr-filter-company');
        const rateTypeSelect = document.getElementById('cr-filter-rate-type');

        if (totalEl) totalEl.textContent = `${filteredCount} Pairs`;
        if (badgeCount) badgeCount.textContent = `${filteredCount} Active Rates`;

        if (refEl) {
            const comp = companySelect?.value || 'Laxmico Ltd';
            if (comp === 'B&S International') refEl.textContent = 'EUR (€)';
            else refEl.textContent = 'GBP (£)';
        }

        if (typeEl && rateTypeSelect) {
            typeEl.textContent = rateTypeSelect.value || 'STANDARD';
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
        const tbody = document.getElementById('cr-table-body');
        const statusEl = document.getElementById('cr-record-status');
        const totalPagesEl = document.getElementById('cr-total-pages');
        const pageNumDisplay = document.getElementById('cr-current-page-display');
        const selectAllCb = document.getElementById('cr-select-all');

        if (!tbody) return;

        const filtered = getFilteredRates();
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
                        <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">No Currency Rates Found</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">No exchange rates match the selected filters or search terms.</div>
                    </td>
                </tr>
            `;
            if (statusEl) statusEl.textContent = 'Showing 0 records';
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        let html = '';

        pageRows.forEach((r, idx) => {
            const isChecked = selectedIds.has(r.id);
            const info = CURRENCY_INFO[r.code] || { name: 'Foreign Currency', flag: '🌐', symbol: '' };
            const isValid = r.validFrom <= todayStr;

            const rowBg = isChecked ? '#eef2ff' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');

            html += `
                <tr style="background: ${rowBg}; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast);" data-id="${r.id}">
                    <td style="text-align: center; padding: 12px 8px;">
                        <input type="checkbox" class="cr-row-cb" data-id="${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);">
                    </td>
                    <td style="padding: 12px 14px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 18px;">${info.flag}</span>
                            <div>
                                <div style="font-weight: 700; color: var(--color-text-main); font-size: 13px;">${r.code}</div>
                                <div style="font-size: 11.5px; color: var(--color-text-muted);">${info.name}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 12px 14px; text-align: right;">
                        <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #1e293b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--color-border-light);">
                            ${Number(r.rate).toFixed(4)}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center; font-size: 12.5px; color: var(--color-text-main);">
                        <span>📅</span> ${formatDate(r.validFrom)}
                    </td>
                    <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: var(--color-text-muted); font-size: 12.5px;">
                        ${r.factor}
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                        ${isValid 
                            ? `<span class="badge badge-success" style="padding: 4px 8px; font-size: 11px; font-weight: 600;">● Active Rate</span>` 
                            : `<span class="badge" style="background: #fef3c7; color: #b45309; padding: 4px 8px; font-size: 11px; font-weight: 600;">⏳ Scheduled</span>`}
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <button type="button" class="btn-cr-edit-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-primary);" title="Edit Currency Rate">
                                ✏️
                            </button>
                            <button type="button" class="btn-cr-del-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-danger);" title="Delete Rate">
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

        // Attach event listeners for checkboxes and row actions
        tbody.querySelectorAll('.cr-row-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderTable();
            });
        });

        tbody.querySelectorAll('.btn-cr-edit-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        tbody.querySelectorAll('.btn-cr-del-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteSingleRate(id);
            });
        });
    }

    function openEditModal(rateId) {
        editingRateId = rateId;
        const modal = document.getElementById('modal-add-currency-rate');
        const titleEl = document.getElementById('modal-cr-title');
        const codeSelect = document.getElementById('modal-cr-code');
        const rateInput = document.getElementById('modal-cr-rate');
        const factorInput = document.getElementById('modal-cr-factor');
        const dateInput = document.getElementById('modal-cr-valid-from');
        const companyInput = document.getElementById('modal-cr-company');
        const typeInput = document.getElementById('modal-cr-rate-type');

        if (!modal) return;

        const rateObj = ratesData.find(r => r.id === rateId);
        if (rateObj) {
            if (titleEl) titleEl.innerHTML = `<span>✏️</span> Edit Currency Rate (${rateObj.code})`;
            if (companyInput) companyInput.value = rateObj.company;
            if (typeInput) typeInput.value = rateObj.rateType;
            if (codeSelect) {
                codeSelect.value = rateObj.code;
                codeSelect.disabled = true; // Lock code during edit
            }
            if (rateInput) rateInput.value = rateObj.rate;
            if (factorInput) factorInput.value = rateObj.factor;
            if (dateInput) dateInput.value = rateObj.validFrom;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    function openCreateModal() {
        editingRateId = null;
        const modal = document.getElementById('modal-add-currency-rate');
        const titleEl = document.getElementById('modal-cr-title');
        const codeSelect = document.getElementById('modal-cr-code');
        const rateInput = document.getElementById('modal-cr-rate');
        const factorInput = document.getElementById('modal-cr-factor');
        const dateInput = document.getElementById('modal-cr-valid-from');
        const companyInput = document.getElementById('modal-cr-company');
        const typeInput = document.getElementById('modal-cr-rate-type');

        if (!modal) return;

        if (titleEl) titleEl.innerHTML = `<span>💱</span> Add Currency Rate`;
        if (codeSelect) {
            codeSelect.value = '';
            codeSelect.disabled = false;
        }
        if (rateInput) rateInput.value = '';
        if (factorInput) factorInput.value = '1';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

        const compVal = document.getElementById('cr-filter-company')?.value || 'Laxmico Ltd';
        const typeVal = document.getElementById('cr-filter-rate-type')?.value || 'STANDARD';
        if (companyInput) companyInput.value = compVal;
        if (typeInput) typeInput.value = typeVal;

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    function closeModal() {
        const modal = document.getElementById('modal-add-currency-rate');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        editingRateId = null;
    }

    function deleteSingleRate(id) {
        const rateObj = ratesData.find(r => r.id === id);
        const code = rateObj ? rateObj.code : 'this';
        if (!confirm(`Are you sure you want to delete the exchange rate for ${code}?`)) {
            return;
        }
        ratesData = ratesData.filter(r => r.id !== id);
        selectedIds.delete(id);
        saveRates();
        renderTable();

        if (typeof window.showToast === 'function') {
            window.showToast(`Currency Rate for ${code} deleted successfully.`, 'success');
        }
    }

    function initListeners() {
        // Company Filter -> update Ref Curr Code
        const companySelect = document.getElementById('cr-filter-company');
        const refCurrInput = document.getElementById('cr-filter-ref-curr');
        const rateTypeSelect = document.getElementById('cr-filter-rate-type');
        const typeDescInput = document.getElementById('cr-filter-type-desc');

        if (companySelect && refCurrInput) {
            companySelect.addEventListener('change', () => {
                const val = companySelect.value;
                if (val === 'B&S International') {
                    refCurrInput.value = 'EUR';
                } else {
                    refCurrInput.value = 'GBP';
                }
                currentPage = 1;
                renderTable();
            });
        }

        if (rateTypeSelect && typeDescInput) {
            rateTypeSelect.addEventListener('change', () => {
                const val = rateTypeSelect.value;
                if (val === 'STANDARD') typeDescInput.value = 'Standard Daily Spot Exchange Rate';
                else if (val === 'CUSTOMS') typeDescInput.value = 'Customs Valuation Official Rate';
                else if (val === 'CLOSING') typeDescInput.value = 'Month-End Balance Sheet Closing Rate';
                else if (val === 'BUDGET') typeDescInput.value = 'Fiscal Annual Budget Plan Rate';
                currentPage = 1;
                renderTable();
            });
        }

        // Quick Search live input
        const quickSearchInput = document.getElementById('cr-quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Apply Search button
        const btnSearch = document.getElementById('btn-cr-search');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Currency rates filtered successfully.', 'info');
                }
            });
        }

        // Reset button
        const btnReset = document.getElementById('btn-cr-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (companySelect) companySelect.value = 'Laxmico Ltd';
                if (refCurrInput) refCurrInput.value = 'GBP';
                if (rateTypeSelect) rateTypeSelect.value = 'STANDARD';
                if (typeDescInput) typeDescInput.value = 'Standard Daily Spot Exchange Rate';
                const validOnly = document.getElementById('cr-filter-valid-only');
                if (validOnly) validOnly.checked = false;
                if (quickSearchInput) quickSearchInput.value = '';

                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Filters reset to defaults.', 'info');
                }
            });
        }

        // Valid Only checkbox
        const validOnlyCb = document.getElementById('cr-filter-valid-only');
        if (validOnlyCb) {
            validOnlyCb.addEventListener('change', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('cr-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', () => {
                const filtered = getFilteredRates();
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
        document.getElementById('btn-cr-first')?.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('btn-cr-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('btn-cr-next')?.addEventListener('click', () => {
            const filtered = getFilteredRates();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        document.getElementById('btn-cr-last')?.addEventListener('click', () => {
            const filtered = getFilteredRates();
            currentPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            renderTable();
        });

        document.getElementById('cr-page-size')?.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 1000;
            currentPage = 1;
            renderTable();
        });

        // Add Rate Button
        const btnAddRow = document.getElementById('btn-cr-add-row');
        if (btnAddRow) btnAddRow.addEventListener('click', openCreateModal);

        const btnCloseModal = document.getElementById('btn-close-add-cr-modal');
        const btnCancelModal = document.getElementById('btn-cancel-add-cr');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        const modal = document.getElementById('modal-add-currency-rate');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Save Modal Form
        const btnSaveModal = document.getElementById('btn-save-add-cr');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const codeSelect = document.getElementById('modal-cr-code');
                const rateInput = document.getElementById('modal-cr-rate');
                const factorInput = document.getElementById('modal-cr-factor');
                const dateInput = document.getElementById('modal-cr-valid-from');

                const code = (codeSelect?.value || '').trim().toUpperCase();
                const rate = parseFloat(rateInput?.value || '');
                const factor = parseInt(factorInput?.value || '1', 10) || 1;
                const validFrom = (dateInput?.value || '').trim();

                if (!code) {
                    alert('Please select a Target Currency Code.');
                    codeSelect?.focus();
                    return;
                }
                if (isNaN(rate) || rate <= 0) {
                    alert('Please enter a valid positive exchange rate.');
                    rateInput?.focus();
                    return;
                }
                if (!validFrom) {
                    alert('Please select a Valid From date.');
                    dateInput?.focus();
                    return;
                }

                if (editingRateId) {
                    // Update existing
                    const idx = ratesData.findIndex(r => r.id === editingRateId);
                    if (idx !== -1) {
                        ratesData[idx].rate = rate;
                        ratesData[idx].factor = factor;
                        ratesData[idx].validFrom = validFrom;
                        saveRates();
                        closeModal();
                        renderTable();

                        if (typeof window.showToast === 'function') {
                            window.showToast(`Currency Rate for ${code} updated to ${rate.toFixed(4)}.`, 'success');
                        }
                    }
                } else {
                    // Check duplicate
                    const company = document.getElementById('modal-cr-company')?.value || 'Laxmico Ltd';
                    const rateType = document.getElementById('modal-cr-rate-type')?.value || 'STANDARD';

                    const exists = ratesData.some(r => r.company === company && r.rateType === rateType && r.code === code && r.validFrom === validFrom);
                    if (exists) {
                        alert(`A rate for ${code} with valid date ${validFrom} already exists.`);
                        return;
                    }

                    const newId = 'CR-' + String(Date.now()).slice(-4);
                    ratesData.unshift({
                        id: newId,
                        company: company,
                        rateType: rateType,
                        code: code,
                        rate: rate,
                        validFrom: validFrom,
                        factor: factor
                    });

                    saveRates();
                    closeModal();
                    renderTable();

                    if (typeof window.showToast === 'function') {
                        window.showToast(`New Currency Rate for ${code} (${rate.toFixed(4)}) created.`, 'success');
                    }
                }
            });
        }

        // Bulk Delete Action
        const btnBulkDelete = document.getElementById('btn-cr-delete');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', () => {
                if (selectedIds.size === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Please select at least one currency rate using the checkboxes.', 'warning');
                    } else {
                        alert('Please select at least one currency rate using the checkboxes.');
                    }
                    return;
                }

                const count = selectedIds.size;
                if (!confirm(`Are you sure you want to delete ${count} selected currency rate(s)?`)) {
                    return;
                }

                ratesData = ratesData.filter(r => !selectedIds.has(r.id));
                selectedIds.clear();
                saveRates();
                renderTable();

                if (typeof window.showToast === 'function') {
                    window.showToast(`${count} currency rate(s) removed successfully.`, 'success');
                }
            });
        }

        // Export CSV Action
        const btnDownload = document.getElementById('btn-cr-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const filtered = getFilteredRates();
                if (filtered.length === 0) {
                    alert('No records available to export.');
                    return;
                }

                let csv = 'Company,Rate Type,Currency Code,Currency Name,Rate,Valid From,Conversion Factor\n';
                filtered.forEach(r => {
                    const info = CURRENCY_INFO[r.code] || { name: '' };
                    csv += `"${r.company}","${r.rateType}","${r.code}","${info.name}",${r.rate},"${r.validFrom}",${r.factor}\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Currency_Rates_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('Currency rates exported to CSV successfully.', 'success');
                }
            });
        }

        // Document-level click handler for Add Currency Rate
        document.addEventListener('click', function (e) {
            const addBtn = e.target && (e.target.id === 'btn-cr-add-row' || (e.target.closest && e.target.closest('#btn-cr-add-row')));
            if (addBtn) {
                e.preventDefault();
                openCreateModal();
            }
        });
    }

    function init() {
        loadRates();
        initListeners();
        renderTable();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CurrencyRatesModule = {
        init: init,
        renderTable: renderTable,
        getFilteredRates: getFilteredRates,
        openCreateModal: openCreateModal,
        openEditModal: openEditModal,
        closeModal: closeModal,
        getRates: () => ratesData
    };
    window.openCreateCurrencyRateModal = openCreateModal;
})();
