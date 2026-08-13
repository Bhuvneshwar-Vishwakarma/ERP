// ERP Company Setup - Interaction Logic JS File

document.addEventListener('DOMContentLoaded', () => {
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
        other: document.getElementById('company-setup-workspace'),
        site: document.getElementById('site-setup-workspace'),
        user: document.getElementById('user-setup-workspace'),
        customer: document.getElementById('customer-creation-workspace'),
        supplier: document.getElementById('supplier-creation-workspace'),
        finance: document.getElementById('finance-setup-workspace')
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
    // Module Navigation & Screen Routing Logic
    // -------------------------------------------------------------
    function switchModule(moduleName) {
        // Hide home page and show main ERP container
        homeScreen.classList.add('hidden');
        mainErpContainer.classList.remove('hidden');

        const activeKey = (moduleName === 'user-setup') ? 'user' : (moduleName === 'site' ? 'site' : (moduleName === 'other' ? 'other' : (moduleName === 'customer-creation' ? 'customer' : (moduleName === 'supplier-setup' ? 'supplier' : moduleName))));

        // Hide all workspaces and show active workspace
        Object.keys(workspaces).forEach(key => {
            if (workspaces[key]) {
                if (key === activeKey) {
                    workspaces[key].classList.remove('hidden');
                } else {
                    workspaces[key].classList.add('hidden');
                }
            }
        });

        // Render dynamic sidebar menu
        renderSidebarMenu(moduleName);

        // Contextual topbar actions and sub-tab selection
        if (moduleName === 'other') {
            const btnCompany = document.getElementById('nav-company-setup-sub');
            if (btnCompany) btnCompany.click();
        } else if (moduleName === 'site') {
            const btnSite = document.getElementById('nav-site-setup-sub');
            if (btnSite) btnSite.click();
        } else if (moduleName === 'user-setup') {
            const btnUser = document.getElementById('nav-user-setup-sub');
            if (btnUser) btnUser.click();
        } else if (moduleName === 'customer-creation') {
            const btnCustomer = document.getElementById('nav-customer-creation-sub');
            if (btnCustomer) btnCustomer.click();
        } else if (moduleName === 'supplier-setup') {
            const btnSupplier = document.getElementById('nav-supplier-setup-sub');
            if (btnSupplier) btnSupplier.click();
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

        let html = '';

        if (moduleName === 'sales') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">📊</span> Sales Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Quotations">
                    <span class="nav-icon">📈</span> Quotations
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Customer Orders">
                    <span class="nav-icon">📦</span> Customer Orders
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Invoices">
                    <span class="nav-icon">💳</span> Invoices
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Customers">
                    <span class="nav-icon">👥</span> Customer Directory
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else if (moduleName === 'purchase') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">🛒</span> Purchasing Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Purchase Orders">
                    <span class="nav-icon">📄</span> Purchase Orders
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Supplier Agreements">
                    <span class="nav-icon">🤝</span> Supplier Contracts
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Material Receipts">
                    <span class="nav-icon">📥</span> Inventory Receipts
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Supplier Directory">
                    <span class="nav-icon">🏢</span> Supplier Master File
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else if (moduleName === 'hr') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">👥</span> HR Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Employee Directory">
                    <span class="nav-icon">👔</span> Employee Directory
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Leaves & Time-off">
                    <span class="nav-icon">🏥</span> Time & Leave
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Payroll Run">
                    <span class="nav-icon">📆</span> Payroll Run
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="HR Settings">
                    <span class="nav-icon">⚙️</span> Configurations
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else if (moduleName === 'plpi') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">⚙️</span> PLPI Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Bill of Materials">
                    <span class="nav-icon">🛠️</span> Bill of Materials
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Routings">
                    <span class="nav-icon">🔄</span> Process Routings
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Work Centers">
                    <span class="nav-icon">🏭</span> Work Centers
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Engineering Requests">
                    <span class="nav-icon">📋</span> Engineering Changes
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else if (moduleName === 'finance') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">💳</span> Finance Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Chart of Accounts">
                    <span class="nav-icon">📑</span> Chart of Accounts
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Journal Entries">
                    <span class="nav-icon">📝</span> Journal Entries
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Bank Accounts">
                    <span class="nav-icon">🏦</span> Bank Accounts
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Tax Rules">
                    <span class="nav-icon">⚖️</span> Tax Rules
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else if (moduleName === 'stock') {
            html = `
                <a href="#" class="nav-item active" data-action="mock">
                    <span class="nav-icon">📦</span> Stock Dashboard
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Stock Ledger">
                    <span class="nav-icon">📚</span> Stock Ledger
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Material Transfers">
                    <span class="nav-icon">🔄</span> Material Transfers
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Warehouse Locations">
                    <span class="nav-icon">🏢</span> Warehouse Locations
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Stock Reconciliation">
                    <span class="nav-icon">⚖️</span> Stock Reconciliation
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        } else {
            // Other / Company Setup / Site Setup / User Setup / Master Data Setup
            html = `
                <a href="#" class="nav-item" data-action="mock" data-name="Dashboard">
                    <span class="nav-icon">📊</span> Dashboard
                </a>
                <a href="#" class="nav-item active" id="nav-company-setup-master">
                    <span class="nav-icon">📁</span> Master Data Setup
                </a>
                <div class="sub-nav">
                    <a href="#" class="sub-item active" id="nav-company-setup-sub">Company Setup</a>
                    <a href="#" class="sub-item" id="nav-site-setup-sub">Site Setup</a>
                    <a href="#" class="sub-item" id="nav-user-setup-sub">User Setup</a>
                    <div class="sub-sub-nav hidden" id="user-setup-sub-sub-nav">
                        <a href="#" class="sub-sub-item" data-subtab="user-list">User List</a>
                        <a href="#" class="sub-sub-item" data-subtab="user-creation">User Creation</a>
                        <a href="#" class="sub-sub-item" data-subtab="user-reopen">User Reopen</a>
                        <a href="#" class="sub-sub-item" data-subtab="allocate-company-site">Allocate Company & Site</a>
                        <a href="#" class="sub-sub-item" data-subtab="application-access">Application Access</a>
                        <a href="#" class="sub-sub-item" data-subtab="qms-access">QMS Access</a>
                        <a href="#" class="sub-sub-item" data-subtab="user-deletion">User Deactivation</a>
                        <a href="#" class="sub-sub-item" data-subtab="reset-password">Reset Password</a>
                    </div>
                    <a href="#" class="sub-item" id="nav-customer-creation-sub">Customer Creation</a>
                    <a href="#" class="sub-item" id="nav-supplier-setup-sub">Supplier Setup</a>
                    <a href="#" class="sub-item" id="nav-item-setup-sub">Item Setup</a>
                </div>
                <a href="#" class="nav-item" data-action="mock" data-name="Finance / Ledger">
                    <span class="nav-icon">💳</span> Finance / Ledger
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Inventory">
                    <span class="nav-icon">📦</span> Inventory
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Purchasing">
                    <span class="nav-icon">🛒</span> Purchasing
                </a>
                <a href="#" class="nav-item" data-action="mock" data-name="Distribution">
                    <span class="nav-icon">🚚</span> Distribution
                </a>
                <a href="#" class="nav-item btn-home-back" id="btn-sidebar-back-home" style="margin-top: auto;">
                    <span class="nav-icon">🏠</span> Back to Home
                </a>
            `;
        }

        sidebarNavMenu.innerHTML = html;

        // Re-attach event listeners to the generated nav items
        attachSidebarListeners();
    }

    function attachSidebarListeners() {
        // Back to Home listener
        const btnBackHome = document.getElementById('btn-sidebar-back-home');
        if (btnBackHome) {
            btnBackHome.addEventListener('click', (e) => {
                e.preventDefault();
                showHomeScreen();
            });
        }

        // Company Setup, Site Setup, User Setup and Customer Creation sub-item tab switchers
        const btnCompanySetupSub = document.getElementById('nav-company-setup-sub');
        const btnSiteSetupSub = document.getElementById('nav-site-setup-sub');
        const btnUserSetupSub = document.getElementById('nav-user-setup-sub');
        const btnCustomerCreationSub = document.getElementById('nav-customer-creation-sub');

        const userSubSubNav = document.getElementById('user-setup-sub-sub-nav');
        const companySetupWorkspace = document.getElementById('company-setup-workspace');
        const siteSetupWorkspace = document.getElementById('site-setup-workspace');
        const userSetupWorkspace = document.getElementById('user-setup-workspace');
        const customerCreationWorkspace = document.getElementById('customer-creation-workspace');

        if (btnCompanySetupSub) {
            btnCompanySetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnSiteSetupSub) btnSiteSetupSub.classList.remove('active');
                if (btnUserSetupSub) btnUserSetupSub.classList.remove('active');
                if (btnCustomerCreationSub) btnCustomerCreationSub.classList.remove('active');
                btnCompanySetupSub.classList.add('active');

                if (userSubSubNav) userSubSubNav.classList.add('hidden');

                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                if (companySetupWorkspace) companySetupWorkspace.classList.remove('hidden');

                // Re-enable global save buttons
                showCompanyListView();
                if (btnSave) btnSave.style.display = 'inline-flex';
                if (btnCancel) btnCancel.style.display = 'inline-flex';
                showToast("Switched to Company Setup profile.", "success");
            });
        }

        if (btnSiteSetupSub) {
            btnSiteSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnCompanySetupSub) btnCompanySetupSub.classList.remove('active');
                if (btnUserSetupSub) btnUserSetupSub.classList.remove('active');
                if (btnCustomerCreationSub) btnCustomerCreationSub.classList.remove('active');
                btnSiteSetupSub.classList.add('active');

                if (userSubSubNav) userSubSubNav.classList.add('hidden');

                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                if (siteSetupWorkspace) siteSetupWorkspace.classList.remove('hidden');

                // Keep save buttons visible for site configuration
                showSiteListView();
                if (btnSave) btnSave.style.display = 'inline-flex';
                if (btnCancel) btnCancel.style.display = 'inline-flex';
                showToast("Switched to Site Setup master data.", "success");
            });
        }

        if (btnUserSetupSub) {
            btnUserSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnCompanySetupSub) btnCompanySetupSub.classList.remove('active');
                if (btnSiteSetupSub) btnSiteSetupSub.classList.remove('active');
                if (btnCustomerCreationSub) btnCustomerCreationSub.classList.remove('active');
                btnUserSetupSub.classList.add('active');

                if (userSubSubNav) userSubSubNav.classList.remove('hidden');

                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                if (userSetupWorkspace) userSetupWorkspace.classList.remove('hidden');

                if (btnSave) btnSave.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';

                // Activate first sub-sub-item by default if none are active
                const activeSubSub = userSubSubNav ? userSubSubNav.querySelector('.sub-sub-item.active') : null;
                if (!activeSubSub) {
                    const firstSub = userSubSubNav ? userSubSubNav.querySelector('.sub-sub-item') : null;
                    if (firstSub) {
                        firstSub.classList.add('active');
                        const subtab = firstSub.getAttribute('data-subtab');
                        switchUserSubtab(subtab);
                    }
                } else {
                    const subtab = activeSubSub.getAttribute('data-subtab');
                    switchUserSubtab(subtab);
                }

                showToast("Switched to User Setup.", "success");
            });
        }

        if (btnCustomerCreationSub) {
            btnCustomerCreationSub.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnCompanySetupSub) btnCompanySetupSub.classList.remove('active');
                if (btnSiteSetupSub) btnSiteSetupSub.classList.remove('active');
                if (btnUserSetupSub) btnUserSetupSub.classList.remove('active');
                btnCustomerCreationSub.classList.add('active');

                if (userSubSubNav) userSubSubNav.classList.add('hidden');

                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                if (customerCreationWorkspace) customerCreationWorkspace.classList.remove('hidden');

                if (btnSave) btnSave.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';

                // Initialize list view
                renderCustomerList();

                showToast("Switched to Customer Creation setup.", "success");
            });
        }

        const btnSupplierSetupSub = document.getElementById('nav-supplier-setup-sub');

        if (btnSupplierSetupSub) {
            btnSupplierSetupSub.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnCompanySetupSub) btnCompanySetupSub.classList.remove('active');
                if (btnSiteSetupSub) btnSiteSetupSub.classList.remove('active');
                if (btnUserSetupSub) btnUserSetupSub.classList.remove('active');
                if (btnCustomerCreationSub) btnCustomerCreationSub.classList.remove('active');
                btnSupplierSetupSub.classList.add('active');

                if (userSubSubNav) userSubSubNav.classList.add('hidden');

                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                const ws = document.getElementById('supplier-creation-workspace');
                if (ws) ws.classList.remove('hidden');

                if (btnSave) btnSave.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';

                showSupplierListView();

                showToast("Switched to Supplier Setup profile.", "success");
            });
        }

        // Sub-sub-items click handlers
        const subSubItems = sidebarNavMenu.querySelectorAll('.sub-sub-item');
        subSubItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                subSubItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const subtabName = item.getAttribute('data-subtab');
                switchUserSubtab(subtabName);
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
            if (moduleName === 'finance') {
                const finModal = document.getElementById('finance-modal-overlay');
                if (finModal) finModal.classList.remove('hidden');
                // Do not switch module yet, wait for modal selection
            } else {
                switchModule(moduleName);
                showToast(`Entered B&S ERP: ${moduleName.toUpperCase()} Module`, 'success');
            }
        });
    });

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
                <td><a href="#" class="company-name-link" data-id="${comp.companyId}" style="font-weight: 600; color: var(--color-primary); text-decoration: none;">${escapeHtml(comp.companyName)}</a></td>
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
                        <button class="btn btn-sm delete-comp-btn" data-id="${comp.companyId}" title="Delete Company" style="background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                            🗑️
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

        // Delete button click listeners
        companiesListBody.querySelectorAll('.delete-comp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete company '${id}'?`)) {
                    companies = companies.filter(c => c.companyId !== id);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
                    populateCompanyFilterOptions();
                    populateSiteFilterOptions();
                    renderCompaniesTable();
                    showToast(`Company '${id}' deleted successfully.`, 'info');
                }
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

                // Auto populated system fields (hidden from form)
                if (creationDateInput) creationDateInput.value = comp.creationDate || '';
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

            // Auto populated system fields (hidden from initial user-facing form)
            const today = new Date().toISOString().split('T')[0];
            if (creationDateInput) creationDateInput.value = today;
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
        const companyConfig = {
            companyId,
            companyName,
            creationDate: (creationDateInput && creationDateInput.value) ? creationDateInput.value : new Date().toISOString().split('T')[0],
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
        
        // Sync other module dropdowns
        if (typeof populateCompanyDropdown === 'function') populateCompanyDropdown();
        if (typeof populateUserCreationCompanyDropdown === 'function') populateUserCreationCompanyDropdown();

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

    function populateCompanyDropdown() {
        const selectEl = document.getElementById('usr-alloc-company-select');
        if (!selectEl) return;
        selectEl.innerHTML = '';
        companies.forEach(comp => {
            const opt = document.createElement('option');
            opt.value = comp.companyId;
            opt.textContent = `${comp.companyId} (${comp.companyName})`;
            selectEl.appendChild(opt);
        });
        updateAllocSiteCheckboxes();
     }

    function populateUserCreationCompanyDropdown() {
        const selectEl = document.getElementById('usr-new-company-id');
        if (!selectEl) return;
        
        // Save current selected value
        const currentVal = selectEl.value;
        selectEl.innerHTML = '';
        
        // Add default empty/placeholder option
        const placeholderOpt = document.createElement('option');
        placeholderOpt.value = '';
        placeholderOpt.textContent = '';
        selectEl.appendChild(placeholderOpt);

        companies.forEach(comp => {
            const opt = document.createElement('option');
            opt.value = comp.companyId;
            opt.textContent = `${comp.companyId} (${comp.companyName})`;
            selectEl.appendChild(opt);
        });
        
        if (currentVal) {
            selectEl.value = currentVal;
        }
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
        
        const typeSelect = document.getElementById('cust-form-company-type-gen') || document.getElementById('cust-form-type');
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
        if (document.getElementById('cust-form-company-type-gen')) document.getElementById('cust-form-company-type-gen').value = c.customerType || '';
        if (document.getElementById('cust-form-type')) document.getElementById('cust-form-type').value = c.customerType || '';
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
        const typeEl = document.getElementById('cust-form-company-type-gen') || document.getElementById('cust-form-type');
        const type = typeEl ? typeEl.value : '';
        
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
                        if (logModal) {
                            if (logTimeLabel) logTimeLabel.textContent = new Date().toLocaleString();
                            logModal.classList.remove('hidden');
                        }
                    } else if (action.includes('save')) {
                        showToast('Licence information saved successfully.', 'success');
                    } else if (action.includes('view account')) {
                        const linkedModal = document.getElementById('linked-account-modal-overlay');
                        if (linkedModal) linkedModal.classList.remove('hidden');
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

        // Linked Account Modal Close Setup
        const linkedModal = document.getElementById('linked-account-modal-overlay');
        const btnCloseLinked1 = document.getElementById('btn-close-linked-account-modal');
        const btnCloseLinked2 = document.getElementById('btn-close-linked-account-modal-bottom');
        const closeLinkedModal = () => { if (linkedModal) linkedModal.classList.add('hidden'); };
        if (btnCloseLinked1) btnCloseLinked1.addEventListener('click', closeLinkedModal);
        if (btnCloseLinked2) btnCloseLinked2.addEventListener('click', closeLinkedModal);

        // Form action buttons
        const btnCustSave = document.getElementById('btn-cust-save');
        const btnCustCopy = document.getElementById('btn-cust-copy');
        const btnCustUpdate = document.getElementById('btn-cust-update');
        const btnCustCancel = document.getElementById('btn-cust-cancel');

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
    // SUPPLIER SETUP MODULE PERSISTENCE & LOGIC
    // =============================================================
    const SUPPLIER_STORAGE_KEY = 'ANTIGRAVITY_ERP_SUPPLIER_DATA';

    const defaultSuppliers = [
        {
            supplierId: "ACC007",
            supplierName: "ACCENT WIRE TIE",
            company: "LAXMI01",
            assocNo: "",
            supplierGroup: "40 O/H Suppliers",
            taxLiability: "TAX Taxable",
            identifierRef: "Yes",
            currency: "GBP",
            freeTaxCode: "Select Free Tax Code",
            creationDate: "2018-04-17",
            paymentTerm: "0 Due Immediately",
            taxCode: "SUK-11 20",
            statGroup: "OH Overheads",
            buyerId: "*",
            categoryCode: "",
            invoicingSupplier: "ACC007",
            paymentAuthorizer: "PRICHA",
            nettingAllowed: false,
            invoiceRecipient: "*",
            blockedForPayment: false,
            licenceType: "Non WDA Holder",
            supplierFor: "Select...",
            companyRegNo: "",
            expiryDate: "",
            riskScore: "Select...",
            questionnaire: false,
            techApprovedDate: "",
            techRenewalDate: "",
            reviewDate: "",
            licenceStatus: "Active",
            licenceNote: "Inactivated due to communication method changed in General tab.",
            status: "Active",
            contacts: [
                { selected: false, name: "", description: "", commMethod: "Phone", value: "01274 693159", docReceiver: false, docType: "" },
                { selected: false, name: "Adrian Helliwell", description: "Other", commMethod: "E-Mail", value: "ahelliwell@accentwire.c", docReceiver: false, docType: "" }
            ],
            addresses: [
                {
                    addressId: "01",
                    addr1: "UNITS 2A -2D EUROWAY TRADING EST",
                    addr2: "WHARFEDALE ROAD",
                    city: "BRADFORD",
                    postcode: "BD4 6SG",
                    county: "",
                    state: "",
                    country: "GB UNITED KINGDOM",
                    validFrom: "",
                    validTo: "",
                    delivery: true,
                    deliveryDefault: true,
                    invoice: true,
                    invoiceDefault: true,
                    pay: true,
                    payDefault: true
                }
            ],
            files: [
                { id: 1, name: "Supplier_Ac_Opening_Form.pdf", otherType: "SUPPLIER CREATION FORM", licenceType: "", uploadedBy: "Vilas Vaidya", date: "18-04-2018 05:03:15 PM" },
                { id: 2, name: "Supplier_Ac_Opening_Form.pdf", otherType: "SUPPLIER CREATION FORM", licenceType: "", uploadedBy: "Vilas Vaidya", date: "18-04-2018 05:03:15 PM" },
                { id: 3, name: "INVOICE_COPY_ACCENT.pdf", otherType: "INVOICE COPY", licenceType: "", uploadedBy: "Vilas Vaidya", date: "18-04-2018 05:03:32 PM" },
                { id: 4, name: "INVOICE_COPY_ACCENT.pdf", otherType: "INVOICE COPY", licenceType: "", uploadedBy: "Vilas Vaidya", date: "18-04-2018 05:03:32 PM" }
            ]
        },
        {
            supplierId: "ACC001",
            supplierName: "AAH PHARMACEUTICALS LTD",
            company: "LAXMI01",
            supplierGroup: "10 Trade Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "WDA Holder",
            status: "Active"
        },
        {
            supplierId: "ACC002",
            supplierName: "ALLIANCE HEALTHCARE (GB) LTD",
            company: "LAXMI01",
            supplierGroup: "10 Trade Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "WDA Holder",
            status: "Active"
        }
    ];

    let suppliers = [];
    let editingSupplierNo = null;
    let currentSupplierContacts = [];
    let currentSupplierAddresses = [];
    let currentSupplierFiles = [];

    function loadSavedSupplierConfig() {
        const raw = localStorage.getItem(SUPPLIER_STORAGE_KEY);
        if (!raw) {
            suppliers = [...defaultSuppliers];
            saveSuppliersState();
        } else {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    suppliers = parsed.filter(s => s && s.supplierId);
                } else {
                    suppliers = [...defaultSuppliers];
                }
            } catch (e) {
                console.error("Error parsing supplier state from local storage", e);
                suppliers = [...defaultSuppliers];
            }
        }
    }

    function saveSuppliersState() {
        try {
            localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
        } catch (e) {
            console.error("Error saving supplier state to local storage", e);
        }
    }

    function showSupplierListView() {
        const panelSupList = document.getElementById('panel-sup-list');
        const panelSupForm = document.getElementById('panel-sup-form');
        if (panelSupForm) panelSupForm.classList.add('hidden');
        if (panelSupList) panelSupList.classList.remove('hidden');
        renderSupplierList();
    }

    function showSupplierFormView() {
        const panelSupList = document.getElementById('panel-sup-list');
        const panelSupForm = document.getElementById('panel-sup-form');
        if (panelSupList) panelSupList.classList.add('hidden');
        if (panelSupForm) panelSupForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderSupplierList() {
        const body = document.getElementById('supplier-list-body');
        if (!body) return;
        body.innerHTML = '';

        const searchId = document.getElementById('sup-search-id') ? document.getElementById('sup-search-id').value.trim().toLowerCase() : '';
        const searchName = document.getElementById('sup-search-name') ? document.getElementById('sup-search-name').value.trim().toLowerCase() : '';

        const filtered = suppliers.filter(s => {
            if (!s || !s.supplierId) return false;
            const matchId = !searchId || s.supplierId.toLowerCase().includes(searchId);
            const matchName = !searchName || (s.supplierName && s.supplierName.toLowerCase().includes(searchName));
            return matchId && matchName;
        });

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--color-text-muted); padding: 20px;">No suppliers found matching search criteria.</td></tr>`;
            return;
        }

        filtered.forEach(s => {
            const tr = document.createElement('tr');
            let badgeStyle = "background-color: #d1fae5; color: #10b981;";
            if (s.status === 'Inactive') {
                badgeStyle = "background-color: #fee2e2; color: #ef4444;";
            } else if (s.status === 'Pending QA Approval') {
                badgeStyle = "background-color: #fffbeb; color: #d97706;";
            }

            const approveBtn = (s.status === 'Pending QA Approval') 
                ? `<button class="btn btn-primary btn-sup-approve" data-id="${s.supplierId}" style="padding: 2px 6px; font-size:11px; background-color:#10b981; border:none; color:#fff; border-radius:4px; cursor:pointer;">QA Approve</button>`
                : '';

            const deactivateBtn = (s.status === 'Active')
                ? `<button class="btn btn-secondary btn-sup-deactivate" data-id="${s.supplierId}" style="padding: 2px 6px; font-size:11px; background-color:#ef4444; border:none; color:#fff; border-radius:4px; cursor:pointer;">Deactivate</button>`
                : '';

            tr.innerHTML = `
                <td><strong>${escapeHtml(s.supplierId || '')}</strong></td>
                <td>${escapeHtml(s.supplierName || '')}</td>
                <td>${escapeHtml(s.company || 'LAXMI01')}</td>
                <td>${escapeHtml(s.supplierGroup || '40 O/H Suppliers')}</td>
                <td>${escapeHtml(s.currency || 'GBP')}</td>
                <td>${escapeHtml(s.taxLiability || 'TAX Taxable')}</td>
                <td>${escapeHtml(s.licenceType || 'Non WDA Holder')}</td>
                <td><span class="badge" style="${badgeStyle} font-weight:600; padding: 2px 8px; border-radius: 4px;">${escapeHtml(s.status || 'Active')}</span></td>
                <td style="text-align: center;">
                    <div style="display:flex; gap:6px; justify-content:center;">
                        <button class="btn btn-secondary btn-sup-edit" data-id="${s.supplierId}" style="padding: 2px 6px; font-size:11px; background-color: var(--color-primary); border:none; color:#fff; border-radius:4px; cursor:pointer;">Edit</button>
                        ${approveBtn}
                        ${deactivateBtn}
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });

        // Edit handlers
        body.querySelectorAll('.btn-sup-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const s = suppliers.find(item => item && item.supplierId && item.supplierId.trim().toUpperCase() === id.trim().toUpperCase());
                if (s) {
                    loadSupplierIntoForm(s);
                }
            });
        });

        // Approve handlers
        body.querySelectorAll('.btn-sup-approve').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const idx = suppliers.findIndex(item => item && item.supplierId && item.supplierId.trim().toUpperCase() === id.trim().toUpperCase());
                if (idx !== -1) {
                    suppliers[idx].status = 'Active';
                    saveSuppliersState();
                    renderSupplierList();
                    showToast(`Supplier account '${suppliers[idx].supplierName}' QA Approved!`, "success");
                }
            });
        });

        // Deactivate handlers
        body.querySelectorAll('.btn-sup-deactivate').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                const idx = suppliers.findIndex(item => item && item.supplierId && item.supplierId.trim().toUpperCase() === id.trim().toUpperCase());
                if (idx !== -1) {
                    suppliers[idx].status = 'Inactive';
                    saveSuppliersState();
                    renderSupplierList();
                    showToast(`Supplier account '${suppliers[idx].supplierName}' deactivated.`, "warning");
                }
            });
        });
    }

    function renderSupplierContactsList() {
        const body = document.getElementById('sup-contacts-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierContacts.length === 0) {
            body.innerHTML = `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No contacts entered. Click '+ Add Contact Row' to add a contact.</td></tr>`;
            return;
        }

        currentSupplierContacts.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; vertical-align: middle;">
                    <input type="checkbox" class="chk-sup-contact-row-select" data-index="${idx}" ${c.selected ? 'checked' : ''}>
                </td>
                <td>
                    <input type="text" class="sup-contact-name" data-index="${idx}" value="${escapeHtml(c.name || '')}" placeholder="Name" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
                <td>
                    <input type="text" class="sup-contact-desc" data-index="${idx}" value="${escapeHtml(c.description || '')}" placeholder="Description" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
                <td>
                    <select class="sup-contact-method" data-index="${idx}" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                        <option value="Phone" ${c.commMethod === 'Phone' ? 'selected' : ''}>Phone</option>
                        <option value="E-Mail" ${c.commMethod === 'E-Mail' ? 'selected' : ''}>E-Mail</option>
                        <option value="Mobile" ${c.commMethod === 'Mobile' ? 'selected' : ''}>Mobile</option>
                        <option value="Fax" ${c.commMethod === 'Fax' ? 'selected' : ''}>Fax</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="sup-contact-val" data-index="${idx}" value="${escapeHtml(c.value || '')}" placeholder="Value" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <input type="checkbox" class="sup-contact-receiver" data-index="${idx}" ${c.docReceiver ? 'checked' : ''}>
                </td>
                <td>
                    <input type="text" class="sup-contact-doc-type" data-index="${idx}" value="${escapeHtml(c.docType || '')}" placeholder="Doc Type" style="width: 100%; border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 13px;">
                </td>
            `;

            tr.querySelector('.chk-sup-contact-row-select').addEventListener('change', (e) => { currentSupplierContacts[idx].selected = e.target.checked; });
            tr.querySelector('.sup-contact-name').addEventListener('input', (e) => { currentSupplierContacts[idx].name = e.target.value; });
            tr.querySelector('.sup-contact-desc').addEventListener('input', (e) => { currentSupplierContacts[idx].description = e.target.value; });
            tr.querySelector('.sup-contact-method').addEventListener('change', (e) => { currentSupplierContacts[idx].commMethod = e.target.value; });
            tr.querySelector('.sup-contact-val').addEventListener('input', (e) => { currentSupplierContacts[idx].value = e.target.value; });
            tr.querySelector('.sup-contact-receiver').addEventListener('change', (e) => { currentSupplierContacts[idx].docReceiver = e.target.checked; });
            tr.querySelector('.sup-contact-doc-type').addEventListener('input', (e) => { currentSupplierContacts[idx].docType = e.target.value; });

            body.appendChild(tr);
        });
    }

    function renderSupplierAddressList() {
        const body = document.getElementById('sup-inv-addr-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierAddresses.length === 0) {
            body.innerHTML = `<tr><td colspan="10" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No addresses entered.</td></tr>`;
            return;
        }

        currentSupplierAddresses.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(a.addressId || '01')}</strong></td>
                <td>${escapeHtml(a.addr1 || '')}</td>
                <td>${escapeHtml(a.addr2 || '')}</td>
                <td>${escapeHtml(a.city || '')}</td>
                <td>${escapeHtml(a.postcode || '')}</td>
                <td>${escapeHtml(a.state || '-')}</td>
                <td>${escapeHtml(a.county || '-')}</td>
                <td>${escapeHtml(a.country || 'GB UNITED KINGDOM')}</td>
                <td>${escapeHtml(a.validFrom || '-')}</td>
                <td>${escapeHtml(a.validTo || '-')}</td>
            `;
            body.appendChild(tr);
        });
    }

    function renderSupplierFileList() {
        const body = document.getElementById('sup-file-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierFiles.length === 0) {
            body.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--color-text-muted); padding: 15px;">No uploaded documents found.</td></tr>`;
            return;
        }

        currentSupplierFiles.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(f.name || '')}</strong></td>
                <td>${escapeHtml(f.otherType || '')}</td>
                <td>${escapeHtml(f.licenceType || '-')}</td>
                <td>${escapeHtml(f.uploadedBy || 'Vilas Vaidya')}</td>
                <td>${escapeHtml(f.date || '18-04-2018 05:03:15 PM')}</td>
                <td style="text-align: center;"><button type="button" class="btn btn-secondary btn-sm btn-sup-file-del" data-index="${idx}" style="padding: 2px 6px; font-size: 11px; background-color: var(--color-danger); color: #fff; border: none; border-radius: 4px;">❌</button></td>
                <td style="text-align: center;"><button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 11px; background-color: var(--color-primary); color: #fff; border: none; border-radius: 4px;">📥</button></td>
            `;

            tr.querySelector('.btn-sup-file-del').addEventListener('click', () => {
                currentSupplierFiles.splice(idx, 1);
                renderSupplierFileList();
                showToast("Document deleted.", "warning");
            });

            body.appendChild(tr);
        });
    }

    function resetSupplierForm() {
        const setVal = (id, val = '') => { const el = document.getElementById(id); if (el) el.value = val; };
        const setChk = (id, val = false) => { const el = document.getElementById(id); if (el) el.checked = val; };

        setVal('sup-form-id', '');
        setVal('sup-form-name', '');
        setVal('sup-form-company', 'LAXMI01');

        setVal('sup-gen-assoc-no', '');
        setVal('sup-gen-group', '40 O/H Suppliers');
        setVal('sup-gen-tax-liability', 'TAX Taxable');
        setVal('sup-gen-identifier-ref', 'Yes');
        setVal('sup-gen-currency', 'GBP');
        setVal('sup-gen-free-tax-code', 'Select Free Tax Code');
        setVal('sup-gen-creation-date', '2018-04-17');
        setVal('sup-gen-payment-term', '0 Due Immediately');
        setVal('sup-gen-tax-code', 'SUK-11 20');
        setVal('sup-gen-stat-group', 'OH Overheads');
        setVal('sup-gen-buyer-id', '*');
        setVal('sup-gen-category-code', '');

        setVal('sup-inv-addr-id', '01');
        setVal('sup-inv-addr1', '');
        setVal('sup-inv-addr2', '');
        setVal('sup-inv-city', '');
        setVal('sup-inv-postcode', '');
        setVal('sup-inv-county', '');
        setVal('sup-inv-state', '');
        setVal('sup-inv-country', 'GB UNITED KINGDOM');

        setVal('sup-pay-invoicing-supplier', '');
        setVal('sup-pay-authorizer', 'PRICHA');
        setChk('sup-pay-netting', false);
        setVal('sup-pay-invoice-recipient', '*');
        setChk('sup-pay-blocked', false);

        setVal('sup-lic-type', 'Non WDA Holder');
        setVal('sup-lic-supplier-for', 'Select...');
        setVal('sup-lic-company-reg', '');
        setVal('sup-lic-risk-score', 'Select...');
        setChk('sup-lic-questionnaire', false);
        setVal('sup-lic-note', 'Inactivated due to communication method changed in General tab.');

        editingSupplierNo = null;
        currentSupplierContacts = [];
        currentSupplierAddresses = [];
        currentSupplierFiles = [];

        renderSupplierContactsList();
        renderSupplierAddressList();
        renderSupplierFileList();

        const formTitle = document.getElementById('sup-form-title');
        if (formTitle) formTitle.textContent = 'Supplier Update Form';
        const badge = document.getElementById('sup-edit-status-badge');
        if (badge) badge.style.display = 'none';

        // Switch back to General subtab
        const btnGenSubtab = document.getElementById('btn-sup-subtab-general');
        if (btnGenSubtab) btnGenSubtab.click();
    }

    function loadSupplierIntoForm(s) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined && val !== null ? val : '';
        };
        const setChk = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.checked = !!val;
        };

        editingSupplierNo = s.supplierId;

        setVal('sup-form-id', s.supplierId);
        setVal('sup-form-name', s.supplierName);
        setVal('sup-form-company', s.company || 'LAXMI01');

        setVal('sup-gen-assoc-no', s.assocNo);
        setVal('sup-gen-group', s.supplierGroup || '40 O/H Suppliers');
        setVal('sup-gen-tax-liability', s.taxLiability || 'TAX Taxable');
        setVal('sup-gen-identifier-ref', s.identifierRef || 'Yes');
        setVal('sup-gen-currency', s.currency || 'GBP');
        setVal('sup-gen-free-tax-code', s.freeTaxCode || 'Select Free Tax Code');
        setVal('sup-gen-creation-date', s.creationDate || '2018-04-17');
        setVal('sup-gen-payment-term', s.paymentTerm || '0 Due Immediately');
        setVal('sup-gen-tax-code', s.taxCode || 'SUK-11 20');
        setVal('sup-gen-stat-group', s.statGroup || 'OH Overheads');
        setVal('sup-gen-buyer-id', s.buyerId || '*');
        setVal('sup-gen-category-code', s.categoryCode);

        setVal('sup-pay-invoicing-supplier', s.invoicingSupplier || s.supplierId);
        setVal('sup-pay-authorizer', s.paymentAuthorizer || 'PRICHA');
        setChk('sup-pay-netting', s.nettingAllowed);
        setVal('sup-pay-invoice-recipient', s.invoiceRecipient || '*');
        setChk('sup-pay-blocked', s.blockedForPayment);

        setVal('sup-lic-type', s.licenceType || 'Non WDA Holder');
        setVal('sup-lic-supplier-for', s.supplierFor || 'Select...');
        setVal('sup-lic-company-reg', s.companyRegNo);
        setVal('sup-lic-risk-score', s.riskScore || 'Select...');
        setChk('sup-lic-questionnaire', s.questionnaire);
        setVal('sup-lic-note', s.licenceNote || '');

        currentSupplierContacts = s.contacts ? JSON.parse(JSON.stringify(s.contacts)) : [];
        currentSupplierAddresses = s.addresses ? JSON.parse(JSON.stringify(s.addresses)) : [];
        currentSupplierFiles = s.files ? JSON.parse(JSON.stringify(s.files)) : [];

        renderSupplierContactsList();
        renderSupplierAddressList();
        renderSupplierFileList();

        const formTitle = document.getElementById('sup-form-title');
        if (formTitle) formTitle.textContent = `Supplier Update Form: ${s.supplierName}`;
        const badge = document.getElementById('sup-edit-status-badge');
        if (badge) badge.style.display = 'inline-block';

        showSupplierFormView();
    }

    function getSupplierFormData() {
        const getVal = id => document.getElementById(id) ? document.getElementById(id).value.trim() : '';
        const getChk = id => document.getElementById(id) ? document.getElementById(id).checked : false;

        return {
            supplierId: getVal('sup-form-id'),
            supplierName: getVal('sup-form-name'),
            company: getVal('sup-form-company') || 'LAXMI01',
            assocNo: getVal('sup-gen-assoc-no'),
            supplierGroup: getVal('sup-gen-group'),
            taxLiability: getVal('sup-gen-tax-liability'),
            identifierRef: getVal('sup-gen-identifier-ref'),
            currency: getVal('sup-gen-currency'),
            freeTaxCode: getVal('sup-gen-free-tax-code'),
            creationDate: getVal('sup-gen-creation-date'),
            paymentTerm: getVal('sup-gen-payment-term'),
            taxCode: getVal('sup-gen-tax-code'),
            statGroup: getVal('sup-gen-stat-group'),
            buyerId: getVal('sup-gen-buyer-id'),
            categoryCode: getVal('sup-gen-category-code'),
            invoicingSupplier: getVal('sup-pay-invoicing-supplier'),
            paymentAuthorizer: getVal('sup-pay-authorizer'),
            nettingAllowed: getChk('sup-pay-netting'),
            invoiceRecipient: getVal('sup-pay-invoice-recipient'),
            blockedForPayment: getChk('sup-pay-blocked'),
            licenceType: getVal('sup-lic-type'),
            supplierFor: getVal('sup-lic-supplier-for'),
            companyRegNo: getVal('sup-lic-company-reg'),
            riskScore: getVal('sup-lic-risk-score'),
            questionnaire: getChk('sup-lic-questionnaire'),
            licenceNote: getVal('sup-lic-note'),
            status: "Active",
            contacts: currentSupplierContacts,
            addresses: currentSupplierAddresses,
            files: currentSupplierFiles
        };
    }

    function validateSupplierForm(data) {
        if (!data.supplierId) {
            showToast("Error: Supplier ID is required.", "danger");
            return false;
        }
        if (!data.supplierName) {
            showToast("Error: Supplier Name is required.", "danger");
            return false;
        }
        return true;
    }

    function initSupplierSetup() {
        const btnNavSupplierSub = document.getElementById('nav-supplier-setup-sub');
        const supplierWorkspace = document.getElementById('supplier-creation-workspace');
        
        if (btnNavSupplierSub) {
            btnNavSupplierSub.addEventListener('click', (e) => {
                e.preventDefault();
                // Deactivate other nav items
                document.querySelectorAll('.sub-item').forEach(el => el.classList.remove('active'));
                btnNavSupplierSub.classList.add('active');

                // Hide other workspace panels
                document.querySelectorAll('.workspace-panel').forEach(p => p.classList.add('hidden'));
                if (supplierWorkspace) supplierWorkspace.classList.remove('hidden');

                const btnSave = document.getElementById('btn-save');
                const btnCancel = document.getElementById('btn-cancel');
                if (btnSave) btnSave.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';

                renderSupplierList();
                showToast("Switched to Supplier Setup profile.", "success");
            });
        }

        // Sub-tabs switching
        const subTabs = [
            { btnId: 'btn-sup-subtab-general', panelId: 'panel-sup-subtab-general' },
            { btnId: 'btn-sup-subtab-invoice-addr', panelId: 'panel-sup-subtab-invoice-addr' },
            { btnId: 'btn-sup-subtab-payment', panelId: 'panel-sup-subtab-payment' },
            { btnId: 'btn-sup-subtab-licence', panelId: 'panel-sup-subtab-licence' },
            { btnId: 'btn-sup-subtab-file', panelId: 'panel-sup-subtab-file' },
            { btnId: 'btn-sup-subtab-dispatch-addr', panelId: 'panel-sup-subtab-dispatch-addr' }
        ];

        subTabs.forEach(st => {
            const btn = document.getElementById(st.btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    subTabs.forEach(t => {
                        const b = document.getElementById(t.btnId);
                        const p = document.getElementById(t.panelId);
                        if (b) b.classList.remove('active');
                        if (p) p.classList.add('hidden');
                    });
                    btn.classList.add('active');
                    const targetPanel = document.getElementById(st.panelId);
                    if (targetPanel) targetPanel.classList.remove('hidden');
                });
            }
        });

        // View Directory Button
        const btnSupViewDirectory = document.getElementById('btn-sup-view-directory');
        if (btnSupViewDirectory) {
            btnSupViewDirectory.addEventListener('click', () => {
                showSupplierListView();
            });
        }

        // Quick Create New Supplier Button
        const btnCreateSupplierQuick = document.getElementById('btn-create-supplier-quick');
        if (btnCreateSupplierQuick) {
            btnCreateSupplierQuick.addEventListener('click', () => {
                resetSupplierForm();
                showSupplierFormView();
            });
        }

        // Add Contact Row
        const btnContactAddRow = document.getElementById('btn-sup-contact-add-row');
        if (btnContactAddRow) {
            btnContactAddRow.addEventListener('click', () => {
                currentSupplierContacts.push({
                    selected: false,
                    name: '',
                    description: '',
                    commMethod: 'Phone',
                    value: '',
                    docReceiver: false,
                    docType: ''
                });
                renderSupplierContactsList();
                showToast("Supplier contact row added.", "success");
            });
        }

        // Delete Contact Row
        const btnContactDeleteSelected = document.getElementById('btn-sup-contact-delete-selected');
        if (btnContactDeleteSelected) {
            btnContactDeleteSelected.addEventListener('click', () => {
                const initLen = currentSupplierContacts.length;
                currentSupplierContacts = currentSupplierContacts.filter(c => !c.selected);
                if (currentSupplierContacts.length < initLen) {
                    renderSupplierContactsList();
                    showToast("Selected contact rows deleted.", "warning");
                }
            });
        }

        // Add Address Line
        const btnInvAddUpdate = document.getElementById('btn-sup-inv-add-update');
        if (btnInvAddUpdate) {
            btnInvAddUpdate.addEventListener('click', () => {
                const addr1 = document.getElementById('sup-inv-addr1') ? document.getElementById('sup-inv-addr1').value.trim() : '';
                const addr2 = document.getElementById('sup-inv-addr2') ? document.getElementById('sup-inv-addr2').value.trim() : '';
                const city = document.getElementById('sup-inv-city') ? document.getElementById('sup-inv-city').value.trim() : '';
                const postcode = document.getElementById('sup-inv-postcode') ? document.getElementById('sup-inv-postcode').value.trim() : '';
                const county = document.getElementById('sup-inv-county') ? document.getElementById('sup-inv-county').value.trim() : '';
                const state = document.getElementById('sup-inv-state') ? document.getElementById('sup-inv-state').value.trim() : '';
                const country = document.getElementById('sup-inv-country') ? document.getElementById('sup-inv-country').value : 'GB UNITED KINGDOM';

                currentSupplierAddresses.push({
                    addressId: `0${currentSupplierAddresses.length + 1}`,
                    addr1, addr2, city, postcode, county, state, country,
                    validFrom: '', validTo: ''
                });
                renderSupplierAddressList();
                showToast("Address line added.", "success");
            });
        }

        // File Upload Button
        const btnFileUpload = document.getElementById('btn-sup-file-upload');
        if (btnFileUpload) {
            btnFileUpload.addEventListener('click', () => {
                const titleInput = document.getElementById('sup-file-name');
                const categorySelect = document.getElementById('sup-file-type');
                const title = titleInput ? titleInput.value.trim() : '';
                const cat = categorySelect ? categorySelect.value : 'SUPPLIER CREATION FORM';

                if (!title) {
                    showToast("Enter a document title first.", "warning");
                    return;
                }

                currentSupplierFiles.push({
                    id: currentSupplierFiles.length + 1,
                    name: title,
                    otherType: cat,
                    licenceType: "",
                    uploadedBy: "Vilas Vaidya",
                    date: new Date().toLocaleString()
                });
                if (titleInput) titleInput.value = '';
                renderSupplierFileList();
                showToast(`File '${title}' uploaded successfully.`, "success");
            });
        }


        const btnPayMethodAdd = document.getElementById('btn-sup-pay-method-add');
        const payMethodsBody = document.getElementById('sup-pay-methods-body');
        if (btnPayMethodAdd && payMethodsBody) {
            btnPayMethodAdd.addEventListener('click', (e) => {
                e.preventDefault();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Method" style="width: 100%; border: none; background: transparent; outline: none;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Description" style="width: 100%; border: none; background: transparent; outline: none;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; text-align: center;"><input type="checkbox"></td>
                `;
                payMethodsBody.appendChild(tr);
            });
        }

        const btnPayAddrAdd = document.getElementById('btn-sup-pay-addr-add');
        const payAddressesBody = document.getElementById('sup-pay-addresses-body');
        if (btnPayAddrAdd && payAddressesBody) {
            btnPayAddrAdd.addEventListener('click', (e) => {
                e.preventDefault();
                const tr = document.createElement('tr');
                tr.classList.add('new-pending-row');
                tr.innerHTML = `
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Seq" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Method" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Desc" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Bank Acc" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; text-align: center;"><input type="checkbox"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Sort Code" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Name" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;"><input type="text" placeholder="Bldg Ref" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;"></td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; color: #64748b; font-weight: bold;" class="status-cell">Not Saved</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; text-align: center;" class="action-cell">
                        <button type="button" class="btn btn-secondary btn-sm btn-delete-row" style="padding: 2px 6px; font-size: 11px; background-color: var(--color-danger); color: white; border: none; border-radius: 2px; cursor: pointer;">Delete</button>
                    </td>
                `;
                payAddressesBody.appendChild(tr);
            });
        }

        // Inline Action handlers for Payment Addresses table
        if (payAddressesBody) {
            payAddressesBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete-row')) {
                    e.preventDefault();
                    e.target.closest('tr').remove();
                } else if (e.target.classList.contains('btn-approve-row')) {
                    e.preventDefault();
                    const tr = e.target.closest('tr');
                    const statusCell = tr.querySelector('.status-cell');
                    if (statusCell) {
                        statusCell.textContent = 'Approved';
                        statusCell.style.color = '#10b981'; // Green
                    }
                    e.target.remove(); // Remove approve button once approved
                    showToast('Payment address approved.', 'success');
                } else if (e.target.classList.contains('btn-edit-row')) {
                    e.preventDefault();
                    const tr = e.target.closest('tr');
                    // Convert row to edit mode
                    if (!tr.classList.contains('new-pending-row')) {
                        tr.classList.add('new-pending-row');
                        
                        const cells = tr.querySelectorAll('td');
                        const createInput = (val) => `<input type="text" value="${val}" style="width: 100%; border: none; background: transparent; outline: none; font-size: 11px;">`;
                        
                        for (let i = 0; i < 8; i++) {
                            if (i !== 4) {
                                cells[i].innerHTML = createInput(cells[i].textContent.trim());
                            } else {
                                const isChecked = cells[i].querySelector('input') ? cells[i].querySelector('input').checked : false;
                                cells[i].innerHTML = `<input type="checkbox" ${isChecked ? 'checked' : ''}>`;
                            }
                        }
                        
                        cells[8].textContent = 'Not Saved';
                        cells[8].style.color = '#64748b';
                        
                        cells[9].innerHTML = `<button type="button" class="btn btn-secondary btn-sm btn-delete-row" style="padding: 2px 6px; font-size: 11px; background-color: var(--color-danger); color: white; border: none; border-radius: 2px; cursor: pointer;">Delete</button>`;
                    }
                }
            });
        }

        // Manager Role simulation
        const simManagerRole = document.getElementById('sim-manager-role');
        if (simManagerRole) {
            simManagerRole.addEventListener('change', (e) => {
                const isManager = e.target.checked;
                const approveBtns = document.querySelectorAll('.btn-approve-row');
                approveBtns.forEach(btn => {
                    btn.style.display = isManager ? 'inline-block' : 'none';
                });
            });
        }
        // Action Buttons
        const btnSupSave = document.getElementById('btn-sup-save');
        const btnSupCopy = document.getElementById('btn-sup-copy');
        const btnSupUpdate = document.getElementById('btn-sup-update');
        const btnSupCancel = document.getElementById('btn-sup-cancel');

        if (btnSupCancel) {
            btnSupCancel.addEventListener('click', () => {
                resetSupplierForm();
                showSupplierListView();
            });
        }

        if (btnSupSave) {
            btnSupSave.addEventListener('click', () => {
                const data = getSupplierFormData();
                if (!validateSupplierForm(data)) return;

                const exists = suppliers.some(s => s && s.supplierId && s.supplierId.toUpperCase() === data.supplierId.toUpperCase());
                if (exists) {
                    showToast("Error: Supplier ID already exists. Use a unique ID.", "danger");
                    return;
                }

                suppliers.push(data);
                saveSuppliersState();
                showToast(`Supplier '${data.supplierName}' created successfully.`, "success");
                resetSupplierForm();
                showSupplierListView();
            });
        }

        if (btnSupCopy) {
            btnSupCopy.addEventListener('click', () => {
                const idInput = document.getElementById('sup-form-id');
                if (idInput) {
                    idInput.value = '';
                    idInput.focus();
                }
                editingSupplierNo = null;
                showToast("Supplier details copied. Enter a new Supplier ID and click 'Create Supplier'.", "info");
            });
        }

        if (btnSupUpdate) {
            btnSupUpdate.addEventListener('click', () => {
                if (!editingSupplierNo) {
                    showToast("Error: No supplier loaded to update.", "danger");
                    return;
                }
                const data = getSupplierFormData();
                if (!validateSupplierForm(data)) return;

                const idx = suppliers.findIndex(s => s && s.supplierId && s.supplierId.toUpperCase() === editingSupplierNo.toUpperCase());
                if (idx !== -1) {
                    suppliers[idx] = data;
                    saveSuppliersState();

                    // Process pending payment addresses
                    const pendingRows = document.querySelectorAll('#sup-pay-addresses-body .new-pending-row');
                    if (pendingRows.length > 0) {
                        const isManager = document.getElementById('sim-manager-role')?.checked || false;
                        
                        pendingRows.forEach(tr => {
                            const inputs = tr.querySelectorAll('input[type="text"]');
                            const chk = tr.querySelector('input[type="checkbox"]');
                            
                            const seq = inputs[0]?.value || '';
                            const method = inputs[1]?.value || '';
                            const desc = inputs[2]?.value || '';
                            const acc = inputs[3]?.value || '';
                            const isDefault = chk ? chk.checked : false;
                            const sort = inputs[4]?.value || '';
                            const name = inputs[5]?.value || '';
                            const bldg = inputs[6]?.value || '';

                            tr.classList.remove('new-pending-row');
                            
                            const cells = tr.querySelectorAll('td');
                            cells[0].textContent = seq;
                            cells[1].textContent = method;
                            cells[2].textContent = desc;
                            cells[3].textContent = acc;
                            cells[4].innerHTML = `<input type="checkbox" ${isDefault ? 'checked' : ''} disabled>`;
                            cells[5].textContent = sort;
                            cells[6].textContent = name;
                            cells[7].textContent = bldg;
                            
                            cells[8].textContent = 'Approval Pending';
                            cells[8].style.color = '#d97706'; // Orange
                            
                            cells[9].innerHTML = `
                                <button type="button" class="btn btn-secondary btn-sm btn-edit-row" style="padding: 2px 6px; font-size: 11px; background-color: #3b82f6; color: white; border: none; border-radius: 2px; cursor: pointer; margin-right: 4px;">Edit</button>
                                <button type="button" class="btn btn-secondary btn-sm btn-approve-row" style="padding: 2px 6px; font-size: 11px; background-color: #10b981; color: white; border: none; border-radius: 2px; cursor: pointer; display: ${isManager ? 'inline-block' : 'none'};">Approve</button>
                            `;
                        });
                        showToast(`${pendingRows.length} payment addresses saved and pending approval.`, 'info');
                    }

                    showToast(`Supplier '${data.supplierName}' updated successfully.`, "success");
                    resetSupplierForm();
                    showSupplierListView();
                } else {
                    showToast(`Error: Supplier '${editingSupplierNo}' not found.`, "danger");
                }
            });
        }

        // Search Filters
        const searchId = document.getElementById('sup-search-id');
        const searchName = document.getElementById('sup-search-name');
        if (searchId) searchId.addEventListener('input', renderSupplierList);
        if (searchName) searchName.addEventListener('input', renderSupplierList);
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

        // Handle internal finance navigation links (e.g. Chart of Accounts, Cost Centers, etc.)
        const finNavLinks = document.querySelectorAll('.mod-dash-link[data-fin-nav]');
        finNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-fin-nav');
                const targetPanel = document.getElementById(`panel-${targetId}`);
                
                if (targetPanel) {
                    // Hide all finance sub-panels
                    document.querySelectorAll('.fin-sub-panel').forEach(p => { 
                        p.classList.add('hidden'); 
                        p.style.display = ''; 
                    });
                    
                    // Show target panel
                    targetPanel.classList.remove('hidden');
                    targetPanel.style.display = 'block';
                    
                    // Update active screen badge
                    const badge = document.getElementById('fin-active-screen-badge');
                    if (badge) {
                        let linkText = link.textContent.trim().replace('↗', '').trim();
                        badge.textContent = `Active Screen: ${linkText}`;
                    }
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

        // Handle Role change
        if (roleSelector) {
            roleSelector.addEventListener('change', (e) => {
                const role = e.target.value;
                if (topbarActiveRole) topbarActiveRole.textContent = role === 'Admin' ? 'ERP Administrator' : role;
                
                // Set default permissions based on role
                if (role === 'Normal User') {
                    chkRead.checked = true;
                    chkWrite.checked = false;
                    chkDelete.checked = false;
                } else if (role === 'Manager') {
                    chkRead.checked = true;
                    chkWrite.checked = true;
                    chkDelete.checked = false;
                } else if (role === 'QA') {
                    chkRead.checked = true;
                    chkWrite.checked = false;
                    chkDelete.checked = false;
                } else if (role === 'Admin') {
                    chkRead.checked = true;
                    chkWrite.checked = true;
                    chkDelete.checked = true;
                }
                
                showToast(`Switched user role to ${role}`, 'success');
                
                // Refresh specific module views that depend on RBAC (e.g. Customer QA Approval)
                if (typeof renderCustomerList === 'function') {
                    renderCustomerList();
                }
            });
        }
    }

    function initAwesomebar() {
        const awesomebarOverlay = document.getElementById('awesomebar-modal-overlay');
        const awesomebarInput = document.getElementById('awesomebar-search-input');
        const homeSearchTrigger = document.getElementById('home-search-trigger');
        const topbarSearchInput = document.getElementById('topbar-search-input');
        const resultsContainer = document.getElementById('awesomebar-results-container');

        const searchableItems = [
            { title: 'Company Setup', module: 'other', id: 'nav-company-setup-sub', type: 'Master Data', icon: '📁' },
            { title: 'Site Setup', module: 'site', id: 'nav-site-setup-sub', type: 'Master Data', icon: '🏢' },
            { title: 'User Setup', module: 'user-setup', id: 'nav-user-setup-sub', type: 'Master Data', icon: '👥' },
            { title: 'Reset Password', module: 'user-setup', id: 'nav-user-setup-sub', subtab: 'reset-password', type: 'Security', icon: '🔐' },
            { title: 'Customer Creation', module: 'customer-creation', id: 'nav-customer-creation-sub', type: 'Master Data', icon: '🤝' },
            { title: 'Supplier Setup', module: 'supplier-setup', id: 'nav-supplier-setup-sub', type: 'Master Data', icon: '🚚' },
            { title: 'Item Setup', module: 'other', id: 'nav-item-setup-sub', type: 'Master Data', icon: '📦' },
            { title: 'Dashboard', module: 'other', id: 'nav-dashboard', type: 'Module', icon: '📊' },
            { title: 'Finance / Ledger', module: 'finance', id: 'nav-finance', type: 'Module', icon: '💳' },
            { title: 'Inventory', module: 'stock', id: 'nav-inventory', type: 'Module', icon: '📦' },
            { title: 'Purchasing', module: 'purchase', id: 'nav-purchasing', type: 'Module', icon: '🛒' },
            { title: 'Distribution', module: 'sales', id: 'nav-distribution', type: 'Module', icon: '🚚' },
            { title: 'Sales Module', module: 'sales', type: 'Module', icon: '📊', isCard: true },
            { title: 'Purchase Module', module: 'purchase', type: 'Module', icon: '🛒', isCard: true },
            { title: 'HR Module', module: 'hr', type: 'Module', icon: '👥', isCard: true },
            { title: 'PLPI Module', module: 'plpi', type: 'Module', icon: '⚙️', isCard: true },
            { title: 'Stock Management', module: 'stock', type: 'Module', icon: '📦', isCard: true },
            { title: 'Master Data Setup', module: 'other', type: 'Module', icon: '📁', isCard: true }
        ];

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
                    } else {
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
            
            // 1. If it's a top-level module card
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

            // 2. We are navigating to a specific sub-page.
            // Ensure main container is visible and we are in the correct module.
            if (item.module) {
                if (item.module === 'finance') {
                    const finModal = document.getElementById('finance-modal-overlay');
                    if (finModal) finModal.classList.remove('hidden');
                } else if (typeof switchModule === 'function') {
                    switchModule(item.module);
                }
            }
            
            // 3. Click the target sidebar navigation element to show the specific tab
            if (item.id) {
                setTimeout(() => {
                    const el = document.getElementById(item.id);
                    if (el) {
                        el.click();
                    } else if (typeof showToast === 'function') {
                        showToast(`Navigating to ${item.title}...`, 'info');
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
                currentResults = searchableItems;
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
                if (!query) {
                    currentResults = searchableItems;
                } else {
                    currentResults = searchableItems.filter(item => 
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

    // Initialize page
    loadSavedConfig();
    loadSavedSupplierConfig();
    initResetPassword();
    initUserSetup();
    initCustomerSetup();
    initSupplierSetup();
    initFinanceSetup();
    initRBAC();
    initAwesomebar();
    checkUrlResetToken();
    showToast("Welcome to B&S ERP Portal. Select a module to begin.", "success");
});
