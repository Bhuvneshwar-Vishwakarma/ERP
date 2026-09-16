/**
 * finance_mock.js
 * 
 * Mock data and logic for the Finance Accounts Setup modules:
 * 1. Chart of Accounts
 * 2. Chart of Cost Centers
 * 3. Account Category
 * 4. Currency
 * 5. Mode of Payment
 * 6. Payment Term
 * 7. Journal Entry Template
 * 8. Terms and Conditions
 */

function initFinanceMock() {

    // -------------------------------------------------------------------------
    // 1. Chart of Accounts (Tree)
    // -------------------------------------------------------------------------
    const coaData = [
        {
            name: "Assets", type: "Asset", isGroup: true, children: [
                { name: "Current Assets", type: "Asset", isGroup: true, children: [
                    { name: "Bank Accounts", type: "Bank", isGroup: true, children: [
                        { name: "Main Business Account (BNS)", type: "Bank", isGroup: false },
                        { name: "Payroll Account (BNS)", type: "Bank", isGroup: false }
                    ]},
                    { name: "Cash in Hand", type: "Cash", isGroup: false },
                    { name: "Accounts Receivable", type: "Receivable", isGroup: false }
                ]},
                { name: "Fixed Assets", type: "Asset", isGroup: true, children: [
                    { name: "Computers and Equipment", type: "Asset", isGroup: false },
                    { name: "Furniture and Fixtures", type: "Asset", isGroup: false }
                ]}
            ]
        },
        {
            name: "Liabilities", type: "Liability", isGroup: true, children: [
                { name: "Current Liabilities", type: "Liability", isGroup: true, children: [
                    { name: "Accounts Payable", type: "Payable", isGroup: false },
                    { name: "Duties and Taxes", type: "Tax", isGroup: false }
                ]}
            ]
        },
        {
            name: "Equity", type: "Equity", isGroup: true, children: [
                { name: "Capital Stock", type: "Equity", isGroup: false },
                { name: "Retained Earnings", type: "Equity", isGroup: false }
            ]
        },
        {
            name: "Income", type: "Income", isGroup: true, children: [
                { name: "Direct Income", type: "Income", isGroup: true, children: [
                    { name: "Sales", type: "Income", isGroup: false },
                    { name: "Service Revenue", type: "Income", isGroup: false }
                ]}
            ]
        },
        {
            name: "Expenses", type: "Expense", isGroup: true, children: [
                { name: "Direct Expenses", type: "Expense", isGroup: true, children: [
                    { name: "Cost of Goods Sold", type: "Expense", isGroup: false }
                ]},
                { name: "Indirect Expenses", type: "Expense", isGroup: true, children: [
                    { name: "Rent", type: "Expense", isGroup: false },
                    { name: "Salaries", type: "Expense", isGroup: false },
                    { name: "Utilities", type: "Expense", isGroup: false }
                ]}
            ]
        }
    ];

    function renderTree(data, container, isRoot = false) {
        if (!data) return null;
        if (isRoot && container) container.innerHTML = '';
        
        const ul = document.createElement('ul');
        ul.className = isRoot ? 'erp-tree-root' : 'erp-tree-branch';
        if (!isRoot) {
            ul.style.listStyleType = 'none';
            ul.style.paddingLeft = '24px';
            ul.style.borderLeft = '1px solid #e5e7eb';
            ul.style.marginLeft = '8px';
            ul.style.display = 'block'; // Expanded by default
        } else {
            ul.style.listStyleType = 'none';
            ul.style.paddingLeft = '0';
        }

        data.forEach(item => {
            const li = document.createElement('li');
            li.style.margin = '4px 0';
            
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'erp-tree-node';
            nodeDiv.style.display = 'flex';
            nodeDiv.style.alignItems = 'center';
            nodeDiv.style.padding = '6px 8px';
            nodeDiv.style.borderRadius = '4px';
            nodeDiv.style.cursor = 'pointer';
            nodeDiv.style.transition = 'background-color 0.2s';
            
            nodeDiv.onmouseover = () => nodeDiv.style.backgroundColor = '#f3f4f6';
            nodeDiv.onmouseout = () => nodeDiv.style.backgroundColor = 'transparent';

            // Expander Icon
            const expander = document.createElement('span');
            expander.style.width = '16px';
            expander.style.height = '16px';
            expander.style.display = 'inline-flex';
            expander.style.alignItems = 'center';
            expander.style.justifyContent = 'center';
            expander.style.marginRight = '8px';
            expander.style.fontSize = '12px';
            expander.style.color = '#6b7280';
            
            if (item.isGroup && item.children && item.children.length > 0) {
                expander.innerHTML = '▼';
                expander.onclick = (e) => {
                    e.stopPropagation();
                    const childUl = li.querySelector('ul');
                    if (childUl) {
                        if (childUl.style.display === 'none') {
                            childUl.style.display = 'block';
                            expander.innerHTML = '▼';
                        } else {
                            childUl.style.display = 'none';
                            expander.innerHTML = '▶';
                        }
                    }
                };
            } else {
                expander.innerHTML = '•'; // Dot for leaf nodes
            }
            nodeDiv.appendChild(expander);

            // Folder/File Icon
            const icon = document.createElement('span');
            icon.style.marginRight = '8px';
            icon.style.color = item.isGroup ? '#3b82f6' : '#9ca3af';
            icon.innerHTML = item.isGroup ? '📁' : '📄';
            nodeDiv.appendChild(icon);

            // Label
            const label = document.createElement('span');
            label.textContent = item.name;
            label.style.fontWeight = item.isGroup ? '600' : '400';
            label.style.fontSize = '13px';
            label.style.color = '#1f2937';
            nodeDiv.appendChild(label);

            li.appendChild(nodeDiv);

            if (item.isGroup && item.children) {
                const childUl = renderTree(item.children, null, false);
                li.appendChild(childUl);
            }

            ul.appendChild(li);
        });

        if (container) {
            container.appendChild(ul);
        }
        return ul;
    }

    const coaContainer = document.getElementById('finance-coa-tree');
    if (coaContainer) {
        renderTree(coaData, coaContainer, true);
    }

    // -------------------------------------------------------------------------
    // 2. Chart of Cost Centers (Complete Interactive Module)
    // -------------------------------------------------------------------------
    const CostCenterModule = {
        STORAGE_KEY: 'ANTIGRAVITY_ERP_COST_CENTERS_V1',
        currentView: 'tree',
        searchTerm: '',
        deptFilter: '',
        statusFilter: '',
        editingCode: null,
        collapsedNodes: new Set(),

        defaults: [
            { code: "CC-MAIN", name: "B&S (UK) - Main Company", parent: null, isGroup: true, department: "Corporate", budget: 1500000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-ADMIN", name: "General Administration", parent: "CC-MAIN", isGroup: false, department: "Administration", budget: 180000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-SALES", name: "Sales & Distribution", parent: "CC-MAIN", isGroup: true, department: "Sales", budget: 350000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-UK-SALES", name: "UK Domestic Sales", parent: "CC-SALES", isGroup: false, department: "Sales", budget: 220000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-EXPORT", name: "International Export", parent: "CC-SALES", isGroup: false, department: "Sales", budget: 130000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-MKTG", name: "Marketing & Growth", parent: "CC-MAIN", isGroup: false, department: "Marketing", budget: 120000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-OPS", name: "Operations & Warehousing", parent: "CC-MAIN", isGroup: true, department: "Operations", budget: 450000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-LON", name: "London Logistics Hub", parent: "CC-OPS", isGroup: false, department: "Logistics", budget: 260000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-MAN", name: "Manchester Depot", parent: "CC-OPS", isGroup: false, department: "Warehousing", budget: 190000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-RD", name: "Product Development & QA", parent: "CC-MAIN", isGroup: false, department: "Product Dev", budget: 220000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" },
            { code: "CC-FIN", name: "Finance & Accounting", parent: "CC-MAIN", isGroup: false, department: "Finance", budget: 180000, validFrom: "2026-01-01", validUntil: "2030-12-31", status: "Active" }
        ],

        items: [],

        init() {
            this.loadData();
            this.bindEvents();
            this.render();
        },

        loadData() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    this.items = JSON.parse(stored);
                    // Ensure validFrom and validUntil exist
                    this.items.forEach(c => {
                        if (!c.validFrom) c.validFrom = '2026-01-01';
                        if (!c.validUntil) c.validUntil = '2030-12-31';
                    });
                } else {
                    this.items = JSON.parse(JSON.stringify(this.defaults));
                    this.saveData();
                }
            } catch (e) {
                console.warn("Failed to read cost centers from localStorage, using defaults", e);
                this.items = JSON.parse(JSON.stringify(this.defaults));
            }
        },

        saveData() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
            } catch (e) {
                console.error("Failed to save cost centers", e);
            }
        },

        notify(msg, type = 'info') {
            if (typeof window.showToast === 'function') {
                window.showToast(msg, type);
            } else {
                console.log(`[CostCenter] [${type}] ${msg}`);
            }
        },

        formatCurrency(num) {
            const n = parseFloat(num) || 0;
            return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        },

        updateKPIs() {
            const totalEl = document.getElementById('kpi-cost-total');
            const groupsEl = document.getElementById('kpi-cost-groups');
            const leafsEl = document.getElementById('kpi-cost-leafs');
            const budgetEl = document.getElementById('kpi-cost-budget');

            const total = this.items.length;
            const groups = this.items.filter(c => c.isGroup).length;
            const leafs = total - groups;
            const totalBudget = this.items.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);

            if (totalEl) totalEl.textContent = total;
            if (groupsEl) groupsEl.textContent = groups;
            if (leafsEl) leafsEl.textContent = leafs;
            if (budgetEl) budgetEl.textContent = this.formatCurrency(totalBudget);
        },

        getFilteredItems() {
            let list = this.items;
            if (this.searchTerm) {
                const q = this.searchTerm.toLowerCase();
                list = list.filter(item => 
                    item.code.toLowerCase().includes(q) ||
                    item.name.toLowerCase().includes(q) ||
                    (item.department && item.department.toLowerCase().includes(q))
                );
            }
            if (this.deptFilter) {
                list = list.filter(item => item.department === this.deptFilter);
            }
            if (this.statusFilter) {
                list = list.filter(item => item.status === this.statusFilter);
            }
            return list;
        },

        render() {
            this.updateKPIs();
            const treeContainer = document.getElementById('cost-tree-container');
            const listContainer = document.getElementById('fin-cost-list-container');

            if (this.currentView === 'tree') {
                if (treeContainer) treeContainer.style.display = 'block';
                if (listContainer) listContainer.style.display = 'none';
                this.renderTree();
            } else {
                if (treeContainer) treeContainer.style.display = 'none';
                if (listContainer) listContainer.style.display = 'block';
                this.renderList();
            }
        },

        renderTree() {
            const container = document.getElementById('finance-cost-tree');
            if (!container) return;

            // Build hierarchical map
            const childrenMap = {};
            this.items.forEach(c => {
                const p = c.parent || '__root__';
                if (!childrenMap[p]) childrenMap[p] = [];
                childrenMap[p].push(c);
            });

            // Filter logic for tree view
            const isFilterActive = !!(this.searchTerm || this.deptFilter || this.statusFilter);
            let matchingCodes = new Set();

            if (isFilterActive) {
                const filtered = this.getFilteredItems();
                filtered.forEach(item => {
                    matchingCodes.add(item.code);
                    // Add ancestors
                    let cur = item;
                    while (cur && cur.parent) {
                        matchingCodes.add(cur.parent);
                        cur = this.items.find(x => x.code === cur.parent);
                    }
                });
            }

            const buildBranchHtml = (parentKey) => {
                const children = childrenMap[parentKey] || [];
                if (!children.length) return '';

                let html = `<ul class="erpnext-coa-branch" style="list-style: none; margin: 0 0 0 22px; padding: 0; border-left: 1px dashed #cbd5e1;">`;
                children.forEach(node => {
                    if (isFilterActive && !matchingCodes.has(node.code)) {
                        return;
                    }

                    const hasChildren = (childrenMap[node.code] && childrenMap[node.code].length > 0);
                    const isCollapsed = this.collapsedNodes.has(node.code);
                    const expanderIcon = (hasChildren || node.isGroup) ? (isCollapsed ? '▶' : '▼') : '•';
                    const expanderClass = (hasChildren || node.isGroup) ? 'style="cursor: pointer; display: inline-block; width: 18px; text-align: center; color: #64748b; font-size: 11px;"' : 'style="display: inline-block; width: 18px; text-align: center; color: #cbd5e1;"';

                    const typeBadge = node.isGroup ? 
                        `<span style="background: #eef2ff; color: #4338ca; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">GROUP</span>` : 
                        `<span style="background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">POSTING</span>`;

                    const deptBadge = node.department ? 
                        `<span style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-size: 11px; padding: 1px 6px; border-radius: 4px; margin-left: 8px;">📂 ${node.department}</span>` : '';

                    const budgetBadge = node.budget ? 
                        `<span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 4px; margin-left: 8px;">${this.formatCurrency(node.budget)}</span>` : '';

                    const validityBadge = (node.validFrom || node.validUntil) ? 
                        `<span style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-size: 10.5px; padding: 1px 6px; border-radius: 4px; margin-left: 8px;" title="Validity Period">📅 ${node.validFrom || '—'} → ${node.validUntil || '—'}</span>` : '';

                    const statusPill = node.status === 'Active' ? 
                        `<span class="badge badge-success" style="font-size: 10px; padding: 2px 6px; margin-left: 8px;">Active</span>` : 
                        `<span class="badge badge-warning" style="font-size: 10px; padding: 2px 6px; margin-left: 8px;">Inactive</span>`;

                    const actionButtons = `
                        <div class="erpnext-coa-node-actions" style="margin-left: auto; display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s ease;">
                            ${node.isGroup ? `<button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.openAddChild('${node.code}')" title="Add Child Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fff; border: 1px solid #cbd5e1;">+ Child</button>` : ''}
                            <button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.openEdit('${node.code}')" title="Edit Cost Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fff; border: 1px solid #cbd5e1;">✏️ Edit</button>
                            <button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.deleteCostCenter('${node.code}')" title="Delete Cost Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;">🗑️</button>
                        </div>
                    `;

                    html += `
                        <li class="erpnext-coa-node" data-code="${node.code}" style="margin: 3px 0;">
                            <div class="erpnext-coa-node-row" style="display: flex; align-items: center; padding: 5px 8px; border-radius: 6px; transition: background-color 0.15s ease; cursor: default;">
                                <span class="erp-node-expander" onclick="CostCenterModule.toggleNode('${node.code}')" ${expanderClass}>${expanderIcon}</span>
                                <span style="font-size: 14px; margin-right: 6px;">${node.isGroup ? '📁' : '🏢'}</span>
                                <span class="erpnext-coa-code" style="font-weight: 700; color: #1e293b; font-size: 12.5px; font-family: monospace; margin-right: 6px;">${node.code}</span>
                                <span class="erpnext-coa-name" style="font-size: 13px; font-weight: ${node.isGroup ? '600' : '500'}; color: #334155;">${node.name}</span>
                                ${typeBadge}
                                ${deptBadge}
                                ${budgetBadge}
                                ${validityBadge}
                                ${statusPill}
                                ${actionButtons}
                            </div>
                            <div id="cost-branch-${node.code}" style="display: ${isCollapsed ? 'none' : 'block'};">
                                ${buildBranchHtml(node.code)}
                            </div>
                        </li>
                    `;
                });
                html += `</ul>`;
                return html;
            };

            const rootItems = this.items.filter(c => !c.parent || !this.items.some(p => p.code === c.parent));
            let rootHtml = `<ul style="list-style: none; margin: 0; padding: 0;">`;
            
            if (rootItems.length === 0) {
                rootHtml += `<li style="padding: 30px; text-align: center; color: #94a3b8;">No cost centers found matching criteria.</li>`;
            } else {
                rootItems.forEach(root => {
                    if (isFilterActive && !matchingCodes.has(root.code)) {
                        return;
                    }

                    const hasChildren = (childrenMap[root.code] && childrenMap[root.code].length > 0);
                    const isCollapsed = this.collapsedNodes.has(root.code);
                    const expanderIcon = (hasChildren || root.isGroup) ? (isCollapsed ? '▶' : '▼') : '•';
                    const expanderClass = (hasChildren || root.isGroup) ? 'style="cursor: pointer; display: inline-block; width: 18px; text-align: center; color: #64748b; font-size: 11px;"' : 'style="display: inline-block; width: 18px; text-align: center; color: #cbd5e1;"';

                    const rootValidityBadge = (root.validFrom || root.validUntil) ? 
                        `<span style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-size: 10.5px; padding: 1px 6px; border-radius: 4px; margin-left: 8px;" title="Validity Period">📅 ${root.validFrom || '—'} → ${root.validUntil || '—'}</span>` : '';

                    const actionButtons = `
                        <div class="erpnext-coa-node-actions" style="margin-left: auto; display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s ease;">
                            ${root.isGroup ? `<button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.openAddChild('${root.code}')" title="Add Child Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fff; border: 1px solid #cbd5e1;">+ Child</button>` : ''}
                            <button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.openEdit('${root.code}')" title="Edit Cost Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fff; border: 1px solid #cbd5e1;">✏️ Edit</button>
                            <button class="btn btn-secondary erpnext-coa-btn" onclick="CostCenterModule.deleteCostCenter('${root.code}')" title="Delete Cost Center" style="padding: 2px 8px; font-size: 11px; height: 24px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;">🗑️</button>
                        </div>
                    `;

                    rootHtml += `
                        <li class="erpnext-coa-node" data-code="${root.code}" style="margin: 4px 0;">
                            <div class="erpnext-coa-node-row" style="display: flex; align-items: center; padding: 6px 10px; border-radius: 6px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
                                <span class="erp-node-expander" onclick="CostCenterModule.toggleNode('${root.code}')" ${expanderClass}>${expanderIcon}</span>
                                <span style="font-size: 15px; margin-right: 6px;">🏛️</span>
                                <span class="erpnext-coa-code" style="font-weight: 700; color: #0f172a; font-size: 13px; font-family: monospace; margin-right: 8px;">${root.code}</span>
                                <span class="erpnext-coa-name" style="font-size: 13.5px; font-weight: 700; color: #0f172a;">${root.name}</span>
                                <span style="background: #e0e7ff; color: #3730a3; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">ROOT</span>
                                ${root.budget ? `<span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 4px; margin-left: 8px;">${this.formatCurrency(root.budget)}</span>` : ''}
                                ${rootValidityBadge}
                                <span class="badge badge-success" style="font-size: 10px; padding: 2px 6px; margin-left: 8px;">${root.status}</span>
                                ${actionButtons}
                            </div>
                            <div id="cost-branch-${root.code}" style="display: ${isCollapsed ? 'none' : 'block'};">
                                ${buildBranchHtml(root.code)}
                            </div>
                        </li>
                    `;
                });
            }
            rootHtml += `</ul>`;

            container.innerHTML = rootHtml;

            // Bind hover styles for node rows
            container.querySelectorAll('.erpnext-coa-node-row').forEach(row => {
                row.addEventListener('mouseenter', () => {
                    const acts = row.querySelector('.erpnext-coa-node-actions');
                    if (acts) acts.style.opacity = '1';
                    row.style.backgroundColor = '#f1f5f9';
                });
                row.addEventListener('mouseleave', () => {
                    const acts = row.querySelector('.erpnext-coa-node-actions');
                    if (acts) acts.style.opacity = '0';
                    row.style.backgroundColor = row.parentElement.parentElement === container.firstElementChild ? '#f8fafc' : 'transparent';
                });
            });
        },

        toggleNode(code) {
            const branch = document.getElementById(`cost-branch-${code}`);
            if (!branch) return;
            if (this.collapsedNodes.has(code)) {
                this.collapsedNodes.delete(code);
            } else {
                this.collapsedNodes.add(code);
            }
            this.renderTree();
        },

        renderList() {
            const tbody = document.getElementById('fin-cost-list-body');
            const countEl = document.getElementById('cost-table-record-count');
            if (!tbody) return;

            const filtered = this.getFilteredItems();
            if (countEl) countEl.textContent = `Showing ${filtered.length} of ${this.items.length} records`;

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 32px; color: #94a3b8;">No matching cost centers found.</td></tr>`;
                return;
            }

            let html = '';
            filtered.forEach(item => {
                const parentItem = this.items.find(p => p.code === item.parent);
                const parentText = parentItem ? `${parentItem.code} (${parentItem.name})` : '<span style="color:#94a3b8;">— (Top Level)</span>';
                const typeBadge = item.isGroup ? 
                    `<span style="background: #eef2ff; color: #4338ca; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px;">Group</span>` : 
                    `<span style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px;">Posting</span>`;
                const statusBadge = item.status === 'Active' ? 
                    `<span class="badge badge-success" style="font-size: 11px; padding: 3px 8px;">Active</span>` : 
                    `<span class="badge badge-warning" style="font-size: 11px; padding: 3px 8px;">Inactive</span>`;

                html += `
                    <tr style="border-bottom: 1px solid var(--color-border-light); transition: background-color 0.15s ease;">
                        <td style="padding: 10px 12px; font-weight: 700; font-family: monospace; color: #1e293b;">${item.code}</td>
                        <td style="padding: 10px 12px; font-weight: 500; color: #334155;">
                            ${item.isGroup ? '📁' : '🏢'} ${item.name}
                        </td>
                        <td style="padding: 10px 12px; color: #475569;">${item.department || '—'}</td>
                        <td style="padding: 10px 12px; color: #64748b; font-size: 12px;">${parentText}</td>
                        <td style="padding: 10px 12px;">${typeBadge}</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">${this.formatCurrency(item.budget)}</td>
                        <td style="padding: 10px 12px; text-align: center; font-family: monospace; font-size: 12px; color: #475569;">${item.validFrom || '—'}</td>
                        <td style="padding: 10px 12px; text-align: center; font-family: monospace; font-size: 12px; color: #475569;">${item.validUntil || '—'}</td>
                        <td style="padding: 10px 12px; text-align: center;">${statusBadge}</td>
                        <td style="padding: 10px 12px; text-align: center;">
                            <div style="display: inline-flex; gap: 4px;">
                                ${item.isGroup ? `<button class="btn btn-secondary" onclick="CostCenterModule.openAddChild('${item.code}')" style="padding: 2px 6px; font-size: 11px; height: 24px;" title="Add Child">+ Child</button>` : ''}
                                <button class="btn btn-secondary" onclick="CostCenterModule.openEdit('${item.code}')" style="padding: 2px 6px; font-size: 11px; height: 24px;" title="Edit">✏️</button>
                                <button class="btn btn-secondary" onclick="CostCenterModule.deleteCostCenter('${item.code}')" style="padding: 2px 6px; font-size: 11px; height: 24px; color: #dc2626;" title="Delete">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        },

        bindEvents() {
            // View Switcher
            const viewDropdown = document.getElementById('cost-view-dropdown');
            if (viewDropdown) {
                viewDropdown.addEventListener('change', (e) => {
                    this.currentView = e.target.value;
                    this.render();
                });
            }

            // Expand/Collapse dropdown
            const expandDropdown = document.getElementById('cost-expand-dropdown');
            if (expandDropdown) {
                expandDropdown.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (val === 'expand') {
                        this.collapsedNodes.clear();
                        this.renderTree();
                    } else if (val === 'collapse') {
                        this.items.filter(c => c.isGroup).forEach(c => this.collapsedNodes.add(c.code));
                        this.renderTree();
                    }
                    expandDropdown.value = '';
                });
            }

            // Search input
            const searchInput = document.getElementById('cost-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.trim();
                    this.render();
                });
            }

            // Dept filter
            const deptFilter = document.getElementById('cost-filter-dept');
            if (deptFilter) {
                deptFilter.addEventListener('change', (e) => {
                    this.deptFilter = e.target.value;
                    this.render();
                });
            }

            // Status filter
            const statusFilter = document.getElementById('cost-filter-status');
            if (statusFilter) {
                statusFilter.addEventListener('change', (e) => {
                    this.statusFilter = e.target.value;
                    this.render();
                });
            }

            // Refresh button
            const refreshBtn = document.getElementById('btn-cost-refresh');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.loadData();
                    this.searchTerm = '';
                    this.deptFilter = '';
                    this.statusFilter = '';
                    if (searchInput) searchInput.value = '';
                    if (deptFilter) deptFilter.value = '';
                    if (statusFilter) statusFilter.value = '';
                    this.render();
                    this.notify('Cost Centers refreshed', 'info');
                });
            }

            // Export CSV button
            const exportBtn = document.getElementById('btn-cost-export-excel');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportCSV());
            }

            // Add Cost Center button
            const newBtn = document.getElementById('btn-cost-new-erpnext');
            if (newBtn) {
                newBtn.addEventListener('click', () => this.openAdd());
            }

            // Breadcrumb home link
            const breadcrumbHome = document.getElementById('cost-breadcrumb-home');
            if (breadcrumbHome) {
                breadcrumbHome.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof switchFinanceSubPanel === 'function') {
                        switchFinanceSubPanel('fin-home');
                    }
                });
            }

            // Modal elements
            const modalCloseBtn = document.getElementById('btn-cost-modal-close');
            if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this.closeModal());

            const modalCancelBtn = document.getElementById('btn-modal-cost-cancel');
            if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => this.closeModal());

            const modalSaveBtn = document.getElementById('btn-modal-cost-save');
            if (modalSaveBtn) modalSaveBtn.addEventListener('click', () => this.saveModal());

            const modalDeleteBtn = document.getElementById('btn-modal-cost-delete');
            if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', () => {
                if (this.editingCode) {
                    this.deleteCostCenter(this.editingCode);
                    this.closeModal();
                }
            });

            const costModal = document.getElementById('cost-modal-overlay');
            if (costModal) {
                costModal.addEventListener('click', (e) => {
                    if (e.target === costModal) this.closeModal();
                });
            }
        },

        populateParentSelect(excludeCode = null, selectedValue = '') {
            const parentSelect = document.getElementById('modal-cost-parent-select');
            if (!parentSelect) return;

            // Get descendants to prevent cycle
            const descendants = new Set();
            if (excludeCode) {
                descendants.add(excludeCode);
                const findDesc = (pCode) => {
                    this.items.filter(c => c.parent === pCode).forEach(child => {
                        descendants.add(child.code);
                        findDesc(child.code);
                    });
                };
                findDesc(excludeCode);
            }

            let optionsHtml = `<option value="">None (Top-Level Root)</option>`;
            // Allow parent to be any group node (not in descendants)
            this.items
                .filter(c => c.isGroup && !descendants.has(c.code))
                .forEach(group => {
                    const sel = group.code === selectedValue ? 'selected' : '';
                    optionsHtml += `<option value="${group.code}" ${sel}>${group.code} - ${group.name}</option>`;
                });

            parentSelect.innerHTML = optionsHtml;
        },

        openAdd() {
            this.editingCode = null;
            const titleEl = document.getElementById('cost-modal-title');
            if (titleEl) titleEl.textContent = 'Add New Cost Center';

            const codeInput = document.getElementById('modal-cost-code-input');
            const nameInput = document.getElementById('modal-cost-name-input');
            const deptInput = document.getElementById('modal-cost-dept-input');
            const isGroupSelect = document.getElementById('modal-cost-isgroup-select');
            const budgetInput = document.getElementById('modal-cost-budget-input');
            const statusSelect = document.getElementById('modal-cost-status-select');
            const validFromInput = document.getElementById('modal-cost-valid-from-input');
            const validUntilInput = document.getElementById('modal-cost-valid-until-input');
            const deleteBtn = document.getElementById('btn-modal-cost-delete');

            if (codeInput) { codeInput.value = ''; codeInput.disabled = false; }
            if (nameInput) nameInput.value = '';
            if (deptInput) deptInput.value = '';
            if (isGroupSelect) isGroupSelect.value = 'No';
            if (budgetInput) budgetInput.value = '';
            if (statusSelect) statusSelect.value = 'Active';
            if (validFromInput) validFromInput.value = '2026-01-01';
            if (validUntilInput) validUntilInput.value = '2030-12-31';
            if (deleteBtn) deleteBtn.style.display = 'none';

            this.populateParentSelect();
            this.showModal();
        },

        openAddChild(parentCode) {
            this.editingCode = null;
            const parentItem = this.items.find(c => c.code === parentCode);
            const parentName = parentItem ? parentItem.name : parentCode;

            const titleEl = document.getElementById('cost-modal-title');
            if (titleEl) titleEl.textContent = `Add Child Center to ${parentName}`;

            const codeInput = document.getElementById('modal-cost-code-input');
            const nameInput = document.getElementById('modal-cost-name-input');
            const deptInput = document.getElementById('modal-cost-dept-input');
            const isGroupSelect = document.getElementById('modal-cost-isgroup-select');
            const budgetInput = document.getElementById('modal-cost-budget-input');
            const statusSelect = document.getElementById('modal-cost-status-select');
            const validFromInput = document.getElementById('modal-cost-valid-from-input');
            const validUntilInput = document.getElementById('modal-cost-valid-until-input');
            const deleteBtn = document.getElementById('btn-modal-cost-delete');

            if (codeInput) { codeInput.value = ''; codeInput.disabled = false; }
            if (nameInput) nameInput.value = '';
            if (deptInput) deptInput.value = parentItem ? (parentItem.department || '') : '';
            if (isGroupSelect) isGroupSelect.value = 'No';
            if (budgetInput) budgetInput.value = '';
            if (statusSelect) statusSelect.value = 'Active';
            if (validFromInput) validFromInput.value = parentItem?.validFrom || '2026-01-01';
            if (validUntilInput) validUntilInput.value = parentItem?.validUntil || '2030-12-31';
            if (deleteBtn) deleteBtn.style.display = 'none';

            this.populateParentSelect(null, parentCode);
            this.showModal();
        },

        openEdit(code) {
            const item = this.items.find(c => c.code === code);
            if (!item) return;

            this.editingCode = code;
            const titleEl = document.getElementById('cost-modal-title');
            if (titleEl) titleEl.textContent = `Edit Cost Center: ${item.code}`;

            const codeInput = document.getElementById('modal-cost-code-input');
            const nameInput = document.getElementById('modal-cost-name-input');
            const deptInput = document.getElementById('modal-cost-dept-input');
            const isGroupSelect = document.getElementById('modal-cost-isgroup-select');
            const budgetInput = document.getElementById('modal-cost-budget-input');
            const statusSelect = document.getElementById('modal-cost-status-select');
            const validFromInput = document.getElementById('modal-cost-valid-from-input');
            const validUntilInput = document.getElementById('modal-cost-valid-until-input');
            const deleteBtn = document.getElementById('btn-modal-cost-delete');

            if (codeInput) { codeInput.value = item.code; codeInput.disabled = true; }
            if (nameInput) nameInput.value = item.name;
            if (deptInput) deptInput.value = item.department || '';
            if (isGroupSelect) isGroupSelect.value = item.isGroup ? 'Yes' : 'No';
            if (budgetInput) budgetInput.value = item.budget || '';
            if (statusSelect) statusSelect.value = item.status || 'Active';
            if (validFromInput) validFromInput.value = item.validFrom || '';
            if (validUntilInput) validUntilInput.value = item.validUntil || '';
            if (deleteBtn) deleteBtn.style.display = 'inline-block';

            this.populateParentSelect(item.code, item.parent || '');
            this.showModal();
        },

        showModal() {
            const modal = document.getElementById('cost-modal-overlay');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                const firstInput = document.getElementById('modal-cost-name-input');
                if (firstInput && !this.editingCode) {
                    document.getElementById('modal-cost-code-input')?.focus();
                } else if (firstInput) {
                    firstInput.focus();
                }
            }
        },

        closeModal() {
            const modal = document.getElementById('cost-modal-overlay');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            this.editingCode = null;
        },

        saveModal() {
            const codeInput = document.getElementById('modal-cost-code-input');
            const nameInput = document.getElementById('modal-cost-name-input');
            const deptInput = document.getElementById('modal-cost-dept-input');
            const parentSelect = document.getElementById('modal-cost-parent-select');
            const isGroupSelect = document.getElementById('modal-cost-isgroup-select');
            const budgetInput = document.getElementById('modal-cost-budget-input');
            const statusSelect = document.getElementById('modal-cost-status-select');
            const validFromInput = document.getElementById('modal-cost-valid-from-input');
            const validUntilInput = document.getElementById('modal-cost-valid-until-input');

            const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const dept = deptInput ? deptInput.value.trim() : '';
            const parent = (parentSelect && parentSelect.value) ? parentSelect.value : null;
            const isGroup = isGroupSelect ? (isGroupSelect.value === 'Yes') : false;
            const budget = budgetInput ? (parseFloat(budgetInput.value) || 0) : 0;
            const status = statusSelect ? statusSelect.value : 'Active';
            const validFrom = validFromInput ? validFromInput.value.trim() : '';
            const validUntil = validUntilInput ? validUntilInput.value.trim() : '';

            if (!code) {
                this.notify('Cost Center Code is required', 'warning');
                codeInput?.focus();
                return;
            }
            if (!name) {
                this.notify('Cost Center Name is required', 'warning');
                nameInput?.focus();
                return;
            }
            if (validFrom && validUntil && validFrom > validUntil) {
                this.notify('Valid Until date must be on or after Valid From date', 'warning');
                validUntilInput?.focus();
                return;
            }

            if (this.editingCode) {
                // Update existing
                const idx = this.items.findIndex(c => c.code === this.editingCode);
                if (idx !== -1) {
                    // Check if converting a group with children to non-group
                    if (!isGroup && this.items.some(c => c.parent === this.editingCode)) {
                        this.notify('Cannot change to Posting unit while child cost centers exist under this node.', 'error');
                        return;
                    }

                    this.items[idx].name = name;
                    this.items[idx].department = dept;
                    this.items[idx].parent = parent;
                    this.items[idx].isGroup = isGroup;
                    this.items[idx].budget = budget;
                    this.items[idx].status = status;
                    this.items[idx].validFrom = validFrom;
                    this.items[idx].validUntil = validUntil;
                    this.saveData();
                    this.render();
                    this.closeModal();
                    this.notify(`Cost Center ${code} updated successfully`, 'success');
                }
            } else {
                // Insert new
                if (this.items.some(c => c.code.toLowerCase() === code.toLowerCase())) {
                    this.notify(`Cost Center code ${code} already exists! Please choose a unique code.`, 'error');
                    codeInput?.focus();
                    return;
                }

                const newItem = {
                    code,
                    name,
                    department: dept,
                    parent,
                    isGroup,
                    budget,
                    status,
                    validFrom,
                    validUntil
                };
                this.items.push(newItem);
                this.saveData();
                this.render();
                this.closeModal();
                this.notify(`Cost Center ${code} created successfully`, 'success');
            }
        },

        deleteCostCenter(code) {
            const hasChildren = this.items.some(c => c.parent === code);
            if (hasChildren) {
                this.notify(`Cannot delete ${code}: Child cost centers exist under this node. Reassign or delete children first.`, 'error');
                return;
            }

            const item = this.items.find(c => c.code === code);
            const name = item ? item.name : code;
            if (!confirm(`Are you sure you want to delete Cost Center "${code} - ${name}"?`)) {
                return;
            }

            this.items = this.items.filter(c => c.code !== code);
            this.collapsedNodes.delete(code);
            this.saveData();
            this.render();
            this.notify(`Cost Center ${code} deleted`, 'info');
        },

        exportCSV() {
            const filtered = this.getFilteredItems();
            if (!filtered.length) {
                this.notify('No cost centers to export', 'warning');
                return;
            }

            const headers = ['Cost Center Code', 'Name', 'Department', 'Parent Center', 'Is Group', 'Annual Budget (£)', 'Valid From', 'Valid Until', 'Status'];
            const rows = filtered.map(item => [
                `"${item.code}"`,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${(item.department || '').replace(/"/g, '""')}"`,
                `"${item.parent || ''}"`,
                item.isGroup ? 'Yes' : 'No',
                item.budget || 0,
                `"${item.validFrom || ''}"`,
                `"${item.validUntil || ''}"`,
                `"${item.status}"`
            ]);

            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `Cost_Centers_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.notify(`Exported ${filtered.length} Cost Centers to CSV`, 'success');
        }
    };

    window.CostCenterModule = CostCenterModule;
    CostCenterModule.init();

    // -------------------------------------------------------------------------
    // Helper function for rendering list views
    // -------------------------------------------------------------------------
    function renderList(data, tbodyId, colRenderer) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.style.transition = 'background-color 0.15s';
            tr.onmouseover = () => tr.style.backgroundColor = '#f9fafb';
            tr.onmouseout = () => tr.style.backgroundColor = 'transparent';

            // Checkbox column (always present in these mocks)
            const tdCheck = document.createElement('td');
            tdCheck.style.textAlign = 'center';
            tdCheck.style.padding = '8px';
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.style.cursor = 'pointer';
            tdCheck.appendChild(chk);
            tr.appendChild(tdCheck);

            // Custom columns
            colRenderer(tr, item);

            tbody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------------------
    // 3. Account Category
    // -------------------------------------------------------------------------
    const categoryData = [
        { id: "CAT-001", name: "Current Assets", root: "Asset" },
        { id: "CAT-002", name: "Fixed Assets", root: "Asset" },
        { id: "CAT-003", name: "Current Liabilities", root: "Liability" },
        { id: "CAT-004", name: "Direct Expenses", root: "Expense" },
        { id: "CAT-005", name: "Indirect Expenses", root: "Expense" }
    ];
    renderList(categoryData, 'category-list-body', (tr, item) => {
        const createTd = (text, isId = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isId) {
                td.style.fontWeight = '500';
                td.style.color = '#3b82f6';
                td.style.cursor = 'pointer';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.name));
        tr.appendChild(createTd(item.root));
        
        const tdBadge = document.createElement('td');
        tr.appendChild(tdBadge);
        
        const tdAction = document.createElement('td');
        tr.appendChild(tdAction);
    });

    // -------------------------------------------------------------------------
    // 4. Currency
    // -------------------------------------------------------------------------
    const currencyData = [
        { id: "INR", name: "Indian Rupee", symbol: "₹", fraction: "Paisa" },
        { id: "USD", name: "US Dollar", symbol: "$", fraction: "Cent" },
        { id: "GBP", name: "Pound Sterling", symbol: "£", fraction: "Penny" },
        { id: "EUR", name: "Euro", symbol: "€", fraction: "Cent" }
    ];
    renderList(currencyData, 'currencies-list-body', (tr, item) => {
        const createTd = (text, isBold = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isBold) {
                td.style.fontWeight = '600';
                td.style.color = '#1f2937';
                td.style.cursor = 'pointer';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.name));
        tr.appendChild(createTd(item.symbol));
        tr.appendChild(createTd(item.fraction));
        tr.appendChild(document.createElement('td')); // Empty action column
    });

    // -------------------------------------------------------------------------
    // 5. Mode of Payment
    // -------------------------------------------------------------------------
    const paymodeData = [
        { id: "Cash", type: "Cash", account: "Cash in Hand - BNS" },
        { id: "Bank Transfer", type: "Bank", account: "Main Business Account - BNS" },
        { id: "Credit Card", type: "Bank", account: "Main Business Account - BNS" },
        { id: "Cheque", type: "Bank", account: "Main Business Account - BNS" }
    ];
    renderList(paymodeData, 'paymodes-list-body', (tr, item) => {
        const createTd = (text, isId = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isId) {
                td.style.fontWeight = '600';
                td.style.color = '#1f2937';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.type));
        tr.appendChild(createTd(item.account));
        tr.appendChild(document.createElement('td')); // Empty action column
    });

    // -------------------------------------------------------------------------
    // 6. Payment Term
    // -------------------------------------------------------------------------
    const paytermData = [
        { id: "Net 30", desc: "Payment due in 30 days" },
        { id: "Net 60", desc: "Payment due in 60 days" },
        { id: "End of Month", desc: "Payment due by end of the current month" },
        { id: "50% Advance", desc: "50% due immediately, 50% on delivery" }
    ];
    renderList(paytermData, 'payterm-list-body', (tr, item) => {
        const createTd = (text, isId = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isId) {
                td.style.fontWeight = '600';
                td.style.color = '#1f2937';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.desc));
        tr.appendChild(document.createElement('td')); // Empty action column
    });

    // -------------------------------------------------------------------------
    // 7. Journal Entry Template
    // -------------------------------------------------------------------------
    const jetData = [
        { id: "JET-001", title: "Monthly Rent Accrual", isMulti: "Yes" },
        { id: "JET-002", title: "Payroll Booking", isMulti: "Yes" },
        { id: "JET-003", title: "Petty Cash Reimbursement", isMulti: "No" },
        { id: "JET-004", title: "Depreciation Entry", isMulti: "Yes" }
    ];
    renderList(jetData, 'jet-list-body', (tr, item) => {
        const createTd = (text, isId = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isId) {
                td.style.fontWeight = '500';
                td.style.color = '#3b82f6';
                td.style.cursor = 'pointer';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.title));
        tr.appendChild(createTd(item.isMulti));
        tr.appendChild(document.createElement('td')); // Empty action column
    });

    // -------------------------------------------------------------------------
    // 8. Terms and Conditions
    // -------------------------------------------------------------------------
    const tcData = [
        { id: "TC-001", title: "Standard Sales Terms", status: "Active" },
        { id: "TC-002", title: "Supplier Payment Policy", status: "Active" },
        { id: "TC-003", title: "Warranty Policy (1 Year)", status: "Active" },
        { id: "TC-004", title: "Returns and Refunds", status: "Draft" }
    ];
    renderList(tcData, 'tc-list-body', (tr, item) => {
        const createTd = (text, isId = false) => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            if (isId) {
                td.style.fontWeight = '500';
                td.style.color = '#3b82f6';
                td.style.cursor = 'pointer';
            }
            td.textContent = text;
            return td;
        };
        tr.appendChild(createTd(item.id, true));
        tr.appendChild(createTd(item.title));
        
        const tdStatus = document.createElement('td');
        tdStatus.style.padding = '8px 12px';
        const badge = document.createElement('span');
        badge.textContent = item.status;
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '12px';
        badge.style.fontSize = '11px';
        badge.style.fontWeight = '600';
        badge.style.backgroundColor = item.status === 'Active' ? '#dcfce7' : '#f3f4f6';
        badge.style.color = item.status === 'Active' ? '#166534' : '#4b5563';
        tdStatus.appendChild(badge);
        tr.appendChild(tdStatus);
        
        tr.appendChild(document.createElement('td')); // Empty action column
    });

    // -------------------------------------------------------------------------
    // 9. Bank Accounts
    // -------------------------------------------------------------------------
    const bankData = [
        { name: "Barclays Main Current", bank: "Barclays Bank PLC", acctNo: "82910384", iban: "GB29 BUGB 2020 1582 9103 84", swift: "BARCGB22", ledger: "Main Business Account (BNS)", status: "Active" },
        { name: "HSBC Payroll Operational", bank: "HSBC UK Bank", acctNo: "71029482", iban: "GB12 MIDL 4005 1571 0294 82", swift: "HBUKGB41", ledger: "Payroll Account (BNS)", status: "Active" },
        { name: "Lloyds Commercial Reserve", bank: "Lloyds Bank", acctNo: "44910283", iban: "GB88 LOYD 3090 8944 9102 83", swift: "LOYDGB21", ledger: "Main Business Account (BNS)", status: "Active" }
    ];
    const banksBody = document.getElementById('fin-banks-list-body');
    if (banksBody) {
        banksBody.innerHTML = '';
        bankData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${item.name}</td>
                <td style="padding: 10px 12px;">${item.bank}</td>
                <td style="padding: 10px 12px; font-family: monospace;">${item.acctNo}</td>
                <td style="padding: 10px 12px; font-size: 11px; font-family: monospace; color: #64748b;">${item.iban}</td>
                <td style="padding: 10px 12px; font-size: 11px; font-family: monospace;">${item.swift}</td>
                <td style="padding: 10px 12px; color: #4f46e5; font-weight: 500;">${item.ledger}</td>
                <td style="padding: 10px 12px;"><span class="badge badge-success" style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #166534;">${item.status}</span></td>
                <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">Edit</button>
                </td>
            `;
            banksBody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------------------
    // 10. Tax Configurations
    // -------------------------------------------------------------------------
    const taxData = [
        { name: "Standard VAT 20%", type: "Output Tax (Sales)", rate: "20.00", ledger: "Duties and Taxes", status: "Active" },
        { name: "Reduced VAT 5%", type: "Output Tax (Sales)", rate: "5.00", ledger: "Duties and Taxes", status: "Active" },
        { name: "Zero Rated 0%", type: "Output Tax (Sales)", rate: "0.00", ledger: "Duties and Taxes", status: "Active" },
        { name: "Input VAT 20%", type: "Input Tax (Purchases)", rate: "20.00", ledger: "Duties and Taxes", status: "Active" },
        { name: "Corporate Withholding Tax 10%", type: "Withholding Tax", rate: "10.00", ledger: "Duties and Taxes", status: "Active" }
    ];
    const taxesBody = document.getElementById('fin-taxes-list-body');
    if (taxesBody) {
        taxesBody.innerHTML = '';
        taxData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${item.name}</td>
                <td style="padding: 10px 12px;">${item.type}</td>
                <td style="padding: 10px 12px; font-weight: 700; color: #0284c7;">${item.rate}%</td>
                <td style="padding: 10px 12px; color: #4f46e5; font-weight: 500;">${item.ledger}</td>
                <td style="padding: 10px 12px;"><span class="badge badge-success" style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #166534;">${item.status}</span></td>
                <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">Edit</button>
                </td>
            `;
            taxesBody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------------------
    // 11. Budget Heads
    // -------------------------------------------------------------------------
    const budgetData = [
        { head: "IT Capital Hardware 2026-27", ledger: "Computers and Equipment", costCenter: "Administration", limit: "£45,000.00", action: "Stop & Warn" },
        { head: "Corporate Office Rent & Leases", ledger: "Rent", costCenter: "Administration", limit: "£120,000.00", action: "Stop Postings" },
        { head: "Regional Operations Logistics", ledger: "Direct Expenses", costCenter: "Operations", limit: "£85,000.00", action: "Warn Only" },
        { head: "Sales Marketing & Campaigns", ledger: "Indirect Expenses", costCenter: "Marketing", limit: "£30,000.00", action: "Stop & Warn" }
    ];
    const budgetsBody = document.getElementById('fin-budgets-list-body');
    if (budgetsBody) {
        budgetsBody.innerHTML = '';
        budgetData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${item.head}</td>
                <td style="padding: 10px 12px; color: #4f46e5;">${item.ledger}</td>
                <td style="padding: 10px 12px; color: #0284c7; font-weight: 500;">${item.costCenter}</td>
                <td style="padding: 10px 12px; font-weight: 700; color: #166534;">${item.limit}</td>
                <td style="padding: 10px 12px;"><span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e;">${item.action}</span></td>
                <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">Edit</button>
                </td>
            `;
            budgetsBody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------------------
    // 12. Account Groups
    // -------------------------------------------------------------------------
    const groupData = [
        { code: "ASST-1000", name: "Current Assets", parent: "Assets", category: "Asset" },
        { code: "ASST-2000", name: "Fixed Assets", parent: "Assets", category: "Asset" },
        { code: "LIAB-1000", name: "Current Liabilities", parent: "Liabilities", category: "Liability" },
        { code: "EQU-1000", name: "Capital Stock & Reserves", parent: "Equity", category: "Equity" },
        { code: "INC-1000", name: "Operating Revenue", parent: "Income", category: "Income" },
        { code: "EXP-1000", name: "Cost of Goods Sold (Direct)", parent: "Expenses", category: "Expense" }
    ];
    const groupsBody = document.getElementById('fin-groups-list-body');
    if (groupsBody) {
        groupsBody.innerHTML = '';
        groupData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 600; font-family: monospace; color: #4f46e5;">${item.code}</td>
                <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${item.name}</td>
                <td style="padding: 10px 12px; color: #64748b;">${item.parent}</td>
                <td style="padding: 10px 12px;"><span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #334155;">${item.category}</span></td>
                <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">Edit</button>
                </td>
            `;
            groupsBody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------------------
    // 13. General Ledger (GL Table)
    // -------------------------------------------------------------------------
    const glData = [
        { date: "2026-04-02", acct: "Main Business Account (BNS)", dr: "£14,500.00", cr: "—", bal: "£114,500.00", vType: "Sales Invoice", vSub: "SI-2026-001", vNo: "ACC-SINV-00104", agAcct: "Sales", partyType: "Customer", party: "Apex Healthcare PLC", proj: "PRJ-01", cc: "Operations", agVType: "Sales Order", agVNo: "SO-2026-042", supInv: "—" },
        { date: "2026-04-03", acct: "Cost of Goods Sold", dr: "£6,800.00", cr: "—", bal: "£6,800.00", vType: "Delivery Note", vSub: "DN-2026-012", vNo: "ACC-DN-00084", agAcct: "Current Assets", partyType: "Customer", party: "Apex Healthcare PLC", proj: "PRJ-01", cc: "London Branch", agVType: "Sales Invoice", agVNo: "ACC-SINV-00104", supInv: "—" },
        { date: "2026-04-05", acct: "Accounts Payable", dr: "£8,250.00", cr: "—", bal: "£32,150.00", vType: "Payment Entry", vSub: "Bank Transfer", vNo: "ACC-PAY-00219", agAcct: "Main Business Account (BNS)", partyType: "Supplier", party: "MedChem International", proj: "—", cc: "Administration", agVType: "Purchase Invoice", agVNo: "PINV-2026-0044", supInv: "MC-INV-9941" },
        { date: "2026-04-08", acct: "Rent", dr: "£5,000.00", cr: "—", bal: "£15,000.00", vType: "Journal Entry", vSub: "Monthly Rent Accrual", vNo: "ACC-JV-00012", agAcct: "Accounts Payable", partyType: "Supplier", party: "Cityline Commercial Properties", proj: "—", cc: "Administration", agVType: "—", agVNo: "—", supInv: "—" },
        { date: "2026-04-10", acct: "Payroll Account (BNS)", dr: "—", cr: "£22,400.00", bal: "£42,600.00", vType: "Journal Entry", vSub: "Payroll Booking", vNo: "ACC-JV-00013", agAcct: "Salaries", partyType: "—", party: "Staff Monthly Disbursal", proj: "—", cc: "Operations", agVType: "—", agVNo: "—", supInv: "—" }
    ];
    const glBody = document.getElementById('gl-table-body');
    if (glBody) {
        glBody.innerHTML = '';
        glData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            tr.innerHTML = `
                <td style="text-align: center; padding: 6px;"><input type="checkbox" style="cursor: pointer;"></td>
                <td style="padding: 6px 10px; font-weight: 500; font-family: monospace;">${item.date}</td>
                <td style="padding: 6px 10px; font-weight: 600; color: #1e293b;">${item.acct}</td>
                <td style="padding: 6px 10px; text-align: right; color: ${item.dr !== '—' ? '#166534' : '#64748b'}; font-weight: 600;">${item.dr}</td>
                <td style="padding: 6px 10px; text-align: right; color: ${item.cr !== '—' ? '#b91c1c' : '#64748b'}; font-weight: 600;">${item.cr}</td>
                <td style="padding: 6px 10px; text-align: right; font-weight: 700; color: #1e293b;">${item.bal}</td>
                <td style="padding: 6px 10px;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; background: #e0f2fe; color: #0369a1; font-weight: 500;">${item.vType}</span></td>
                <td style="padding: 6px 10px; color: #64748b;">${item.vSub}</td>
                <td style="padding: 6px 10px; font-family: monospace; color: #4f46e5; font-weight: 500; cursor: pointer;">${item.vNo}</td>
                <td style="padding: 6px 10px; color: #475569;">${item.agAcct}</td>
                <td style="padding: 6px 10px;">${item.partyType}</td>
                <td style="padding: 6px 10px; font-weight: 500;">${item.party}</td>
                <td style="padding: 6px 10px; font-size: 11px;">${item.proj}</td>
                <td style="padding: 6px 10px; color: #0284c7;">${item.cc}</td>
                <td style="padding: 6px 10px; font-size: 11px;">${item.agVType}</td>
                <td style="padding: 6px 10px; font-size: 11px; font-family: monospace;">${item.agVNo}</td>
                <td style="padding: 6px 10px; font-size: 11px;">${item.supInv}</td>
            `;
            glBody.appendChild(tr);
        });
    }

}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFinanceMock);
} else {
    initFinanceMock();
}
