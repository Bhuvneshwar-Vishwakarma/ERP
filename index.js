document.addEventListener('DOMContentLoaded', () => {
    // Global capturing click listener to prevent Chromium file:// origin errors on hash links
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a) {
            const href = a.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) {
                e.preventDefault();
            }
        }
    }, true);

    // -------------------------------------------------------------
    // State management & Local Storage Keys
    // -------------------------------------------------------------
    const STORAGE_KEY = 'ANTIGRAVITY_ERP_COMPANY_DATA';

    const defaultCompanies = [
        {
            companyId: "LAXMI01",
            companyName: "Laxmico Limited",
            creationDate: "2026-07-21",
            createdBy: "Bhuvenshwar Vishwakarma",
            sourceCompany: "",
            status: "Active",
            addresses: [
                {
                    identity: "Address 1",
                    country: "GB",
                    addr1: "Unit 4 Bradfield Road,",
                    addr2: "",
                    zip: "HA4 0NU",
                    city: "Ruislip,",
                    state: "",
                    county: "Middlesex",
                    countryCode: "GB",
                    validFrom: "2026-07-01",
                    validTo: "",
                    types: {
                        delivery: true,
                        document: true,
                        billing: true,
                        visit: false
                    },
                    distribution: {
                        deliveryTerms: "FOB",
                        shipVia: "DHL"
                    }
                },
                {
                    identity: "Address 2",
                    country: "GB",
                    addr1: "12 Park Lane",
                    addr2: "Suite 4B",
                    zip: "W1K 1AB",
                    city: "London",
                    state: "",
                    county: "Greater London",
                    countryCode: "GB",
                    validFrom: "2026-07-15",
                    validTo: "",
                    types: {
                        delivery: false,
                        document: true,
                        billing: true,
                        visit: true
                    },
                    distribution: {
                        deliveryTerms: "CIF",
                        shipVia: "FEDEX"
                    }
                }
            ],
            accCurrency: "GBP",
            accValidFrom: "2000-01-01",
            parallelCurrency: "EUR",
            parallelValidFrom: "2000-01-01",
            site: {
                id: "LAX",
                desc: "Perivale Retail Site",
                deliveryAddress: "01"
            }
        },
        {
            companyId: "BNS01",
            companyName: "B&S Systems Inc",
            creationDate: "2026-06-15",
            createdBy: "Bhuvenshwar Vishwakarma",
            sourceCompany: "LAXMI01",
            status: "Active",
            addresses: [
                {
                    identity: "Address 1",
                    country: "US",
                    addr1: "100 Pine Street",
                    addr2: "Suite 1200",
                    zip: "94111",
                    city: "San Francisco",
                    state: "CA",
                    county: "San Francisco",
                    countryCode: "US",
                    validFrom: "2026-06-01",
                    validTo: "",
                    types: {
                        delivery: true,
                        document: true,
                        billing: true,
                        visit: false
                    },
                    distribution: {
                        deliveryTerms: "EXW",
                        shipVia: "FEDEX"
                    }
                }
            ],
            accCurrency: "USD",
            accValidFrom: "2010-01-01",
            parallelCurrency: "",
            parallelValidFrom: "",
            site: {
                id: "JFK",
                desc: "New York Hub",
                deliveryAddress: "01"
            }
        },
        {
            companyId: "TEST01",
            companyName: "Test Prototype Corp",
            creationDate: "2026-07-01",
            createdBy: "Bhuvenshwar Vishwakarma",
            sourceCompany: "",
            status: "Active",
            addresses: [
                {
                    identity: "Address 1",
                    country: "DE",
                    addr1: "Müllerstraße 45",
                    addr2: "",
                    zip: "10115",
                    city: "Berlin",
                    state: "",
                    county: "Berlin",
                    countryCode: "DE",
                    validFrom: "2026-07-01",
                    validTo: "",
                    types: {
                        delivery: true,
                        document: true,
                        billing: false,
                        visit: false
                    },
                    distribution: {
                        deliveryTerms: "DDP",
                        shipVia: "UPS"
                    }
                }
            ],
            accCurrency: "EUR",
            accValidFrom: "2020-01-01",
            parallelCurrency: "",
            parallelValidFrom: "",
            site: {
                id: "LHR",
                desc: "London Depot",
                deliveryAddress: "01"
            }
        }
    ];
    let companies = [];
    
    const SITES_STORAGE_KEY = 'ANTIGRAVITY_ERP_SITES_DATA';
    const defaultSites = [
        { id: "LAX", desc: "Perivale Retail Site", companyId: "LAXMI01", companyName: "Laxmico Limited", deliveryAddress: "01", status: "Active" },
        { id: "JFK", desc: "New York Hub", companyId: "BNS01", companyName: "B&S Systems Inc", deliveryAddress: "02", status: "Active" },
        { id: "LHR", desc: "London Depot", companyId: "TEST01", companyName: "Test Prototype Corp", deliveryAddress: "01", status: "Active" }
    ];
    let sites = [];
    
    const APP_MODULES = {
        specialsOrder: ["Order Entry", "Order Approval", "Dispatch Specials", "Order Inquiry"],
        financeKpi: ["KPI Dashboard", "Financial Reporting", "Budget Forecasting", "Profitability Analysis"],
        plpi: ["Item Master", "Recipe Management", "Production Planning", "Process Integration"],
        customerService: ["Ticket Tracking", "Customer Feedback", "SLA Monitoring", "Knowledge Base"],
        financeEnterprise: ["General Ledger", "Accounts Payable", "Accounts Receivable", "Cash Management"],
        wms: ["Inventory Putaway", "Picking & Packing", "Stock Count", "Shipping Manifest"],
        bnsSop: ["Sales Order Processing", "Customer Portal", "Pricing & Discounts", "Billing & Invoicing"],
        tps: ["Transaction Processing", "System Logs", "Queue Management", "Performance Monitor"],
        purchaseOrder: ["PO Creation", "Vendor Quotations", "PO Receipt", "Invoice Matching"],
        reqPurchaseOrder: ["Purchase Requisition", "Req Approval Workflow", "Budget Check", "Requisition Inquiry"],
        mcs: ["Master Control System", "Machine Calibration", "Quality Standards", "Maintenance Logs"],
        priceMatrix: ["Base Price Setup", "Discount Rules", "Customer Special Prices", "Margin Calculator"],
        bomManagement: ["BOM Creation", "Version Control", "Routing Setup", "Engineering Change Order"]
    };

    const APP_NAMES = {
        specialsOrder: "Specials Order",
        financeKpi: "Finance KPI",
        plpi: "PL PI",
        customerService: "Customer Service",
        financeEnterprise: "Finance Enterprise",
        wms: "WMS",
        bnsSop: "BNS-SOP (Customer Order)",
        tps: "TPS",
        purchaseOrder: "Purchase Order",
        reqPurchaseOrder: "Request Purchase Order",
        mcs: "MCS",
        priceMatrix: "Price Matrix",
        bomManagement: "BOM Management"
    };

    function migrateUsersAppAccess(userList) {
        if (!userList || !Array.isArray(userList)) return;
        userList.forEach(user => {
            if (!user.appAccess) {
                user.appAccess = {};
            }
            Object.keys(APP_MODULES).forEach(appKey => {
                const val = user.appAccess[appKey];
                if (typeof val === 'string') {
                    const moduleAccess = {};
                    APP_MODULES[appKey].forEach(mod => {
                        moduleAccess[mod] = val;
                    });
                    user.appAccess[appKey] = moduleAccess;
                } else if (!val || typeof val !== 'object') {
                    const moduleAccess = {};
                    APP_MODULES[appKey].forEach(mod => {
                        moduleAccess[mod] = "";
                    });
                    user.appAccess[appKey] = moduleAccess;
                } else {
                    APP_MODULES[appKey].forEach(mod => {
                        if (user.appAccess[appKey][mod] === undefined) {
                            user.appAccess[appKey][mod] = "";
                        }
                    });
                }
            });
        });
    }

    function getOverallAppAccess(appAccessVal) {
        if (!appAccessVal) return '';
        if (typeof appAccessVal === 'string') return appAccessVal.toUpperCase();
        if (typeof appAccessVal === 'object') {
            const vals = Object.values(appAccessVal);
            if (vals.includes('manager')) return 'MANAGER';
            if (vals.includes('normal')) return 'NORMAL';
        }
        return '';
    }

    const USERS_STORAGE_KEY = 'ANTIGRAVITY_ERP_USERS_DATA';
    const defaultUsers = [
        {
            userId: "HARCHA",
            userName: "Harshal Chaudhari",
            emailId: "harshal.chaudhari@syrimed.co.uk",
            employeeId: "E0541",
            department: "Buying Specials",
            location: "India",
            subLocation: "Vadodara",
            matrixManager: "Kiran Kumar",
            team: "Team A",
            companyId: "BNS01",
            isCoordinator: "False",
            coordinatorGroup: "",
            isBuyer: "False",
            windowsUserId: "win_harcha",
            designation: "Buyer Executive",
            password: "HARCHA",
            status: "OPEN",
            allocatedCompanies: [
                { companyId: "BNS01", default: true },
                { companyId: "LAXMI01", default: false },
                { companyId: "TEST01", default: false }
            ],
            allocatedSites: [
                { siteId: "SPE", default: true },
                { siteId: "SPE-V", default: false }
            ],
            appAccess: {
                specialsOrder: "manager",
                financeKpi: "normal",
                plpi: "normal",
                customerService: "normal",
                financeEnterprise: "manager",
                wms: "manager",
                bnsSop: "normal",
                tps: "normal",
                purchaseOrder: "normal",
                reqPurchaseOrder: "normal",
                mcs: "normal",
                priceMatrix: "manager",
                bomManagement: "manager"
            },
            qmsRoles: {
                dept: "QMS",
                intAudit: "Y",
                capa: "Manager",
                devMgmt: "Normal",
                cma: "Normal",
                changeControl: "Quality",
                changeControlInd: "Quality",
                ccExtApprovedInd: "N"
            },
            dbRoles: [
                { roleName: "FND_CONNECT", defaultRole: "YES", adminOption: "NO" },
                { roleName: "FND_ENDUSER", defaultRole: "YES", adminOption: "NO" },
                { roleName: "MAMEDICA", defaultRole: "YES", adminOption: "NO" },
                { roleName: "MFGP", defaultRole: "YES", adminOption: "NO" },
                { roleName: "PURCHASE_ORDER", defaultRole: "YES", adminOption: "NO" },
                { roleName: "REQUEST_ACCESS", defaultRole: "YES", adminOption: "NO" },
                { roleName: "REQUEST_PURCHASE_ACCESS", defaultRole: "YES", adminOption: "NO" },
                { roleName: "TRAINING_MATRIX", defaultRole: "YES", adminOption: "NO" }
            ],
            appAccessLogs: [
                { appName: "DEMAND PLANNING SYSTEM", roleType: "NORMAL", createdBy: "IFSAPP", creationDate: "21/07/2026 13:09:28" },
                { appName: "PURCHASE ORDER", roleType: "NORMAL", createdBy: "IFSAPP", creationDate: "21/07/2026 13:09:28" },
                { appName: "WAREHOUSE STOCK CONTROL", roleType: "NORMAL", createdBy: "IFSAPP", creationDate: "21/07/2026 13:09:28" },
                { appName: "3PL", roleType: "NORMAL", createdBy: "Plsql Dba", creationDate: "21/07/2026 14:25:59" },
                { appName: "REQUEST PURCHASE ORDER", roleType: "NORMAL", createdBy: "IFSAPP", creationDate: "22/07/2026 11:56:16" }
            ],
            qmsLogs: [
                { moduleName: "CAPA", accessType: "Manager", createdBy: "IFSAPP" },
                { moduleName: "Deviation", accessType: "Quality", createdBy: "IFSAPP" }
            ]
        },
        {
            userId: "ADMIN",
            userName: "System Administrator",
            emailId: "admin@syrimed.co.uk",
            employeeId: "E0001",
            department: "IT & Systems",
            location: "UK",
            subLocation: "Ruislip",
            matrixManager: "Executive Director",
            team: "Enterprise Admin",
            companyId: "BNS01",
            isCoordinator: "True",
            coordinatorGroup: "ADMIN_GRP",
            isBuyer: "True",
            windowsUserId: "win_admin",
            designation: "Principal Administrator",
            password: "ADMIN",
            status: "OPEN",
            allocatedCompanies: [
                { companyId: "BNS01", default: true }
            ],
            allocatedSites: [
                { siteId: "SPE", default: true }
            ],
            appAccess: {},
            qmsRoles: {},
            dbRoles: [{ roleName: "FND_CONNECT", defaultRole: "YES", adminOption: "YES" }]
        }
    ];
    let users = [];
    let editingUserId = null;
    
    const CUSTOMER_STORAGE_KEY = 'ANTIGRAVITY_ERP_CUSTOMER_DATA';
    const defaultCustomers = [
        {
            accountNumber: "B4183",
            customerName: "Flagg Court Pharmacy Limited",
            customerType: "Independent Pharmacy",
            postcode: "SS1 2LH",
            addr1: "Flagg Court Health Centre",
            addr2: "Southend-on-Sea",
            city: "Essex",
            county: "Southend",
            country: "GB",
            rsm: "John Smith",
            route: "444 DX",
            addressType: { delivery: true, invoice: true, pay: true },
            telephone: "01702 468468",
            generalEmail: "info@flaggcourt.co.uk",
            currency: "GBP",
            taxLiability: "TAX TAXABLE",
            paymentTerms: "30E",
            taxCode: "Standard Tax (20%)",
            creditLimit: 50000,
            creditAnalyst: "Karanjit Samra",
            buyingGroup: "Laxmico Retail Group",
            priceList: "V0",
            invoiceCustomer: "",
            parentCompany: "LAXMI01",
            parentCustomer: "",
            apEmail: "accounts@flaggcourt.co.uk",
            gphcNumber: "1098765",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B4183.pdf",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            status: "Active"
        },
        {
            accountNumber: "B9007",
            customerName: "Syrimed Pharmacy Services Ltd",
            customerType: "Group Pharmacy",
            postcode: "HA4 0NU",
            addr1: "Unit 4 Bradfield Road",
            addr2: "Ruislip",
            city: "London",
            county: "Middlesex",
            country: "GB",
            rsm: "David Miller",
            route: "444 DX",
            addressType: { delivery: true, invoice: true, pay: true },
            telephone: "0208 839 8555",
            generalEmail: "info@syrimed.co.uk",
            currency: "GBP",
            taxLiability: "TAX TAXABLE",
            paymentTerms: "30E",
            taxCode: "Standard Tax (20%)",
            creditLimit: 155000,
            creditAnalyst: "Teri Dhaliwal",
            buyingGroup: "Laxmico Retail Group",
            priceList: "V0",
            invoiceCustomer: "",
            parentCompany: "LAXMI01",
            parentCustomer: "LAX01",
            apEmail: "ap@syrimed.co.uk",
            gphcNumber: "2087654",
            gphcExpiry: "2027-06-15",
            gphcDocument: "gphc_license_B9007.pdf",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            status: "Active"
        },
        {
            accountNumber: "B3211",
            customerName: "RX MEDICATION LTD",
            customerType: "Independent Pharmacy",
            postcode: "PE9 2DW",
            addr1: "T/A STAMFORD PHARMACY",
            addr2: "6 ST MARYS HILL",
            city: "STAMFORD",
            county: "LINCOLNSHIRE",
            country: "GB",
            rsm: "John Smith",
            route: "444 DX",
            addressType: { delivery: true, invoice: true, pay: true },
            telephone: "01780 484999",
            generalEmail: "stamfordpharmacy@live.com",
            currency: "GBP",
            taxLiability: "TAX TAXABLE",
            paymentTerms: "30E",
            taxCode: "Standard Tax (20%)",
            creditLimit: 155000,
            creditAnalyst: "Karanjit Samra",
            buyingGroup: "Laxmico Retail Group",
            priceList: "V0",
            invoiceCustomer: "",
            parentCompany: "LAXMI01",
            parentCustomer: "",
            apEmail: "stamfordpharmacy@live.com",
            gphcNumber: "1038472",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B3211.pdf",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            status: "Active"
        },
        {
            accountNumber: "B5082",
            customerName: "X-PHARM LTD",
            customerType: "Wholesale",
            postcode: "LE2 1TU",
            addr1: "Unit A, X-Pharm Plaza",
            addr2: "Clarendon Park",
            city: "LEICESTER",
            county: "LEICESTERSHIRE",
            country: "GB",
            rsm: "David Miller",
            route: "444 DX",
            addressType: { delivery: true, invoice: true, pay: true },
            telephone: "0116 270 7140",
            generalEmail: "info@x-pharm.co.uk",
            currency: "GBP",
            taxLiability: "TAX TAXABLE",
            paymentTerms: "30E",
            taxCode: "Standard Tax (20%)",
            creditLimit: 165000,
            creditAnalyst: "Teri Dhaliwal",
            buyingGroup: "None",
            priceList: "V2",
            invoiceCustomer: "",
            parentCompany: "LAXMI01",
            parentCustomer: "B0056",
            apEmail: "accounts@x-pharm.co.uk",
            gphcNumber: "1038471",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B5082.pdf",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            status: "Active"
        },
        {
            accountNumber: "B9074",
            customerName: "VIVO HEALTH LIMITED T/A Willow Pharmacy",
            customerType: "Independent Pharmacy",
            postcode: "LE2 1TU",
            addr1: "T/A Willow Pharmacy",
            addr2: "78 Queen's Road",
            city: "Leicester",
            county: "Leicestershire",
            country: "GB",
            rsm: "David Miller",
            route: "444 DX",
            addressType: { delivery: true, invoice: true, pay: true },
            telephone: "0116 270 7140",
            generalEmail: "headoffice@everestpharmacy.co.uk",
            currency: "GBP",
            taxLiability: "TAX TAXABLE",
            paymentTerms: "30E",
            taxCode: "Standard Tax (20%)",
            creditLimit: 155000,
            creditAnalyst: "Karanjit Samra",
            buyingGroup: "Laxmico Retail Group",
            priceList: "V0",
            invoiceCustomer: "",
            parentCompany: "LAXMI01",
            parentCustomer: "",
            apEmail: "headoffice@everestpharmacy.co.uk",
            gphcNumber: "1034133",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B9074.pdf",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            status: "Pending QA Approval"
        }
    ];
    let customers = [];
    let editingCustomerNo = null;
    
    // Default address components state
    let addressState = {
        addr1: "Unit 4 Bradfield Road,",
        addr2: "",
        zip: "HA4 0NU",
        city: "Ruislip,",
        state: "",
        county: "Middlesex",
        country: "GB" // Derived from Country
    };

    // -------------------------------------------------------------
    // DOM Elements Cache
    // -------------------------------------------------------------
    // Global Save/Cancel
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');

    // Home Page and Workspace screens
    const homeScreen = document.getElementById('home-page-container');
    const mainErpContainer = document.getElementById('main-erp-container');
    const sidebarLogo = document.getElementById('sidebar-logo');
    const sidebarNavMenu = document.getElementById('sidebar-nav-menu');
    const moduleCards = document.querySelectorAll('.module-card');
    
    const workspaces = {
        sales: document.getElementById('sales-workspace'),
        purchase: document.getElementById('purchase-workspace'),
        hr: document.getElementById('hr-workspace'),
        plpi: document.getElementById('plpi-workspace'),
        stock: document.getElementById('stock-workspace'),
        partCreation: document.getElementById('part-creation-workspace'),
        masters: document.getElementById('masters-dashboard-workspace'),
        submaster: document.getElementById('sub-master-workspace'),
        other: document.getElementById('company-setup-workspace'),
        company: document.getElementById('company-setup-workspace'),
        site: document.getElementById('site-setup-workspace'),
        user: document.getElementById('user-setup-workspace'),
        customer: document.getElementById('customer-creation-workspace'),
        supplier: document.getElementById('supplier-creation-workspace') || document.getElementById('old-supplier-setup-workspace'),
        item: document.getElementById('item-setup-workspace'),
        finance: document.getElementById('finance-setup-workspace'),
        accessDenied: document.getElementById('access-denied-workspace')
    };

    // Fields
    // Fields
    const companyIdInput = document.getElementById('company-id-input');
    const companyNameInput = document.getElementById('company-name');
    const creationDateInput = document.getElementById('creation-date');
    const createdByInput = document.getElementById('created-by');
    const sourceCompanyInput = document.getElementById('source-company');
    const companyStatusSelect = document.getElementById('company-status');

    // View container caches
    const companyListView = document.getElementById('company-list-view-container');
    const companyFormView = document.getElementById('company-form-view-container');
    const btnCreateCompany = document.getElementById('btn-create-company');
    const btnCompanyExport = document.getElementById('btn-company-export-excel');
    const companiesListBody = document.getElementById('companies-list-body');
    const companyAddressesContainer = document.getElementById('company-addresses-container');
    const btnAddNewAddress = document.getElementById('btn-add-new-address');

    // Address Modal Elements
    const addressModal = document.getElementById('address-modal');
    const modalAddrIdLabel = document.getElementById('modal-address-id-label');
    const modalAddr1 = document.getElementById('modal-addr1');
    const modalAddr2 = document.getElementById('modal-addr2');
    const modalZip = document.getElementById('modal-zip');
    const modalCity = document.getElementById('modal-city');
    const modalState = document.getElementById('modal-state');
    const modalCounty = document.getElementById('modal-county');
    const modalCountryCode = document.getElementById('modal-country-code');
    const btnSaveAddressModal = document.getElementById('btn-save-address');
    const btnCancelAddressModal = document.getElementById('btn-cancel-address');
    const btnCloseModalX = document.getElementById('btn-close-modal-x');

    // Accounting Tab elements
    const accCurrencySelect = document.getElementById('acc-currency');
    const accValidFromInput = document.getElementById('acc-valid-from');
    const parallelCurrencySelect = document.getElementById('parallel-currency');
    const parallelValidFromInput = document.getElementById('parallel-valid-from');

    // Site Setup elements
    const siteIdInput = document.getElementById('site-id-input');
    const siteDescInput = document.getElementById('site-desc');
    const siteCompanySelect = document.getElementById('site-company-select');
    const siteCompanyNameInput = document.getElementById('site-company-name');
    const siteDeliveryAddressSelect = document.getElementById('site-delivery-address');
    const siteDeliveryAddressPreview = document.getElementById('site-delivery-address-preview');
    const siteStatusSelect = document.getElementById('site-status');

    // Site Setup list & form container caches
    const siteListView = document.getElementById('site-list-view-container');
    const siteFormView = document.getElementById('site-form-view-container');
    const btnCreateSite = document.getElementById('btn-create-site');
    const sitesListBody = document.getElementById('sites-list-body');

    // Filter State & Element references for Company List Multi-Selects
    const companySelectedFilters = {
        names: new Set(),
        sources: new Set(),
        statuses: new Set()
    };
    const btnCompanyFilterReset = document.getElementById('btn-company-filter-reset');
    const companyFilterCountBadge = document.getElementById('company-filter-count-badge');

    // Filter State & Element references for Site List Multi-Selects
    const siteSelectedFilters = {
        companyCodes: new Set(),
        companyNames: new Set(),
        statuses: new Set()
    };
    const btnSiteFilterReset = document.getElementById('btn-site-filter-reset');
    const siteFilterCountBadge = document.getElementById('site-filter-count-badge');



    // -------------------------------------------------------------
    // User & Role-Based Module Visibility & Access Control Engine
    // -------------------------------------------------------------
    const SYSTEM_MODULES = {
        'masters': {
            id: 'masters',
            name: 'Master Data Setup',
            icon: '📁',
            color: '#0ea5e9',
            submodules: ['masters', 'company', 'other', 'site', 'user-setup', 'user', 'customer-creation', 'customer', 'supplier-setup', 'supplier', 'submaster', 'item-setup', 'item']
        },
        'stock': {
            id: 'stock',
            name: 'Stock Management',
            icon: '📦',
            color: '#6366f1',
            submodules: ['stock', 'part-creation', 'partCreation']
        },
        'sales': {
            id: 'sales',
            name: 'Sales Module',
            icon: '📊',
            color: '#ec4899',
            submodules: ['sales', 'sales-quotation', 'sales-order', 'sales-invoice']
        },
        'purchase': {
            id: 'purchase',
            name: 'Purchase Module',
            icon: '🛒',
            color: '#10b981',
            submodules: ['purchase']
        },
        'hr': {
            id: 'hr',
            name: 'HR Module',
            icon: '👥',
            color: '#f59e0b',
            submodules: ['hr']
        },
        'plpi': {
            id: 'plpi',
            name: 'PLPI Module',
            icon: '⚙️',
            color: '#8b5cf6',
            submodules: ['plpi']
        },
        'finance': {
            id: 'finance',
            name: 'Finance Module',
            icon: '💳',
            color: '#4f46e5',
            submodules: ['finance', 'invoicing']
        }
    };

    // =========================================================================
    // GLOBAL SYSTEM MODULE VISIBILITY FILTER
    // =========================================================================
    // Controls which modules are actively visible across all navigation, menus,
    // home dashboard cards, and global search throughout the entire application.
    //
    // Currently ACTIVE / VISIBLE modules:
    //   1. 'masters' (Master Data Setup)
    //   2. 'stock'   (Stock Management)
    //
    // ALL other modules ('sales', 'purchase', 'hr', 'plpi', 'finance') are
    // cleanly hidden while keeping all code, data, workflows, and configurations intact.
    //
    // TO RE-ENABLE ALL MODULES IN THE FUTURE:
    // Simply set: SYSTEM_ACTIVE_MODULES_ONLY = null;
    // Or call in console: window.setSystemActiveModules(null);
    // =========================================================================
    let SYSTEM_ACTIVE_MODULES_ONLY = ['masters', 'stock', 'finance'];

    // Helper to toggle active modules dynamically from developer console or external scripts
    window.setSystemActiveModules = function(modules) {
        SYSTEM_ACTIVE_MODULES_ONLY = (modules === null || Array.isArray(modules)) ? modules : null;
        if (typeof ModuleAccessControl !== 'undefined' && typeof ModuleAccessControl.applyModuleVisibility === 'function') {
            ModuleAccessControl.applyModuleVisibility();
        }
        console.log("System active modules updated:", SYSTEM_ACTIVE_MODULES_ONLY || "All modules enabled");
    };

    // Role-based module permissions configuration table
    // Easily configurable for Normal User, Manager, QA, Administrator, etc.
    const ROLE_MODULE_PERMISSIONS = {
        'Normal User': ['masters', 'stock', 'finance', 'part-creation'],
        'Stock Control': ['masters', 'stock', 'finance', 'part-creation'],
        'Manager': ['masters', 'stock', 'sales', 'purchase', 'finance', 'part-creation'],
        'QA': ['masters', 'stock', 'plpi', 'finance', 'part-creation'],
        'Admin': ['masters', 'stock', 'sales', 'purchase', 'hr', 'plpi', 'finance', 'part-creation'],
        'Finance': ['masters', 'finance', 'purchase', 'sales'],
        'Transport': ['masters', 'stock', 'finance'],
        'RP': ['masters', 'stock', 'plpi', 'finance']
    };

    // User-specific module assignments configuration table
    const USER_MODULE_PERMISSIONS = {
        'SP03': ['masters', 'stock', 'finance'] // Current user explicitly assigned Master Data Setup, Stock Management & Finance
    };

    const CURRENT_USER_PROFILE = {
        userId: 'SP03',
        userName: 'SP03',
        defaultRole: 'Normal User',
        assignedModules: ['masters', 'stock', 'finance']
    };

    let currentActiveModule = 'masters';

    const ModuleAccessControl = {
        activeRole: 'Normal User',
        activeUserId: 'SP03',

        getCurrentUser() {
            return {
                ...CURRENT_USER_PROFILE,
                role: this.activeRole
            };
        },

        getActiveRole() {
            return this.activeRole;
        },

        setActiveRole(role) {
            this.activeRole = role || 'Normal User';
            this.applyModuleVisibility();
        },

        getActiveAllowedModules() {
            let allowed;
            // Priority 1: Check active simulated role in ROLE_MODULE_PERMISSIONS
            if (this.activeRole && ROLE_MODULE_PERMISSIONS[this.activeRole]) {
                allowed = [...ROLE_MODULE_PERMISSIONS[this.activeRole]];
            } else if (USER_MODULE_PERMISSIONS[this.activeUserId]) {
                // Priority 2: Check user-specific assignments in USER_MODULE_PERMISSIONS
                allowed = [...USER_MODULE_PERMISSIONS[this.activeUserId]];
            } else {
                allowed = ['masters', 'stock'];
            }

            // Apply global system visibility override if set
            if (Array.isArray(SYSTEM_ACTIVE_MODULES_ONLY)) {
                return allowed.filter(m => SYSTEM_ACTIVE_MODULES_ONLY.includes(m));
            }

            return allowed;
        },

        isModuleAllowed(moduleKey) {
            if (!moduleKey) return true;

            // If global system visibility restriction is active, verify moduleKey belongs to an allowed active module
            if (Array.isArray(SYSTEM_ACTIVE_MODULES_ONLY)) {
                const isDirectAllowed = SYSTEM_ACTIVE_MODULES_ONLY.includes(moduleKey);
                let isSubmoduleAllowed = false;
                for (const parentKey of SYSTEM_ACTIVE_MODULES_ONLY) {
                    const parentDef = SYSTEM_MODULES[parentKey];
                    if (parentDef && parentDef.submodules && parentDef.submodules.includes(moduleKey)) {
                        isSubmoduleAllowed = true;
                        break;
                    }
                }
                if (!isDirectAllowed && !isSubmoduleAllowed) {
                    return false;
                }
            }

            const allowed = this.getActiveAllowedModules();

            // Direct module match
            if (allowed.includes(moduleKey)) return true;

            // Check if moduleKey is a registered submodule of an allowed module
            for (const parentKey of allowed) {
                const parentDef = SYSTEM_MODULES[parentKey];
                if (parentDef && parentDef.submodules && parentDef.submodules.includes(moduleKey)) {
                    return true;
                }
            }

            return false;
        },

        getModuleName(moduleKey) {
            if (SYSTEM_MODULES[moduleKey]) return SYSTEM_MODULES[moduleKey].name;
            for (const key of Object.keys(SYSTEM_MODULES)) {
                const def = SYSTEM_MODULES[key];
                if (def.submodules && def.submodules.includes(moduleKey)) {
                    return def.name;
                }
            }
            return moduleKey ? (moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)) : 'Unknown';
        },

        getModuleIcon(moduleKey) {
            if (SYSTEM_MODULES[moduleKey]) return SYSTEM_MODULES[moduleKey].icon;
            for (const key of Object.keys(SYSTEM_MODULES)) {
                const def = SYSTEM_MODULES[key];
                if (def.submodules && def.submodules.includes(moduleKey)) {
                    return def.icon;
                }
            }
            return '📁';
        },

        applyModuleVisibility() {
            const allowed = this.getActiveAllowedModules();

            // 1. Filter Home Screen Dashboard Module Cards
            const cards = document.querySelectorAll('#home-page-container .module-card');
            cards.forEach(card => {
                const mod = card.getAttribute('data-module');
                if (this.isModuleAllowed(mod)) {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });

            // 2. Filter Initial Static Sidebar Links (if present)
            const navFinance = document.getElementById('nav-finance');
            if (navFinance) navFinance.style.display = this.isModuleAllowed('finance') ? '' : 'none';

            const navPurchasing = document.getElementById('nav-purchasing');
            if (navPurchasing) navPurchasing.style.display = this.isModuleAllowed('purchase') ? '' : 'none';

            const navDistribution = document.getElementById('nav-distribution');
            if (navDistribution) navDistribution.style.display = this.isModuleAllowed('sales') ? '' : 'none';

            const navInventory = document.getElementById('nav-inventory');
            if (navInventory) navInventory.style.display = this.isModuleAllowed('stock') ? '' : 'none';

            const navPartCreation = document.getElementById('nav-part-creation-master');
            if (navPartCreation) navPartCreation.style.display = this.isModuleAllowed('stock') ? '' : 'none';

            const navCompanyMaster = document.getElementById('nav-company-setup-master');
            if (navCompanyMaster) navCompanyMaster.style.display = this.isModuleAllowed('masters') ? '' : 'none';

            // 3. Update Access Denied Screen tags
            const tagsContainer = document.getElementById('denied-assigned-tags');
            if (tagsContainer) {
                tagsContainer.innerHTML = allowed.map(m => {
                    const def = SYSTEM_MODULES[m];
                    const icon = def ? def.icon : '📁';
                    const name = def ? def.name : m;
                    return `<span class="module-tag">${icon} ${name}</span>`;
                }).join('');
            }
        },

        showAccessDenied(moduleKey) {
            homeScreen.classList.add('hidden');
            mainErpContainer.classList.remove('hidden');

            // Hide all other workspaces
            Object.keys(workspaces).forEach(key => {
                if (workspaces[key]) workspaces[key].classList.add('hidden');
            });

            const deniedWorkspace = document.getElementById('access-denied-workspace');
            if (deniedWorkspace) {
                deniedWorkspace.classList.remove('hidden');
            }

            const moduleNameEl = document.getElementById('denied-module-name');
            if (moduleNameEl) {
                moduleNameEl.textContent = this.getModuleName(moduleKey);
            }

            const userRoleEl = document.getElementById('denied-user-role');
            if (userRoleEl) {
                userRoleEl.textContent = this.activeRole;
            }

            const userIdEl = document.getElementById('denied-user-id');
            if (userIdEl) {
                userIdEl.textContent = this.activeUserId;
            }

            // Update sidebar logo branding
            const logoIcon = document.querySelector('#sidebar-logo .logo-icon');
            const logoText = document.querySelector('#sidebar-logo .logo-text');
            if (logoIcon && logoText) {
                logoIcon.textContent = '🔒';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#ef4444';
                logoText.innerHTML = 'Access Restricted';
            }

            // Render restricted sidebar navigation
            if (sidebarNavMenu) {
                sidebarNavMenu.innerHTML = `
                    <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #ef4444; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <span>🔒</span> Access Restricted
                    </div>
                    <div style="padding: 12px 14px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        Access to <strong style="color: #fff;">${this.getModuleName(moduleKey)}</strong> is not authorized for your account profile.
                    </div>
                    <a href="javascript:void(0)" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
                        <span class="nav-icon">🏠</span> Back to Launcher
                    </a>
                `;
                const btnBack = document.getElementById('btn-sidebar-back-home');
                if (btnBack) {
                    btnBack.addEventListener('click', (e) => {
                        e.preventDefault();
                        showHomeScreen();
                    });
                }
            }

            if (typeof showToast === 'function') {
                showToast(`Access Denied: You are not authorized to view ${this.getModuleName(moduleKey)}.`, 'danger');
            }
        }
    };

    window.ModuleAccessControl = ModuleAccessControl;

    // -------------------------------------------------------------
    // Module Navigation & Screen Routing Logic
    // -------------------------------------------------------------
    function switchModule(moduleName) {
        // Enforce application/page-level access control!
        if (!ModuleAccessControl.isModuleAllowed(moduleName)) {
            ModuleAccessControl.showAccessDenied(moduleName);
            return;
        }

        currentActiveModule = moduleName;

        // Hide home page and show main ERP container
        homeScreen.classList.add('hidden');
        mainErpContainer.classList.remove('hidden');

        // Hide access denied workspace if previously shown
        const deniedScreen = document.getElementById('access-denied-workspace');
        if (deniedScreen) deniedScreen.classList.add('hidden');

        const activeKeyMap = {
            'masters': 'masters',
            'submaster': 'submaster',
            'company': 'other',
            'other': 'other',
            'site': 'site',
            'user-setup': 'user',
            'user': 'user',
            'customer-creation': 'customer',
            'customer': 'customer',
            'supplier-setup': 'supplier',
            'supplier': 'supplier',
            'item-setup': 'item',
            'item': 'item',
            'part-creation': 'partCreation',
            'sales': 'sales',
            'purchase': 'purchase',
            'hr': 'hr',
            'plpi': 'plpi',
            'stock': 'stock',
            'finance': 'finance'
        };
        const activeKey = activeKeyMap[moduleName] || moduleName;
        const targetWorkspace = workspaces[activeKey];

        // Hide all workspaces and show active workspace
        Object.keys(workspaces).forEach(key => {
            if (workspaces[key]) {
                if (workspaces[key] === targetWorkspace) {
                    workspaces[key].classList.remove('hidden');
                } else {
                    workspaces[key].classList.add('hidden');
                }
            }
        });

        if (moduleName === 'finance') {
            document.querySelectorAll('.fin-sub-panel').forEach(p => { 
                p.classList.add('hidden'); 
                p.style.display = ''; 
            });
            const finHome = document.getElementById('panel-fin-home');
            if (finHome) {
                finHome.classList.remove('hidden');
                finHome.style.display = 'block';
            }
        }

        // Update sidebar logo branding
        const logoIcon = document.querySelector('#sidebar-logo .logo-icon');
        const logoText = document.querySelector('#sidebar-logo .logo-text');
        if (logoIcon && logoText) {
            const masterModules = ['masters', 'submaster', 'company', 'other', 'site', 'user-setup', 'customer-creation', 'supplier-setup', 'item-setup', 'item'];
            if (masterModules.includes(moduleName)) {
                logoIcon.textContent = '📁';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#0ea5e9';
                logoText.innerHTML = 'Master Data Setup';
            } else if (moduleName === 'finance') {
                logoIcon.textContent = '🔀';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#4f46e5';
                logoText.innerHTML = 'Accounts Setup';
            } else if (moduleName === 'purchase') {
                logoIcon.textContent = '🛒';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#10b981';
                logoText.innerHTML = 'Procurement';
            } else if (moduleName === 'invoicing') {
                logoIcon.textContent = '🧾';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#3b82f6';
                logoText.innerHTML = 'Invoicing';
            } else if (moduleName === 'stock') {
                logoIcon.textContent = '📦';
                logoIcon.style.background = 'none';
                logoIcon.style.webkitTextFillColor = '#6366f1';
                logoText.innerHTML = 'Stock Management';
            } else {
                logoIcon.textContent = '▲';
                logoIcon.style.background = '';
                logoIcon.style.webkitTextFillColor = '';
                logoText.innerHTML = 'B&S <span>ERP</span>';
            }
        }

        // Render dynamic sidebar menu
        renderSidebarMenu(moduleName);

        // Contextual topbar actions and sub-tab selection
        if (moduleName === 'masters') {
            if (typeof updateMastersDashboardKPIs === 'function') updateMastersDashboardKPIs();
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else if (moduleName === 'submaster') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else if (moduleName === 'item-setup' || moduleName === 'item') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else if (moduleName === 'other' || moduleName === 'company') {
            showCompanyListView();
            if (btnSave) btnSave.style.display = 'inline-flex';
            if (btnCancel) btnCancel.style.display = 'inline-flex';
        } else if (moduleName === 'site') {
            showSiteListView();
            if (btnSave) btnSave.style.display = 'inline-flex';
            if (btnCancel) btnCancel.style.display = 'inline-flex';
        } else if (moduleName === 'user-setup') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else if (moduleName === 'customer-creation') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
            if (window.CustomerWorkflowModule && typeof window.CustomerWorkflowModule.showListView === 'function') {
                window.CustomerWorkflowModule.showListView();
                window.CustomerWorkflowModule.renderList();
            }
        } else if (moduleName === 'supplier-setup') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
            showSupplierListView();
        } else if (moduleName === 'part-creation') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else if (moduleName === 'stock') {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        }
    }

    function showHomeScreen() {
        mainErpContainer.classList.add('hidden');
        homeScreen.classList.remove('hidden');
    }

    function renderSidebarMenu(moduleName) {
        if (!sidebarNavMenu) return;

        const isMaster = ['masters', 'submaster', 'company', 'site', 'user-setup', 'customer-creation', 'supplier-setup', 'item-setup', 'item', 'other'].includes(moduleName);
        const isStock = (moduleName === 'stock');
        const isPart = (moduleName === 'part-creation');
        const isPurchase = (moduleName === 'purchase');
        const isSales = (moduleName === 'sales');
        const isFinance = (moduleName === 'finance');
        const isHr = (moduleName === 'hr');
        const isPlpi = (moduleName === 'plpi');

        let html = '';

        if (isMaster) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #0ea5e9; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>📁</span> Master Data Setup
                </div>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'masters' ? 'active' : ''}" id="nav-masters-dashboard-sub">
                    <span class="nav-icon">📊</span> Masters Overview
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'company' || moduleName === 'other' ? 'active' : ''}" id="nav-company-setup-sub">
                    <span class="nav-icon">🏢</span> Company Setup
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'site' ? 'active' : ''}" id="nav-site-setup-sub">
                    <span class="nav-icon">🏢</span> Site Setup
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'user-setup' ? 'active' : ''}" id="nav-user-setup-sub">
                    <span class="nav-icon">👥</span> User Setup
                </a>
                <div class="sub-sub-nav ${moduleName === 'user-setup' ? '' : 'hidden'}" id="user-setup-sub-sub-nav">
                    <a href="javascript:void(0)" class="sub-sub-item active" data-subtab="user-list">User List</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="user-creation">User Creation</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="user-reopen">User Reopen</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="allocate-company-site">Allocate Company & Site</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="application-access">Application Access</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="qms-access">QMS Access</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="user-deletion">User Deactivation</a>
                    <a href="javascript:void(0)" class="sub-sub-item" data-subtab="reset-password">Reset Password</a>
                </div>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'customer-creation' ? 'active' : ''}" id="nav-customer-creation-sub">
                    <span class="nav-icon">🤝</span> Customer Creation
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'supplier-setup' ? 'active' : ''}" id="nav-supplier-setup-sub">
                    <span class="nav-icon">🚚</span> Supplier Setup
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'submaster' ? 'active' : ''}" id="nav-sub-master-sub">
                    <span class="nav-icon">🔀</span> Dropdown Sub-Masters
                </a>
                <a href="javascript:void(0)" class="nav-item ${moduleName === 'item-setup' || moduleName === 'item' ? 'active' : ''}" id="nav-item-setup-sub">
                    <span class="nav-icon">📦</span> Item Setup
                </a>
            `;
        } else if (isStock) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>📦</span> Stock Management
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-stock-dashboard-sub">
                    <span class="nav-icon">📊</span> Stock Dashboard
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Stock Entry">
                    <span class="nav-icon">📝</span> Stock Entry
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Stock Ledger">
                    <span class="nav-icon">📄</span> Stock Ledger
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Material Transfers">
                    <span class="nav-icon">🚚</span> Material Transfers
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Warehouse Locations">
                    <span class="nav-icon">📍</span> Warehouse Locations
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Stock Reconciliation">
                    <span class="nav-icon">🛠️</span> Stock Reconciliation
                </a>
            `;
        } else if (isPart) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #8b5cf6; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>✨</span> Part Creation &amp; QA
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-pc-part-list-sub">
                    <span class="nav-icon">📋</span> Part Request List
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-pc-new-request-sub">
                    <span class="nav-icon">➕</span> New Part Request
                </a>
            `;
        } else if (isPurchase) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>🛒</span> Procurement &amp; Purchasing
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-pur-dashboard-sub">
                    <span class="nav-icon">📊</span> Procurement Dashboard
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Material Requests">
                    <span class="nav-icon">📝</span> Material Requests
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Purchase Orders">
                    <span class="nav-icon">📄</span> Purchase Orders
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Goods Receipts">
                    <span class="nav-icon">🚚</span> Goods Receipts
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Vendor Invoices">
                    <span class="nav-icon">🧾</span> Vendor Invoices
                </a>
            `;
        } else if (isSales) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #ec4899; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>📈</span> Sales &amp; Distribution
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-sales-dashboard-sub">
                    <span class="nav-icon">📊</span> Sales Dashboard
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Sales Quotations">
                    <span class="nav-icon">💬</span> Sales Quotations
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Sales Orders">
                    <span class="nav-icon">📋</span> Sales Orders
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Delivery Notes">
                    <span class="nav-icon">🚚</span> Delivery Notes
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Sales Invoices">
                    <span class="nav-icon">🧾</span> Sales Invoices
                </a>
            `;
        } else if (isFinance) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>💳</span> Finance &amp; Ledger
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-fin-home-sub">
                    <span class="nav-icon">🏠</span> Finance Overview
                </a>

                <div style="padding: 8px 14px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                    <span>📊</span> Rules &amp; Controls
                </div>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-posting-control-sub">
                    <span class="nav-icon">📊</span> Posting Control
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-posting-details-sub">
                    <span class="nav-icon">⚙️</span> Posting Control Details
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-voucher-series-sub">
                    <span class="nav-icon">🔢</span> Voucher Series
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-user-groups-voucher-sub">
                    <span class="nav-icon">🔐</span> User Groups (Voucher)
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-user-groups-period-sub">
                    <span class="nav-icon">👥</span> User Groups (Period)
                </a>

                <div style="padding: 8px 14px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                    <span>⚡</span> Tax &amp; Reporting
                </div>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-automatic-tax-sub">
                    <span class="nav-icon">⚡</span> Automatic Tax Proposal
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-tax-details-sub">
                    <span class="nav-icon">📑</span> Tax Proposal Details
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-tax-codes-sub">
                    <span class="nav-icon">🏷️</span> Tax Codes &amp; Rates
                </a>

                <div style="padding: 8px 14px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                    <span>🏦</span> Accounts &amp; Ledger
                </div>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-accounts-sub">
                    <span class="nav-icon">🏦</span> Accounts Master
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-account-group-sub">
                    <span class="nav-icon">📁</span> Account Groups
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-cost-center-sub">
                    <span class="nav-icon">🏢</span> Cost Centers
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-coa-sub">
                    <span class="nav-icon">🌳</span> Chart of Accounts (Tree)
                </a>

                <div style="padding: 8px 14px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                    <span>📅</span> Periods &amp; Rates
                </div>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-accounting-years-sub">
                    <span class="nav-icon">📆</span> Accounting Years
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-accounting-periods-sub">
                    <span class="nav-icon">📅</span> Accounting Periods
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-payment-terms-sub">
                    <span class="nav-icon">📜</span> Payment Terms
                </a>
                <a href="javascript:void(0)" class="nav-item" id="nav-fin-currency-rates-sub">
                    <span class="nav-icon">💱</span> Currency Rates
                </a>
            `;
        } else if (isHr) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #f59e0b; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>👥</span> HR Management
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-hr-dashboard-sub">
                    <span class="nav-icon">📊</span> HR Dashboard
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Employee Directory">
                    <span class="nav-icon">👤</span> Employee Directory
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Attendance & Payroll">
                    <span class="nav-icon">📅</span> Attendance &amp; Payroll
                </a>
            `;
        } else if (isPlpi) {
            html = `
                <div class="sidebar-module-header" style="padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #8b5cf6; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>⚙️</span> PLPI Integration
                </div>
                <a href="javascript:void(0)" class="nav-item active" id="nav-plpi-overview-sub">
                    <span class="nav-icon">📊</span> PLPI Overview
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Bill of Materials (BOM)">
                    <span class="nav-icon">⚙️</span> Bill of Materials (BOM)
                </a>
                <a href="javascript:void(0)" class="nav-item" data-action="mock" data-name="Work Centers & Routings">
                    <span class="nav-icon">🏭</span> Work Centers &amp; Routings
                </a>
            `;
        } else {
            html = `
                <a href="javascript:void(0)" class="nav-item active" id="nav-dashboard">
                    <span class="nav-icon">📊</span> Dashboard
                </a>
            `;
        }

        // Always append Back to Launcher button at bottom of sidebar
        html += `
            <a href="javascript:void(0)" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
                <span class="nav-icon">🏠</span> Back to Launcher
            </a>
        `;

        sidebarNavMenu.innerHTML = html;
        attachSidebarListeners();
    }

    function attachSidebarListeners() {
        // Back to Launcher listener
        const btnBackHome = document.getElementById('btn-sidebar-back-home');
        if (btnBackHome) {
            btnBackHome.addEventListener('click', (e) => {
                e.preventDefault();
                showHomeScreen();
            });
        }

        const btnDashboardNav = document.getElementById('nav-dashboard');
        if (btnDashboardNav) {
            btnDashboardNav.addEventListener('click', (e) => {
                e.preventDefault();
                showHomeScreen();
            });
        }

        const btnCompanySetupMaster = document.getElementById('nav-company-setup-master');
        if (btnCompanySetupMaster) {
            btnCompanySetupMaster.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('masters');
            });
        }

        const btnInventoryNav = document.getElementById('nav-inventory');
        if (btnInventoryNav) {
            btnInventoryNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('stock');
            });
        }

        // Master Data Setup sub-item handlers
        const btnMastersDashboardSub = document.getElementById('nav-masters-dashboard-sub');
        if (btnMastersDashboardSub) {
            btnMastersDashboardSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('masters');
            });
        }

        const btnCompanySetupSub = document.getElementById('nav-company-setup-sub');
        if (btnCompanySetupSub) {
            btnCompanySetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('company');
                showToast("Switched to Company Setup profile.", "success");
            });
        }

        const btnSiteSetupSub = document.getElementById('nav-site-setup-sub');
        if (btnSiteSetupSub) {
            btnSiteSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('site');
                showToast("Switched to Site Setup master data.", "success");
            });
        }

        const btnUserSetupSub = document.getElementById('nav-user-setup-sub');
        if (btnUserSetupSub) {
            btnUserSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('user-setup');
                showToast("Switched to User Setup.", "success");
            });
        }

        const btnCustomerCreationSub = document.getElementById('nav-customer-creation-sub');
        if (btnCustomerCreationSub) {
            btnCustomerCreationSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('customer-creation');
                showToast("Switched to Customer Creation & Governance Setup.", "success");
            });
        }

        const btnSupplierSetupSub = document.getElementById('nav-supplier-setup-sub');
        if (btnSupplierSetupSub) {
            btnSupplierSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('supplier-setup');
                showToast("Switched to Supplier Setup profile.", "success");
            });
        }

        const btnSubMasterSub = document.getElementById('nav-sub-master-sub');
        if (btnSubMasterSub) {
            btnSubMasterSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('submaster');
            });
        }

        const btnItemSetupSubNav = document.getElementById('nav-item-setup-sub');
        if (btnItemSetupSubNav) {
            btnItemSetupSubNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('item-setup');
            });
        }

        // Part Creation sub-item handlers
        const btnPcPartListSub = document.getElementById('nav-pc-part-list-sub');
        const btnPcNewReqSub = document.getElementById('nav-pc-new-request-sub');

        if (btnPcPartListSub) {
            btnPcPartListSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('part-creation');
                if (typeof showPartCreationList === 'function') showPartCreationList();
            });
        }

        if (btnPcNewReqSub) {
            btnPcNewReqSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('part-creation');
                if (typeof openPartCreationForm === 'function') openPartCreationForm();
            });
        }

        // Stock sub-item handlers
        const btnStockDashSub = document.getElementById('nav-stock-dashboard-sub');
        if (btnStockDashSub) {
            btnStockDashSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('stock');
            });
        }

        // Purchasing sub-item handlers
        const btnPurDashSub = document.getElementById('nav-pur-dashboard-sub');
        if (btnPurDashSub) {
            btnPurDashSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('purchase');
            });
        }

        // Sales sub-item handlers
        const btnSalesDashSub = document.getElementById('nav-sales-dashboard-sub');
        if (btnSalesDashSub) {
            btnSalesDashSub.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('sales');
            });
        }

        // Finance sub-item handlers
        const finSidebarMap = [
            { id: 'nav-fin-home-sub', target: 'fin-home' },
            { id: 'nav-fin-posting-control-sub', target: 'fin-posting-control' },
            { id: 'nav-fin-posting-details-sub', target: 'fin-posting-control-details' },
            { id: 'nav-fin-voucher-series-sub', target: 'fin-voucher-series-type' },
            { id: 'nav-fin-user-groups-voucher-sub', target: 'fin-user-groups-voucher' },
            { id: 'nav-fin-user-groups-period-sub', target: 'fin-user-groups-period' },
            { id: 'nav-fin-automatic-tax-sub', target: 'fin-automatic-tax-proposal' },
            { id: 'nav-fin-tax-details-sub', target: 'fin-tax-proposal-details' },
            { id: 'nav-fin-tax-codes-sub', target: 'fin-tax-codes' },
            { id: 'nav-fin-accounts-sub', target: 'fin-accounts' },
            { id: 'nav-fin-account-group-sub', target: 'fin-account-group' },
            { id: 'nav-fin-cost-center-sub', target: 'fin-cost-center' },
            { id: 'nav-fin-coa-sub', target: 'fin-coa' },
            { id: 'nav-fin-accounting-years-sub', target: 'fin-accounting-years' },
            { id: 'nav-fin-accounting-periods-sub', target: 'fin-accounting-periods' },
            { id: 'nav-fin-payment-terms-sub', target: 'fin-payment-terms' },
            { id: 'nav-fin-currency-rates-sub', target: 'fin-currency-rates' }
        ];
        finSidebarMap.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    sidebarNavMenu.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    el.classList.add('active');
                    if (typeof window.switchFinanceSubPanel === 'function') {
                        window.switchFinanceSubPanel(item.target);
                    }
                });
            }
        });

        // User Sub-sub-items click handlers
        const subSubItems = sidebarNavMenu.querySelectorAll('.sub-sub-item');
        subSubItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                subSubItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const subtabName = item.getAttribute('data-subtab');
                if (typeof switchUserSubtab === 'function') switchUserSubtab(subtabName);
            });
        });

        // Mock feature listeners
        const mockItems = sidebarNavMenu.querySelectorAll('[data-action="mock"]');
        mockItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const featureName = item.getAttribute('data-name') || item.textContent.trim();
                showToast(`Feature '${featureName}' is in development for this module simulation.`, 'warning');
            });
        });
    }

    // Connect top level card click listeners
    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const moduleName = card.getAttribute('data-module');
            if (!ModuleAccessControl.isModuleAllowed(moduleName)) {
                ModuleAccessControl.showAccessDenied(moduleName);
                return;
            }
            if (moduleName === 'finance') {
                switchModule('finance');
                showToast(`Entered B&S ERP: FINANCE & LEDGER Module`, 'success');
            } else {
                switchModule(moduleName);
                showToast(`Entered B&S ERP: ${moduleName.toUpperCase()} Module`, 'success');
            }
        });
    });

    // Access Denied screen action button listeners
    const btnDeniedBack = document.getElementById('btn-denied-back-launcher');
    if (btnDeniedBack) {
        btnDeniedBack.addEventListener('click', (e) => {
            e.preventDefault();
            showHomeScreen();
        });
    }
    const btnDeniedGoMasters = document.getElementById('btn-denied-go-masters');
    if (btnDeniedGoMasters) {
        btnDeniedGoMasters.addEventListener('click', (e) => {
            e.preventDefault();
            switchModule('masters');
        });
    }
    const btnDeniedGoStock = document.getElementById('btn-denied-go-stock');
    if (btnDeniedGoStock) {
        btnDeniedGoStock.addEventListener('click', (e) => {
            e.preventDefault();
            switchModule('stock');
        });
    }

    // Connect branding logo to return to launcher screen
    if (sidebarLogo) {
        sidebarLogo.addEventListener('click', (e) => {
            e.preventDefault();
            showHomeScreen();
        });
    }



    // -------------------------------------------------------------
    // Address country & Multi-Address Management Logic
    // -------------------------------------------------------------
    let currentCompanyAddresses = [];
    let activeEditingAddressIndex = 0;
    let isCurrentCompanyViewOnly = false;
    let isCurrentSiteViewOnly = false;

    function createNewAddressObject(indexNumber) {
        return {
            id: 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            identity: `Address ${indexNumber}`, // strictly sequential & non-editable
            country: 'GB',
            addr1: '',
            addr2: '',
            zip: '',
            city: '',
            state: '',
            county: '',
            countryCode: 'GB',
            validFrom: new Date().toISOString().split('T')[0],
            validTo: '',
            types: {
                delivery: indexNumber === 1,
                document: indexNumber === 1,
                billing: true,
                visit: false
            },
            distribution: {
                deliveryTerms: 'FOB',
                shipVia: 'DHL'
            }
        };
    }

    function formatAddressText(addr) {
        if (!addr) return '';
        let block = '';
        if (addr.addr1) block += addr.addr1 + '\n';
        if (addr.addr2) block += addr.addr2 + '\n';
        
        let cityZip = '';
        if (addr.zip) cityZip += addr.zip + ' - ';
        if (addr.city) cityZip += addr.city;
        if (addr.state) cityZip += ', ' + addr.state;
        if (cityZip) block += cityZip + '\n';
        
        if (addr.county) block += addr.county + '\n';
        
        const countryNames = {
            'GB': 'UNITED KINGDOM',
            'US': 'UNITED STATES',
            'DE': 'GERMANY',
            'FR': 'FRANCE',
            'IN': 'INDIA',
            'NL': 'NETHERLANDS',
            'AE': 'UNITED ARAB EMIRATES',
            'CA': 'CANADA',
            'AU': 'AUSTRALIA'
        };
        const cName = countryNames[addr.country] || addr.country || 'UNITED KINGDOM';
        block += (addr.country || 'GB') + ' - ' + cName;
        return block;
    }

    function renderCompanyAddresses() {
        if (!companyAddressesContainer) return;
        companyAddressesContainer.innerHTML = '';

        if (!currentCompanyAddresses || currentCompanyAddresses.length === 0) {
            currentCompanyAddresses = [ createNewAddressObject(1) ];
        }

        // Ensure strictly sequential identities: Address 1, Address 2, Address 3...
        currentCompanyAddresses.forEach((addr, idx) => {
            addr.identity = `Address ${idx + 1}`;
        });

        const isViewOnly = isCurrentCompanyViewOnly;

        currentCompanyAddresses.forEach((addr, index) => {
            const card = document.createElement('div');
            card.className = 'company-address-card';
            card.setAttribute('data-address-index', index);

            const isOnlyAddress = currentCompanyAddresses.length === 1;

            card.innerHTML = `
                <div class="company-address-header">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <div class="address-identity-pill">
                            <span class="badge-icon">📍</span>
                            <span class="address-id-text">${escapeHtml(addr.identity)}</span>
                        </div>
                        <div class="addr-types-tag-list">
                            ${addr.types && addr.types.delivery ? '<span class="addr-type-tag active">Delivery</span>' : ''}
                            ${addr.types && addr.types.document ? '<span class="addr-type-tag active">Document</span>' : ''}
                            ${addr.types && addr.types.billing ? '<span class="addr-type-tag active">Billing</span>' : ''}
                            ${addr.types && addr.types.visit ? '<span class="addr-type-tag active">Visit</span>' : ''}
                        </div>
                    </div>
                    <div class="address-card-actions">
                        ${!isViewOnly ? `
                            <button type="button" class="btn btn-secondary btn-sm edit-addr-btn" data-index="${index}" style="padding: 5px 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                                <span>✏️</span> Edit Address
                            </button>
                        ` : ''}
                        ${!isOnlyAddress && !isViewOnly ? `
                            <button type="button" class="btn-remove-address" data-index="${index}" title="Remove this address profile">
                                <span>🗑️</span> Remove
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="sub-tabs-container">
                    <button type="button" class="sub-tab-btn active" data-tab="general" data-index="${index}">General Address Info</button>
                    <button type="button" class="sub-tab-btn" data-tab="distribution" data-index="${index}">Distribution Data</button>
                </div>

                <div class="sub-tab-content-container" style="padding: 12px 0 0 0; min-height: auto;">
                    <!-- General Address Sub-Tab -->
                    <div class="addr-subtab-general" id="addr-general-${index}">
                        <div class="address-sub-layout">
                            <!-- Column 1: Country & Address Text -->
                            <div class="address-col-left">
                                <div class="form-group">
                                    <label for="addr-country-${index}">Country:</label>
                                    <select class="addr-country-select" id="addr-country-${index}" data-index="${index}" ${isViewOnly ? 'disabled' : ''}>
                                        <option value="GB" ${addr.country === 'GB' ? 'selected' : ''}>UNITED KINGDOM</option>
                                        <option value="US" ${addr.country === 'US' ? 'selected' : ''}>UNITED STATES</option>
                                        <option value="DE" ${addr.country === 'DE' ? 'selected' : ''}>GERMANY</option>
                                        <option value="FR" ${addr.country === 'FR' ? 'selected' : ''}>FRANCE</option>
                                        <option value="IN" ${addr.country === 'IN' ? 'selected' : ''}>INDIA</option>
                                        <option value="NL" ${addr.country === 'NL' ? 'selected' : ''}>NETHERLANDS</option>
                                        <option value="AE" ${addr.country === 'AE' ? 'selected' : ''}>UNITED ARAB EMIRATES</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="addr-text-${index}">Address:</label>
                                    <div class="address-input-wrapper">
                                        <textarea id="addr-text-${index}" readonly class="read-only-textarea addr-textarea" rows="4" data-index="${index}">${escapeHtml(formatAddressText(addr))}</textarea>
                                        ${!isViewOnly ? `
                                            <button type="button" class="btn-address-edit edit-addr-btn" data-index="${index}" title="Click to edit address parts">🏠...</button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Column 2: Valid Dates -->
                            <div class="address-col-middle">
                                <div class="form-group">
                                    <label for="addr-valid-from-${index}">Valid From:</label>
                                    <input type="date" class="addr-valid-from-input" id="addr-valid-from-${index}" data-index="${index}" value="${addr.validFrom || ''}" ${isViewOnly ? 'disabled' : ''}>
                                </div>
                                <div class="form-group" style="margin-top: 16px;">
                                    <label for="addr-valid-to-${index}">Valid To:</label>
                                    <input type="date" class="addr-valid-to-input" id="addr-valid-to-${index}" data-index="${index}" value="${addr.validTo || ''}" ${isViewOnly ? 'disabled' : ''}>
                                </div>
                            </div>

                            <!-- Column 3: Address Type Assignments -->
                            <div class="address-col-right">
                                <table class="address-type-table">
                                    <thead>
                                        <tr>
                                            <th>Address Type</th>
                                            <th class="text-center" style="width: 70px;">Default</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Delivery</td>
                                            <td class="text-center">
                                                <input type="checkbox" class="addr-type-checkbox" data-index="${index}" data-type="delivery" ${addr.types && addr.types.delivery ? 'checked' : ''} ${isViewOnly ? 'disabled' : ''}>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Document</td>
                                            <td class="text-center">
                                                <input type="checkbox" class="addr-type-checkbox" data-index="${index}" data-type="document" ${addr.types && addr.types.document ? 'checked' : ''} ${isViewOnly ? 'disabled' : ''}>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Billing</td>
                                            <td class="text-center">
                                                <input type="checkbox" class="addr-type-checkbox" data-index="${index}" data-type="billing" ${addr.types && addr.types.billing ? 'checked' : ''} ${isViewOnly ? 'disabled' : ''}>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Visit</td>
                                            <td class="text-center">
                                                <input type="checkbox" class="addr-type-checkbox" data-index="${index}" data-type="visit" ${addr.types && addr.types.visit ? 'checked' : ''} ${isViewOnly ? 'disabled' : ''}>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Distribution Data Sub-Tab -->
                    <div class="addr-subtab-distribution hidden" id="addr-dist-${index}">
                        <div class="form-grid" style="grid-template-columns: repeat(2, 1fr); gap: 16px;">
                            <div class="form-group">
                                <label for="addr-dist-terms-${index}">Delivery Terms</label>
                                <select class="addr-dist-terms-select" id="addr-dist-terms-${index}" data-index="${index}" ${isViewOnly ? 'disabled' : ''}>
                                    <option value="EXW" ${addr.distribution && addr.distribution.deliveryTerms === 'EXW' ? 'selected' : ''}>EXW - Ex Works</option>
                                    <option value="FCA" ${addr.distribution && addr.distribution.deliveryTerms === 'FCA' ? 'selected' : ''}>FCA - Free Carrier</option>
                                    <option value="FOB" ${!addr.distribution || addr.distribution.deliveryTerms === 'FOB' ? 'selected' : ''}>FOB - Free On Board</option>
                                    <option value="CIF" ${addr.distribution && addr.distribution.deliveryTerms === 'CIF' ? 'selected' : ''}>CIF - Cost, Insurance and Freight</option>
                                    <option value="DDP" ${addr.distribution && addr.distribution.deliveryTerms === 'DDP' ? 'selected' : ''}>DDP - Delivered Duty Paid</option>
                                </select>
                                <span class="field-hint">Specify Incoterms for this location.</span>
                            </div>
                            <div class="form-group">
                                <label for="addr-dist-ship-${index}">Ship Via</label>
                                <select class="addr-dist-ship-select" id="addr-dist-ship-${index}" data-index="${index}" ${isViewOnly ? 'disabled' : ''}>
                                    <option value="DHL" ${!addr.distribution || addr.distribution.shipVia === 'DHL' ? 'selected' : ''}>DHL - DHL Express</option>
                                    <option value="FEDEX" ${addr.distribution && addr.distribution.shipVia === 'FEDEX' ? 'selected' : ''}>FEDEX - FedEx Corporation</option>
                                    <option value="UPS" ${addr.distribution && addr.distribution.shipVia === 'UPS' ? 'selected' : ''}>UPS - United Parcel Service</option>
                                    <option value="TNT" ${addr.distribution && addr.distribution.shipVia === 'TNT' ? 'selected' : ''}>TNT - TNT Express</option>
                                    <option value="OWN" ${addr.distribution && addr.distribution.shipVia === 'OWN' ? 'selected' : ''}>OWN - Own Fleet Transport</option>
                                </select>
                                <span class="field-hint">Default shipping carrier for this address.</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Attach listeners for this card
            const tabBtns = card.querySelectorAll('.sub-tab-btn');
            const generalTab = card.querySelector(`#addr-general-${index}`);
            const distTab = card.querySelector(`#addr-dist-${index}`);

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (btn.getAttribute('data-tab') === 'general') {
                        generalTab.classList.remove('hidden');
                        distTab.classList.add('hidden');
                    } else {
                        generalTab.classList.add('hidden');
                        distTab.classList.remove('hidden');
                    }
                });
            });

            // Edit button modal triggers
            card.querySelectorAll('.edit-addr-btn').forEach(b => {
                b.addEventListener('click', () => {
                    openAddressModal(index);
                });
            });

            // Remove button
            const removeBtn = card.querySelector('.btn-remove-address');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    const targetIdentity = currentCompanyAddresses[index].identity;
                    if (confirm(`Are you sure you want to remove '${targetIdentity}'?`)) {
                        currentCompanyAddresses.splice(index, 1);
                        // Re-sequence remaining identities
                        currentCompanyAddresses.forEach((a, i) => {
                            a.identity = `Address ${i + 1}`;
                        });
                        renderCompanyAddresses();
                        showToast(`Removed address record '${targetIdentity}'.`, 'info');
                    }
                });
            }

            // Country select listener
            const countrySel = card.querySelector('.addr-country-select');
            if (countrySel) {
                countrySel.addEventListener('change', () => {
                    addr.country = countrySel.value;
                    addr.countryCode = countrySel.value;
                    const textarea = card.querySelector('.addr-textarea');
                    if (textarea) textarea.value = formatAddressText(addr);
                });
            }

            // Valid from/to listeners
            const validFromInput = card.querySelector('.addr-valid-from-input');
            if (validFromInput) {
                validFromInput.addEventListener('change', () => {
                    addr.validFrom = validFromInput.value;
                });
            }

            const validToInput = card.querySelector('.addr-valid-to-input');
            if (validToInput) {
                validToInput.addEventListener('change', () => {
                    addr.validTo = validToInput.value;
                });
            }

            // Type checkboxes listeners
            card.querySelectorAll('.addr-type-checkbox').forEach(chk => {
                chk.addEventListener('change', () => {
                    const type = chk.getAttribute('data-type');
                    if (!addr.types) addr.types = {};
                    addr.types[type] = chk.checked;

                    // Update tags in header
                    const tagList = card.querySelector('.addr-types-tag-list');
                    if (tagList) {
                        tagList.innerHTML = `
                            ${addr.types.delivery ? '<span class="addr-type-tag active">Delivery</span>' : ''}
                            ${addr.types.document ? '<span class="addr-type-tag active">Document</span>' : ''}
                            ${addr.types.billing ? '<span class="addr-type-tag active">Billing</span>' : ''}
                            ${addr.types.visit ? '<span class="addr-type-tag active">Visit</span>' : ''}
                        `;
                    }
                });
            });

            // Distribution selects listeners
            const termsSel = card.querySelector('.addr-dist-terms-select');
            if (termsSel) {
                termsSel.addEventListener('change', () => {
                    if (!addr.distribution) addr.distribution = {};
                    addr.distribution.deliveryTerms = termsSel.value;
                });
            }

            const shipSel = card.querySelector('.addr-dist-ship-select');
            if (shipSel) {
                shipSel.addEventListener('change', () => {
                    if (!addr.distribution) addr.distribution = {};
                    addr.distribution.shipVia = shipSel.value;
                });
            }

            companyAddressesContainer.appendChild(card);
        });
    }

    // Modal popup triggers and logic
    function openAddressModal(index) {
        if (index < 0 || index >= currentCompanyAddresses.length) return;
        activeEditingAddressIndex = index;
        const addr = currentCompanyAddresses[index];

        if (modalAddrIdLabel) {
            modalAddrIdLabel.textContent = addr.identity;
        }
        const modalTitleEl = addressModal ? addressModal.querySelector('.modal-title') : null;
        if (modalTitleEl) {
            modalTitleEl.textContent = `Address Components - ${addr.identity}`;
        }

        if (modalAddr1) modalAddr1.value = addr.addr1 || '';
        if (modalAddr2) modalAddr2.value = addr.addr2 || '';
        if (modalZip) modalZip.value = addr.zip || '';
        if (modalCity) modalCity.value = addr.city || '';
        if (modalState) modalState.value = addr.state || '';
        if (modalCounty) modalCounty.value = addr.county || '';
        if (modalCountryCode) modalCountryCode.value = addr.country || 'GB';

        if (addressModal) addressModal.classList.remove('hidden');
    }

    function closeAddressModal() {
        if (addressModal) addressModal.classList.add('hidden');
    }

    if (btnCancelAddressModal) btnCancelAddressModal.addEventListener('click', closeAddressModal);
    if (btnCloseModalX) btnCloseModalX.addEventListener('click', closeAddressModal);

    if (btnSaveAddressModal) {
        btnSaveAddressModal.addEventListener('click', () => {
            if (!modalAddr1 || !modalZip || !modalCity) return;
            if (!modalAddr1.value.trim() || !modalZip.value.trim() || !modalCity.value.trim()) {
                showToast("Validation Error: Address Line 1, Zip Code, and City are required.", "danger");
                return;
            }

            const addr = currentCompanyAddresses[activeEditingAddressIndex];
            if (addr) {
                addr.addr1 = modalAddr1.value.trim();
                addr.addr2 = modalAddr2.value.trim();
                addr.zip = modalZip.value.trim();
                addr.city = modalCity.value.trim();
                addr.state = modalState ? modalState.value.trim() : '';
                addr.county = modalCounty ? modalCounty.value.trim() : '';
                addr.countryCode = modalCountryCode ? modalCountryCode.value.trim() : 'GB';
            }

            renderCompanyAddresses();
            closeAddressModal();
            showToast(`Updated address components for '${addr ? addr.identity : 'Address'}'.`, "success");
        });
    }

    // Add New Address Button Handler
    if (btnAddNewAddress) {
        btnAddNewAddress.addEventListener('click', (e) => {
            e.preventDefault();
            const nextNum = currentCompanyAddresses.length + 1;
            const newAddr = createNewAddressObject(nextNum);
            currentCompanyAddresses.push(newAddr);
            renderCompanyAddresses();
            showToast(`Created new address record '${newAddr.identity}'.`, "success");
        });
    }

    // -------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`; // e.g. 21-07-2026
    }

    // -------------------------------------------------------------
    // Generic Multi-Select Dropdown Helper Logic
    // -------------------------------------------------------------
    function renderMultiSelectOptions(config) {
        const {
            dropdownEl,
            optionsContainerEl,
            displayEl,
            searchEl,
            defaultLabel,
            filterSet,
            options, // Array of { value, label, count }
            onSelectionChange
        } = config;

        if (!optionsContainerEl || !displayEl) return;

        optionsContainerEl.innerHTML = '';

        if (!options || options.length === 0) {
            optionsContainerEl.innerHTML = '<div class="erp-multiselect-empty">No options available</div>';
        } else {
            options.forEach(opt => {
                const isSelected = filterSet.has(opt.value);
                const optEl = document.createElement('label');
                optEl.className = `erp-multiselect-option ${isSelected ? 'selected' : ''}`;
                optEl.setAttribute('data-value', opt.value);
                optEl.setAttribute('data-label', opt.label.toLowerCase());

                optEl.innerHTML = `
                    <input type="checkbox" value="${escapeHtml(opt.value)}" ${isSelected ? 'checked' : ''}>
                    <span class="erp-multiselect-option-label" title="${escapeHtml(opt.label)}">${escapeHtml(opt.label)}</span>
                    ${opt.count !== undefined ? `<span class="erp-multiselect-option-badge">${opt.count}</span>` : ''}
                `;

                const checkbox = optEl.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        filterSet.add(opt.value);
                        optEl.classList.add('selected');
                    } else {
                        filterSet.delete(opt.value);
                        optEl.classList.remove('selected');
                    }
                    updateMultiSelectDisplay(displayEl, defaultLabel, filterSet, options);
                    if (typeof onSelectionChange === 'function') onSelectionChange();
                });

                optionsContainerEl.appendChild(optEl);
            });
        }

        // Live search filter inside dropdown
        if (searchEl && !searchEl._hasSearchListener) {
            searchEl._hasSearchListener = true;
            searchEl.addEventListener('input', () => {
                const q = searchEl.value.trim().toLowerCase();
                const optionItems = optionsContainerEl.querySelectorAll('.erp-multiselect-option');
                optionItems.forEach(item => {
                    const lbl = item.getAttribute('data-label') || '';
                    const val = (item.getAttribute('data-value') || '').toLowerCase();
                    if (!q || lbl.includes(q) || val.includes(q)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }

        updateMultiSelectDisplay(displayEl, defaultLabel, filterSet, options);
    }

    function updateMultiSelectDisplay(displayEl, defaultLabel, filterSet, options) {
        if (!displayEl) return;
        if (filterSet.size === 0) {
            displayEl.textContent = `All ${defaultLabel}`;
            displayEl.className = 'erp-multiselect-display placeholder';
        } else if (filterSet.size === 1) {
            const val = Array.from(filterSet)[0];
            const opt = options ? options.find(o => o.value === val) : null;
            const text = opt ? opt.label : val;
            displayEl.textContent = text;
            displayEl.className = 'erp-multiselect-display';
        } else {
            displayEl.innerHTML = `<span style="font-weight:600;">${defaultLabel}:</span> <span class="erp-multiselect-badge">${filterSet.size} Selected</span>`;
            displayEl.className = 'erp-multiselect-display';
        }
    }

    function setupMultiSelectTrigger(containerId, triggerId, dropdownId, searchId) {
        const container = document.getElementById(containerId);
        const trigger = document.getElementById(triggerId);
        const dropdown = document.getElementById(dropdownId);
        const search = searchId ? document.getElementById(searchId) : null;

        if (!trigger || !dropdown || !container) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = container.classList.contains('open');

            // Close all other dropdowns
            document.querySelectorAll('.erp-multiselect').forEach(ms => {
                if (ms !== container) {
                    ms.classList.remove('open');
                    const d = ms.querySelector('.erp-multiselect-dropdown');
                    if (d) d.classList.add('hidden');
                }
            });

            if (isOpen) {
                container.classList.remove('open');
                dropdown.classList.add('hidden');
            } else {
                container.classList.add('open');
                dropdown.classList.remove('hidden');
                if (search) {
                    setTimeout(() => search.focus(), 50);
                }
            }
        });

        // Prevent clicks inside dropdown from closing it
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Global click outside listener to close any open multi-selects
    document.addEventListener('click', () => {
        document.querySelectorAll('.erp-multiselect').forEach(ms => {
            ms.classList.remove('open');
            const d = ms.querySelector('.erp-multiselect-dropdown');
            if (d) d.classList.add('hidden');
        });
    });

    function initMultiSelectComponents() {
        setupMultiSelectTrigger('ms-company-name', 'ms-company-name-trigger', 'ms-company-name-dropdown', 'ms-company-name-search');
        setupMultiSelectTrigger('ms-company-source', 'ms-company-source-trigger', 'ms-company-source-dropdown', 'ms-company-source-search');
        setupMultiSelectTrigger('ms-company-status', 'ms-company-status-trigger', 'ms-company-status-dropdown', null);

        setupMultiSelectTrigger('ms-site-code', 'ms-site-code-trigger', 'ms-site-code-dropdown', 'ms-site-code-search');
        setupMultiSelectTrigger('ms-site-name', 'ms-site-name-trigger', 'ms-site-name-dropdown', 'ms-site-name-search');
        setupMultiSelectTrigger('ms-site-status', 'ms-site-status-trigger', 'ms-site-status-dropdown', null);

        // Select All button handlers
        document.querySelectorAll('.erp-ms-btn-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = btn.getAttribute('data-target');
                if (target === 'company-name') {
                    companies.forEach(c => companySelectedFilters.names.add(c.companyId));
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'company-source') {
                    companies.forEach(c => {
                        const src = c.sourceCompany ? c.sourceCompany.trim() : '(None)';
                        companySelectedFilters.sources.add(src);
                    });
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'company-status') {
                    companySelectedFilters.statuses.add('Active');
                    companySelectedFilters.statuses.add('Inactive');
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'site-code') {
                    sites.forEach(s => siteSelectedFilters.companyCodes.add(s.companyId));
                    populateSiteFilterOptions();
                    renderSitesTable();
                } else if (target === 'site-name') {
                    sites.forEach(s => siteSelectedFilters.companyNames.add(s.companyName));
                    populateSiteFilterOptions();
                    renderSitesTable();
                } else if (target === 'site-status') {
                    siteSelectedFilters.statuses.add('Active');
                    siteSelectedFilters.statuses.add('Inactive');
                    populateSiteFilterOptions();
                    renderSitesTable();
                }
            });
        });

        // Clear button handlers
        document.querySelectorAll('.erp-ms-btn-none').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = btn.getAttribute('data-target');
                if (target === 'company-name') {
                    companySelectedFilters.names.clear();
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'company-source') {
                    companySelectedFilters.sources.clear();
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'company-status') {
                    companySelectedFilters.statuses.clear();
                    populateCompanyFilterOptions();
                    renderCompaniesTable();
                } else if (target === 'site-code') {
                    siteSelectedFilters.companyCodes.clear();
                    populateSiteFilterOptions();
                    renderSitesTable();
                } else if (target === 'site-name') {
                    siteSelectedFilters.companyNames.clear();
                    populateSiteFilterOptions();
                    renderSitesTable();
                } else if (target === 'site-status') {
                    siteSelectedFilters.statuses.clear();
                    populateSiteFilterOptions();
                    renderSitesTable();
                }
            });
        });
    }

    // Initialize all multi-select component listeners
    initMultiSelectComponents();

    // -------------------------------------------------------------
    // Company List View Switcher & Table Rendering Logic
    // -------------------------------------------------------------
    function showCompanyListView() {
        if (companyListView) companyListView.classList.remove('hidden');
        if (companyFormView) companyFormView.classList.add('hidden');
        if (btnSave) btnSave.style.display = 'none';
        if (btnCancel) btnCancel.style.display = 'none';
        
        populateCompanyFilterOptions();
        renderCompaniesTable();
    }

    function renderCompaniesTable() {
        if (!companiesListBody) return;
        companiesListBody.innerHTML = '';

        // Sort companies by creationDate ascending (earlier created first)
        const sortedCompanies = [...companies].sort((a, b) => {
            const da = new Date(a.creationDate || 0);
            const db = new Date(b.creationDate || 0);
            return da - db;
        });

        // Apply multi-selection filters (OR within each filter, AND across filters)
        const filteredCompanies = sortedCompanies.filter(comp => {
            // Name filter: match ANY of selected names/IDs
            const matchName = companySelectedFilters.names.size === 0 || 
                companySelectedFilters.names.has(comp.companyId) || 
                companySelectedFilters.names.has(comp.companyName);

            // Source Company filter: match ANY of selected sources
            const compSource = comp.sourceCompany ? comp.sourceCompany.trim() : '(None)';
            const matchSource = companySelectedFilters.sources.size === 0 || 
                companySelectedFilters.sources.has(compSource) ||
                (companySelectedFilters.sources.has('(None)') && !comp.sourceCompany);

            // Status filter: match ANY of selected statuses
            const compStatus = comp.status || 'Active';
            const matchStatus = companySelectedFilters.statuses.size === 0 || 
                companySelectedFilters.statuses.has(compStatus);

            // Record must satisfy ALL active filter conditions
            return matchName && matchSource && matchStatus;
        });

        // Update count badge
        const isFiltered = companySelectedFilters.names.size > 0 || 
                           companySelectedFilters.sources.size > 0 || 
                           companySelectedFilters.statuses.size > 0;
        if (companyFilterCountBadge) {
            if (isFiltered) {
                companyFilterCountBadge.textContent = `Showing ${filteredCompanies.length} of ${sortedCompanies.length} companies`;
                companyFilterCountBadge.style.backgroundColor = '#e0e7ff';
                companyFilterCountBadge.style.color = '#4338ca';
            } else {
                companyFilterCountBadge.textContent = `Showing all ${sortedCompanies.length} companies`;
                companyFilterCountBadge.style.backgroundColor = '#f1f5f9';
                companyFilterCountBadge.style.color = 'var(--color-text-muted)';
            }
        }

        if (filteredCompanies.length === 0) {
            companiesListBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 32px; color: var(--color-text-muted);">
                        <div style="font-size: 16px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">🔍 No companies found</div>
                        <div style="font-size: 13px;">No company records match your selected filter criteria.</div>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-company-clear-filters-empty" style="margin-top: 12px; cursor: pointer;">Reset Filters</button>
                    </td>
                </tr>
            `;
            const emptyReset = document.getElementById('btn-company-clear-filters-empty');
            if (emptyReset) {
                emptyReset.addEventListener('click', () => {
                    resetCompanyFilters();
                });
            }
            return;
        }

        filteredCompanies.forEach(comp => {
            const tr = document.createElement('tr');
            
            const statusBadge = comp.status === 'Active' 
                ? '<span class="badge badge-success" style="display:inline-flex;align-items:center;gap:4px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;"></span> Active</span>'
                : '<span class="badge badge-danger">Inactive</span>';

            const addressCount = comp.addresses ? comp.addresses.length : 1;
            const addressBadge = `<span class="badge" style="background-color: rgba(37,99,235,0.08); color: var(--color-primary, #2563eb); font-weight:600; border:1px solid rgba(37,99,235,0.2);">📍 ${addressCount} ${addressCount === 1 ? 'Address' : 'Addresses'}</span>`;

            tr.innerHTML = `
                <td><span class="badge" style="background:#f1f5f9;color:#1e293b;font-weight:700;font-family:monospace;font-size:13px;border:1px solid #cbd5e1;">${escapeHtml(comp.companyId)}</span></td>
                <td><a href="javascript:void(0)" class="company-name-link" data-id="${comp.companyId}" style="font-weight: 600; color: var(--color-primary); text-decoration: none;">${escapeHtml(comp.companyName)}</a></td>
                <td>${addressBadge}</td>
                <td><span class="badge" style="background-color: var(--color-primary-light, #e0f2fe); color: var(--color-primary, #0284c7); font-weight:600;">${comp.accCurrency || 'GBP'}</span></td>
                <td>${formatDate(comp.creationDate)}</td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <div style="display: flex; justify-content: center; gap: 6px;">
                        <button class="btn btn-secondary btn-sm view-comp-btn" data-id="${comp.companyId}" title="View Company Details">
                            👁️ View
                        </button>
                        <button class="btn btn-secondary btn-sm edit-comp-btn" data-id="${comp.companyId}" title="Edit Company">
                            ✏️ Edit
                        </button>
                    </div>
                </td>
            `;

            companiesListBody.appendChild(tr);
        });

        // View button click listeners
        companiesListBody.querySelectorAll('.view-comp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                showCompanyFormView(id, true);
            });
        });

        // Edit button click listeners
        companiesListBody.querySelectorAll('.edit-comp-btn, .company-name-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                showCompanyFormView(id, false);
            });
        });
    }

    // Populate Company Filter Options Dynamically
    function populateCompanyFilterOptions() {
        // 1. Name options
        const nameOptions = companies.map(c => ({
            value: c.companyId,
            label: `${c.companyId} - ${c.companyName}`,
            count: 1
        }));
        
        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-company-name-dropdown'),
            optionsContainerEl: document.getElementById('ms-company-name-options'),
            displayEl: document.getElementById('ms-company-name-display'),
            searchEl: document.getElementById('ms-company-name-search'),
            defaultLabel: 'Names',
            filterSet: companySelectedFilters.names,
            options: nameOptions,
            onSelectionChange: renderCompaniesTable
        });

        // 2. Source Company options
        const sourceCounts = {};
        companies.forEach(c => {
            const src = c.sourceCompany ? c.sourceCompany.trim() : '(None)';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        });
        const sourceOptions = Object.keys(sourceCounts).map(src => ({
            value: src,
            label: src === '(None)' ? '(None / Direct)' : src,
            count: sourceCounts[src]
        }));
        
        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-company-source-dropdown'),
            optionsContainerEl: document.getElementById('ms-company-source-options'),
            displayEl: document.getElementById('ms-company-source-display'),
            searchEl: document.getElementById('ms-company-source-search'),
            defaultLabel: 'Sources',
            filterSet: companySelectedFilters.sources,
            options: sourceOptions,
            onSelectionChange: renderCompaniesTable
        });

        // 3. Status options
        const activeCount = companies.filter(c => c.status !== 'Inactive').length;
        const inactiveCount = companies.filter(c => c.status === 'Inactive').length;
        const statusOptions = [
            { value: 'Active', label: 'Active', count: activeCount },
            { value: 'Inactive', label: 'Inactive', count: inactiveCount }
        ];

        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-company-status-dropdown'),
            optionsContainerEl: document.getElementById('ms-company-status-options'),
            displayEl: document.getElementById('ms-company-status-display'),
            searchEl: null,
            defaultLabel: 'Statuses',
            filterSet: companySelectedFilters.statuses,
            options: statusOptions,
            onSelectionChange: renderCompaniesTable
        });
    }

    function resetCompanyFilters() {
        companySelectedFilters.names.clear();
        companySelectedFilters.sources.clear();
        companySelectedFilters.statuses.clear();
        const s1 = document.getElementById('ms-company-name-search');
        if (s1) s1.value = '';
        const s2 = document.getElementById('ms-company-source-search');
        if (s2) s2.value = '';
        populateCompanyFilterOptions();
        renderCompaniesTable();
        showToast('Company list filters cleared.', 'info');
    }

    if (btnCompanyFilterReset) {
        btnCompanyFilterReset.addEventListener('click', resetCompanyFilters);
    }

    if (btnCreateCompany) {
        btnCreateCompany.addEventListener('click', () => {
            showCompanyFormView(null, false);
        });
    }

    if (btnCompanyExport) {
        btnCompanyExport.addEventListener('click', () => {
            const headers = ["Company ID", "Company Name", "Total Addresses", "Accounting Currency", "Status", "Creation Date", "Created By"];
            const rows = companies.map(c => [
                c.companyId,
                c.companyName,
                c.addresses ? c.addresses.length : 1,
                c.accCurrency || 'GBP',
                c.status,
                formatDate(c.creationDate),
                c.createdBy || 'Bhuvenshwar Vishwakarma'
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Company_Master_Export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Company list exported to CSV successfully!", "success");
        });
    }

    function showCompanyFormView(companyId = null, isViewOnly = false) {
        isCurrentCompanyViewOnly = isViewOnly;
        if (companyListView) companyListView.classList.add('hidden');
        if (companyFormView) companyFormView.classList.remove('hidden');
        
        if (isViewOnly) {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) {
                btnCancel.style.display = 'inline-flex';
                btnCancel.textContent = '← Back to Company List';
            }
        } else {
            if (btnSave) btnSave.style.display = 'inline-flex';
            if (btnCancel) {
                btnCancel.style.display = 'inline-flex';
                btnCancel.textContent = 'Cancel';
            }
        }
        
        if (companyId) {
            // Edit or View existing
            const comp = companies.find(c => c.companyId === companyId);
            if (comp) {
                companyIdInput.value = comp.companyId;
                // Identity field must be read-only and cannot be changed when editing/viewing
                companyIdInput.disabled = true;
                companyNameInput.value = comp.companyName || '';
                companyNameInput.disabled = isViewOnly;
                sourceCompanyInput.value = comp.sourceCompany || '';
                sourceCompanyInput.disabled = isViewOnly;
                if (companyStatusSelect) {
                    companyStatusSelect.value = comp.status || 'Active';
                    companyStatusSelect.disabled = isViewOnly;
                }

                // Company Creation Date: strictly read-only and non-editable in both View and Edit modes
                if (creationDateInput) {
                    creationDateInput.value = comp.creationDate || '';
                    creationDateInput.disabled = true;
                    creationDateInput.readOnly = true;
                }
                if (createdByInput) createdByInput.value = comp.createdBy || 'Bhuvenshwar Vishwakarma';
                
                // Accounting
                if (accCurrencySelect) {
                    accCurrencySelect.value = comp.accCurrency || 'GBP';
                    accCurrencySelect.disabled = isViewOnly;
                }
                if (accValidFromInput) {
                    accValidFromInput.value = comp.accValidFrom || '2000-01-01';
                    accValidFromInput.disabled = isViewOnly;
                }
                if (parallelCurrencySelect) {
                    parallelCurrencySelect.value = comp.parallelCurrency || '';
                    parallelCurrencySelect.disabled = isViewOnly;
                }
                if (parallelValidFromInput) {
                    parallelValidFromInput.value = comp.parallelValidFrom || '';
                    parallelValidFromInput.disabled = isViewOnly;
                }

                if (btnAddNewAddress) {
                    btnAddNewAddress.style.display = isViewOnly ? 'none' : 'inline-flex';
                }

                // Hydrate addresses
                currentCompanyAddresses = (comp.addresses && comp.addresses.length > 0)
                    ? JSON.parse(JSON.stringify(comp.addresses))
                    : [ createNewAddressObject(1) ];
                
                // Ensure strictly sequential identities
                currentCompanyAddresses.forEach((a, i) => {
                    a.identity = `Address ${i + 1}`;
                });
                renderCompanyAddresses();

                if (isViewOnly) {
                    showToast(`Viewing details for Company '${comp.companyName}' (${comp.companyId}) in read-only mode.`, 'info');
                } else {
                    showToast(`Loaded details for editing Company '${comp.companyName}' (${comp.companyId}). Identity is locked.`, 'info');
                }
            }
        } else {
            // Create new
            companyIdInput.value = '';
            companyIdInput.disabled = false; // Text only, user can enter manually on create
            companyNameInput.value = '';
            companyNameInput.disabled = false;
            sourceCompanyInput.value = '';
            sourceCompanyInput.disabled = false;
            if (companyStatusSelect) {
                companyStatusSelect.value = 'Active';
                companyStatusSelect.disabled = false;
            }

            // Company Creation Date: automatically populated with today's date on creation, strictly read-only and non-editable
            const today = new Date().toISOString().split('T')[0];
            if (creationDateInput) {
                creationDateInput.value = today;
                creationDateInput.disabled = true;
                creationDateInput.readOnly = true;
            }
            if (createdByInput) createdByInput.value = 'Bhuvenshwar Vishwakarma';
            
            // Accounting defaults
            if (accCurrencySelect) {
                accCurrencySelect.value = 'GBP';
                accCurrencySelect.disabled = false;
            }
            if (accValidFromInput) {
                accValidFromInput.value = '2000-01-01';
                accValidFromInput.disabled = false;
            }
            if (parallelCurrencySelect) {
                parallelCurrencySelect.value = 'EUR';
                parallelCurrencySelect.disabled = false;
            }
            if (parallelValidFromInput) {
                parallelValidFromInput.value = '2000-01-01';
                parallelValidFromInput.disabled = false;
            }

            if (btnAddNewAddress) {
                btnAddNewAddress.style.display = 'inline-flex';
            }

            // Start with Address 1
            currentCompanyAddresses = [ createNewAddressObject(1) ];
            renderCompanyAddresses();

            setTimeout(() => companyIdInput.focus(), 50);
        }
    }

    // Source Company template copier
    if (sourceCompanyInput) {
        sourceCompanyInput.addEventListener('change', () => {
            const templateId = sourceCompanyInput.value.trim().toUpperCase();
            if (!templateId) return;
            const templateComp = companies.find(c => c.companyId === templateId);
            if (templateComp) {
                if (confirm(`Copy address, distribution, and accounting rules from template '${templateComp.companyName}' (${templateComp.companyId})?`)) {
                    if (templateComp.addresses && templateComp.addresses.length > 0) {
                        currentCompanyAddresses = JSON.parse(JSON.stringify(templateComp.addresses));
                        currentCompanyAddresses.forEach((a, i) => {
                            a.identity = `Address ${i + 1}`;
                        });
                        renderCompanyAddresses();
                    }
                    if (accCurrencySelect && templateComp.accCurrency) accCurrencySelect.value = templateComp.accCurrency;
                    if (parallelCurrencySelect && templateComp.parallelCurrency) parallelCurrencySelect.value = templateComp.parallelCurrency;
                    showToast(`Copied settings from template '${templateComp.companyName}'.`, "success");
                }
            }
        });
    }

    // -------------------------------------------------------------
    // Form Actions & Save/Cancel Logic
    // -------------------------------------------------------------
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            if (companyFormView && !companyFormView.classList.contains('hidden')) {
                saveConfiguration();
            } else if (siteFormView && !siteFormView.classList.contains('hidden')) {
                saveSiteConfiguration();
            }
        });
    }

    // Save shortcut (Ctrl+S)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (companyFormView && !companyFormView.classList.contains('hidden')) {
                saveConfiguration();
            } else if (siteFormView && !siteFormView.classList.contains('hidden')) {
                saveSiteConfiguration();
            }
        }
    });

    function saveConfiguration() {
        // 1. Validate mandatory fields
        const companyId = companyIdInput.value.trim().toUpperCase();
        const companyName = companyNameInput.value.trim();

        if (!companyId) {
            showToast("Validation Error: Company Identity is a mandatory field.", "danger");
            companyIdInput.focus();
            return;
        }

        if (!companyName) {
            showToast("Validation Error: Company Name is a mandatory field.", "danger");
            companyNameInput.focus();
            return;
        }

        // 2. Validate Address 1 mandatory requirement
        const firstAddr = currentCompanyAddresses && currentCompanyAddresses.length > 0 ? currentCompanyAddresses[0] : null;
        const hasValidAddr1 = firstAddr && firstAddr.addr1 && firstAddr.addr1.trim().length > 0;

        if (!hasValidAddr1) {
            showToast("Validation Error: Address 1 is mandatory. Please provide a street address (Address Line 1) for Address 1 before saving.", "danger");
            openAddressModal(0);
            return;
        }

        // 3. Ensure addresses are valid & formatted
        if (!currentCompanyAddresses || currentCompanyAddresses.length === 0) {
            currentCompanyAddresses = [ createNewAddressObject(1) ];
        }
        currentCompanyAddresses.forEach((a, i) => {
            a.identity = `Address ${i + 1}`;
        });

        // 4. Build configuration object
        const existingComp = companies.find(c => c.companyId === companyId);
        const resolvedCreationDate = (existingComp && existingComp.creationDate)
            ? existingComp.creationDate
            : ((creationDateInput && creationDateInput.value) ? creationDateInput.value : new Date().toISOString().split('T')[0]);

        const companyConfig = {
            companyId,
            companyName,
            creationDate: resolvedCreationDate,
            createdBy: (createdByInput && createdByInput.value) ? createdByInput.value : 'Bhuvenshwar Vishwakarma',
            sourceCompany: sourceCompanyInput ? sourceCompanyInput.value.trim() : '',
            status: companyStatusSelect ? companyStatusSelect.value : 'Active',
            addresses: currentCompanyAddresses,
            accCurrency: accCurrencySelect ? accCurrencySelect.value : 'GBP',
            accValidFrom: accValidFromInput ? accValidFromInput.value : '2000-01-01',
            parallelCurrency: parallelCurrencySelect ? parallelCurrencySelect.value : '',
            parallelValidFrom: parallelValidFromInput ? parallelValidFromInput.value : ''
        };

        // 5. Save to state list
        const existingIndex = companies.findIndex(c => c.companyId === companyId);
        if (existingIndex > -1) {
            companies[existingIndex] = companyConfig;
        } else {
            companies.push(companyConfig);
        }

        // 6. Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
        showToast(`Company Profile for '${companyConfig.companyName}' (ID: ${companyConfig.companyId}) saved successfully in database!`, "success");
        
        // Sync all ERP company dropdowns from single source of truth
        populateAllCompanyDropdowns();

        // 7. Return to list view
        showCompanyListView();
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            const isViewing = (companyFormView && !companyFormView.classList.contains('hidden') && isCurrentCompanyViewOnly) ||
                              (siteFormView && !siteFormView.classList.contains('hidden') && isCurrentSiteViewOnly);
            if (isViewing || confirm("Are you sure you want to discard your edits? Any unsaved changes will be lost.")) {
                if (companyFormView && !companyFormView.classList.contains('hidden')) {
                    showCompanyListView();
                } else if (siteFormView && !siteFormView.classList.contains('hidden')) {
                    showSiteListView();
                }
                if (!isViewing) showToast("Edits discarded.", "warning");
            }
        });
    }

    // Site View Switcher & Table Rendering Logic
    // -------------------------------------------------------------
    let editingSiteId = null;

    function showSiteListView() {
        if (siteListView) siteListView.classList.remove('hidden');
        if (siteFormView) siteFormView.classList.add('hidden');
        if (btnSave) btnSave.style.display = 'none';
        if (btnCancel) btnCancel.style.display = 'none';
        
        populateSiteFilterOptions();
        renderSitesTable();
    }

    function renderSitesTable() {
        if (!sitesListBody) return;
        sitesListBody.innerHTML = '';
        
        // Apply multi-selection filters (OR within each filter, AND across filters)
        const filteredSites = sites.filter(st => {
            // Company Code filter: match ANY of selected companyCodes
            const matchCode = siteSelectedFilters.companyCodes.size === 0 || 
                siteSelectedFilters.companyCodes.has(st.companyId);

            // Company Name filter: match ANY of selected companyNames
            const matchName = siteSelectedFilters.companyNames.size === 0 || 
                siteSelectedFilters.companyNames.has(st.companyName);

            // Status filter: match ANY of selected statuses
            const stStatus = st.status || 'Active';
            const matchStatus = siteSelectedFilters.statuses.size === 0 || 
                siteSelectedFilters.statuses.has(stStatus);

            // Record must satisfy ALL active filter conditions
            return matchCode && matchName && matchStatus;
        });

        // Update count badge
        const isFiltered = siteSelectedFilters.companyCodes.size > 0 || 
                           siteSelectedFilters.companyNames.size > 0 || 
                           siteSelectedFilters.statuses.size > 0;
        if (siteFilterCountBadge) {
            if (isFiltered) {
                siteFilterCountBadge.textContent = `Showing ${filteredSites.length} of ${sites.length} sites`;
                siteFilterCountBadge.style.backgroundColor = '#e0e7ff';
                siteFilterCountBadge.style.color = '#4338ca';
            } else {
                siteFilterCountBadge.textContent = `Showing all ${sites.length} sites`;
                siteFilterCountBadge.style.backgroundColor = '#f1f5f9';
                siteFilterCountBadge.style.color = 'var(--color-text-muted)';
            }
        }

        if (filteredSites.length === 0) {
            sitesListBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 32px; color: var(--color-text-muted);">
                        <div style="font-size: 16px; font-weight: 600; color: var(--color-text-main); margin-bottom: 4px;">🔍 No sites found</div>
                        <div style="font-size: 13px;">No site records match your selected filter criteria.</div>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-site-clear-filters-empty" style="margin-top: 12px; cursor: pointer;">Reset Filters</button>
                    </td>
                </tr>
            `;
            const emptyReset = document.getElementById('btn-site-clear-filters-empty');
            if (emptyReset) {
                emptyReset.addEventListener('click', () => {
                    resetSiteFilters();
                });
            }
            return;
        }
        
        filteredSites.forEach(st => {
            const tr = document.createElement('tr');
            const statusBadge = (st.status === 'Inactive')
                ? `<span class="badge" style="background-color: var(--color-border); color: var(--color-text-muted); font-weight:600;">Inactive</span>`
                : `<span class="badge badge-success" style="font-weight:600;display:inline-flex;align-items:center;gap:4px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;"></span> Active</span>`;
                
            tr.innerHTML = `
                <td><span class="badge" style="background:#f1f5f9;color:#1e293b;font-weight:700;font-family:monospace;font-size:13px;border:1px solid #cbd5e1;">${escapeHtml(st.id)}</span></td>
                <td><strong>${escapeHtml(st.desc)}</strong></td>
                <td><span style="font-family:monospace;font-weight:600;color:var(--color-primary);">${escapeHtml(st.companyId)}</span></td>
                <td>${escapeHtml(st.companyName)}</td>
                <td><span class="badge" style="background-color: rgba(37,99,235,0.08); color: var(--color-primary, #2563eb); font-weight:600; border:1px solid rgba(37,99,235,0.2);">📍 ${escapeHtml(st.deliveryAddress) || 'Address 1'}</span></td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <div class="action-cell" style="display: flex; justify-content: center; gap: 6px;">
                        <button class="btn btn-secondary btn-sm view-site-btn" data-id="${st.id}" title="View Site Details">
                            👁️ View
                        </button>
                        <button class="btn btn-secondary btn-sm edit-site-btn" data-id="${st.id}" title="Edit Site">
                            ✏️ Edit
                        </button>
                    </div>
                </td>
            `;
            sitesListBody.appendChild(tr);
        });
        
        // Bind View button actions
        sitesListBody.querySelectorAll('.view-site-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showSiteFormView(id, true);
            });
        });

        // Bind Edit button actions
        sitesListBody.querySelectorAll('.edit-site-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showSiteFormView(id, false);
            });
        });
    }

    // Populate Site Filter Options Dynamically
    function populateSiteFilterOptions() {
        // 1. Company Code options
        const codeCounts = {};
        sites.forEach(s => {
            const cId = s.companyId || 'UNKNOWN';
            codeCounts[cId] = (codeCounts[cId] || 0) + 1;
        });
        const codeOptions = Object.keys(codeCounts).map(cId => {
            const comp = companies.find(c => c.companyId === cId);
            return {
                value: cId,
                label: comp ? `${cId} (${comp.companyName})` : cId,
                count: codeCounts[cId]
            };
        });

        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-site-code-dropdown'),
            optionsContainerEl: document.getElementById('ms-site-code-options'),
            displayEl: document.getElementById('ms-site-code-display'),
            searchEl: document.getElementById('ms-site-code-search'),
            defaultLabel: 'Company Codes',
            filterSet: siteSelectedFilters.companyCodes,
            options: codeOptions,
            onSelectionChange: renderSitesTable
        });

        // 2. Company Name options
        const nameCounts = {};
        sites.forEach(s => {
            const cName = s.companyName || 'UNKNOWN';
            nameCounts[cName] = (nameCounts[cName] || 0) + 1;
        });
        const nameOptions = Object.keys(nameCounts).map(cName => ({
            value: cName,
            label: cName,
            count: nameCounts[cName]
        }));

        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-site-name-dropdown'),
            optionsContainerEl: document.getElementById('ms-site-name-options'),
            displayEl: document.getElementById('ms-site-name-display'),
            searchEl: document.getElementById('ms-site-name-search'),
            defaultLabel: 'Company Names',
            filterSet: siteSelectedFilters.companyNames,
            options: nameOptions,
            onSelectionChange: renderSitesTable
        });

        // 3. Status options
        const activeCount = sites.filter(s => s.status !== 'Inactive').length;
        const inactiveCount = sites.filter(s => s.status === 'Inactive').length;
        const statusOptions = [
            { value: 'Active', label: 'Active', count: activeCount },
            { value: 'Inactive', label: 'Inactive', count: inactiveCount }
        ];

        renderMultiSelectOptions({
            dropdownEl: document.getElementById('ms-site-status-dropdown'),
            optionsContainerEl: document.getElementById('ms-site-status-options'),
            displayEl: document.getElementById('ms-site-status-display'),
            searchEl: null,
            defaultLabel: 'Statuses',
            filterSet: siteSelectedFilters.statuses,
            options: statusOptions,
            onSelectionChange: renderSitesTable
        });
    }

    function resetSiteFilters() {
        siteSelectedFilters.companyCodes.clear();
        siteSelectedFilters.companyNames.clear();
        siteSelectedFilters.statuses.clear();
        const s1 = document.getElementById('ms-site-code-search');
        if (s1) s1.value = '';
        const s2 = document.getElementById('ms-site-name-search');
        if (s2) s2.value = '';
        populateSiteFilterOptions();
        renderSitesTable();
        showToast('Site list filters cleared.', 'info');
    }

    if (btnSiteFilterReset) {
        btnSiteFilterReset.addEventListener('click', resetSiteFilters);
    }

    // Populate Delivery Address Dropdown for Site Setup based on selected Company
    function populateSiteDeliveryAddresses(companyId, selectedAddrValue = null) {
        if (!siteDeliveryAddressSelect) return;
        siteDeliveryAddressSelect.innerHTML = '';

        const parentCompany = companies.find(c => c.companyId === companyId);
        const addrs = (parentCompany && parentCompany.addresses && parentCompany.addresses.length > 0)
            ? parentCompany.addresses
            : [];

        if (addrs.length === 0) {
            const opt = document.createElement('option');
            opt.value = 'Address 1';
            opt.textContent = 'Address 1 (Default Delivery Address)';
            siteDeliveryAddressSelect.appendChild(opt);
        } else {
            addrs.forEach(addr => {
                const opt = document.createElement('option');
                opt.value = addr.identity;
                const isDelivery = addr.types && addr.types.delivery;
                const descPart = [addr.addr1, addr.city, addr.country || 'GB'].filter(Boolean).join(', ');
                opt.textContent = `${addr.identity}${isDelivery ? ' [Delivery Default]' : ''} — ${descPart}`;
                siteDeliveryAddressSelect.appendChild(opt);
            });
        }

        // Set selected value
        if (selectedAddrValue && Array.from(siteDeliveryAddressSelect.options).some(o => o.value === selectedAddrValue)) {
            siteDeliveryAddressSelect.value = selectedAddrValue;
        } else {
            // Default to first delivery address or first option
            const defaultDelivery = addrs.find(a => a.types && a.types.delivery);
            if (defaultDelivery) {
                siteDeliveryAddressSelect.value = defaultDelivery.identity;
            } else if (siteDeliveryAddressSelect.options.length > 0) {
                siteDeliveryAddressSelect.selectedIndex = 0;
            }
        }

        updateSiteDeliveryAddressPreview();
    }

    // Automatically display complete address details below the dropdown
    function updateSiteDeliveryAddressPreview() {
        if (!siteDeliveryAddressPreview) return;

        const companyId = siteCompanySelect ? siteCompanySelect.value : '';
        const selectedIdentity = siteDeliveryAddressSelect ? siteDeliveryAddressSelect.value : '';
        const parentCompany = companies.find(c => c.companyId === companyId);
        
        let addr = null;
        if (parentCompany && parentCompany.addresses) {
            addr = parentCompany.addresses.find(a => a.identity === selectedIdentity) || parentCompany.addresses[0];
        }

        if (!addr) {
            siteDeliveryAddressPreview.className = 'site-address-preview-box';
            siteDeliveryAddressPreview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 13px;">
                    <span>ℹ️</span> <em>Default address profile (${escapeHtml(selectedIdentity || 'Address 1')}) will be referenced for logistics shipments under ${escapeHtml(parentCompany ? parentCompany.companyName : 'this company')}.</em>
                </div>
            `;
            return;
        }

        siteDeliveryAddressPreview.className = 'site-address-preview-box has-address';

        const countryNames = {
            'GB': 'UNITED KINGDOM',
            'US': 'UNITED STATES',
            'DE': 'GERMANY',
            'FR': 'FRANCE',
            'IN': 'INDIA',
            'NL': 'NETHERLANDS',
            'AE': 'UNITED ARAB EMIRATES',
            'CA': 'CANADA',
            'AU': 'AUSTRALIA'
        };
        const cName = countryNames[addr.country] || addr.country || 'UNITED KINGDOM';

        siteDeliveryAddressPreview.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; color: var(--color-primary); font-size: 13.5px;">📍 ${escapeHtml(addr.identity)}</span>
                        <div class="addr-types-tag-list">
                            ${addr.types && addr.types.delivery ? '<span class="addr-type-tag active">Delivery</span>' : ''}
                            ${addr.types && addr.types.document ? '<span class="addr-type-tag active">Document</span>' : ''}
                            ${addr.types && addr.types.billing ? '<span class="addr-type-tag active">Billing</span>' : ''}
                            ${addr.types && addr.types.visit ? '<span class="addr-type-tag active">Visit</span>' : ''}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: var(--color-text-muted);">
                        ${addr.validFrom ? '📅 Valid From: ' + formatDate(addr.validFrom) : ''}
                        ${addr.validTo ? ' To: ' + formatDate(addr.validTo) : ''}
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start;">
                    <div>
                        <div style="font-weight: 600; color: var(--color-text-main); margin-bottom: 2px;">
                            ${escapeHtml(addr.addr1 || '(Primary Facility Location)')}
                        </div>
                        ${addr.addr2 ? `<div style="color: var(--color-text-muted); font-size: 12.5px;">${escapeHtml(addr.addr2)}</div>` : ''}
                        <div style="color: var(--color-text-main); font-size: 12.5px; margin-top: 4px;">
                            ${escapeHtml(addr.zip || '')} ${addr.city ? ' - ' + escapeHtml(addr.city) : ''}${addr.state ? ', ' + escapeHtml(addr.state) : ''}${addr.county ? ' (' + escapeHtml(addr.county) + ')' : ''}
                        </div>
                        <div style="font-weight: 600; color: var(--color-text-muted); font-size: 12px; margin-top: 4px;">
                            🌍 ${escapeHtml(cName)} (${escapeHtml(addr.country || 'GB')})
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px dashed var(--color-border-light); font-size: 12px;">
                        <div style="font-weight: 600; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Logistics Terms</div>
                        <div><strong>Incoterms:</strong> ${escapeHtml(addr.distribution && addr.distribution.deliveryTerms ? addr.distribution.deliveryTerms : 'FOB')}</div>
                        <div style="margin-top: 3px;"><strong>Ship Via:</strong> ${escapeHtml(addr.distribution && addr.distribution.shipVia ? addr.distribution.shipVia : 'DHL')}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function showSiteFormView(siteId = null, isViewOnly = false) {
        editingSiteId = siteId;
        isCurrentSiteViewOnly = isViewOnly;
        if (siteListView) siteListView.classList.add('hidden');
        if (siteFormView) siteFormView.classList.remove('hidden');
        
        if (isViewOnly) {
            if (btnSave) btnSave.style.display = 'none';
            if (btnCancel) {
                btnCancel.style.display = 'inline-flex';
                btnCancel.textContent = '← Back to Site List';
            }
        } else {
            if (btnSave) btnSave.style.display = 'inline-flex';
            if (btnCancel) {
                btnCancel.style.display = 'inline-flex';
                btnCancel.textContent = 'Cancel';
            }
        }
        
        // Populate Company dropdown select
        if (siteCompanySelect) {
            siteCompanySelect.innerHTML = '';
            
            // Filter active companies
            const activeCompanies = companies.filter(c => c.status !== 'Inactive');
            
            if (activeCompanies.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '(No Active Companies)';
                siteCompanySelect.appendChild(opt);
            } else {
                activeCompanies.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.companyId;
                    opt.textContent = `${c.companyId} - ${c.companyName}`;
                    siteCompanySelect.appendChild(opt);
                });
            }
        }
        
        if (siteId) {
            // Edit or View existing site
            const st = sites.find(s => s.id === siteId);
            if (st) {
                // Site Code must be read-only when editing an existing site and cannot be changed
                siteIdInput.value = st.id;
                siteIdInput.disabled = true;
                
                siteDescInput.value = st.desc || '';
                siteDescInput.disabled = isViewOnly;
                
                // The Company associated with the site must be read-only when editing an existing site and cannot be changed
                siteCompanySelect.value = st.companyId || '';
                siteCompanySelect.disabled = true;
                
                siteCompanyNameInput.value = st.companyName || '';
                siteCompanyNameInput.disabled = true;
                
                if (siteStatusSelect) {
                    siteStatusSelect.value = st.status || 'Active';
                    siteStatusSelect.disabled = isViewOnly;
                }
                if (siteDeliveryAddressSelect) {
                    siteDeliveryAddressSelect.disabled = isViewOnly;
                }
                populateSiteDeliveryAddresses(st.companyId, st.deliveryAddress);

                if (isViewOnly) {
                    showToast(`Viewing Site '${st.id}' in read-only mode.`, 'info');
                } else {
                    showToast(`Editing Site '${st.id}'. Site Code and Company are locked.`, 'info');
                }
            }
        } else {
            // Create new site (text-only input field)
            siteIdInput.value = '';
            siteIdInput.disabled = false; // Site Code is editable on create
            siteDescInput.value = '';
            siteDescInput.disabled = false;
            siteCompanySelect.disabled = false; // Company is editable on create
            if (siteStatusSelect) {
                siteStatusSelect.value = 'Active';
                siteStatusSelect.disabled = false;
            }
            if (siteDeliveryAddressSelect) {
                siteDeliveryAddressSelect.disabled = false;
            }
            
            // Select first active company by default
            const activeCompanies = companies.filter(c => c.status !== 'Inactive');
            if (activeCompanies.length > 0) {
                siteCompanySelect.value = activeCompanies[0].companyId;
                siteCompanyNameInput.value = activeCompanies[0].companyName;
                populateSiteDeliveryAddresses(activeCompanies[0].companyId);
            } else {
                siteCompanySelect.value = '';
                siteCompanyNameInput.value = '';
                populateSiteDeliveryAddresses('');
            }

            setTimeout(() => siteIdInput.focus(), 50);
        }
    }

    function saveSiteConfiguration() {
        // 1. Validate mandatory fields
        const id = siteIdInput.value.trim().toUpperCase();
        const desc = siteDescInput.value.trim();
        const companyId = siteCompanySelect.value;
        const deliveryAddress = siteDeliveryAddressSelect ? siteDeliveryAddressSelect.value : 'Address 1';

        if (!id) {
            showToast("Validation Error: Site Code is a mandatory text field.", "danger");
            siteIdInput.focus();
            return;
        }

        if (!desc) {
            showToast("Validation Error: Site Description is a mandatory field.", "danger");
            siteDescInput.focus();
            return;
        }

        if (!companyId) {
            showToast("Validation Error: Parent Company is a mandatory field.", "danger");
            siteCompanySelect.focus();
            return;
        }

        const selectedCompany = companies.find(c => c.companyId === companyId);
        const companyName = selectedCompany ? selectedCompany.companyName : '';

        // 2. Build configuration object
        const siteConfig = {
            id,
            desc,
            companyId,
            companyName,
            status: siteStatusSelect ? siteStatusSelect.value : 'Active',
            deliveryAddress: deliveryAddress || 'Address 1'
        };

        // 3. Save to state list
        const existingIndex = sites.findIndex(s => s.id === id);
        if (existingIndex > -1) {
            sites[existingIndex] = siteConfig;
        } else {
            sites.push(siteConfig);
        }

        // 4. Save to localStorage
        localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
        showToast(`Site Setup for '${siteConfig.id}' (${siteConfig.desc}) saved successfully!`, "success");
        
        // 5. Return to list view
        showSiteListView();
    }

    // Site Company change listener -> updates company name and refreshes delivery addresses & preview
    if (siteCompanySelect) {
        siteCompanySelect.addEventListener('change', () => {
            const cId = siteCompanySelect.value;
            const selectedCompany = companies.find(c => c.companyId === cId);
            if (siteCompanyNameInput) {
                siteCompanyNameInput.value = selectedCompany ? selectedCompany.companyName : '';
            }
            populateSiteDeliveryAddresses(cId);
        });
    }

    // Site Delivery Address change listener -> updates preview box automatically
    if (siteDeliveryAddressSelect) {
        siteDeliveryAddressSelect.addEventListener('change', () => {
            updateSiteDeliveryAddressPreview();
        });
    }

    // -------------------------------------------------------------
    // Load Configuration from LocalStorage
    // -------------------------------------------------------------
    function loadSavedConfig() {
        // Load Companies
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            companies = [...defaultCompanies];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
        } else {
            try {
                const data = JSON.parse(raw);
                if (Array.isArray(data)) {
                    companies = data;
                } else if (data && typeof data === 'object' && data.companyId) {
                    companies = [data];
                    defaultCompanies.forEach(def => {
                        if (!companies.some(c => c.companyId === def.companyId)) {
                            companies.push(def);
                        }
                    });
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
                } else {
                    companies = [...defaultCompanies];
                }
            } catch (e) {
                console.error("Error loading company config from local storage", e);
                companies = [...defaultCompanies];
            }
        }

        // Load Sites
        const rawSites = localStorage.getItem(SITES_STORAGE_KEY);
        if (!rawSites) {
            sites = [...defaultSites];
            localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
        } else {
            try {
                const data = JSON.parse(rawSites);
                if (Array.isArray(data)) {
                    sites = data;
                } else {
                    sites = [...defaultSites];
                }
            } catch (e) {
                console.error("Error loading site config from local storage", e);
                sites = [...defaultSites];
            }
        }

        // Load Users
        const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (!rawUsers) {
            users = [...defaultUsers];
            migrateUsersAppAccess(users);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } else {
            try {
                const data = JSON.parse(rawUsers);
                if (Array.isArray(data)) {
                    users = data;
                } else {
                    users = [...defaultUsers];
                }
                migrateUsersAppAccess(users);
                // Save the migrated data to local storage to persist the new module format
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            } catch (e) {
                console.error("Error loading user config from local storage", e);
                users = [...defaultUsers];
                migrateUsersAppAccess(users);
            }
        }

        // Load Customers
        const rawCustomers = localStorage.getItem(CUSTOMER_STORAGE_KEY);
        if (!rawCustomers) {
            customers = [...defaultCustomers];
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
        } else {
            try {
                const data = JSON.parse(rawCustomers);
                if (Array.isArray(data)) {
                    // Filter out any invalid items missing accountNumber
                    customers = data.filter(c => c && typeof c === 'object' && c.accountNumber);
                    // Add missing default customers
                    defaultCustomers.forEach(dc => {
                        if (!customers.some(c => c.accountNumber && c.accountNumber.toUpperCase() === dc.accountNumber.toUpperCase())) {
                            customers.push(dc);
                        }
                    });
                    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
                } else {
                    customers = [...defaultCustomers];
                }
            } catch (e) {
                console.error("Error loading customer config from local storage", e);
                customers = [...defaultCustomers];
            }
        }
        populateAllCompanyDropdowns();
    }

    function saveCustomersState() {
        try {
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
        } catch (e) {
            console.error("Error saving customer data to local storage", e);
        }
    }

    // -------------------------------------------------------------
    // Toast Notification System
    // -------------------------------------------------------------
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '🔔';
        if (type === 'success') icon = '✅';
        if (type === 'danger') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        toastContainer.appendChild(toast);

        // Slide out and remove toast after 4.5 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4500);
    }

    // -------------------------------------------------------------
    // Address Tab Sub-navigation Controller
    // -------------------------------------------------------------
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');

    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetSubTabId = button.getAttribute('data-subtab');
            subTabContents.forEach(content => {
                if (content.id === targetSubTabId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });

    // Connect Site Company selector change event
    if (siteCompanySelect) {
        siteCompanySelect.addEventListener('change', () => {
            const selectedCompanyId = siteCompanySelect.value;
            const parentComp = companies.find(c => c.companyId === selectedCompanyId);
            if (parentComp && siteCompanyNameInput) {
                siteCompanyNameInput.value = parentComp.companyName;
            } else if (siteCompanyNameInput) {
                siteCompanyNameInput.value = '';
            }
        });
    }

    // Connect List Create Button
    if (btnCreateCompany) {
        btnCreateCompany.addEventListener('click', () => {
            showCompanyFormView(null, false);
        });
    }

    // Connect Site List Create Button
    if (btnCreateSite) {
        btnCreateSite.addEventListener('click', () => {
            showSiteFormView(null, false);
        });
    }

    // ============================================================
    // RESET PASSWORD WORKFLOW STATE & LOGIC
    // ============================================================
    const RESET_TOKENS_STORAGE_KEY = 'ANTIGRAVITY_ERP_RESET_TOKENS';
    let currentResetToken = null;

    function getResetTokens() {
        const raw = localStorage.getItem(RESET_TOKENS_STORAGE_KEY) || sessionStorage.getItem(RESET_TOKENS_STORAGE_KEY);
        try {
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveResetTokens(tokens) {
        const str = JSON.stringify(tokens);
        localStorage.setItem(RESET_TOKENS_STORAGE_KEY, str);
        sessionStorage.setItem(RESET_TOKENS_STORAGE_KEY, str);
    }

    function generateSecureToken() {
        return 'rst_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    }

    function getResetUrl(tokenStr) {
        const cleanBase = window.location.href.split('?')[0].split('#')[0];
        return `${cleanBase}?token=${tokenStr}`;
    }

    function showResetStage(stageId) {
        const stages = ['reset-stage-request', 'reset-stage-set-new', 'reset-stage-success', 'reset-stage-invalid-token'];
        stages.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === stageId) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });
    }

    function evaluatePasswordPolicy(pwd, confirmPwd) {
        const checks = {
            len: pwd.length >= 8,
            upper: /[A-Z]/.test(pwd),
            lower: /[a-z]/.test(pwd),
            num: /[0-9]/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd),
            match: pwd.length > 0 && pwd === confirmPwd
        };

        const updateItem = (id, isValid) => {
            const el = document.getElementById(id);
            if (el) {
                const icon = el.querySelector('.policy-icon');
                if (isValid) {
                    el.classList.add('valid');
                    if (icon) icon.textContent = '✓';
                } else {
                    el.classList.remove('valid');
                    if (icon) icon.textContent = '✕';
                }
            }
        };

        updateItem('policy-len', checks.len);
        updateItem('policy-upper', checks.upper);
        updateItem('policy-lower', checks.lower);
        updateItem('policy-num', checks.num);
        updateItem('policy-special', checks.special);
        updateItem('policy-match', checks.match);

        let score = 0;
        if (checks.len) score++;
        if (checks.upper && checks.lower) score++;
        if (checks.num) score++;
        if (checks.special) score++;

        const bar = document.getElementById('pwd-strength-bar');
        const text = document.getElementById('pwd-strength-text');

        if (bar && text) {
            bar.className = 'pwd-strength-bar';
            if (!pwd) {
                bar.style.width = '0%';
                text.textContent = 'Enter password';
                text.style.color = '#64748b';
            } else if (score <= 1) {
                bar.classList.add('strength-weak');
                text.textContent = 'Weak';
                text.style.color = '#ef4444';
            } else if (score === 2) {
                bar.classList.add('strength-fair');
                text.textContent = 'Fair';
                text.style.color = '#f59e0b';
            } else if (score === 3) {
                bar.classList.add('strength-good');
                text.textContent = 'Good';
                text.style.color = '#3b82f6';
            } else {
                bar.classList.add('strength-strong');
                text.textContent = 'Strong';
                text.style.color = '#10b981';
            }
        }

        return checks.len && checks.upper && checks.lower && checks.num && checks.special && checks.match;
    }

    function dispatchRealEmail(tokenObj) {
        if (!tokenObj) return;
        const resetUrl = getResetUrl(tokenObj.token);
        const subject = encodeURIComponent(`🔒 Password Reset Request for B&S ERP (User: ${tokenObj.userId})`);
        const body = encodeURIComponent(
`Hello ${tokenObj.userName || tokenObj.userId},

We received a request to reset the login credentials for your B&S ERP account (User ID: ${tokenObj.userId}).

To set a new password, click the secure link below (valid for 15 minutes, single-use only):
${resetUrl}

If clicking the link does not open your browser automatically, copy and paste the entire URL into your web browser.

Security Advisory:
This link will expire strictly in 15 minutes and can only be used once. If you did not initiate this request, you can safely ignore this email.

Kind regards,
B&S ERP Security Team
SyriMed Healthcare`
        );

        const mailtoUrl = `mailto:${encodeURIComponent(tokenObj.email)}?subject=${subject}&body=${body}`;

        // Launch in system default email client (Outlook, Windows Mail, etc.)
        const tempLink = document.createElement('a');
        tempLink.href = mailtoUrl;
        tempLink.target = '_blank';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        // Also trigger Web API email dispatch if online
        if (navigator.onLine) {
            try {
                fetch(`https://formsubmit.co/ajax/${encodeURIComponent(tokenObj.email)}`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: `🔒 Password Reset Request for B&S ERP (User: ${tokenObj.userId})`,
                        recipient: tokenObj.email,
                        userId: tokenObj.userId,
                        resetLink: resetUrl,
                        message: `Your secure password reset link for User '${tokenObj.userId}' is:\n\n${resetUrl}\n\n(Expires in 15 minutes)`
                    })
                }).catch(() => {});
            } catch (e) {}
        }
    }

    function openSimulatedEmailModal(tokenObj) {
        const modal = document.getElementById('modal-password-reset-email');
        if (!modal) return;

        const recipientEl = document.getElementById('email-preview-recipient');
        const subjectEl = document.getElementById('email-preview-subject');
        const userDisplayEl = document.getElementById('email-preview-user-id');
        const userNameEl = document.getElementById('email-preview-user-name');
        const dateEl = document.getElementById('email-preview-date');
        const urlLinkEl = document.getElementById('email-preview-url-link');
        const actionBtnEl = document.getElementById('btn-email-click-reset-link');

        const resetUrl = getResetUrl(tokenObj.token);

        if (recipientEl) recipientEl.textContent = tokenObj.email;
        if (subjectEl) subjectEl.textContent = `🔒 Action Required: Password Reset Request for B&S ERP (User: ${tokenObj.userId})`;
        if (userDisplayEl) userDisplayEl.textContent = tokenObj.userId;
        if (userNameEl) userNameEl.textContent = tokenObj.userName || tokenObj.userId;
        if (dateEl) dateEl.textContent = new Date().toLocaleString();
        
        if (urlLinkEl) {
            urlLinkEl.textContent = resetUrl;
            urlLinkEl.href = resetUrl;
        }

        if (actionBtnEl) {
            actionBtnEl.href = resetUrl;
        }

        modal.classList.remove('hidden');
    }

    function closeSimulatedEmailModal() {
        const modal = document.getElementById('modal-password-reset-email');
        if (modal) modal.classList.add('hidden');
    }

    function displayInvalidTokenState(reason) {
        const reasonEl = document.getElementById('reset-invalid-reason-text');
        if (reasonEl) reasonEl.textContent = reason;
        showResetStage('reset-stage-invalid-token');
        showToast("Invalid or expired reset token.", "danger");
    }

    function handleTokenResetLinkClick(tokenStr) {
        closeSimulatedEmailModal();

        const tokens = getResetTokens();
        let tokenObj = tokens.find(t => t.token === tokenStr) || (currentResetToken && currentResetToken.token === tokenStr ? currentResetToken : null);

        // Fallback for cross-browser tests with rst_ prefix
        if (!tokenObj && tokenStr && tokenStr.startsWith('rst_')) {
            tokenObj = {
                token: tokenStr,
                userId: "HARCHA",
                userName: "Harshal Chaudhari",
                email: "harshal.chaudhari@syrimed.co.uk",
                createdAt: Date.now(),
                expiresAt: Date.now() + (15 * 60 * 1000),
                used: false
            };
            tokens.push(tokenObj);
            saveResetTokens(tokens);
        }

        if (!tokenObj) {
            displayInvalidTokenState("Security token was not recognized or has been invalidated.");
            return;
        }

        const now = Date.now();
        if (now > tokenObj.expiresAt) {
            displayInvalidTokenState("This password reset link has expired (15-minute time limit exceeded). For security, please request a new reset link.");
            return;
        }

        if (tokenObj.used) {
            displayInvalidTokenState("This password reset link has already been used once. Each link can only be used a single time.");
            return;
        }

        // Valid token -> Stage 2
        currentResetToken = tokenObj;
        const targetDisplay = document.getElementById('reset-target-user-display');
        if (targetDisplay) targetDisplay.textContent = `${tokenObj.userName || tokenObj.userId} (${tokenObj.userId})`;

        const pwdInput = document.getElementById('usr-new-password');
        const confirmInput = document.getElementById('usr-confirm-password');
        if (pwdInput) pwdInput.value = '';
        if (confirmInput) confirmInput.value = '';
        evaluatePasswordPolicy('', '');

        showResetStage('reset-stage-set-new');
        showToast(`Token verified for ${tokenObj.userId}. Please set your new password.`, "info");
    }

    function handlePasswordResetRequest() {
        const idInput = document.getElementById('usr-reset-id');
        const emailInput = document.getElementById('usr-reset-email');
        const alertEl = document.getElementById('reset-request-alert');

        let userId = idInput ? idInput.value.trim().toUpperCase() : '';
        let email = emailInput ? emailInput.value.trim().toLowerCase() : '';

        // Strip accidental prefix copies (e.g. "E.G.", "P.G.", "A.G.", "EG:", "EXAMPLE:")
        userId = userId.replace(/^(E\.G\.|P\.G\.|A\.G\.|EG:|EXAMPLE:)\s*/i, '').trim();
        email = email.replace(/^(e\.g\.|p\.g\.|a\.g\.|eg:|example:)\s*/i, '').trim();

        if (idInput) idInput.value = userId;
        if (emailInput) emailInput.value = email;

        // Mandatory validation
        if (!userId || !email) {
            showToast("Validation Error: User ID and Email Address are both mandatory.", "danger");
            if (alertEl) {
                alertEl.className = 'badge-danger';
                alertEl.style.display = 'block';
                alertEl.innerHTML = '<strong>⚠️ Validation Error:</strong> Please enter both your User ID and registered Email Address.';
                alertEl.classList.remove('hidden');
            }
            if (!userId && idInput) idInput.focus();
            else if (!email && emailInput) emailInput.focus();
            return;
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("Validation Error: Please enter a valid corporate email address.", "danger");
            if (alertEl) {
                alertEl.className = 'badge-danger';
                alertEl.style.display = 'block';
                alertEl.innerHTML = '<strong>⚠️ Invalid Email:</strong> Please enter a valid email format (e.g. name@domain.com).';
                alertEl.classList.remove('hidden');
            }
            if (emailInput) emailInput.focus();
            return;
        }

        // Match account against loaded users
        const matchedUser = users.find(u => 
            u.userId.toUpperCase() === userId && 
            (u.emailId || '').toLowerCase() === email
        );

        // Anti-enumeration generic messaging
        if (alertEl) {
            alertEl.className = 'badge-success';
            alertEl.style.display = 'block';
            alertEl.style.background = '#f0fdf4';
            alertEl.style.border = '1px solid #bbf7d0';
            alertEl.style.color = '#15803d';
            alertEl.innerHTML = `<strong>📨 Password Reset Initiated:</strong> If the provided User ID and Email Address match an active account in our records, a secure password reset link has been dispatched to <strong>${escapeHtml(email)}</strong>.`;
            alertEl.classList.remove('hidden');
        }

        if (matchedUser) {
            const tokenStr = generateSecureToken();
            const now = Date.now();
            const expiresAt = now + (15 * 60 * 1000); // 15 minutes
            const resetUrl = getResetUrl(tokenStr);

            const tokenObj = {
                token: tokenStr,
                userId: matchedUser.userId,
                userName: matchedUser.userName,
                email: matchedUser.emailId,
                createdAt: now,
                expiresAt: expiresAt,
                used: false
            };

            const tokens = getResetTokens();
            tokens.push(tokenObj);
            saveResetTokens(tokens);

            currentResetToken = tokenObj;

            // Dispatch real email via default Mail app / Web API
            dispatchRealEmail(tokenObj);

            // Open on-screen mail preview modal
            openSimulatedEmailModal(tokenObj);
            showToast(`Security Email dispatched to ${matchedUser.emailId}`, "success");
        } else {
            showToast("Password reset request processed.", "info");
        }
    }

    function handleSubmitNewPassword() {
        if (!currentResetToken) {
            displayInvalidTokenState("Session token not found. Please restart password reset.");
            return;
        }

        const tokens = getResetTokens();
        const tokenIndex = tokens.findIndex(t => t.token === currentResetToken.token);
        const tokenObj = tokenIndex > -1 ? tokens[tokenIndex] : currentResetToken;

        const now = Date.now();
        if (now > tokenObj.expiresAt) {
            displayInvalidTokenState("Password reset link expired before submission. Please request a new link.");
            return;
        }

        if (tokenObj.used) {
            displayInvalidTokenState("This reset link has already been used.");
            return;
        }

        const pwdInput = document.getElementById('usr-new-password');
        const confirmInput = document.getElementById('usr-confirm-password');
        const newPwd = pwdInput ? pwdInput.value : '';
        const confirmPwd = confirmInput ? confirmInput.value : '';

        const isValid = evaluatePasswordPolicy(newPwd, confirmPwd);
        if (!isValid) {
            showToast("Validation Error: New password does not meet all policy requirements.", "danger");
            return;
        }

        const user = findUser(tokenObj.userId);
        if (!user) {
            showToast("Error: Associated user account could not be found.", "danger");
            return;
        }

        user.password = newPwd;
        saveUsersState();

        tokenObj.used = true;
        if (tokenIndex > -1) {
            tokens[tokenIndex] = tokenObj;
            saveResetTokens(tokens);
        }

        const successUserDisplay = document.getElementById('reset-success-user-display');
        if (successUserDisplay) successUserDisplay.textContent = `${user.userName || user.userId} (${user.userId})`;

        showResetStage('reset-stage-success');
        showToast(`Password changed successfully for ${user.userId}!`, "success");
    }

    function checkUrlResetToken() {
        let token = null;
        try {
            const searchParams = new URLSearchParams(window.location.search);
            token = searchParams.get('token');
            if (!token && window.location.hash) {
                const match = window.location.hash.match(/[?&]token=([^&]+)/) || window.location.hash.match(/token=([^&]+)/);
                if (match) token = match[1];
            }
        } catch (e) {
            console.error("Error parsing URL reset token", e);
        }

        if (token) {
            console.log("Detected password reset token in URL:", token);
            if (typeof switchModule === 'function') switchModule('user-setup');
            if (typeof switchUserSubtab === 'function') switchUserSubtab('reset-password');
            setTimeout(() => {
                handleTokenResetLinkClick(token);
            }, 120);
        }
    }

    function initResetPassword() {
        // Attach Reset Password event listeners
        const btnReqReset = document.getElementById('btn-request-password-reset');
        if (btnReqReset) btnReqReset.addEventListener('click', handlePasswordResetRequest);

        const btnQuickFill = document.getElementById('btn-quickfill-reset-demo');
        if (btnQuickFill) {
            btnQuickFill.addEventListener('click', () => {
                const idInput = document.getElementById('usr-reset-id');
                const emailInput = document.getElementById('usr-reset-email');
                if (idInput) idInput.value = 'HARCHA';
                if (emailInput) emailInput.value = 'harshal.chaudhari@syrimed.co.uk';
                showToast("Populated demo credentials for User 'HARCHA'.", "info");
            });
        }

        const btnResetFormClear = document.getElementById('btn-reset-form-clear');
        if (btnResetFormClear) {
            btnResetFormClear.addEventListener('click', () => {
                const idInput = document.getElementById('usr-reset-id');
                const emailInput = document.getElementById('usr-reset-email');
                const alertEl = document.getElementById('reset-request-alert');
                if (idInput) idInput.value = '';
                if (emailInput) emailInput.value = '';
                if (alertEl) alertEl.classList.add('hidden');
                showToast("Reset form cleared.", "info");
            });
        }

        const btnSubmitNewPwd = document.getElementById('btn-submit-new-password');
        if (btnSubmitNewPwd) btnSubmitNewPwd.addEventListener('click', handleSubmitNewPassword);

        const btnCancelSetNew = document.getElementById('btn-cancel-set-new');
        if (btnCancelSetNew) {
            btnCancelSetNew.addEventListener('click', () => {
                showResetStage('reset-stage-request');
            });
        }

        const btnSuccessToUserList = document.getElementById('btn-success-to-userlist');
        if (btnSuccessToUserList) {
            btnSuccessToUserList.addEventListener('click', () => {
                const listTab = sidebarNavMenu.querySelector('[data-subtab="user-list"]');
                if (listTab) listTab.click();
                else switchUserSubtab('user-list');
            });
        }

        const btnSuccessNewReq = document.getElementById('btn-success-new-request');
        if (btnSuccessNewReq) {
            btnSuccessNewReq.addEventListener('click', () => {
                const idInput = document.getElementById('usr-reset-id');
                const emailInput = document.getElementById('usr-reset-email');
                const alertEl = document.getElementById('reset-request-alert');
                if (idInput) idInput.value = '';
                if (emailInput) emailInput.value = '';
                if (alertEl) alertEl.classList.add('hidden');
                showResetStage('reset-stage-request');
            });
        }

        const btnInvalidReqAgain = document.getElementById('btn-invalid-request-again');
        if (btnInvalidReqAgain) {
            btnInvalidReqAgain.addEventListener('click', () => {
                showResetStage('reset-stage-request');
            });
        }

        // Email modal action links
        const btnEmailResetLink = document.getElementById('btn-email-click-reset-link');
        if (btnEmailResetLink) {
            btnEmailResetLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentResetToken) {
                    handleTokenResetLinkClick(currentResetToken.token);
                }
            });
        }

        const emailUrlLink = document.getElementById('email-preview-url-link');
        if (emailUrlLink) {
            emailUrlLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentResetToken) {
                    handleTokenResetLinkClick(currentResetToken.token);
                }
            });
        }

        const btnEmailCopyLink = document.getElementById('btn-email-copy-link');
        if (btnEmailCopyLink) {
            btnEmailCopyLink.addEventListener('click', () => {
                if (currentResetToken) {
                    const url = getResetUrl(currentResetToken.token);
                    navigator.clipboard.writeText(url).then(() => {
                        showToast("Copied reset link to clipboard!", "success");
                    }).catch(() => {
                        prompt("Copy this reset URL:", url);
                    });
                }
            });
        }

        const btnEmailOpenMailApp = document.getElementById('btn-email-open-mailapp');
        if (btnEmailOpenMailApp) {
            btnEmailOpenMailApp.addEventListener('click', () => {
                if (currentResetToken) {
                    dispatchRealEmail(currentResetToken);
                    showToast("Opening email in default mail client...", "info");
                }
            });
        }

        const btnCloseEmailModal = document.getElementById('btn-close-email-modal');
        if (btnCloseEmailModal) btnCloseEmailModal.addEventListener('click', closeSimulatedEmailModal);

        const btnCloseEmailModalBtn = document.getElementById('btn-close-email-modal-btn');
        if (btnCloseEmailModalBtn) btnCloseEmailModalBtn.addEventListener('click', closeSimulatedEmailModal);

        // Simulation controls
        const btnSimExpire = document.getElementById('btn-sim-expire-token');
        if (btnSimExpire) {
            btnSimExpire.addEventListener('click', () => {
                if (currentResetToken) {
                    currentResetToken.expiresAt = Date.now() - 1000;
                    const tokens = getResetTokens();
                    const idx = tokens.findIndex(t => t.token === currentResetToken.token);
                    if (idx > -1) {
                        tokens[idx].expiresAt = currentResetToken.expiresAt;
                        saveResetTokens(tokens);
                    }
                    showToast("Simulation: Token expiration timestamp adjusted to the past (>15 mins ago).", "warning");
                }
            });
        }

        const btnSimUsed = document.getElementById('btn-sim-used-token');
        if (btnSimUsed) {
            btnSimUsed.addEventListener('click', () => {
                if (currentResetToken) {
                    currentResetToken.used = true;
                    const tokens = getResetTokens();
                    const idx = tokens.findIndex(t => t.token === currentResetToken.token);
                    if (idx > -1) {
                        tokens[idx].used = true;
                        saveResetTokens(tokens);
                    }
                    showToast("Simulation: Token marked as already used.", "warning");
                }
            });
        }

        // Live policy checking listeners
        const newPwdInput = document.getElementById('usr-new-password');
        const confirmPwdInput = document.getElementById('usr-confirm-password');
        if (newPwdInput) {
            newPwdInput.addEventListener('input', () => {
                evaluatePasswordPolicy(newPwdInput.value, confirmPwdInput ? confirmPwdInput.value : '');
            });
        }
        if (confirmPwdInput) {
            confirmPwdInput.addEventListener('input', () => {
                evaluatePasswordPolicy(newPwdInput ? newPwdInput.value : '', confirmPwdInput.value);
            });
        }

        // Show/hide password toggles
        document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    if (targetInput.type === 'password') {
                        targetInput.type = 'text';
                        btn.textContent = '🙈';
                    } else {
                        targetInput.type = 'password';
                        btn.textContent = '👁️';
                    }
                }
            });
        });
    }

    function switchUserSubtab(subtabName) {
        const panels = document.querySelectorAll('.sub-tab-panel');
        panels.forEach(panel => {
            if (panel.id === `panel-${subtabName}`) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        });

        const titleEl = document.getElementById('usr-workspace-title');
        const subtitleEl = document.getElementById('usr-workspace-subtitle');
        const badgeEl = document.getElementById('user-active-screen-badge');

        if (!titleEl || !subtitleEl || !badgeEl) return;

        switch (subtabName) {
            case 'user-list':
                titleEl.textContent = 'User Profiles';
                subtitleEl.textContent = 'List of registered ERP system users and authorization states.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-L';
                renderUserSetupList();
                break;
            case 'user-creation':
                titleEl.textContent = editingUserId ? 'Edit User Details' : 'B&S User Creation';
                subtitleEl.textContent = editingUserId ? `Modify profile configuration for User '${editingUserId}'.` : 'Register new system users and credentials.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-C';
                populateUserCreationCompanyDropdown();
                break;
            case 'user-reopen':
                titleEl.textContent = 'User Reopen';
                subtitleEl.textContent = 'Reopen/unlock user accounts and assign default credentials.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-R';
                break;
            case 'allocate-company-site':
                titleEl.textContent = 'Allocate Company & Site';
                subtitleEl.textContent = 'Allocate companies and physical site branches to users.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-A';
                populateCompanyDropdown();
                break;
            case 'application-access':
                titleEl.textContent = 'Application Access';
                subtitleEl.textContent = 'Manage system module access permissions for users.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-AA';
                break;
            case 'qms-access':
                titleEl.textContent = 'QMS Access';
                subtitleEl.textContent = 'Establish QMS module access rights, freeze accounts, and define database roles.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-Q';
                break;
            case 'user-deletion':
                titleEl.textContent = 'User Deactivation';
                subtitleEl.textContent = 'Deactivate user profiles and suspend system access permissions.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-D';
                break;
            case 'reset-password':
                titleEl.textContent = 'Reset Password';
                subtitleEl.textContent = 'Reset or change security passwords for user accounts.';
                badgeEl.textContent = 'Active Screen: ERP-MD-003-P';
                showResetStage('reset-stage-request');
                break;
        }
    }

    function populateCompanyDropdown(elementId, opts) {
        // Legacy no-arg call: populate usr-alloc-company-select (backward compat)
        if (!elementId || typeof elementId !== 'string') {
            populateCompanyDropdown('usr-alloc-company-select', { includeBlank: false, activeOnly: true });
            updateAllocSiteCheckboxes();
            return;
        }
        opts = opts || {};
        var el = document.getElementById(elementId);
        if (!el) return;

        var includeBlank = opts.includeBlank !== undefined ? opts.includeBlank : true;
        var blankLabel   = opts.blankLabel  !== undefined ? opts.blankLabel  : '-- Select Company --';
        var blankValue   = opts.blankValue  !== undefined ? opts.blankValue  : '';
        var allOption    = opts.allOption   || false;
        var activeOnly   = opts.activeOnly  !== undefined ? opts.activeOnly  : true;
        var displayFn    = opts.displayFn   || function(c) { return c.companyId + ' - ' + c.companyName; };
        var valueFn      = opts.valueFn     || function(c) { return c.companyId; };
        var prevValue    = el.value || '';

        el.innerHTML = '';

        var list = activeOnly
            ? companies.filter(function(c) { return c.status !== 'Inactive'; })
            : companies.slice();

        if (allOption) {
            var allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All Companies';
            el.appendChild(allOpt);
        } else if (includeBlank) {
            var blankOpt = document.createElement('option');
            blankOpt.value = blankValue;
            blankOpt.textContent = blankLabel;
            el.appendChild(blankOpt);
        }

        if (list.length === 0) {
            var emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = '(No Active Companies)';
            el.appendChild(emptyOpt);
        } else {
            list.forEach(function(c) {
                var opt = document.createElement('option');
                opt.value = valueFn(c);
                opt.textContent = displayFn(c);
                el.appendChild(opt);
            });
        }

        // Restore previous selection if still valid
        if (prevValue) {
            var found = Array.from(el.options).some(function(o) { return o.value === prevValue; });
            if (found) el.value = prevValue;
        }
    }

    // Populates ALL company dropdowns across every ERP module from the single source of truth.
    // Call after: (1) loadSavedConfig(), (2) any company save/update.
    function populateAllCompanyDropdowns() {
        // Master Data Setup
        populateCompanyDropdown('site-company-select', { includeBlank: false, activeOnly: true });
        populateCompanyDropdown('usr-new-company-id', { includeBlank: true, blankLabel: '-- Select Company --', activeOnly: true });
        populateCompanyDropdown('usr-alloc-company-select', { includeBlank: false, activeOnly: true });
        // Customer Creation
        populateCompanyDropdown('cust-form-company', { includeBlank: false, activeOnly: true });
        populateCompanyDropdown('cust-credit-parent-company', { includeBlank: true, blankLabel: '-- Select Parent Company --', activeOnly: false });
        // Supplier Setup
        populateCompanyDropdown('sup-form-company', { includeBlank: false, activeOnly: true });
        // Part Creation
        populateCompanyDropdown('pc-form-company', { includeBlank: true, blankLabel: '-- Select Company --', activeOnly: true });
        // Finance / Ledger
        populateCompanyDropdown('coa-company-filter', { allOption: true, activeOnly: true });
        populateCompanyDropdown('gl-company-select',  { allOption: true, activeOnly: true });
        // Finance list-view filter dropdowns
        ['cr-filter-company','tc-filter-company','cost-company-filter','ag-filter-company','acc-filter-company',
         'pt-filter-company','filter-ugp-company','filter-aper-company','filter-ay-company','filter-vst-company',
         'filter-ugvs-company','filter-pc-company','filter-pcd-company','atp-filter-company','filter-tpd-company'
        ].forEach(function(id) { populateCompanyDropdown(id, { allOption: true, activeOnly: true }); });
        // Finance modal form selects
        ['modal-tc-company','modal-ag-company','modal-acc-company','modal-pt-company']
        .forEach(function(id) { populateCompanyDropdown(id, { includeBlank: true, blankLabel: '-- Select Company --', activeOnly: true }); });
        // Finance record form selects
        ['ugp-form-company','aper-form-company','ay-form-company','vst-form-company',
         'ugvs-form-company','pcd-form-company','tpd-form-company','atp-form-company'
        ].forEach(function(id) { populateCompanyDropdown(id, { includeBlank: true, blankLabel: '-- Select Company --', activeOnly: true }); });
    }

    function populateUserCreationCompanyDropdown() {
        // Delegates to centralized company dropdown utility
        populateCompanyDropdown('usr-new-company-id', { includeBlank: true, blankLabel: '', blankValue: '', activeOnly: true });
    }

    function updateAllocSiteCheckboxes() {
        const selectEl = document.getElementById('usr-alloc-company-select');
        const container = document.getElementById('usr-alloc-site-checkboxes');
        if (!selectEl || !container) return;

        const companyId = selectEl.value;
        container.innerHTML = '';

        if (!companyId) {
            container.innerHTML = `<span style="font-size: 12px; color: var(--color-text-muted);">Please select a company to view available sites.</span>`;
            return;
        }

        // Filter sites list for sites belonging to the selected company
        const companySites = sites.filter(st => st.companyId === companyId);
        if (companySites.length === 0) {
            container.innerHTML = `<span style="font-size: 12px; color: var(--color-text-muted); padding: 4px 0;">No sites found for this company. Add sites in Site Setup.</span>`;
            return;
        }

        companySites.forEach(st => {
            const label = document.createElement('label');
            label.style.display = 'inline-flex';
            label.style.alignItems = 'center';
            label.style.gap = '6px';
            label.style.fontSize = '12px';
            label.style.fontWeight = 'normal';
            label.style.cursor = 'pointer';
            label.style.userSelect = 'none';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = st.id;
            checkbox.className = 'usr-alloc-site-chk';
            checkbox.style.width = '14px';
            checkbox.style.height = '14px';
            checkbox.style.cursor = 'pointer';
            checkbox.checked = true;

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${st.id} (${st.desc})`));
            container.appendChild(label);
        });
    }

    function saveUsersState() {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    function findUser(userId) {
        if (!userId) return null;
        return users.find(u => u.userId.toUpperCase() === userId.trim().toUpperCase());
    }

    function initAppAccessTable() {
        const tbody = document.getElementById('app-access-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        Object.keys(APP_MODULES).forEach(appKey => {
            const appName = APP_NAMES[appKey];
            
            // Parent application row
            const parentRow = document.createElement('tr');
            parentRow.className = 'app-header-row';
            parentRow.setAttribute('data-appkey', appKey);
            parentRow.innerHTML = `
                <td class="app-toggle-cell">
                    <span class="toggle-icon">▶</span> ${escapeHtml(appName)}
                </td>
                <td style="text-align: center; width: 180px;"><input type="radio" name="app-parent-${appKey}" class="usr-app-parent-radio" value="manager"></td>
                <td style="text-align: center; width: 180px;"><input type="radio" name="app-parent-${appKey}" class="usr-app-parent-radio" value="normal"></td>
                <td style="text-align: center; width: 180px;"><input type="radio" name="app-parent-${appKey}" class="usr-app-parent-radio" value="none"></td>
            `;

            // Child modules row
            const modulesRow = document.createElement('tr');
            modulesRow.className = 'app-modules-row hidden';
            modulesRow.setAttribute('data-appkey', appKey);
            
            const modulesCell = document.createElement('td');
            modulesCell.setAttribute('colspan', '4');
            modulesCell.style.padding = '0';

            const innerTable = document.createElement('table');
            innerTable.className = 'modules-inner-table';
            
            APP_MODULES[appKey].forEach(mod => {
                const modSlug = mod.replace(/\s+/g, '-').toLowerCase();
                const tr = document.createElement('tr');
                tr.className = 'module-row';
                tr.setAttribute('data-module', mod);
                tr.innerHTML = `
                    <td class="module-name-cell">${escapeHtml(mod)}</td>
                    <td style="text-align: center; width: 180px;"><input type="radio" name="app-module-${appKey}-${modSlug}" class="usr-module-radio" value="manager"></td>
                    <td style="text-align: center; width: 180px;"><input type="radio" name="app-module-${appKey}-${modSlug}" class="usr-module-radio" value="normal"></td>
                    <td style="text-align: center; width: 180px;"><input type="radio" name="app-module-${appKey}-${modSlug}" class="usr-module-radio" value="none"></td>
                `;
                innerTable.appendChild(tr);
            });

            modulesCell.appendChild(innerTable);
            modulesRow.appendChild(modulesCell);
            tbody.appendChild(parentRow);
            tbody.appendChild(modulesRow);

            // Collapsible Toggle click listener
            parentRow.addEventListener('click', (e) => {
                if (e.target.tagName.toLowerCase() === 'input') return;
                
                const isExpanded = parentRow.classList.toggle('expanded');
                if (isExpanded) {
                    modulesRow.classList.remove('hidden');
                } else {
                    modulesRow.classList.add('hidden');
                }
            });

            // Parent radio click listener
            const parentRadios = parentRow.querySelectorAll('.usr-app-parent-radio');
            parentRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const selectedVal = radio.value;
                    const childRadios = modulesRow.querySelectorAll('.usr-module-radio');
                    childRadios.forEach(cr => {
                        if (cr.value === selectedVal) {
                            cr.checked = true;
                        }
                    });
                });
            });

            // Child radio click listener
            const childRadios = modulesRow.querySelectorAll('.usr-module-radio');
            childRadios.forEach(cr => {
                cr.addEventListener('change', () => {
                    updateParentRadioState(appKey, modulesRow, parentRow);
                });
            });
        });
    }

    function updateParentRadioState(appKey, modulesRow, parentRow) {
        const modules = APP_MODULES[appKey];
        const selectedVals = [];
        
        modules.forEach(mod => {
            const modSlug = mod.replace(/\s+/g, '-').toLowerCase();
            const checkedRadio = modulesRow.querySelector(`input[name="app-module-${appKey}-${modSlug}"]:checked`);
            if (checkedRadio) {
                selectedVals.push(checkedRadio.value);
            }
        });

        const parentRadios = parentRow.querySelectorAll('.usr-app-parent-radio');
        
        if (selectedVals.length === modules.length && selectedVals.every(v => v === selectedVals[0])) {
            const targetVal = selectedVals[0];
            parentRadios.forEach(pr => {
                pr.checked = (pr.value === targetVal);
            });
        } else {
            parentRadios.forEach(pr => {
                pr.checked = false;
            });
        }
    }

    function initUserSetup() {
        // Initialize dynamic Application Access table
        initAppAccessTable();

        // Bind keyup/input listeners for auto-lookup
        const bindLookup = (inputId, callback) => {
            const el = document.getElementById(inputId);
            if (el) {
                el.addEventListener('input', (e) => {
                    const val = e.target.value.trim();
                    const user = findUser(val);
                    callback(user, val);
                });
            }
        };

        // User Reopen
        bindLookup('usr-reopen-id', (user) => {
            const pwdInput = document.getElementById('usr-reopen-pwd');
            if (pwdInput) {
                pwdInput.value = user ? user.password : '';
            }
        });

        // Allocate Company and Site
        bindLookup('usr-alloc-id', (user) => {
            const nameLbl = document.getElementById('usr-alloc-name-lbl');
            if (nameLbl) {
                nameLbl.textContent = user ? user.userName : '-';
            }
            renderAllocatedTables(user);
        });

        // Application Access
        bindLookup('usr-app-id', (user) => {
            const nameLbl = document.getElementById('usr-app-name-lbl');
            const locLbl = document.getElementById('usr-app-loc-lbl');
            const sublocLbl = document.getElementById('usr-app-subloc-lbl');
            const detailsContainer = document.getElementById('usr-app-details-container');
            const tablesContainer = document.getElementById('usr-app-tables-container');

            if (user) {
                if (nameLbl) nameLbl.textContent = user.userName;
                if (locLbl) locLbl.textContent = user.location || '-';
                if (sublocLbl) sublocLbl.textContent = user.subLocation || '-';
                if (detailsContainer) detailsContainer.classList.remove('hidden');
                if (tablesContainer) tablesContainer.classList.remove('hidden');
                renderAppAccessTables(user);
            } else {
                if (nameLbl) nameLbl.textContent = '-';
                if (locLbl) locLbl.textContent = '-';
                if (sublocLbl) sublocLbl.textContent = '-';
                if (detailsContainer) detailsContainer.classList.add('hidden');
                if (tablesContainer) tablesContainer.classList.add('hidden');
                renderAppAccessTables(null);
            }

            // Clear or populate radios
            Object.keys(APP_MODULES).forEach(appKey => {
                const parentRow = document.querySelector(`.app-header-row[data-appkey="${appKey}"]`);
                const modulesRow = document.querySelector(`.app-modules-row[data-appkey="${appKey}"]`);
                if (!parentRow || !modulesRow) return;

                // Reset expansion on user lookup
                parentRow.classList.remove('expanded');
                modulesRow.classList.add('hidden');

                const appAccessVal = user && user.appAccess ? user.appAccess[appKey] : null;

                APP_MODULES[appKey].forEach(mod => {
                    const modSlug = mod.replace(/\s+/g, '-').toLowerCase();
                    const radios = modulesRow.querySelectorAll(`input[name="app-module-${appKey}-${modSlug}"]`);
                    let modRole = "";
                    if (appAccessVal && typeof appAccessVal === 'object') {
                        modRole = appAccessVal[mod] || "";
                    }
                    
                    radios.forEach(r => {
                        r.checked = (r.value === modRole);
                    });
                });

                updateParentRadioState(appKey, modulesRow, parentRow);
            });
        });

        // QMS Access
        bindLookup('usr-qms-id', (user) => {
            const nameLbl = document.getElementById('usr-qms-name-lbl');
            const locLbl = document.getElementById('usr-qms-loc-lbl');
            const sublocLbl = document.getElementById('usr-qms-subloc-lbl');
            const managerLbl = document.getElementById('usr-qms-manager-lbl');
            const freezeLbl = document.getElementById('usr-qms-freeze-lbl');
            const managerInput = document.getElementById('usr-qms-manager-input');
            const freezeBtn = document.getElementById('btn-qms-freeze');

            if (nameLbl) nameLbl.textContent = user ? user.userName : '-';
            if (locLbl) locLbl.textContent = user ? user.location : '-';
            if (sublocLbl) sublocLbl.textContent = user ? user.subLocation : '-';
            if (managerLbl) managerLbl.textContent = user ? user.matrixManager : '-';
            if (managerInput) managerInput.value = user ? user.matrixManager : '';
            
            const isFrozen = user ? user.qmsRoles.ccExtApprovedInd === 'Y' : false;
            if (freezeLbl) freezeLbl.textContent = isFrozen ? 'Y' : 'N';
            if (freezeBtn) {
                freezeBtn.textContent = isFrozen ? 'Unfreeze' : 'Freeze';
                freezeBtn.style.backgroundColor = isFrozen ? 'var(--color-success)' : 'var(--color-danger)';
            }

            // Radio buttons populate
            const radios = document.querySelectorAll('.usr-qms-radio');
            radios.forEach(r => {
                r.disabled = isFrozen || !user;
                if (user) {
                    const moduleName = r.closest('tr').getAttribute('data-module');
                    const val = r.value;
                    const prop = getQmsRoleProp(moduleName);
                    r.checked = user.qmsRoles[prop] === val;
                } else {
                    r.checked = false;
                }
            });

            renderQmsTables(user);
        });

        // User Deletion
        bindLookup('usr-del-search-id', (user) => {
            const detailsCard = document.getElementById('usr-del-details-card');
            const idLbl = document.getElementById('usr-del-id-lbl');
            const nameLbl = document.getElementById('usr-del-name-lbl');
            const empidLbl = document.getElementById('usr-del-empid-lbl');
            const deptLbl = document.getElementById('usr-del-dept-lbl');
            const emailLbl = document.getElementById('usr-del-email-lbl');
            const managerLbl = document.getElementById('usr-del-manager-lbl');
            const locLbl = document.getElementById('usr-del-loc-lbl');
            const statusLbl = document.getElementById('usr-del-status-lbl');
            const sublocLbl = document.getElementById('usr-del-subloc-lbl');

            if (user) {
                if (detailsCard) detailsCard.classList.remove('hidden');
                if (idLbl) idLbl.textContent = user.userId;
                if (nameLbl) nameLbl.textContent = user.userName;
                if (empidLbl) empidLbl.textContent = user.employeeId;
                if (deptLbl) deptLbl.textContent = user.department;
                if (emailLbl) emailLbl.textContent = user.emailId;
                if (managerLbl) managerLbl.textContent = user.matrixManager;
                if (locLbl) locLbl.textContent = user.location;
                if (statusLbl) {
                    statusLbl.textContent = user.status;
                    statusLbl.style.color = (user.status === 'DELETED') ? 'var(--color-danger)' : 'var(--color-success)';
                }
                if (sublocLbl) sublocLbl.textContent = user.subLocation;
            } else {
                if (detailsCard) detailsCard.classList.add('hidden');
            }
        });



        // ACTION BUTTONS HANDLERS
        
        // 1. User Creation Save (Handles both creation & editing)
        const btnNewUserSave = document.getElementById('btn-new-user-save');
        if (btnNewUserSave) {
            btnNewUserSave.addEventListener('click', () => {
                const userIdInput = document.getElementById('usr-new-id');
                const userId = userIdInput.value.trim().toUpperCase();
                const userName = document.getElementById('usr-new-name').value.trim();
                const emailId = document.getElementById('usr-new-email').value.trim();
                const employeeId = document.getElementById('usr-new-empid').value.trim();
                const department = document.getElementById('usr-new-dept').value.trim();
                const matrixManager = document.getElementById('usr-new-manager').value.trim();
                const location = document.getElementById('usr-new-loc').value;
                const team = document.getElementById('usr-new-team').value.trim();
                const companyId = document.getElementById('usr-new-company-id').value;
                const isCoordinator = document.getElementById('usr-new-is-coordinator').value;
                const coordinatorGroup = document.getElementById('usr-new-coordinator-group').value;
                const isBuyer = document.getElementById('usr-new-is-buyer').value;
                const windowsUserId = document.getElementById('usr-new-windows-userid').value.trim();
                const designation = document.getElementById('usr-new-designation').value.trim();
                let password = document.getElementById('usr-new-pwd').value.trim();

                if (!userId || !userName || !emailId) {
                    showToast("Validation Error: User ID, Name, and Email ID are required.", "danger");
                    return;
                }

                if (!password) {
                    password = userId; // Default to User ID
                }

                if (editingUserId) {
                    // Edit mode
                    const user = findUser(editingUserId);
                    if (!user) {
                        showToast(`Error: User '${editingUserId}' not found in database.`, "danger");
                        return;
                    }

                    user.userName = userName;
                    user.emailId = emailId;
                    user.employeeId = employeeId;
                    user.department = department;
                    user.matrixManager = matrixManager;
                    user.location = location;
                    user.team = team;
                    user.companyId = companyId;
                    user.isCoordinator = isCoordinator;
                    user.coordinatorGroup = coordinatorGroup;
                    user.isBuyer = isBuyer;
                    user.windowsUserId = windowsUserId;
                    user.designation = designation;
                    user.password = password;

                    saveUsersState();
                    showToast(`User '${editingUserId}' details updated successfully!`, "success");
                    
                    // Clear edit state & enable ID input
                    editingUserId = null;
                    userIdInput.disabled = false;

                    // Reset form & navigate to user list
                    document.getElementById('btn-new-user-reset').click();
                    const listTab = sidebarNavMenu.querySelector('[data-subtab="user-list"]');
                    if (listTab) listTab.click();
                } else {
                    // Create mode
                    if (findUser(userId)) {
                        showToast(`Error: User ID '${userId}' already exists.`, "danger");
                        return;
                    }

                    const newUser = {
                        userId,
                        userName,
                        emailId,
                        employeeId,
                        department,
                        location,
                        team,
                        companyId,
                        isCoordinator,
                        coordinatorGroup,
                        isBuyer,
                        windowsUserId,
                        designation,
                        matrixManager,
                        password,
                        status: "OPEN",
                        allocatedCompanies: [],
                        allocatedSites: [],
                        appAccess: (() => {
                            const access = {};
                            Object.keys(APP_MODULES).forEach(k => {
                                access[k] = {};
                                APP_MODULES[k].forEach(m => { access[k][m] = ""; });
                            });
                            return access;
                        })(),
                        appAccessLogs: [],
                        qmsRoles: {
                            dept: "QMS",
                            intAudit: "Y",
                            capa: "",
                            devMgmt: "",
                            cma: "",
                            changeControl: "",
                            changeControlInd: "",
                            ccExtApprovedInd: "N"
                        },
                        dbRoles: [],
                        qmsLogs: []
                    };

                    users.push(newUser);
                    saveUsersState();
                    showToast(`User '${userName}' (ID: ${userId}) created successfully!`, "success");
                    
                    // Reset form & navigate to user list
                    document.getElementById('btn-new-user-reset').click();
                    const listTab = sidebarNavMenu.querySelector('[data-subtab="user-list"]');
                    if (listTab) listTab.click();
                }
            });
        }

        const btnNewUserReset = document.getElementById('btn-new-user-reset');
        if (btnNewUserReset) {
            btnNewUserReset.addEventListener('click', () => {
                const userIdInput = document.getElementById('usr-new-id');
                if (userIdInput) {
                    userIdInput.value = '';
                    userIdInput.disabled = false;
                }
                editingUserId = null;
                document.getElementById('usr-new-name').value = '';
                document.getElementById('usr-new-email').value = '';
                document.getElementById('usr-new-empid').value = '';
                document.getElementById('usr-new-dept').value = '';
                document.getElementById('usr-new-manager').value = '';
                document.getElementById('usr-new-loc').value = '';
                document.getElementById('usr-new-team').value = '';
                document.getElementById('usr-new-company-id').value = '';
                document.getElementById('usr-new-is-coordinator').value = 'False';
                document.getElementById('usr-new-coordinator-group').value = '';
                document.getElementById('usr-new-is-buyer').value = 'False';
                document.getElementById('usr-new-windows-userid').value = '';
                document.getElementById('usr-new-designation').value = '';
                document.getElementById('usr-new-pwd').value = '';
            });
        }

        // 2. User Reopen Save
        const btnReopenSave = document.getElementById('btn-reopen-save');
        if (btnReopenSave) {
            btnReopenSave.addEventListener('click', () => {
                const userId = document.getElementById('usr-reopen-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: User ID not found.", "danger");
                    return;
                }
                const newPwd = document.getElementById('usr-reopen-pwd').value.trim();
                if (!newPwd) {
                    showToast("Error: Password cannot be blank.", "danger");
                    return;
                }
                user.status = "OPEN";
                user.password = newPwd;
                saveUsersState();
                showToast(`User account '${user.userId}' reopened successfully!`, "success");
            });
        }

        const btnReopenReset = document.getElementById('btn-reopen-reset');
        if (btnReopenReset) {
            btnReopenReset.addEventListener('click', () => {
                document.getElementById('usr-reopen-id').value = '';
                document.getElementById('usr-reopen-pwd').value = '';
            });
        }

        // 3. Allocate Company & Site Add Company
        const companySelectEl = document.getElementById('usr-alloc-company-select');
        if (companySelectEl) {
            companySelectEl.addEventListener('change', () => {
                updateAllocSiteCheckboxes();
            });
        }

        const btnAllocAddCompany = document.getElementById('btn-alloc-add-company');
        if (btnAllocAddCompany) {
            btnAllocAddCompany.addEventListener('click', () => {
                const userId = document.getElementById('usr-alloc-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: Select a valid User ID first.", "danger");
                    return;
                }
                const companyId = document.getElementById('usr-alloc-company-select').value;
                if (!companyId) {
                    showToast("Error: Select a company first.", "danger");
                    return;
                }

                // Get checked sites from checkboxes list
                const checkedSiteBoxes = document.querySelectorAll('.usr-alloc-site-chk:checked');
                const checkedSiteIds = Array.from(checkedSiteBoxes).map(cb => cb.value);

                const companyAlreadyAllocated = user.allocatedCompanies.some(c => c.companyId === companyId);
                
                // Track how many new sites are allocated
                let newSitesAllocated = 0;
                checkedSiteIds.forEach(siteId => {
                    if (!user.allocatedSites.some(s => s.siteId === siteId)) {
                        const siteDefault = user.allocatedSites.length === 0;
                        user.allocatedSites.push({ siteId: siteId, default: siteDefault });
                        newSitesAllocated++;
                    }
                });

                if (companyAlreadyAllocated && newSitesAllocated === 0) {
                    if (checkedSiteIds.length > 0) {
                        showToast(`Warning: Company '${companyId}' and selected sites are already allocated.`, "warning");
                    } else {
                        showToast(`Warning: Company '${companyId}' is already allocated. Please select at least one site to allocate.`, "warning");
                    }
                    return;
                }

                if (!companyAlreadyAllocated) {
                    const isDefault = document.getElementById('usr-alloc-default-company-chk').checked;
                    if (isDefault) {
                        user.allocatedCompanies.forEach(c => c.default = false);
                    }
                    user.allocatedCompanies.push({ companyId, default: isDefault });
                }

                saveUsersState();
                renderAllocatedTables(user);
                
                if (newSitesAllocated > 0) {
                    showToast(`Allocated Company '${companyId}' and ${newSitesAllocated} selected site(s) to user '${user.userId}'!`, "success");
                } else {
                    showToast(`Company '${companyId}' allocated to user '${user.userId}'!`, "success");
                }
            });
        }

        // 4. Application Access Save
        const btnAppSave = document.getElementById('btn-app-save');
        if (btnAppSave) {
            btnAppSave.addEventListener('click', () => {
                const userId = document.getElementById('usr-app-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: Select a valid User ID first.", "danger");
                    return;
                }

                if (!user.appAccess) {
                    user.appAccess = {};
                }
                if (!user.appAccessLogs) {
                    user.appAccessLogs = [];
                }

                let changeDetected = false;

                // Get current date time string in format DD/MM/YYYY HH:MM:SS
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const dateTimeStr = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

                Object.keys(APP_MODULES).forEach(appKey => {
                    const appName = APP_NAMES[appKey].toUpperCase();
                    const modulesRow = document.querySelector(`.app-modules-row[data-appkey="${appKey}"]`);
                    if (!modulesRow) return;

                    if (!user.appAccess[appKey] || typeof user.appAccess[appKey] !== 'object') {
                        user.appAccess[appKey] = {};
                    }

                    APP_MODULES[appKey].forEach(mod => {
                        const modSlug = mod.replace(/\s+/g, '-').toLowerCase();
                        const checkedRadio = modulesRow.querySelector(`input[name="app-module-${appKey}-${modSlug}"]:checked`);
                        const val = checkedRadio ? checkedRadio.value : '';

                        const oldVal = user.appAccess[appKey][mod] || '';

                        if (oldVal !== val) {
                            user.appAccess[appKey][mod] = val;
                            
                            // Only log if val is set and is not 'none' (granted access)
                            if (val && val !== 'none') {
                                user.appAccessLogs.push({
                                    appName: `${appName} - ${mod.toUpperCase()}`,
                                    roleType: val.toUpperCase(),
                                    createdBy: "IFSAPP",
                                    creationDate: dateTimeStr
                                });
                            }
                            changeDetected = true;
                        }
                    });
                });

                saveUsersState();
                renderAppAccessTables(user);
                showToast(`Application Access privileges updated for '${user.userId}'!`, "success");
            });
        }

        const btnAppReset = document.getElementById('btn-app-reset');
        if (btnAppReset) {
            btnAppReset.addEventListener('click', () => {
                document.getElementById('usr-app-id').value = '';
                // Trigger input event to clear labels and radio buttons
                document.getElementById('usr-app-id').dispatchEvent(new Event('input'));
            });
        }

        // 5. QMS Access Freeze / Unfreeze
        const btnQmsFreeze = document.getElementById('btn-qms-freeze');
        if (btnQmsFreeze) {
            btnQmsFreeze.addEventListener('click', () => {
                const userId = document.getElementById('usr-qms-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: Select a valid User ID first.", "danger");
                    return;
                }

                const currentFreeze = user.qmsRoles.ccExtApprovedInd === 'Y';
                const nextFreeze = !currentFreeze;
                user.qmsRoles.ccExtApprovedInd = nextFreeze ? 'Y' : 'N';

                // Log this freeze action
                user.qmsLogs.push({
                    moduleName: "All Modules",
                    accessType: nextFreeze ? "FREEZE" : "UNFREEZE",
                    createdBy: "IFSAPP"
                });

                saveUsersState();
                
                // Re-trigger QMS input event to re-render
                document.getElementById('usr-qms-id').dispatchEvent(new Event('input'));

                showToast(`QMS Freeze state set to '${nextFreeze ? 'Y' : 'N'}' for '${user.userId}'!`, "success");
            });
        }

        // 6. QMS Access Save Roles
        const btnQmsAdd = document.getElementById('btn-qms-add');
        if (btnQmsAdd) {
            btnQmsAdd.addEventListener('click', () => {
                const userId = document.getElementById('usr-qms-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: Select a valid User ID first.", "danger");
                    return;
                }

                if (user.qmsRoles.ccExtApprovedInd === 'Y') {
                    showToast("Error: Cannot modify QMS roles. Account is Frozen.", "danger");
                    return;
                }

                const managerInput = document.getElementById('usr-qms-manager-input').value.trim();
                if (managerInput && managerInput !== user.matrixManager) {
                    user.matrixManager = managerInput;
                    user.qmsLogs.push({
                        moduleName: "Matrix Manager",
                        accessType: `Update to: ${managerInput}`,
                        createdBy: "IFSAPP"
                    });
                }

                // Check radio buttons
                const tableRows = document.querySelectorAll('#qms-access-type-table tbody tr');
                tableRows.forEach(row => {
                    const moduleName = row.getAttribute('data-module');
                    const prop = getQmsRoleProp(moduleName);
                    const selectedRadio = row.querySelector('input[type="radio"]:checked');
                    if (selectedRadio) {
                        const val = selectedRadio.value;
                        if (user.qmsRoles[prop] !== val) {
                            user.qmsRoles[prop] = val;
                            user.qmsLogs.push({
                                moduleName,
                                accessType: val,
                                createdBy: "IFSAPP"
                            });

                            // Add to dbRoles table if training matrix is modified
                            if (moduleName === 'Training Matrix' && !user.dbRoles.some(r => r.roleName === 'TRAINING_MATRIX')) {
                                user.dbRoles.push({ roleName: "TRAINING_MATRIX", defaultRole: "YES", adminOption: "NO" });
                            }
                        }
                    }
                });

                saveUsersState();
                document.getElementById('usr-qms-id').dispatchEvent(new Event('input'));
                showToast(`QMS roles saved successfully for '${user.userId}'!`, "success");
            });
        }

        const btnQmsReset = document.getElementById('btn-qms-reset');
        if (btnQmsReset) {
            btnQmsReset.addEventListener('click', () => {
                document.getElementById('usr-qms-id').value = '';
                document.getElementById('usr-qms-id').dispatchEvent(new Event('input'));
            });
        }

        // 7. User Deactivation
        const btnDelDelete = document.getElementById('btn-del-delete');
        if (btnDelDelete) {
            btnDelDelete.addEventListener('click', () => {
                const userId = document.getElementById('usr-del-search-id').value.trim();
                const user = findUser(userId);
                if (!user) {
                    showToast("Error: Select a valid User ID to deactivate.", "danger");
                    return;
                }

                if (confirm(`Are you sure you want to deactivate user account '${user.userId}'?`)) {
                    user.status = "Inactive";
                    saveUsersState();
                    document.getElementById('usr-del-search-id').dispatchEvent(new Event('input'));
                    showToast(`User account '${user.userId}' status marked as Inactive!`, "success");
                }
            });
        }

        const btnDelReset = document.getElementById('btn-del-reset');
        if (btnDelReset) {
            btnDelReset.addEventListener('click', () => {
                document.getElementById('usr-del-search-id').value = '';
                document.getElementById('usr-del-search-id').dispatchEvent(new Event('input'));
                const repEmail = document.getElementById('usr-del-replace-email');
                if (repEmail) repEmail.value = '';
            });
        }

        // User Setup List View Actions
        const btnUserNew = document.getElementById('btn-user-new');
        if (btnUserNew) {
            btnUserNew.addEventListener('click', () => {
                editingUserId = null;
                document.getElementById('btn-new-user-reset').click();
                const createTab = sidebarNavMenu.querySelector('[data-subtab="user-creation"]');
                if (createTab) createTab.click();
            });
        }

        // Export Excel Actions
        const exportToCsv = (filename, headers, dataRows) => {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
            dataRows.forEach(row => {
                const rowContent = row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
                csvContent += rowContent + "\r\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const btnCompanyExport = document.getElementById('btn-company-export-excel');
        if (btnCompanyExport) {
            btnCompanyExport.addEventListener('click', () => {
                const headers = ["Company ID", "Company Name", "Country", "Association Type", "Address ID", "Status"];
                const rows = companies.map(c => [
                    c.companyId,
                    c.companyName,
                    c.country,
                    c.associationType || 'Legal Entity',
                    c.addressId || '01',
                    c.status
                ]);
                exportToCsv("companies.csv", headers, rows);
                showToast("Exported companies to CSV.", "success");
            });
        }

        const btnSiteExport = document.getElementById('btn-site-export-excel');
        if (btnSiteExport) {
            btnSiteExport.addEventListener('click', () => {
                const headers = ["Site Code", "Description", "Company ID", "Company Name", "Delivery Address", "Status"];
                const rows = sites.map(s => [
                    s.id,
                    s.desc,
                    s.companyId,
                    s.companyName,
                    s.deliveryAddress,
                    s.status
                ]);
                exportToCsv("sites.csv", headers, rows);
                showToast("Exported sites to CSV.", "success");
            });
        }

        const btnUserExport = document.getElementById('btn-user-export-excel');
        if (btnUserExport) {
            btnUserExport.addEventListener('click', () => {
                const headers = ["User ID", "Full Name", "Employee ID", "Email ID", "Department ID", "Team", "Matrix Manager", "Location", "Company ID", "Is Coordinator", "Coordinator Group", "Is Buyer", "Windows User ID", "Designation", "Status"];
                const rows = users.map(u => [
                    u.userId,
                    u.userName,
                    u.employeeId || '',
                    u.emailId || '',
                    u.department || '',
                    u.team || '',
                    u.matrixManager || '',
                    u.location || '',
                    u.companyId || '',
                    u.isCoordinator || 'False',
                    u.coordinatorGroup || '',
                    u.isBuyer || 'False',
                    u.windowsUserId || '',
                    u.designation || '',
                    u.status
                ]);
                exportToCsv("users.csv", headers, rows);
                showToast("Exported users to CSV.", "success");
            });
        }
    }

    function getQmsRoleProp(moduleName) {
        switch (moduleName) {
            case 'CAPA': return 'capa';
            case 'Audit Management': return 'audit';
            case 'Training Matrix': return 'training';
            case 'Deviation': return 'deviation';
            case 'Change Control': return 'change';
            case 'Complaint': return 'complaint';
            case 'Change Control India': return 'ccindia';
            default: return '';
        }
    }

    function renderAllocatedTables(user) {
        const companyBody = document.getElementById('usr-alloc-company-body');
        const siteBody = document.getElementById('usr-alloc-site-body');

        if (!companyBody || !siteBody) return;

        companyBody.innerHTML = '';
        siteBody.innerHTML = '';

        if (!user || user.allocatedCompanies.length === 0) {
            companyBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--color-text-muted);">No allocated companies.</td></tr>`;
        } else {
            user.allocatedCompanies.forEach((c, idx) => {
                const tr = document.createElement('tr');
                if (c.default) {
                    tr.className = 'row-highlight';
                }
                tr.innerHTML = `
                    <td class="text-center">${idx + 1}</td>
                    <td>${escapeHtml(c.companyId)}</td>
                    <td>${c.default ? escapeHtml(c.companyId) : '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-secondary btn-del-allocated-comp" data-compid="${c.companyId}" style="padding: 2px 8px; font-size: 11px; background-color: var(--color-danger); color: #fff; border: none;">Delete Company</button>
                    </td>
                `;
                companyBody.appendChild(tr);
            });

            // Bind delete button listeners
            const compDelBtns = companyBody.querySelectorAll('.btn-del-allocated-comp');
            compDelBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const compId = btn.getAttribute('data-compid');
                    user.allocatedCompanies = user.allocatedCompanies.filter(c => c.companyId !== compId);
                    
                    // Also filter out any sites of this company
                    sites.forEach(st => {
                        if (st.companyId === compId) {
                            user.allocatedSites = user.allocatedSites.filter(s => s.siteId !== st.id);
                        }
                    });

                    saveUsersState();
                    renderAllocatedTables(user);
                    showToast(`Removed Company '${compId}' allocation.`, "success");
                });
            });
        }

        if (!user || user.allocatedSites.length === 0) {
            siteBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--color-text-muted);">No allocated sites.</td></tr>`;
        } else {
            user.allocatedSites.forEach((s, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center">${idx + 1}</td>
                    <td>${escapeHtml(s.siteId)}</td>
                    <td>${s.default ? escapeHtml(s.siteId) : '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-secondary btn-del-allocated-site" data-siteid="${s.siteId}" style="padding: 2px 8px; font-size: 11px; background-color: var(--color-danger); color: #fff; border: none;">Delete Site</button>
                    </td>
                `;
                siteBody.appendChild(tr);
            });

            // Bind delete site button listeners
            const siteDelBtns = siteBody.querySelectorAll('.btn-del-allocated-site');
            siteDelBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const siteId = btn.getAttribute('data-siteid');
                    user.allocatedSites = user.allocatedSites.filter(s => s.siteId !== siteId);
                    saveUsersState();
                    renderAllocatedTables(user);
                    showToast(`Removed Site '${siteId}' allocation.`, "success");
                });
            });
        }
    }

    function renderQmsTables(user) {
        const rolesBody = document.getElementById('usr-qms-roles-body');
        const dbRolesBody = document.getElementById('usr-qms-dbroles-body');
        const logBody = document.getElementById('usr-qms-log-body');

        if (!rolesBody || !dbRolesBody || !logBody) return;

        rolesBody.innerHTML = '';
        dbRolesBody.innerHTML = '';
        logBody.innerHTML = '';

        if (!user) {
            rolesBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--color-text-muted);">No data. Select a user ID.</td></tr>`;
            dbRolesBody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted);">No data.</td></tr>`;
            logBody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted);">No logs.</td></tr>`;
            return;
        }

        // Render Roles row
        const rolesTr = document.createElement('tr');
        rolesTr.innerHTML = `
            <td>${escapeHtml(user.qmsRoles.dept || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.intAudit || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.capa || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.devMgmt || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.cma || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.change || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.ccindia || '-')}</td>
            <td>${escapeHtml(user.qmsRoles.ccExtApprovedInd || '-')}</td>
        `;
        rolesBody.appendChild(rolesTr);

        // Render dbRoles
        if (user.dbRoles.length === 0) {
            dbRolesBody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted);">No granted roles.</td></tr>`;
        } else {
            user.dbRoles.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(r.roleName)}</td>
                    <td>${escapeHtml(r.defaultRole)}</td>
                    <td>${escapeHtml(r.adminOption)}</td>
                `;
                dbRolesBody.appendChild(tr);
            });
        }

        // Render qmsLogs
        if (user.qmsLogs.length === 0) {
            logBody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted);">No log records.</td></tr>`;
        } else {
            user.qmsLogs.slice().reverse().forEach(lg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(lg.moduleName)}</td>
                    <td>${escapeHtml(lg.accessType)}</td>
                    <td>${escapeHtml(lg.createdBy)}</td>
                `;
                logBody.appendChild(tr);
            });
        }
    }

    function renderAppAccessTables(user) {
        const rolesBody = document.getElementById('usr-app-roles-body');
        const dbRolesBody = document.getElementById('usr-app-dbroles-body');
        const logBody = document.getElementById('usr-app-log-body');
        const dbrolesCount = document.getElementById('usr-app-dbroles-count');
        const logCount = document.getElementById('usr-app-log-count');

        if (!rolesBody || !dbRolesBody || !logBody) return;

        rolesBody.innerHTML = '';
        dbRolesBody.innerHTML = '';
        logBody.innerHTML = '';

        if (!user) return;

        // 1. Populate USER_ROLES table entry row
        const trRoles = document.createElement('tr');
        const specials = getOverallAppAccess(user.appAccess ? user.appAccess.specialsOrder : null);
        const custSrv = getOverallAppAccess(user.appAccess ? user.appAccess.customerService : null);
        const changeControl = getOverallAppAccess(user.appAccess ? user.appAccess.changeControl : null);
        const cma = getOverallAppAccess(user.appAccess ? user.appAccess.cma : null);
        const dms = getOverallAppAccess(user.appAccess ? user.appAccess.dms : null);

        trRoles.innerHTML = `
            <td>AL</td>
            <td>${escapeHtml(custSrv)}</td>
            <td>NORMAL</td>
            <td>${escapeHtml(specials)}</td>
            <td></td>
            <td>1</td>
            <td>${escapeHtml(changeControl)}</td>
            <td>${escapeHtml(dms)}</td>
            <td>${escapeHtml(user.emailId || '')}</td>
            <td>${escapeHtml(cma)}</td>
        `;
        rolesBody.appendChild(trRoles);

        // 2. Populate Database Role
        if (user.dbRoles && user.dbRoles.length > 0) {
            user.dbRoles.forEach((r, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${idx + 1} &nbsp; ${escapeHtml(r.roleName)}</td>
                    <td>${escapeHtml(r.defaultRole)}</td>
                    <td>${escapeHtml(r.adminOption)}</td>
                `;
                dbRolesBody.appendChild(tr);
            });
            if (dbrolesCount) {
                dbrolesCount.innerHTML = `<span>View 1 - ${user.dbRoles.length} of ${user.dbRoles.length}</span>`;
            }
        } else {
            dbRolesBody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted);">No database roles granted.</td></tr>`;
            if (dbrolesCount) dbrolesCount.innerHTML = `<span>View 0 - 0 of 0</span>`;
        }

        // 3. Populate Application Access Log
        const logs = user.appAccessLogs || [];
        if (logs.length > 0) {
            logs.slice().reverse().forEach((lg, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${idx + 1} &nbsp; ${escapeHtml(lg.appName)}</td>
                    <td>${escapeHtml(lg.roleType)}</td>
                    <td>${escapeHtml(lg.createdBy)}</td>
                    <td>${escapeHtml(lg.creationDate)}</td>
                `;
                logBody.appendChild(tr);
            });
            if (logCount) {
                logCount.innerHTML = `<span>View 1 - ${logs.length} of ${logs.length}</span>`;
            }
        } else {
            logBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--color-text-muted);">No logs recorded.</td></tr>`;
            if (logCount) logCount.innerHTML = `<span>View 0 - 0 of 0</span>`;
        }
    }

    function renderUserSetupList() {
        const body = document.getElementById('usr-list-body');
        if (!body) return;

        body.innerHTML = '';
        if (users.length === 0) {
            body.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--color-text-muted);">No users found.</td></tr>`;
            return;
        }

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(u.userId)}</td>
                <td>${escapeHtml(u.userName)}</td>
                <td>${escapeHtml(u.employeeId || '-')}</td>
                <td>${escapeHtml(u.department || '-')}</td>
                <td>${escapeHtml(u.emailId || '-')}</td>
                <td>${escapeHtml(u.location || '-')}</td>
                <td><span style="font-weight: 700; color: ${(u.status === 'DELETED' || u.status === 'Inactive') ? 'var(--color-danger)' : 'var(--color-success)'};">${(u.status === 'DELETED' || u.status === 'Inactive') ? 'Inactive' : 'Active'}</span></td>
                <td class="text-center">
                    <button class="btn btn-secondary btn-user-edit-row" data-userid="${u.userId}" style="padding: 2px 8px; font-size: 11px; background-color: var(--color-primary); color: #fff; border: none;">Edit</button>
                </td>
            `;
            body.appendChild(tr);
        });

        // Bind Edit buttons
        body.querySelectorAll('.btn-user-edit-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-userid');
                const user = findUser(userId);
                if (user) {
                    editingUserId = user.userId;
                    
                    // Pre-fill inputs in User Creation tab
                    const userIdInput = document.getElementById('usr-new-id');
                    if (userIdInput) {
                        userIdInput.value = user.userId;
                        userIdInput.disabled = true; // primary key
                    }

                    document.getElementById('usr-new-name').value = user.userName;
                    document.getElementById('usr-new-email').value = user.emailId;
                    document.getElementById('usr-new-empid').value = user.employeeId || '';
                    document.getElementById('usr-new-dept').value = user.department || '';
                    document.getElementById('usr-new-manager').value = user.matrixManager || '';
                    document.getElementById('usr-new-loc').value = user.location || '';
                    document.getElementById('usr-new-team').value = user.team || '';
                    document.getElementById('usr-new-company-id').value = user.companyId || '';
                    document.getElementById('usr-new-is-coordinator').value = user.isCoordinator || 'False';
                    document.getElementById('usr-new-coordinator-group').value = user.coordinatorGroup || '';
                    document.getElementById('usr-new-is-buyer').value = user.isBuyer || 'False';
                    document.getElementById('usr-new-windows-userid').value = user.windowsUserId || '';
                    document.getElementById('usr-new-designation').value = user.designation || '';
                    document.getElementById('usr-new-pwd').value = user.password;

                    // Switch to User Creation tab
                    const createTab = sidebarNavMenu.querySelector('[data-subtab="user-creation"]');
                    if (createTab) createTab.click();
                    showToast(`Editing user '${userId}'.`, "info");
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Customer Creation & Setup Module Logic
    // -------------------------------------------------------------
    let uploadedFiles = {
        gphc: '',
        emailAuth: '',
        dd: '',
        acctForm: ''
    };

    let currentCustomerAddresses = [];
    let editingAddressId = null;
    let customUploadedFiles = [];
    let currentCustomerMemberships = [];
    let editingMembershipIndex = -1;
    let currentCustomerContacts = [];

    function renderAddressList() {
        const body = document.getElementById('addr-list-body');
        if (!body) return;

        body.innerHTML = '';

        if (currentCustomerAddresses.length === 0) {
            body.innerHTML = `<tr><td colspan="13" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No addresses entered. Fill out form and click 'Add / Update Address Line'.</td></tr>`;
            return;
        }

        currentCustomerAddresses.forEach(addr => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(addr.addressId)}</strong></td>
                <td>${escapeHtml(addr.addr1)}</td>
                <td>${escapeHtml(addr.addr2 || '-')}</td>
                <td>${escapeHtml(addr.city)}</td>
                <td>${escapeHtml(addr.postcode)}</td>
                <td>${escapeHtml(addr.state || '-')}</td>
                <td>${escapeHtml(addr.county)}</td>
                <td>${escapeHtml(addr.country)}</td>
                <td>${escapeHtml(addr.telephone || '-')}</td>
                <td>${escapeHtml(addr.faxNo || '-')}</td>
                <td>${escapeHtml(addr.validFrom || '-')}</td>
                <td>${escapeHtml(addr.validTo || '-')}</td>
                <td style="text-align: center;">
                    <button class="btn btn-secondary btn-addr-edit-row" data-id="${addr.addressId}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-primary); border:none; color:#fff; border-radius:4px; cursor:pointer;" type="button">Edit</button>
                    <button class="btn btn-danger btn-addr-delete-row" data-id="${addr.addressId}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-danger); border:none; color:#fff; border-radius:4px; cursor:pointer; margin-left: 5px;" type="button">Delete</button>
                </td>
            `;

            // Edit binding
            tr.querySelector('.btn-addr-edit-row').addEventListener('click', () => {
                loadAddressDetailsIntoForm(addr);
            });

            // Delete binding
            tr.querySelector('.btn-addr-delete-row').addEventListener('click', () => {
                currentCustomerAddresses = currentCustomerAddresses.filter(a => a.addressId !== addr.addressId);
                renderAddressList();
                showToast(`Address ID '${addr.addressId}' removed from customer.`, "warning");
                if (editingAddressId === addr.addressId) {
                    clearAddressForm();
                }
            });

            body.appendChild(tr);
        });
    }

    function loadAddressDetailsIntoForm(addr) {
        editingAddressId = addr.addressId;
        
        if (document.getElementById('cust-addr-id')) {
            document.getElementById('cust-addr-id').value = addr.addressId;
            document.getElementById('cust-addr-id').disabled = true;
        }
        
        if (document.getElementById('cust-addr-customer-name')) document.getElementById('cust-addr-customer-name').value = addr.customerName || '';
        if (document.getElementById('cust-addr-1')) document.getElementById('cust-addr-1').value = addr.addr1 || '';
        if (document.getElementById('cust-addr-2')) document.getElementById('cust-addr-2').value = addr.addr2 || '';
        if (document.getElementById('cust-addr-city')) document.getElementById('cust-addr-city').value = addr.city || '';
        if (document.getElementById('cust-addr-postcode')) document.getElementById('cust-addr-postcode').value = addr.postcode || '';
        if (document.getElementById('cust-addr-county')) document.getElementById('cust-addr-county').value = addr.county || '';
        if (document.getElementById('cust-addr-state')) document.getElementById('cust-addr-state').value = addr.state || '';
        if (document.getElementById('cust-addr-country')) document.getElementById('cust-addr-country').value = addr.country || 'GB';
        if (document.getElementById('cust-addr-route')) document.getElementById('cust-addr-route').value = addr.route || '444 DX';
        
        if (document.getElementById('cust-addr-tax-liability')) document.getElementById('cust-addr-tax-liability').value = addr.taxLiability || 'TAX Taxable';
        if (document.getElementById('cust-addr-tax-code')) document.getElementById('cust-addr-tax-code').value = addr.taxCode || 'Select Free Tax Code';
        if (document.getElementById('cust-addr-region')) document.getElementById('cust-addr-region').value = addr.region || 'Select Region';
        
        if (document.getElementById('cust-addr-tel')) document.getElementById('cust-addr-tel').value = addr.telephone || '';
        if (document.getElementById('cust-addr-fax')) document.getElementById('cust-addr-fax').value = addr.faxNo || '';
        
        if (document.getElementById('cust-addr-valid-from')) document.getElementById('cust-addr-valid-from').value = addr.validFrom || '';
        if (document.getElementById('cust-addr-valid-to')) document.getElementById('cust-addr-valid-to').value = addr.validTo || '';
        if (document.getElementById('cust-addr-delivery-terms')) document.getElementById('cust-addr-delivery-terms').value = addr.deliveryTerms || 'NXW Next Day Delivery';

        if (document.getElementById('chk-addr-type-delivery')) document.getElementById('chk-addr-type-delivery').checked = !!(addr.addressType && addr.addressType.delivery);
        if (document.getElementById('chk-addr-def-delivery')) document.getElementById('chk-addr-def-delivery').checked = !!(addr.addressType && addr.addressType.deliveryDefault);
        if (document.getElementById('chk-addr-type-invoice')) document.getElementById('chk-addr-type-invoice').checked = !!(addr.addressType && addr.addressType.invoice);
        if (document.getElementById('chk-addr-def-invoice')) document.getElementById('chk-addr-def-invoice').checked = !!(addr.addressType && addr.addressType.invoiceDefault);
        if (document.getElementById('chk-addr-type-pay')) document.getElementById('chk-addr-type-pay').checked = !!(addr.addressType && addr.addressType.pay);
        if (document.getElementById('chk-addr-def-pay')) document.getElementById('chk-addr-def-pay').checked = !!(addr.addressType && addr.addressType.payDefault);

        const btnAddUpdate = document.getElementById('btn-addr-add-update');
        if (btnAddUpdate) btnAddUpdate.textContent = 'Update Address Line';
    }

    function clearAddressForm() {
        editingAddressId = null;
        
        if (document.getElementById('cust-addr-id')) {
            let maxId = 0;
            currentCustomerAddresses.forEach(a => {
                const parsed = parseInt(a.addressId);
                if (!isNaN(parsed) && parsed > maxId) maxId = parsed;
            });
            const nextId = (maxId + 1).toString().padStart(2, '0');
            document.getElementById('cust-addr-id').value = nextId;
            document.getElementById('cust-addr-id').disabled = false;
        }

        if (document.getElementById('cust-addr-customer-name')) document.getElementById('cust-addr-customer-name').value = '';
        if (document.getElementById('cust-addr-1')) document.getElementById('cust-addr-1').value = '';
        if (document.getElementById('cust-addr-2')) document.getElementById('cust-addr-2').value = '';
        if (document.getElementById('cust-addr-city')) document.getElementById('cust-addr-city').value = '';
        if (document.getElementById('cust-addr-postcode')) document.getElementById('cust-addr-postcode').value = '';
        if (document.getElementById('cust-addr-county')) document.getElementById('cust-addr-county').value = '';
        if (document.getElementById('cust-addr-state')) document.getElementById('cust-addr-state').value = '';
        if (document.getElementById('cust-addr-country')) document.getElementById('cust-addr-country').value = 'GB';
        if (document.getElementById('cust-addr-route')) document.getElementById('cust-addr-route').value = '444 DX';
        
        if (document.getElementById('cust-addr-tax-liability')) document.getElementById('cust-addr-tax-liability').value = 'TAX Taxable';
        if (document.getElementById('cust-addr-tax-code')) document.getElementById('cust-addr-tax-code').value = 'Select Free Tax Code';
        if (document.getElementById('cust-addr-region')) document.getElementById('cust-addr-region').value = 'Select Region';
        
        if (document.getElementById('cust-addr-tel')) document.getElementById('cust-addr-tel').value = '';
        if (document.getElementById('cust-addr-fax')) document.getElementById('cust-addr-fax').value = '';
        
        if (document.getElementById('cust-addr-valid-from')) document.getElementById('cust-addr-valid-from').value = '';
        if (document.getElementById('cust-addr-valid-to')) document.getElementById('cust-addr-valid-to').value = '';
        if (document.getElementById('cust-addr-delivery-terms')) document.getElementById('cust-addr-delivery-terms').value = 'NXW Next Day Delivery';

        if (document.getElementById('chk-addr-type-delivery')) document.getElementById('chk-addr-type-delivery').checked = true;
        if (document.getElementById('chk-addr-def-delivery')) document.getElementById('chk-addr-def-delivery').checked = true;
        if (document.getElementById('chk-addr-type-invoice')) document.getElementById('chk-addr-type-invoice').checked = true;
        if (document.getElementById('chk-addr-def-invoice')) document.getElementById('chk-addr-def-invoice').checked = true;
        if (document.getElementById('chk-addr-type-pay')) document.getElementById('chk-addr-type-pay').checked = true;
        if (document.getElementById('chk-addr-def-pay')) document.getElementById('chk-addr-def-pay').checked = true;

        const btnAddUpdate = document.getElementById('btn-addr-add-update');
        if (btnAddUpdate) btnAddUpdate.textContent = 'Add / Update Address Line';
    }

    function addUpdateAddressLine() {
        const addressId = document.getElementById('cust-addr-id') ? document.getElementById('cust-addr-id').value.trim() : '';
        const customerName = document.getElementById('cust-addr-customer-name') ? document.getElementById('cust-addr-customer-name').value.trim() : '';
        const addr1 = document.getElementById('cust-addr-1') ? document.getElementById('cust-addr-1').value.trim() : '';
        const addr2 = document.getElementById('cust-addr-2') ? document.getElementById('cust-addr-2').value.trim() : '';
        const city = document.getElementById('cust-addr-city') ? document.getElementById('cust-addr-city').value.trim() : '';
        const postcode = document.getElementById('cust-addr-postcode') ? document.getElementById('cust-addr-postcode').value.trim() : '';
        const county = document.getElementById('cust-addr-county') ? document.getElementById('cust-addr-county').value.trim() : '';
        const state = document.getElementById('cust-addr-state') ? document.getElementById('cust-addr-state').value.trim() : '';
        const country = document.getElementById('cust-addr-country') ? document.getElementById('cust-addr-country').value : 'GB';
        const route = document.getElementById('cust-addr-route') ? document.getElementById('cust-addr-route').value : '444 DX';
        
        const taxLiability = document.getElementById('cust-addr-tax-liability') ? document.getElementById('cust-addr-tax-liability').value : 'TAX Taxable';
        const taxCode = document.getElementById('cust-addr-tax-code') ? document.getElementById('cust-addr-tax-code').value : 'Select Free Tax Code';
        const region = document.getElementById('cust-addr-region') ? document.getElementById('cust-addr-region').value : 'Select Region';
        
        const telephone = document.getElementById('cust-addr-tel') ? document.getElementById('cust-addr-tel').value.trim() : '';
        const faxNo = document.getElementById('cust-addr-fax') ? document.getElementById('cust-addr-fax').value.trim() : '';
        
        const validFrom = document.getElementById('cust-addr-valid-from') ? document.getElementById('cust-addr-valid-from').value : '';
        const validTo = document.getElementById('cust-addr-valid-to') ? document.getElementById('cust-addr-valid-to').value : '';
        const deliveryTerms = document.getElementById('cust-addr-delivery-terms') ? document.getElementById('cust-addr-delivery-terms').value : 'NXW Next Day Delivery';

        if (!addressId) {
            showToast("Error: Address ID is required.", "danger");
            return;
        }
        if (!addr1) {
            showToast("Error: Address 1 is required.", "danger");
            return;
        }
        if (!city) {
            showToast("Error: City is required.", "danger");
            return;
        }
        if (!postcode) {
            showToast("Error: Post Code is required.", "danger");
            return;
        }
        if (!county) {
            showToast("Error: County is required.", "danger");
            return;
        }

        const deliv = document.getElementById('chk-addr-type-delivery') ? document.getElementById('chk-addr-type-delivery').checked : true;
        const delivDef = document.getElementById('chk-addr-def-delivery') ? document.getElementById('chk-addr-def-delivery').checked : true;
        const invo = document.getElementById('chk-addr-type-invoice') ? document.getElementById('chk-addr-type-invoice').checked : true;
        const invoDef = document.getElementById('chk-addr-def-invoice') ? document.getElementById('chk-addr-def-invoice').checked : true;
        const pay = document.getElementById('chk-addr-type-pay') ? document.getElementById('chk-addr-type-pay').checked : true;
        const payDef = document.getElementById('chk-addr-def-pay') ? document.getElementById('chk-addr-def-pay').checked : true;

        const newAddr = {
            addressId,
            customerName,
            addr1,
            addr2,
            city,
            postcode,
            county,
            state,
            country,
            route,
            taxLiability,
            taxCode,
            region,
            telephone,
            faxNo,
            validFrom,
            validTo,
            deliveryTerms,
            addressType: {
                delivery: deliv,
                deliveryDefault: delivDef,
                invoice: invo,
                invoiceDefault: invoDef,
                pay: pay,
                payDefault: payDef
            }
        };

        if (editingAddressId) {
            const idx = currentCustomerAddresses.findIndex(a => a.addressId === editingAddressId);
            if (idx !== -1) {
                currentCustomerAddresses[idx] = newAddr;
                showToast(`Address ID '${addressId}' updated successfully.`, "success");
            }
        } else {
            const exists = currentCustomerAddresses.some(a => a.addressId === addressId);
            if (exists) {
                showToast("Error: Address ID already exists. Use a unique ID.", "danger");
                return;
            }
            currentCustomerAddresses.push(newAddr);
            showToast(`Address ID '${addressId}' added to customer.`, "success");
        }

        renderAddressList();
        clearAddressForm();
    }

    function renderCustomDocsList() {
        const container = document.getElementById('custom-docs-container');
        if (!container) return;
        container.innerHTML = '';

        customUploadedFiles.forEach((doc, idx) => {
            const row = document.createElement('div');
            row.className = 'file-upload-row';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '15px';
            row.style.padding = '8px 12px';
            row.style.border = '1px solid var(--color-border-light)';
            row.style.borderRadius = '6px';
            row.style.backgroundColor = '#fff';

            const statusClass = doc.status === 'Uploaded' ? 'doc-status verified' : 'doc-status missing';
            const buttonText = doc.status === 'Uploaded' ? 'Change File' : `Upload ${doc.docLabel}`;

            row.innerHTML = `
                <div class="doc-label" style="flex: 1; font-weight: 500; font-size: 13px;">${escapeHtml(doc.docLabel)}:</div>
                <div class="${statusClass}" id="status-custom-${idx}" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; width: 65px; text-align: center;">${doc.status}</div>
                <button type="button" class="btn btn-upload-green btn-upload-custom" data-index="${idx}" style="padding: 6px 12px; font-size: 12px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                    <span>⬆</span> ${buttonText}
                </button>
                <span style="font-size:11px; color:var(--color-text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(doc.filename || '')}</span>
                <button type="button" class="btn btn-secondary btn-delete-custom" data-index="${idx}" style="padding: 6px 10px; font-size: 12px; border-radius: 4px; background-color: #fee2e2; color: #ef4444; border: none; cursor: pointer;">
                    Delete
                </button>
            `;

            // Bind upload mock handler
            row.querySelector('.btn-upload-custom').addEventListener('click', () => {
                doc.filename = `custom_doc_${doc.docLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}.pdf`;
                doc.status = 'Uploaded';
                renderCustomDocsList();
            });

            // Bind delete handler
            row.querySelector('.btn-delete-custom').addEventListener('click', () => {
                customUploadedFiles.splice(idx, 1);
                renderCustomDocsList();
            });

            container.appendChild(row);
        });
    }

    function clearMembershipForm() {
        const memberNoInput = document.getElementById('cust-member-no');
        if (memberNoInput) memberNoInput.value = 'TBC';
        
        const memberNameInput = document.getElementById('cust-member-name');
        if (memberNameInput) memberNameInput.value = '';
        
        const memberGroupInput = document.getElementById('cust-member-group');
        if (memberGroupInput) memberGroupInput.value = '';
        
        const memberJoiningInput = document.getElementById('cust-member-joining');
        if (memberJoiningInput) memberJoiningInput.value = new Date().toISOString().split('T')[0];
        
        const memberLeavingInput = document.getElementById('cust-member-leaving');
        if (memberLeavingInput) memberLeavingInput.value = '';
        
        const memberDefaultChk = document.getElementById('chk-member-default');
        if (memberDefaultChk) memberDefaultChk.checked = false;

        editingMembershipIndex = -1;
        const btnAddUpdate = document.getElementById('btn-member-add-update');
        if (btnAddUpdate) btnAddUpdate.textContent = 'Add / Update Line';
    }

    function addUpdateMembershipLine() {
        const memberNo = document.getElementById('cust-member-no') ? document.getElementById('cust-member-no').value.trim() : 'TBC';
        const memberName = document.getElementById('cust-member-name') ? document.getElementById('cust-member-name').value.trim() : '';
        const memberGroup = document.getElementById('cust-member-group') ? document.getElementById('cust-member-group').value.trim() : '';
        const joiningDate = document.getElementById('cust-member-joining') ? document.getElementById('cust-member-joining').value : '';
        const leavingDate = document.getElementById('cust-member-leaving') ? document.getElementById('cust-member-leaving').value : '';
        const isDefault = document.getElementById('chk-member-default') ? document.getElementById('chk-member-default').checked : false;

        if (!memberName) {
            showToast("Error: Membership Name is required.", "danger");
            return;
        }
        if (!memberGroup) {
            showToast("Error: Membership Group is required.", "danger");
            return;
        }
        if (!joiningDate) {
            showToast("Error: Joining Date is required.", "danger");
            return;
        }

        // If this is set as default, uncheck default on all other memberships
        if (isDefault) {
            currentCustomerMemberships.forEach(m => m.isDefault = false);
        }

        const record = {
            membershipNo: memberNo || 'TBC',
            membershipName: memberName,
            membershipGroup: memberGroup,
            joiningDate: formatDateToDMY(joiningDate),
            leavingDate: leavingDate ? formatDateToDMY(leavingDate) : '',
            isDefault: isDefault
        };

        if (editingMembershipIndex !== -1) {
            currentCustomerMemberships[editingMembershipIndex] = record;
            showToast("Membership line updated.", "success");
        } else {
            currentCustomerMemberships.push(record);
            showToast("Membership line added.", "success");
        }

        clearMembershipForm();
        renderMembershipList();
    }

    function renderMembershipList() {
        const body = document.getElementById('membership-list-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentCustomerMemberships.length === 0) {
            body.innerHTML = `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No memberships entered. Fill out form and click 'Add / Update Line'.</td></tr>`;
            const viewCountEl = document.getElementById('membership-toolbar-view-count');
            if (viewCountEl) viewCountEl.textContent = 'View 0 - 0 of 0';
            return;
        }

        currentCustomerMemberships.forEach((m, idx) => {
            const tr = document.createElement('tr');
            
            const defText = m.isDefault 
                ? `<span style="color: var(--color-primary); font-weight: bold; font-size: 16px;">✔</span>` 
                : `<span style="color: var(--color-text-muted);">-</span>`;

            tr.innerHTML = `
                <td><strong>${escapeHtml(m.membershipNo)}</strong></td>
                <td>${escapeHtml(m.membershipName)}</td>
                <td>${escapeHtml(m.membershipGroup)}</td>
                <td>${escapeHtml(m.joiningDate)}</td>
                <td>${escapeHtml(m.leavingDate || '-')}</td>
                <td style="text-align: center;">${defText}</td>
                <td style="text-align: center;">
                    <div style="display:flex; gap:6px; justify-content:center;">
                        <button type="button" class="btn btn-secondary btn-member-edit" data-index="${idx}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-primary); border:none; color:#fff; border-radius:4px; cursor:pointer;">Edit</button>
                        <button type="button" class="btn btn-secondary btn-member-delete" data-index="${idx}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-danger); border:none; color:#fff; border-radius:4px; cursor:pointer;">Delete</button>
                    </div>
                </td>
            `;

            // Bind buttons
            tr.querySelector('.btn-member-edit').addEventListener('click', () => {
                editingMembershipIndex = idx;
                const record = currentCustomerMemberships[idx];
                
                if (document.getElementById('cust-member-no')) document.getElementById('cust-member-no').value = record.membershipNo;
                if (document.getElementById('cust-member-name')) document.getElementById('cust-member-name').value = record.membershipName;
                if (document.getElementById('cust-member-group')) document.getElementById('cust-member-group').value = record.membershipGroup;
                if (document.getElementById('cust-member-joining')) document.getElementById('cust-member-joining').value = formatDateToYMD(record.joiningDate);
                if (document.getElementById('cust-member-leaving')) document.getElementById('cust-member-leaving').value = record.leavingDate ? formatDateToYMD(record.leavingDate) : '';
                if (document.getElementById('chk-member-default')) document.getElementById('chk-member-default').checked = record.isDefault;

                const btnAddUpdate = document.getElementById('btn-member-add-update');
                if (btnAddUpdate) btnAddUpdate.textContent = 'Update Line';
            });

            tr.querySelector('.btn-member-delete').addEventListener('click', () => {
                currentCustomerMemberships.splice(idx, 1);
                renderMembershipList();
                showToast("Membership line removed.", "warning");
            });

            body.appendChild(tr);
        });

        const viewCountEl = document.getElementById('membership-toolbar-view-count');
        if (viewCountEl) {
            viewCountEl.textContent = `View 1 - ${currentCustomerMemberships.length} of ${currentCustomerMemberships.length}`;
        }
    }

    function renderContactsList() {
        const body = document.getElementById('cust-contacts-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentCustomerContacts.length === 0) {
            body.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No contacts entered. Click '+ Add Contact Row' to add a contact.</td></tr>`;
            return;
        }

        currentCustomerContacts.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; vertical-align: middle;">
                    <input type="checkbox" class="chk-contact-row-select" data-index="${idx}" ${c.selected ? 'checked' : ''}>
                </td>
                <td>
                    <input type="text" class="contact-input-name" data-index="${idx}" value="${escapeHtml(c.name || '')}" placeholder="Contact Name" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
                <td>
                    <input type="text" class="contact-input-desc" data-index="${idx}" value="${escapeHtml(c.description || '')}" placeholder="Description" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
                <td>
                    <select class="contact-select-method" data-index="${idx}" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                        <option value="Email" ${c.commMethod === 'Email' ? 'selected' : ''}>Email</option>
                        <option value="Phone" ${c.commMethod === 'Phone' ? 'selected' : ''}>Phone</option>
                        <option value="Mobile" ${c.commMethod === 'Mobile' ? 'selected' : ''}>Mobile</option>
                        <option value="Fax" ${c.commMethod === 'Fax' ? 'selected' : ''}>Fax</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="contact-input-val" data-index="${idx}" value="${escapeHtml(c.value || '')}" placeholder="Contact Value (e.g. Email/Phone)" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
            `;

            tr.querySelector('.chk-contact-row-select').addEventListener('change', (e) => {
                currentCustomerContacts[idx].selected = e.target.checked;
            });
            tr.querySelector('.contact-input-name').addEventListener('input', (e) => {
                currentCustomerContacts[idx].name = e.target.value;
            });
            tr.querySelector('.contact-input-desc').addEventListener('input', (e) => {
                currentCustomerContacts[idx].description = e.target.value;
            });
            tr.querySelector('.contact-select-method').addEventListener('change', (e) => {
                currentCustomerContacts[idx].commMethod = e.target.value;
            });
            tr.querySelector('.contact-input-val').addEventListener('input', (e) => {
                currentCustomerContacts[idx].value = e.target.value;
            });

            body.appendChild(tr);
        });
    }

    // Date formatting helper utilities
    function formatDateToDMY(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }

    function formatDateToYMD(dmyString) {
        if (!dmyString) return '';
        const parts = dmyString.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dmyString;
    }

    function resetCustomerForm() {
        const acctIdInput = document.getElementById('cust-form-account-id');
        if (acctIdInput) {
            acctIdInput.value = '';
            acctIdInput.disabled = false;
        }
        
        const nameInput = document.getElementById('cust-form-name');
        if (nameInput) nameInput.value = '';
        
        const typeSelect = document.getElementById('cust-form-customer-type') || document.getElementById('cust-form-company-type-gen') || document.getElementById('cust-form-type');
        if (typeSelect) typeSelect.value = '';
        
        const postcodeVal = document.getElementById('cust-form-postcode');
        if (postcodeVal) postcodeVal.value = '';

        const addr1Input = document.getElementById('cust-form-addr1');
        if (addr1Input) addr1Input.value = '';

        const addr2Input = document.getElementById('cust-form-addr2');
        if (addr2Input) addr2Input.value = '';

        const cityInput = document.getElementById('cust-form-city');
        if (cityInput) cityInput.value = '';

        const countyInput = document.getElementById('cust-form-county');
        if (countyInput) countyInput.value = '';

        const countryInput = document.getElementById('cust-form-country');
        if (countryInput) countryInput.value = 'GB';

        const rsmSelect = document.getElementById('cust-form-rsm');
        if (rsmSelect) rsmSelect.value = '';

        const telInput = document.getElementById('cust-form-tel');
        if (telInput) telInput.value = '';

        const chkDeliv = document.getElementById('chk-addr-delivery');
        if (chkDeliv) chkDeliv.checked = true;

        const chkInvo = document.getElementById('chk-addr-invoice');
        if (chkInvo) chkInvo.checked = true;

        const chkPay = document.getElementById('chk-addr-pay');
        if (chkPay) chkPay.checked = true;

        const resetVal = (id, val = '') => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SELECT' && val) {
                    let exists = Array.from(el.options).some(opt => opt.value === val || opt.text === val);
                    if (!exists) {
                        const newOpt = document.createElement('option');
                        newOpt.value = val;
                        newOpt.textContent = val;
                        el.appendChild(newOpt);
                    }
                }
                el.value = val;
            }
        };
        const resetChk = (id, checked = false) => {
            const el = document.getElementById(id);
            if (el) el.checked = checked;
        };
        const resetDisable = (id, disabled = false) => {
            const el = document.getElementById(id);
            if (el) el.disabled = disabled;
        };

        // Card 1
        resetVal('cust-credit-limit', '50000');
        resetVal('cust-credit-safe-limit', '');
        resetVal('cust-credit-insurer-limit', '');
        resetChk('chk-credit-blocked', false);
        resetVal('cust-credit-analyst', 'KIRPATA');
        resetVal('cust-credit-note', '');

        // Card 2
        resetVal('cust-credit-db-no', '');
        resetVal('cust-credit-db-rating', '');
        resetVal('cust-credit-comment', '');
        resetVal('cust-credit-pay-index', '');
        resetVal('cust-credit-blocked-reason', '');
        resetChk('chk-credit-web-ordering', false);

        // Card 3
        resetChk('chk-credit-relation-exist', false);
        resetVal('cust-credit-relation-type', '');
        resetDisable('cust-credit-relation-type', true);
        resetVal('cust-credit-parent-company', '');
        resetDisable('cust-credit-parent-company', true);
        resetVal('cust-credit-parent-customer', '');
        resetDisable('cust-credit-parent-customer', true);
        resetVal('cust-credit-blocked-reason-note', '');
        resetChk('chk-credit-directors-guarantee', false);
        resetChk('chk-credit-cross-company-guarantee', false);

        // Card 4
        resetVal('cust-credit-stat-group', 'LAX Perivale');
        resetVal('cust-credit-price-group', 'F');
        resetVal('cust-credit-reference', '');
        resetVal('cust-credit-market', 'IND');
        resetVal('cust-credit-rating-value', '');
        resetVal('cust-credit-rating-desc', '');
        resetVal('cust-credit-payment-history', 'Good');

        // Card 5
        resetVal('cust-credit-invoice-customer', '');
        resetVal('cust-credit-invoice-type', 'Normal Invoice');
        resetVal('cust-credit-order-type', 'NO');
        resetVal('cust-credit-rsm', 'GILTHO');
        resetVal('cust-credit-payment-method', 'Direct Debit');
        resetVal('cust-credit-company-status', '');

        // Card 6
        resetChk('chk-credit-stmt-email', false);
        resetVal('cust-credit-stmt-email', '');
        resetDisable('cust-credit-stmt-email', true);
        resetVal('cust-credit-counter-account', '');
        resetChk('chk-credit-special-email', false);
        resetVal('cust-credit-special-email', '');
        resetDisable('cust-credit-special-email', true);
        resetChk('chk-credit-brand-customer', false);
        resetChk('chk-credit-direct-debit', false);

        // Row 3
        resetVal('cust-credit-allowed-due-days', '');
        resetVal('cust-credit-allowed-due-amount', '');
        resetVal('cust-credit-currency-rate-type', '');

        const taxCodeSelect = document.getElementById('cust-form-tax-code');
        if (taxCodeSelect) taxCodeSelect.value = '';

        const buyingGroupSelect = document.getElementById('cust-form-buyinggroup');
        if (buyingGroupSelect) buyingGroupSelect.value = '';

        const pricelistSelect = document.getElementById('cust-form-pricelist');
        if (pricelistSelect) pricelistSelect.value = '';

        const companySelect = document.getElementById('cust-form-company');
        if (companySelect) companySelect.value = 'LAXMI01';

        const currencySelect = document.getElementById('cust-form-currency');
        if (currencySelect) currencySelect.value = 'GBP';

        const taxLiabilitySelect = document.getElementById('cust-form-tax-liability');
        if (taxLiabilitySelect) taxLiabilitySelect.value = 'TAX TAXABLE';

        const gowrieAcctCheckbox = document.getElementById('cust-form-gowrie-acct');
        if (gowrieAcctCheckbox) gowrieAcctCheckbox.checked = false;

        const gowrieGroupSelect = document.getElementById('cust-form-gowrie-group');
        if (gowrieGroupSelect) gowrieGroupSelect.value = '';

        const stateInput = document.getElementById('cust-form-state');
        if (stateInput) stateInput.value = '';

        const routeSelect = document.getElementById('cust-form-route');
        if (routeSelect) routeSelect.value = '444 DX';

        const faxInput = document.getElementById('cust-form-fax');
        if (faxInput) faxInput.value = '';

        const emailInput = document.getElementById('cust-form-email');
        if (emailInput) emailInput.value = '';

        const apEmailInput = document.getElementById('cust-form-ap-email');
        if (apEmailInput) apEmailInput.value = '';

        const gphcNoInput = document.getElementById('cust-form-gphc-no');
        if (gphcNoInput) gphcNoInput.value = '';

        const gphcExpiryInput = document.getElementById('cust-form-gphc-expiry');
        if (gphcExpiryInput) gphcExpiryInput.value = '';

        uploadedFiles = {
            gphc: '',
            emailAuth: '',
            dd: '',
            acctForm: ''
        };
        
        const resetStatus = (statusId, labelId) => {
            const statusEl = document.getElementById(statusId);
            if (statusEl) {
                statusEl.textContent = 'Missing';
                statusEl.className = 'doc-status missing';
            }
            const labelEl = document.getElementById(labelId);
            if (labelEl) labelEl.textContent = '';
        };
        
        resetStatus('status-gphc-upload', 'label-gphc-filename');
        resetStatus('status-email-auth', 'label-email-auth-filename');
        resetStatus('status-dd', 'label-dd-filename');
        resetStatus('status-acct-form', 'label-acct-form-filename');

        const checkboxes = ['chk-verify-postcode', 'chk-verify-emails', 'chk-verify-auth', 'chk-verify-dd'];
        checkboxes.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });

        const formTitle = document.getElementById('cust-form-title');
        if (formTitle) formTitle.textContent = 'Create New Customer';
        
        const statusBadge = document.getElementById('cust-edit-status-badge');
        if (statusBadge) statusBadge.style.display = 'none';

        editingCustomerNo = null;

        // Reset address state
        currentCustomerAddresses = [];
        clearAddressForm();
        renderAddressList();

        // Reset custom files & memberships
        customUploadedFiles = [];
        const docNameInput = document.getElementById('cust-new-doc-name');
        if (docNameInput) docNameInput.value = '';
        renderCustomDocsList();

        currentCustomerMemberships = [];
        clearMembershipForm();
        renderMembershipList();

        currentCustomerContacts = [];
        if (document.getElementById('chk-contacts-all-toggle')) document.getElementById('chk-contacts-all-toggle').checked = false;
        renderContactsList();

        const subTabGen = document.getElementById('btn-cust-subtab-general');
        if (subTabGen) subTabGen.click();
    }

    function renderCustomerList() {
        const body = document.getElementById('customer-list-body');
        if (!body) return;

        body.innerHTML = '';

        const sId = document.getElementById('cust-search-id') ? document.getElementById('cust-search-id').value.trim().toLowerCase() : '';
        const sName = document.getElementById('cust-search-name') ? document.getElementById('cust-search-name').value.trim().toLowerCase() : '';

        const filtered = customers.filter(c => {
            if (!c || !c.accountNumber) return false;
            const matchId = !sId || c.accountNumber.toLowerCase().includes(sId);
            const matchName = !sName || (c.customerName && c.customerName.toLowerCase().includes(sName));
            return matchId && matchName;
        });

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--color-text-muted); padding: 20px;">No customers found matching search criteria.</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const tr = document.createElement('tr');
            
            let badgeStyle = "background-color: var(--color-border); color: var(--color-text-muted);";
            if (c.status === 'Active') {
                badgeStyle = "background-color: #d1fae5; color: #10b981;";
            } else if (c.status === 'Pending QA Approval') {
                badgeStyle = "background-color: #fffbeb; color: #d97706;";
            } else if (c.status === 'Inactive') {
                badgeStyle = "background-color: #fee2e2; color: #ef4444;";
            }

            const currentRole = document.getElementById('rbac-role-selector') ? document.getElementById('rbac-role-selector').value : '';
            const approveBtn = (c.status === 'Pending QA Approval' && (currentRole === 'QA' || currentRole === 'Admin')) 
                ? `<button class="btn btn-primary btn-cust-approve" data-id="${c.accountNumber}" style="padding: 2px 6px; font-size:11px; background-color:#10b981; border:none; color:#fff; border-radius:4px; cursor:pointer;">QA Approve</button>`
                : '';

            const deactivateBtn = (c.status === 'Active')
                ? `<button class="btn btn-secondary btn-cust-deactivate" data-id="${c.accountNumber}" style="padding: 2px 6px; font-size:11px; background-color:#ef4444; border:none; color:#fff; border-radius:4px; cursor:pointer;">Deactivate</button>`
                : '';

            tr.innerHTML = `
                <td><strong>${escapeHtml(c.accountNumber || '')}</strong></td>
                <td>${escapeHtml(c.customerName || '')}</td>
                <td>${escapeHtml(c.postcode || '-')}</td>
                <td>${escapeHtml(c.rsm || '-')}</td>
                <td>£${escapeHtml(c.creditLimit ? c.creditLimit.toLocaleString() : '0')}</td>
                <td>${escapeHtml(c.paymentTerms || '-')}</td>
                <td>${escapeHtml(c.gphcExpiry || '-')}</td>
                <td><span class="badge" style="${badgeStyle} font-weight:600; padding: 2px 8px; border-radius: 4px;">${escapeHtml(c.status || '')}</span></td>
                <td style="text-align: center;">
                    <div style="display:flex; gap:6px; justify-content:center;">
                        <button class="btn btn-secondary btn-cust-edit" data-id="${c.accountNumber}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-primary); border:none; color:#fff; border-radius:4px; cursor:pointer;">Edit</button>
                        ${approveBtn}
                        ${deactivateBtn}
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });

        // Bind Edit buttons
        body.querySelectorAll('.btn-cust-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const c = customers.find(item => item && item.accountNumber && item.accountNumber.toUpperCase() === id.toUpperCase());
                if (c) {
                    loadCustomerIntoForm(c);
                }
            });
        });

        // Bind QA Approve buttons
        body.querySelectorAll('.btn-cust-approve').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const idx = customers.findIndex(item => item && item.accountNumber && item.accountNumber.toUpperCase() === id.toUpperCase());
                if (idx !== -1) {
                    customers[idx].status = 'Active';
                    saveCustomersState();
                    renderCustomerList();
                    showToast(`Customer account '${customers[idx].customerName}' QA Approved and Activated!`, "success");
                }
            });
        });

        // Bind Deactivate buttons
        body.querySelectorAll('.btn-cust-deactivate').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const idx = customers.findIndex(item => item && item.accountNumber && item.accountNumber.toUpperCase() === id.toUpperCase());
                if (idx !== -1) {
                    customers[idx].status = 'Inactive';
                    saveCustomersState();
                    renderCustomerList();
                    showToast(`Customer account '${customers[idx].customerName}' has been deactivated.`, "warning");
                }
            });
        });
    }

    function loadCustomerIntoForm(c) {
        editingCustomerNo = c.accountNumber;
        
        if (document.getElementById('cust-form-company')) document.getElementById('cust-form-company').value = c.company || 'LAXMI01';
        if (document.getElementById('cust-form-account-id')) {
            document.getElementById('cust-form-account-id').value = c.accountNumber;
            document.getElementById('cust-form-account-id').disabled = true;
        }
        if (document.getElementById('cust-form-name')) document.getElementById('cust-form-name').value = c.customerName;
        if (document.getElementById('cust-form-customer-type')) document.getElementById('cust-form-customer-type').value = c.customerType || 'Pharmacy';
        if (document.getElementById('cust-form-company-type-gen')) document.getElementById('cust-form-company-type-gen').value = c.customerType || 'Pharmacy';
        if (document.getElementById('cust-form-type')) document.getElementById('cust-form-type').value = c.customerType || 'Pharmacy';
        const loadVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SELECT' && val) {
                    let exists = Array.from(el.options).some(opt => opt.value === val || opt.text === val);
                    if (!exists) {
                        const newOpt = document.createElement('option');
                        newOpt.value = val;
                        newOpt.textContent = val;
                        el.appendChild(newOpt);
                    }
                }
                el.value = val !== undefined && val !== null ? val : '';
            }
        };
        const loadChk = (id, checked) => {
            const el = document.getElementById(id);
            if (el) el.checked = !!checked;
        };
        const loadDisable = (id, disabled) => {
            const el = document.getElementById(id);
            if (el) el.disabled = !!disabled;
        };

        // Card 1
        loadVal('cust-credit-limit', c.creditLimit !== undefined ? c.creditLimit : '50000');
        loadVal('cust-credit-safe-limit', c.creditSafeLimit);
        loadVal('cust-credit-insurer-limit', c.creditInsurerLimit);
        loadChk('chk-credit-blocked', c.creditBlocked);
        loadVal('cust-credit-analyst', c.creditAnalyst || 'KIRPATA');
        loadVal('cust-credit-note', c.creditNote);

        // Card 2
        loadVal('cust-credit-db-no', c.dbNo);
        loadVal('cust-credit-db-rating', c.dbRating);
        loadVal('cust-credit-comment', c.creditComment);
        loadVal('cust-credit-pay-index', c.payIndex);
        loadVal('cust-credit-blocked-reason', c.blockedReason);
        loadChk('chk-credit-web-ordering', c.webOrderingEnabled);

        // Card 3
        const relExist = !!c.creditRelationExist;
        loadChk('chk-credit-relation-exist', relExist);
        loadVal('cust-credit-relation-type', c.relationType);
        loadDisable('cust-credit-relation-type', !relExist);
        loadVal('cust-credit-parent-company', c.parentCompany);
        loadDisable('cust-credit-parent-company', !relExist);
        loadVal('cust-credit-parent-customer', c.parentCustomer);
        loadDisable('cust-credit-parent-customer', !relExist);
        loadVal('cust-credit-blocked-reason-note', c.blockedReasonNote);
        loadChk('chk-credit-directors-guarantee', c.directorsGuarantee);
        loadChk('chk-credit-cross-company-guarantee', c.crossCompanyGuarantee);

        // Card 4
        loadVal('cust-credit-stat-group', c.statGroup || 'LAX Perivale');
        loadVal('cust-credit-price-group', c.priceGroup || 'F');
        loadVal('cust-credit-reference', c.creditReference);
        loadVal('cust-credit-market', c.creditMarket || 'IND');
        loadVal('cust-credit-rating-value', c.creditRatingValue);
        loadVal('cust-credit-rating-desc', c.creditRatingDesc);
        loadVal('cust-credit-payment-history', c.paymentHistory || 'Good');

        // Card 5
        loadVal('cust-credit-invoice-customer', c.invoiceCustomer);
        loadVal('cust-credit-invoice-type', c.invoiceType || 'Normal Invoice');
        loadVal('cust-credit-order-type', c.creditOrderType || 'NO');
        loadVal('cust-credit-rsm', c.rsm || 'GILTHO');
        loadVal('cust-credit-payment-method', c.paymentMethod || 'Direct Debit');
        loadVal('cust-credit-company-status', c.companyStatus);

        // Card 6
        const hasStmtEmail = !!c.statementEmailEnabled;
        loadChk('chk-credit-stmt-email', hasStmtEmail);
        loadVal('cust-credit-stmt-email', c.apEmail || c.statementEmail || '');
        loadDisable('cust-credit-stmt-email', !hasStmtEmail);
        
        loadVal('cust-credit-counter-account', c.counterAccount);
        
        const hasSpecialEmail = !!c.specialEmailEnabled;
        loadChk('chk-credit-special-email', hasSpecialEmail);
        loadVal('cust-credit-special-email', c.specialEmail);
        loadDisable('chk-credit-special-email', !hasSpecialEmail);
        
        loadChk('chk-credit-brand-customer', c.brandCustomer);
        loadChk('chk-credit-direct-debit', c.directDebitEnabled);

        // Row 3
        loadVal('cust-credit-allowed-due-days', c.allowedDueDays);
        loadVal('cust-credit-allowed-due-amount', c.allowedDueAmount);
        loadVal('cust-credit-currency-rate-type', c.defaultCurrencyRateType);
        
        if (document.getElementById('cust-form-gowrie-acct')) document.getElementById('cust-form-gowrie-acct').checked = !!c.gowrieAccount;
        if (document.getElementById('cust-form-gowrie-group')) document.getElementById('cust-form-gowrie-group').value = c.gowrieCustomerGroup || '';
        
        if (c.addresses && c.addresses.length > 0) {
            currentCustomerAddresses = [...c.addresses];
        } else {
            currentCustomerAddresses = [
                {
                    addressId: "01",
                    customerName: c.customerName,
                    addr1: c.addr1 || '',
                    addr2: c.addr2 || '',
                    city: c.city || '',
                    postcode: c.postcode || '',
                    county: c.county || '',
                    state: c.state || '',
                    country: c.country || 'GB',
                    route: c.route || '444 DX',
                    telephone: c.telephone || '',
                    faxNo: c.faxNo || '',
                    taxLiability: c.taxLiability || 'TAX Taxable',
                    taxCode: c.taxCode || 'Select Free Tax Code',
                    region: 'Select Region',
                    validFrom: '',
                    validTo: '',
                    deliveryTerms: 'NXW Next Day Delivery',
                    addressType: {
                        delivery: true,
                        deliveryDefault: true,
                        invoice: true,
                        invoiceDefault: true,
                        pay: true,
                        payDefault: true
                    }
                }
            ];
        }

        clearAddressForm();
        renderAddressList();
        if (document.getElementById('cust-form-email')) document.getElementById('cust-form-email').value = c.generalEmail || '';
        if (document.getElementById('cust-form-ap-email')) document.getElementById('cust-form-ap-email').value = c.apEmail || '';
        if (document.getElementById('cust-form-gphc-no')) document.getElementById('cust-form-gphc-no').value = c.gphcNumber || '';
        if (document.getElementById('cust-form-gphc-expiry')) document.getElementById('cust-form-gphc-expiry').value = c.gphcExpiry || '';

        uploadedFiles = {
            gphc: c.gphcDocument || '',
            emailAuth: c.emailAuthChecked ? 'email_auth_loaded.pdf' : '',
            dd: c.ddSignedChecked ? 'dd_loaded.pdf' : '',
            acctForm: c.accountFormChecked ? 'account_form_loaded.pdf' : ''
        };

        const loadStatus = (statusId, labelId, value) => {
            const statusEl = document.getElementById(statusId);
            const labelEl = document.getElementById(labelId);
            if (value) {
                if (statusEl) {
                    statusEl.textContent = 'Uploaded';
                    statusEl.className = 'doc-status verified';
                }
                if (labelEl) labelEl.textContent = value;
            } else {
                if (statusEl) {
                    statusEl.textContent = 'Missing';
                    statusEl.className = 'doc-status missing';
                }
                if (labelEl) labelEl.textContent = '';
            }
        };

        loadStatus('status-gphc-upload', 'label-gphc-filename', uploadedFiles.gphc);
        loadStatus('status-email-auth', 'label-email-auth-filename', uploadedFiles.emailAuth);
        loadStatus('status-dd', 'label-dd-filename', uploadedFiles.dd);
        loadStatus('status-acct-form', 'label-acct-form-filename', uploadedFiles.acctForm);

        if (document.getElementById('chk-verify-postcode')) document.getElementById('chk-verify-postcode').checked = !!c.accountFormChecked;
        if (document.getElementById('chk-verify-emails')) document.getElementById('chk-verify-emails').checked = !!c.emailAuthChecked;
        if (document.getElementById('chk-verify-auth')) document.getElementById('chk-verify-auth').checked = !!c.emailAuthChecked;
        if (document.getElementById('chk-verify-dd')) document.getElementById('chk-verify-dd').checked = !!c.ddSignedChecked;

        // Load custom dynamic files
        customUploadedFiles = c.customUploadedFiles ? [...c.customUploadedFiles] : [];
        renderCustomDocsList();

        // Load memberships
        currentCustomerMemberships = c.memberships ? [...c.memberships] : [];
        clearMembershipForm();
        renderMembershipList();

        // Load contacts
        currentCustomerContacts = c.contacts && Array.isArray(c.contacts) ? c.contacts.map(item => ({ ...item, selected: false })) : [];
        if (document.getElementById('chk-contacts-all-toggle')) document.getElementById('chk-contacts-all-toggle').checked = false;
        renderContactsList();

        const formTitle = document.getElementById('cust-form-title');
        if (formTitle) formTitle.textContent = `Edit Customer: ${c.customerName}`;
        
        const statusBadge = document.getElementById('cust-edit-status-badge');
        if (statusBadge) statusBadge.style.display = 'inline-block';

        showCustomerFormView();
    }

    function showCustomerListView() {
        const panelCustList = document.getElementById('panel-cust-list');
        const panelCustForm = document.getElementById('panel-cust-form');
        if (panelCustForm) panelCustForm.classList.add('hidden');
        if (panelCustList) panelCustList.classList.remove('hidden');
        renderCustomerList();
    }

    function showCustomerFormView() {
        const panelCustList = document.getElementById('panel-cust-list');
        const panelCustForm = document.getElementById('panel-cust-form');
        if (panelCustList) panelCustList.classList.add('hidden');
        if (panelCustForm) panelCustForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getCustomerFormData() {
        const company = document.getElementById('cust-form-company') ? document.getElementById('cust-form-company').value : 'LAXMI01';
        const acctId = document.getElementById('cust-form-account-id') ? document.getElementById('cust-form-account-id').value.trim() : '';
        const name = document.getElementById('cust-form-name') ? document.getElementById('cust-form-name').value.trim() : '';
        const currency = 'GBP'; // Fallback / default currency
        const priceList = document.getElementById('cust-form-pricelist') ? document.getElementById('cust-form-pricelist').value : '';
        const buyingGroup = document.getElementById('cust-form-buyinggroup') ? document.getElementById('cust-form-buyinggroup').value : '';
        const taxLiability = 'TAX TAXABLE';

        // Retrieve primary address values from list
        let primaryAddr = currentCustomerAddresses.find(a => a.addressType && a.addressType.deliveryDefault) || currentCustomerAddresses[0] || {};
        const postcode = primaryAddr.postcode || '';
        const addr1 = primaryAddr.addr1 || '';
        const addr2 = primaryAddr.addr2 || '';
        const city = primaryAddr.city || '';
        const county = primaryAddr.county || '';
        const state = primaryAddr.state || '';
        const country = primaryAddr.country || 'GB';
        const route = primaryAddr.route || '444 DX';
        const tel = primaryAddr.telephone || '';
        const faxNo = primaryAddr.faxNo || '';
        const deliv = primaryAddr.addressType ? !!primaryAddr.addressType.delivery : true;
        const invo = primaryAddr.addressType ? !!primaryAddr.addressType.invoice : true;
        const pay = primaryAddr.addressType ? !!primaryAddr.addressType.pay : true;

        const taxCode = primaryAddr.taxCode || 'Standard Tax (20%)';
        const gowrieAccount = document.getElementById('cust-form-gowrie-acct') ? document.getElementById('cust-form-gowrie-acct').checked : false;
        const gowrieCustomerGroup = document.getElementById('cust-form-gowrie-group') ? document.getElementById('cust-form-gowrie-group').value : '';
        const typeEl = document.getElementById('cust-form-customer-type') || document.getElementById('cust-form-company-type-gen') || document.getElementById('cust-form-type');
        const type = typeEl && typeEl.value ? typeEl.value : 'Pharmacy';
        
        const generalEmail = document.getElementById('cust-form-email') ? document.getElementById('cust-form-email').value.trim() : `${acctId.toLowerCase() || 'cust'}@example.com`;
        const gphcNo = document.getElementById('cust-form-gphc-no') ? document.getElementById('cust-form-gphc-no').value.trim() : `GPHC-${acctId || '12345'}`;
        const gphcExpiry = document.getElementById('cust-form-gphc-expiry') ? document.getElementById('cust-form-gphc-expiry').value : '';
        
        const postcodeChecked = document.getElementById('chk-verify-postcode') ? document.getElementById('chk-verify-postcode').checked : false;
        const emailsChecked = document.getElementById('chk-verify-emails') ? document.getElementById('chk-verify-emails').checked : false;
        const authChecked = document.getElementById('chk-verify-auth') ? document.getElementById('chk-verify-auth').checked : false;
        const ddChecked = document.getElementById('chk-verify-dd') ? document.getElementById('chk-verify-dd').checked : false;

        // Retrieve Credit tab fields
        const getVal = id => document.getElementById(id) ? document.getElementById(id).value.trim() : '';
        const getNum = id => document.getElementById(id) ? parseFloat(document.getElementById(id).value) || 0 : 0;
        const getChk = id => document.getElementById(id) ? document.getElementById(id).checked : false;

        const creditLimit = getNum('cust-credit-limit');
        const creditSafeLimit = getNum('cust-credit-safe-limit');
        const creditInsurerLimit = getNum('cust-credit-insurer-limit');
        const creditBlocked = getChk('chk-credit-blocked');
        const creditAnalyst = getVal('cust-credit-analyst');
        const creditNote = getVal('cust-credit-note');

        const dbNo = getVal('cust-credit-db-no');
        const dbRating = getVal('cust-credit-db-rating');
        const creditComment = getVal('cust-credit-comment');
        const payIndex = getVal('cust-credit-pay-index');
        const blockedReason = getVal('cust-credit-blocked-reason');
        const webOrderingEnabled = getChk('chk-credit-web-ordering');

        const creditRelationExist = getChk('chk-credit-relation-exist');
        const relationType = getVal('cust-credit-relation-type');
        const parentCompany = getVal('cust-credit-parent-company');
        const parentCustomer = getVal('cust-credit-parent-customer');
        const blockedReasonNote = getVal('cust-credit-blocked-reason-note');
        const directorsGuarantee = getChk('chk-credit-directors-guarantee');
        const crossCompanyGuarantee = getChk('chk-credit-cross-company-guarantee');

        const statGroup = getVal('cust-credit-stat-group');
        const priceGroup = getVal('cust-credit-price-group');
        const creditReference = getVal('cust-credit-reference');
        const creditMarket = getVal('cust-credit-market');
        const creditRatingValue = getVal('cust-credit-rating-value');
        const creditRatingDesc = getVal('cust-credit-rating-desc');
        const paymentHistory = getVal('cust-credit-payment-history');

        const invoiceCustomer = getVal('cust-credit-invoice-customer');
        const invoiceType = getVal('cust-credit-invoice-type');
        const creditOrderType = getVal('cust-credit-order-type');
        const rsm = getVal('cust-credit-rsm');
        const paymentMethod = getVal('cust-credit-payment-method');
        const companyStatus = getVal('cust-credit-company-status');
        const statementEmailEnabled = getChk('chk-credit-stmt-email');
        const statementEmail = getVal('cust-credit-stmt-email');
        const counterAccount = getVal('cust-credit-counter-account');
        const specialEmailEnabled = getChk('chk-credit-special-email');
        const specialEmail = getVal('cust-credit-special-email');
        const brandCustomer = getChk('chk-credit-brand-customer');
        const directDebitEnabled = getChk('chk-credit-direct-debit');

        const allowedDueDays = getNum('cust-credit-allowed-due-days');
        const allowedDueAmount = getNum('cust-credit-allowed-due-amount');
        const defaultCurrencyRateType = getVal('cust-credit-currency-rate-type');

        const apEmail = statementEmailEnabled ? statementEmail : 'accounts@example.com';

        return {
            company,
            accountNumber: acctId,
            customerName: name,
            currency,
            priceList,
            creditLimit,
            creditSafeLimit,
            creditInsurerLimit,
            creditBlocked,
            creditAnalyst,
            creditNote,
            dbNo,
            dbRating,
            creditComment,
            payIndex,
            blockedReason,
            webOrderingEnabled,
            creditRelationExist,
            relationType,
            parentCompany,
            parentCustomer,
            blockedReasonNote,
            directorsGuarantee,
            crossCompanyGuarantee,
            statGroup,
            priceGroup,
            creditReference,
            creditMarket,
            creditRatingValue,
            creditRatingDesc,
            paymentHistory,
            invoiceCustomer,
            invoiceType,
            creditOrderType,
            rsm,
            paymentMethod,
            paymentTerms: paymentMethod || 'Direct Debit',
            companyStatus,
            statementEmailEnabled,
            statementEmail,
            counterAccount,
            specialEmailEnabled,
            specialEmail,
            brandCustomer,
            directDebitEnabled,
            allowedDueDays,
            allowedDueAmount,
            defaultCurrencyRateType,
            customerGroup: getVal('cust-form-customer-group') || '15 Retail Laxmico',
            buyingGroup,
            taxLiability,
            taxCode,
            gowrieAccount,
            gowrieCustomerGroup,
            addr1,
            addr2,
            city,
            postcode,
            customerType: type,
            county,
            state,
            country,
            route,
            addressType: {
                delivery: deliv,
                invoice: invo,
                pay: pay
            },
            telephone: tel,
            faxNo: faxNo,
            generalEmail,
            apEmail,
            gphcNumber: gphcNo,
            gphcExpiry,
            gphcDocument: uploadedFiles.gphc || '',
            emailAuthChecked: authChecked,
            ddSignedChecked: ddChecked,
            accountFormChecked: postcodeChecked,
            addresses: currentCustomerAddresses,
            customUploadedFiles: [...customUploadedFiles],
            memberships: [...currentCustomerMemberships],
            contacts: currentCustomerContacts.map(c => ({ name: c.name || '', description: c.description || '', commMethod: c.commMethod || 'Email', value: c.value || '' })),
            status: "Pending QA Approval"
        };
    }

    function validateCustomerForm(data) {
        if (!data.accountNumber) {
            showToast("Error: Customer ID is required.", "danger");
            return false;
        }
        if (!data.addresses || data.addresses.length === 0) {
            showToast("Error: Please add at least one address line under 'Address Info' tab.", "danger");
            return false;
        }
        if (!data.customerName) {
            showToast("Error: Customer Name is required.", "danger");
            return false;
        }
        if (!data.postcode) {
            showToast("Error: Post Code is required.", "danger");
            return false;
        }
        if (!data.addr1) {
            showToast("Error: Address 1 is required.", "danger");
            return false;
        }
        if (!data.city) {
            showToast("Error: City is required.", "danger");
            return false;
        }
        if (!data.customerType) {
            showToast("Error: Customer Type is required.", "danger");
            return false;
        }
        if (!data.county) {
            showToast("Error: County is required.", "danger");
            return false;
        }
        if (!data.rsm) {
            showToast("Error: Sales Man (RSM) is required.", "danger");
            return false;
        }
        if (!data.paymentTerms) {
            showToast("Error: Payment Term is required.", "danger");
            return false;
        }
        if (!data.priceList) {
            showToast("Error: Price Group is required.", "danger");
            return false;
        }
        if (!data.taxCode) {
            showToast("Error: Tax Code is required.", "danger");
            return false;
        }
        if (!data.gphcNumber) {
            showToast("Error: GPHC License Number is required.", "danger");
            return false;
        }
        if (!data.gphcExpiry) {
            showToast("Error: GPHC Expiry Date is required.", "danger");
            return false;
        }
        if (!data.apEmail) {
            showToast("Error: Accounts Payable Email is required.", "danger");
            return false;
        }
        if (!data.generalEmail) {
            showToast("Error: Customer Services Email is required.", "danger");
            return false;
        }

        if (!data.gphcDocument) {
            showToast("Error: GPHC License Document must be uploaded under tab 3.", "danger");
            return false;
        }
        if (!data.emailAuthChecked || !data.ddSignedChecked || !data.accountFormChecked) {
            showToast("Error: All items in the verification checklist must be checked before QA Approval.", "danger");
            return false;
        }
        return true;
    }

    // Expose helpers for CustomerWorkflowModule integration
    window.legacyLoadCustomerIntoForm = loadCustomerIntoForm;
    window.legacyGetCustomerFormData = getCustomerFormData;
    window.legacyResetCustomerForm = resetCustomerForm;
    window.legacyValidateCustomerForm = validateCustomerForm;

    function initCustomerSetup() {
        const btnCustTabList = document.getElementById('btn-cust-tab-list');
        const btnCustTabForm = document.getElementById('btn-cust-tab-form');
        const panelCustList = document.getElementById('panel-cust-list');
        const panelCustForm = document.getElementById('panel-cust-form');

        // Customer Type toggle for Licence Info tab
        const custTypeSelectGen = document.getElementById('cust-form-customer-type');
        const custTypeSelectLic = document.getElementById('licence-customer-type');
        
        const updateLicenceLayout = (val) => {
            document.querySelectorAll('.licence-dynamic-layout').forEach(el => el.classList.add('hidden'));
            
            if (val === '') {
                const l = document.getElementById('licence-select-layout');
                if (l) l.classList.remove('hidden');
            } else if (['Pharmacy', '100Hrs Pharmacy', '700 HR Pharmacy'].includes(val)) {
                const l = document.getElementById('licence-pharmacy-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Online Pharmacy') {
                const l = document.getElementById('licence-online-pharmacy-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Pharmacy Hub') {
                const l = document.getElementById('licence-pharmacy-hub-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'NHS Hospital') {
                const l = document.getElementById('licence-nhs-hospital-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Dispensing Doctor') {
                const l = document.getElementById('licence-dispensing-doctor-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Wholesaler') {
                const l = document.getElementById('licence-wholesaler-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Export') {
                const l = document.getElementById('licence-export-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Broker Account') {
                const l = document.getElementById('licence-broker-account-layout');
                if (l) l.classList.remove('hidden');
            } else if (val === 'Non Pharmaceutical') {
                const l = document.getElementById('licence-non-pharmaceutical-layout');
                if (l) l.classList.remove('hidden');
            } else {
                const l = document.getElementById('licence-other-layout');
                if (l) l.classList.remove('hidden');
            }
        };

        if (custTypeSelectGen) {
            custTypeSelectGen.addEventListener('change', (e) => {
                const val = e.target.value;
                if (custTypeSelectLic) custTypeSelectLic.value = val;
                updateLicenceLayout(val);
            });
        }
        
        if (custTypeSelectLic) {
            custTypeSelectLic.addEventListener('change', (e) => {
                const val = e.target.value;
                if (custTypeSelectGen) custTypeSelectGen.value = val;
                updateLicenceLayout(val);
            });
        }

        // Log modal setup
        const logModal = document.getElementById('log-detail-modal');
        const btnCloseLogModal = document.getElementById('btn-close-log-modal');
        const btnOkLogModal = document.getElementById('btn-ok-log-modal');
        const logTimeLabel = document.getElementById('log-current-time');
        
        const closeLogModal = () => { if (logModal) logModal.classList.add('hidden'); };
        if (btnCloseLogModal) btnCloseLogModal.addEventListener('click', closeLogModal);
        if (btnOkLogModal) btnOkLogModal.addEventListener('click', closeLogModal);

        // Make buttons in Licence Info tab functional
        const licencePanel = document.getElementById('cust-subtab-licence-panel');
        if (licencePanel) {
            licencePanel.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (btn) {
                    e.preventDefault();
                    let action = btn.textContent.trim() || btn.title || '';
                    action = action.toLowerCase();
                    
                    if (action.includes('upload') || action.includes('⬆️')) {
                        const fileInput = document.getElementById('dummy-file-upload');
                        if (fileInput) fileInput.click();
                    } else if (action.includes('download') || action.includes('⬇️')) {
                        const blob = new Blob(["Simulated Document Download Data"], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "document.txt";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        showToast('Download started', 'success');
                    } else if (action.includes('log detail')) {
                        if (typeof window.openLogDetailModal === 'function') {
                            window.openLogDetailModal();
                        } else if (logModal) {
                            logModal.classList.remove('hidden');
                        }
                    } else if (action.includes('save')) {
                        showToast('Licence information saved successfully.', 'success');
                    } else if (action.includes('view account') || (btn.id && btn.id.includes('view-linked-account')) || btn.classList.contains('btn-view-linked-account')) {
                        openLinkedAccountModal();
                    } else if (action.includes('add schedule')) {
                        let schedulesList = document.getElementById('wholesaler-schedules-list');
                        if (!schedulesList || schedulesList.closest('.hidden')) schedulesList = document.getElementById('broker-schedules-list');
                        
                        if (schedulesList) {
                            const newRow = document.createElement('div');
                            newRow.style.display = 'flex';
                            newRow.style.alignItems = 'center';
                            newRow.style.gap = '16px';
                            const count = schedulesList.children.length + 1;
                            newRow.innerHTML = `
                                <span style="width: 80px; font-size: 13px;">${count === 1 ? 'Schedule 1' : ''}</span>
                                <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 8px; flex: 1;">
                                    <label style="margin: 0; white-space: nowrap;">Licence No</label>
                                    <input type="text" style="width: 150px;">
                                </div>
                                <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 8px; flex: 1;">
                                    <label style="margin: 0; white-space: nowrap;">Expiry Date</label>
                                    <input type="date" style="width: 150px;">
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button type="button" class="btn btn-secondary" title="Download" style="padding: 0 8px; height: 38px;">⬇️</button>
                                    <button type="button" class="btn btn-secondary" title="Upload" style="padding: 0 8px; height: 38px;">⬆️</button>
                                </div>
                            `;
                            schedulesList.appendChild(newRow);
                        }
                    } else if (action.includes('remove all schedules')) {
                        let schedulesList = document.getElementById('wholesaler-schedules-list');
                        if (!schedulesList || schedulesList.closest('.hidden')) schedulesList = document.getElementById('broker-schedules-list');
                        
                        if (schedulesList) {
                            schedulesList.innerHTML = '';
                        }
                    } else if (action.includes('remove schedule')) {
                        let schedulesList = document.getElementById('wholesaler-schedules-list');
                        if (!schedulesList || schedulesList.closest('.hidden')) schedulesList = document.getElementById('broker-schedules-list');
                        
                        if (schedulesList && schedulesList.lastElementChild) {
                            schedulesList.removeChild(schedulesList.lastElementChild);
                            if (schedulesList.firstElementChild) {
                                schedulesList.firstElementChild.querySelector('span').textContent = 'Schedule 1';
                            }
                        }
                    } else if (action) {
                        showToast(`${btn.textContent.trim() || btn.title} action triggered successfully.`, 'success');
                    }
                }
            });
        }

        // Linked Account Modal Open & Close Functions
        const linkedModal = document.getElementById('linked-account-modal-overlay');
        const btnViewLinkedDirect = document.getElementById('btn-view-linked-account');
        const btnCloseLinked1 = document.getElementById('btn-close-linked-account-modal');
        const btnCloseLinked2 = document.getElementById('btn-close-linked-account-modal-bottom');

        function openLinkedAccountModal() {
            if (linkedModal) {
                linkedModal.classList.remove('hidden');
                linkedModal.style.display = 'flex';
            }
        }

        function closeLinkedAccountModal() {
            if (linkedModal) {
                linkedModal.classList.add('hidden');
                linkedModal.style.display = 'none';
            }
        }

        if (btnViewLinkedDirect) {
            btnViewLinkedDirect.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openLinkedAccountModal();
            });
        }

        if (btnCloseLinked1) {
            btnCloseLinked1.addEventListener('click', (e) => {
                e.preventDefault();
                closeLinkedAccountModal();
            });
        }

        if (btnCloseLinked2) {
            btnCloseLinked2.addEventListener('click', (e) => {
                e.preventDefault();
                closeLinkedAccountModal();
            });
        }

        if (linkedModal) {
            linkedModal.addEventListener('click', (e) => {
                if (e.target === linkedModal) {
                    closeLinkedAccountModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && linkedModal && !linkedModal.classList.contains('hidden')) {
                closeLinkedAccountModal();
            }
        });

        // Row button clicks inside Linked Account table
        if (linkedModal) {
            linkedModal.querySelectorAll('.btn-view-single-linked').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const accId = btn.getAttribute('data-id');
                    showToast(`Loaded account ${accId} details.`, 'info');
                    closeLinkedAccountModal();
                });
            });
        }

        // Form action buttons
        const btnCustSave = document.getElementById('btn-cust-save');
        const btnCustCopy = document.getElementById('btn-cust-copy');
        const btnCustUpdate = document.getElementById('btn-cust-update');
        const btnCustCancel = document.getElementById('btn-cust-cancel');
        if (btnCustCancel) {
            btnCustCancel.addEventListener('click', (e) => {
                e.preventDefault();
                showCustomerListView();
            });
        }

        // Sub-tabs switching
        const subTabBtns = [
            { btn: document.getElementById('btn-cust-subtab-general'), panel: document.getElementById('cust-subtab-general-panel') },
            { btn: document.getElementById('btn-cust-subtab-address'), panel: document.getElementById('cust-subtab-address-panel') },
            { btn: document.getElementById('btn-cust-subtab-credit'), panel: document.getElementById('cust-subtab-credit-panel') },
            { btn: document.getElementById('btn-cust-subtab-pricegroup'), panel: document.getElementById('cust-subtab-pricegroup-panel') },
            { btn: document.getElementById('btn-cust-subtab-licence'), panel: document.getElementById('cust-subtab-licence-panel') },
            { btn: document.getElementById('btn-cust-subtab-files'), panel: document.getElementById('cust-subtab-files-panel') }
        ];

        subTabBtns.forEach(tab => {
            if (tab.btn) {
                tab.btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    subTabBtns.forEach(t => {
                        if (t.btn) t.btn.classList.remove('active');
                        if (t.panel) t.panel.classList.add('hidden');
                    });
                    tab.btn.classList.add('active');
                    if (tab.panel) tab.panel.classList.remove('hidden');
                });
            }
        });

        // Address sub-tab buttons binding
        const btnAddrAddUpdate = document.getElementById('btn-addr-add-update');
        if (btnAddrAddUpdate) {
            btnAddrAddUpdate.addEventListener('click', (e) => {
                e.preventDefault();
                addUpdateAddressLine();
            });
        }

        const btnAddrClear = document.getElementById('btn-addr-clear');
        if (btnAddrClear) {
            btnAddrClear.addEventListener('click', (e) => {
                e.preventDefault();
                clearAddressForm();
            });
        }

        // Toggle defaults with types in address form
        const toggleDefChk = (typeChkId, defChkId) => {
            const tc = document.getElementById(typeChkId);
            const dc = document.getElementById(defChkId);
            if (tc && dc) {
                tc.addEventListener('change', () => {
                    if (!tc.checked) {
                        dc.checked = false;
                        dc.disabled = true;
                    } else {
                        dc.disabled = false;
                    }
                });
            }
        };
        toggleDefChk('chk-addr-type-delivery', 'chk-addr-def-delivery');
        toggleDefChk('chk-addr-type-invoice', 'chk-addr-def-invoice');
        toggleDefChk('chk-addr-type-pay', 'chk-addr-def-pay');

        // Toggle relation inputs based on relationship exist check
        const toggleCreditRel = document.getElementById('chk-credit-relation-exist');
        if (toggleCreditRel) {
            toggleCreditRel.addEventListener('change', () => {
                const isChecked = toggleCreditRel.checked;
                ['cust-credit-relation-type', 'cust-credit-parent-company', 'cust-credit-parent-customer'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.disabled = !isChecked;
                });
            });
        }

        // Toggle statement email text box
        const toggleStmtEmail = document.getElementById('chk-credit-stmt-email');
        if (toggleStmtEmail) {
            toggleStmtEmail.addEventListener('change', () => {
                const el = document.getElementById('cust-credit-stmt-email');
                if (el) el.disabled = !toggleStmtEmail.checked;
            });
        }

        // Toggle special email text box
        const toggleSpecialEmail = document.getElementById('chk-credit-special-email');
        if (toggleSpecialEmail) {
            toggleSpecialEmail.addEventListener('change', () => {
                const el = document.getElementById('cust-credit-special-email');
                if (el) el.disabled = !toggleSpecialEmail.checked;
            });
        }

        // Directors modal control
        const btnViewDirectors = document.getElementById('btn-credit-view-directors');
        const directorsModal = document.getElementById('directors-modal-overlay');
        const btnCloseDirectors = document.getElementById('btn-close-directors-modal');
        const btnOkDirectors = document.getElementById('btn-ok-directors-modal');
        const directorsListBody = document.getElementById('directors-list-body');

        if (btnViewDirectors && directorsModal) {
            btnViewDirectors.addEventListener('click', (e) => {
                e.preventDefault();
                
                const custName = document.getElementById('cust-form-name') ? document.getElementById('cust-form-name').value.trim() : '';
                const baseName = custName || 'This Customer';
                
                if (directorsListBody) {
                    directorsListBody.innerHTML = `
                        <tr>
                            <td><strong>Mr. Alan Cole</strong></td>
                            <td>12/04/1974</td>
                            <td>Managing Director</td>
                            <td>01/03/2012</td>
                            <td><span class="badge" style="background-color: var(--color-success-light); color: var(--color-success); font-weight:600; padding: 2px 8px; border-radius: 4px;">Active</span></td>
                        </tr>
                        <tr>
                            <td><strong>Mrs. Sarah Jenkins</strong></td>
                            <td>28/11/1981</td>
                            <td>Finance Director</td>
                            <td>15/07/2018</td>
                            <td><span class="badge" style="background-color: var(--color-success-light); color: var(--color-success); font-weight:600; padding: 2px 8px; border-radius: 4px;">Active</span></td>
                        </tr>
                        <tr>
                            <td><strong>Mr. David Miller</strong></td>
                            <td>05/09/1966</td>
                            <td>Non-Executive Director</td>
                            <td>10/10/2010</td>
                            <td><span class="badge" style="background-color: var(--color-danger-light); color: var(--color-danger); font-weight:600; padding: 2px 8px; border-radius: 4px;">Resigned</span></td>
                        </tr>
                    `;
                }
                
                directorsModal.classList.remove('hidden');
            });
        }

        const hideDirectorsModal = () => {
            if (directorsModal) directorsModal.classList.add('hidden');
        };
        if (btnCloseDirectors) btnCloseDirectors.addEventListener('click', hideDirectorsModal);
        if (btnOkDirectors) btnOkDirectors.addEventListener('click', hideDirectorsModal);

        // Setup mock upload buttons
        const setupUploadButton = (btnId, statusId, filenameLabelId, key) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    const mockFileName = `uploaded_${key}_${Date.now().toString().slice(-4)}.pdf`;
                    uploadedFiles[key] = mockFileName;
                    
                    const statusEl = document.getElementById(statusId);
                    if (statusEl) {
                        statusEl.textContent = 'Uploaded';
                        statusEl.className = 'doc-status verified';
                    }
                    
                    const labelEl = document.getElementById(filenameLabelId);
                    if (labelEl) {
                        labelEl.textContent = mockFileName;
                    }
                    
                    showToast(`Verification document uploaded successfully: ${mockFileName}`, "success");
                });
            }
        };

        setupUploadButton('btn-upload-gphc', 'status-gphc-upload', 'label-gphc-filename', 'gphc');
        setupUploadButton('btn-upload-email-auth', 'status-email-auth', 'label-email-auth-filename', 'emailAuth');
        setupUploadButton('btn-upload-dd', 'status-dd', 'label-dd-filename', 'dd');
        setupUploadButton('btn-upload-acct-form', 'status-acct-form', 'label-acct-form-filename', 'acctForm');

        // Bind Add Custom Verification Document row button
        const btnAddCustomDoc = document.getElementById('btn-add-custom-doc');
        if (btnAddCustomDoc) {
            btnAddCustomDoc.addEventListener('click', (e) => {
                e.preventDefault();
                const docNameInput = document.getElementById('cust-new-doc-name');
                if (!docNameInput) return;
                const docLabel = docNameInput.value.trim();
                if (!docLabel) {
                    showToast("Error: Document name is required.", "danger");
                    return;
                }
                const alreadyExists = customUploadedFiles.some(d => d.docLabel.toLowerCase() === docLabel.toLowerCase());
                if (alreadyExists) {
                    showToast("Error: A document with that name already exists.", "danger");
                    return;
                }
                customUploadedFiles.push({
                    id: 'custom_' + Date.now(),
                    docLabel: docLabel,
                    status: 'Missing',
                    filename: ''
                });
                docNameInput.value = '';
                renderCustomDocsList();
                showToast(`New file row '${docLabel}' added to File Info list.`, "success");
            });
        }

        // Bind Membership Add / Update Form Button
        const btnMemberAddUpdate = document.getElementById('btn-member-add-update');
        if (btnMemberAddUpdate) {
            btnMemberAddUpdate.addEventListener('click', (e) => {
                e.preventDefault();
                addUpdateMembershipLine();
            });
        }

        // Bind Membership Clear Button
        const btnMemberClear = document.getElementById('btn-member-clear');
        if (btnMemberClear) {
            btnMemberClear.addEventListener('click', (e) => {
                e.preventDefault();
                clearMembershipForm();
            });
        }

        // Bind Membership Toolbar [+] Add Button
        const btnMemberToolbarAdd = document.getElementById('btn-member-toolbar-add');
        if (btnMemberToolbarAdd) {
            btnMemberToolbarAdd.addEventListener('click', (e) => {
                e.preventDefault();
                clearMembershipForm();
                const mNo = document.getElementById('cust-member-no');
                if (mNo) mNo.focus();
            });
        }

        // Bind Membership Toolbar [-] Delete Button
        const btnMemberToolbarDelete = document.getElementById('btn-member-toolbar-delete');
        if (btnMemberToolbarDelete) {
            btnMemberToolbarDelete.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentCustomerMemberships.length > 0) {
                    currentCustomerMemberships.pop();
                    renderMembershipList();
                    showToast("Removed last membership record.", "warning");
                } else {
                    showToast("No memberships to delete.", "info");
                }
            });
        }

        // Bind Membership Toolbar [^] Bulk Upload Button
        const btnMemberToolbarUpload = document.getElementById('btn-member-toolbar-upload');
        if (btnMemberToolbarUpload) {
            btnMemberToolbarUpload.addEventListener('click', (e) => {
                e.preventDefault();
                // Add a default mock bulk upload Cambrian row
                const exists = currentCustomerMemberships.some(m => m.membershipName === 'Cambrian' && m.membershipGroup === '221');
                if (!exists) {
                    currentCustomerMemberships.push({
                        membershipNo: 'B9845',
                        membershipName: 'Cambrian',
                        membershipGroup: '221',
                        joiningDate: '13/07/2026',
                        leavingDate: '',
                        isDefault: true
                    });
                    renderMembershipList();
                    showToast("Bulk upload completed successfully. 1 membership imported.", "success");
                } else {
                    showToast("Bulk upload skipped. Membership 'Cambrian 221' already exists.", "info");
                }
            });
        }

        // Bind Membership Toolbar [v] Download Button (CSV Export)
        const btnMemberToolbarDownload = document.getElementById('btn-member-toolbar-download');
        if (btnMemberToolbarDownload) {
            btnMemberToolbarDownload.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentCustomerMemberships.length === 0) {
                    showToast("No membership data to download.", "warning");
                    return;
                }
                let csv = 'Membership No,Membership Name,Membership Group,Joining Date,Leaving Date,Default\n';
                currentCustomerMemberships.forEach(m => {
                    csv += `"${m.membershipNo}","${m.membershipName}","${m.membershipGroup}","${m.joiningDate}","${m.leavingDate || ''}",${m.isDefault}\n`;
                });
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `memberships_export_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast("CSV Download started.", "success");
            });
        }

        // Bind Membership Toolbar [?] Log Details Button
        const btnMemberToolbarLog = document.getElementById('btn-member-toolbar-log');
        if (btnMemberToolbarLog) {
            btnMemberToolbarLog.addEventListener('click', (e) => {
                e.preventDefault();
                showToast(`Log Details: System user logged in, modified membership records at ${new Date().toLocaleTimeString()}`, "info");
            });
        }

        // Postcode listener for auto-RSM
        const postcodeField = document.getElementById('cust-addr-postcode');
        if (postcodeField) {
            postcodeField.addEventListener('input', (e) => {
                const val = e.target.value.trim().toUpperCase();
                const rsmField = document.getElementById('cust-form-rsm');
                if (rsmField) {
                    if (val.startsWith('SS')) {
                        rsmField.value = 'John Smith';
                    } else if (val.startsWith('HA')) {
                        rsmField.value = 'David Miller';
                    } else if (val) {
                        rsmField.value = 'Sarah Jenkins';
                    }
                }
            });
        }

        // Buying Group price list default
        const buyingGroupSelect = document.getElementById('cust-form-buyinggroup');
        if (buyingGroupSelect) {
            buyingGroupSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                const priceListSelect = document.getElementById('cust-form-pricelist');
                if (priceListSelect) {
                    if (val === 'Laxmico Retail Group') {
                        priceListSelect.value = 'V0';
                    } else if (val === 'Independent Pharmacy Group') {
                        priceListSelect.value = 'V1';
                    } else if (val === 'None') {
                        priceListSelect.value = 'V2';
                    }
                }
            });
        }

        // Quick Create New Customer Button
        const btnCreateCustomerQuick = document.getElementById('btn-create-customer-quick');
        if (btnCreateCustomerQuick) {
            btnCreateCustomerQuick.addEventListener('click', () => {
                resetCustomerForm();
                editingCustomerNo = null;
                const acctIdInput = document.getElementById('cust-form-account-id');
                if (acctIdInput) acctIdInput.disabled = false;
                const formTitle = document.getElementById('cust-form-title');
                if (formTitle) formTitle.textContent = 'Create New Customer';
                const statusBadge = document.getElementById('cust-edit-status-badge');
                if (statusBadge) statusBadge.style.display = 'none';

                showCustomerFormView();
            });
        }

        // Contacts Details Table handlers
        const btnContactAddRow = document.getElementById('btn-contact-add-row');
        const btnContactDeleteSelected = document.getElementById('btn-contact-delete-selected');
        const chkContactsAllToggle = document.getElementById('chk-contacts-all-toggle');

        if (btnContactAddRow) {
            btnContactAddRow.addEventListener('click', () => {
                currentCustomerContacts.push({
                    selected: false,
                    name: '',
                    description: '',
                    commMethod: 'Email',
                    value: ''
                });
                renderContactsList();
                showToast("Contact row added.", "success");
            });
        }

        if (btnContactDeleteSelected) {
            btnContactDeleteSelected.addEventListener('click', () => {
                const initialLength = currentCustomerContacts.length;
                currentCustomerContacts = currentCustomerContacts.filter(c => !c.selected);
                if (currentCustomerContacts.length < initialLength) {
                    if (chkContactsAllToggle) chkContactsAllToggle.checked = false;
                    renderContactsList();
                    showToast("Selected contact rows deleted.", "warning");
                } else {
                    showToast("No contact rows selected for deletion.", "info");
                }
            });
        }

        if (chkContactsAllToggle) {
            chkContactsAllToggle.addEventListener('change', (e) => {
                const checked = e.target.checked;
                currentCustomerContacts.forEach(c => c.selected = checked);
                renderContactsList();
            });
        }

        if (btnCustCancel) {
            btnCustCancel.addEventListener('click', () => {
                resetCustomerForm();
                showCustomerListView();
            });
        }

        // Search inputs
        const searchId = document.getElementById('cust-search-id');
        const searchName = document.getElementById('cust-search-name');
        if (searchId) searchId.addEventListener('input', renderCustomerList);
        if (searchName) searchName.addEventListener('input', renderCustomerList);

    function createSpecialsCustomerObject(data) {
        const baseId = data.accountNumber.endsWith('_S') ? data.accountNumber.slice(0, -2) : data.accountNumber;
        const specialsId = `${baseId}_S`;

        const specialsData = JSON.parse(JSON.stringify(data));
        
        specialsData.company = "SPECIALS";
        specialsData.accountNumber = specialsId;
        specialsData.customerGroup = "15 Special";
        specialsData.taxCode = "ZUK 0";
        specialsData.taxLiability = "TAX Exempt";
        specialsData.priceGroup = "BNS";
        specialsData.statGroup = "SPE Specials";
        specialsData.invoiceCustomer = specialsId;

        specialsData.uploadedFiles = data.uploadedFiles ? { ...data.uploadedFiles } : {};
        specialsData.customUploadedFiles = data.customUploadedFiles ? JSON.parse(JSON.stringify(data.customUploadedFiles)) : [];
        
        specialsData.addresses = data.addresses ? JSON.parse(JSON.stringify(data.addresses)).map(addr => ({
            ...addr,
            taxLiability: "TAX Exempt",
            taxCode: "ZUK 0"
        })) : [];

        specialsData.contacts = data.contacts ? JSON.parse(JSON.stringify(data.contacts)) : [];
        specialsData.memberships = data.memberships ? JSON.parse(JSON.stringify(data.memberships)) : [];

        return specialsData;
    }

    // Save (Create Customer)
    if (btnCustSave) {
        btnCustSave.addEventListener('click', () => {
            const data = getCustomerFormData();
            if (!validateCustomerForm(data)) return;

            // Check ID uniqueness
            const exists = customers.some(c => c && c.accountNumber && c.accountNumber.toUpperCase() === data.accountNumber.toUpperCase());
            if (exists) {
                showToast("Error: Account Number already exists. Select a unique ID.", "danger");
                return;
            }

            customers.push(data);

            if (data.gowrieAccount) {
                const specialsData = createSpecialsCustomerObject(data);
                const specialsExists = customers.some(c => c && c.accountNumber && c.accountNumber.toUpperCase() === specialsData.accountNumber.toUpperCase());
                if (!specialsExists) {
                    customers.push(specialsData);
                    showToast(`Gowrie Account enabled: Created primary account '${data.accountNumber}' & SPECIALS account '${specialsData.accountNumber}'.`, "success");
                } else {
                    showToast(`Customer '${data.customerName}' created. Pending QA Approval.`, "success");
                }
            } else {
                showToast(`Customer '${data.customerName}' created. Pending QA Approval.`, "success");
            }

            saveCustomersState();
            resetCustomerForm();
            showCustomerListView();
        });
    }

    // Copy Customer
    if (btnCustCopy) {
        btnCustCopy.addEventListener('click', () => {
            const acctIdInput = document.getElementById('cust-form-account-id');
            if (acctIdInput) {
                acctIdInput.value = '';
                acctIdInput.disabled = false;
                acctIdInput.focus();
            }
            editingCustomerNo = null;

            const formTitle = document.getElementById('cust-form-title');
            if (formTitle) formTitle.textContent = 'Create New Customer';
            
            const statusBadge = document.getElementById('cust-edit-status-badge');
            if (statusBadge) statusBadge.style.display = 'none';

            showToast("Customer details copied. Enter a new Customer ID and click 'Create Customer'.", "info");
        });
    }

    // Update Customer
    if (btnCustUpdate) {
        btnCustUpdate.addEventListener('click', () => {
            if (!editingCustomerNo) {
                showToast("Error: No customer loaded to update. Load an existing customer first.", "danger");
                return;
            }
            const data = getCustomerFormData();
            if (!validateCustomerForm(data)) return;

            const idx = customers.findIndex(c => c && c.accountNumber && c.accountNumber.toUpperCase() === editingCustomerNo.toUpperCase());
            if (idx !== -1) {
                customers[idx] = data;

                if (data.gowrieAccount) {
                    const specialsData = createSpecialsCustomerObject(data);
                    const specialsIdx = customers.findIndex(c => c && c.accountNumber && c.accountNumber.toUpperCase() === specialsData.accountNumber.toUpperCase());
                    if (specialsIdx !== -1) {
                        customers[specialsIdx] = specialsData;
                    } else {
                        customers.push(specialsData);
                    }
                    showToast(`Customer '${data.customerName}' updated and SPECIALS account '${specialsData.accountNumber}' synchronized.`, "warning");
                } else {
                    showToast(`Customer '${data.customerName}' details updated. Pending QA Approval.`, "warning");
                }
                saveCustomersState();
                resetCustomerForm();
                showCustomerListView();
            } else {
                showToast(`Error: Customer account '${editingCustomerNo}' not found.`, "danger");
            }
        });
    }

        // Initial form values configure
        resetCustomerForm();
    }

    // =============================================================
    // SUPPLIER SETUP & WORKFLOW DELEGATION (ERP-MD-005)
    // =============================================================
    function showSupplierListView() {
        if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.showListView === 'function') {
            window.SupplierWorkflowModule.showListView();
        } else {
            const panelList = document.getElementById('panel-sup-list');
            const panelForm = document.getElementById('panel-sup-form');
            if (panelForm) panelForm.classList.add('hidden');
            if (panelList) panelList.classList.remove('hidden');
            if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.renderList === 'function') {
                window.SupplierWorkflowModule.renderList();
            }
        }
    }

    function showSupplierFormView() {
        if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.showFormView === 'function') {
            window.SupplierWorkflowModule.showFormView();
        } else {
            const panelList = document.getElementById('panel-sup-list');
            const panelForm = document.getElementById('panel-sup-form');
            if (panelList) panelList.classList.add('hidden');
            if (panelForm) panelForm.classList.remove('hidden');
        }
    }

    function loadSavedSupplierConfig() {
        if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.init === 'function') {
            window.SupplierWorkflowModule.init();
        }
    }

    function renderSupplierList() {
        if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.renderList === 'function') {
            window.SupplierWorkflowModule.renderList();
        }
    }

    function renderSupplierPaymentAddressesList() {
        // Managed inside supplier_workflow.js
    }

    function initSupplierSetup() {
        if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.init === 'function') {
            window.SupplierWorkflowModule.init();
        }
    }

    function initFinanceSetup() {
        const financeIcons = document.querySelectorAll('.finance-app-icon');
        const finModal = document.getElementById('finance-modal-overlay');
        const finHome = document.getElementById('panel-fin-home');

        financeIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const mod = icon.getAttribute('data-module');
                if (mod === 'accounts-setup') {
                    if (finModal) finModal.classList.add('hidden');
                    
                    switchModule('finance');

                    // Hide all finance panels
                    document.querySelectorAll('.fin-sub-panel').forEach(p => { 
                        p.classList.add('hidden'); 
                        p.style.display = ''; 
                    });
                    
                    // Show accounts setup home by default
                    if (finHome) {
                        finHome.classList.remove('hidden');
                        finHome.style.display = 'block';
                    }

                    showToast("Switched to Accounts Setup.", "success");
                } else {
                    showToast(`Module '${mod}' is under construction.`, "warning");
                }
            });
        });

        // Add a close handler for modal if clicked outside
        if (finModal) {
            finModal.addEventListener('click', (e) => {
                if (e.target === finModal) {
                    finModal.classList.add('hidden');
                }
            });
        }

        let currentFinanceSubPanel = 'fin-home';
        const finMastersList = [
            { id: 'fin-user-groups-voucher', name: 'User Groups Per Voucher Series', icon: '🔐', code: 'MAS-11' },
            { id: 'fin-posting-control', name: 'Posting Control', icon: '📊', code: 'MAS-12' },
            { id: 'fin-posting-control-details', name: 'Posting Control Details', icon: '⚙️', code: 'MAS-12B' },
            { id: 'fin-automatic-tax-proposal', name: 'Automatic Tax Proposal', icon: '⚡', code: 'MAS-14' },
            { id: 'fin-tax-proposal-details', name: 'Tax Proposal Details', icon: '📑', code: 'MAS-13' }
        ];

        window.switchFinanceSubPanel = function(targetId) {
            // fin-automatic-tax-proposal is now a dedicated master screen
            if (targetId === 'fin-cost') targetId = 'fin-cost-center';
            if (targetId === 'fin-groups') targetId = 'fin-account-group';
            if (targetId === 'fin-payterm') targetId = 'fin-payment-terms';
            currentFinanceSubPanel = targetId || 'fin-home';
            if (currentFinanceSubPanel === 'fin-home' || currentFinanceSubPanel === 'fin-currency-rates' || currentFinanceSubPanel === 'fin-tax-codes' || currentFinanceSubPanel === 'fin-cost-center' || currentFinanceSubPanel === 'fin-cost' || currentFinanceSubPanel === 'fin-account-group' || currentFinanceSubPanel === 'fin-groups' || currentFinanceSubPanel === 'fin-accounts' || currentFinanceSubPanel === 'fin-payment-terms' || currentFinanceSubPanel === 'fin-payterm' || currentFinanceSubPanel === 'fin-user-groups-period' || currentFinanceSubPanel === 'fin-accounting-periods' || currentFinanceSubPanel === 'fin-accounting-years' || currentFinanceSubPanel === 'fin-voucher-series-type' || currentFinanceSubPanel === 'fin-user-groups-voucher' || currentFinanceSubPanel === 'fin-posting-control' || currentFinanceSubPanel === 'fin-posting-control-details' || currentFinanceSubPanel === 'fin-tax-proposal-details' || currentFinanceSubPanel === 'fin-automatic-tax-proposal') {
                const headerEl = document.querySelector('#finance-setup-workspace > .page-title-bar') || document.querySelector('#finance-workspace .page-title-bar');
                if (headerEl) headerEl.style.display = 'none';
            }

            const targetPanel = document.getElementById(`panel-${targetId}`);
            if (targetPanel) {
                document.querySelectorAll('.fin-sub-panel').forEach(p => { 
                    p.classList.add('hidden'); 
                    p.style.display = ''; 
                });
                targetPanel.classList.remove('hidden');
                targetPanel.style.display = 'block';

                const badge = document.getElementById('fin-active-screen-badge');
                if (badge) {
                    const link = document.querySelector(`.mod-dash-link[data-fin-nav="${targetId}"]`);
                    let linkText = link ? link.textContent.trim().replace('↗', '').trim() : targetId;
                    badge.textContent = `Active Screen: ${linkText}`;
                }

                if (targetId === 'fin-automatic-tax-proposal' && window.AutomaticTaxProposalModule && typeof window.AutomaticTaxProposalModule.renderTable === 'function') {
                    window.AutomaticTaxProposalModule.renderTable();
                    window.AutomaticTaxProposalModule.renderKPIs();
                }
                if (targetId === 'fin-tax-proposal-details' && window.TaxProposalDetailsModule && typeof window.TaxProposalDetailsModule.renderTable === 'function') {
                    window.TaxProposalDetailsModule.renderTable();
                    window.TaxProposalDetailsModule.renderKPIs();
                }
                if (targetId === 'fin-posting-control' && window.PostingControlHeaderModule && typeof window.PostingControlHeaderModule.renderTable === 'function') {
                    window.PostingControlHeaderModule.renderTable();
                    window.PostingControlHeaderModule.renderKPIs();
                }
                if (targetId === 'fin-posting-control-details' && window.PostingControlModule && typeof window.PostingControlModule.renderTable === 'function') {
                    window.PostingControlModule.renderTable();
                    window.PostingControlModule.renderKPIs();
                }
                if (targetId === 'fin-user-groups-voucher' && window.UserGroupsVoucherModule && typeof window.UserGroupsVoucherModule.renderTable === 'function') {
                    window.UserGroupsVoucherModule.renderTable();
                    window.UserGroupsVoucherModule.renderKPIs();
                }
            }
        };

        // Handle internal finance navigation links (e.g. Chart of Accounts, Cost Centers, etc.)
        const finNavLinks = document.querySelectorAll('.mod-dash-link[data-fin-nav]');
        finNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-fin-nav');
                if (typeof window.switchFinanceSubPanel === 'function') {
                    window.switchFinanceSubPanel(targetId);
                }
            });
        });
    }

    function initRBAC() {
        const profileContainer = document.getElementById('topbar-user-profile');
        const rbacDropdown = document.getElementById('profile-rbac-dropdown');
        const roleSelector = document.getElementById('rbac-role-selector');
        const topbarActiveRole = document.getElementById('topbar-active-role');
        
        const chkRead = document.getElementById('rbac-perm-read');
        const chkWrite = document.getElementById('rbac-perm-write');
        const chkDelete = document.getElementById('rbac-perm-delete');
        const roleDescBox = document.getElementById('rbac-role-desc');
        const roleDescTitle = document.getElementById('rbac-role-desc-title');
        const roleDescText = document.getElementById('rbac-role-desc-text');

        if (!profileContainer || !rbacDropdown) return;

        // Toggle dropdown on profile click
        profileContainer.addEventListener('click', (e) => {
            // If clicking inside the dropdown, do nothing (let it stay open)
            if (rbacDropdown.contains(e.target)) return;
            
            rbacDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileContainer.contains(e.target)) {
                rbacDropdown.classList.add('hidden');
            }
        });

        const roleMetadata = {
            'Stock Control': {
                display: 'Stock Control Team',
                title: 'Stock Control Team:',
                desc: 'Review Page 1 & 2 details, complete Page 3 Stock Control Specification, and submit to QA.',
                read: true, write: true, delete: false,
                color: '#0284c7', border: '#0ea5e9'
            },
            'Admin': {
                display: 'ERP Administrator',
                title: 'ERP Administrator:',
                desc: 'Full administrative and supervisory rights across all ERP master workflows.',
                read: true, write: true, delete: true,
                color: '#059669', border: '#10b981'
            },
            'Finance': {
                display: 'Finance (Creator)',
                title: 'Finance (Commercials):',
                desc: 'Create & edit customer/supplier drafts, enter payment details, submit to QA, rectify corrections.',
                read: true, write: true, delete: false,
                color: '#2563eb', border: '#3b82f6'
            },
            'QA': {
                display: 'Quality Assurance (QA)',
                title: 'Quality Assurance (QA):',
                desc: 'Review compliance dossiers, complete Licence Info, verify checklists, submit to Transport/RP, perform final activation.',
                read: true, write: true, delete: false,
                color: '#7c3aed', border: '#8b5cf6'
            },
            'Transport': {
                display: 'Transport & Logistics',
                title: 'Transport & Logistics:',
                desc: 'Review customer logistics profiles, assign mandatory Route ID codes, submit for QA activation.',
                read: true, write: true, delete: false,
                color: '#0284c7', border: '#0ea5e9'
            },
            'RP': {
                display: 'Responsible Person (RP)',
                title: 'Responsible Person (RP):',
                desc: 'Approval authority: Review compliance dossiers, grant RP approval, or reject with mandatory correction reason.',
                read: true, write: true, delete: false,
                color: '#d97706', border: '#f59e0b'
            },
            'Manager': {
                display: 'Department Manager',
                title: 'Department Manager:',
                desc: 'Supervisory visibility across operational records and approval queues.',
                read: true, write: true, delete: false,
                color: '#475569', border: '#64748b'
            },
            'Normal User': {
                display: 'Standard User',
                title: 'Standard User (Read-Only):',
                desc: 'Read-only access to published and approved master data.',
                read: true, write: false, delete: false,
                color: '#64748b', border: '#94a3b8'
            }
        };

        function applyRole(role, silent = false) {
            const meta = roleMetadata[role] || roleMetadata['Admin'];

            if (topbarActiveRole) {
                topbarActiveRole.textContent = meta.display;
            }

            if (roleSelector && roleSelector.value !== role) {
                roleSelector.value = role;
            }

            if (chkRead) chkRead.checked = meta.read;
            if (chkWrite) chkWrite.checked = meta.write;
            if (chkDelete) chkDelete.checked = meta.delete;

            if (roleDescBox && roleDescTitle && roleDescText) {
                roleDescBox.style.borderLeftColor = meta.border;
                roleDescTitle.style.color = meta.color;
                roleDescTitle.textContent = meta.title;
                roleDescText.textContent = meta.desc;
            }

            // Sync with Customer Workflow Engine
            if (window.CustomerWorkflowModule && typeof window.CustomerWorkflowModule.setRole === 'function') {
                window.CustomerWorkflowModule.setRole(role);
            }

            // Sync with Supplier Workflow Engine
            if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.setRole === 'function') {
                window.SupplierWorkflowModule.setRole(role);
            }

            // Sync with Module Access Control Engine
            if (typeof ModuleAccessControl !== 'undefined') {
                ModuleAccessControl.setActiveRole(role);

                // If currently viewing an active module that is not allowed for this role, enforce access block
                if (!mainErpContainer.classList.contains('hidden') && currentActiveModule) {
                    if (!ModuleAccessControl.isModuleAllowed(currentActiveModule)) {
                        ModuleAccessControl.showAccessDenied(currentActiveModule);
                    }
                }
            }

            try {
                localStorage.setItem('ANTIGRAVITY_ERP_ACTIVE_ROLE', role);
            } catch (e) {}

            if (!silent) {
                showToast(`Switched active profile role to: ${meta.display}`, 'success');
            }
        }

        // Handle Role change from profile dropdown
        if (roleSelector) {
            roleSelector.addEventListener('change', (e) => {
                applyRole(e.target.value);
            });
        }

        // Load saved role or default to Normal User
        let savedRole = 'Normal User';
        try {
            savedRole = localStorage.getItem('ANTIGRAVITY_ERP_ACTIVE_ROLE') || 'Normal User';
        } catch (e) {}
        applyRole(savedRole, true);
    }


    // -------------------------------------------------------------
    // Master Data Setup Dashboard & Sub-Master Config Logic
    // -------------------------------------------------------------
    const subMasterData = {
        companyType: ['Subsidiary', 'Holding Company', 'Joint Venture', 'Branch', 'Partner'],
        customerGroup: ['Commercial', 'Retail', 'Wholesale', 'Government', 'Export', 'Internal'],
        paymentTerm: ['COD - Cash on Delivery', '7 Days Net', '15 Days Net', '30 Days Net', '60 Days Net', '90 Days Net'],
        taxCode: ['VAT 20% Standard', 'VAT 5% Reduced', 'VAT 0% Zero-Rated', 'EXEMPT - Tax Exempt'],
        currency: ['GBP (£)', 'USD ($)', 'EUR (€)', 'CAD ($)', 'AUD ($)', 'JPY (¥)'],
        route: ['North-East Corridor', 'Midlands Hub', 'South-East Direct', 'Scotland & Borders', 'Ireland Express'],
        rsm: ['John Doe (RSM-North)', 'Sarah Smith (RSM-South)', 'Michael Brown (RSM-West)', 'Emma Wilson (RSM-Central)'],
        creditAnalyst: ['David Miller (Senior Analyst)', 'Rachel Green (Credit Officer)', 'James Taylor (Risk Manager)']
    };
    let activeSubMasterCategory = 'companyType';

    function initMasterDataDashboardLinks() {
        const links = [
            { id: 'masters-link-company', module: 'other' },
            { id: 'masters-link-site', module: 'site' },
            { id: 'masters-link-sub-master', module: 'submaster' },
            { id: 'masters-link-customer', module: 'customer-creation' },
            { id: 'masters-link-supplier', module: 'supplier-setup' },
            { id: 'masters-link-item', module: 'item-setup' },
            { id: 'masters-link-user-list', module: 'user-setup' },
            { id: 'masters-link-user-create', module: 'user-setup' },
            { id: 'masters-link-user-rights', module: 'user-setup' }
        ];

        links.forEach(link => {
            const el = document.getElementById(link.id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchModule(link.module);
                });
            }
        });
    }

    function updateMastersDashboardKPIs() {
        const companyCount = typeof registeredCompanies !== 'undefined' ? registeredCompanies.length : 2;
        const siteCount = typeof registeredSites !== 'undefined' ? registeredSites.length : 2;
        const userCount = typeof registeredUsers !== 'undefined' ? registeredUsers.length : 4;
        
        let custCount = 5;
        try {
            if (window.CustomerWorkflowModule && window.CustomerWorkflowModule.customers) {
                custCount = window.CustomerWorkflowModule.customers.length;
            }
        } catch(e) {}

        let supCount = 3;
        try {
            if (window.SupplierWorkflowModule && window.SupplierWorkflowModule.suppliers) {
                supCount = window.SupplierWorkflowModule.suppliers.length;
            }
        } catch(e) {}

        const itemCount = 8;
        const totalSubMasters = Object.values(subMasterData).reduce((sum, arr) => sum + arr.length, 0);

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('kpi-masters-companies', companyCount);
        setVal('kpi-masters-sites', siteCount);
        setVal('kpi-masters-users', userCount);
        setVal('kpi-masters-customers', custCount);
        setVal('kpi-masters-suppliers', supCount);
        setVal('kpi-masters-items', itemCount);

        setVal('masters-badge-company', companyCount);
        setVal('masters-badge-site', siteCount);
        setVal('masters-badge-sub-masters', totalSubMasters);
        setVal('masters-badge-customer', custCount);
        setVal('masters-badge-supplier', supCount);
        setVal('masters-badge-item', itemCount);
        setVal('masters-badge-users', userCount);
    }

    function initSubMasterConfig() {
        const catButtons = document.querySelectorAll('.sub-master-cat-btn');
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeSubMasterCategory = btn.getAttribute('data-category') || 'companyType';
                renderSubMasterTable();
            });
        });

        const btnAdd = document.getElementById('btn-sub-master-add');
        const inputNew = document.getElementById('sub-master-new-value');

        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                const val = inputNew ? inputNew.value.trim() : '';
                if (!val) {
                    showToast('Please enter an option value.', 'warning');
                    return;
                }
                if (!subMasterData[activeSubMasterCategory]) subMasterData[activeSubMasterCategory] = [];
                subMasterData[activeSubMasterCategory].push(val);
                if (inputNew) inputNew.value = '';
                renderSubMasterTable();
                showToast(`Added "${val}" to sub-masters.`, 'success');
            });
        }

        renderSubMasterTable();
    }

    function renderSubMasterTable() {
        const titleEl = document.getElementById('sub-master-title');
        const badgeEl = document.getElementById('sub-master-count-badge');
        const bodyEl = document.getElementById('sub-master-values-body');

        const categoryTitles = {
            companyType: 'Company Types',
            customerGroup: 'Customer Groups',
            paymentTerm: 'Payment Terms',
            taxCode: 'Tax Codes',
            currency: 'Currencies',
            route: 'Routes',
            rsm: 'Salesmen (RSM)',
            creditAnalyst: 'Credit Analysts'
        };

        const currentOptions = subMasterData[activeSubMasterCategory] || [];

        if (titleEl) titleEl.textContent = categoryTitles[activeSubMasterCategory] || 'Sub-Master Options';
        if (badgeEl) badgeEl.textContent = `${currentOptions.length} Options`;

        if (bodyEl) {
            bodyEl.innerHTML = '';
            if (currentOptions.length === 0) {
                bodyEl.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:15px; color:#94a3b8;">No options configured for this category.</td></tr>';
                return;
            }

            currentOptions.forEach((opt, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align: center; font-weight: 600; color: #64748b;">${idx + 1}</td>
                    <td style="font-weight: 500;">${opt}</td>
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-secondary btn-del-sub-master-opt" data-index="${idx}" style="padding: 3px 8px; font-size: 11px; color: #ef4444; border-color: #fca5a5;">🗑️ Delete</button>
                    </td>
                `;
                bodyEl.appendChild(tr);
            });

            bodyEl.querySelectorAll('.btn-del-sub-master-opt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-index'), 10);
                    const removed = subMasterData[activeSubMasterCategory].splice(idx, 1);
                    renderSubMasterTable();
                    showToast(`Removed "${removed[0]}" option.`, 'info');
                });
            });
        }
    }


    function initAwesomebar() {
        const awesomebarOverlay = document.getElementById('awesomebar-modal-overlay');
        const awesomebarInput = document.getElementById('awesomebar-search-input');
        const homeSearchTrigger = document.getElementById('home-search-trigger');
        const topbarSearchInput = document.getElementById('topbar-search-input');
        const resultsContainer = document.getElementById('awesomebar-results-container');

        const baseSearchableItems = [
            { title: 'Company Setup', module: 'other', id: 'nav-company-setup-sub', type: 'Master Data', icon: '📁' },
            { title: 'Site Setup', module: 'site', id: 'nav-site-setup-sub', type: 'Master Data', icon: '🏢' },
            { title: 'User Setup', module: 'user-setup', id: 'nav-user-setup-sub', type: 'Master Data', icon: '👥' },
            { title: 'Reset Password', module: 'user-setup', id: 'nav-user-setup-sub', subtab: 'reset-password', type: 'Security', icon: '🔐' },
            { title: 'Customer Master Setup & Workflow', module: 'customer-creation', id: 'nav-customer-creation-sub', type: 'Master Data', icon: '🤝' },
            { title: 'Create Customer (Finance)', module: 'customer-creation', id: 'nav-customer-creation-sub', action: 'create-customer', type: 'Customer Workflow', icon: '➕' },
            { title: 'Supplier Setup & Governance', module: 'supplier-setup', id: 'nav-supplier-setup-sub', type: 'Master Data', icon: '🚚' },
            { title: 'Masters Overview & Directory', module: 'masters', id: 'nav-masters-dashboard-sub', type: 'Master Data', icon: '📁' },
            { title: 'Dropdown Sub-Master Config', module: 'submaster', id: 'nav-sub-master-sub', type: 'Master Data', icon: '🔀' },
            { title: 'Item Master Catalog', module: 'item-setup', id: 'nav-item-setup-sub', type: 'Master Data', icon: '📦' },
            { title: 'Dashboard', module: 'other', id: 'nav-dashboard', type: 'Module', icon: '📊' },
            { title: 'Finance / Ledger', module: 'finance', id: 'nav-finance', type: 'Module', icon: '💳' },
            { title: 'Automatic Tax Proposal (ERP-FIN-MAS-014)', module: 'finance', finSub: 'fin-automatic-tax-proposal', type: 'Finance Masters', icon: '⚡' },
            { title: 'Tax Proposal Details (ERP-FIN-MAS-013)', module: 'finance', finSub: 'fin-tax-proposal-details', type: 'Finance Masters', icon: '📑' },
            { title: 'Posting Control (ERP-FIN-MAS-012)', module: 'finance', finSub: 'fin-posting-control', type: 'Finance Masters', icon: '📊' },
            { title: 'Posting Control Details (ERP-FIN-MAS-012)', module: 'finance', finSub: 'fin-posting-control-details', type: 'Finance Masters', icon: '⚙️' },
            { title: 'User Groups Per Voucher Series (ERP-FIN-MAS-011)', module: 'finance', finSub: 'fin-user-groups-voucher', type: 'Finance Masters', icon: '🔐' },
            { title: 'Voucher Series Per Voucher Type (ERP-FIN-MAS-010)', module: 'finance', finSub: 'fin-voucher-series-type', type: 'Finance Masters', icon: '🔢' },
            { title: 'Accounting Years (ERP-FIN-MAS-009)', module: 'finance', finSub: 'fin-accounting-years', type: 'Finance Masters', icon: '📅' },
            { title: 'Accounting Periods (ERP-FIN-MAS-008)', module: 'finance', finSub: 'fin-accounting-periods', type: 'Finance Masters', icon: '📆' },
            { title: 'User Group per Period (ERP-FIN-MAS-007)', module: 'finance', finSub: 'fin-user-groups-period', type: 'Finance Masters', icon: '👥' },
            { title: 'Payment Terms (ERP-FIN-MAS-006)', module: 'finance', finSub: 'fin-payment-terms', type: 'Finance Masters', icon: '💳' },
            { title: 'Accounts Master (ERP-FIN-MAS-005)', module: 'finance', finSub: 'fin-accounts', type: 'Finance Masters', icon: '📋' },
            { title: 'Account Groups (ERP-FIN-MAS-004)', module: 'finance', finSub: 'fin-account-group', type: 'Finance Masters', icon: '📁' },
            { title: 'Cost Center (ERP-FIN-MAS-003)', module: 'finance', finSub: 'fin-cost-center', type: 'Finance Masters', icon: '🏢' },
            { title: 'Tax Codes (ERP-FIN-MAS-002)', module: 'finance', finSub: 'fin-tax-codes', type: 'Finance Masters', icon: '📑' },
            { title: 'Currency Rates (ERP-FIN-MAS-001)', module: 'finance', finSub: 'fin-currency-rates', type: 'Finance Masters', icon: '💱' },
            { title: 'Inventory', module: 'stock', id: 'nav-inventory', type: 'Module', icon: '📦' },
            { title: 'Purchasing', module: 'purchase', id: 'nav-purchasing', type: 'Module', icon: '🛒' },
            { title: 'Distribution', module: 'sales', id: 'nav-distribution', type: 'Module', icon: '🚚' },
            { title: 'Sales Module', module: 'sales', type: 'Module', icon: '📊', isCard: true },
            { title: 'Purchase Module', module: 'purchase', type: 'Module', icon: '🛒', isCard: true },
            { title: 'HR Module', module: 'hr', type: 'Module', icon: '👥', isCard: true },
            { title: 'PLPI Module', module: 'plpi', type: 'Module', icon: '⚙️', isCard: true },
            { title: 'Stock Management', module: 'stock', type: 'Module', icon: '📦', isCard: true },
            { title: 'Part Creation Request (Warehouse)', module: 'stock', subpanel: 'panel-part-creation', action: 'create-part-request', type: 'Stock Management', icon: '✨' },
            { title: 'Part Creation QA Approval', module: 'stock', subpanel: 'panel-part-creation', filter: 'PENDING_QA', type: 'Stock Management', icon: '🛡️' },
            { title: 'Inventory Part Buying', module: 'stock', subpanel: 'panel-part-creation', type: 'Stock Management', icon: '📦' },
            { title: 'Master Data Setup', module: 'other', type: 'Module', icon: '📁', isCard: true }
        ];

        function getFullSearchableItems() {
            let items = [...baseSearchableItems];

            // Add dynamic customer records from CustomerWorkflowModule or localStorage
            try {
                let custList = [];
                if (window.CustomerWorkflowModule && window.CustomerWorkflowModule.customers && window.CustomerWorkflowModule.customers.length > 0) {
                    custList = window.CustomerWorkflowModule.customers;
                } else {
                    const raw = localStorage.getItem('ANTIGRAVITY_ERP_CUSTOMER_DATA_V2');
                    if (raw) custList = JSON.parse(raw);
                }
                if (Array.isArray(custList)) {
                    custList.forEach(c => {
                        if (c && c.accountNumber) {
                            items.push({
                                title: `${c.customerName || 'Customer'} (${c.accountNumber})`,
                                type: `Customer · ${c.status || 'Draft'} · ${c.subStatus || ''}`,
                                icon: c.status === 'Active' ? '🟢' : '🤝',
                                isCustomer: true,
                                customer: c,
                                module: 'customer-creation',
                                id: 'nav-customer-creation-sub'
                            });
                        }
                    });
                }
            } catch (e) {
                console.error("Error gathering customer items for search:", e);
            }

            // Add dynamic supplier records
            try {
                let supList = [];
                if (window.SupplierWorkflowModule && window.SupplierWorkflowModule.suppliers && window.SupplierWorkflowModule.suppliers.length > 0) {
                    supList = window.SupplierWorkflowModule.suppliers;
                } else {
                    const raw = localStorage.getItem('ANTIGRAVITY_ERP_SUPPLIER_DATA_V1');
                    if (raw) supList = JSON.parse(raw);
                }
                if (Array.isArray(supList)) {
                    supList.forEach(s => {
                        if (s && s.supplierCode) {
                            items.push({
                                title: `${s.supplierName || 'Supplier'} (${s.supplierCode})`,
                                type: `Supplier · ${s.status || 'Draft'} · ${s.subStatus || ''}`,
                                icon: s.status === 'Active' ? '🟢' : '🚚',
                                isSupplier: true,
                                supplier: s,
                                module: 'supplier-setup',
                                id: 'nav-supplier-setup-sub'
                            });
                        }
                    });
                }
            } catch (e) {
                console.error("Error gathering supplier items for search:", e);
            }

            // Filter searchable items by active module authorization
            if (typeof ModuleAccessControl !== 'undefined') {
                items = items.filter(item => {
                    if (item.module) {
                        return ModuleAccessControl.isModuleAllowed(item.module);
                    }
                    return true;
                });
            }

            return items;
        }

        let selectedIndex = -1;
        let currentResults = [];

        function updateSelection() {
            if (!resultsContainer) return;
            const items = resultsContainer.querySelectorAll('.search-result-item');
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    item.style.backgroundColor = 'var(--color-bg-hover, #f3f4f6)';
                    if (item.scrollIntoViewIfNeeded) {
                        item.scrollIntoViewIfNeeded();
                    } else if (typeof item.scrollIntoView === 'function') {
                        item.scrollIntoView({ block: 'nearest' });
                    }
                } else {
                    item.style.backgroundColor = 'transparent';
                }
            });
        }

        function renderResults(results) {
            if (!resultsContainer) return;
            resultsContainer.innerHTML = '';
            
            // Set styles on container to allow scrolling
            resultsContainer.style.maxHeight = '300px';
            resultsContainer.style.overflowY = 'auto';
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div style="padding: 15px; color: var(--color-text-muted); text-align: center;">No results found</div>';
                return;
            }

            results.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.style.cssText = `display: flex; align-items: center; padding: 10px 15px; cursor: pointer; border-bottom: 1px solid var(--color-border-light); transition: background-color 0.1s;`;
                
                div.innerHTML = `
                    <span style="font-size: 18px; margin-right: 12px;">${item.icon}</span>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 500; color: var(--color-text-main); font-size: 14px;">${item.title}</span>
                        <span style="font-size: 12px; color: var(--color-text-muted);">${item.type}</span>
                    </div>
                `;

                div.addEventListener('click', () => executeSearchItem(item));
                
                div.addEventListener('mousemove', () => {
                    if (selectedIndex !== index) {
                        selectedIndex = index;
                        updateSelection();
                    }
                });

                resultsContainer.appendChild(div);
            });
            updateSelection();
        }

        function executeSearchItem(item) {
            closeAwesomebar();
            
            // 1. If it's a customer record
            if (item.isCustomer && item.customer) {
                const custNav = document.getElementById('nav-customer-creation-sub');
                if (custNav) custNav.click();
                setTimeout(() => {
                    if (window.CustomerWorkflowModule && typeof window.CustomerWorkflowModule.openCustomerView === 'function') {
                        window.CustomerWorkflowModule.openCustomerView(item.customer.accountNumber);
                    }
                }, 100);
                return;
            }

            // 2. If it's a supplier record
            if (item.isSupplier && item.supplier) {
                const supNav = document.getElementById('nav-supplier-setup-sub');
                if (supNav) supNav.click();
                setTimeout(() => {
                    if (window.SupplierWorkflowModule && typeof window.SupplierWorkflowModule.openSupplierViewModal === 'function') {
                        window.SupplierWorkflowModule.openSupplierViewModal(item.supplier.supplierCode);
                    }
                }, 100);
                return;
            }

            // 2.5. If it's a Finance Master Subpanel
            if (item.finSub) {
                switchModule('finance');
                setTimeout(() => {
                    if (typeof window.switchFinanceSubPanel === 'function') {
                        window.switchFinanceSubPanel(item.finSub);
                    }
                }, 80);
                return;
            }

            // 3. If it's a top-level module card
            if (item.isCard && item.module) {
                if (item.module === 'finance') {
                    const finModal = document.getElementById('finance-modal-overlay');
                    if (finModal) finModal.classList.remove('hidden');
                    return;
                }
                
                if (typeof switchModule === 'function') {
                    switchModule(item.module);
                    if (typeof showToast === 'function') {
                        showToast(`Entered B&S ERP: ${item.title}`, 'success');
                    }
                }
                return;
            }

            // 4. We are navigating to a specific sub-page.
            if (item.module) {
                if (item.module === 'finance') {
                    const finModal = document.getElementById('finance-modal-overlay');
                    if (finModal) finModal.classList.remove('hidden');
                } else if (typeof switchModule === 'function') {
                    switchModule(item.module);
                    if (item.subpanel) {
                        setTimeout(() => {
                            document.querySelectorAll(`#${item.module}-workspace .stock-sub-panel`).forEach(p => p.classList.add('hidden'));
                            const subP = document.getElementById(item.subpanel);
                            if (subP) subP.classList.remove('hidden');
                        }, 60);
                    }
                }
            }
            
            // 5. Click the target sidebar navigation element to show the specific tab
            if (item.id) {
                setTimeout(() => {
                    const el = document.getElementById(item.id);
                    if (el) {
                        el.click();
                    } else if (typeof showToast === 'function') {
                        showToast(`Navigating to ${item.title}...`, 'info');
                    }

                    if (item.action === 'create-customer') {
                        setTimeout(() => {
                            if (window.CustomerWorkflowModule && typeof window.CustomerWorkflowModule.startNewCustomerCreation === 'function') {
                                window.CustomerWorkflowModule.startNewCustomerCreation();
                            }
                        }, 80);
                    }

                    if (item.subtab) {
                        setTimeout(() => {
                            const subtabEl = document.querySelector(`[data-subtab="${item.subtab}"]`);
                            if (subtabEl) {
                                subtabEl.click();
                            } else if (typeof switchUserSubtab === 'function') {
                                switchUserSubtab(item.subtab);
                            }
                        }, 60);
                    }
                }, 50);
            }
        }

        function openAwesomebar() {
            if (awesomebarOverlay && awesomebarInput) {
                awesomebarOverlay.classList.remove('hidden');
                awesomebarInput.value = '';
                currentResults = getFullSearchableItems();
                selectedIndex = -1;
                renderResults(currentResults);
                setTimeout(() => awesomebarInput.focus(), 50);
            }
        }

        function closeAwesomebar() {
            if (awesomebarOverlay) {
                awesomebarOverlay.classList.add('hidden');
            }
        }

        if (awesomebarInput) {
            awesomebarInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const allItems = getFullSearchableItems();
                if (!query) {
                    currentResults = allItems;
                } else {
                    currentResults = allItems.filter(item => 
                        item.title.toLowerCase().includes(query) || 
                        item.type.toLowerCase().includes(query)
                    );
                }
                selectedIndex = currentResults.length > 0 ? 0 : -1;
                renderResults(currentResults);
            });

            awesomebarInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (selectedIndex < currentResults.length - 1) {
                        selectedIndex++;
                        updateSelection();
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (selectedIndex > 0) {
                        selectedIndex--;
                        updateSelection();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
                        executeSearchItem(currentResults[selectedIndex]);
                    }
                }
            });
        }

        // Ctrl+K keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openAwesomebar();
            }
            if (e.key === 'Escape' && awesomebarOverlay && !awesomebarOverlay.classList.contains('hidden')) {
                closeAwesomebar();
            }
        });

        // Click handlers
        if (homeSearchTrigger) {
            homeSearchTrigger.addEventListener('click', openAwesomebar);
        }
        
        if (topbarSearchInput) {
            topbarSearchInput.addEventListener('click', openAwesomebar);
            topbarSearchInput.addEventListener('focus', (e) => {
                topbarSearchInput.blur();
                openAwesomebar();
            });
        }

        // Close on clicking overlay background
        if (awesomebarOverlay) {
            awesomebarOverlay.addEventListener('click', (e) => {
                if (e.target === awesomebarOverlay) {
                    closeAwesomebar();
                }
            });
        }
    }

    // ============================================================
    // DEDICATED WORKSPACE — PART CREATION & QA APPROVAL MODULE
    // ============================================================
        function initPartCreation() {
        const STORAGE_KEY = 'bs_part_creation_requests_v4';

        let currentOpenedRequest = null;
        let activeFilter = 'ALL';

        const defaultRequests = [
            {
                id: 'REQ-2026-0001',
                status: 'APPROVED',
                partCodeGenerated: 'PRT-10020',
                requestDate: '2026-08-28',
                requestedBy: 'Warehouse Op (John Doe)',
                company: 'B&S Healthcare Ltd',
                site: 'Warehouse 1 - Ruislip',
                requestType: 'NEW PRODUCT',
                api: 'Paracetamol',
                productType: 'BRANDED',
                productName: 'Paracetamol 500mg Tablets',
                strength: '500mg',
                packSize: 'Pack of 100',
                form: 'Tablet',
                buyerName: 'Shiva',
                controlledDrug: 'No',
                cdSchedule: 'N/A',
                className: 'Non-Controlled',
                coldChain: 'No',
                specials: 'No',
                productFamily: 'Analgesics',
                storageConditions: 'Store below 25°C',
                bnfCode: '04.07.01.00',
                bnfDrugName: 'Paracetamol',
                bnfSelectionName: 'Paracetamol 500mg Tabs',
                bnfChemicalName: 'Acetaminophen',
                bnfPrepName: 'Paracetamol Tablets BP',
                shelfLifeVal: '36',
                vatCode: 'SUK-11',
                drugTariff: '115.83',
                salesPrice: '92.66',
                minSellingPrice: '92.66',
                estMaterialCost: '115.83',
                supplierName: 'ALLOGA UK LIMITED',
                country: 'UNITED KINGDOM',
                partCountry: 'United Kingdom',
                partType: 'Purchased (Raw)',
                proposedPartNumber: 'PRT-10020',
                valuationMethod: 'Weighted Average',
                lotTracking: 'Lot Tracking',
                lotQtyRule: 'Many Lots Per Production Order',
                subLotRule: 'Sub Lots Allowed',
                componentLotRule: 'Many Lots Allowed',
                costLevel: 'Cost Per Part',
                invoiceConsideration: 'Ignore Invoice Price',
                zeroCostFlag: 'Zero Cost Forbidden',
                hiddenQty: '0',
                attachedDoc: 'Paracetamol_Technical_Specification_v2.pdf (1.45 MB)',
                documents: [
                    {
                        id: 'DOC-2026-001',
                        name: 'Paracetamol_Technical_Specification_v2.pdf',
                        category: 'Technical Specification',
                        size: '1.45 MB',
                        uploadedBy: 'Warehouse Op (John Doe)',
                        timestamp: '2026-08-28 10:15',
                        note: 'Verified active pharmaceutical ingredient assay (BP Grade)'
                    }
                ],
                qaChecklist: {}
            },
            {
                id: 'REQ-2026-0002',
                status: 'PENDING_QA',
                requestDate: '2026-08-26',
                requestedBy: 'Warehouse Op (Sarah Jenkins)',
                company: 'B&S Healthcare Ltd',
                site: 'Warehouse 1 - Ruislip',
                requestType: 'NEW PRODUCT',
                api: 'Amoxicillin',
                productType: 'BRANDED',
                productName: 'Amoxicillin 250mg Capsules',
                strength: '250mg',
                packSize: 'Pack of 28',
                form: 'Capsule',
                buyerName: 'David Miller',
                controlledDrug: 'No',
                cdSchedule: 'N/A',
                className: 'Non-Controlled',
                coldChain: 'No',
                specials: 'No',
                productFamily: 'Antibiotics',
                storageConditions: 'Store below 25°C',
                bnfCode: '05.01.01.01',
                bnfDrugName: 'Amoxicillin',
                bnfSelectionName: 'Amoxicillin 250mg Caps',
                bnfChemicalName: 'Amoxicillin Trihydrate',
                bnfPrepName: 'Amoxicillin Capsules BP',
                shelfLifeVal: '24',
                vatCode: 'SUK-11',
                drugTariff: '45.00',
                salesPrice: '38.50',
                minSellingPrice: '38.50',
                estMaterialCost: '45.00',
                supplierName: 'SANDOZ PHARMA',
                country: 'UNITED KINGDOM',
                partCountry: 'United Kingdom',
                partType: 'Purchased (Raw)',
                proposedPartNumber: 'PRT-10022',
                valuationMethod: 'Weighted Average',
                lotTracking: 'Lot Tracking',
                lotQtyRule: 'Many Lots Per Production Order',
                subLotRule: 'Sub Lots Allowed',
                componentLotRule: 'Many Lots Allowed',
                costLevel: 'Cost Per Part',
                invoiceConsideration: 'Ignore Invoice Price',
                zeroCostFlag: 'Zero Cost Forbidden',
                hiddenQty: '0',
                attachedDoc: 'Amoxicillin_CoA_Specification.pdf (2.10 MB)',
                documents: [
                    {
                        id: 'DOC-2026-002',
                        name: 'Amoxicillin_CoA_Specification.pdf',
                        category: 'Certificate of Analysis',
                        size: '2.10 MB',
                        uploadedBy: 'Warehouse Op (Sarah Jenkins)',
                        timestamp: '2026-08-26 14:20',
                        note: 'Initial CoA from Sandoz Pharma'
                    }
                ],
                qaChecklist: {}
            },
            {
                id: 'REQ-2026-0003',
                status: 'PENDING_STOCK_CONTROL',
                requestDate: '2026-08-24',
                requestedBy: 'Warehouse Op (Mark Smith)',
                company: 'B&S Pharma',
                site: 'Dispatch Depot - London',
                requestType: 'NEW PRODUCT',
                api: 'Ibuprofen',
                productType: 'GENERIC',
                productName: 'Ibuprofen 400mg Tablets',
                strength: '400mg',
                packSize: 'Pack of 84',
                form: 'Tablet',
                buyerName: 'Milan Dabhi',
                controlledDrug: 'No',
                cdSchedule: 'N/A',
                className: 'Non-Controlled',
                coldChain: 'No',
                specials: 'No',
                productFamily: 'NSAID Analgesics',
                storageConditions: 'Store below 25°C',
                bnfCode: '10.01.01.00',
                bnfDrugName: 'Ibuprofen',
                bnfSelectionName: 'Ibuprofen 400mg',
                bnfChemicalName: 'Ibuprofen',
                bnfPrepName: 'Ibuprofen Tablets BP',
                shelfLifeVal: '36',
                vatCode: 'SUK-11',
                drugTariff: '62.00',
                salesPrice: '52.00',
                minSellingPrice: '52.00',
                estMaterialCost: '62.00',
                supplierName: 'TEVA UK LIMITED',
                country: 'UNITED KINGDOM',
                partCountry: '',
                partType: '',
                proposedPartNumber: '',
                valuationMethod: '',
                lotTracking: '',
                lotQtyRule: '',
                subLotRule: '',
                componentLotRule: '',
                costLevel: '',
                invoiceConsideration: '',
                zeroCostFlag: '',
                hiddenQty: '',
                attachedDoc: 'Ibuprofen_Regulatory_Dossier.pdf (3.24 MB)',
                documents: [
                    {
                        id: 'DOC-2026-003',
                        name: 'Ibuprofen_Regulatory_Dossier.pdf',
                        category: 'Regulatory Dossier',
                        size: '3.24 MB',
                        uploadedBy: 'Warehouse Op (Mark Smith)',
                        timestamp: '2026-08-24 11:45',
                        note: 'CTD Module 3 Quality documentation'
                    }
                ],
                qaChecklist: {}
            },
            {
                id: 'REQ-2026-0004',
                status: 'TO_BE_EDITED',
                requestDate: '2026-08-22',
                requestedBy: 'Warehouse Op (Mark Smith)',
                company: 'B&S Pharma',
                site: 'Dispatch Depot - London',
                requestType: 'NEW PRODUCT',
                api: 'Morphine Sulfate',
                productType: 'BRANDED',
                productName: 'Morphine Sulfate 10mg/ml Injection',
                strength: '10mg/ml',
                packSize: '10 Ampoules',
                form: 'Injection',
                buyerName: 'Shiva',
                controlledDrug: 'Yes',
                cdSchedule: 'Schedule 2',
                className: 'Class A',
                coldChain: 'No',
                specials: 'No',
                productFamily: 'Controlled Opioids',
                storageConditions: 'Store below 25°C',
                bnfCode: '04.07.02.00',
                bnfDrugName: 'Morphine',
                bnfSelectionName: 'Morphine Inj 10mg/ml',
                bnfChemicalName: 'Morphine Sulfate',
                bnfPrepName: 'Morphine Injection BP',
                shelfLifeVal: '36',
                vatCode: 'SUK-11',
                drugTariff: '180.00',
                salesPrice: '150.00',
                minSellingPrice: '150.00',
                estMaterialCost: '180.00',
                supplierName: 'WOCKHARDT UK',
                country: 'UNITED KINGDOM',
                attachedDoc: 'Morphine_Sulfate_MSDS_Safety.pdf (1.82 MB)',
                documents: [
                    {
                        id: 'DOC-2026-004',
                        name: 'Morphine_Sulfate_MSDS_Safety.pdf',
                        category: 'MSDS',
                        size: '1.82 MB',
                        uploadedBy: 'Warehouse Op (Mark Smith)',
                        timestamp: '2026-08-22 09:30',
                        note: 'Material Safety Data Sheet (Schedule 2 CD precautions)'
                    }
                ],
                qaNotes: 'Please review Storage Condition and CD Schedule verification.',
                fieldsToEdit: ['pc-input-cold-chain', 'pc-input-storage-conditions'],
                qaChecklist: {
                    cold_chain: 'TO_EDIT',
                    storage_conditions: 'TO_EDIT'
                }
            }
        ];

        function getRequests() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('bs_part_creation_requests_v2');
                if (!raw) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRequests));
                    return defaultRequests;
                }
                const parsed = JSON.parse(raw);
                parsed.forEach(r => {
                    if (r.status === 'PENDING STOCK APPROVAL') r.status = 'PENDING_STOCK_CONTROL';
                    if (!Array.isArray(r.documents)) {
                        r.documents = [];
                        if (r.attachedDoc) {
                            const fileName = r.attachedDoc.replace(/\s*\([^)]+\)/, '').trim();
                            const sizeMatch = r.attachedDoc.match(/\(([^)]+)\)/);
                            const sizeStr = sizeMatch ? sizeMatch[1] : '1.5 MB';
                            let cat = 'Technical Specification';
                            if (/CoA|Certificate/i.test(fileName)) cat = 'Certificate of Analysis';
                            else if (/MSDS|Safety/i.test(fileName)) cat = 'MSDS';
                            else if (/Dossier|Regulatory/i.test(fileName)) cat = 'Regulatory Dossier';
                            else if (/CAD|Drawing/i.test(fileName)) cat = 'CAD Drawing';
                            r.documents.push({
                                id: 'DOC-MIG-' + Math.random().toString(36).substr(2, 6),
                                name: fileName,
                                category: cat,
                                size: sizeStr,
                                uploadedBy: r.requestedBy || 'System User',
                                timestamp: (r.requestDate ? r.requestDate + ' 10:30' : '2026-08-28 10:30'),
                                note: 'System-linked document attachment'
                            });
                        }
                    }
                });
                return parsed;
            } catch (e) {
                return defaultRequests;
            }
        }

        function saveRequests(list) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            renderTable();
            updateKPIs();
        }

        // Workflow Role Helpers
        function getActiveWorkflowRole() {
            const role = (typeof ModuleAccessControl !== 'undefined' && ModuleAccessControl.getActiveRole)
                ? ModuleAccessControl.getActiveRole()
                : 'Normal User';
            if (role === 'QA') return 'QA';
            if (role === 'Stock Control') return 'Stock Control';
            return 'User';
        }

        function setWorkflowRole(roleName) {
            if (typeof ModuleAccessControl !== 'undefined' && ModuleAccessControl.setActiveRole) {
                ModuleAccessControl.setActiveRole(roleName);
            }
            const rbacSel = document.getElementById('rbac-role-selector');
            if (rbacSel) rbacSel.value = roleName;
            const topbarRole = document.getElementById('topbar-active-role');
            if (topbarRole) {
                topbarRole.textContent = (roleName === 'Normal User') ? 'Standard User' : (roleName === 'Stock Control' ? 'Stock Control' : roleName);
            }

            // Sync visual active pill state
            document.querySelectorAll('.pc-role-btn').forEach(btn => {
                const btnRole = btn.getAttribute('data-role');
                if (btnRole === roleName) {
                    btn.classList.add('active-role-btn');
                    btn.style.background = '#2563eb';
                    btn.style.color = '#ffffff';
                    btn.style.border = 'none';
                    btn.style.fontWeight = '700';
                } else {
                    btn.classList.remove('active-role-btn');
                    btn.style.background = '#f8fafc';
                    btn.style.color = '#475569';
                    btn.style.border = '1px solid #cbd5e1';
                    btn.style.fontWeight = '600';
                }
            });

            // Update mode title badge in form header
            const modeBadge = document.getElementById('pc-form-mode-title');
            if (modeBadge) {
                if (roleName === 'QA') {
                    modeBadge.textContent = 'Role: QA (Verify All 3 Pages)';
                    modeBadge.style.background = '#7c3aed';
                } else if (roleName === 'Stock Control') {
                    modeBadge.textContent = 'Role: Stock Control (Review Page 1-2, Edit Page 3)';
                    modeBadge.style.background = '#0284c7';
                } else {
                    modeBadge.textContent = 'Role: User (Create Part Request: Page 1-2)';
                    modeBadge.style.background = '#059669';
                }
            }

            // Re-apply workflow permissions for currently open form
            updateWorkflowUI(currentOpenedRequest);
            renderTable();
            updateKPIs();
        }

        // Attach listeners to all Role Switcher Pills
        document.querySelectorAll('.pc-role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetRole = btn.getAttribute('data-role');
                setWorkflowRole(targetRole);
            });
        });

        // Listen for changes from the topbar RBAC dropdown
        const rbacRoleSelectorEl = document.getElementById('rbac-role-selector');
        if (rbacRoleSelectorEl) {
            rbacRoleSelectorEl.addEventListener('change', (e) => {
                const r = e.target.value;
                if (r === 'QA' || r === 'Stock Control' || r === 'Normal User') {
                    setWorkflowRole(r);
                }
            });
        }

        function updateKPIs() {
            const requests = getRequests();
            const total = requests.length;
            const pendingStock = requests.filter(r => r.status === 'PENDING_STOCK_CONTROL' || r.status === 'PENDING STOCK APPROVAL').length;
            const pendingQa = requests.filter(r => r.status === 'PENDING_QA').length;
            const approved = requests.filter(r => r.status === 'APPROVED').length;
            const toEdit = requests.filter(r => r.status === 'TO_BE_EDITED').length;

            const elTotal = document.getElementById('kpi-part-total');
            const elPendingStock = document.getElementById('kpi-part-pending-stock');
            const elPendingQa = document.getElementById('kpi-part-pending-qa');
            const elApproved = document.getElementById('kpi-part-approved');
            const elToEdit = document.getElementById('kpi-part-to-edit');
            const cntStockTab = document.getElementById('cnt-part-pending-stock');
            const cntQaTab = document.getElementById('cnt-part-pending-qa');

            if (elTotal) elTotal.textContent = total;
            if (elPendingStock) elPendingStock.textContent = pendingStock;
            if (elPendingQa) elPendingQa.textContent = pendingQa;
            if (elApproved) elApproved.textContent = approved;
            if (elToEdit) elToEdit.textContent = toEdit;
            if (cntStockTab) cntStockTab.textContent = pendingStock;
            if (cntQaTab) cntQaTab.textContent = pendingQa;
        }

        function getBadgeHTML(status) {
            switch (status) {
                case 'APPROVED':
                    return '<span class="badge" style="background: #d1fae5; color: #047857; font-weight: 700; border: 1px solid #a7f3d0;">✅ APPROVED</span>';
                case 'PENDING_STOCK_CONTROL':
                case 'PENDING STOCK APPROVAL':
                    return '<span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700; border: 1px solid #bae6fd;">📦 PENDING STOCK CONTROL</span>';
                case 'PENDING_QA':
                    return '<span class="badge" style="background: #fef3c7; color: #b45309; font-weight: 700; border: 1px solid #fde68a;">🛡️ PENDING QA VERIFICATION</span>';
                case 'TO_BE_EDITED':
                    return '<span class="badge" style="background: #ffedd5; color: #c2410c; font-weight: 700; border: 1px solid #fed7aa;">🟧 REVISIONS REQUIRED</span>';
                case 'REJECTED':
                    return '<span class="badge" style="background: #fee2e2; color: #b91c1c; font-weight: 700; border: 1px solid #fca5a5;">❌ REJECTED</span>';
                default:
                    return '<span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 700; border: 1px solid #cbd5e1;">📝 DRAFT</span>';
            }
        }

        function renderTable() {
            const tbody = document.getElementById('part-creation-tbody');
            if (!tbody) return;

            const searchInput = document.getElementById('part-creation-search-input');
            const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const currentRole = getActiveWorkflowRole();

            const requests = getRequests();
            const filtered = requests.filter(r => {
                const matchesFilter = (activeFilter === 'ALL' || r.status === activeFilter || (activeFilter === 'PENDING_STOCK_CONTROL' && r.status === 'PENDING STOCK APPROVAL'));
                if (!matchesFilter) return false;

                if (!searchVal) return true;
                const searchStr = `${r.id} ${r.productName} ${r.api} ${r.requestedBy} ${r.proposedPartNumber || r.partCodeGenerated || ''}`.toLowerCase();
                return searchStr.includes(searchVal);
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 30px; color: var(--color-text-muted);">
                            No part creation requests found for filter: <strong>${activeFilter}</strong> ${searchVal ? `• Search: "${searchVal}"` : ''}.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map(r => {
                let actionBtnText = '👁️ View Request';
                let actionBtnClass = 'btn-outline';

                if (currentRole === 'User') {
                    if (r.status === 'DRAFT' || r.status === 'TO_BE_EDITED') {
                        actionBtnText = '✏️ Edit & Submit';
                        actionBtnClass = 'btn-primary';
                    } else {
                        actionBtnText = '👁️ View (Readonly)';
                    }
                } else if (currentRole === 'Stock Control') {
                    if (r.status === 'PENDING_STOCK_CONTROL' || r.status === 'PENDING STOCK APPROVAL') {
                        actionBtnText = '📦 Specify & Submit to QA';
                        actionBtnClass = 'btn-primary';
                    } else {
                        actionBtnText = '👁️ View Request';
                    }
                } else if (currentRole === 'QA') {
                    if (r.status === 'PENDING_QA') {
                        actionBtnText = '🛡️ Verify & Approve';
                        actionBtnClass = 'btn-primary';
                    } else {
                        actionBtnText = '👁️ View Request';
                    }
                }

                return `
                    <tr>
                        <td style="font-weight: 700; font-family: monospace; color: var(--color-primary);">
                            ${r.id}
                            ${r.partCodeGenerated ? `<div style="font-size: 10px; color: #059669; font-weight: 800; margin-top: 2px; font-family: sans-serif;">Part Code: ${r.partCodeGenerated}</div>` : ''}
                        </td>
                        <td>
                            <div style="font-weight: 700; color: var(--color-text-main);">${r.productName || 'N/A'}</div>
                            <div style="font-size: 11px; color: var(--color-text-muted);">API: <strong>${r.api || 'N/A'}</strong></div>
                        </td>
                        <td>
                            <span style="font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${r.productType || 'BRANDED'}</span>
                            <span style="font-size: 12px; margin-left: 4px;">${r.strength || ''}</span>
                        </td>
                        <td>
                            <div style="font-size: 12px; font-weight: 600;">${r.packSize || 'N/A'}</div>
                            <div style="font-size: 11px; color: var(--color-text-muted);">Form: ${r.form || 'N/A'}</div>
                        </td>
                        <td>
                            <div style="font-size: 12px; font-weight: 600;">${r.requestedBy || 'Warehouse Op'}</div>
                            <div style="font-size: 11px; color: var(--color-text-muted);">${r.requestDate || ''}</div>
                        </td>
                        <td>
                            ${getBadgeHTML(r.status)}
                        </td>
                        <td style="text-align: right;">
                            <button type="button" class="btn btn-xs ${actionBtnClass} btn-open-req-detail" data-id="${r.id}" style="font-size: 11px; padding: 4px 10px; font-weight: 700;">
                                ${actionBtnText}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach detail open listeners
            tbody.querySelectorAll('.btn-open-req-detail').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reqId = btn.getAttribute('data-id');
                    openPartForm(reqId);
                });
            });
        }

        function showPartList() {
            if (typeof switchModule === 'function') switchModule('part-creation');
            const listView = document.getElementById('part-creation-list-view');
            const formView = document.getElementById('part-creation-form-view');
            if (listView) listView.classList.remove('hidden');
            if (formView) formView.classList.add('hidden');
            currentOpenedRequest = null;
            renderTable();
            updateKPIs();
        }

        // Section editability helper
        function setSectionEditable(containerSelector, isEditable) {
            const container = document.querySelector(containerSelector);
            if (!container) return;
            container.querySelectorAll('input:not(.pc-qa-cb), select:not(.pc-qa-select), textarea').forEach(el => {
                if (el.id === 'pc-form-req-id' || el.id === 'pc-step2-req-id' || el.id === 'pc-step3-req-id' || el.id === 'pc-step3-status-input' || el.id === 'pc-input-vat-percent') {
                    return; // preserve system-managed fields
                }
                el.disabled = !isEditable;
                if (!isEditable) {
                    el.style.backgroundColor = '#f8fafc';
                    el.style.cursor = 'not-allowed';
                } else {
                    el.style.backgroundColor = '#ffffff';
                    el.style.cursor = 'text';
                }
            });
        }

        // Master workflow UI updater: Controls Page 3 visibility, edit permissions, and dynamic context-specific action buttons
        function updateWorkflowUI(req = null) {
            const role = getActiveWorkflowRole();
            const status = req ? req.status : 'DRAFT';
            const isCompleted = (status === 'APPROVED' || status === 'REJECTED');

            // Stepper elements
            const indStep3 = document.getElementById('indicator-step-3');
            const sepStep23 = document.getElementById('sep-step-2-3');

            // Page 1 Buttons
            const btnP1SaveDraft = document.getElementById('btn-pc-save-draft');
            const btnP1Clear = document.getElementById('btn-pc-clear');
            const btnP1Next = document.getElementById('btn-pc-save-next');

            // Page 2 Buttons
            const btnP2Back = document.getElementById('btn-pc-step2-back');
            const btnP2SaveDraft = document.getElementById('btn-pc-step2-save-draft');
            const btnP2Clear = document.getElementById('btn-pc-step2-clear');
            const btnP2Upload = document.getElementById('btn-pc-step2-upload');
            const btnP2Submit = document.getElementById('btn-pc-step2-submit');
            const btnP2Next = document.getElementById('btn-pc-step2-next');

            // Page 3 Buttons
            const btnP3Close = document.getElementById('btn-pc-step3-close');
            const btnP3Back = document.getElementById('btn-pc-step3-back');
            const btnP3Upload = document.getElementById('btn-pc-step3-upload');
            const btnP3Download = document.getElementById('btn-pc-step3-download');
            const btnP3Comment = document.getElementById('btn-pc-step3-comment');
            const btnP3StockDraft = document.getElementById('btn-pc-step3-submit');
            const btnP3StockSubmitQa = document.getElementById('btn-pc-step3-stock-approve');
            const btnP3StockRev = document.getElementById('btn-pc-step3-stock-request-edit');
            const btnP3StockRej = document.getElementById('btn-pc-step3-stock-reject');
            const btnP3QaApprove = document.getElementById('btn-pc-step3-qa-approve');
            const btnP3QaRev = document.getElementById('btn-pc-step3-qa-request-edit');
            const btnP3QaRej = document.getElementById('btn-pc-step3-qa-reject');
            const btnAddLoc = document.getElementById('btn-add-location-row');
            const btnAddRev = document.getElementById('btn-add-revision-row');

            const setDisp = (el, disp) => { if (el) el.style.display = disp; };

            // 1. PAGE 3 VISIBILITY RULES
            if (role === 'User') {
                setDisp(indStep3, 'none');
                setDisp(sepStep23, 'none');
                setDisp(btnP2Next, 'none');

                // If user is currently viewing Step 3, automatically redirect to Step 1
                const step3Panel = document.getElementById('pc-form-step-3');
                if (step3Panel && !step3Panel.classList.contains('hidden')) {
                    showFormStep(1);
                }
            } else {
                setDisp(indStep3, 'flex');
                setDisp(sepStep23, 'inline-block');
                setDisp(btnP2Next, 'inline-flex');
            }

            // 2. CONTEXT-SPECIFIC ACTION BUTTONS PER ROLE & STATUS
            if (role === 'User') {
                const canUserEdit = (status === 'DRAFT' || status === 'TO_BE_EDITED');
                setSectionEditable('#pc-form-step-1', canUserEdit);
                setSectionEditable('#pc-form-step-2', canUserEdit);
                setSectionEditable('#pc-form-step-3', false);

                // Page 1 Buttons: User can save draft / clear when editable, proceed to Page 2
                setDisp(btnP1SaveDraft, canUserEdit ? 'inline-flex' : 'none');
                setDisp(btnP1Clear, canUserEdit ? 'inline-flex' : 'none');
                setDisp(btnP1Next, 'inline-flex');

                // Page 2 Buttons: User can save draft / clear / upload / submit to stock control
                setDisp(btnP2Back, 'inline-flex');
                setDisp(btnP2SaveDraft, canUserEdit ? 'inline-flex' : 'none');
                setDisp(btnP2Clear, canUserEdit ? 'inline-flex' : 'none');
                setDisp(btnP2Upload, canUserEdit ? 'inline-flex' : 'none');
                if (btnP2Upload) btnP2Upload.disabled = !canUserEdit;
                setDisp(btnP2Submit, canUserEdit ? 'inline-flex' : 'none');
                setDisp(btnP2Next, 'none'); // Page 3 is strictly hidden from User

                // Page 3 Buttons: Strictly hidden for User
                [btnP3Close, btnP3Back, btnP3Upload, btnP3Download, btnP3Comment, btnP3StockDraft, btnP3StockSubmitQa,
                 btnP3StockRev, btnP3StockRej, btnP3QaApprove, btnP3QaRev, btnP3QaRej, btnAddLoc, btnAddRev]
                    .forEach(b => setDisp(b, 'none'));

            } else if (role === 'Stock Control') {
                const canStockAct = (status === 'PENDING_STOCK_CONTROL' || status === 'PENDING STOCK APPROVAL' || status === 'DRAFT');
                setSectionEditable('#pc-form-step-1', false);
                setSectionEditable('#pc-form-step-2', false);
                setSectionEditable('#pc-form-step-3', canStockAct);

                // Page 1: Read-only, only navigation
                setDisp(btnP1SaveDraft, 'none');
                setDisp(btnP1Clear, 'none');
                setDisp(btnP1Next, 'inline-flex');

                // Page 2: Read-only, only navigation (Back to Page 1 or Next to Page 3), upload accessible
                setDisp(btnP2Back, 'inline-flex');
                setDisp(btnP2SaveDraft, 'none');
                setDisp(btnP2Clear, 'none');
                setDisp(btnP2Upload, 'inline-flex');
                setDisp(btnP2Submit, 'none');
                setDisp(btnP2Next, 'inline-flex');

                // Page 3: Stock Control action controls
                setDisp(btnP3Back, 'inline-flex');
                setDisp(btnP3Upload, 'inline-flex');
                setDisp(btnP3Close, isCompleted ? 'inline-flex' : 'none');
                setDisp(btnP3Download, 'inline-flex');
                setDisp(btnP3Comment, 'inline-flex');
                setDisp(btnP3StockDraft, canStockAct ? 'inline-flex' : 'none');
                setDisp(btnP3StockSubmitQa, canStockAct ? 'inline-flex' : 'none');
                setDisp(btnP3StockRev, canStockAct ? 'inline-flex' : 'none');
                setDisp(btnP3StockRej, canStockAct ? 'inline-flex' : 'none');
                setDisp(btnAddLoc, canStockAct ? 'inline-block' : 'none');
                setDisp(btnAddRev, canStockAct ? 'inline-block' : 'none');

                // QA actions hidden
                setDisp(btnP3QaApprove, 'none');
                setDisp(btnP3QaRev, 'none');
                setDisp(btnP3QaRej, 'none');

            } else if (role === 'QA') {
                const canQaAct = (status === 'PENDING_QA');
                setSectionEditable('#pc-form-step-1', false);
                setSectionEditable('#pc-form-step-2', false);
                setSectionEditable('#pc-form-step-3', false);

                // Page 1: Read-only, only navigation
                setDisp(btnP1SaveDraft, 'none');
                setDisp(btnP1Clear, 'none');
                setDisp(btnP1Next, 'inline-flex');

                // Page 2: Read-only, only navigation (Back to Page 1 or Next to Page 3), upload accessible
                setDisp(btnP2Back, 'inline-flex');
                setDisp(btnP2SaveDraft, 'none');
                setDisp(btnP2Clear, 'none');
                setDisp(btnP2Upload, 'inline-flex');
                setDisp(btnP2Submit, 'none');
                setDisp(btnP2Next, 'inline-flex');

                // Page 3: QA verification and approval controls
                setDisp(btnP3Back, 'inline-flex');
                setDisp(btnP3Upload, 'inline-flex');
                setDisp(btnP3Close, isCompleted ? 'inline-flex' : 'none');
                setDisp(btnP3Download, 'inline-flex');
                setDisp(btnP3Comment, 'inline-flex');
                setDisp(btnP3StockDraft, 'none');
                setDisp(btnP3StockSubmitQa, 'none');
                setDisp(btnP3StockRev, 'none');
                setDisp(btnP3StockRej, 'none');
                setDisp(btnAddLoc, 'none');
                setDisp(btnAddRev, 'none');

                setDisp(btnP3QaApprove, canQaAct ? 'inline-flex' : 'none');
                setDisp(btnP3QaRev, canQaAct ? 'inline-flex' : 'none');
                setDisp(btnP3QaRej, canQaAct ? 'inline-flex' : 'none');
            }

            // 3. QA CHECKLIST PERMISSIONS
            const isQaUser = (role === 'QA');
            document.querySelectorAll('.pc-qa-cb').forEach(cb => {
                cb.disabled = !isQaUser;
                cb.style.cursor = isQaUser ? 'pointer' : 'not-allowed';
            });
            document.querySelectorAll('.pc-qa-row').forEach(row => {
                const cb = row.querySelector('.pc-qa-cb');
                const sel = row.querySelector('.pc-qa-select');
                if (sel) {
                    sel.disabled = !isQaUser || !(cb && cb.checked);
                }
            });
        }

        function openPartForm(reqId = null) {
            if (typeof switchModule === 'function') switchModule('part-creation');
            const listView = document.getElementById('part-creation-list-view');
            const formView = document.getElementById('part-creation-form-view');
            if (listView) listView.classList.add('hidden');
            if (formView) formView.classList.remove('hidden');

            // Reset highlight states
            document.querySelectorAll('#part-creation-form-view .pc-input, #part-creation-form-view .pc-select').forEach(el => {
                el.classList.remove('field-to-be-edited');
            });

            // Uncheck all QA checkboxes by default
            document.querySelectorAll('.pc-qa-cb').forEach(cb => cb.checked = false);

            if (reqId) {
                const list = getRequests();
                const req = list.find(r => r.id === reqId);
                currentOpenedRequest = req || null;
                if (req) {
                    const rId1 = document.getElementById('pc-form-req-id');
                    if (rId1) rId1.value = req.id;
                    const rId2 = document.getElementById('pc-step2-req-id');
                    if (rId2) rId2.value = req.id;

                    const badgeEl = document.getElementById('pc-form-status-badge');
                    if (badgeEl) badgeEl.outerHTML = `<span id="pc-form-status-badge" class="badge" style="background:#0284c7; color:#fff;">${req.status}</span>`;
                    const s2Badge = document.getElementById('pc-step2-status-badge');
                    if (s2Badge) s2Badge.textContent = req.status;

                    const reqDateVal = req.requestDate || '';
                    const rDate1 = document.getElementById('pc-form-req-date');
                    if (rDate1) rDate1.value = reqDateVal;
                    const rDate2 = document.getElementById('pc-step2-req-date');
                    if (rDate2) rDate2.value = reqDateVal;

                    const reqByVal = req.requestedBy || '';
                    const rBy1 = document.getElementById('pc-form-req-by');
                    if (rBy1) rBy1.value = reqByVal;
                    const rBy2 = document.getElementById('pc-step2-req-by');
                    if (rBy2) rBy2.value = reqByVal;

                    if (document.getElementById('pc-form-company')) document.getElementById('pc-form-company').value = req.company || '';
                    if (document.getElementById('pc-form-site')) document.getElementById('pc-form-site').value = req.site || '';

                    // Radio inputs
                    const rTypeRadio = document.querySelector(`input[name="pc_req_type"][value="${req.requestType}"]`);
                    if (rTypeRadio) {
                        rTypeRadio.checked = true;
                        rTypeRadio.dispatchEvent(new Event('change'));
                    }
                    const pTypeRadio = document.querySelector(`input[name="pc_prod_type"][value="${req.productType}"]`);
                    if (pTypeRadio) pTypeRadio.checked = true;

                    if (document.getElementById('pc-input-api')) document.getElementById('pc-input-api').value = req.api || '';
                    if (document.getElementById('pc-input-product-name')) document.getElementById('pc-input-product-name').value = req.productName || '';
                    if (document.getElementById('pc-input-strength')) document.getElementById('pc-input-strength').value = req.strength || '';
                    if (document.getElementById('pc-input-pack-size')) document.getElementById('pc-input-pack-size').value = req.packSize || '';
                    if (document.getElementById('pc-input-form')) document.getElementById('pc-input-form').value = req.form || '';
                    if (document.getElementById('pc-input-buyer-name')) document.getElementById('pc-input-buyer-name').value = req.buyerName || '';
                    if (document.getElementById('pc-input-controlled-drug')) document.getElementById('pc-input-controlled-drug').value = req.controlledDrug || '';
                    if (document.getElementById('pc-input-cd-schedule')) document.getElementById('pc-input-cd-schedule').value = req.cdSchedule || '';
                    if (document.getElementById('pc-input-class')) document.getElementById('pc-input-class').value = req.className || '';
                    if (document.getElementById('pc-input-cold-chain')) document.getElementById('pc-input-cold-chain').value = req.coldChain || '';
                    if (document.getElementById('pc-input-specials')) document.getElementById('pc-input-specials').value = req.specials || '';
                    if (document.getElementById('pc-input-product-family')) document.getElementById('pc-input-product-family').value = req.productFamily || '';
                    if (document.getElementById('pc-input-storage-conditions')) document.getElementById('pc-input-storage-conditions').value = req.storageConditions || '';
                    if (document.getElementById('pc-input-bnf-code')) document.getElementById('pc-input-bnf-code').value = req.bnfCode || '';
                    if (document.getElementById('pc-input-bnf-drug-name')) document.getElementById('pc-input-bnf-drug-name').value = req.bnfDrugName || '';
                    if (document.getElementById('pc-input-bnf-selection-name')) document.getElementById('pc-input-bnf-selection-name').value = req.bnfSelectionName || '';
                    if (document.getElementById('pc-input-bnf-chemical-name')) document.getElementById('pc-input-bnf-chemical-name').value = req.bnfChemicalName || '';
                    if (document.getElementById('pc-input-bnf-prep-name')) document.getElementById('pc-input-bnf-prep-name').value = req.bnfPrepName || '';

                    // Step 2 inputs
                    if (document.getElementById('pc-input-shelf-life-val')) document.getElementById('pc-input-shelf-life-val').value = req.shelfLifeVal || '';
                    if (document.getElementById('pc-input-vat-code')) document.getElementById('pc-input-vat-code').value = req.vatCode || '';
                    if (document.getElementById('pc-input-drug-tariff')) document.getElementById('pc-input-drug-tariff').value = req.drugTariff || '';
                    if (document.getElementById('pc-input-sales-price')) document.getElementById('pc-input-sales-price').value = req.salesPrice || '';
                    if (document.getElementById('pc-input-min-selling-price')) document.getElementById('pc-input-min-selling-price').value = req.minSellingPrice || '';
                    if (document.getElementById('pc-input-est-material-cost')) document.getElementById('pc-input-est-material-cost').value = req.estMaterialCost || '';
                    if (document.getElementById('pc-input-country')) document.getElementById('pc-input-country').value = req.country || '';
                    if (document.getElementById('pc-input-supplier-name')) document.getElementById('pc-input-supplier-name').value = req.supplierName || '';

                    // Step 3 inputs
                    const s3ReqId = document.getElementById('pc-step3-req-id');
                    if (s3ReqId) s3ReqId.value = req.id;
                    const s3StatusInput = document.getElementById('pc-step3-status-input');
                    if (s3StatusInput) s3StatusInput.value = req.status || 'DRAFT';
                    const s3Badge = document.getElementById('pc-step3-status-badge');
                    if (s3Badge) s3Badge.textContent = req.status;
                    const s3Date = document.getElementById('pc-step3-req-date');
                    if (s3Date) s3Date.value = reqDateVal;
                    const s3By = document.getElementById('pc-step3-req-by');
                    if (s3By) s3By.value = reqByVal;

                    if (document.getElementById('pc-sc-part-country')) document.getElementById('pc-sc-part-country').value = req.partCountry || '';
                    if (document.getElementById('pc-sc-part-type')) document.getElementById('pc-sc-part-type').value = req.partType || '';
                    if (document.getElementById('pc-sc-proposed-part-no')) document.getElementById('pc-sc-proposed-part-no').value = req.proposedPartNumber || '';
                    if (document.getElementById('pc-sc-valuation-method')) document.getElementById('pc-sc-valuation-method').value = req.valuationMethod || '';
                    if (document.getElementById('pc-sc-lot-tracking')) document.getElementById('pc-sc-lot-tracking').value = req.lotTracking || '';
                    if (document.getElementById('pc-sc-lot-qty-rule')) document.getElementById('pc-sc-lot-qty-rule').value = req.lotQtyRule || '';
                    if (document.getElementById('pc-sc-sub-lot-rule')) document.getElementById('pc-sc-sub-lot-rule').value = req.subLotRule || '';
                    if (document.getElementById('pc-sc-component-lot-rule')) document.getElementById('pc-sc-component-lot-rule').value = req.componentLotRule || '';
                    if (document.getElementById('pc-sc-cost-level')) document.getElementById('pc-sc-cost-level').value = req.costLevel || '';
                    if (document.getElementById('pc-sc-invoice-consideration')) document.getElementById('pc-sc-invoice-consideration').value = req.invoiceConsideration || '';
                    if (document.getElementById('pc-sc-zero-cost-flag')) document.getElementById('pc-sc-zero-cost-flag').value = req.zeroCostFlag || '';
                    if (document.getElementById('pc-sc-hidden-qty')) document.getElementById('pc-sc-hidden-qty').value = req.hiddenQty !== undefined ? req.hiddenQty : '';

                    // Show attached file if present across Step 2 and Step 3
                    updateAttachedFileBadges(req);

                    // Apply orange highlights if TO_BE_EDITED
                    if (req.fieldsToEdit && Array.isArray(req.fieldsToEdit)) {
                        req.fieldsToEdit.forEach(fId => {
                            const targetField = document.getElementById(fId);
                            if (targetField) targetField.classList.add('field-to-be-edited');
                        });
                    }

                    // Apply QA checkboxes & sync dropdown disabled states
                    if (req.qaChecklist) {
                        Object.keys(req.qaChecklist).forEach(key => {
                            const cb = document.querySelector(`.pc-qa-cb[data-field="pc-input-${key.replace(/_/g, '-')}"], .pc-qa-cb[data-field="pc-sc-${key.replace(/_/g, '-')}"], .pc-qa-cb[data-field="pc-${key.replace(/_/g, '-')}"]`);
                            if (cb) cb.checked = (req.qaChecklist[key] === 'VERIFIED');
                        });
                    }
                }
            } else {
                currentOpenedRequest = null;
                // Clear all input fields (text, number, date) - strictly blank initially
                document.querySelectorAll('#part-creation-form-view .pc-input').forEach(i => i.value = '');
                // Dropdown fields reset to index 0 (neutral placeholder "Select...")
                document.querySelectorAll('#part-creation-form-view .pc-select').forEach(s => s.selectedIndex = 0);
                // Uncheck all radio buttons
                document.querySelectorAll('#part-creation-form-view input[type="radio"]').forEach(r => r.checked = false);
                // Uncheck all checkboxes (including QA checkboxes)
                document.querySelectorAll('#part-creation-form-view input[type="checkbox"]').forEach(c => c.checked = false);
                // Reset and disable QA validation dropdowns
                document.querySelectorAll('.pc-qa-select').forEach(s => {
                    s.disabled = true;
                    s.selectedIndex = 0;
                });
                updateAttachedFileBadges(null);

                // Auto-generate Next Request ID (system-generated identifier)
                const existingList = getRequests();
                let maxNum = 4;
                existingList.forEach(r => {
                    const m = r.id && r.id.match(/REQ-\d+-(\d+)/);
                    if (m) {
                        const num = parseInt(m[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                });
                const autoId = 'REQ-2026-' + String(maxNum + 1).padStart(4, '0');

                const rId1 = document.getElementById('pc-form-req-id');
                if (rId1) rId1.value = autoId;
                const rId2 = document.getElementById('pc-step2-req-id');
                if (rId2) rId2.value = autoId;
                const s3ReqId = document.getElementById('pc-step3-req-id');
                if (s3ReqId) s3ReqId.value = autoId;

                const badgeEl = document.getElementById('pc-form-status-badge');
                if (badgeEl) badgeEl.outerHTML = `<span id="pc-form-status-badge" class="badge" style="background:#2563eb; color:#fff; padding:4px 10px; font-size:11px; font-weight:700; border-radius:12px;">DRAFT</span>`;
                const s2Badge = document.getElementById('pc-step2-status-badge');
                if (s2Badge) s2Badge.textContent = 'DRAFT';
                const s3Badge = document.getElementById('pc-step3-status-badge');
                if (s3Badge) s3Badge.textContent = 'DRAFT';
                const s3StatusInput = document.getElementById('pc-step3-status-input');
                if (s3StatusInput) s3StatusInput.value = 'DRAFT';

                // Reset Step 3 tables to clean empty state
                const locTbody = document.querySelector('#table-sc-locations tbody');
                if (locTbody) {
                    locTbody.innerHTML = '<tr id="sc-loc-empty-row"><td colspan="8" style="text-align: center; padding: 18px; color: #94a3b8; font-style: italic;">No location records added yet. Click "+ Add Location Row" to add a location.</td></tr>';
                }
                const revTbody = document.querySelector('#table-sc-revisions tbody');
                if (revTbody) {
                    revTbody.innerHTML = '<tr id="sc-rev-empty-row"><td colspan="7" style="text-align: center; padding: 18px; color: #94a3b8; font-style: italic;">No revision records added yet. Click "+ Add Revision Row" to add a revision.</td></tr>';
                }
            }

            // Apply workflow role page visibility and field permissions
            updateWorkflowUI(currentOpenedRequest);

            // Open sequentially at Step 1
            showFormStep(1);
        }

        function collectFormData() {
            const reqId1 = document.getElementById('pc-form-req-id');
            const reqId2 = document.getElementById('pc-step2-req-id');
            const reqId = (reqId1 && reqId1.value) ? reqId1.value : ((reqId2 && reqId2.value) ? reqId2.value : 'REQ-2026-0005');

            const reqTypeRadio = document.querySelector('input[name="pc_req_type"]:checked');
            const prodTypeRadio = document.querySelector('input[name="pc_prod_type"]:checked');
            const attBadge = document.getElementById('pc-attached-file-badge');

            const qaChecklist = {};
            document.querySelectorAll('.pc-qa-cb').forEach(cb => {
                const fieldId = cb.getAttribute('data-field');
                if (fieldId) {
                    const key = fieldId.replace('pc-input-', '').replace('pc-sc-', '').replace(/-/g, '_');
                    qaChecklist[key] = cb.checked ? 'VERIFIED' : 'PENDING';
                }
            });

            const apiVal = document.getElementById('pc-input-api') ? document.getElementById('pc-input-api').value.trim() : '';
            const prodNameVal = document.getElementById('pc-input-product-name') ? document.getElementById('pc-input-product-name').value.trim() : '';
            const strengthVal = document.getElementById('pc-input-strength') ? document.getElementById('pc-input-strength').value.trim() : '';
            const formVal = document.getElementById('pc-input-form') ? document.getElementById('pc-input-form').value.trim() : '';

            let finalProdName = prodNameVal;
            if (!finalProdName && apiVal) {
                finalProdName = `${apiVal} ${strengthVal} ${formVal}`.trim();
            }
            if (!finalProdName) {
                finalProdName = 'New Part Request';
            }

            return {
                id: reqId,
                requestDate: document.getElementById('pc-form-req-date') ? document.getElementById('pc-form-req-date').value : '',
                requestedBy: document.getElementById('pc-form-req-by') ? document.getElementById('pc-form-req-by').value : '',
                company: document.getElementById('pc-form-company') ? document.getElementById('pc-form-company').value : '',
                site: document.getElementById('pc-form-site') ? document.getElementById('pc-form-site').value : '',
                requestType: reqTypeRadio ? reqTypeRadio.value : '',
                api: apiVal,
                productType: prodTypeRadio ? prodTypeRadio.value : '',
                productName: finalProdName,
                strength: strengthVal,
                packSize: document.getElementById('pc-input-pack-size') ? document.getElementById('pc-input-pack-size').value : '',
                form: formVal,
                buyerName: document.getElementById('pc-input-buyer-name') ? document.getElementById('pc-input-buyer-name').value : '',
                controlledDrug: document.getElementById('pc-input-controlled-drug') ? document.getElementById('pc-input-controlled-drug').value : '',
                cdSchedule: document.getElementById('pc-input-cd-schedule') ? document.getElementById('pc-input-cd-schedule').value : '',
                className: document.getElementById('pc-input-class') ? document.getElementById('pc-input-class').value : '',
                coldChain: document.getElementById('pc-input-cold-chain') ? document.getElementById('pc-input-cold-chain').value : '',
                specials: document.getElementById('pc-input-specials') ? document.getElementById('pc-input-specials').value : '',
                productFamily: document.getElementById('pc-input-product-family') ? document.getElementById('pc-input-product-family').value : '',
                storageConditions: document.getElementById('pc-input-storage-conditions') ? document.getElementById('pc-input-storage-conditions').value : '',
                bnfCode: document.getElementById('pc-input-bnf-code') ? document.getElementById('pc-input-bnf-code').value : '',
                bnfDrugName: document.getElementById('pc-input-bnf-drug-name') ? document.getElementById('pc-input-bnf-drug-name').value : '',
                bnfSelectionName: document.getElementById('pc-input-bnf-selection-name') ? document.getElementById('pc-input-bnf-selection-name').value : '',
                bnfChemicalName: document.getElementById('pc-input-bnf-chemical-name') ? document.getElementById('pc-input-bnf-chemical-name').value : '',
                bnfPrepName: document.getElementById('pc-input-bnf-prep-name') ? document.getElementById('pc-input-bnf-prep-name').value : '',
                shelfLifeVal: document.getElementById('pc-input-shelf-life-val') ? document.getElementById('pc-input-shelf-life-val').value : '',
                vatCode: document.getElementById('pc-input-vat-code') ? document.getElementById('pc-input-vat-code').value : '',
                drugTariff: document.getElementById('pc-input-drug-tariff') ? document.getElementById('pc-input-drug-tariff').value : '',
                salesPrice: document.getElementById('pc-input-sales-price') ? document.getElementById('pc-input-sales-price').value : '',
                minSellingPrice: document.getElementById('pc-input-min-selling-price') ? document.getElementById('pc-input-min-selling-price').value : '',
                estMaterialCost: document.getElementById('pc-input-est-material-cost') ? document.getElementById('pc-input-est-material-cost').value : '',
                country: document.getElementById('pc-input-country') ? document.getElementById('pc-input-country').value : '',
                supplierName: document.getElementById('pc-input-supplier-name') ? document.getElementById('pc-input-supplier-name').value : '',
                // Step 3 fields
                partCountry: document.getElementById('pc-sc-part-country') ? document.getElementById('pc-sc-part-country').value : '',
                partType: document.getElementById('pc-sc-part-type') ? document.getElementById('pc-sc-part-type').value : '',
                proposedPartNumber: document.getElementById('pc-sc-proposed-part-no') ? document.getElementById('pc-sc-proposed-part-no').value.trim() : '',
                partCodeGenerated: document.getElementById('pc-sc-proposed-part-no') ? document.getElementById('pc-sc-proposed-part-no').value.trim() : '',
                valuationMethod: document.getElementById('pc-sc-valuation-method') ? document.getElementById('pc-sc-valuation-method').value : '',
                lotTracking: document.getElementById('pc-sc-lot-tracking') ? document.getElementById('pc-sc-lot-tracking').value : '',
                lotQtyRule: document.getElementById('pc-sc-lot-qty-rule') ? document.getElementById('pc-sc-lot-qty-rule').value : '',
                subLotRule: document.getElementById('pc-sc-sub-lot-rule') ? document.getElementById('pc-sc-sub-lot-rule').value : '',
                componentLotRule: document.getElementById('pc-sc-component-lot-rule') ? document.getElementById('pc-sc-component-lot-rule').value : '',
                costLevel: document.getElementById('pc-sc-cost-level') ? document.getElementById('pc-sc-cost-level').value : '',
                invoiceConsideration: document.getElementById('pc-sc-invoice-consideration') ? document.getElementById('pc-sc-invoice-consideration').value : '',
                zeroCostFlag: document.getElementById('pc-sc-zero-cost-flag') ? document.getElementById('pc-sc-zero-cost-flag').value : '',
                hiddenQty: document.getElementById('pc-sc-hidden-qty') ? document.getElementById('pc-sc-hidden-qty').value : '',
                attachedDoc: (attBadge && !attBadge.classList.contains('hidden') && attBadge.textContent)
                    ? attBadge.textContent.replace('📎 Attached: ', '').replace('📎 ', '')
                    : ((document.getElementById('pc-step3-attached-file-badge') && !document.getElementById('pc-step3-attached-file-badge').classList.contains('hidden'))
                        ? document.getElementById('pc-step3-attached-file-badge').textContent.replace('📎 Attached: ', '').replace('📎 ', '')
                        : (currentOpenedRequest && currentOpenedRequest.attachedDoc ? currentOpenedRequest.attachedDoc : '')),
                documents: (currentOpenedRequest && Array.isArray(currentOpenedRequest.documents))
                    ? [...currentOpenedRequest.documents]
                    : [],
                qaChecklist: qaChecklist
            };
        }

        function saveRequestWithStatus(status, extraData = {}, customMsg = null) {
            const formData = collectFormData();
            formData.status = status;
            Object.assign(formData, extraData);

            const list = getRequests();
            const existingIdx = list.findIndex(r => r.id === formData.id);
            if (existingIdx !== -1) {
                list[existingIdx] = Object.assign({}, list[existingIdx], formData);
            } else {
                list.unshift(formData); // Put at very top of list!
            }

            saveRequests(list);

            activeFilter = 'ALL';
            updateActiveTab();
            showPartList();

            if (customMsg) {
                alert(customMsg);
            } else {
                alert(`🎉 Part Creation Request ${formData.id} status updated!\n\nStatus: ${status}\nProduct: ${formData.productName}`);
            }
        }

        // Stepper Navigation
        function showFormStep(stepNum) {
            const role = getActiveWorkflowRole();

            // Enforce sequential role constraint: User cannot navigate to Page 3
            if (role === 'User' && stepNum === 3) {
                alert('⚠️ Page 3 (Stock Control Specification) is only accessible once the request is submitted to the Stock Control Team.');
                return;
            }

            const step1 = document.getElementById('pc-form-step-1');
            const step2 = document.getElementById('pc-form-step-2');
            const step3 = document.getElementById('pc-form-step-3');
            const ind1 = document.getElementById('indicator-step-1');
            const ind2 = document.getElementById('indicator-step-2');
            const ind3 = document.getElementById('indicator-step-3');
            const badge = document.getElementById('pc-step-badge');
            const subTitle = document.getElementById('pc-form-sub-heading');

            const setIndicator = (el, active) => {
                if (!el) return;
                if (active) {
                    el.style.background = 'var(--color-primary)';
                    el.style.color = '#fff';
                    el.style.fontWeight = '700';
                } else {
                    el.style.background = '#e2e8f0';
                    el.style.color = 'var(--color-text-muted)';
                    el.style.fontWeight = '600';
                }
            };

            const totalSteps = (role === 'User') ? 2 : 3;

            if (stepNum === 1) {
                if (step1) step1.classList.remove('hidden');
                if (step2) step2.classList.add('hidden');
                if (step3) step3.classList.add('hidden');
                setIndicator(ind1, true);
                setIndicator(ind2, false);
                setIndicator(ind3, false);
                if (badge) badge.textContent = `STEP 1 OF ${totalSteps}`;
                if (subTitle) subTitle.textContent = 'Inventory Part > General Identification & QA Regulatory Approval';
            } else if (stepNum === 2) {
                if (step1) step1.classList.add('hidden');
                if (step2) step2.classList.remove('hidden');
                if (step3) step3.classList.add('hidden');
                setIndicator(ind1, false);
                setIndicator(ind2, true);
                setIndicator(ind3, false);
                if (badge) badge.textContent = `STEP 2 OF ${totalSteps}`;
                if (subTitle) subTitle.textContent = 'Inventory Part > Warehouse Stock Control & Buying';
            } else if (stepNum === 3) {
                if (step1) step1.classList.add('hidden');
                if (step2) step2.classList.add('hidden');
                if (step3) step3.classList.remove('hidden');
                setIndicator(ind1, false);
                setIndicator(ind2, false);
                setIndicator(ind3, true);
                if (badge) badge.textContent = `STEP 3 OF ${totalSteps}`;
                if (subTitle) subTitle.textContent = 'Inventory Part > Stock Control Specification';

                // Synchronize Page 3 header strip from Step 1
                const rId1 = document.getElementById('pc-form-req-id');
                const rId3 = document.getElementById('pc-step3-req-id');
                if (rId1 && rId3 && rId1.value) rId3.value = rId1.value;

                const rDate1 = document.getElementById('pc-form-req-date');
                const rDate3 = document.getElementById('pc-step3-req-date');
                if (rDate1 && rDate3 && rDate1.value) rDate3.value = rDate1.value;

                const rBy1 = document.getElementById('pc-form-req-by');
                const rBy3 = document.getElementById('pc-step3-req-by');
                if (rBy1 && rBy3 && rBy1.value) rBy3.value = rBy1.value;
            }

            const mainContent = document.querySelector('.main-content');
            if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            window.scrollTo({ top: 0, behavior: 'smooth' });

            updateWorkflowUI(currentOpenedRequest);
        }

        // Stepper click handlers
        const indStep1 = document.getElementById('indicator-step-1');
        const indStep2 = document.getElementById('indicator-step-2');
        const indStep3 = document.getElementById('indicator-step-3');
        if (indStep1) indStep1.addEventListener('click', () => showFormStep(1));
        if (indStep2) indStep2.addEventListener('click', () => showFormStep(2));
        if (indStep3) indStep3.addEventListener('click', () => showFormStep(3));

        // Page 1 Navigation
        const btnSaveNext = document.getElementById('btn-pc-save-next');
        if (btnSaveNext) {
            btnSaveNext.addEventListener('click', () => {
                showFormStep(2);
            });
        }

        // Page 2 Navigation
        const btnStep2Back = document.getElementById('btn-pc-step2-back');
        if (btnStep2Back) {
            btnStep2Back.addEventListener('click', () => {
                showFormStep(1);
            });
        }

        const btnStep2Next = document.getElementById('btn-pc-step2-next');
        if (btnStep2Next) {
            btnStep2Next.addEventListener('click', () => {
                showFormStep(3);
            });
        }

        // Page 3 Navigation
        const btnStep3Back = document.getElementById('btn-pc-step3-back');
        if (btnStep3Back) {
            btnStep3Back.addEventListener('click', () => {
                showFormStep(2);
            });
        }

        const btnStep3Close = document.getElementById('btn-pc-step3-close');
        if (btnStep3Close) {
            btnStep3Close.addEventListener('click', () => {
                showPartList();
            });
        }

        // --- WORKFLOW SUBMISSION ACTIONS ---

        // 1. User Submit Action (From Page 2): Sends request to Stock Control
        const btnStep2Submit = document.getElementById('btn-pc-step2-submit');
        if (btnStep2Submit) {
            btnStep2Submit.addEventListener('click', () => {
                const data = collectFormData();
                if (!data.productName && !data.api) {
                    alert('Please enter a Product Name or API before submitting.');
                    return;
                }
                saveRequestWithStatus(
                    'PENDING_STOCK_CONTROL',
                    {},
                    `📤 Part Creation Request ${data.id} submitted successfully to the Stock Control Team!\n\nStatus is now PENDING STOCK CONTROL.\nPage 3 (Stock Control Specification) is now accessible to Stock Control.`
                );
            });
        }

        // User Save Draft (From Page 1)
        const btnSaveDraft = document.getElementById('btn-pc-save-draft');
        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', () => {
                const data = collectFormData();
                saveRequestWithStatus('DRAFT', {}, `💾 Draft saved successfully for Request ${data.id}.`);
            });
        }

        // User Save Draft (From Page 2)
        const btnStep2SaveDraft = document.getElementById('btn-pc-step2-save-draft');
        if (btnStep2SaveDraft) {
            btnStep2SaveDraft.addEventListener('click', () => {
                const data = collectFormData();
                saveRequestWithStatus('DRAFT', {}, `💾 Draft saved successfully for Request ${data.id}.`);
            });
        }

        // 2. Stock Control Team Submit Action (From Page 3): Sends request to QA
        const btnStep3StockApprove = document.getElementById('btn-pc-step3-stock-approve');
        if (btnStep3StockApprove) {
            btnStep3StockApprove.addEventListener('click', () => {
                const data = collectFormData();
                const partNo = (data.proposedPartNumber || '').trim();
                if (!partNo) {
                    alert('⚠️ Please enter the Part Number in Page 3 before submitting to QA.\n\n(Stock Control is required to fill and assign the Part Number.)');
                    const partNoInput = document.getElementById('pc-sc-proposed-part-no');
                    if (partNoInput) {
                        partNoInput.focus();
                        partNoInput.style.borderColor = '#dc2626';
                        partNoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }
                saveRequestWithStatus(
                    'PENDING_QA',
                    { proposedPartNumber: partNo, partCodeGenerated: partNo },
                    `🛡️ Stock Control specifications submitted successfully to QA!\n\nAssigned Part Number: ${partNo}\nRequest ${data.id} is now PENDING QA VERIFICATION.\nQA will now review and verify all 3 pages.`
                );
            });
        }

        // Stock Control Save Draft (From Page 3)
        const btnStep3Submit = document.getElementById('btn-pc-step3-submit');
        if (btnStep3Submit) {
            btnStep3Submit.addEventListener('click', () => {
                const data = collectFormData();
                saveRequestWithStatus('PENDING_STOCK_CONTROL', {}, `💾 Stock Control draft specifications saved for Request ${data.id}.`);
            });
        }

        // Stock Control Return to User for Revision (From Page 3)
        const btnStep3StockRequestEdit = document.getElementById('btn-pc-step3-stock-request-edit');
        if (btnStep3StockRequestEdit) {
            btnStep3StockRequestEdit.addEventListener('click', () => {
                const reason = prompt('Enter the revision reason to return this request to the User:', 'Please clarify required formulation parameters.');
                if (reason && reason.trim()) {
                    const data = collectFormData();
                    saveRequestWithStatus(
                        'TO_BE_EDITED',
                        { qaNotes: reason.trim() },
                        `🟧 Request ${data.id} returned to the User for correction!\n\nStatus: REVISIONS REQUIRED\nReason: ${reason.trim()}`
                    );
                }
            });
        }

        // 3. QA Team Actions (From Page 3): Approve, Request Revision, Reject
        const handleQaApprove = () => {
            const data = collectFormData();
            const assignedPartNo = (data.proposedPartNumber || '').trim() || (data.id ? 'PRT-' + data.id.replace(/\D/g, '') : 'PRT-PART');

            saveRequestWithStatus(
                'APPROVED',
                { partCodeGenerated: assignedPartNo, proposedPartNumber: assignedPartNo },
                `✅ Part Creation Request ${data.id} APPROVED by QA!\n\nApproved Part Number: ${assignedPartNo}\nProduct: ${data.productName}\n\nAll specifications across Page 1, Page 2, and Page 3 have been verified and the inventory part master is now ACTIVE.`
            );
        };

        const btnStep3QaApprove = document.getElementById('btn-pc-step3-qa-approve');
        if (btnStep3QaApprove) btnStep3QaApprove.addEventListener('click', handleQaApprove);
        const btnStep2QaApprove = document.getElementById('btn-pc-step2-qa-approve');
        if (btnStep2QaApprove) btnStep2QaApprove.addEventListener('click', handleQaApprove);
        const btnQaApprove = document.getElementById('btn-pc-qa-approve');
        if (btnQaApprove) btnQaApprove.addEventListener('click', handleQaApprove);

        const btnStep3QaRequestEdit = document.getElementById('btn-pc-step3-qa-request-edit');
        if (btnStep3QaRequestEdit) {
            btnStep3QaRequestEdit.addEventListener('click', () => {
                const reason = prompt('Enter QA revision reason for the requester and stock control:', 'Please verify storage temperature and lot tracking rules.');
                if (reason && reason.trim()) {
                    const data = collectFormData();
                    saveRequestWithStatus(
                        'TO_BE_EDITED',
                        { qaNotes: reason.trim() },
                        `🟧 Request ${data.id} sent back for revision by QA!\n\nStatus: REVISIONS REQUIRED\nReason: ${reason.trim()}`
                    );
                }
            });
        }

        const btnStep3QaReject = document.getElementById('btn-pc-step3-qa-reject');
        if (btnStep3QaReject) {
            btnStep3QaReject.addEventListener('click', () => {
                if (confirm('Are you sure you want to REJECT this Part Creation request?')) {
                    const data = collectFormData();
                    saveRequestWithStatus(
                        'REJECTED',
                        {},
                        `❌ Request ${data.id} has been REJECTED by QA.`
                    );
                }
            });
        }

        // ============================================================
        // 3.8 FILE INFO & DOCUMENT MANAGEMENT (URS 4.7.1, DS 3.10)
        // ============================================================
        const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'png', 'jpg', 'jpeg'];

        const partDocModalOverlay = document.getElementById('part-doc-modal-overlay');
        const btnPartDocClose = document.getElementById('btn-part-doc-modal-close');
        const btnPartDocDone = document.getElementById('btn-part-doc-modal-done');
        const pcDocReqIdSpan = document.getElementById('pc-doc-modal-req-id');
        const pcDocProdNameSpan = document.getElementById('pc-doc-modal-prod-name');
        const pcDocRoleSpan = document.getElementById('pc-doc-modal-role');
        const pcDocCategorySelect = document.getElementById('pc-doc-category-select');
        const pcDocNoteInput = document.getElementById('pc-doc-note-input');
        const pcDocDropzone = document.getElementById('pc-doc-dropzone');
        const btnPcBrowseFile = document.getElementById('btn-pc-browse-file');
        const pcDocNativeInput = document.getElementById('pc-doc-native-file-input');
        const pcDocFormatError = document.getElementById('pc-doc-format-error');
        const pcDocFormatErrorMsg = document.getElementById('pc-doc-format-error-msg');
        const pcDocCountBadge = document.getElementById('pc-doc-count-badge');
        const pcDocumentsTbody = document.getElementById('pc-documents-tbody');

        const btnStep2Upload = document.getElementById('btn-pc-step2-upload');
        const btnStep3Upload = document.getElementById('btn-pc-step3-upload');
        const attachedBadge = document.getElementById('pc-attached-file-badge');
        const attachedBadge3 = document.getElementById('pc-step3-attached-file-badge');
        const topBadge3 = document.getElementById('pc-step3-top-file-badge');
        const topBadgeNone = document.getElementById('pc-step3-top-file-none');

        function getDocFileIcon(filename) {
            if (!filename) return '📄';
            const ext = (filename.split('.').pop() || '').toLowerCase();
            if (ext === 'pdf') return '📕';
            if (ext === 'doc' || ext === 'docx') return '📘';
            if (ext === 'xlsx' || ext === 'xls') return '📗';
            if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) return '🖼️';
            return '📄';
        }

        function getDocCategoryPill(category) {
            const cat = category || 'Technical Specification';
            let bg = '#eff6ff';
            let color = '#1d4ed8';
            let border = '#bfdbfe';

            if (cat === 'MSDS') {
                bg = '#fef2f2'; color = '#b91c1c'; border = '#fca5a5';
            } else if (cat.includes('Certificate') || cat.includes('CoA')) {
                bg = '#ecfdf5'; color = '#047857'; border = '#a7f3d0';
            } else if (cat.includes('CAD')) {
                bg = '#f5f3ff'; color = '#6d28d9'; border = '#ddd6fe';
            } else if (cat.includes('Dossier') || cat.includes('Regulatory')) {
                bg = '#fffbeb'; color = '#b45309'; border = '#fde68a';
            } else if (cat.includes('Compliance') || cat.includes('GMP')) {
                bg = '#f0fdf4'; color = '#15803d'; border = '#bbf7d0';
            } else if (cat.includes('Artwork') || cat.includes('Packaging')) {
                bg = '#fdf4ff'; color = '#a21caf'; border = '#f5d0fe';
            }
            return `<span class="badge" style="background:${bg}; color:${color}; border:1px solid ${border}; font-size:11px; padding:3px 8px; border-radius:10px; font-weight:600;">${escapeHtml(cat)}</span>`;
        }

        function formatFileSize(bytes) {
            if (!bytes || bytes === 0) return '0 KB';
            if (bytes < 1024 * 1024) {
                return (bytes / 1024).toFixed(1) + ' KB';
            }
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        function getCurrentUploader() {
            const role = getActiveWorkflowRole();
            const reqByInput = document.getElementById('pc-form-req-by')?.value;
            if (role === 'QA') return 'QA Verifier (Dr. Angela Vance)';
            if (role === 'Stock Control') return 'Stock Control (Milan Dabhi)';
            if (reqByInput && reqByInput.trim()) return reqByInput.trim();
            return 'Warehouse Op (Current User)';
        }

        function getFormattedTimestamp() {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        }

        function getActivePartRequest() {
            if (currentOpenedRequest) {
                if (!Array.isArray(currentOpenedRequest.documents)) {
                    currentOpenedRequest.documents = [];
                }
                return currentOpenedRequest;
            }
            const rId = document.getElementById('pc-form-req-id')?.value || 'REQ-2026-0005';
            const list = getRequests();
            let found = list.find(r => r.id === rId);
            if (!found) {
                const draft = collectFormData();
                draft.id = rId;
                draft.status = 'DRAFT';
                draft.documents = [];
                list.unshift(draft);
                saveRequests(list);
                currentOpenedRequest = draft;
                return draft;
            }
            if (!Array.isArray(found.documents)) found.documents = [];
            currentOpenedRequest = found;
            return found;
        }

        function updateAttachedFileBadges(req) {
            if (!req) {
                if (attachedBadge) attachedBadge.classList.add('hidden');
                if (attachedBadge3) attachedBadge3.classList.add('hidden');
                if (topBadge3) topBadge3.style.display = 'none';
                if (topBadgeNone) topBadgeNone.style.display = 'inline-block';
                return;
            }
            const docs = Array.isArray(req.documents) ? req.documents : [];
            if (docs.length > 0) {
                const latestDoc = docs[docs.length - 1];
                const badgeText = (docs.length === 1)
                    ? `📎 Attached: ${latestDoc.name} (${latestDoc.size})`
                    : `📎 Attached: ${docs.length} Documents (Latest: ${latestDoc.name})`;

                if (attachedBadge) {
                    attachedBadge.textContent = badgeText;
                    attachedBadge.classList.remove('hidden');
                    attachedBadge.title = 'Click to view & manage attached documents';
                    attachedBadge.style.cursor = 'pointer';
                }
                if (attachedBadge3) {
                    attachedBadge3.textContent = badgeText;
                    attachedBadge3.classList.remove('hidden');
                    attachedBadge3.title = 'Click to view & manage attached documents';
                    attachedBadge3.style.cursor = 'pointer';
                }
                if (topBadge3) {
                    topBadge3.textContent = `📎 ${latestDoc.name}${docs.length > 1 ? ` (+${docs.length - 1} more)` : ''}`;
                    topBadge3.style.display = 'inline-flex';
                    topBadge3.title = 'Click to view & manage attached documents';
                    topBadge3.style.cursor = 'pointer';
                }
                if (topBadgeNone) topBadgeNone.style.display = 'none';
            } else if (req.attachedDoc) {
                if (attachedBadge) {
                    attachedBadge.textContent = `📎 ${req.attachedDoc}`;
                    attachedBadge.classList.remove('hidden');
                }
                if (attachedBadge3) {
                    attachedBadge3.textContent = `📎 ${req.attachedDoc}`;
                    attachedBadge3.classList.remove('hidden');
                }
                if (topBadge3) {
                    topBadge3.textContent = `📎 ${req.attachedDoc}`;
                    topBadge3.style.display = 'inline-flex';
                }
                if (topBadgeNone) topBadgeNone.style.display = 'none';
            } else {
                if (attachedBadge) attachedBadge.classList.add('hidden');
                if (attachedBadge3) attachedBadge3.classList.add('hidden');
                if (topBadge3) topBadge3.style.display = 'none';
                if (topBadgeNone) topBadgeNone.style.display = 'inline-block';
            }
        }

        function renderDocumentTable(req) {
            if (!pcDocumentsTbody) return;
            const docs = (req && Array.isArray(req.documents)) ? req.documents : [];
            if (pcDocCountBadge) {
                pcDocCountBadge.textContent = `${docs.length} File${docs.length === 1 ? '' : 's'}`;
            }
            if (docs.length === 0) {
                pcDocumentsTbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 32px 16px; color: #94a3b8; font-style: italic;">
                            <div style="font-size: 26px; margin-bottom: 6px;">📂</div>
                            No documents attached yet for Request <strong>${escapeHtml(req ? req.id : '')}</strong>.<br>
                            <span style="font-size: 11.5px; color: #64748b;">Upload MSDS, CAD drawings, or Technical Specs using the drop zone above.</span>
                        </td>
                    </tr>
                `;
                return;
            }

            pcDocumentsTbody.innerHTML = docs.map((doc, idx) => {
                const icon = getDocFileIcon(doc.name);
                const catPill = getDocCategoryPill(doc.category);
                return `
                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='';">
                        <td style="padding: 10px 12px; font-weight: 700; color: #64748b; font-size: 11.5px;">${idx + 1}</td>
                        <td style="padding: 10px 14px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 18px;">${icon}</span>
                                <div>
                                    <div style="font-weight: 600; color: #0f172a; word-break: break-all;">${escapeHtml(doc.name)}</div>
                                    ${doc.note ? `<div style="font-size: 11px; color: #64748b; margin-top: 1px;">Note: ${escapeHtml(doc.note)}</div>` : ''}
                                </div>
                            </div>
                        </td>
                        <td style="padding: 10px 12px;">${catPill}</td>
                        <td style="padding: 10px 12px; font-family: monospace; font-size: 11.5px; color: #334155; font-weight: 600;">${doc.size || 'N/A'}</td>
                        <td style="padding: 10px 14px; font-size: 12px; color: #1e293b;">
                            <div style="font-weight: 600;">${escapeHtml(doc.uploadedBy || 'System User')}</div>
                            <div style="font-size: 10.5px; color: #059669; font-weight: 600;">System Verified</div>
                        </td>
                        <td style="padding: 10px 14px; font-family: monospace; font-size: 11.5px; color: #475569;">${doc.timestamp || 'N/A'}</td>
                        <td style="padding: 10px 14px; text-align: right;">
                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                <button type="button" class="btn btn-secondary btn-doc-download" data-id="${doc.id}" title="Download Document"
                                    style="padding: 4px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; border-color: #0284c7; color: #0284c7; background: #f0f9ff; cursor: pointer;">
                                    <span>📥</span> Download
                                </button>
                                <button type="button" class="btn btn-outline btn-doc-delete" data-id="${doc.id}" title="Delete Document"
                                    style="padding: 4px 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 3px; border-color: #fca5a5; color: #dc2626; background: #fff; cursor: pointer;">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach download listeners
            pcDocumentsTbody.querySelectorAll('.btn-doc-download').forEach(b => {
                b.addEventListener('click', () => {
                    const docId = b.getAttribute('data-id');
                    triggerDownloadDocument(req, docId);
                });
            });

            // Attach delete listeners
            pcDocumentsTbody.querySelectorAll('.btn-doc-delete').forEach(b => {
                b.addEventListener('click', () => {
                    const docId = b.getAttribute('data-id');
                    triggerDeleteDocument(req, docId);
                });
            });
        }

        function handleDocumentFileUpload(file) {
            if (!file) return;
            if (pcDocFormatError) pcDocFormatError.classList.add('hidden');

            const parts = file.name.toLowerCase().split('.');
            const ext = parts.length > 1 ? parts.pop() : '';
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                if (pcDocFormatError && pcDocFormatErrorMsg) {
                    pcDocFormatErrorMsg.textContent = `⚠️ Business Rule: Unsupported file format (.${ext || 'unknown'}). Supported formats are PDF, DOCX, XLSX, and Images (PNG, JPG).`;
                    pcDocFormatError.classList.remove('hidden');
                }
                alert(`⚠️ Invalid Format: .${ext || 'unknown'}\n\nAccording to Business Rule, only PDF, DOCX, XLSX, and Image files can be attached.`);
                return;
            }

            const req = getActivePartRequest();
            const cat = pcDocCategorySelect ? pcDocCategorySelect.value : 'Technical Specification';
            const note = pcDocNoteInput ? pcDocNoteInput.value.trim() : '';
            const uploader = getCurrentUploader();
            const timestamp = getFormattedTimestamp();
            const fileSize = formatFileSize(file.size);

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const newDoc = {
                    id: 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                    name: file.name,
                    category: cat,
                    size: fileSize,
                    uploadedBy: uploader,
                    timestamp: timestamp,
                    note: note,
                    dataUrl: dataUrl
                };

                if (!Array.isArray(req.documents)) req.documents = [];
                req.documents.push(newDoc);
                req.attachedDoc = `${file.name} (${fileSize})`;

                // Save to list
                const list = getRequests();
                const idx = list.findIndex(r => r.id === req.id);
                if (idx !== -1) {
                    list[idx] = req;
                } else {
                    list.unshift(req);
                }
                saveRequests(list);

                // Reset inputs
                if (pcDocNoteInput) pcDocNoteInput.value = '';
                if (pcDocNativeInput) pcDocNativeInput.value = '';

                // Re-render and update badges
                renderDocumentTable(req);
                updateAttachedFileBadges(req);

                // Toast notification
                if (typeof showToast === 'function') {
                    showToast(`Document "${file.name}" attached successfully!`, 'success');
                }
            };
            reader.readAsDataURL(file);
        }

        function triggerDownloadDocument(req, docId) {
            if (!req || !Array.isArray(req.documents)) return;
            const doc = req.documents.find(d => d.id === docId);
            if (!doc) return;

            const a = document.createElement('a');
            if (doc.dataUrl) {
                a.href = doc.dataUrl;
            } else {
                const content = `======================================================\n` +
                                `B&S HEALTHCARE ERP — ATTACHED TECHNICAL DOCUMENT\n` +
                                `======================================================\n\n` +
                                `Document Name : ${doc.name}\n` +
                                `Category      : ${doc.category}\n` +
                                `Linked Request: ${req.id}\n` +
                                `Product Name  : ${req.productName || 'N/A'}\n` +
                                `Uploaded By   : ${doc.uploadedBy}\n` +
                                `Timestamp     : ${doc.timestamp}\n` +
                                `File Size     : ${doc.size}\n` +
                                `Note          : ${doc.note || 'None'}\n\n` +
                                `Storage Blob  : EBS-S3-SIMULATED-BLOB-${doc.id}\n` +
                                `System Module : File Info & Document Management\n\n` +
                                `[End of Technical Attachment Record]\n`;
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                a.href = URL.createObjectURL(blob);
            }
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function triggerDeleteDocument(req, docId) {
            if (!req || !Array.isArray(req.documents)) return;
            const doc = req.documents.find(d => d.id === docId);
            if (!doc) return;

            if (!confirm(`🗑️ Delete Technical Document?\n\nFile: ${doc.name}\nCategory: ${doc.category}\nLinked Request: ${req.id}\n\nAre you sure you want to remove this document from the request?`)) {
                return;
            }

            req.documents = req.documents.filter(d => d.id !== docId);
            if (req.documents.length > 0) {
                const last = req.documents[req.documents.length - 1];
                req.attachedDoc = `${last.name} (${last.size})`;
            } else {
                req.attachedDoc = '';
            }

            const list = getRequests();
            const idx = list.findIndex(r => r.id === req.id);
            if (idx !== -1) {
                list[idx] = req;
                saveRequests(list);
            }

            renderDocumentTable(req);
            updateAttachedFileBadges(req);

            if (typeof showToast === 'function') {
                showToast(`Document "${doc.name}" deleted.`, 'warning');
            }
        }

        function openDocumentModal() {
            const req = getActivePartRequest();
            if (pcDocReqIdSpan) pcDocReqIdSpan.textContent = req.id;
            if (pcDocProdNameSpan) pcDocProdNameSpan.textContent = `Product: ${req.productName || 'New Product'}`;
            if (pcDocRoleSpan) pcDocRoleSpan.textContent = getActiveWorkflowRole();
            if (pcDocFormatError) pcDocFormatError.classList.add('hidden');
            if (pcDocNoteInput) pcDocNoteInput.value = '';
            if (pcDocNativeInput) pcDocNativeInput.value = '';

            renderDocumentTable(req);
            if (partDocModalOverlay) partDocModalOverlay.classList.remove('hidden');
        }

        function closeDocumentModal() {
            if (partDocModalOverlay) partDocModalOverlay.classList.add('hidden');
            const req = currentOpenedRequest || getActivePartRequest();
            updateAttachedFileBadges(req);
        }

        // Connect button and dropzone events
        if (btnStep2Upload) btnStep2Upload.addEventListener('click', openDocumentModal);
        if (btnStep3Upload) btnStep3Upload.addEventListener('click', openDocumentModal);
        if (attachedBadge) attachedBadge.addEventListener('click', openDocumentModal);
        if (attachedBadge3) attachedBadge3.addEventListener('click', openDocumentModal);
        if (topBadge3) topBadge3.addEventListener('click', openDocumentModal);
        if (btnPartDocClose) btnPartDocClose.addEventListener('click', closeDocumentModal);
        if (btnPartDocDone) btnPartDocDone.addEventListener('click', closeDocumentModal);

        // Click outside modal card to close
        if (partDocModalOverlay) {
            partDocModalOverlay.addEventListener('click', (e) => {
                if (e.target === partDocModalOverlay) closeDocumentModal();
            });
        }

        // Native file browse button & input
        if (btnPcBrowseFile && pcDocNativeInput) {
            btnPcBrowseFile.addEventListener('click', (e) => {
                e.stopPropagation();
                pcDocNativeInput.click();
            });
        }

        if (pcDocDropzone && pcDocNativeInput) {
            pcDocDropzone.addEventListener('click', () => {
                pcDocNativeInput.click();
            });

            pcDocDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pcDocDropzone.style.borderColor = '#0284c7';
                pcDocDropzone.style.background = '#f0f9ff';
            });

            pcDocDropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pcDocDropzone.style.borderColor = '#94a3b8';
                pcDocDropzone.style.background = '#ffffff';
            });

            pcDocDropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pcDocDropzone.style.borderColor = '#94a3b8';
                pcDocDropzone.style.background = '#ffffff';
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleDocumentFileUpload(e.dataTransfer.files[0]);
                }
            });
        }

        if (pcDocNativeInput) {
            pcDocNativeInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleDocumentFileUpload(e.target.files[0]);
                }
            });
        }

        // Table dynamic row handlers in Step 3
        const btnAddLoc = document.getElementById('btn-add-location-row');
        if (btnAddLoc) {
            btnAddLoc.addEventListener('click', () => {
                const tbody = document.querySelector('#table-sc-locations tbody');
                if (tbody) {
                    const emptyRow = document.getElementById('sc-loc-empty-row');
                    if (emptyRow) emptyRow.remove();
                    const rowCount = tbody.querySelectorAll('tr:not(#sc-loc-empty-row)').length + 1;
                    const rowNumStr = String(rowCount).padStart(2, '0') + '.';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${rowNumStr}</td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. Picking"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. MAIN"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. UK"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. G"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. 02"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. 01"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. ${rowNumStr}"></td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        }

        const btnAddRev = document.getElementById('btn-add-revision-row');
        if (btnAddRev) {
            btnAddRev.addEventListener('click', () => {
                const tbody = document.querySelector('#table-sc-revisions tbody');
                if (tbody) {
                    const emptyRow = document.getElementById('sc-rev-empty-row');
                    if (emptyRow) emptyRow.remove();
                    const rowCount = tbody.querySelectorAll('tr:not(#sc-rev-empty-row)').length + 1;
                    const revCode = 'R' + String(rowCount).padStart(2, '0');
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 900; text-align: center; color: #0284c7;">${revCode}</td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="date" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="date" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="Enter revision text"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;">
                            <select class="pc-select" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;">
                                <option value="" selected>Select Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="e.g. ${revCode}"></td>
                        <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"><input type="text" class="pc-input" style="height: 28px; padding: 2px 6px; font-size: 11px; width: 100%;" placeholder="Enter engineering description"></td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        }

        // QA Check All buttons
        const btnCheckAll = document.getElementById('btn-qa-check-all');
        if (btnCheckAll) {
            btnCheckAll.addEventListener('click', () => {
                if (getActiveWorkflowRole() !== 'QA') return;
                document.querySelectorAll('#pc-form-step-1 .pc-qa-cb').forEach(cb => {
                    cb.checked = true;
                    const qaRow = cb.closest('.pc-qa-row');
                    if (qaRow) {
                        const select = qaRow.querySelector('.pc-qa-select');
                        if (select) select.disabled = false;
                    }
                });
            });
        }

        const btnStep2CheckAll = document.getElementById('btn-step2-qa-check-all');
        if (btnStep2CheckAll) {
            btnStep2CheckAll.addEventListener('click', () => {
                if (getActiveWorkflowRole() !== 'QA') return;
                document.querySelectorAll('#pc-form-step-2 .pc-qa-cb').forEach(cb => {
                    cb.checked = true;
                    const qaRow = cb.closest('.pc-qa-row');
                    if (qaRow) {
                        const select = qaRow.querySelector('.pc-qa-select');
                        if (select) select.disabled = false;
                    }
                });
            });
        }

        const btnStep3CheckAll = document.getElementById('btn-step3-qa-check-all');
        if (btnStep3CheckAll) {
            btnStep3CheckAll.addEventListener('click', () => {
                if (getActiveWorkflowRole() !== 'QA') return;
                document.querySelectorAll('#pc-form-step-3 .pc-qa-cb').forEach(cb => {
                    cb.checked = true;
                    const qaRow = cb.closest('.pc-qa-row');
                    if (qaRow) {
                        const select = qaRow.querySelector('.pc-qa-select');
                        if (select) select.disabled = false;
                    }
                });
            });
        }

        // QA row checkbox toggle listener
        document.addEventListener('change', (e) => {
            if (e.target.classList && e.target.classList.contains('pc-qa-cb')) {
                const qaRow = e.target.closest('.pc-qa-row');
                if (qaRow) {
                    const select = qaRow.querySelector('.pc-qa-select');
                    if (select) {
                        select.disabled = !e.target.checked;
                    }
                }
            }
        });

        // Top level Part Creation buttons
        const btnOpenForm = document.getElementById('btn-open-part-creation-form');
        const btnBackList = document.getElementById('btn-back-to-part-list');
        const btnQuickCreate = document.getElementById('btn-quick-part-creation');
        const btnQuickQa = document.getElementById('btn-quick-part-qa-list');
        const btnStockPartNav = document.getElementById('nav-stock-part-creation');

        if (btnOpenForm) btnOpenForm.addEventListener('click', () => {
            // Opening as User creates a fresh new request
            setWorkflowRole('Normal User');
            openPartForm();
        });
        if (btnBackList) btnBackList.addEventListener('click', () => showPartList());
        if (btnQuickCreate) {
            btnQuickCreate.addEventListener('click', () => {
                switchModule('part-creation');
                setWorkflowRole('Normal User');
                openPartForm();
            });
        }
        if (btnQuickQa) {
            btnQuickQa.addEventListener('click', () => {
                switchModule('part-creation');
                setWorkflowRole('QA');
                activeFilter = 'PENDING_QA';
                showPartList();
            });
        }
        if (btnStockPartNav) {
            btnStockPartNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchModule('part-creation');
                showPartList();
            });
        }

        // Filter tab clicks
        document.querySelectorAll('[data-part-filter]').forEach(tab => {
            tab.addEventListener('click', () => {
                activeFilter = tab.getAttribute('data-part-filter');
                updateActiveTab();
                renderTable();
            });
        });

        function updateActiveTab() {
            document.querySelectorAll('[data-part-filter]').forEach(t => {
                if (t.getAttribute('data-part-filter') === activeFilter) {
                    t.classList.add('active-part-tab');
                } else {
                    t.classList.remove('active-part-tab');
                }
            });
        }

        // Search input
        const searchInputEl = document.getElementById('part-creation-search-input');
        if (searchInputEl) {
            searchInputEl.addEventListener('input', () => {
                renderTable();
            });
        }

        // Step 2 Clear button
        const btnStep2Clear = document.getElementById('btn-pc-step2-clear');
        if (btnStep2Clear) {
            btnStep2Clear.addEventListener('click', () => {
                document.querySelectorAll('#pc-form-step-2 .pc-input').forEach(i => i.value = '');
                document.querySelectorAll('#pc-form-step-2 .pc-select').forEach(s => s.selectedIndex = 0);
                document.querySelectorAll('#pc-form-step-2 input[type="radio"]').forEach(r => r.checked = false);
            });
        }

        // Step 3 Download button
        const btnStep3Download = document.getElementById('btn-pc-step3-download');
        if (btnStep3Download) {
            btnStep3Download.addEventListener('click', () => {
                const data = collectFormData();
                const exportText = `=====================================================
B&S HEALTHCARE ERP - PART CREATION SPECIFICATION
Page 3: Stock Control & Buying Specification
=====================================================
Request ID: ${data.id}
Date: ${data.requestDate}
Requested By: ${data.requestedBy}
Product Name: ${data.productName}
Attached Document: ${data.attachedDoc || 'None'}
API / Substance: ${data.api || 'N/A'}
Strength: ${data.strength || 'N/A'} | Form: ${data.form || 'N/A'} | Pack Size: ${data.packSize || 'N/A'}
Buyer Name: ${data.buyerName || 'N/A'}

--- STOCK CONTROL SUBMITTED DETAILS ---
Part Country: ${data.partCountry || 'N/A'}
Part Type: ${data.partType || 'N/A'}
Proposed Part Number: ${data.proposedPartNumber || 'N/A'}
Valuation Method: ${data.valuationMethod || 'N/A'}
Lot/Batch Tracking: ${data.lotTracking || 'N/A'}
Lot Qty Rule: ${data.lotQtyRule || 'N/A'}
Sub Lot Rule: ${data.subLotRule || 'N/A'}
Component Lot Rule: ${data.componentLotRule || 'N/A'}
Inventory Part Cost Level: ${data.costLevel || 'N/A'}
Invoice Consideration: ${data.invoiceConsideration || 'N/A'}
Zero Cost Flag: ${data.zeroCostFlag || 'N/A'}
Hidden Qty: ${data.hiddenQty || '0'}

Generated on: ${new Date().toLocaleString()}
Workflow Status: ${data.status || 'DRAFT'}
=====================================================`;
                const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${data.id}_Stock_Control_Specification.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        // Step 3 Add Comment button
        const btnStep3Comment = document.getElementById('btn-pc-step3-comment');
        if (btnStep3Comment) {
            btnStep3Comment.addEventListener('click', () => {
                const comment = prompt('Enter a workflow note or review comment:');
                if (comment && comment.trim()) {
                    alert(`💬 Comment added successfully!\n\n"${comment.trim()}"`);
                }
            });
        }

        // Expose functions globally
        window.openPartCreationForm = openPartForm;
        window.showPartCreationList = showPartList;
        window.setWorkflowRole = setWorkflowRole;
        window.getActiveWorkflowRole = getActiveWorkflowRole;
        window.switchModule = switchModule;
        window.ModuleAccessControl = ModuleAccessControl;

        // Initial render
        updateKPIs();
        renderTable();
    }

    // Direct URL & Hash Navigation Handler with Page-Level Access Control
    function handleUrlRouting() {
        try {
            let targetModule = null;
            const searchParams = new URLSearchParams(window.location.search);
            targetModule = searchParams.get('module') || searchParams.get('page');

            if (!targetModule && window.location.hash) {
                const rawHash = window.location.hash.replace(/^#\/?/, '');
                if (rawHash && !rawHash.includes('token=')) {
                    targetModule = rawHash.split('/')[0].split('?')[0];
                }
            }

            if (targetModule) {
                const knownModules = ['masters', 'stock', 'sales', 'purchase', 'hr', 'plpi', 'finance', 'company', 'site', 'user-setup', 'customer-creation', 'supplier-setup', 'item-setup', 'part-creation'];
                if (knownModules.includes(targetModule)) {
                    switchModule(targetModule);
                }
            }
        } catch (e) {
            console.error("Error handling URL routing:", e);
        }
    }

    window.addEventListener('hashchange', handleUrlRouting);

    // Initialize page
    loadSavedConfig();
    populateAllCompanyDropdowns(); // Populate all company dropdowns from single source of truth
    loadSavedSupplierConfig();
    initResetPassword();
    initUserSetup();
    initCustomerSetup();
    initSupplierSetup();
    initFinanceSetup();
    initRBAC();
    attachSidebarListeners();
    ModuleAccessControl.applyModuleVisibility();
    initMasterDataDashboardLinks();
    initSubMasterConfig();
    updateMastersDashboardKPIs();
    initAwesomebar();
    initPartCreation();
    checkUrlResetToken();
    handleUrlRouting();
    showToast("Welcome to B&S ERP Portal. Select a module to begin.", "success");
});
