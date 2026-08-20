/**
 * supplier_workflow.js
 * 
 * B&S ERP - Supplier Master Setup & Creation Workflow Engine (ERP-MD-005)
 * 
 * Sequence: Finance Creates ➔ QA Verifies ➔ RP Approves ➔ QA Activates ➔ Supplier Active
 * 
 * Enforces separation of duties:
 * - RP is the sole Approval Authority
 * - QA is the sole Activation Authority
 * - RP approval transitions to 'Activation Pending' (Awaiting QA Activation) and does NOT automatically activate.
 * - Full audit trail (21 CFR Part 11 compliant) captures every state change, actor, timestamp, remarks, and rejection reason.
 */

(function () {
    'use strict';

    const SUPPLIER_STORAGE_KEY = 'ANTIGRAVITY_ERP_SUPPLIER_DATA_V2';

    // Status Master Constants
    const STATUS = {
        DRAFT: 'Draft',
        PENDING_QA: 'Pending QA',
        QA_REVIEW: 'QA Review',
        PENDING_RP: 'Pending RP Approval',
        RP_REVIEW: 'RP Review',
        ACTIVATION_PENDING: 'Activation Pending',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive'
    };

    const SUB_STATUS = {
        FINANCE_IN_PROGRESS: 'Finance – In Progress',
        AWAITING_QA_VERIFICATION: 'Awaiting QA Verification',
        LICENCE_PENDING: 'Licence Info – Pending',
        VERIFICATION_IN_PROGRESS: 'Verification In Progress',
        AWAITING_RP_APPROVAL: 'Awaiting RP Approval',
        UNDER_RP_REVIEW: 'Under RP Review',
        APPROVED_ACTIVATION_PENDING: 'Approved – Activation Pending',
        REJECTED_CORRECTION: 'Rejected – Correction Required',
        AWAITING_QA_ACTIVATION: 'Awaiting QA Activation',
        SUPPLIER_ACTIVE: 'Supplier Active',
        SUPPLIER_INACTIVE: 'Supplier Inactive'
    };

    const OWNER = {
        FINANCE: 'Finance',
        QA: 'QA',
        RP: 'RP',
        NONE: '—'
    };

    // Pre-populated default dataset illustrating every workflow state
    const defaultSuppliers = [
        {
            supplierId: "ACC007",
            supplierName: "ACCENT WIRE TIE LTD",
            company: "LAXMI01",
            assocNo: "ASC-8821",
            supplierGroup: "40 O/H Suppliers",
            taxLiability: "TAX Taxable",
            identifierRef: "Yes",
            currency: "GBP",
            freeTaxCode: "Select Free Tax Code",
            creationDate: "2026-08-10",
            lastUpdatedDate: "2026-08-19",
            paymentTerm: "30E 30 Days End of Month",
            taxCode: "SUK-11 20",
            statGroup: "OH Overheads",
            buyerId: "SP03",
            categoryCode: "CAT-PACKAGING",
            invoicingSupplier: "ACC007",
            paymentAuthorizer: "PRICHA",
            nettingAllowed: false,
            invoiceRecipient: "*",
            blockedForPayment: false,
            licenceType: "WDA Holder",
            supplierFor: "Wholesale",
            companyRegNo: "03928194",
            companyRegExpiry: "2029-06-30",
            gdpGmpCertNo: "UK WDA 48291/001",
            expiryDate: "2028-12-31",
            gdpGmpExpiry: "2028-12-31",
            riskScore: "Low",
            questionnaire: true,
            techApprovedDate: "2026-08-12",
            techRenewalDate: "2028-08-12",
            reviewDate: "2027-08-12",
            licenceStatus: "Active",
            licenceNote: "Full GDP accreditation audit passed with zero critical deficiencies.",
            dispSupName: "ACCENT WIRE TIE LTD",
            dispShipVia: "DHL Express Freight",
            dispRespPerson: "Dr. Alistair Finch",
            dispQualPerson: "Elena Rostova",
            status: STATUS.ACTIVE,
            subStatus: SUB_STATUS.SUPPLIER_ACTIVE,
            currentOwner: OWNER.NONE,
            contacts: [
                { selected: false, name: "Adrian Helliwell", description: "Account Director", commMethod: "E-Mail", value: "ahelliwell@accentwire.co.uk", docReceiver: true, docType: "Invoice + Statements" },
                { selected: false, name: "Accounts Desk", description: "Finance", commMethod: "Phone", value: "01274 693159", docReceiver: false, docType: "" }
            ],
            addresses: [
                {
                    addressId: "01",
                    addressTypes: ["Delivery", "Invoice", "Pay"],
                    addressType: "Delivery + Invoice + Pay",
                    deliveryDefault: true,
                    invoiceDefault: true,
                    payDefault: true,
                    addr1: "UNITS 2A - 2D EUROWAY TRADING EST",
                    addr2: "WHARFEDALE ROAD",
                    city: "BRADFORD",
                    postcode: "BD4 6SG",
                    county: "West Yorkshire",
                    state: "Yorkshire",
                    country: "GB UNITED KINGDOM",
                    validFrom: "2026-01-01",
                    validTo: "2030-12-31"
                }
            ],
            paymentMethods: [
                { method: "BACS", description: "Automated Bank Transfer", isDefault: true }
            ],
            paymentAddresses: [
                {
                    seqId: "01",
                    method: "BACS",
                    description: "Primary GBP Settlement",
                    bankAccount: "GB29NWBK60161331926819",
                    sortCode: "60-16-13",
                    accountName: "Accent Wire Tie Ltd",
                    bldgRef: "REF-001",
                    status: "Active",
                    isDefault: true
                }
            ],
            dispatchAddresses: [
                {
                    addressId: "01",
                    addr1: "UNITS 2A - 2D EUROWAY TRADING EST",
                    addr2: "WHARFEDALE ROAD",
                    city: "BRADFORD",
                    postcode: "BD4 6SG",
                    county: "West Yorkshire",
                    state: "Yorkshire",
                    country: "GB UNITED KINGDOM",
                    validFrom: "2026-01-01",
                    validTo: "2030-12-31",
                    isDefault: true
                }
            ],
            files: [
                { id: 1, name: "Supplier_Ac_Opening_Form.pdf", otherType: "SUPPLIER CREATION FORM", licenceType: "", uploadedBy: "Vilas Vaidya", date: "10-08-2026 10:14:00 AM" },
                { id: 2, name: "GDP_Wholesale_Dealer_Auth_2026.pdf", otherType: "LICENCE DOCUMENT", licenceType: "WDA Holder", uploadedBy: "QA Lead", date: "12-08-2026 02:30:15 PM" }
            ],
            auditTrail: [
                {
                    id: "AUD-1001",
                    date: "10-Aug-2026",
                    time: "10:15:22",
                    timestamp: "2026-08-10T10:15:22",
                    action: "Created Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Initial supplier setup initiated by Finance team."
                },
                {
                    id: "AUD-1002",
                    date: "10-Aug-2026",
                    time: "11:30:00",
                    timestamp: "2026-08-10T11:30:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Commercial and payment terms completed. Handed over to QA."
                },
                {
                    id: "AUD-1003",
                    date: "12-Aug-2026",
                    time: "14:20:10",
                    timestamp: "2026-08-12T14:20:10",
                    action: "QA Started Review",
                    prevStatus: STATUS.PENDING_QA,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    performedBy: "Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Verification of WDA licence and GDP certificate in progress."
                },
                {
                    id: "AUD-1004",
                    date: "12-Aug-2026",
                    time: "16:45:00",
                    timestamp: "2026-08-12T16:45:00",
                    action: "Submitted for RP Approval",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_RP,
                    newSubStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
                    performedBy: "Vilas Vaidya",
                    userRole: "QA",
                    remarks: "GDP/GMP certificate verified on MHRA database. Technical agreement validated."
                },
                {
                    id: "AUD-1005",
                    date: "13-Aug-2026",
                    time: "09:30:15",
                    timestamp: "2026-08-13T09:30:15",
                    action: "RP Approved",
                    prevStatus: STATUS.PENDING_RP,
                    prevSubStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
                    newStatus: STATUS.ACTIVATION_PENDING,
                    newSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    performedBy: "Dr. Marcus Bell",
                    userRole: "RP",
                    remarks: "Regulatory approval granted. Handed back to QA for final ERP activation."
                },
                {
                    id: "AUD-1006",
                    date: "14-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-14T10:00:00",
                    action: "Activated Supplier",
                    prevStatus: STATUS.ACTIVATION_PENDING,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    newStatus: STATUS.ACTIVE,
                    newSubStatus: SUB_STATUS.SUPPLIER_ACTIVE,
                    performedBy: "Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Final compliance check verified. Supplier account is now Active in ERP."
                }
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
            supplierFor: "Wholesale",
            companyRegNo: "00123984",
            gdpGmpCertNo: "UK WDA 19382/001",
            expiryDate: "2029-06-30",
            riskScore: "Low",
            questionnaire: true,
            status: STATUS.ACTIVE,
            subStatus: SUB_STATUS.SUPPLIER_ACTIVE,
            currentOwner: OWNER.NONE,
            creationDate: "2026-08-01",
            lastUpdatedDate: "2026-08-15",
            auditTrail: [
                {
                    id: "AUD-1010",
                    date: "01-Aug-2026",
                    time: "09:00:00",
                    timestamp: "2026-08-01T09:00:00",
                    action: "Created & Completed Workflow",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.ACTIVE,
                    newSubStatus: SUB_STATUS.SUPPLIER_ACTIVE,
                    performedBy: "QA Officer",
                    userRole: "QA",
                    remarks: "Legacy compliant wholesale supplier migrated and activated."
                }
            ]
        },
        {
            supplierId: "ACC002",
            supplierName: "ALLIANCE HEALTHCARE (GB) LTD",
            company: "LAXMI01",
            supplierGroup: "10 Trade Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "WDA Holder",
            supplierFor: "Wholesale",
            companyRegNo: "02485910",
            gdpGmpCertNo: "UK WDA 22094/002",
            expiryDate: "2029-11-15",
            riskScore: "Low",
            questionnaire: true,
            status: STATUS.ACTIVATION_PENDING,
            subStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
            currentOwner: OWNER.QA,
            creationDate: "2026-08-15",
            lastUpdatedDate: "2026-08-18",
            auditTrail: [
                {
                    id: "AUD-1020",
                    date: "15-Aug-2026",
                    time: "11:00:00",
                    timestamp: "2026-08-15T11:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Submitted for QA verification."
                },
                {
                    id: "AUD-1021",
                    date: "17-Aug-2026",
                    time: "14:00:00",
                    timestamp: "2026-08-17T14:00:00",
                    action: "Submitted for RP Approval",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_RP,
                    newSubStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
                    performedBy: "QA Officer",
                    userRole: "QA",
                    remarks: "GDP Licence and wholesale authorisations verified."
                },
                {
                    id: "AUD-1022",
                    date: "18-Aug-2026",
                    time: "16:20:00",
                    timestamp: "2026-08-18T16:20:00",
                    action: "Approved by RP",
                    prevStatus: STATUS.RP_REVIEW,
                    prevSubStatus: SUB_STATUS.UNDER_RP_REVIEW,
                    newStatus: STATUS.ACTIVATION_PENDING,
                    newSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    performedBy: "Dr. Marcus Bell",
                    userRole: "RP",
                    remarks: "RP approval granted. Ready for QA activation."
                }
            ]
        },
        {
            supplierId: "ACC003",
            supplierName: "PHOENIX MEDICAL SUPPLIES LTD",
            company: "LAXMI01",
            supplierGroup: "10 Trade Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "WDA Holder",
            supplierFor: "Wholesale",
            companyRegNo: "01827493",
            gdpGmpCertNo: "UK WDA 33910/003",
            expiryDate: "2028-10-31",
            riskScore: "Low",
            questionnaire: true,
            status: STATUS.PENDING_RP,
            subStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
            currentOwner: OWNER.RP,
            creationDate: "2026-08-16",
            lastUpdatedDate: "2026-08-18",
            auditTrail: [
                {
                    id: "AUD-1030",
                    date: "16-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-16T10:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Initial details submitted."
                },
                {
                    id: "AUD-1031",
                    date: "18-Aug-2026",
                    time: "15:30:00",
                    timestamp: "2026-08-18T15:30:00",
                    action: "Submitted for RP Approval",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_RP,
                    newSubStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
                    performedBy: "QA Officer",
                    userRole: "QA",
                    remarks: "Licence verification completed. RP Approval requested via email."
                }
            ]
        },
        {
            supplierId: "ACC004",
            supplierName: "MEDICARE BIOSCIENCES LTD",
            company: "SPECIALS",
            supplierGroup: "20 Specials Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "Manufacturer",
            supplierFor: "Goods",
            companyRegNo: "05839201",
            gdpGmpCertNo: "",
            expiryDate: "",
            riskScore: "Select...",
            questionnaire: false,
            status: STATUS.QA_REVIEW,
            subStatus: SUB_STATUS.LICENCE_PENDING,
            currentOwner: OWNER.QA,
            creationDate: "2026-08-17",
            lastUpdatedDate: "2026-08-19",
            auditTrail: [
                {
                    id: "AUD-1040",
                    date: "17-Aug-2026",
                    time: "14:00:00",
                    timestamp: "2026-08-17T14:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Finance completed commercial terms."
                },
                {
                    id: "AUD-1041",
                    date: "19-Aug-2026",
                    time: "09:15:00",
                    timestamp: "2026-08-19T09:15:00",
                    action: "QA Started Review",
                    prevStatus: STATUS.PENDING_QA,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.LICENCE_PENDING,
                    performedBy: "QA Officer",
                    userRole: "QA",
                    remarks: "QA auditing GMP certificates and technical agreements."
                }
            ]
        },
        {
            supplierId: "ACC005",
            supplierName: "STERLING PHARMA PACKAGING",
            company: "LAXMI01",
            supplierGroup: "40 O/H Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "Non WDA Holder",
            supplierFor: "Services",
            companyRegNo: "09283741",
            status: STATUS.PENDING_QA,
            subStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
            currentOwner: OWNER.QA,
            creationDate: "2026-08-18",
            lastUpdatedDate: "2026-08-18",
            auditTrail: [
                {
                    id: "AUD-1050",
                    date: "18-Aug-2026",
                    time: "16:00:00",
                    timestamp: "2026-08-18T16:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Submitted to QA for initial verification."
                }
            ]
        },
        {
            supplierId: "ACC006",
            supplierName: "BIOPURE LOGISTICS UK",
            company: "LAXMI01",
            supplierGroup: "40 O/H Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "Non WDA Holder",
            supplierFor: "Services",
            status: STATUS.DRAFT,
            subStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
            currentOwner: OWNER.FINANCE,
            creationDate: "2026-08-19",
            lastUpdatedDate: "2026-08-19",
            auditTrail: [
                {
                    id: "AUD-1060",
                    date: "19-Aug-2026",
                    time: "08:30:00",
                    timestamp: "2026-08-19T08:30:00",
                    action: "Saved Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Draft created; entering address and bank information."
                }
            ]
        },
        {
            supplierId: "ACC008",
            supplierName: "NOVEX HEALTH SERVICES LTD",
            company: "BNS01",
            supplierGroup: "20 Specials Suppliers",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            licenceType: "WDA Holder",
            supplierFor: "Wholesale",
            companyRegNo: "07849102",
            gdpGmpCertNo: "UK WDA 49201/005",
            expiryDate: "2027-04-30",
            riskScore: "Medium",
            questionnaire: true,
            status: STATUS.RP_REVIEW,
            subStatus: SUB_STATUS.REJECTED_CORRECTION,
            currentOwner: OWNER.FINANCE,
            rejectionReason: "IBAN and Bank Account name on settlement address 01 do not match the registered supplier entity name. Please correct banking documentation and resubmit.",
            creationDate: "2026-08-14",
            lastUpdatedDate: "2026-08-19",
            auditTrail: [
                {
                    id: "AUD-1070",
                    date: "14-Aug-2026",
                    time: "11:00:00",
                    timestamp: "2026-08-14T11:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Finance User",
                    userRole: "Finance",
                    remarks: "Draft submitted."
                },
                {
                    id: "AUD-1071",
                    date: "16-Aug-2026",
                    time: "14:30:00",
                    timestamp: "2026-08-16T14:30:00",
                    action: "Submitted for RP Approval",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_RP,
                    newSubStatus: SUB_STATUS.AWAITING_RP_APPROVAL,
                    performedBy: "QA Officer",
                    userRole: "QA",
                    remarks: "QA verified licence details."
                },
                {
                    id: "AUD-1072",
                    date: "19-Aug-2026",
                    time: "10:15:00",
                    timestamp: "2026-08-19T10:15:00",
                    action: "Rejected by RP - Correction Required",
                    prevStatus: STATUS.RP_REVIEW,
                    prevSubStatus: SUB_STATUS.UNDER_RP_REVIEW,
                    newStatus: STATUS.RP_REVIEW,
                    newSubStatus: SUB_STATUS.REJECTED_CORRECTION,
                    performedBy: "Dr. Marcus Bell",
                    userRole: "RP",
                    remarks: "Returned to Finance for bank account resolution.",
                    rejectionReason: "IBAN and Bank Account name on settlement address 01 do not match the registered supplier entity name. Please correct banking documentation and resubmit."
                }
            ]
        }
    ];

    // State Variables
    let suppliers = [];
    let currentRole = 'Admin'; // Default simulation role: 'Finance' | 'QA' | 'RP' | 'Admin'
    let editingSupplierNo = null;

    // Form buffers
    let currentSupplierContacts = [];
    let currentSupplierAddresses = [];
    let currentSupplierFiles = [];
    let currentSupplierPaymentMethods = [];
    let currentSupplierPaymentAddresses = [];
    let currentSupplierDispatchAddresses = [];
    let currentSupplierAuditTrail = [];

    // Form editing sub-indices
    let editingSupplierAddressIndex = null;
    let editingPaymentMethodIndex = null;
    let editingPaymentAddressIndex = null;
    let editingDispatchAddressIndex = null;

    // Filters State
    let selectedStatusFilters = [];
    let selectedSubStatusFilters = [];

    // Storage Helpers
    function loadSuppliers() {
        try {
            const raw = localStorage.getItem(SUPPLIER_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    suppliers = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to load suppliers from storage", e);
        }
        suppliers = JSON.parse(JSON.stringify(defaultSuppliers));
        saveSuppliers();
    }

    function saveSuppliers() {
        try {
            localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
        } catch (e) {
            console.error("Failed to save suppliers to storage", e);
        }
    }

    function formatCurrentDate() {
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatCurrentISODate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function toISODateString(val) {
        if (!val) return '';
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (!trimmed) return '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
            const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (dmy) {
                return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
            }
            const dMmmY = trimmed.match(/^(\d{1,2})[\/\-]([A-Za-z]{3})[\/\-](\d{4})$/);
            if (dMmmY) {
                const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
                const m = months[dMmmY[2].toLowerCase()] || '01';
                return `${dMmmY[3]}-${m}-${dMmmY[1].padStart(2, '0')}`;
            }
            const d = new Date(trimmed);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } else if (val instanceof Date && !isNaN(val.getTime())) {
            const year = val.getFullYear();
            const month = String(val.getMonth() + 1).padStart(2, '0');
            const day = String(val.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return '';
    }

    function formatCurrentTime() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    function createAuditEntry(action, prevStatus, prevSubStatus, newStatus, newSubStatus, remarks = '', rejectionReason = '') {
        const userMap = {
            'Finance': 'Sarah Jenkins (Finance)',
            'QA': 'Vilas Vaidya (QA Lead)',
            'RP': 'Dr. Marcus Bell (RP)',
            'Admin': 'SP03 (ERP Administrator)'
        };
        return {
            id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
            date: formatCurrentDate(),
            time: formatCurrentTime(),
            timestamp: new Date().toISOString(),
            action: action,
            prevStatus: prevStatus || '—',
            prevSubStatus: prevSubStatus || '—',
            newStatus: newStatus,
            newSubStatus: newSubStatus,
            performedBy: userMap[currentRole] || 'System User',
            userRole: currentRole,
            remarks: remarks,
            rejectionReason: rejectionReason
        };
    }

    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(msg, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type);
            return;
        }
        console.log(`[Toast ${type}]: ${msg}`);
    }

    // Role Permission Helpers
    function canRoleCreateOrEditFinance() {
        return currentRole === 'Finance' || currentRole === 'Admin';
    }

    function canRoleVerifyQA() {
        return currentRole === 'QA' || currentRole === 'Admin';
    }

    function canRoleReviewRP() {
        return currentRole === 'RP' || currentRole === 'Admin';
    }

    function canRoleActivateQA() {
        return currentRole === 'QA' || currentRole === 'Admin';
    }

    // UI Helpers for Statuses & Owners
    function getStatusClass(status) {
        switch (status) {
            case STATUS.DRAFT: return 'status-draft';
            case STATUS.PENDING_QA: return 'status-pending-qa';
            case STATUS.QA_REVIEW: return 'status-qa-review';
            case STATUS.PENDING_RP: return 'status-pending-rp';
            case STATUS.RP_REVIEW: return 'status-rp-review';
            case STATUS.ACTIVATION_PENDING: return 'status-activation-pending';
            case STATUS.ACTIVE: return 'status-active';
            case STATUS.INACTIVE: return 'status-inactive';
            default: return 'status-draft';
        }
    }

    function getSubStatusClass(subStatus) {
        switch (subStatus) {
            case SUB_STATUS.FINANCE_IN_PROGRESS: return 'substatus-finance-in-progress';
            case SUB_STATUS.AWAITING_QA_VERIFICATION: return 'substatus-awaiting-qa';
            case SUB_STATUS.LICENCE_PENDING: return 'substatus-licence-pending';
            case SUB_STATUS.VERIFICATION_IN_PROGRESS: return 'substatus-verification-in-progress';
            case SUB_STATUS.AWAITING_RP_APPROVAL: return 'substatus-awaiting-rp';
            case SUB_STATUS.UNDER_RP_REVIEW: return 'substatus-under-rp-review';
            case SUB_STATUS.APPROVED_ACTIVATION_PENDING: return 'substatus-approved-activation-pending';
            case SUB_STATUS.REJECTED_CORRECTION: return 'substatus-rejected-correction';
            case SUB_STATUS.AWAITING_QA_ACTIVATION: return 'substatus-awaiting-qa-activation';
            case SUB_STATUS.SUPPLIER_ACTIVE: return 'substatus-active';
            case SUB_STATUS.SUPPLIER_INACTIVE: return 'substatus-inactive';
            default: return 'substatus-inactive';
        }
    }

    function getOwnerClass(owner) {
        switch (owner) {
            case OWNER.FINANCE: return 'owner-finance';
            case OWNER.QA: return 'owner-qa';
            case OWNER.RP: return 'owner-rp';
            default: return 'owner-none';
        }
    }

    function getNextRequiredAction(status, subStatus, owner) {
        if (status === STATUS.DRAFT) return "Finance to complete supplier details and click 'Submit to QA'.";
        if (status === STATUS.PENDING_QA) return "QA to start review and complete licence verification.";
        if (status === STATUS.QA_REVIEW) {
            if (subStatus === SUB_STATUS.LICENCE_PENDING) return "QA must complete mandatory Licence Info section.";
            return "QA to verify details and click 'Submit for RP Approval'.";
        }
        if (status === STATUS.PENDING_RP) return "Responsible Person (RP) to start review and verify compliance.";
        if (status === STATUS.RP_REVIEW) {
            if (subStatus === SUB_STATUS.REJECTED_CORRECTION) return `${owner || 'Responsible Team'} to correct highlighted issues and resubmit.`;
            return "RP to Approve or Reject with correction reason.";
        }
        if (status === STATUS.ACTIVATION_PENDING) return "QA to perform final verification check and click 'Activate Supplier'.";
        if (status === STATUS.ACTIVE) return "Supplier is Active and approved for procurement in ERP.";
        if (status === STATUS.INACTIVE) return "Supplier is Inactive. Reopening requires QA re-verification.";
        return "Follow workflow sequence.";
    }

    function calculateStepperStage(status, subStatus) {
        if (status === STATUS.DRAFT) return 1;
        if (status === STATUS.PENDING_QA || status === STATUS.QA_REVIEW) return 2;
        if (status === STATUS.PENDING_RP || status === STATUS.RP_REVIEW) {
            if (subStatus === SUB_STATUS.REJECTED_CORRECTION) return 3;
            return 3;
        }
        if (status === STATUS.ACTIVATION_PENDING) return 4;
        if (status === STATUS.ACTIVE) return 5;
        return 1;
    }

    // Render Workflow Stepper & Status Banner
    function updateWorkflowVisuals(s) {
        const step = calculateStepperStage(s.status, s.subStatus);
        const isRejected = s.subStatus === SUB_STATUS.REJECTED_CORRECTION;

        for (let i = 1; i <= 5; i++) {
            const el = document.getElementById(`step-node-${i}`);
            if (!el) continue;
            el.classList.remove('completed', 'active', 'rejected');

            if (isRejected && i === 3) {
                el.classList.add('rejected');
                el.querySelector('.stepper-icon').innerHTML = '✕';
            } else if (i < step) {
                el.classList.add('completed');
                el.querySelector('.stepper-icon').innerHTML = '✓';
            } else if (i === step) {
                el.classList.add('active');
                el.querySelector('.stepper-icon').innerHTML = String(i);
            } else {
                el.querySelector('.stepper-icon').innerHTML = String(i);
            }
        }

        // Live Banner
        const bannerStatus = document.getElementById('sup-banner-status');
        const bannerSubstatus = document.getElementById('sup-banner-substatus');
        const bannerOwner = document.getElementById('sup-banner-owner');
        const bannerAction = document.getElementById('sup-banner-action-required');
        const bannerContainer = document.getElementById('sup-form-workflow-banner');

        if (bannerStatus) bannerStatus.innerHTML = `<span class="status-badge ${getStatusClass(s.status)}"><span class="dot"></span> ${escapeHtml(s.status)}</span>`;
        if (bannerSubstatus) bannerSubstatus.innerHTML = `<span class="substatus-badge ${getSubStatusClass(s.subStatus)}">${escapeHtml(s.subStatus)}</span>`;
        if (bannerOwner) bannerOwner.innerHTML = `<span class="owner-pill ${getOwnerClass(s.currentOwner)}">${escapeHtml(s.currentOwner)}</span>`;
        if (bannerAction) bannerAction.textContent = getNextRequiredAction(s.status, s.subStatus, s.currentOwner);

        if (bannerContainer) {
            if (isRejected) bannerContainer.classList.add('banner-rejected');
            else bannerContainer.classList.remove('banner-rejected');
        }

        // Rejection Alert Box
        const rejBox = document.getElementById('sup-form-rejection-box');
        const rejText = document.getElementById('sup-rejection-reason-text');
        if (rejBox) {
            if (isRejected) {
                rejBox.classList.remove('hidden');
                if (rejText) rejText.textContent = s.rejectionReason || "No specific correction notes provided.";
            } else {
                rejBox.classList.add('hidden');
            }
        }
    }

    // Role-Aware Action Buttons State Updater
    function updateActionButtonsVisibility(s) {
        const btnSaveDraft = document.getElementById('btn-sup-save-draft');
        const btnSubmitQA = document.getElementById('btn-sup-submit-qa');
        const btnSaveQA = document.getElementById('btn-sup-save-verification');
        const btnSubmitRP = document.getElementById('btn-sup-submit-rp');
        const btnStartRP = document.getElementById('btn-sup-start-rp-review');
        const btnApproveRP = document.getElementById('btn-sup-approve-rp');
        const btnRejectRP = document.getElementById('btn-sup-reject-rp');
        const btnActivateQA = document.getElementById('btn-sup-activate-qa');
        const btnDeactivate = document.getElementById('btn-sup-deactivate');

        // Hide all initially
        [btnSaveDraft, btnSubmitQA, btnSaveQA, btnSubmitRP, btnStartRP, btnApproveRP, btnRejectRP, btnActivateQA, btnDeactivate].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        const isFinance = canRoleCreateOrEditFinance();
        const isQA = canRoleVerifyQA();
        const isRP = canRoleReviewRP();
        const isAdmin = currentRole === 'Admin';

        const status = s.status;
        const subStatus = s.subStatus;

        if (!editingSupplierNo || status === STATUS.DRAFT) {
            if (isFinance) {
                if (btnSaveDraft) btnSaveDraft.style.display = 'inline-flex';
                if (btnSubmitQA) btnSubmitQA.style.display = 'inline-flex';
            }
            return;
        }

        if (status === STATUS.PENDING_QA) {
            if (isQA) {
                if (btnSaveQA) {
                    btnSaveQA.textContent = "Start QA Verification";
                    btnSaveQA.style.display = 'inline-flex';
                }
                if (btnSubmitRP) btnSubmitRP.style.display = 'inline-flex';
            }
        } else if (status === STATUS.QA_REVIEW) {
            if (isQA) {
                if (btnSaveQA) {
                    btnSaveQA.textContent = "Save QA Verification";
                    btnSaveQA.style.display = 'inline-flex';
                }
                if (btnSubmitRP) btnSubmitRP.style.display = 'inline-flex';
            }
        } else if (status === STATUS.PENDING_RP) {
            if (isRP) {
                if (btnStartRP) btnStartRP.style.display = 'inline-flex';
                if (btnApproveRP) btnApproveRP.style.display = 'inline-flex';
                if (btnRejectRP) btnRejectRP.style.display = 'inline-flex';
            }
        } else if (status === STATUS.RP_REVIEW) {
            if (subStatus === SUB_STATUS.REJECTED_CORRECTION) {
                if (isFinance || isQA) {
                    if (btnSubmitQA) {
                        btnSubmitQA.innerHTML = "<span>📤</span> Resubmit to QA";
                        btnSubmitQA.style.display = 'inline-flex';
                    }
                }
            } else {
                if (isRP) {
                    if (btnApproveRP) btnApproveRP.style.display = 'inline-flex';
                    if (btnRejectRP) btnRejectRP.style.display = 'inline-flex';
                }
            }
        } else if (status === STATUS.ACTIVATION_PENDING) {
            if (isQA) {
                if (btnActivateQA) btnActivateQA.style.display = 'inline-flex';
            }
        } else if (status === STATUS.ACTIVE) {
            if (isQA || isAdmin) {
                if (btnDeactivate) btnDeactivate.style.display = 'inline-flex';
            }
        }
    }

    // Role Simulation Switcher Logic (Synchronized with Global RBAC Profile Selector)
    function setSimulationRole(role) {
        if (!role) return;
        currentRole = role;

        renderSupplierList();

        if (editingSupplierNo) {
            const s = suppliers.find(item => item.supplierId.toUpperCase() === editingSupplierNo.toUpperCase());
            if (s) updateActionButtonsVisibility(s);
        }
    }

    // Render KPI Statistics
    function updateKPICards() {
        const total = suppliers.length;
        const draft = suppliers.filter(s => s.status === STATUS.DRAFT).length;
        const qa = suppliers.filter(s => s.status === STATUS.PENDING_QA || s.status === STATUS.QA_REVIEW).length;
        const rp = suppliers.filter(s => s.status === STATUS.PENDING_RP || s.status === STATUS.RP_REVIEW).length;
        const activation = suppliers.filter(s => s.status === STATUS.ACTIVATION_PENDING).length;
        const active = suppliers.filter(s => s.status === STATUS.ACTIVE).length;

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('sup-kpi-total', total);
        setVal('sup-kpi-draft', draft);
        setVal('sup-kpi-qa', qa);
        setVal('sup-kpi-rp', rp);
        setVal('sup-kpi-activation', activation);
        setVal('sup-kpi-active', active);
    }

    // Multi-Select Dropdown Handlers
    function initMultiSelectFilters() {
        // Status Multi-Select
        const statusTrigger = document.getElementById('sup-filter-status-trigger');
        const statusDropdown = document.getElementById('sup-filter-status-dropdown');
        const statusChips = document.getElementById('sup-filter-status-chips');
        const statusCheckboxes = document.querySelectorAll('#sup-filter-status-dropdown .chk-filter-status');
        const btnStatusSelectAll = document.getElementById('btn-status-select-all');
        const btnStatusClearAll = document.getElementById('btn-status-clear-all');

        if (statusTrigger && statusDropdown) {
            statusTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                statusDropdown.classList.toggle('hidden');
                const subDropdown = document.getElementById('sup-filter-substatus-dropdown');
                if (subDropdown) subDropdown.classList.add('hidden');
            });

            statusCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    selectedStatusFilters = Array.from(statusCheckboxes).filter(c => c.checked).map(c => c.value);
                    updateStatusChips();
                    renderSupplierList();
                });
            });

            if (btnStatusSelectAll) {
                btnStatusSelectAll.addEventListener('click', () => {
                    statusCheckboxes.forEach(c => c.checked = true);
                    selectedStatusFilters = Array.from(statusCheckboxes).map(c => c.value);
                    updateStatusChips();
                    renderSupplierList();
                });
            }

            if (btnStatusClearAll) {
                btnStatusClearAll.addEventListener('click', () => {
                    statusCheckboxes.forEach(c => c.checked = false);
                    selectedStatusFilters = [];
                    updateStatusChips();
                    renderSupplierList();
                });
            }
        }

        function updateStatusChips() {
            if (!statusChips) return;
            if (selectedStatusFilters.length === 0) {
                statusChips.innerHTML = '<span style="color: var(--color-text-muted);">All Statuses</span>';
            } else {
                statusChips.innerHTML = selectedStatusFilters.map(st => `<span class="badge" style="background: #e0e7ff; color: #4338ca; font-size: 10.5px; padding: 2px 6px;">${escapeHtml(st)}</span>`).join('');
            }
        }

        // Sub-Status Multi-Select
        const substatusTrigger = document.getElementById('sup-filter-substatus-trigger');
        const substatusDropdown = document.getElementById('sup-filter-substatus-dropdown');
        const substatusChips = document.getElementById('sup-filter-substatus-chips');
        const substatusCheckboxes = document.querySelectorAll('#sup-filter-substatus-dropdown .chk-filter-substatus');
        const btnSubSelectAll = document.getElementById('btn-substatus-select-all');
        const btnSubClearAll = document.getElementById('btn-substatus-clear-all');

        if (substatusTrigger && substatusDropdown) {
            substatusTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                substatusDropdown.classList.toggle('hidden');
                if (statusDropdown) statusDropdown.classList.add('hidden');
            });

            substatusCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    selectedSubStatusFilters = Array.from(substatusCheckboxes).filter(c => c.checked).map(c => c.value);
                    updateSubStatusChips();
                    renderSupplierList();
                });
            });

            if (btnSubSelectAll) {
                btnSubSelectAll.addEventListener('click', () => {
                    substatusCheckboxes.forEach(c => c.checked = true);
                    selectedSubStatusFilters = Array.from(substatusCheckboxes).map(c => c.value);
                    updateSubStatusChips();
                    renderSupplierList();
                });
            }

            if (btnSubClearAll) {
                btnSubClearAll.addEventListener('click', () => {
                    substatusCheckboxes.forEach(c => c.checked = false);
                    selectedSubStatusFilters = [];
                    updateSubStatusChips();
                    renderSupplierList();
                });
            }
        }

        function updateSubStatusChips() {
            if (!substatusChips) return;
            if (selectedSubStatusFilters.length === 0) {
                substatusChips.innerHTML = '<span style="color: var(--color-text-muted);">All Sub-Statuses</span>';
            } else {
                substatusChips.innerHTML = selectedSubStatusFilters.map(st => `<span class="badge" style="background: #fdf2f8; color: #9d174d; font-size: 10.5px; padding: 2px 6px;">${escapeHtml(st)}</span>`).join('');
            }
        }

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (statusTrigger && statusDropdown && !statusTrigger.contains(e.target) && !statusDropdown.contains(e.target)) {
                statusDropdown.classList.add('hidden');
            }
            if (substatusTrigger && substatusDropdown && !substatusTrigger.contains(e.target) && !substatusDropdown.contains(e.target)) {
                substatusDropdown.classList.add('hidden');
            }
        });

        // Other filters
        const searchId = document.getElementById('sup-search-id');
        const searchName = document.getElementById('sup-search-name');
        const filterOwner = document.getElementById('sup-filter-owner');
        const filterDate = document.getElementById('sup-filter-create-date');
        const btnClearFilters = document.getElementById('btn-sup-clear-filters');

        if (searchId) searchId.addEventListener('input', renderSupplierList);
        if (searchName) searchName.addEventListener('input', renderSupplierList);
        if (filterOwner) filterOwner.addEventListener('change', renderSupplierList);
        if (filterDate) filterDate.addEventListener('change', renderSupplierList);

        if (btnClearFilters) {
            btnClearFilters.addEventListener('click', () => {
                if (searchId) searchId.value = '';
                if (searchName) searchName.value = '';
                if (filterOwner) filterOwner.value = '';
                if (filterDate) filterDate.value = '';
                statusCheckboxes.forEach(c => c.checked = false);
                substatusCheckboxes.forEach(c => c.checked = false);
                selectedStatusFilters = [];
                selectedSubStatusFilters = [];
                updateStatusChips();
                updateSubStatusChips();
                renderSupplierList();
                showToast("All directory filters reset.", "info");
            });
        }
    }

    // Render Supplier List Table
    function renderSupplierList() {
        const body = document.getElementById('supplier-list-body');
        if (!body) return;
        body.innerHTML = '';

        updateKPICards();

        const searchId = document.getElementById('sup-search-id')?.value.toLowerCase().trim() || '';
        const searchName = document.getElementById('sup-search-name')?.value.toLowerCase().trim() || '';
        const filterOwner = document.getElementById('sup-filter-owner')?.value || '';
        const filterDate = document.getElementById('sup-filter-create-date')?.value || '';

        const filtered = suppliers.filter(s => {
            if (!s) return false;

            if (searchId && (!s.supplierId || !s.supplierId.toLowerCase().includes(searchId))) return false;
            if (searchName && (!s.supplierName || !s.supplierName.toLowerCase().includes(searchName))) return false;
            if (filterOwner && s.currentOwner !== filterOwner) return false;
            if (filterDate && s.creationDate !== filterDate) return false;

            if (selectedStatusFilters.length > 0 && !selectedStatusFilters.includes(s.status)) return false;
            if (selectedSubStatusFilters.length > 0 && !selectedSubStatusFilters.includes(s.subStatus)) return false;

            return true;
        });

        const countLabel = document.getElementById('sup-list-count-label');
        if (countLabel) countLabel.textContent = `Showing ${filtered.length} of ${suppliers.length} records`;

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--color-text-muted); padding: 30px; font-size: 13px;">No suppliers found matching the filter criteria.</td></tr>`;
            return;
        }

        filtered.forEach(s => {
            const tr = document.createElement('tr');

            const statusBadge = `<span class="status-badge ${getStatusClass(s.status)}"><span class="dot"></span> ${escapeHtml(s.status)}</span>`;
            const subStatusBadge = `<span class="substatus-badge ${getSubStatusClass(s.subStatus)}">${escapeHtml(s.subStatus)}</span>`;
            const ownerBadge = `<span class="owner-pill ${getOwnerClass(s.currentOwner)}">${escapeHtml(s.currentOwner)}</span>`;

            // Shortcut action button based on current state & role
            let shortcutBtn = '';
            const isFinance = canRoleCreateOrEditFinance();
            const isQA = canRoleVerifyQA();
            const isRP = canRoleReviewRP();

            if (s.status === STATUS.DRAFT && isFinance) {
                shortcutBtn = `<button type="button" class="btn btn-secondary btn-sm btn-action-submit-qa" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #0284c7; color: white; border: none; border-radius: 4px;" title="Submit to QA">📤 Submit</button>`;
            } else if ((s.status === STATUS.PENDING_QA || s.status === STATUS.QA_REVIEW) && isQA) {
                shortcutBtn = `<button type="button" class="btn btn-secondary btn-sm btn-action-verify-qa" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #7c3aed; color: white; border: none; border-radius: 4px;" title="QA Review">🔍 Verify</button>`;
            } else if (s.status === STATUS.PENDING_RP && isRP) {
                shortcutBtn = `<button type="button" class="btn btn-secondary btn-sm btn-action-review-rp" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #d97706; color: white; border: none; border-radius: 4px;" title="Review & Approve">🛡️ Review</button>`;
            } else if (s.status === STATUS.RP_REVIEW && s.subStatus !== SUB_STATUS.REJECTED_CORRECTION && isRP) {
                shortcutBtn = `<button type="button" class="btn btn-secondary btn-sm btn-action-approve-rp" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #d97706; color: white; border: none; border-radius: 4px;" title="Approve RP">✅ Approve</button>`;
            } else if (s.status === STATUS.ACTIVATION_PENDING && isQA) {
                shortcutBtn = `<button type="button" class="btn btn-secondary btn-sm btn-action-activate-qa" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #10b981; color: white; border: none; border-radius: 4px;" title="Activate Supplier">⚡ Activate</button>`;
            }

            tr.innerHTML = `
                <td><strong><span style="font-family: monospace; color: var(--color-primary);">${escapeHtml(s.supplierId || '')}</span></strong></td>
                <td><strong style="color: var(--color-text-main);">${escapeHtml(s.supplierName || '')}</strong></td>
                <td>${escapeHtml(s.company || 'LAXMI01')}</td>
                <td>${statusBadge}</td>
                <td>${subStatusBadge}</td>
                <td style="text-align: center;">${ownerBadge}</td>
                <td>${escapeHtml(s.licenceType || 'Non WDA Holder')}</td>
                <td style="font-size: 11.5px; color: var(--color-text-muted);">${escapeHtml(s.lastUpdatedDate || s.creationDate || '2026-08-19')}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 4px; justify-content: center; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn btn-secondary btn-sm btn-sup-view-row" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px;" title="View Full Profile">👁️ View</button>
                        <button type="button" class="btn btn-secondary btn-sm btn-sup-edit-row" data-id="${s.supplierId}" style="padding: 2px 7px; font-size: 11px; background: var(--color-primary); color: white; border: none; border-radius: 4px;" title="Open Edit Form">✏️ Edit</button>
                        ${shortcutBtn}
                    </div>
                </td>
            `;

            // Row Button Listeners
            tr.querySelector('.btn-sup-view-row').addEventListener('click', () => openSupplierViewModal(s.supplierId));
            tr.querySelector('.btn-sup-edit-row').addEventListener('click', () => loadSupplierIntoForm(s));

            const btnSubQA = tr.querySelector('.btn-action-submit-qa');
            if (btnSubQA) btnSubQA.addEventListener('click', () => executeSubmitToQA(s.supplierId));

            const btnVerQA = tr.querySelector('.btn-action-verify-qa');
            if (btnVerQA) btnVerQA.addEventListener('click', () => {
                executeStartQAReview(s.supplierId);
                loadSupplierIntoForm(s);
            });

            const btnRevRP = tr.querySelector('.btn-action-review-rp');
            if (btnRevRP) btnRevRP.addEventListener('click', () => {
                executeStartRPReview(s.supplierId);
                openSupplierViewModal(s.supplierId);
            });

            const btnAppRP = tr.querySelector('.btn-action-approve-rp');
            if (btnAppRP) btnAppRP.addEventListener('click', () => openRPApprovalModal(s.supplierId));

            const btnActQA = tr.querySelector('.btn-action-activate-qa');
            if (btnActQA) btnActQA.addEventListener('click', () => executeActivateSupplier(s.supplierId));

            body.appendChild(tr);
        });
    }

    // Workflow Action Handlers
    function executeSaveDraft(showNotification = true) {
        const data = collectFormData();
        if (!data.supplierId || !data.supplierName) {
            showToast("Error: Supplier ID and Supplier Name are required to save draft.", "danger");
            return false;
        }

        data.status = STATUS.DRAFT;
        data.subStatus = SUB_STATUS.FINANCE_IN_PROGRESS;
        data.currentOwner = OWNER.FINANCE;
        data.lastUpdatedDate = formatCurrentDate();

        const audit = createAuditEntry("Saved Draft", data.status, data.subStatus, STATUS.DRAFT, SUB_STATUS.FINANCE_IN_PROGRESS, "Draft updated by Finance.");
        data.auditTrail.unshift(audit);

        saveOrUpdateSupplierRecord(data);
        if (showNotification) showToast(`Supplier '${data.supplierName}' draft saved.`, "success");
        return true;
    }

    function executeSubmitToQA(supplierId) {
        const id = supplierId || editingSupplierNo || document.getElementById('sup-form-id')?.value.trim();
        if (!id) {
            showToast("Error: Supplier ID required.", "danger");
            return;
        }

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            const currentData = collectFormData();
            saveOrUpdateSupplierRecord(currentData);
        }

        const s = suppliers.find(item => item.supplierId.toUpperCase() === id.toUpperCase());
        if (!s) {
            const valid = executeSaveDraft(false);
            if (!valid) return;
            return executeSubmitToQA(document.getElementById('sup-form-id')?.value.trim());
        }

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        s.status = STATUS.PENDING_QA;
        s.subStatus = SUB_STATUS.AWAITING_QA_VERIFICATION;
        s.currentOwner = OWNER.QA;
        s.lastUpdatedDate = formatCurrentDate();

        const audit = createAuditEntry("Submitted to QA", prevStatus, prevSubStatus, STATUS.PENDING_QA, SUB_STATUS.AWAITING_QA_VERIFICATION, "Commercial and payment terms submitted to QA for verification.");
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        showToast(`Supplier '${s.supplierName}' submitted to QA. Status: Pending QA (Awaiting QA Verification).`, "success");
    }

    function executeStartQAReview(supplierId) {
        const id = supplierId || editingSupplierNo || document.getElementById('sup-form-id')?.value.trim();
        if (!id) return;

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            const currentData = collectFormData();
            saveOrUpdateSupplierRecord(currentData);
        }

        const s = suppliers.find(item => item.supplierId.toUpperCase() === id.toUpperCase());
        if (!s) return;

        if (s.status === STATUS.PENDING_QA) {
            const prevStatus = s.status;
            const prevSubStatus = s.subStatus;

            s.status = STATUS.QA_REVIEW;
            s.subStatus = s.gdpGmpCertNo && s.supplierFor && s.supplierFor !== 'Select...' ? SUB_STATUS.VERIFICATION_IN_PROGRESS : SUB_STATUS.LICENCE_PENDING;
            s.currentOwner = OWNER.QA;
            s.lastUpdatedDate = formatCurrentDate();

            const audit = createAuditEntry("QA Started Verification", prevStatus, prevSubStatus, s.status, s.subStatus, "QA audit and licence checks initiated.");
            s.auditTrail.unshift(audit);

            saveSuppliers();
            renderSupplierList();

            if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
                loadSupplierIntoForm(s);
            }
            showToast("QA Verification started. Status updated to QA Review.", "success");
        }
    }

    function executeSaveQAVerification() {
        const data = collectFormData();
        if (!data.supplierId) {
            showToast("Error: Supplier ID is required.", "danger");
            return;
        }

        const s = suppliers.find(item => item.supplierId.toUpperCase() === data.supplierId.toUpperCase());
        if (!s) return;

        const wasPendingQA = s.status === STATUS.PENDING_QA;
        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        if (wasPendingQA) {
            data.status = STATUS.QA_REVIEW;
            data.subStatus = data.gdpGmpCertNo && data.supplierFor && data.supplierFor !== 'Select...' ? SUB_STATUS.VERIFICATION_IN_PROGRESS : SUB_STATUS.LICENCE_PENDING;
            data.currentOwner = OWNER.QA;
            const audit = createAuditEntry("QA Started Verification", prevStatus, prevSubStatus, data.status, data.subStatus, "QA initiated verification and saved licence details.");
            data.auditTrail.unshift(audit);
        } else {
            data.status = STATUS.QA_REVIEW;
            data.subStatus = data.gdpGmpCertNo && data.supplierFor && data.supplierFor !== 'Select...' ? SUB_STATUS.VERIFICATION_IN_PROGRESS : SUB_STATUS.LICENCE_PENDING;
            data.currentOwner = OWNER.QA;
            const audit = createAuditEntry("Updated QA Verification", prevStatus, prevSubStatus, data.status, data.subStatus, "QA updated compliance & licence details.");
            data.auditTrail.unshift(audit);
        }

        data.lastUpdatedDate = formatCurrentDate();
        saveOrUpdateSupplierRecord(data);
        renderSupplierList();
        loadSupplierIntoForm(data);
        showToast(wasPendingQA ? "QA verification initiated. Status changed to QA Review." : "QA verification details saved successfully.", "success");
    }

    function executeSubmitForRPApproval(supplierId) {
        const id = supplierId || editingSupplierNo || document.getElementById('sup-form-id')?.value.trim();
        if (!id) return;

        // Sync and save any active form edits before running validation and status transition
        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            const currentData = collectFormData();
            saveOrUpdateSupplierRecord(currentData);
        }

        const s = suppliers.find(item => item.supplierId.toUpperCase() === id.toUpperCase());
        if (!s) return;

        const licType = (document.getElementById('sup-lic-type')?.value) || s.licenceType;
        const supFor = (document.getElementById('sup-lic-supplier-for')?.value) || s.supplierFor;
        const gdpCert = (document.getElementById('sup-lic-gdp-gmp-cert-no')?.value?.trim()) || s.gdpGmpCertNo;

        // Validation for QA handoff
        if (!licType || licType === 'Select...' || !supFor || supFor === 'Select...') {
            showToast("Validation Error: Please select 'Supplier Type' and 'Supplier For' in the Licence tab before submitting to RP.", "danger");
            const btnLic = document.getElementById('btn-sup-subtab-licence');
            if (btnLic) btnLic.click();
            return;
        }

        if (licType === 'WDA Holder' && !gdpCert) {
            showToast("Validation Error: GDP/GMP Certificate No is mandatory for WDA Holder.", "danger");
            const btnLic = document.getElementById('btn-sup-subtab-licence');
            if (btnLic) btnLic.click();
            return;
        }

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        s.status = STATUS.PENDING_RP;
        s.subStatus = SUB_STATUS.AWAITING_RP_APPROVAL;
        s.currentOwner = OWNER.RP;
        s.lastUpdatedDate = formatCurrentDate();

        const audit = createAuditEntry("Submitted for RP Approval", prevStatus, prevSubStatus, STATUS.PENDING_RP, SUB_STATUS.AWAITING_RP_APPROVAL, "QA completed licence checks and submitted to RP for approval.");
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        // Trigger simulated email modal to RP
        openEmailNotificationModal(s);
        showToast(`Supplier '${s.supplierName}' submitted for RP Approval. Status: Pending RP Approval.`, "success");
    }

    function executeStartRPReview(supplierId) {
        const s = suppliers.find(item => item.supplierId.toUpperCase() === supplierId.toUpperCase());
        if (!s) return;

        if (s.status === STATUS.PENDING_RP) {
            const prevStatus = s.status;
            const prevSubStatus = s.subStatus;

            s.status = STATUS.RP_REVIEW;
            s.subStatus = SUB_STATUS.UNDER_RP_REVIEW;
            s.currentOwner = OWNER.RP;
            s.lastUpdatedDate = formatCurrentDate();

            const audit = createAuditEntry("RP Started Review", prevStatus, prevSubStatus, s.status, s.subStatus, "Responsible Person opened supplier dossier for compliance examination.");
            s.auditTrail.unshift(audit);

            saveSuppliers();
            renderSupplierList();
        }
    }

    function executeApproveRP(supplierId, remarks = '') {
        const s = suppliers.find(item => item.supplierId.toUpperCase() === supplierId.toUpperCase());
        if (!s) return;

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        // Sequence rule: RP approval moves to Activation Pending (Awaiting QA Activation). NOT active immediately.
        s.status = STATUS.ACTIVATION_PENDING;
        s.subStatus = SUB_STATUS.AWAITING_QA_ACTIVATION;
        s.currentOwner = OWNER.QA;
        s.lastUpdatedDate = formatCurrentDate();
        s.rpApproved = true;
        s.rpApprovedDate = formatCurrentDate();
        s.rpApprovedBy = "Dr. Marcus Bell (RP)";

        const auditRemarks = remarks ? `Approved by RP: ${remarks}` : "RP compliance review passed. Transferred to QA for final ERP activation.";
        const audit = createAuditEntry("Approved by RP", prevStatus, prevSubStatus, STATUS.ACTIVATION_PENDING, SUB_STATUS.AWAITING_QA_ACTIVATION, auditRemarks);
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === supplierId.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        showToast(`Supplier '${s.supplierName}' Approved by RP. Status is now: Activation Pending (Awaiting QA Activation).`, "success");
    }

    function executeRejectRP(supplierId, reason, targetTeam = 'Finance') {
        const s = suppliers.find(item => item.supplierId.toUpperCase() === supplierId.toUpperCase());
        if (!s) return;

        if (!reason || !reason.trim()) {
            showToast("Error: Rejection / Correction reason is mandatory.", "danger");
            return;
        }

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        s.status = STATUS.RP_REVIEW;
        s.subStatus = SUB_STATUS.REJECTED_CORRECTION;
        s.currentOwner = targetTeam === 'QA' ? OWNER.QA : OWNER.FINANCE;
        s.rejectionReason = reason.trim();
        s.lastUpdatedDate = formatCurrentDate();

        const audit = createAuditEntry("Rejected by RP - Correction Required", prevStatus, prevSubStatus, STATUS.RP_REVIEW, SUB_STATUS.REJECTED_CORRECTION, `Returned to ${targetTeam}. Reason: ${reason.trim()}`, reason.trim());
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === supplierId.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        showToast(`Supplier '${s.supplierName}' returned by RP for correction to ${targetTeam}.`, "warning");
    }

    function executeActivateSupplier(supplierId) {
        const id = supplierId || editingSupplierNo || document.getElementById('sup-form-id')?.value.trim();
        if (!id) return;

        const s = suppliers.find(item => item.supplierId.toUpperCase() === id.toUpperCase());
        if (!s) return;

        // Validation rule: QA can only activate if RP approval is completed
        if (s.status !== STATUS.ACTIVATION_PENDING && s.subStatus !== SUB_STATUS.AWAITING_QA_ACTIVATION) {
            showToast("Validation Error: Supplier must be in 'Activation Pending' (RP Approved) before QA can activate.", "danger");
            return;
        }

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        s.status = STATUS.ACTIVE;
        s.subStatus = SUB_STATUS.SUPPLIER_ACTIVE;
        s.currentOwner = OWNER.NONE;
        s.lastUpdatedDate = formatCurrentDate();
        s.qaActivatedDate = formatCurrentDate();
        s.qaActivatedBy = "QA Lead (Vilas Vaidya)";

        const audit = createAuditEntry("Activated Supplier by QA", prevStatus, prevSubStatus, STATUS.ACTIVE, SUB_STATUS.SUPPLIER_ACTIVE, "Final QA compliance checklist verified. Supplier is fully active in ERP.");
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        showToast(`🎉 Supplier '${s.supplierName}' is now ACTIVE and operational in ERP!`, "success");
    }

    function executeDeactivateSupplier(supplierId) {
        const id = supplierId || editingSupplierNo;
        if (!id) return;

        const s = suppliers.find(item => item.supplierId.toUpperCase() === id.toUpperCase());
        if (!s) return;

        const prevStatus = s.status;
        const prevSubStatus = s.subStatus;

        s.status = STATUS.INACTIVE;
        s.subStatus = SUB_STATUS.SUPPLIER_INACTIVE;
        s.currentOwner = OWNER.NONE;
        s.lastUpdatedDate = formatCurrentDate();

        const audit = createAuditEntry("Deactivated Supplier", prevStatus, prevSubStatus, STATUS.INACTIVE, SUB_STATUS.SUPPLIER_INACTIVE, "Supplier record marked Inactive.");
        s.auditTrail.unshift(audit);

        saveSuppliers();
        renderSupplierList();

        if (editingSupplierNo && editingSupplierNo.toUpperCase() === id.toUpperCase()) {
            loadSupplierIntoForm(s);
        }

        showToast(`Supplier '${s.supplierName}' has been deactivated.`, "warning");
    }

    function saveOrUpdateSupplierRecord(data) {
        const idx = suppliers.findIndex(s => s && s.supplierId && s.supplierId.toUpperCase() === data.supplierId.toUpperCase());
        if (idx !== -1) {
            suppliers[idx] = Object.assign({}, suppliers[idx], data);
        } else {
            suppliers.push(data);
        }
        saveSuppliers();
        renderSupplierList();
    }

    // Modal Control Functions
    let activeModalSupplierId = null;

    function openRPApprovalModal(supplierId) {
        activeModalSupplierId = supplierId;
        const modal = document.getElementById('sup-approval-modal');
        const input = document.getElementById('sup-approval-remarks-input');
        if (input) input.value = '';
        if (modal) modal.classList.remove('hidden');
    }

    function closeRPApprovalModal() {
        const modal = document.getElementById('sup-approval-modal');
        if (modal) modal.classList.add('hidden');
        activeModalSupplierId = null;
    }

    function openRejectionModal(supplierId) {
        activeModalSupplierId = supplierId;
        const modal = document.getElementById('sup-rejection-modal');
        const input = document.getElementById('sup-reject-reason-input');
        if (input) input.value = '';
        if (modal) modal.classList.remove('hidden');
    }

    function closeRejectionModal() {
        const modal = document.getElementById('sup-rejection-modal');
        if (modal) modal.classList.add('hidden');
        activeModalSupplierId = null;
    }

    function openEmailNotificationModal(s) {
        const modal = document.getElementById('sup-email-notification-modal');
        const subj = document.getElementById('sup-email-subject');
        const sid = document.getElementById('sup-email-supplier-id');
        const sname = document.getElementById('sup-email-supplier-name');
        const lic = document.getElementById('sup-email-licence-type');

        if (subj) subj.textContent = `[ACTION REQUIRED] Supplier Approval Request: ${s.supplierId} - ${s.supplierName}`;
        if (sid) sid.textContent = s.supplierId;
        if (sname) sname.textContent = s.supplierName;
        if (lic) lic.textContent = `${s.licenceType || 'Non WDA'} ${s.gdpGmpCertNo ? `(${s.gdpGmpCertNo})` : ''}`;

        const btnSimReview = document.getElementById('btn-email-simulate-rp-review');
        if (btnSimReview) {
            btnSimReview.onclick = () => {
                closeEmailNotificationModal();
                setSimulationRole('RP');
                executeStartRPReview(s.supplierId);
                openSupplierViewModal(s.supplierId);
            };
        }

        if (modal) modal.classList.remove('hidden');
    }

    function closeEmailNotificationModal() {
        const modal = document.getElementById('sup-email-notification-modal');
        if (modal) modal.classList.add('hidden');
    }

    // Supplier Comprehensive View Modal
    function openSupplierViewModal(supplierId) {
        const s = suppliers.find(item => item.supplierId.toUpperCase() === supplierId.toUpperCase());
        if (!s) return;

        const modal = document.getElementById('sup-view-modal');
        if (!modal) return;

        const title = document.getElementById('sup-view-modal-title');
        const company = document.getElementById('sup-view-modal-company');
        if (title) title.textContent = `Supplier Profile: ${s.supplierId} — ${s.supplierName}`;
        if (company) company.textContent = `${s.company || 'LAXMI01'} • Created: ${s.creationDate || '2026-08-19'} • Last Updated: ${s.lastUpdatedDate || '2026-08-19'}`;

        // Render Stepper in View
        const viewStepper = document.getElementById('sup-view-stepper');
        if (viewStepper) {
            const step = calculateStepperStage(s.status, s.subStatus);
            const isRejected = s.subStatus === SUB_STATUS.REJECTED_CORRECTION;
            viewStepper.innerHTML = `
                <div class="stepper-step ${step > 1 ? 'completed' : (step === 1 ? 'active' : '')}">
                    <div class="stepper-icon">${step > 1 ? '✓' : '1'}</div>
                    <div class="stepper-label">Finance</div>
                    <div class="stepper-role">Created</div>
                </div>
                <div class="stepper-step ${step > 2 ? 'completed' : (step === 2 ? 'active' : '')}">
                    <div class="stepper-icon">${step > 2 ? '✓' : '2'}</div>
                    <div class="stepper-label">QA Verification</div>
                    <div class="stepper-role">QA</div>
                </div>
                <div class="stepper-step ${isRejected ? 'rejected' : (step > 3 ? 'completed' : (step === 3 ? 'active' : ''))}">
                    <div class="stepper-icon">${isRejected ? '✕' : (step > 3 ? '✓' : '3')}</div>
                    <div class="stepper-label">RP Approval</div>
                    <div class="stepper-role">RP</div>
                </div>
                <div class="stepper-step ${step > 4 ? 'completed' : (step === 4 ? 'active' : '')}">
                    <div class="stepper-icon">${step > 4 ? '✓' : '4'}</div>
                    <div class="stepper-label">QA Activation</div>
                    <div class="stepper-role">QA</div>
                </div>
                <div class="stepper-step ${step === 5 ? 'completed' : ''}">
                    <div class="stepper-icon">${step === 5 ? '✓' : '5'}</div>
                    <div class="stepper-label">Active</div>
                    <div class="stepper-role">ERP</div>
                </div>
            `;
        }

        // View Banner
        const viewBanner = document.getElementById('sup-view-banner');
        if (viewBanner) {
            viewBanner.innerHTML = `
                <div class="workflow-banner-cell">
                    <span class="workflow-banner-label">Status</span>
                    <div class="workflow-banner-val"><span class="status-badge ${getStatusClass(s.status)}"><span class="dot"></span> ${escapeHtml(s.status)}</span></div>
                </div>
                <div class="workflow-banner-cell">
                    <span class="workflow-banner-label">Sub-Status</span>
                    <div class="workflow-banner-val"><span class="substatus-badge ${getSubStatusClass(s.subStatus)}">${escapeHtml(s.subStatus)}</span></div>
                </div>
                <div class="workflow-banner-cell">
                    <span class="workflow-banner-label">Current Owner</span>
                    <div class="workflow-banner-val"><span class="owner-pill ${getOwnerClass(s.currentOwner)}">${escapeHtml(s.currentOwner)}</span></div>
                </div>
                <div class="workflow-banner-cell" style="flex: 1;">
                    <span class="workflow-banner-label">Next Required Action</span>
                    <div class="workflow-banner-val" style="color: #1e40af; font-size: 12.5px;">${getNextRequiredAction(s.status, s.subStatus, s.currentOwner)}</div>
                </div>
            `;
        }

        // View Rejection Box
        const vRejBox = document.getElementById('sup-view-rejection-box');
        const vRejReason = document.getElementById('sup-view-rejection-reason');
        if (vRejBox) {
            if (s.subStatus === SUB_STATUS.REJECTED_CORRECTION) {
                vRejBox.classList.remove('hidden');
                if (vRejReason) vRejReason.textContent = s.rejectionReason || "No details.";
            } else {
                vRejBox.classList.add('hidden');
            }
        }

        // Tab 1: General Grid
        const genGrid = document.getElementById('sup-view-gen-grid');
        if (genGrid) {
            genGrid.innerHTML = `
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Supplier Group</span><strong>${escapeHtml(s.supplierGroup || '40 O/H Suppliers')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Currency</span><strong>${escapeHtml(s.currency || 'GBP')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Tax Liability</span><strong>${escapeHtml(s.taxLiability || 'TAX Taxable')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Payment Term</span><strong>${escapeHtml(s.paymentTerm || '0 Due Immediately')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Tax Code</span><strong>${escapeHtml(s.taxCode || 'SUK-11 20')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Association No</span><strong>${escapeHtml(s.assocNo || '-')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Statistic Group</span><strong>${escapeHtml(s.statGroup || 'OH Overheads')}</strong></div>
                <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Buyer ID</span><strong>${escapeHtml(s.buyerId || '*')}</strong></div>
            `;
        }

        // Tab 1 Contacts
        const cBody = document.getElementById('sup-view-contacts-body');
        if (cBody) {
            cBody.innerHTML = (s.contacts && s.contacts.length > 0)
                ? s.contacts.map(c => `<tr><td>${escapeHtml(c.name || '-')}</td><td>${escapeHtml(c.description || '-')}</td><td>${escapeHtml(c.commMethod || '-')}</td><td>${escapeHtml(c.value || '-')}</td><td>${c.docReceiver ? 'YES' : 'NO'}</td><td>${escapeHtml(c.docType || '-')}</td></tr>`).join('')
                : `<tr><td colspan="6" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No contacts entered.</td></tr>`;
        }

        // Tab 2 Addresses
        const aBody = document.getElementById('sup-view-addresses-body');
        if (aBody) {
            aBody.innerHTML = (s.addresses && s.addresses.length > 0)
                ? s.addresses.map(a => `<tr><td><strong>${escapeHtml(a.addressId)}</strong></td><td>${escapeHtml(a.addressType || 'Delivery')}</td><td>${escapeHtml(a.addr1 || '')}</td><td>${escapeHtml(a.addr2 || '')}</td><td>${escapeHtml(a.city || '')}</td><td>${escapeHtml(a.postcode || '')}</td><td>${escapeHtml(a.country || '')}</td></tr>`).join('')
                : `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No addresses entered.</td></tr>`;
        }

        // Tab 3 Payment
        const pSummary = document.getElementById('sup-view-pay-summary');
        if (pSummary) {
            pSummary.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(4, 1fr); gap: 12px;">
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Invoicing Supplier</span><strong>${escapeHtml(s.invoicingSupplier || s.supplierId)}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Authorizer</span><strong>${escapeHtml(s.paymentAuthorizer || 'PRICHA')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Netting Allowed</span><strong>${s.nettingAllowed ? 'YES' : 'NO'}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Blocked For Payment</span><strong>${s.blockedForPayment ? 'YES (BLOCKED)' : 'NO'}</strong></div>
                </div>
            `;
        }

        const paBody = document.getElementById('sup-view-payment-addresses-body');
        if (paBody) {
            paBody.innerHTML = (s.paymentAddresses && s.paymentAddresses.length > 0)
                ? s.paymentAddresses.map(pa => `<tr><td><strong>${escapeHtml(pa.seqId)}</strong></td><td>${escapeHtml(pa.method)}</td><td style="font-family: monospace;">${escapeHtml(pa.bankAccount)}</td><td>${escapeHtml(pa.sortCode || '-')}</td><td>${escapeHtml(pa.accountName || '-')}</td><td>${pa.isDefault ? 'YES' : 'NO'}</td><td><span class="badge" style="background: #dcfce7; color: #15803d;">${escapeHtml(pa.status || 'Active')}</span></td></tr>`).join('')
                : `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No payment addresses configured.</td></tr>`;
        }

        // Tab 4 Licence
        const licCard = document.getElementById('sup-view-licence-card');
        if (licCard) {
            licCard.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); gap: 14px;">
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Supplier Type</span><strong>${escapeHtml(s.licenceType || 'Non WDA Holder')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Supplier For</span><strong>${escapeHtml(s.supplierFor || 'Wholesale')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Risk Assessment Score</span><strong>${escapeHtml(s.riskScore || 'Low')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">GDP/GMP Certificate No</span><strong>${escapeHtml(s.gdpGmpCertNo || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">GDP/GMP Expiry</span><strong>${escapeHtml(s.expiryDate || s.gdpGmpExpiry || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Company Reg No</span><strong>${escapeHtml(s.companyRegNo || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Questionnaire Checked</span><strong>${s.questionnaire ? 'YES' : 'NO'}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Tech Agreement Approved</span><strong>${escapeHtml(s.techApprovedDate || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Licence Compliance Status</span><strong><span class="badge" style="background: #dcfce7; color: #15803d;">${escapeHtml(s.licenceStatus || 'Active')}</span></strong></div>
                </div>
            `;
        }

        // Tab 5 Dispatch
        const dispPers = document.getElementById('sup-view-disp-personnel');
        if (dispPers) {
            dispPers.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(4, 1fr); gap: 12px;">
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Dispatch Supplier Name</span><strong>${escapeHtml(s.dispSupName || s.supplierName)}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Ship Via</span><strong>${escapeHtml(s.dispShipVia || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Responsible Person</span><strong>${escapeHtml(s.dispRespPerson || '-')}</strong></div>
                    <div><span style="font-size: 11px; color: var(--color-text-muted); display: block;">Qualified Person</span><strong>${escapeHtml(s.dispQualPerson || '-')}</strong></div>
                </div>
            `;
        }

        const daBody = document.getElementById('sup-view-dispatch-addresses-body');
        if (daBody) {
            daBody.innerHTML = (s.dispatchAddresses && s.dispatchAddresses.length > 0)
                ? s.dispatchAddresses.map(d => `<tr><td><strong>${escapeHtml(d.addressId)}</strong></td><td>${escapeHtml(d.addr1 || '')}</td><td>${escapeHtml(d.city || '')}</td><td>${escapeHtml(d.postcode || '')}</td><td>${escapeHtml(d.country || '')}</td><td>${d.isDefault ? 'YES' : 'NO'}</td></tr>`).join('')
                : `<tr><td colspan="6" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No dispatch addresses configured.</td></tr>`;
        }

        // Tab 6 Audit Trail
        renderAuditTimelineInView(s.auditTrail || []);
        renderAuditTableInView(s.auditTrail || []);

        // View Modal Action Footer with Role-Based Workflow Buttons
        const footer = document.getElementById('sup-view-modal-footer');
        if (footer) {
            let workflowActionBtns = '';
            const isQA = canRoleVerifyQA();
            const isRP = canRoleReviewRP();

            if (s.status === STATUS.PENDING_RP && isRP) {
                workflowActionBtns = `
                    <button type="button" class="btn btn-danger btn-modal-reject" style="padding: 8px 18px; font-weight: 700;">❌ Reject</button>
                    <button type="button" class="btn btn-primary btn-modal-approve" style="background: #d97706; border-color: #d97706; padding: 8px 20px; font-weight: 700;">✅ Approve (RP)</button>
                `;
            } else if (s.status === STATUS.RP_REVIEW && s.subStatus !== SUB_STATUS.REJECTED_CORRECTION && isRP) {
                workflowActionBtns = `
                    <button type="button" class="btn btn-danger btn-modal-reject" style="padding: 8px 18px; font-weight: 700;">❌ Reject</button>
                    <button type="button" class="btn btn-primary btn-modal-approve" style="background: #d97706; border-color: #d97706; padding: 8px 20px; font-weight: 700;">✅ Approve (RP)</button>
                `;
            } else if (s.status === STATUS.ACTIVATION_PENDING && isQA) {
                workflowActionBtns = `
                    <button type="button" class="btn btn-success btn-modal-activate" style="background: #10b981; border-color: #10b981; padding: 8px 22px; font-weight: 700;">⚡ Activate Supplier</button>
                `;
            }

            footer.innerHTML = `
                <button type="button" id="btn-close-view-modal-footer" class="btn btn-secondary" style="padding: 8px 18px;">Close</button>
                <button type="button" id="btn-view-edit-supplier" class="btn btn-secondary" style="padding: 8px 18px;">✏️ Open in Edit Mode</button>
                ${workflowActionBtns}
            `;

            document.getElementById('btn-close-view-modal-footer')?.addEventListener('click', closeSupplierViewModal);
            document.getElementById('btn-view-edit-supplier')?.addEventListener('click', () => {
                closeSupplierViewModal();
                loadSupplierIntoForm(s);
            });

            const btnMReject = footer.querySelector('.btn-modal-reject');
            if (btnMReject) btnMReject.addEventListener('click', () => {
                closeSupplierViewModal();
                openRejectionModal(s.supplierId);
            });

            const btnMApprove = footer.querySelector('.btn-modal-approve');
            if (btnMApprove) btnMApprove.addEventListener('click', () => {
                closeSupplierViewModal();
                openRPApprovalModal(s.supplierId);
            });

            const btnMActivate = footer.querySelector('.btn-modal-activate');
            if (btnMActivate) btnMActivate.addEventListener('click', () => {
                closeSupplierViewModal();
                executeActivateSupplier(s.supplierId);
            });
        }

        // View Subtabs click handlers
        document.querySelectorAll('#sup-view-modal [data-vtab]').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const tab = btn.getAttribute('data-vtab');
                document.querySelectorAll('#sup-view-modal [data-vtab]').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('#sup-view-modal .vpanel-content').forEach(p => p.classList.add('hidden'));

                btn.classList.add('active');
                const target = document.getElementById(`vpanel-${tab}`);
                if (target) target.classList.remove('hidden');
            };
        });

        // Set default active tab
        document.getElementById('btn-vtab-general')?.click();

        modal.classList.remove('hidden');
    }

    function closeSupplierViewModal() {
        const modal = document.getElementById('sup-view-modal');
        if (modal) modal.classList.add('hidden');
    }

    function renderAuditTimelineInView(auditList) {
        const container = document.getElementById('sup-view-audit-timeline');
        if (!container) return;
        container.innerHTML = generateAuditTimelineHtml(auditList);
    }

    function renderAuditTableInView(auditList) {
        const body = document.getElementById('sup-view-history-table-body');
        if (!body) return;
        body.innerHTML = generateAuditTableHtml(auditList);
    }

    function generateAuditTimelineHtml(auditList) {
        if (!auditList || auditList.length === 0) {
            return `<div style="color: var(--color-text-muted); font-size: 12px; padding: 12px;">No audit events recorded yet.</div>`;
        }
        return auditList.map(a => {
            const isRej = a.action.toLowerCase().includes('reject');
            const isAct = a.action.toLowerCase().includes('activate') || a.action.toLowerCase().includes('approve');
            const markerClass = isRej ? 'marker-rejected' : (isAct ? 'marker-success' : 'marker-amber');

            return `
                <div class="audit-timeline-item">
                    <div class="audit-timeline-marker ${markerClass}"></div>
                    <div class="audit-timeline-content">
                        <div class="audit-timeline-header">
                            <span class="audit-timeline-action">${escapeHtml(a.action)}</span>
                            <span class="audit-timeline-meta">${escapeHtml(a.date)} ${escapeHtml(a.time)} • <strong>${escapeHtml(a.performedBy)}</strong> (${escapeHtml(a.userRole)})</span>
                        </div>
                        <div class="audit-transition-row">
                            <span>Status: <strong>${escapeHtml(a.prevStatus)}</strong> ➔ <strong>${escapeHtml(a.newStatus)}</strong></span>
                            <span>| Sub-Status: <code>${escapeHtml(a.prevSubStatus)}</code> ➔ <code>${escapeHtml(a.newSubStatus)}</code></span>
                        </div>
                        ${a.remarks ? `<div class="audit-remarks-box">${escapeHtml(a.remarks)}</div>` : ''}
                        ${a.rejectionReason ? `<div style="background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; padding: 6px 10px; border-radius: 4px; font-size: 11.5px; margin-top: 6px;"><strong>Rejection Reason:</strong> ${escapeHtml(a.rejectionReason)}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function generateAuditTableHtml(auditList) {
        if (!auditList || auditList.length === 0) {
            return `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No audit log records.</td></tr>`;
        }
        return auditList.map(a => `
            <tr>
                <td style="font-size: 11.5px; white-space: nowrap;">${escapeHtml(a.date)} <small style="color: #94a3b8;">${escapeHtml(a.time)}</small></td>
                <td><strong>${escapeHtml(a.performedBy)}</strong></td>
                <td><span class="owner-pill ${getOwnerClass(a.userRole)}">${escapeHtml(a.userRole)}</span></td>
                <td><strong>${escapeHtml(a.action)}</strong></td>
                <td><span class="status-badge ${getStatusClass(a.newStatus)}"><span class="dot"></span> ${escapeHtml(a.newStatus)}</span></td>
                <td><span class="substatus-badge ${getSubStatusClass(a.newSubStatus)}">${escapeHtml(a.newSubStatus)}</span></td>
                <td style="font-size: 12px;">${escapeHtml(a.remarks || a.rejectionReason || '-')}</td>
            </tr>
        `).join('');
    }

    // Render Subtab 7 in Form
    function renderAuditTabInForm(auditList) {
        const timeline = document.getElementById('sup-audit-timeline-container');
        const body = document.getElementById('sup-history-table-body');
        if (timeline) timeline.innerHTML = generateAuditTimelineHtml(auditList);
        if (body) body.innerHTML = generateAuditTableHtml(auditList);
    }

    // Sub-Tab 1: Contacts Rendering & Handlers
    function renderSupplierContactsList() {
        const body = document.getElementById('sup-contacts-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierContacts.length === 0) {
            body.innerHTML = `<tr><td colspan="7" class="text-center" style="color: var(--color-text-muted); padding: 16px;">No contacts added yet. Click 'Add Contact Row' below.</td></tr>`;
            return;
        }

        currentSupplierContacts.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center;"><input type="checkbox" class="chk-sup-contact-row" data-index="${idx}" ${c.selected ? 'checked' : ''}></td>
                <td><input type="text" class="input-sup-contact-name" data-index="${idx}" value="${escapeHtml(c.name || '')}" placeholder="Name..."></td>
                <td><input type="text" class="input-sup-contact-desc" data-index="${idx}" value="${escapeHtml(c.description || '')}" placeholder="Description..."></td>
                <td>
                    <select class="select-sup-contact-comm" data-index="${idx}">
                        <option value="Phone" ${c.commMethod === 'Phone' ? 'selected' : ''}>Phone</option>
                        <option value="E-Mail" ${c.commMethod === 'E-Mail' ? 'selected' : ''}>E-Mail</option>
                        <option value="Fax" ${c.commMethod === 'Fax' ? 'selected' : ''}>Fax</option>
                        <option value="Mobile" ${c.commMethod === 'Mobile' ? 'selected' : ''}>Mobile</option>
                    </select>
                </td>
                <td><input type="text" class="input-sup-contact-val" data-index="${idx}" value="${escapeHtml(c.value || '')}" placeholder="Value / Email..."></td>
                <td style="text-align: center;"><input type="checkbox" class="chk-sup-contact-docrec" data-index="${idx}" ${c.docReceiver ? 'checked' : ''}></td>
                <td><input type="text" class="input-sup-contact-doctype" data-index="${idx}" value="${escapeHtml(c.docType || '')}" placeholder="Doc Type..."></td>
            `;

            tr.querySelector('.chk-sup-contact-row').addEventListener('change', (e) => { currentSupplierContacts[idx].selected = e.target.checked; });
            tr.querySelector('.input-sup-contact-name').addEventListener('input', (e) => { currentSupplierContacts[idx].name = e.target.value; });
            tr.querySelector('.input-sup-contact-desc').addEventListener('input', (e) => { currentSupplierContacts[idx].description = e.target.value; });
            tr.querySelector('.select-sup-contact-comm').addEventListener('change', (e) => { currentSupplierContacts[idx].commMethod = e.target.value; });
            tr.querySelector('.input-sup-contact-val').addEventListener('input', (e) => { currentSupplierContacts[idx].value = e.target.value; });
            tr.querySelector('.chk-sup-contact-docrec').addEventListener('change', (e) => { currentSupplierContacts[idx].docReceiver = e.target.checked; });
            tr.querySelector('.input-sup-contact-doctype').addEventListener('input', (e) => { currentSupplierContacts[idx].docType = e.target.value; });

            body.appendChild(tr);
        });
    }

    // Sub-Tab 2: Invoice Address Rendering
    function renderSupplierAddressList() {
        const body = document.getElementById('sup-inv-addr-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierAddresses.length === 0) {
            body.innerHTML = `<tr><td colspan="11" class="text-center" style="color: var(--color-text-muted); padding: 16px;">No invoice addresses configured.</td></tr>`;
            return;
        }

        currentSupplierAddresses.forEach((a, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(a.addressId)}</strong></td>
                <td>${escapeHtml(a.addressType || a.addressTypes?.join(' + ') || 'Delivery')}</td>
                <td>${escapeHtml(a.addr1 || '')}</td>
                <td>${escapeHtml(a.addr2 || '')}</td>
                <td>${escapeHtml(a.city || '')}</td>
                <td>${escapeHtml(a.postcode || '')}</td>
                <td>${escapeHtml(a.state || '')}</td>
                <td>${escapeHtml(a.country || 'GB UNITED KINGDOM')}</td>
                <td>${escapeHtml(a.validFrom || '')}</td>
                <td>${escapeHtml(a.validTo || '')}</td>
                <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary btn-sm btn-edit-addr" data-index="${idx}" style="padding: 2px 6px; font-size: 11px;">✏️</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-del-addr" data-index="${idx}" style="padding: 2px 6px; font-size: 11px; color: #ef4444;">🗑</button>
                </td>
            `;

            tr.querySelector('.btn-edit-addr').addEventListener('click', () => {
                editingSupplierAddressIndex = idx;
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
                setVal('sup-inv-addr1', a.addr1);
                setVal('sup-inv-addr2', a.addr2);
                setVal('sup-inv-city', a.city);
                setVal('sup-inv-postcode', a.postcode);
                setVal('sup-inv-county', a.county);
                setVal('sup-inv-state', a.state);
                setVal('sup-inv-country', a.country || 'GB UNITED KINGDOM');
                setVal('sup-inv-valid-from', a.validFrom);
                setVal('sup-inv-valid-to', a.validTo);
            });

            tr.querySelector('.btn-del-addr').addEventListener('click', () => {
                currentSupplierAddresses.splice(idx, 1);
                renderSupplierAddressList();
            });

            body.appendChild(tr);
        });
    }

    // Sub-Tab 3: Payment Methods & Addresses Rendering
    function renderSupplierPaymentMethodsList() {
        const body = document.getElementById('sup-pay-methods-body');
        const count = document.getElementById('sup-pay-methods-count');
        if (count) count.textContent = `${currentSupplierPaymentMethods.length} records`;
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierPaymentMethods.length === 0) {
            body.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No payment methods configured.</td></tr>`;
            return;
        }

        currentSupplierPaymentMethods.forEach((pm, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(pm.method)}</strong></td>
                <td>${escapeHtml(pm.description || '')}</td>
                <td style="text-align: center;">${pm.isDefault ? '✅' : '—'}</td>
                <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary btn-sm btn-del-pm" data-index="${idx}" style="padding: 2px 6px; font-size: 11px; color: #ef4444;">🗑</button>
                </td>
            `;
            tr.querySelector('.btn-del-pm').addEventListener('click', () => {
                currentSupplierPaymentMethods.splice(idx, 1);
                renderSupplierPaymentMethodsList();
            });
            body.appendChild(tr);
        });
    }

    function renderSupplierPaymentAddressesList() {
        const body = document.getElementById('sup-pay-addresses-body');
        const count = document.getElementById('sup-pay-addresses-count');
        if (count) count.textContent = `${currentSupplierPaymentAddresses.length} records`;
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierPaymentAddresses.length === 0) {
            body.innerHTML = `<tr><td colspan="10" class="text-center" style="color: var(--color-text-muted); padding: 12px;">No settlement accounts configured.</td></tr>`;
            return;
        }

        currentSupplierPaymentAddresses.forEach((pa, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(pa.seqId)}</strong></td>
                <td>${escapeHtml(pa.method)}</td>
                <td>${escapeHtml(pa.description || '')}</td>
                <td style="font-family: monospace;">${escapeHtml(pa.bankAccount)}</td>
                <td style="text-align: center;">${pa.isDefault ? '✅' : '—'}</td>
                <td>${escapeHtml(pa.sortCode || '-')}</td>
                <td>${escapeHtml(pa.accountName || '-')}</td>
                <td>${escapeHtml(pa.bldgRef || '-')}</td>
                <td style="text-align: center;"><span class="badge" style="background: #dcfce7; color: #15803d;">${escapeHtml(pa.status || 'Active')}</span></td>
                <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary btn-sm btn-del-pa" data-index="${idx}" style="padding: 2px 6px; font-size: 11px; color: #ef4444;">🗑</button>
                </td>
            `;
            tr.querySelector('.btn-del-pa').addEventListener('click', () => {
                currentSupplierPaymentAddresses.splice(idx, 1);
                renderSupplierPaymentAddressesList();
            });
            body.appendChild(tr);
        });
    }

    // Sub-Tab 5: Files Rendering
    function renderSupplierFileList() {
        const body = document.getElementById('sup-file-table-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierFiles.length === 0) {
            body.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--color-text-muted); padding: 16px;">No documents attached.</td></tr>`;
            return;
        }

        currentSupplierFiles.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(f.name)}</strong></td>
                <td>${escapeHtml(f.otherType || 'SUPPLIER CREATION FORM')}</td>
                <td>${escapeHtml(f.licenceType || '-')}</td>
                <td>${escapeHtml(f.uploadedBy || 'User')}</td>
                <td style="font-size: 11.5px;">${escapeHtml(f.date || formatCurrentDate())}</td>
                <td style="text-align: center;"><button type="button" class="btn btn-secondary btn-sm btn-del-file" data-index="${idx}" style="padding: 2px 6px; color: #ef4444;">🗑</button></td>
                <td style="text-align: center;"><button type="button" class="btn btn-secondary btn-sm btn-dl-file" style="padding: 2px 6px;">📥</button></td>
            `;
            tr.querySelector('.btn-del-file').addEventListener('click', () => {
                currentSupplierFiles.splice(idx, 1);
                renderSupplierFileList();
            });
            tr.querySelector('.btn-dl-file').addEventListener('click', () => {
                showToast(`Downloading file '${f.name}'...`, "info");
            });
            body.appendChild(tr);
        });
    }

    // Sub-Tab 6: Dispatch Address Rendering
    function renderSupplierDispatchAddressList() {
        const body = document.getElementById('sup-disp-addr-body');
        if (!body) return;
        body.innerHTML = '';

        if (currentSupplierDispatchAddresses.length === 0) {
            body.innerHTML = `<tr><td colspan="10" class="text-center" style="color: var(--color-text-muted); padding: 16px;">No dispatch locations configured.</td></tr>`;
            return;
        }

        currentSupplierDispatchAddresses.forEach((d, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(d.addressId)}</strong></td>
                <td>${escapeHtml(d.addr1 || '')}</td>
                <td>${escapeHtml(d.addr2 || '')}</td>
                <td>${escapeHtml(d.city || '')}</td>
                <td>${escapeHtml(d.postcode || '')}</td>
                <td>${escapeHtml(d.state || '')}</td>
                <td>${escapeHtml(d.county || '')}</td>
                <td>${escapeHtml(d.country || 'GB UNITED KINGDOM')}</td>
                <td style="text-align: center;">${d.isDefault ? '✅' : '—'}</td>
                <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary btn-sm btn-del-disp" data-index="${idx}" style="padding: 2px 6px; font-size: 11px; color: #ef4444;">🗑</button>
                </td>
            `;
            tr.querySelector('.btn-del-disp').addEventListener('click', () => {
                currentSupplierDispatchAddresses.splice(idx, 1);
                renderSupplierDispatchAddressList();
            });
            body.appendChild(tr);
        });
    }

    // Form Loading and Collecting
    function loadSupplierIntoForm(s) {
        editingSupplierNo = s.supplierId;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'date') {
                el.value = toISODateString(val);
            } else {
                el.value = (val !== undefined && val !== null) ? val : '';
            }
        };
        const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

        setVal('sup-form-id', s.supplierId);
        setVal('sup-form-name', s.supplierName);
        setVal('sup-form-company', s.company || 'LAXMI01');

        setVal('sup-gen-assoc-no', s.assocNo || '');
        setVal('sup-gen-group', s.supplierGroup || '40 O/H Suppliers');
        setVal('sup-gen-tax-liability', s.taxLiability || 'TAX Taxable');
        setVal('sup-gen-identifier-ref', s.identifierRef || 'Yes');
        setVal('sup-gen-currency', s.currency || 'GBP');
        setVal('sup-gen-free-tax-code', s.freeTaxCode || 'Select Free Tax Code');
        setVal('sup-gen-creation-date', s.creationDate || formatCurrentISODate());
        setVal('sup-gen-payment-term', s.paymentTerm || '0 Due Immediately');
        setVal('sup-gen-tax-code', s.taxCode || 'SUK-11 20');
        setVal('sup-gen-stat-group', s.statGroup || 'OH Overheads');
        setVal('sup-gen-buyer-id', s.buyerId || '*');
        setVal('sup-gen-category-code', s.categoryCode || '');

        // Payment Info
        setVal('sup-pay-invoicing-supplier', s.invoicingSupplier || s.supplierId);
        setVal('sup-pay-authorizer', s.paymentAuthorizer || 'PRICHA');
        setChk('sup-pay-netting', s.nettingAllowed);
        setVal('sup-pay-invoice-recipient', s.invoiceRecipient || '*');
        setChk('sup-pay-blocked', s.blockedForPayment);

        // Licence Info
        setVal('sup-lic-type', s.licenceType || 'Wholesaler');
        setVal('sup-lic-supplier-for', s.supplierFor || 'Select...');
        setVal('sup-lic-company-reg', s.companyRegNo || '');
        setVal('sup-lic-company-reg-expiry', s.companyRegExpiry || '');
        setVal('sup-lic-gdp-gmp-cert-no', s.gdpGmpCertNo || '');
        setVal('sup-lic-expiry-date', s.expiryDate || s.gdpGmpExpiry || '');
        setChk('sup-lic-wholesaler-specials', !!s.wholesalerSpecials);
        setChk('sup-lic-wholesaler-control-drugs', !!s.wholesalerControlDrugs);
        setChk('sup-lic-wholesaler-cold-chain', !!s.wholesalerColdChain);
        setVal('sup-lic-risk-score', s.riskScore || 'Select...');
        setChk('sup-lic-questionnaire', s.questionnaire);
        setVal('sup-lic-tech-approved-date', s.techApprovedDate || '');
        setVal('sup-lic-tech-renewal-date', s.techRenewalDate || '');
        setVal('sup-lic-review-date', s.reviewDate || '');
        setVal('sup-lic-note', s.licenceNote || '');
        updateLicenceInfoLayout();

        // Dispatch
        setVal('sup-disp-supname', s.dispSupName || s.supplierName || '');
        setVal('sup-disp-ship-via', s.dispShipVia || '');
        setVal('sup-disp-resp-person', s.dispRespPerson || '');
        setVal('sup-disp-qual-person', s.dispQualPerson || '');

        currentSupplierContacts = s.contacts ? JSON.parse(JSON.stringify(s.contacts)) : [];
        currentSupplierAddresses = s.addresses ? JSON.parse(JSON.stringify(s.addresses)) : [];
        currentSupplierPaymentMethods = s.paymentMethods ? JSON.parse(JSON.stringify(s.paymentMethods)) : [];
        currentSupplierPaymentAddresses = s.paymentAddresses ? JSON.parse(JSON.stringify(s.paymentAddresses)) : [];
        currentSupplierDispatchAddresses = s.dispatchAddresses ? JSON.parse(JSON.stringify(s.dispatchAddresses)) : [];
        currentSupplierFiles = s.files ? JSON.parse(JSON.stringify(s.files)) : [];
        currentSupplierAuditTrail = s.auditTrail ? JSON.parse(JSON.stringify(s.auditTrail)) : [];

        // Update visuals
        const formTitle = document.getElementById('sup-form-title');
        const formSubtitle = document.getElementById('sup-form-mode-subtitle');
        const badge = document.getElementById('sup-edit-status-badge');

        if (formTitle) formTitle.textContent = `Supplier Record: ${s.supplierId} — ${s.supplierName}`;
        if (formSubtitle) formSubtitle.textContent = `Current Stage: ${s.status} (${s.subStatus}) • Owner: ${s.currentOwner}`;
        if (badge) {
            badge.textContent = `Stage: ${s.status}`;
            badge.style.display = 'inline-block';
        }

        updateWorkflowVisuals(s);
        updateActionButtonsVisibility(s);

        renderSupplierContactsList();
        renderSupplierAddressList();
        renderSupplierPaymentMethodsList();
        renderSupplierPaymentAddressesList();
        renderSupplierDispatchAddressList();
        renderSupplierFileList();
        renderAuditTabInForm(currentSupplierAuditTrail);

        showSupplierFormView();
    }

    function resetSupplierForm() {
        editingSupplierNo = null;

        const setVal = (id, val = '') => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'date') {
                el.value = toISODateString(val);
            } else {
                el.value = val !== undefined && val !== null ? val : '';
            }
        };
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
        setVal('sup-gen-creation-date', formatCurrentISODate());
        setVal('sup-gen-payment-term', '0 Due Immediately');
        setVal('sup-gen-tax-code', 'SUK-11 20');
        setVal('sup-gen-stat-group', 'OH Overheads');
        setVal('sup-gen-buyer-id', '*');
        setVal('sup-gen-category-code', '');

        // Payment
        setVal('sup-pay-invoicing-supplier', '');
        setVal('sup-pay-authorizer', 'PRICHA');
        setChk('sup-pay-netting', false);
        setVal('sup-pay-invoice-recipient', '*');
        setChk('sup-pay-blocked', false);

        // Licence
        setVal('sup-lic-type', 'Wholesaler');
        setVal('sup-lic-supplier-for', 'Select...');
        setVal('sup-lic-company-reg', '');
        setVal('sup-lic-company-reg-expiry', '');
        setVal('sup-lic-gdp-gmp-cert-no', '');
        setVal('sup-lic-expiry-date', '');
        setChk('sup-lic-wholesaler-specials', false);
        setChk('sup-lic-wholesaler-control-drugs', false);
        setChk('sup-lic-wholesaler-cold-chain', false);
        setVal('sup-lic-risk-score', 'Select...');
        setChk('sup-lic-questionnaire', false);
        setVal('sup-lic-tech-approved-date', '');
        setVal('sup-lic-tech-renewal-date', '');
        setVal('sup-lic-review-date', '');
        setVal('sup-lic-note', '');
        updateLicenceInfoLayout();

        // Dispatch
        setVal('sup-disp-supname', '');
        setVal('sup-disp-ship-via', '');
        setVal('sup-disp-resp-person', '');
        setVal('sup-disp-qual-person', '');

        currentSupplierContacts = [];
        currentSupplierAddresses = [];
        currentSupplierPaymentMethods = [];
        currentSupplierPaymentAddresses = [];
        currentSupplierDispatchAddresses = [];
        currentSupplierFiles = [];
        currentSupplierAuditTrail = [];

        const draftSupplier = {
            status: STATUS.DRAFT,
            subStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
            currentOwner: OWNER.FINANCE
        };

        const formTitle = document.getElementById('sup-form-title');
        const formSubtitle = document.getElementById('sup-form-mode-subtitle');
        const badge = document.getElementById('sup-edit-status-badge');

        if (formTitle) formTitle.textContent = 'Create New Supplier (Finance)';
        if (formSubtitle) formSubtitle.textContent = 'Step 1: Enter commercial & payment information, then Submit to QA';
        if (badge) badge.style.display = 'none';

        updateWorkflowVisuals(draftSupplier);
        updateActionButtonsVisibility(draftSupplier);

        renderSupplierContactsList();
        renderSupplierAddressList();
        renderSupplierPaymentMethodsList();
        renderSupplierPaymentAddressesList();
        renderSupplierDispatchAddressList();
        renderSupplierFileList();
        renderAuditTabInForm([]);

        // Default to subtab general
        document.getElementById('btn-sup-subtab-general')?.click();
    }

    function collectFormData() {
        const getVal = id => document.getElementById(id) ? document.getElementById(id).value.trim() : '';
        const getChk = id => document.getElementById(id) ? document.getElementById(id).checked : false;

        const existing = editingSupplierNo ? suppliers.find(s => s.supplierId.toUpperCase() === editingSupplierNo.toUpperCase()) : null;

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
            creationDate: getVal('sup-gen-creation-date') || formatCurrentDate(),
            lastUpdatedDate: formatCurrentDate(),
            paymentTerm: getVal('sup-gen-payment-term'),
            taxCode: getVal('sup-gen-tax-code'),
            statGroup: getVal('sup-gen-stat-group'),
            buyerId: getVal('sup-gen-buyer-id'),
            categoryCode: getVal('sup-gen-category-code'),
            invoicingSupplier: getVal('sup-pay-invoicing-supplier') || getVal('sup-form-id'),
            paymentAuthorizer: getVal('sup-pay-authorizer'),
            nettingAllowed: getChk('sup-pay-netting'),
            invoiceRecipient: getVal('sup-pay-invoice-recipient'),
            blockedForPayment: getChk('sup-pay-blocked'),
            licenceType: getVal('sup-lic-type'),
            supplierFor: getVal('sup-lic-supplier-for'),
            companyRegNo: getVal('sup-lic-company-reg'),
            companyRegExpiry: getVal('sup-lic-company-reg-expiry'),
            gdpGmpCertNo: getVal('sup-lic-gdp-gmp-cert-no'),
            expiryDate: getVal('sup-lic-expiry-date'),
            gdpGmpExpiry: getVal('sup-lic-expiry-date'),
            wholesalerSpecials: getChk('sup-lic-wholesaler-specials'),
            wholesalerControlDrugs: getChk('sup-lic-wholesaler-control-drugs'),
            wholesalerColdChain: getChk('sup-lic-wholesaler-cold-chain'),
            riskScore: getVal('sup-lic-risk-score'),
            questionnaire: getChk('sup-lic-questionnaire'),
            techApprovedDate: getVal('sup-lic-tech-approved-date'),
            techRenewalDate: getVal('sup-lic-tech-renewal-date'),
            reviewDate: getVal('sup-lic-review-date'),
            licenceStatus: document.getElementById('sup-lic-inactive')?.checked ? 'Inactive' : 'Active',
            licenceNote: getVal('sup-lic-note'),
            dispSupName: getVal('sup-disp-supname'),
            dispShipVia: getVal('sup-disp-ship-via'),
            dispRespPerson: getVal('sup-disp-resp-person'),
            dispQualPerson: getVal('sup-disp-qual-person'),
            status: existing ? existing.status : STATUS.DRAFT,
            subStatus: existing ? existing.subStatus : SUB_STATUS.FINANCE_IN_PROGRESS,
            currentOwner: existing ? existing.currentOwner : OWNER.FINANCE,
            rejectionReason: existing ? existing.rejectionReason : '',
            contacts: currentSupplierContacts,
            addresses: currentSupplierAddresses,
            paymentMethods: currentSupplierPaymentMethods,
            paymentAddresses: currentSupplierPaymentAddresses,
            dispatchAddresses: currentSupplierDispatchAddresses,
            files: currentSupplierFiles,
            auditTrail: existing && existing.auditTrail ? existing.auditTrail : currentSupplierAuditTrail
        };
    }

    function showSupplierListView() {
        const panelList = document.getElementById('panel-sup-list');
        const panelForm = document.getElementById('panel-sup-form');
        if (panelForm) panelForm.classList.add('hidden');
        if (panelList) panelList.classList.remove('hidden');
        renderSupplierList();
    }

    function showSupplierFormView() {
        const panelList = document.getElementById('panel-sup-list');
        const panelForm = document.getElementById('panel-sup-form');
        if (panelList) panelList.classList.add('hidden');
        if (panelForm) panelForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateLicenceInfoLayout() {
        const typeSelect = document.getElementById('sup-lic-type');
        const selectedType = typeSelect ? typeSelect.value : 'Wholesaler';
        
        const wholesalerGroup = document.getElementById('sup-lic-wholesaler-product-type-group');
        const productTypeLabel = document.getElementById('sup-lic-product-type-label');
        const gdpCertGroup = document.getElementById('sup-lic-gdp-gmp-cert-no-group');
        const gdpExpiryGroup = document.getElementById('sup-lic-expiry-date-group');

        const riskScoreGroup = document.getElementById('sup-lic-risk-score-group');
        const questionnaireGroup = document.getElementById('sup-lic-questionnaire-group');

        const isVendorForSpecials = (selectedType === 'Vendor for Specials' || selectedType === 'Vendor for Special' || selectedType === 'Vendor for specials');
        const isNonPharm = (selectedType === 'Non Pharmaceutical Service Provider' || selectedType === 'Non-Pharmaceutical Service Provider');

        // Product type section (Wholesaler / Manufacturer / Vendor for Specials)
        if (wholesalerGroup) {
            if (selectedType === 'Wholesaler' || selectedType === 'Manufacturer' || isVendorForSpecials) {
                wholesalerGroup.style.display = 'block';
                if (productTypeLabel) {
                    if (selectedType === 'Manufacturer') {
                        productTypeLabel.textContent = 'Manufacturer Product Type';
                    } else if (isVendorForSpecials) {
                        productTypeLabel.textContent = 'Vendor for Specials Product Type';
                    } else {
                        productTypeLabel.textContent = 'Wholesaler Product Type';
                    }
                }
            } else {
                wholesalerGroup.style.display = 'none';
            }
        }

        // GDP / GMP certificate rows (shown for Wholesaler, Manufacturer, and Vendor for Specials)
        const hasGdpGmp = (selectedType === 'Wholesaler' || selectedType === 'Manufacturer' || isVendorForSpecials);
        if (gdpCertGroup) gdpCertGroup.style.display = hasGdpGmp ? 'block' : 'none';
        if (gdpExpiryGroup) gdpExpiryGroup.style.display = hasGdpGmp ? 'block' : 'none';

        // Risk Score & Questionnaire (hidden for Non-Pharmaceutical Service Provider)
        const showQaFields = !isNonPharm;
        if (riskScoreGroup) riskScoreGroup.style.display = showQaFields ? 'block' : 'none';
        if (questionnaireGroup) questionnaireGroup.style.display = showQaFields ? 'block' : 'none';
    }

    function openLogDetailModal(supplierOverride) {
        const modal = document.getElementById('log-detail-modal');
        const tbody = document.getElementById('log-detail-tbody');
        const pageLabel = document.getElementById('log-current-page');
        const totalPagesLabel = document.getElementById('log-total-pages');
        const countLabel = document.getElementById('log-total-count');

        let supplier = supplierOverride;
        if (!supplier && editingSupplierNo && Array.isArray(suppliers)) {
            supplier = suppliers.find(s => s.supplierId && s.supplierId.toUpperCase() === editingSupplierNo.toUpperCase());
        }
        if (!supplier && Array.isArray(suppliers) && suppliers.length > 0) {
            supplier = suppliers[0];
        }
        
        let logs = [];
        if (supplier && Array.isArray(supplier.auditTrail) && supplier.auditTrail.length > 0) {
            logs = supplier.auditTrail;
        } else {
            logs = [
                {
                    action: "Supplier Setup Initiated",
                    prevStatus: "—",
                    newStatus: "Draft",
                    performedBy: "Sarah Jenkins (Finance)",
                    timestamp: "2026-08-16 09:30:00"
                },
                {
                    action: "Licence Info Updated",
                    prevStatus: "Non WDA Holder",
                    newStatus: "Wholesaler",
                    performedBy: "Vilas Vaidya (QA Lead)",
                    timestamp: "2026-08-18 11:20:15"
                },
                {
                    action: "GDP Certificate Uploaded",
                    prevStatus: "Pending",
                    newStatus: "UK WDA 48291/001",
                    performedBy: "Vilas Vaidya (QA Lead)",
                    timestamp: "2026-08-19 14:45:10"
                }
            ];
        }

        tbody.innerHTML = '';
        logs.forEach((log, index) => {
            const tr = document.createElement('tr');
            tr.style.background = (index % 2 === 0) ? '#ffffff' : '#f8f9fa';
            tr.style.borderBottom = '1px solid #e0e0e0';

            const description = log.action || log.description || 'Record Updated';
            const oldValue = log.prevStatus || log.oldValue || log.prevSubStatus || '—';
            const newValue = log.newStatus || log.newValue || log.newSubStatus || '—';
            const updatedBy = log.performedBy || log.userRole || 'System User';
            
            let dateStr = log.timestamp || log.date || new Date().toISOString().split('T')[0];
            if (log.date && log.time) {
                dateStr = `${log.date} ${log.time}`;
            }

            tr.innerHTML = `
                <td style="padding: 8px 12px; font-weight: 500; color: #222; border-right: 1px solid #eee;">${description}</td>
                <td style="padding: 8px 12px; color: #555; border-right: 1px solid #eee;">${oldValue}</td>
                <td style="padding: 8px 12px; color: #1565c0; font-weight: 600; border-right: 1px solid #eee;">${newValue}</td>
                <td style="padding: 8px 12px; color: #333; border-right: 1px solid #eee;">${updatedBy}</td>
                <td style="padding: 8px 12px; color: #666; font-size: 11px;">${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });

        if (pageLabel) pageLabel.textContent = '1';
        if (totalPagesLabel) totalPagesLabel.textContent = '1';
        if (countLabel) countLabel.textContent = `Total Records: ${logs.length}`;

        modal.classList.remove('hidden');
    }

    // Initialize all listeners and connections
    function initSupplierWorkflowModule() {
        loadSuppliers();

        document.getElementById('sup-lic-type')?.addEventListener('change', updateLicenceInfoLayout);
        updateLicenceInfoLayout();

        // Log Detail Modal Listeners
        document.getElementById('btn-sup-lic-log-detail')?.addEventListener('click', (e) => {
            e.preventDefault();
            openLogDetailModal();
        });
        document.getElementById('btn-close-log-modal')?.addEventListener('click', () => {
            document.getElementById('log-detail-modal')?.classList.add('hidden');
        });
        document.getElementById('btn-ok-log-modal')?.addEventListener('click', () => {
            document.getElementById('log-detail-modal')?.classList.add('hidden');
        });

        // 1. Role Simulation Dropdown (Profile RBAC Modal) & Legacy Buttons
        document.getElementById('sup-workflow-role-selector')?.addEventListener('change', (e) => {
            setSimulationRole(e.target.value);
        });
        document.getElementById('btn-sup-role-finance')?.addEventListener('click', () => setSimulationRole('Finance'));
        document.getElementById('btn-sup-role-qa')?.addEventListener('click', () => setSimulationRole('QA'));
        document.getElementById('btn-sup-role-rp')?.addEventListener('click', () => setSimulationRole('RP'));
        document.getElementById('btn-sup-role-admin')?.addEventListener('click', () => setSimulationRole('Admin'));

        // 2. KPI filter shortcuts
        document.getElementById('kpi-filter-all')?.addEventListener('click', () => {
            selectedStatusFilters = [];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });
        document.getElementById('kpi-filter-draft')?.addEventListener('click', () => {
            selectedStatusFilters = [STATUS.DRAFT];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });
        document.getElementById('kpi-filter-qa')?.addEventListener('click', () => {
            selectedStatusFilters = [STATUS.PENDING_QA, STATUS.QA_REVIEW];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });
        document.getElementById('kpi-filter-rp')?.addEventListener('click', () => {
            selectedStatusFilters = [STATUS.PENDING_RP, STATUS.RP_REVIEW];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });
        document.getElementById('kpi-filter-activation')?.addEventListener('click', () => {
            selectedStatusFilters = [STATUS.ACTIVATION_PENDING];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });
        document.getElementById('kpi-filter-active')?.addEventListener('click', () => {
            selectedStatusFilters = [STATUS.ACTIVE];
            selectedSubStatusFilters = [];
            renderSupplierList();
        });

        // 3. Form Subtab Switcher
        const subTabs = ['general', 'invoice-addr', 'payment', 'licence', 'file', 'dispatch-addr', 'history'];
        subTabs.forEach(t => {
            const btn = document.getElementById(`btn-sup-subtab-${t}`);
            const panel = document.getElementById(`panel-sup-subtab-${t}`);
            if (btn && panel) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    subTabs.forEach(other => {
                        document.getElementById(`btn-sup-subtab-${other}`)?.classList.remove('active');
                        document.getElementById(`panel-sup-subtab-${other}`)?.classList.add('hidden');
                    });
                    btn.classList.add('active');
                    panel.classList.remove('hidden');
                });
            }
        });

        // 4. Quick Create
        document.getElementById('btn-create-supplier-quick')?.addEventListener('click', () => {
            resetSupplierForm();
            showSupplierFormView();
        });

        // 5. Back / Cancel / Copy
        document.getElementById('btn-sup-view-directory')?.addEventListener('click', showSupplierListView);
        document.getElementById('btn-sup-cancel')?.addEventListener('click', () => {
            resetSupplierForm();
            showSupplierListView();
        });
        document.getElementById('btn-sup-copy')?.addEventListener('click', () => {
            const idInput = document.getElementById('sup-form-id');
            if (idInput) {
                idInput.value = '';
                idInput.focus();
            }
            editingSupplierNo = null;
            showToast("Supplier details copied. Enter a new Supplier ID and click 'Save Draft'.", "info");
        });

        // 6. Action Bar Buttons
        document.getElementById('btn-sup-save-draft')?.addEventListener('click', () => executeSaveDraft(true));
        document.getElementById('btn-sup-submit-qa')?.addEventListener('click', () => executeSubmitToQA());
        document.getElementById('btn-sup-save-verification')?.addEventListener('click', () => {
            executeSaveQAVerification();
        });
        document.getElementById('btn-sup-submit-rp')?.addEventListener('click', () => executeSubmitForRPApproval());
        document.getElementById('btn-sup-start-rp-review')?.addEventListener('click', () => {
            if (editingSupplierNo) executeStartRPReview(editingSupplierNo);
        });
        document.getElementById('btn-sup-approve-rp')?.addEventListener('click', () => {
            if (editingSupplierNo) openRPApprovalModal(editingSupplierNo);
        });
        document.getElementById('btn-sup-reject-rp')?.addEventListener('click', () => {
            if (editingSupplierNo) openRejectionModal(editingSupplierNo);
        });
        document.getElementById('btn-sup-activate-qa')?.addEventListener('click', () => executeActivateSupplier());
        document.getElementById('btn-sup-deactivate')?.addEventListener('click', () => executeDeactivateSupplier());

        // 7. Modals Buttons
        document.getElementById('btn-close-rejection-modal')?.addEventListener('click', closeRejectionModal);
        document.getElementById('btn-cancel-rejection-modal')?.addEventListener('click', closeRejectionModal);
        document.getElementById('btn-confirm-rejection')?.addEventListener('click', () => {
            const reason = document.getElementById('sup-reject-reason-input')?.value;
            const target = document.getElementById('sup-reject-target-team')?.value || 'Finance';
            if (!reason || !reason.trim()) {
                showToast("Please enter a mandatory rejection reason.", "danger");
                return;
            }
            const sid = activeModalSupplierId || editingSupplierNo;
            closeRejectionModal();
            executeRejectRP(sid, reason, target);
        });

        document.getElementById('btn-close-approval-modal')?.addEventListener('click', closeRPApprovalModal);
        document.getElementById('btn-cancel-approval-modal')?.addEventListener('click', closeRPApprovalModal);
        document.getElementById('btn-confirm-rp-approval')?.addEventListener('click', () => {
            const remarks = document.getElementById('sup-approval-remarks-input')?.value;
            const sid = activeModalSupplierId || editingSupplierNo;
            closeRPApprovalModal();
            executeApproveRP(sid, remarks);
        });

        document.getElementById('btn-close-email-modal')?.addEventListener('click', closeEmailNotificationModal);
        document.getElementById('btn-dismiss-email-modal')?.addEventListener('click', closeEmailNotificationModal);
        document.getElementById('btn-close-view-modal')?.addEventListener('click', closeSupplierViewModal);

        // 8. Sub-Tab Handlers Wiring
        // Contacts
        document.getElementById('btn-sup-contact-add-row')?.addEventListener('click', () => {
            currentSupplierContacts.push({ selected: false, name: '', description: '', commMethod: 'E-Mail', value: '', docReceiver: false, docType: '' });
            renderSupplierContactsList();
        });
        document.getElementById('btn-sup-contact-delete-selected')?.addEventListener('click', () => {
            currentSupplierContacts = currentSupplierContacts.filter(c => !c.selected);
            renderSupplierContactsList();
        });
        document.getElementById('chk-sup-contacts-all-toggle')?.addEventListener('change', (e) => {
            currentSupplierContacts.forEach(c => c.selected = e.target.checked);
            renderSupplierContactsList();
        });

        // Invoice Address Multiselect Box
        const invAddrTrigger = document.getElementById('sup-inv-addr-type-trigger');
        const invAddrDropdown = document.getElementById('sup-inv-addr-type-dropdown');
        if (invAddrTrigger && invAddrDropdown) {
            invAddrTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                invAddrDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!invAddrTrigger.contains(e.target) && !invAddrDropdown.contains(e.target)) {
                    invAddrDropdown.classList.add('hidden');
                }
            });
        }

        document.getElementById('btn-sup-inv-add-update')?.addEventListener('click', () => {
            const addr1 = document.getElementById('sup-inv-addr1')?.value.trim();
            if (!addr1) {
                showToast("Error: Address 1 is mandatory.", "danger");
                return;
            }
            const newAddr = {
                addressId: `0${currentSupplierAddresses.length + 1}`,
                addressType: 'Delivery + Invoice + Pay',
                addr1: addr1,
                addr2: document.getElementById('sup-inv-addr2')?.value.trim() || '',
                city: document.getElementById('sup-inv-city')?.value.trim() || '',
                postcode: document.getElementById('sup-inv-postcode')?.value.trim() || '',
                county: document.getElementById('sup-inv-county')?.value.trim() || '',
                state: document.getElementById('sup-inv-state')?.value.trim() || '',
                country: document.getElementById('sup-inv-country')?.value || 'GB UNITED KINGDOM',
                validFrom: document.getElementById('sup-inv-valid-from')?.value || '',
                validTo: document.getElementById('sup-inv-valid-to')?.value || ''
            };
            if (editingSupplierAddressIndex !== null && currentSupplierAddresses[editingSupplierAddressIndex]) {
                currentSupplierAddresses[editingSupplierAddressIndex] = newAddr;
                editingSupplierAddressIndex = null;
            } else {
                currentSupplierAddresses.push(newAddr);
            }
            renderSupplierAddressList();
            showToast("Address line saved.", "success");
        });

        document.getElementById('btn-sup-inv-reset')?.addEventListener('click', () => {
            ['sup-inv-addr1', 'sup-inv-addr2', 'sup-inv-city', 'sup-inv-postcode', 'sup-inv-county', 'sup-inv-state', 'sup-inv-valid-from', 'sup-inv-valid-to'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            editingSupplierAddressIndex = null;
        });

        // Payment Methods Add Modal
        document.getElementById('btn-sup-pay-method-add')?.addEventListener('click', () => {
            const modal = document.getElementById('sup-pay-method-modal');
            if (modal) modal.classList.remove('hidden');
        });
        document.getElementById('btn-close-pay-method-modal')?.addEventListener('click', () => {
            document.getElementById('sup-pay-method-modal')?.classList.add('hidden');
        });
        document.getElementById('btn-cancel-pay-method-modal')?.addEventListener('click', () => {
            document.getElementById('sup-pay-method-modal')?.classList.add('hidden');
        });
        document.getElementById('btn-save-pay-method-modal')?.addEventListener('click', () => {
            const method = document.getElementById('modal-pay-method-select')?.value || 'BACS';
            const desc = document.getElementById('modal-pay-method-desc')?.value || 'Electronic Bank Transfer';
            const isDef = document.getElementById('modal-pay-method-default')?.checked || false;

            currentSupplierPaymentMethods.push({ method, description: desc, isDefault: isDef });
            renderSupplierPaymentMethodsList();
            document.getElementById('sup-pay-method-modal')?.classList.add('hidden');
            showToast("Payment method added.", "success");
        });

        // Payment Address Add Modal
        document.getElementById('btn-sup-pay-addr-add')?.addEventListener('click', () => {
            const modal = document.getElementById('sup-pay-addr-modal');
            if (modal) modal.classList.remove('hidden');
        });
        document.getElementById('btn-close-pay-addr-modal')?.addEventListener('click', () => {
            document.getElementById('sup-pay-addr-modal')?.classList.add('hidden');
        });
        document.getElementById('btn-cancel-pay-addr-modal')?.addEventListener('click', () => {
            document.getElementById('sup-pay-addr-modal')?.classList.add('hidden');
        });
        document.getElementById('btn-save-pay-addr-modal')?.addEventListener('click', () => {
            const getVal = id => document.getElementById(id)?.value.trim() || '';
            const seqId = getVal('modal-pay-addr-seq') || `0${currentSupplierPaymentAddresses.length + 1}`;
            const method = getVal('modal-pay-addr-method') || 'BACS';
            const desc = getVal('modal-pay-addr-desc') || 'Settlement Account';
            const bankAcc = getVal('modal-pay-addr-bank-acc') || 'GB00BANK00000000';
            const sortCode = getVal('modal-pay-addr-sort-code') || '00-00-00';
            const name = getVal('modal-pay-addr-name') || document.getElementById('sup-form-name')?.value || 'Supplier Account';
            const bldgRef = getVal('modal-pay-addr-bldg-ref') || '';
            const status = getVal('modal-pay-addr-status') || 'Active';
            const isDef = document.getElementById('modal-pay-addr-default')?.checked || false;

            currentSupplierPaymentAddresses.push({
                seqId, method, description: desc, bankAccount: bankAcc, sortCode, accountName: name, bldgRef, status, isDefault: isDef
            });
            renderSupplierPaymentAddressesList();
            document.getElementById('sup-pay-addr-modal')?.classList.add('hidden');
            showToast("Payment address saved.", "success");
        });

        // File Upload
        document.getElementById('btn-sup-file-upload')?.addEventListener('click', () => {
            const nameInput = document.getElementById('sup-file-name');
            const typeInput = document.getElementById('sup-file-type');
            const fileInput = document.getElementById('sup-file-upload-input');

            const fileName = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : (nameInput?.value.trim() || 'Document.pdf');
            const docCat = typeInput?.value || 'SUPPLIER CREATION FORM';

            currentSupplierFiles.push({
                id: currentSupplierFiles.length + 1,
                name: fileName,
                otherType: docCat,
                licenceType: docCat.includes('LICENCE') ? 'WDA Holder' : '',
                uploadedBy: 'Vilas Vaidya',
                date: formatCurrentDate() + ' ' + formatCurrentTime()
            });

            renderSupplierFileList();
            if (nameInput) nameInput.value = '';
            if (fileInput) fileInput.value = '';
            showToast(`File '${fileName}' uploaded successfully.`, "success");
        });

        // Dispatch Address Handlers
        document.getElementById('btn-sup-disp-add-addr')?.addEventListener('click', () => {
            const addr1 = document.getElementById('sup-disp-typing-addr1')?.value.trim();
            if (!addr1) {
                showToast("Error: Address 1 is mandatory for dispatch address.", "danger");
                return;
            }
            currentSupplierDispatchAddresses.push({
                addressId: `0${currentSupplierDispatchAddresses.length + 1}`,
                addr1: addr1,
                addr2: document.getElementById('sup-disp-typing-addr2')?.value.trim() || '',
                city: document.getElementById('sup-disp-typing-city')?.value.trim() || '',
                postcode: document.getElementById('sup-disp-typing-postcode')?.value.trim() || '',
                county: document.getElementById('sup-disp-typing-county')?.value.trim() || '',
                state: document.getElementById('sup-disp-typing-state')?.value.trim() || '',
                country: document.getElementById('sup-disp-typing-country')?.value || 'GB UNITED KINGDOM',
                isDefault: document.getElementById('sup-disp-typing-default')?.checked || false
            });
            renderSupplierDispatchAddressList();
            showToast("Dispatch address added.", "success");
        });

        document.getElementById('btn-sup-disp-reset')?.addEventListener('click', () => {
            ['sup-disp-typing-addrid', 'sup-disp-typing-addr1', 'sup-disp-typing-addr2', 'sup-disp-typing-city', 'sup-disp-typing-postcode', 'sup-disp-typing-county', 'sup-disp-typing-state'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        });

        // 9. Filters
        initMultiSelectFilters();

        // 10. Initial List Render
        renderSupplierList();
    }

    // Expose global interface for inter-module communication
    window.SupplierWorkflowModule = {
        init: initSupplierWorkflowModule,
        renderList: renderSupplierList,
        setRole: setSimulationRole,
        getCurrentRole: () => currentRole,
        getSuppliers: () => suppliers,
        getFilteredSuppliers: () => {
            const searchId = document.getElementById('sup-search-id')?.value.toLowerCase().trim() || '';
            const searchName = document.getElementById('sup-search-name')?.value.toLowerCase().trim() || '';
            const filterOwner = document.getElementById('sup-filter-owner')?.value || '';
            const filterDate = document.getElementById('sup-filter-create-date')?.value || '';
            return suppliers.filter(s => {
                if (!s) return false;
                if (searchId && (!s.supplierId || !s.supplierId.toLowerCase().includes(searchId))) return false;
                if (searchName && (!s.supplierName || !s.supplierName.toLowerCase().includes(searchName))) return false;
                if (filterOwner && s.currentOwner !== filterOwner) return false;
                if (filterDate && s.creationDate !== filterDate) return false;
                if (selectedStatusFilters.length > 0 && !selectedStatusFilters.includes(s.status)) return false;
                if (selectedSubStatusFilters.length > 0 && !selectedSubStatusFilters.includes(s.subStatus)) return false;
                return true;
            });
        },
        setFilter: (type, val) => {
            if (type === 'status') {
                selectedStatusFilters = Array.isArray(val) ? val : [val];
            } else if (type === 'subStatus') {
                selectedSubStatusFilters = Array.isArray(val) ? val : [val];
            } else if (type === 'owner') {
                const sel = document.getElementById('sup-filter-owner');
                if (sel) sel.value = val;
            }
            renderSupplierList();
        },
        resetFilters: () => {
            selectedStatusFilters = [];
            selectedSubStatusFilters = [];
            const searchId = document.getElementById('sup-search-id');
            const searchName = document.getElementById('sup-search-name');
            const filterOwner = document.getElementById('sup-filter-owner');
            const filterDate = document.getElementById('sup-filter-create-date');
            if (searchId) searchId.value = '';
            if (searchName) searchName.value = '';
            if (filterOwner) filterOwner.value = '';
            if (filterDate) filterDate.value = '';
            renderSupplierList();
        },
        loadSupplier: loadSupplierIntoForm,
        openView: openSupplierViewModal,
        showListView: showSupplierListView,
        showFormView: showSupplierFormView,
        executeSaveDraft,
        executeSubmitToQA,
        executeStartQAReview,
        executeSaveQAVerification,
        executeSubmitForRPApproval,
        executeStartRPReview,
        executeApproveRP,
        executeRejectRP,
        executeActivateSupplier,
        executeDeactivateSupplier,
        openLogDetailModal
    };

    window.showSupplierListView = showSupplierListView;
    window.showSupplierFormView = showSupplierFormView;
    window.openLogDetailModal = openLogDetailModal;

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupplierWorkflowModule);
    } else {
        initSupplierWorkflowModule();
    }

})();
