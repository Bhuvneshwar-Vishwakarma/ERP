/**
 * payment_terms_module.js
 * 
 * Modern ERP Design for Payment Terms Master (ERP-FIN-MAS-006):
 * - Fields from screenshot:
 *   - Filters: Company, Payment Term, Search
 *   - Table: Checkbox, Payment Term, Payment Term Desc, Days to Due Date, Use Commercial Year, End of Month
 *   - Actions: + Add, Delete, Download (Export CSV)
 * - Modern ERP features:
 *   - Top KPI cards (Total Payment Terms, Standard Credit Term, EOM Schedulers, Immediate Terms)
 *   - Filter toolbar matching all screenshot fields with active Company dropdown
 *   - Modern grid table with status badges and row action buttons (Edit ✏️, Delete 🗑️)
 *   - Add / Edit Modal with enabled Company dropdown and full field validation
 *   - Pagination controls with custom page sizes (10, 25, 50, 1000/All)
 *   - LocalStorage persistence with standard commercial credit terms
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ANTIGRAVITY_ERP_PAYMENT_TERMS_V1';

    const DEFAULT_PAYMENT_TERMS = [
        {
            id: 'PT-001',
            company: 'Laxmico Ltd',
            termCode: 'NET 30',
            description: 'Payment due strictly within 30 days of invoice date',
            daysToDue: 30,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-002',
            company: 'Laxmico Ltd',
            termCode: 'NET 60',
            description: 'Payment due within 60 calendar days of supply',
            daysToDue: 60,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-003',
            company: 'Laxmico Ltd',
            termCode: 'NET 90',
            description: 'Extended credit terms for approved NHS hospital accounts',
            daysToDue: 90,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-004',
            company: 'Laxmico Ltd',
            termCode: 'COD',
            description: 'Cash on Delivery / Immediate courier collection payment',
            daysToDue: 0,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-005',
            company: 'Laxmico Ltd',
            termCode: 'PIA',
            description: 'Payment in Advance before pro-forma dispatch release',
            daysToDue: 0,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-006',
            company: 'Laxmico Ltd',
            termCode: 'EOM 30',
            description: 'Payment due 30 days following the end of the billing month',
            daysToDue: 30,
            useCommercialYear: 'No',
            endOfMonth: 'Yes',
            status: 'Active'
        },
        {
            id: 'PT-007',
            company: 'Laxmico Ltd',
            termCode: 'EOM 60',
            description: 'Payment due 60 days following the end of the billing month',
            daysToDue: 60,
            useCommercialYear: 'No',
            endOfMonth: 'Yes',
            status: 'Active'
        },
        {
            id: 'PT-008',
            company: 'Laxmico Ltd',
            termCode: 'COMM-360-30',
            description: 'Commercial 360-day calendar standard (30 days per month)',
            daysToDue: 30,
            useCommercialYear: 'Yes',
            endOfMonth: 'No',
            status: 'Active'
        },
        {
            id: 'PT-009',
            company: 'Laxmico Ltd',
            termCode: '2/10 NET 30',
            description: '2% prompt cash settlement discount if paid in 10 days, Net 30',
            daysToDue: 30,
            useCommercialYear: 'No',
            endOfMonth: 'No',
            status: 'Active'
        }
    ];

    let termsData = [];
    let currentPage = 1;
    let pageSize = 1000;
    let selectedIds = new Set();
    let editingTermId = null;

    function loadPaymentTerms() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                termsData = JSON.parse(raw);
            } else {
                termsData = JSON.parse(JSON.stringify(DEFAULT_PAYMENT_TERMS));
                savePaymentTerms();
            }
        } catch (e) {
            console.warn('[PaymentTerms] Error reading from localStorage, using seed data', e);
            termsData = JSON.parse(JSON.stringify(DEFAULT_PAYMENT_TERMS));
        }
    }

    function savePaymentTerms() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(termsData));
        } catch (e) {
            console.error('[PaymentTerms] Error saving to localStorage', e);
        }
    }

    function getFilteredTerms() {
        const compFilter = document.getElementById('pt-filter-company')?.value || '';
        const termFilter = (document.getElementById('pt-filter-term')?.value || '').trim().toLowerCase();
        const quickSearch = (document.getElementById('pt-quick-search')?.value || '').trim().toLowerCase();

        return termsData.filter(t => {
            if (compFilter && compFilter !== 'Select Company' && t.company !== compFilter) {
                return false;
            }
            if (termFilter && !t.termCode.toLowerCase().includes(termFilter) && !t.description.toLowerCase().includes(termFilter)) {
                return false;
            }
            if (quickSearch) {
                const combined = `${t.termCode} ${t.description} ${t.daysToDue} ${t.useCommercialYear} ${t.endOfMonth}`.toLowerCase();
                if (!combined.includes(quickSearch)) return false;
            }
            return true;
        });
    }

    function updateKPIs(filteredCount) {
        const totalEl = document.getElementById('kpi-pt-total');
        const badgeCount = document.getElementById('pt-badge-count');
        const eomEl = document.getElementById('kpi-pt-eom');
        const kpiDashboardPayterms = document.getElementById('kpi-fin-payterms');

        if (totalEl) totalEl.textContent = `${filteredCount} Payment Terms`;
        if (badgeCount) badgeCount.textContent = `${filteredCount} Active Terms`;
        if (kpiDashboardPayterms) kpiDashboardPayterms.textContent = String(termsData.length);

        const eomCount = termsData.filter(t => t.endOfMonth === 'Yes').length;
        if (eomEl) eomEl.textContent = `${eomCount} EOM Schedulers`;
    }

    function renderTable() {
        const tbody = document.getElementById('pt-table-body');
        const statusEl = document.getElementById('pt-record-status');
        const totalPagesEl = document.getElementById('pt-total-pages');
        const pageNumDisplay = document.getElementById('pt-current-page-display');
        const selectAllCb = document.getElementById('pt-select-all');

        if (!tbody) return;

        const filtered = getFilteredTerms();
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
                        <div style="font-size: 32px; margin-bottom: 8px;">📜</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">No Payment Terms Found</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">No payment terms match your active filter criteria.</div>
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

            const commYearPill = r.useCommercialYear === 'Yes'
                ? '<span class="badge badge-success" style="font-size: 11px; padding: 2px 7px;">Yes</span>'
                : '<span class="badge" style="background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 7px;">No</span>';

            const eomPill = r.endOfMonth === 'Yes'
                ? '<span class="badge badge-warning" style="font-size: 11px; padding: 2px 7px;">Yes</span>'
                : '<span class="badge" style="background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 7px;">No</span>';

            let daysBadge = `<span style="font-family: monospace; font-size: 12.5px; font-weight: 700; color: #1e40af; background: #dbeafe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">${r.daysToDue} Days</span>`;
            if (r.daysToDue === 0) {
                daysBadge = `<span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #047857; background: #dcfce7; padding: 2px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">0 (Immediate)</span>`;
            }

            html += `
                <tr style="background: ${rowBg}; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast);" data-id="${r.id}">
                    <td style="text-align: center; padding: 12px 8px; width: 44px;">
                        <input type="checkbox" class="pt-row-cb" data-id="${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);">
                    </td>
                    <td style="padding: 12px 14px; width: 160px;">
                        <span class="badge" style="background: #f1f5f9; color: var(--color-primary); font-weight: 700; font-size: 12px; padding: 4px 8px; border: 1px solid var(--color-border-light); border-radius: 4px; font-family: monospace;">
                            ${r.termCode}
                        </span>
                    </td>
                    <td style="padding: 12px 14px; font-weight: 600; color: var(--color-text-main); font-size: 12.5px;">
                        ${r.description}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 140px;">
                        ${daysBadge}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 160px;">
                        ${commYearPill}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 130px;">
                        ${eomPill}
                    </td>
                    <td style="padding: 12px 14px; text-align: center; width: 100px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <button type="button" class="btn-pt-edit-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-primary);" title="Edit Payment Term">
                                ✏️
                            </button>
                            <button type="button" class="btn-pt-del-row" data-id="${r.id}" style="background: none; border: 1px solid var(--color-border-light); width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-danger);" title="Delete Payment Term">
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
        tbody.querySelectorAll('.pt-row-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderTable();
            });
        });

        // Edit row handler
        tbody.querySelectorAll('.btn-pt-edit-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Delete row handler
        tbody.querySelectorAll('.btn-pt-del-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                deleteSingleTerm(id);
            });
        });
    }

    function openEditModal(termId) {
        editingTermId = termId;
        const modal = document.getElementById('modal-add-payment-term');
        const titleEl = document.getElementById('modal-pt-title');
        const compSelect = document.getElementById('modal-pt-company');
        const termInput = document.getElementById('modal-pt-term');
        const descInput = document.getElementById('modal-pt-desc');
        const daysInput = document.getElementById('modal-pt-days');
        const commSelect = document.getElementById('modal-pt-commercial-year');
        const eomSelect = document.getElementById('modal-pt-eom');
        const statusSelect = document.getElementById('modal-pt-status');

        if (!modal) return;

        const term = termsData.find(t => t.id === termId);
        if (term) {
            if (titleEl) titleEl.innerHTML = `<span>✏️</span> Edit Payment Term (${term.termCode})`;
            if (compSelect) {
                compSelect.value = term.company || 'Laxmico Ltd';
                compSelect.disabled = false;
            }
            if (termInput) {
                termInput.value = term.termCode;
                termInput.disabled = true; // Lock code in edit
            }
            if (descInput) descInput.value = term.description;
            if (daysInput) daysInput.value = term.daysToDue;
            if (commSelect) commSelect.value = term.useCommercialYear || 'No';
            if (eomSelect) eomSelect.value = term.endOfMonth || 'No';
            if (statusSelect) statusSelect.value = term.status || 'Active';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function openCreateModal() {
        editingTermId = null;
        const modal = document.getElementById('modal-add-payment-term');
        const titleEl = document.getElementById('modal-pt-title');
        const compSelect = document.getElementById('modal-pt-company');
        const termInput = document.getElementById('modal-pt-term');
        const descInput = document.getElementById('modal-pt-desc');
        const daysInput = document.getElementById('modal-pt-days');
        const commSelect = document.getElementById('modal-pt-commercial-year');
        const eomSelect = document.getElementById('modal-pt-eom');
        const statusSelect = document.getElementById('modal-pt-status');

        if (!modal) {
            console.error('modal-add-payment-term not found');
            return;
        }

        if (titleEl) titleEl.innerHTML = `<span>📜</span> Add Payment Term`;
        if (compSelect) {
            const curFilterComp = document.getElementById('pt-filter-company')?.value;
            compSelect.value = (curFilterComp && curFilterComp !== 'Select Company') ? curFilterComp : 'Laxmico Ltd';
            compSelect.disabled = false;
        }
        if (termInput) {
            termInput.value = '';
            termInput.disabled = false;
        }
        if (descInput) descInput.value = '';
        if (daysInput) daysInput.value = '30';
        if (commSelect) commSelect.value = 'No';
        if (eomSelect) eomSelect.value = 'No';
        if (statusSelect) statusSelect.value = 'Active';

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';
    }

    function closeModal() {
        const modal = document.getElementById('modal-add-payment-term');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        editingTermId = null;
    }

    function deleteSingleTerm(id) {
        const term = termsData.find(t => t.id === id);
        const name = term ? term.termCode : 'this term';
        if (!confirm(`Are you sure you want to delete Payment Term '${name}'?`)) {
            return;
        }
        termsData = termsData.filter(t => t.id !== id);
        selectedIds.delete(id);
        savePaymentTerms();
        renderTable();

        if (typeof window.showToast === 'function') {
            window.showToast(`Payment Term '${name}' deleted successfully.`, 'success');
        }
    }

    function initListeners() {
        // Quick Search input
        const quickSearchInput = document.getElementById('pt-quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Apply Search button
        const btnSearch = document.getElementById('btn-pt-search');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Payment terms filtered successfully.', 'info');
                }
            });
        }

        // Reset button
        const btnReset = document.getElementById('btn-pt-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const comp = document.getElementById('pt-filter-company');
                const term = document.getElementById('pt-filter-term');
                if (comp) comp.value = 'Laxmico Ltd';
                if (term) term.value = '';
                if (quickSearchInput) quickSearchInput.value = '';

                currentPage = 1;
                renderTable();
                if (typeof window.showToast === 'function') {
                    window.showToast('Payment term filters reset.', 'info');
                }
            });
        }

        // Company filter dropdown change
        const compSelect = document.getElementById('pt-filter-company');
        if (compSelect) {
            compSelect.addEventListener('change', () => {
                currentPage = 1;
                renderTable();
            });
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('pt-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', () => {
                const filtered = getFilteredTerms();
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
        document.getElementById('btn-pt-first')?.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('btn-pt-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('btn-pt-next')?.addEventListener('click', () => {
            const filtered = getFilteredTerms();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        document.getElementById('btn-pt-last')?.addEventListener('click', () => {
            const filtered = getFilteredTerms();
            currentPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            renderTable();
        });

        document.getElementById('pt-page-size')?.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 1000;
            currentPage = 1;
            renderTable();
        });

        // Add Payment Term button & Modal controls
        const btnAddRow = document.getElementById('btn-pt-add-row');
        if (btnAddRow) btnAddRow.addEventListener('click', openCreateModal);

        const btnCloseModal = document.getElementById('btn-close-add-pt-modal');
        const btnCancelModal = document.getElementById('btn-cancel-add-pt');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        const modal = document.getElementById('modal-add-payment-term');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Save Modal Form
        const btnSaveModal = document.getElementById('btn-save-add-pt');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const compSelect = document.getElementById('modal-pt-company');
                const termInput = document.getElementById('modal-pt-term');
                const descInput = document.getElementById('modal-pt-desc');
                const daysInput = document.getElementById('modal-pt-days');
                const commSelect = document.getElementById('modal-pt-commercial-year');
                const eomSelect = document.getElementById('modal-pt-eom');
                const statusSelect = document.getElementById('modal-pt-status');

                const company = (compSelect?.value || 'Laxmico Ltd').trim();
                const termCode = (termInput?.value || '').trim().toUpperCase();
                const desc = (descInput?.value || '').trim();
                const daysToDue = parseInt(daysInput?.value || '0', 10);
                const useCommercialYear = commSelect?.value || 'No';
                const endOfMonth = eomSelect?.value || 'No';
                const status = statusSelect?.value || 'Active';

                if (!termCode) {
                    alert('Please enter a Payment Term Code (e.g. NET 30).');
                    termInput?.focus();
                    return;
                }
                if (!desc) {
                    alert('Please enter a Payment Term Description.');
                    descInput?.focus();
                    return;
                }

                if (editingTermId) {
                    const idx = termsData.findIndex(t => t.id === editingTermId);
                    if (idx !== -1) {
                        termsData[idx].company = company;
                        termsData[idx].description = desc;
                        termsData[idx].daysToDue = daysToDue;
                        termsData[idx].useCommercialYear = useCommercialYear;
                        termsData[idx].endOfMonth = endOfMonth;
                        termsData[idx].status = status;

                        savePaymentTerms();
                        closeModal();
                        renderTable();

                        if (typeof window.showToast === 'function') {
                            window.showToast(`Payment Term '${termCode}' updated successfully.`, 'success');
                        }
                    }
                } else {
                    const exists = termsData.some(t => t.company === company && t.termCode === termCode);
                    if (exists) {
                        alert(`Payment Term '${termCode}' already exists for ${company}.`);
                        return;
                    }

                    const newId = 'PT-' + String(Date.now()).slice(-4);
                    termsData.unshift({
                        id: newId,
                        company: company,
                        termCode: termCode,
                        description: desc,
                        daysToDue: daysToDue,
                        useCommercialYear: useCommercialYear,
                        endOfMonth: endOfMonth,
                        status: status
                    });

                    savePaymentTerms();
                    closeModal();
                    renderTable();

                    if (typeof window.showToast === 'function') {
                        window.showToast(`New Payment Term '${termCode}' created successfully.`, 'success');
                    }
                }
            });
        }

        // Bulk Delete
        const btnBulkDelete = document.getElementById('btn-pt-delete');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', () => {
                if (selectedIds.size === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Please select at least one payment term using the checkboxes.', 'warning');
                    } else {
                        alert('Please select at least one payment term using the checkboxes.');
                    }
                    return;
                }

                const count = selectedIds.size;
                if (!confirm(`Are you sure you want to delete ${count} selected payment term(s)?`)) {
                    return;
                }

                termsData = termsData.filter(t => !selectedIds.has(t.id));
                selectedIds.clear();
                savePaymentTerms();
                renderTable();

                if (typeof window.showToast === 'function') {
                    window.showToast(`${count} payment term(s) removed successfully.`, 'success');
                }
            });
        }

        // Export CSV
        const btnDownload = document.getElementById('btn-pt-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const filtered = getFilteredTerms();
                if (filtered.length === 0) {
                    alert('No records available to export.');
                    return;
                }

                let csv = 'Company,Payment Term,Description,Days to Due Date,Use Commercial Year,End of Month,Status\n';
                filtered.forEach(t => {
                    csv += `"${t.company}","${t.termCode}","${t.description}",${t.daysToDue},"${t.useCommercialYear}","${t.endOfMonth}","${t.status}"\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Payment_Terms_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('Payment terms exported to CSV successfully.', 'success');
                }
            });
        }

        // Document-level delegation for Add Payment Term button
        document.addEventListener('click', function (e) {
            const addBtn = e.target && (e.target.id === 'btn-pt-add-row' || (e.target.closest && e.target.closest('#btn-pt-add-row')));
            if (addBtn) {
                e.preventDefault();
                openCreateModal();
            }
        });
    }

    function init() {
        loadPaymentTerms();
        initListeners();
        renderTable();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PaymentTermsModule = {
        init: init,
        renderTable: renderTable,
        getFilteredTerms: getFilteredTerms,
        openCreateModal: openCreateModal,
        openEditModal: openEditModal,
        closeModal: closeModal,
        getPaymentTerms: () => termsData
    };
    window.openCreatePaymentTermModal = openCreateModal;
})();
