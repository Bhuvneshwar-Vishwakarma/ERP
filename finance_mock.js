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

document.addEventListener('DOMContentLoaded', () => {

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
    // 2. Chart of Cost Centers (Tree)
    // -------------------------------------------------------------------------
    const costCenterData = [
        {
            name: "B&S (Demo) - Main", isGroup: true, children: [
                { name: "Administration", isGroup: false },
                { name: "Sales", isGroup: false },
                { name: "Marketing", isGroup: false },
                { name: "Operations", isGroup: true, children: [
                    { name: "London Branch", isGroup: false },
                    { name: "Manchester Branch", isGroup: false }
                ]}
            ]
        }
    ];
    
    const costContainer = document.getElementById('finance-cost-tree');
    if (costContainer) {
        renderTree(costCenterData, costContainer, true);
    }

    // Connect Expand/Collapse Dropdowns for trees
    function setupTreeControls(dropdownId, containerId) {
        const dropdown = document.getElementById(dropdownId);
        const container = document.getElementById(containerId);
        if (dropdown && container) {
            dropdown.addEventListener('change', (e) => {
                const val = e.target.value;
                const expanders = container.querySelectorAll('.erp-tree-node span:first-child');
                const uls = container.querySelectorAll('.erp-tree-branch');
                
                if (val === 'expand') {
                    uls.forEach(ul => ul.style.display = 'block');
                    expanders.forEach(exp => { if(exp.innerHTML === '▶') exp.innerHTML = '▼'; });
                } else if (val === 'collapse') {
                    uls.forEach(ul => ul.style.display = 'none');
                    expanders.forEach(exp => { if(exp.innerHTML === '▼') exp.innerHTML = '▶'; });
                }
                dropdown.value = ''; // reset
            });
        }
    }
    setupTreeControls('cost-expand-dropdown', 'finance-cost-tree');

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

});
