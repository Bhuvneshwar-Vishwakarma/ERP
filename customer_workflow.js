/**
 * customer_workflow.js
 * 
 * B&S ERP - Customer Master Setup & Lifecycle Workflow Engine (ERP-MD-004)
 * 
 * Controlled Workflow Sequence:
 * Finance (Draft -> Pending QA) ➔ QA Review (Licence Info -> Verification -> Pending Transport) ➔ 
 * Transport (Route ID Assignment -> Pending QA Activation) ➔ QA Activation (6-point validation -> Active)
 * 
 * Key Principles:
 * 1. Controlled Status/Sub-Status progression strictly automated by workflow actions.
 * 2. Separation of duties:
 *    - Finance creates & edits customer draft, submits to QA.
 *    - QA completes Licence Info, verifies customer data, submits to Transport, requests corrections, and activates customer.
 *    - Transport reviews delivery info, assigns mandatory Route ID, and submits for QA activation.
 *    - QA is the sole Activation Authority after 6-point compliance check.
 * 3. Customer remains Inactive until final QA Activation.
 * 4. Full 21 CFR Part 11 style Audit Trail captures every transition, actor, timestamp, remarks, and correction reasons.
 */

(function () {
    'use strict';

    const CUSTOMER_STORAGE_KEY = 'ANTIGRAVITY_ERP_CUSTOMER_DATA_V2';

    // Status Master Constants
    const STATUS = {
        DRAFT: 'Draft',
        PENDING_QA: 'Pending QA',
        QA_REVIEW: 'QA Review',
        PENDING_TRANSPORT: 'Pending Transport',
        TRANSPORT_REVIEW: 'Transport Review',
        PENDING_QA_ACTIVATION: 'Pending QA Activation',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive'
    };

    // Sub-Status Master Constants
    const SUB_STATUS = {
        FINANCE_IN_PROGRESS: 'Finance – In Progress',
        AWAITING_QA_VERIFICATION: 'Awaiting QA Verification',
        LICENCE_PENDING: 'Licence Info – Pending',
        VERIFICATION_IN_PROGRESS: 'Verification In Progress',
        AWAITING_ROUTE_ID: 'Awaiting Route ID',
        ROUTE_ID_IN_PROGRESS: 'Route ID Entry In Progress',
        AWAITING_QA_ACTIVATION: 'Awaiting QA Activation',
        CUSTOMER_ACTIVE: 'Customer Active',
        CUSTOMER_INACTIVE: 'Customer Inactive',
        CORRECTION_REQUIRED: 'Correction Required'
    };

    // Responsible Team / Owner Constants
    const OWNER = {
        FINANCE: 'Finance',
        QA: 'QA',
        TRANSPORT: 'Transport',
        NONE: '—'
    };

    // Pre-populated default dataset covering every single workflow state
    const defaultCustomers = [
        {
            accountNumber: "B9007",
            customerName: "Syrimed Pharmacy Services Ltd",
            company: "LAXMI01",
            customerType: "Group Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "SUK-11 20",
            creationDate: "2026-08-10",
            lastUpdatedDate: "2026-08-19",
            rsm: "David Miller",
            route: "444 DX",
            routeAssignedBy: "Dave Cooper (Transport)",
            routeAssignedDate: "2026-08-18",
            routeNotes: "Priority AM morning pharmaceutical dispatch. Secure cage required.",
            status: STATUS.ACTIVE,
            subStatus: SUB_STATUS.CUSTOMER_ACTIVE,
            currentOwner: OWNER.NONE,
            creditLimit: 155000,
            creditSafeLimit: 120000,
            creditInsurerLimit: 150000,
            creditBlocked: false,
            creditAnalyst: "Teri Dhaliwal",
            creditNote: "Prime group pharmacy partner with spotless payment record.",
            dbNo: "DB-992144",
            dbRating: "5A1 (Superior)",
            creditComment: "Excellent covenant and strong financial ratios.",
            payIndex: "80",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: true,
            relationType: "Subsidiary",
            parentCompany: "LAXMI01",
            parentCustomer: "LAX01",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "ap@syrimed.co.uk",
            generalEmail: "info@syrimed.co.uk",
            licenceType: "Pharmacy",
            gphcNumber: "2087654",
            gphcExpiry: "2027-06-15",
            gphcDocument: "gphc_licence_B9007.pdf",
            licenceStatus: "Active",
            licenceNote: "Full GPhC retail pharmacy registration verified on online register.",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "Syrimed Pharmacy Services Ltd",
                    addr1: "Unit 4 Bradfield Road",
                    addr2: "Ruislip",
                    city: "London",
                    postcode: "HA4 0NU",
                    county: "Middlesex",
                    state: "Greater London",
                    country: "GB",
                    route: "444 DX",
                    telephone: "0208 839 8555",
                    faxNo: "0208 839 8556",
                    taxLiability: "TAX Taxable",
                    taxCode: "SUK-11 20",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "David Sterling", description: "Managing Pharmacist", commMethod: "Email", value: "d.sterling@syrimed.co.uk" },
                { selected: false, name: "Finance Accounts", description: "Accounts Payable", commMethod: "Email", value: "accounts@syrimed.co.uk" }
            ],
            memberships: [
                { membershipNo: "MEM-8801", membershipName: "Laxmico Retail Group", membershipGroup: "Group A", joiningDate: "2024-01-15", leavingDate: "", isDefault: true }
            ],
            auditTrail: [
                {
                    id: "AUD-CUST-1001",
                    date: "10-Aug-2026",
                    time: "09:30:15",
                    timestamp: "2026-08-10T09:30:15",
                    action: "Created Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Initial customer account details captured from new account opening form.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1002",
                    date: "10-Aug-2026",
                    time: "11:45:00",
                    timestamp: "2026-08-10T11:45:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Customer information, credit settings, and trading documents submitted for QA verification.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1003",
                    date: "12-Aug-2026",
                    time: "14:10:00",
                    timestamp: "2026-08-12T14:10:00",
                    action: "QA Started Review",
                    prevStatus: STATUS.PENDING_QA,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.LICENCE_PENDING,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Commenced review of GPhC regulatory credentials and premises verification.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1004",
                    date: "12-Aug-2026",
                    time: "15:20:30",
                    timestamp: "2026-08-12T15:20:30",
                    action: "Licence Info Completed",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.LICENCE_PENDING,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "GPhC licence 2087654 confirmed valid until 15-Jun-2027. Verification in progress.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1005",
                    date: "12-Aug-2026",
                    time: "16:40:00",
                    timestamp: "2026-08-12T16:40:00",
                    action: "Submitted for Route ID",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_TRANSPORT,
                    newSubStatus: SUB_STATUS.AWAITING_ROUTE_ID,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "All QA verification points signed off. Handed over to Transport for route assignment.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1006",
                    date: "18-Aug-2026",
                    time: "10:15:00",
                    timestamp: "2026-08-18T10:15:00",
                    action: "Assigned Route ID",
                    prevStatus: STATUS.PENDING_TRANSPORT,
                    prevSubStatus: SUB_STATUS.AWAITING_ROUTE_ID,
                    newStatus: STATUS.PENDING_QA_ACTIVATION,
                    newSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    performedBy: "Dave Cooper",
                    userRole: "Transport",
                    remarks: "Assigned to route '444 DX' (HA4 West London run). Submitted for final QA activation.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1007",
                    date: "19-Aug-2026",
                    time: "09:00:00",
                    timestamp: "2026-08-19T09:00:00",
                    action: "Customer Activated",
                    prevStatus: STATUS.PENDING_QA_ACTIVATION,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    newStatus: STATUS.ACTIVE,
                    newSubStatus: SUB_STATUS.CUSTOMER_ACTIVE,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Final compliance sign-off complete. Customer account is now fully active in ERP.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B4183",
            customerName: "Flagg Court Pharmacy Limited",
            company: "LAXMI01",
            customerType: "Independent Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-14",
            lastUpdatedDate: "2026-08-19",
            rsm: "John Smith",
            route: "444 DX",
            routeAssignedBy: "Dave Cooper (Transport)",
            routeAssignedDate: "2026-08-19",
            routeNotes: "Standard daily delivery window 09:00-12:00.",
            status: STATUS.PENDING_QA_ACTIVATION,
            subStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
            currentOwner: OWNER.QA,
            creditLimit: 50000,
            creditSafeLimit: 40000,
            creditInsurerLimit: 50000,
            creditBlocked: false,
            creditAnalyst: "Karanjit Samra",
            creditNote: "Independent community pharmacy based inside health centre.",
            dbNo: "DB-338190",
            dbRating: "3A2 (Good)",
            creditComment: "Solid trade references and positive payment history.",
            payIndex: "75",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "accounts@flaggcourt.co.uk",
            generalEmail: "info@flaggcourt.co.uk",
            licenceType: "Pharmacy",
            gphcNumber: "1098765",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B4183.pdf",
            licenceStatus: "Active",
            licenceNote: "GPhC pharmacy register verified by QA.",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "Flagg Court Pharmacy Limited",
                    addr1: "Flagg Court Health Centre",
                    addr2: "Southend-on-Sea",
                    city: "Essex",
                    postcode: "SS1 2LH",
                    county: "Southend",
                    state: "Essex",
                    country: "GB",
                    route: "444 DX",
                    telephone: "01702 468468",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Kunal Patel", description: "Superintendent Pharmacist", commMethod: "Email", value: "kpatel@flaggcourt.co.uk" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1010",
                    date: "14-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-14T10:00:00",
                    action: "Created Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "New account creation started by Finance.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1011",
                    date: "15-Aug-2026",
                    time: "14:30:00",
                    timestamp: "2026-08-15T14:30:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Finance validation complete. Sent to QA.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1012",
                    date: "18-Aug-2026",
                    time: "09:45:00",
                    timestamp: "2026-08-18T09:45:00",
                    action: "QA Completed Licence & Verification",
                    prevStatus: STATUS.PENDING_QA,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    newStatus: STATUS.PENDING_TRANSPORT,
                    newSubStatus: SUB_STATUS.AWAITING_ROUTE_ID,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "GPhC premises licence verified. Handed to Transport.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1013",
                    date: "19-Aug-2026",
                    time: "11:20:00",
                    timestamp: "2026-08-19T11:20:00",
                    action: "Assigned Route ID",
                    prevStatus: STATUS.PENDING_TRANSPORT,
                    prevSubStatus: SUB_STATUS.AWAITING_ROUTE_ID,
                    newStatus: STATUS.PENDING_QA_ACTIVATION,
                    newSubStatus: SUB_STATUS.AWAITING_QA_ACTIVATION,
                    performedBy: "Dave Cooper",
                    userRole: "Transport",
                    remarks: "Route 444 DX allocated. Awaiting final QA activation.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B3211",
            customerName: "RX MEDICATION LTD",
            company: "LAXMI01",
            customerType: "Independent Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-16",
            lastUpdatedDate: "2026-08-18",
            rsm: "John Smith",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.PENDING_TRANSPORT,
            subStatus: SUB_STATUS.AWAITING_ROUTE_ID,
            currentOwner: OWNER.TRANSPORT,
            creditLimit: 155000,
            creditSafeLimit: 100000,
            creditInsurerLimit: 150000,
            creditBlocked: false,
            creditAnalyst: "Karanjit Samra",
            creditNote: "Stamford pharmacy branch trading account.",
            dbNo: "DB-551982",
            dbRating: "4A1 (Strong)",
            creditComment: "Audited financial accounts clean and validated.",
            payIndex: "82",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "stamfordpharmacy@live.com",
            generalEmail: "stamfordpharmacy@live.com",
            licenceType: "Pharmacy",
            gphcNumber: "1038472",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B3211.pdf",
            licenceStatus: "Active",
            licenceNote: "Licence verified on GPhC portal.",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "RX MEDICATION LTD",
                    addr1: "T/A STAMFORD PHARMACY",
                    addr2: "6 ST MARYS HILL",
                    city: "STAMFORD",
                    postcode: "PE9 2DW",
                    county: "LINCOLNSHIRE",
                    state: "Lincolnshire",
                    country: "GB",
                    route: "",
                    telephone: "01780 484999",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Marcus Thorne", description: "Branch Manager", commMethod: "Phone", value: "01780 484999" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1020",
                    date: "16-Aug-2026",
                    time: "11:00:00",
                    timestamp: "2026-08-16T11:00:00",
                    action: "Created Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Created customer account entry.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1021",
                    date: "17-Aug-2026",
                    time: "15:00:00",
                    timestamp: "2026-08-17T15:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Submitted to QA for verification.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1022",
                    date: "18-Aug-2026",
                    time: "14:15:00",
                    timestamp: "2026-08-18T14:15:00",
                    action: "Submitted for Route ID",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.PENDING_TRANSPORT,
                    newSubStatus: SUB_STATUS.AWAITING_ROUTE_ID,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "QA licence check complete. Awaiting Transport Route ID assignment.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B5082",
            customerName: "X-PHARM LTD",
            company: "LAXMI01",
            customerType: "Wholesale",
            customerGroup: "Wholesale Group",
            buyingGroup: "None",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-17",
            lastUpdatedDate: "2026-08-19",
            rsm: "David Miller",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.QA_REVIEW,
            subStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
            currentOwner: OWNER.QA,
            creditLimit: 165000,
            creditSafeLimit: 120000,
            creditInsurerLimit: 160000,
            creditBlocked: false,
            creditAnalyst: "Teri Dhaliwal",
            creditNote: "Wholesale distributor account.",
            dbNo: "DB-449102",
            dbRating: "4A2 (Good)",
            creditComment: "Established wholesale trading history.",
            payIndex: "78",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: true,
            relationType: "Affiliate",
            parentCompany: "LAXMI01",
            parentCustomer: "B0056",
            statGroup: "LAX Perivale",
            priceGroup: "BNS",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Bank Transfer",
            directDebitEnabled: false,
            statementEmailEnabled: true,
            apEmail: "accounts@x-pharm.co.uk",
            generalEmail: "info@x-pharm.co.uk",
            licenceType: "Wholesaler",
            gphcNumber: "UK WDA(H) 4423",
            gphcExpiry: "2027-07-30",
            gphcDocument: "gphc_license_B5082.pdf",
            licenceStatus: "Active",
            licenceNote: "Wholesale dealer authorization WDA(H) verified on MHRA portal.",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "X-PHARM LTD",
                    addr1: "Unit A, X-Pharm Plaza",
                    addr2: "Clarendon Park",
                    city: "LEICESTER",
                    postcode: "LE2 1TU",
                    county: "LEICESTERSHIRE",
                    state: "Leicestershire",
                    country: "GB",
                    route: "",
                    telephone: "0116 270 7140",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Tariq Mahmood", description: "Wholesale Operations Director", commMethod: "Email", value: "t.mahmood@x-pharm.co.uk" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1030",
                    date: "17-Aug-2026",
                    time: "14:00:00",
                    timestamp: "2026-08-17T14:00:00",
                    action: "Created Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Wholesale account setup created.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1031",
                    date: "18-Aug-2026",
                    time: "10:30:00",
                    timestamp: "2026-08-18T10:30:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Finance checks complete.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1032",
                    date: "19-Aug-2026",
                    time: "09:15:00",
                    timestamp: "2026-08-19T09:15:00",
                    action: "QA Licence Info Completed & Review in Progress",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.LICENCE_PENDING,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Licence details entered. QA verifying credit and RP credentials.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B9074",
            customerName: "VIVO HEALTH LIMITED T/A Willow Pharmacy",
            company: "LAXMI01",
            customerType: "Independent Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-18",
            lastUpdatedDate: "2026-08-19",
            rsm: "David Miller",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.QA_REVIEW,
            subStatus: SUB_STATUS.LICENCE_PENDING,
            currentOwner: OWNER.QA,
            creditLimit: 155000,
            creditSafeLimit: 100000,
            creditInsurerLimit: 150000,
            creditBlocked: false,
            creditAnalyst: "Karanjit Samra",
            creditNote: "Community pharmacy branch account.",
            dbNo: "DB-881273",
            dbRating: "3A1 (Good)",
            creditComment: "Trade references positive.",
            payIndex: "77",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "headoffice@everestpharmacy.co.uk",
            generalEmail: "headoffice@everestpharmacy.co.uk",
            licenceType: "Pharmacy",
            gphcNumber: "1034133",
            gphcExpiry: "2027-07-30",
            gphcDocument: "",
            licenceStatus: "Active",
            licenceNote: "",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "VIVO HEALTH LIMITED T/A Willow Pharmacy",
                    addr1: "T/A Willow Pharmacy",
                    addr2: "78 Queen's Road",
                    city: "Leicester",
                    postcode: "LE2 1TU",
                    county: "Leicestershire",
                    state: "Leicestershire",
                    country: "GB",
                    route: "",
                    telephone: "0116 270 7140",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Harpreet Kaur", description: "Pharmacist Manager", commMethod: "Email", value: "h.kaur@vivohealth.co.uk" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1040",
                    date: "18-Aug-2026",
                    time: "16:00:00",
                    timestamp: "2026-08-18T16:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Finance completed account creation. Awaiting QA review.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1041",
                    date: "19-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-19T10:00:00",
                    action: "QA Started Review",
                    prevStatus: STATUS.PENDING_QA,
                    prevSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.LICENCE_PENDING,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Commenced review. Licence Info section requires completion by QA.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B1022",
            customerName: "MEDI-CARE DIRECT LTD",
            company: "LAXMI01",
            customerType: "Online Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "None",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-19",
            lastUpdatedDate: "2026-08-19",
            rsm: "Sarah Jenkins",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.PENDING_QA,
            subStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
            currentOwner: OWNER.QA,
            creditLimit: 75000,
            creditSafeLimit: 50000,
            creditInsurerLimit: 75000,
            creditBlocked: false,
            creditAnalyst: "Karanjit Samra",
            creditNote: "Distance selling pharmacy with online dispensing service.",
            dbNo: "DB-776101",
            dbRating: "3A2 (Good)",
            creditComment: "Newly incorporated distance selling pharmacy with solid credit references.",
            payIndex: "72",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "BNS",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "accounts@medicaredirect.co.uk",
            generalEmail: "support@medicaredirect.co.uk",
            licenceType: "Online Pharmacy",
            gphcNumber: "9012345",
            gphcExpiry: "2028-01-31",
            gphcDocument: "gphc_online_b1022.pdf",
            licenceStatus: "Active",
            licenceNote: "",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "MEDI-CARE DIRECT LTD",
                    addr1: "Unit 12, Apex Business Park",
                    addr2: "Queensway",
                    city: "Birmingham",
                    postcode: "B4 6DH",
                    county: "West Midlands",
                    state: "West Midlands",
                    country: "GB",
                    route: "",
                    telephone: "0121 496 0888",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Liam Vance", description: "Online Superintendent", commMethod: "Email", value: "l.vance@medicaredirect.co.uk" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1050",
                    date: "19-Aug-2026",
                    time: "11:30:00",
                    timestamp: "2026-08-19T11:30:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Finance completed information entry and submitted customer to QA.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B8830",
            customerName: "CAMBRIAN PHARMA HEALTH",
            company: "LAXMI01",
            customerType: "Independent Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-08-19",
            lastUpdatedDate: "2026-08-19",
            rsm: "John Smith",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.DRAFT,
            subStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
            currentOwner: OWNER.FINANCE,
            creditLimit: 30000,
            creditSafeLimit: 25000,
            creditInsurerLimit: 30000,
            creditBlocked: false,
            creditAnalyst: "Teri Dhaliwal",
            creditNote: "Community pharmacy branch account draft in progress.",
            dbNo: "",
            dbRating: "",
            creditComment: "",
            payIndex: "",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "finance@cambrianpharma.co.uk",
            generalEmail: "info@cambrianpharma.co.uk",
            licenceType: "Pharmacy",
            gphcNumber: "1099234",
            gphcExpiry: "2027-11-30",
            gphcDocument: "",
            licenceStatus: "Active",
            licenceNote: "",
            emailAuthChecked: true,
            ddSignedChecked: false,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "CAMBRIAN PHARMA HEALTH",
                    addr1: "15 High Street",
                    addr2: "Aberystwyth",
                    city: "Ceredigion",
                    postcode: "SY23 1NR",
                    county: "Dyfed",
                    state: "Wales",
                    country: "GB",
                    route: "",
                    telephone: "01970 612345",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Gareth Evans", description: "Managing Director", commMethod: "Phone", value: "01970 612345" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1060",
                    date: "19-Aug-2026",
                    time: "14:15:00",
                    timestamp: "2026-08-19T14:15:00",
                    action: "Saved Draft",
                    prevStatus: "—",
                    prevSubStatus: "—",
                    newStatus: STATUS.DRAFT,
                    newSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Finance started draft customer creation. Bank direct debit document pending signature.",
                    correctionReason: ""
                }
            ]
        },
        {
            accountNumber: "B7719",
            customerName: "APEX CARE SPECIALS LTD",
            company: "LAXMI01",
            customerType: "Pharmacy Hub",
            customerGroup: "15 Special",
            buyingGroup: "None",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "SUK-11 20",
            creationDate: "2026-08-15",
            lastUpdatedDate: "2026-08-19",
            rsm: "David Miller",
            route: "Unassigned",
            routeAssignedBy: "",
            routeAssignedDate: "",
            routeNotes: "",
            status: STATUS.QA_REVIEW,
            subStatus: SUB_STATUS.CORRECTION_REQUIRED,
            currentOwner: OWNER.FINANCE,
            creditLimit: 60000,
            creditSafeLimit: 45000,
            creditInsurerLimit: 60000,
            creditBlocked: false,
            creditAnalyst: "Karanjit Samra",
            creditNote: "Compounding specials dispensing account.",
            dbNo: "DB-661290",
            dbRating: "3A2 (Good)",
            creditComment: "",
            payIndex: "70",
            blockedReason: "",
            webOrderingEnabled: true,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "SPE Specials",
            priceGroup: "BNS",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: true,
            statementEmailEnabled: true,
            apEmail: "accounts@apexcarespecials.co.uk",
            generalEmail: "info@apexcarespecials.co.uk",
            licenceType: "Pharmacy Hub",
            gphcNumber: "1098877",
            gphcExpiry: "2027-05-15",
            gphcDocument: "gphc_specials_b7719.pdf",
            licenceStatus: "Active",
            licenceNote: "",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: false,
            addresses: [
                {
                    addressId: "01",
                    customerName: "APEX CARE SPECIALS LTD",
                    addr1: "Unit 8, Innovation House",
                    addr2: "Central Way",
                    city: "London",
                    postcode: "NW10 7FH",
                    county: "Greater London",
                    state: "London",
                    country: "GB",
                    route: "",
                    telephone: "0208 965 4321",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "SUK-11 20",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [
                { selected: false, name: "Claire Adams", description: "Operations Manager", commMethod: "Email", value: "c.adams@apexcarespecials.co.uk" }
            ],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1070",
                    date: "15-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-15T10:00:00",
                    action: "Submitted to QA",
                    prevStatus: STATUS.DRAFT,
                    prevSubStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                    newStatus: STATUS.PENDING_QA,
                    newSubStatus: SUB_STATUS.AWAITING_QA_VERIFICATION,
                    performedBy: "Sarah Jenkins",
                    userRole: "Finance",
                    remarks: "Initial submission to QA.",
                    correctionReason: ""
                },
                {
                    id: "AUD-CUST-1071",
                    date: "18-Aug-2026",
                    time: "16:30:00",
                    timestamp: "2026-08-18T16:30:00",
                    action: "Returned for Correction",
                    prevStatus: STATUS.QA_REVIEW,
                    prevSubStatus: SUB_STATUS.VERIFICATION_IN_PROGRESS,
                    newStatus: STATUS.QA_REVIEW,
                    newSubStatus: SUB_STATUS.CORRECTION_REQUIRED,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Returned to Finance: Registered company address does not match Companies House certificate. Please correct registered address and re-verify postcode.",
                    correctionReason: "Address & Company Registration Mismatch"
                }
            ]
        },
        {
            accountNumber: "B2044",
            customerName: "HEALTHWAYS CHEMISTS LTD",
            company: "LAXMI01",
            customerType: "Independent Pharmacy",
            customerGroup: "15 Retail Laxmico",
            buyingGroup: "Laxmico Retail Group",
            currency: "GBP",
            taxLiability: "TAX Taxable",
            taxCode: "Standard Tax (20%)",
            creationDate: "2026-06-01",
            lastUpdatedDate: "2026-08-10",
            rsm: "John Smith",
            route: "444 DX",
            routeAssignedBy: "Dave Cooper (Transport)",
            routeAssignedDate: "2026-06-05",
            routeNotes: "",
            status: STATUS.INACTIVE,
            subStatus: SUB_STATUS.CUSTOMER_INACTIVE,
            currentOwner: OWNER.NONE,
            creditLimit: 0,
            creditSafeLimit: 0,
            creditInsurerLimit: 0,
            creditBlocked: true,
            creditAnalyst: "Teri Dhaliwal",
            creditNote: "Account closed due to pharmacy relocation/cessation.",
            dbNo: "DB-112233",
            dbRating: "Dissolved",
            creditComment: "Ceased trading June 2026.",
            payIndex: "0",
            blockedReason: "Account Inactivated",
            webOrderingEnabled: false,
            creditRelationExist: false,
            relationType: "",
            parentCompany: "",
            parentCustomer: "",
            statGroup: "LAX Perivale",
            priceGroup: "F",
            paymentTerms: "30E 30 Days End of Month",
            paymentMethod: "Direct Debit",
            directDebitEnabled: false,
            statementEmailEnabled: false,
            apEmail: "accounts@healthways.co.uk",
            generalEmail: "info@healthways.co.uk",
            licenceType: "Pharmacy",
            gphcNumber: "1028374",
            gphcExpiry: "2026-05-31",
            gphcDocument: "gphc_healthways_expired.pdf",
            licenceStatus: "Inactive",
            licenceNote: "Licence expired and not renewed.",
            emailAuthChecked: true,
            ddSignedChecked: true,
            accountFormChecked: true,
            addresses: [
                {
                    addressId: "01",
                    customerName: "HEALTHWAYS CHEMISTS LTD",
                    addr1: "42 Station Road",
                    addr2: "Harrow",
                    city: "London",
                    postcode: "HA1 2TT",
                    county: "Middlesex",
                    state: "London",
                    country: "GB",
                    route: "444 DX",
                    telephone: "0208 427 1234",
                    faxNo: "",
                    taxLiability: "TAX Taxable",
                    taxCode: "Standard Tax (20%)",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ],
            contacts: [],
            memberships: [],
            auditTrail: [
                {
                    id: "AUD-CUST-1080",
                    date: "10-Aug-2026",
                    time: "10:00:00",
                    timestamp: "2026-08-10T10:00:00",
                    action: "Deactivated Customer",
                    prevStatus: STATUS.ACTIVE,
                    prevSubStatus: SUB_STATUS.CUSTOMER_ACTIVE,
                    newStatus: STATUS.INACTIVE,
                    newSubStatus: SUB_STATUS.CUSTOMER_INACTIVE,
                    performedBy: "Dr. Vilas Vaidya",
                    userRole: "QA",
                    remarks: "Account inactivated following cessation of trading and expired GPhC licence.",
                    correctionReason: ""
                }
            ]
        }
    ];

    let customers = [];
    let currentRole = 'Finance'; // Default simulated active role: Finance, QA, Transport, Admin
    let selectedStatusFilters = [];
    let selectedSubStatusFilters = [];
    let activeCustomerInForm = null;

    function sanitizeCustomerRecord(c) {
        if (!c) return c;
        if (!c.customerType) c.customerType = 'Pharmacy';
        if (!c.addresses || c.addresses.length === 0) {
            c.addresses = [
                {
                    addressId: "01",
                    customerName: c.customerName || '',
                    addr1: c.addr1 || "10 High Street, Unit 4",
                    addr2: c.addr2 || "Business Park",
                    city: c.city || "London",
                    postcode: c.postcode || "HA4 6QA",
                    county: c.county || "Greater London",
                    country: c.country || "GB",
                    route: c.route || "444 DX",
                    taxLiability: c.taxLiability || "TAX Taxable",
                    taxCode: c.taxCode || "SUK-11 20",
                    deliveryTerms: "NXW Next Day Delivery",
                    addressType: { delivery: true, deliveryDefault: true, invoice: true, invoiceDefault: true, pay: true, payDefault: true }
                }
            ];
        }
        if (c.status === STATUS.PENDING_QA_ACTIVATION || c.status === STATUS.ACTIVE || c.status === STATUS.PENDING_TRANSPORT || c.status === STATUS.TRANSPORT_REVIEW) {
            c.emailAuthChecked = true;
            c.accountFormChecked = true;
            c.ddSignedChecked = true;
            c.qaVerificationCompleted = true;
        }
        return c;
    }

    // Load customers from localStorage or default dataset
    function loadCustomers() {
        try {
            const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (Array.isArray(data) && data.length > 0) {
                    customers = data.filter(c => c && typeof c === 'object' && c.accountNumber).map(sanitizeCustomerRecord);
                    // Add any missing default customers
                    defaultCustomers.forEach(dc => {
                        if (!customers.some(c => c.accountNumber && c.accountNumber.toUpperCase() === dc.accountNumber.toUpperCase())) {
                            customers.push(sanitizeCustomerRecord(dc));
                        }
                    });
                    saveCustomers();
                    return;
                }
            }
        } catch (e) {
            console.error('Error loading customer workflow data from localStorage', e);
        }
        customers = JSON.parse(JSON.stringify(defaultCustomers)).map(sanitizeCustomerRecord);
        saveCustomers();
    }

    function saveCustomers() {
        try {
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
        } catch (e) {
            console.error('Error saving customer workflow data to localStorage', e);
        }
    }

    // Date/Time formatting helpers
    function formatCurrentDate() {
        const d = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatCurrentISODate() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    function formatCurrentTime() {
        const d = new Date();
        return d.toTimeString().split(' ')[0];
    }

    // Create Audit Entry helper (21 CFR Part 11 style)
    function createAuditEntry(action, prevStatus, prevSubStatus, newStatus, newSubStatus, remarks = '', correctionReason = '') {
        const actorNames = {
            'Finance': 'Sarah Jenkins (Finance)',
            'QA': 'Dr. Vilas Vaidya (QA Lead)',
            'Transport': 'Dave Cooper (Transport Dispatcher)',
            'Admin': 'System Administrator'
        };
        return {
            id: `AUD-CUST-${Date.now().toString().slice(-6)}`,
            date: formatCurrentDate(),
            time: formatCurrentTime(),
            timestamp: new Date().toISOString(),
            action: action,
            prevStatus: prevStatus || '—',
            prevSubStatus: prevSubStatus || '—',
            newStatus: newStatus,
            newSubStatus: newSubStatus,
            performedBy: actorNames[currentRole] || `${currentRole} User`,
            userRole: currentRole,
            remarks: remarks || '',
            correctionReason: correctionReason || ''
        };
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
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
        } else {
            console.log(`[TOAST - ${type.toUpperCase()}]: ${msg}`);
        }
    }

    // Role Permission Guards
    function canRoleCreateOrEditFinance() {
        return currentRole === 'Finance' || currentRole === 'Admin';
    }

    function canRoleVerifyQA() {
        return currentRole === 'QA' || currentRole === 'Admin';
    }

    function canRoleTransport() {
        return currentRole === 'Transport' || currentRole === 'Admin';
    }

    function canRoleActivateQA() {
        return currentRole === 'QA' || currentRole === 'Admin';
    }

    // CSS Class helpers
    function getStatusClass(status) {
        switch (status) {
            case STATUS.DRAFT: return 'status-draft';
            case STATUS.PENDING_QA: return 'status-pending-qa';
            case STATUS.QA_REVIEW: return 'status-qa-review';
            case STATUS.PENDING_TRANSPORT: return 'status-pending-transport';
            case STATUS.TRANSPORT_REVIEW: return 'status-transport-review';
            case STATUS.PENDING_QA_ACTIVATION: return 'status-pending-qa-activation';
            case STATUS.ACTIVE: return 'status-active';
            case STATUS.INACTIVE: return 'status-inactive';
            default: return 'status-draft';
        }
    }

    function getSubStatusClass(subStatus) {
        switch (subStatus) {
            case SUB_STATUS.FINANCE_IN_PROGRESS: return 'substatus-finance-in-progress';
            case SUB_STATUS.AWAITING_QA_VERIFICATION: return 'substatus-awaiting-qa-verification';
            case SUB_STATUS.LICENCE_PENDING: return 'substatus-licence-pending';
            case SUB_STATUS.VERIFICATION_IN_PROGRESS: return 'substatus-verification-in-progress';
            case SUB_STATUS.AWAITING_ROUTE_ID: return 'substatus-awaiting-route-id';
            case SUB_STATUS.ROUTE_ID_IN_PROGRESS: return 'substatus-route-id-in-progress';
            case SUB_STATUS.AWAITING_QA_ACTIVATION: return 'substatus-awaiting-qa-activation';
            case SUB_STATUS.CUSTOMER_ACTIVE: return 'substatus-customer-active';
            case SUB_STATUS.CUSTOMER_INACTIVE: return 'substatus-customer-inactive';
            case SUB_STATUS.CORRECTION_REQUIRED: return 'substatus-correction-required';
            default: return '';
        }
    }

    function getOwnerClass(owner) {
        switch (owner) {
            case OWNER.FINANCE: return 'owner-finance';
            case OWNER.QA: return 'owner-qa';
            case OWNER.TRANSPORT: return 'owner-transport';
            case OWNER.NONE: return 'owner-none';
            default: return 'owner-none';
        }
    }

    function getNextRequiredAction(status, subStatus, owner) {
        if (status === STATUS.DRAFT) return 'Finance enters customer details & submits to QA';
        if (status === STATUS.PENDING_QA) return 'QA verification pending (Start QA Review)';
        if (status === STATUS.QA_REVIEW && subStatus === SUB_STATUS.LICENCE_PENDING) return 'QA completes Licence Info section';
        if (status === STATUS.QA_REVIEW && subStatus === SUB_STATUS.VERIFICATION_IN_PROGRESS) return 'QA verifies details & submits to Transport';
        if (status === STATUS.QA_REVIEW && subStatus === SUB_STATUS.CORRECTION_REQUIRED) return `Correction required by ${owner} before QA re-verification`;
        if (status === STATUS.PENDING_TRANSPORT) return 'Transport assigns mandatory Route ID';
        if (status === STATUS.TRANSPORT_REVIEW) return 'Transport enters Route ID & submits for QA Activation';
        if (status === STATUS.PENDING_QA_ACTIVATION) return 'QA performs compliance check & activates customer';
        if (status === STATUS.ACTIVE) return 'Account Active – Live trading enabled';
        if (status === STATUS.INACTIVE) return 'Account Inactive – Trading blocked';
        return '—';
    }

    // Calculate Visual Stepper Stage (1: Finance, 2: QA Review, 3: Transport Route ID, 4: QA Activation, 5: Active)
    function calculateStepperStage(status, subStatus) {
        if (status === STATUS.DRAFT) return 1;
        if (status === STATUS.PENDING_QA || status === STATUS.QA_REVIEW) return 2;
        if (status === STATUS.PENDING_TRANSPORT || status === STATUS.TRANSPORT_REVIEW) return 3;
        if (status === STATUS.PENDING_QA_ACTIVATION) return 4;
        if (status === STATUS.ACTIVE) return 5;
        if (status === STATUS.INACTIVE) return 0;
        return 1;
    }

    // Dynamic Visual Stepper & Status Banner Renderer
    function updateWorkflowVisuals(customer) {
        if (!customer) return;

        const currentStage = calculateStepperStage(customer.status, customer.subStatus);
        const isCorrection = customer.subStatus === SUB_STATUS.CORRECTION_REQUIRED;

        // Stepper items (5 stages)
        const step1 = document.getElementById('cust-step-1');
        const step2 = document.getElementById('cust-step-2');
        const step3 = document.getElementById('cust-step-3');
        const step4 = document.getElementById('cust-step-4');
        const step5 = document.getElementById('cust-step-5');

        const steps = [step1, step2, step3, step4, step5];
        steps.forEach((step, idx) => {
            if (!step) return;
            step.className = 'stepper-step';
            const stageNum = idx + 1;

            if (currentStage > stageNum) {
                step.classList.add('completed');
                const icon = step.querySelector('.stepper-icon');
                if (icon) icon.innerHTML = '✓';
            } else if (currentStage === stageNum) {
                if (isCorrection) {
                    step.classList.add('rejected');
                    const icon = step.querySelector('.stepper-icon');
                    if (icon) icon.innerHTML = '⚠️';
                } else {
                    step.classList.add('active');
                    const icon = step.querySelector('.stepper-icon');
                    if (icon) icon.innerHTML = `${stageNum}`;
                }
            } else {
                const icon = step.querySelector('.stepper-icon');
                if (icon) icon.innerHTML = `${stageNum}`;
            }
        });

        // Banner Elements
        const bannerStatus = document.getElementById('cust-banner-status');
        const bannerSubStatus = document.getElementById('cust-banner-substatus');
        const bannerOwner = document.getElementById('cust-banner-owner');
        const bannerRoute = document.getElementById('cust-banner-route');
        const bannerAction = document.getElementById('cust-banner-action');
        const bannerCorrectionAlert = document.getElementById('cust-banner-correction-alert');

        if (bannerStatus) {
            bannerStatus.innerHTML = `<span class="status-badge ${getStatusClass(customer.status)}"><span class="dot"></span>${escapeHtml(customer.status)}</span>`;
        }
        if (bannerSubStatus) {
            bannerSubStatus.innerHTML = `<span class="substatus-badge ${getSubStatusClass(customer.subStatus)}">${escapeHtml(customer.subStatus)}</span>`;
        }
        if (bannerOwner) {
            bannerOwner.innerHTML = `<span class="owner-pill ${getOwnerClass(customer.currentOwner)}">👤 ${escapeHtml(customer.currentOwner)}</span>`;
        }
        if (bannerRoute) {
            bannerRoute.textContent = customer.route && customer.route !== 'Unassigned' ? customer.route : 'Not Assigned';
        }
        if (bannerAction) {
            bannerAction.textContent = getNextRequiredAction(customer.status, customer.subStatus, customer.currentOwner);
        }

        if (bannerCorrectionAlert) {
            if (isCorrection) {
                bannerCorrectionAlert.classList.remove('hidden');
                const reasonEl = document.getElementById('cust-banner-correction-reason');
                const lastCorrectionAudit = [...(customer.auditTrail || [])].reverse().find(a => a.action === 'Returned for Correction' || a.correctionReason);
                if (reasonEl) {
                    reasonEl.textContent = lastCorrectionAudit ? `${lastCorrectionAudit.correctionReason} - ${lastCorrectionAudit.remarks}` : 'QA requested corrections.';
                }
            } else {
                bannerCorrectionAlert.classList.add('hidden');
            }
        }

        updateActionButtonsVisibility(customer);
    }

    // Role-Aware Action Buttons Controller
    function updateActionButtonsVisibility(c) {
        const btnSaveDraft = document.getElementById('btn-cust-save-draft');
        const btnSubmitQA = document.getElementById('btn-cust-submit-qa');
        const btnStartQAReview = document.getElementById('btn-cust-start-qa-review');
        const btnSaveLicenceInfo = document.getElementById('btn-cust-save-licence-info');
        const btnSubmitTransport = document.getElementById('btn-cust-submit-transport');
        const btnAssignRouteId = document.getElementById('btn-cust-assign-route-id');
        const btnReturnCorrection = document.getElementById('btn-cust-return-correction');
        const btnResubmitCorrection = document.getElementById('btn-cust-resubmit-correction');
        const btnActivateCustomer = document.getElementById('btn-cust-activate-customer');
        const btnDeactivateCustomer = document.getElementById('btn-cust-deactivate-customer');

        // Hide all initially
        [btnSaveDraft, btnSubmitQA, btnStartQAReview, btnSaveLicenceInfo, btnSubmitTransport,
            btnAssignRouteId, btnReturnCorrection, btnResubmitCorrection, btnActivateCustomer, btnDeactivateCustomer]
            .forEach(btn => { if (btn) btn.style.display = 'none'; });

        if (!c) {
            // New Customer Creation (Finance only)
            if (canRoleCreateOrEditFinance()) {
                if (btnSaveDraft) btnSaveDraft.style.display = 'inline-flex';
                if (btnSubmitQA) btnSubmitQA.style.display = 'inline-flex';
            }
            return;
        }

        const isFinance = canRoleCreateOrEditFinance();
        const isQA = canRoleVerifyQA();
        const isTransport = canRoleTransport();
        const isCorrection = c.subStatus === SUB_STATUS.CORRECTION_REQUIRED;

        // 1. Stage: Draft (Finance - In Progress)
        if (c.status === STATUS.DRAFT) {
            if (isFinance) {
                if (btnSaveDraft) btnSaveDraft.style.display = 'inline-flex';
                if (btnSubmitQA) btnSubmitQA.style.display = 'inline-flex';
            }
        }

        // 2. Stage: Pending QA (Awaiting QA Verification)
        else if (c.status === STATUS.PENDING_QA) {
            if (isQA) {
                if (btnStartQAReview) btnStartQAReview.style.display = 'inline-flex';
                if (btnReturnCorrection) btnReturnCorrection.style.display = 'inline-flex';
            }
        }

        // 3. Stage: QA Review
        else if (c.status === STATUS.QA_REVIEW) {
            if (isCorrection) {
                // Correction mode
                if (c.currentOwner === OWNER.FINANCE && isFinance) {
                    if (btnResubmitCorrection) btnResubmitCorrection.style.display = 'inline-flex';
                } else if (c.currentOwner === OWNER.TRANSPORT && isTransport) {
                    if (btnAssignRouteId) btnAssignRouteId.style.display = 'inline-flex';
                }
            } else if (c.subStatus === SUB_STATUS.LICENCE_PENDING) {
                if (isQA) {
                    if (btnSaveLicenceInfo) btnSaveLicenceInfo.style.display = 'inline-flex';
                    if (btnReturnCorrection) btnReturnCorrection.style.display = 'inline-flex';
                }
            } else if (c.subStatus === SUB_STATUS.VERIFICATION_IN_PROGRESS) {
                if (isQA) {
                    if (btnSubmitTransport) btnSubmitTransport.style.display = 'inline-flex';
                    if (btnReturnCorrection) btnReturnCorrection.style.display = 'inline-flex';
                }
            }
        }

        // 4. Stage: Pending Transport / Transport Review
        else if (c.status === STATUS.PENDING_TRANSPORT || c.status === STATUS.TRANSPORT_REVIEW) {
            if (isTransport) {
                if (btnAssignRouteId) btnAssignRouteId.style.display = 'inline-flex';
            }
            if (isQA) {
                if (btnReturnCorrection) btnReturnCorrection.style.display = 'inline-flex';
            }
        }

        // 5. Stage: Pending QA Activation (Awaiting QA Activation)
        else if (c.status === STATUS.PENDING_QA_ACTIVATION) {
            if (isQA) {
                if (btnActivateCustomer) btnActivateCustomer.style.display = 'inline-flex';
                if (btnReturnCorrection) btnReturnCorrection.style.display = 'inline-flex';
            }
        }

        // 6. Stage: Active
        else if (c.status === STATUS.ACTIVE) {
            if (isQA) {
                if (btnDeactivateCustomer) btnDeactivateCustomer.style.display = 'inline-flex';
            }
        }

        // 7. Stage: Inactive
        else if (c.status === STATUS.INACTIVE) {
            if (isQA) {
                if (btnActivateCustomer) btnActivateCustomer.style.display = 'inline-flex';
            }
        }
    }

    // Role simulation switch handler (Synchronized with Global RBAC Profile Selector)
    function setSimulationRole(role) {
        if (!role) return;
        currentRole = role;

        // Synchronize topbar role selector if present
        const rbacSel = document.getElementById('rbac-role-selector');
        if (rbacSel && rbacSel.value !== role && Array.from(rbacSel.options).some(o => o.value === role)) {
            rbacSel.value = role;
        }

        // Re-render views
        renderCustomerList();
        updateKPICards();
        if (activeCustomerInForm) {
            updateWorkflowVisuals(activeCustomerInForm);
        }
    }

    // KPI Metrics calculation and cards update
    function updateKPICards() {
        const totalCount = customers.length;
        const draftCount = customers.filter(c => c.status === STATUS.DRAFT).length;
        const qaCount = customers.filter(c => c.status === STATUS.PENDING_QA || c.status === STATUS.QA_REVIEW).length;
        const transportCount = customers.filter(c => c.status === STATUS.PENDING_TRANSPORT || c.status === STATUS.TRANSPORT_REVIEW).length;
        const activationCount = customers.filter(c => c.status === STATUS.PENDING_QA_ACTIVATION).length;
        const activeCount = customers.filter(c => c.status === STATUS.ACTIVE).length;

        const elTotal = document.getElementById('cust-kpi-total');
        const elDraft = document.getElementById('cust-kpi-draft');
        const elQA = document.getElementById('cust-kpi-qa');
        const elTransport = document.getElementById('cust-kpi-transport');
        const elActivation = document.getElementById('cust-kpi-activation');
        const elActive = document.getElementById('cust-kpi-active');

        if (elTotal) elTotal.textContent = totalCount;
        if (elDraft) elDraft.textContent = draftCount;
        if (elQA) elQA.textContent = qaCount;
        if (elTransport) elTransport.textContent = transportCount;
        if (elActivation) elActivation.textContent = activationCount;
        if (elActive) elActive.textContent = activeCount;
    }

    // Multi-Select Interactive Filter logic
    function initMultiSelectFilters() {
        // Status Multi-Select
        const statusTrigger = document.getElementById('cust-filter-status-trigger');
        const statusDropdown = document.getElementById('cust-filter-status-dropdown');
        const statusChipsContainer = document.getElementById('cust-filter-status-chips');
        const btnStatusSelectAll = document.getElementById('btn-cust-status-select-all');
        const btnStatusClearAll = document.getElementById('btn-cust-status-clear-all');

        // Sub-Status Multi-Select
        const subStatusTrigger = document.getElementById('cust-filter-substatus-trigger');
        const subStatusDropdown = document.getElementById('cust-filter-substatus-dropdown');
        const subStatusChipsContainer = document.getElementById('cust-filter-substatus-chips');
        const btnSubStatusSelectAll = document.getElementById('btn-cust-substatus-select-all');
        const btnSubStatusClearAll = document.getElementById('btn-cust-substatus-clear-all');

        // Toggle dropdowns
        if (statusTrigger && statusDropdown) {
            statusTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (subStatusDropdown) subStatusDropdown.classList.add('hidden');
                statusDropdown.classList.toggle('hidden');
            });
        }

        if (subStatusTrigger && subStatusDropdown) {
            subStatusTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (statusDropdown) statusDropdown.classList.add('hidden');
                subStatusDropdown.classList.toggle('hidden');
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            if (statusDropdown) statusDropdown.classList.add('hidden');
            if (subStatusDropdown) subStatusDropdown.classList.add('hidden');
        });

        if (statusDropdown) {
            statusDropdown.addEventListener('click', (e) => e.stopPropagation());
        }
        if (subStatusDropdown) {
            subStatusDropdown.addEventListener('click', (e) => e.stopPropagation());
        }

        // Checkbox changes for Status
        function updateStatusChips() {
            if (!statusChipsContainer) return;
            const checkboxes = document.querySelectorAll('.chk-filter-cust-status:checked');
            selectedStatusFilters = Array.from(checkboxes).map(cb => cb.value);

            if (selectedStatusFilters.length === 0) {
                statusChipsContainer.innerHTML = `<span style="color: var(--color-text-muted);">All Statuses</span>`;
            } else {
                statusChipsContainer.innerHTML = selectedStatusFilters.map(st => `
                    <span class="chip chip-primary" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 6px; background:#e0e7ff; color:#3730a3; border-radius:4px;">
                        ${escapeHtml(st)}
                        <span class="chip-remove" data-val="${escapeHtml(st)}" style="cursor:pointer; font-weight:bold; margin-left:2px;">&times;</span>
                    </span>
                `).join('');

                statusChipsContainer.querySelectorAll('.chip-remove').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const val = btn.getAttribute('data-val');
                        const cb = document.querySelector(`.chk-filter-cust-status[value="${val}"]`);
                        if (cb) {
                            cb.checked = false;
                            updateStatusChips();
                            renderCustomerList();
                        }
                    });
                });
            }
        }

        document.querySelectorAll('.chk-filter-cust-status').forEach(cb => {
            cb.addEventListener('change', () => {
                updateStatusChips();
                renderCustomerList();
            });
        });

        if (btnStatusSelectAll) {
            btnStatusSelectAll.addEventListener('click', () => {
                document.querySelectorAll('.chk-filter-cust-status').forEach(cb => cb.checked = true);
                updateStatusChips();
                renderCustomerList();
            });
        }

        if (btnStatusClearAll) {
            btnStatusClearAll.addEventListener('click', () => {
                document.querySelectorAll('.chk-filter-cust-status').forEach(cb => cb.checked = false);
                updateStatusChips();
                renderCustomerList();
            });
        }

        // Checkbox changes for Sub-Status
        function updateSubStatusChips() {
            if (!subStatusChipsContainer) return;
            const checkboxes = document.querySelectorAll('.chk-filter-cust-substatus:checked');
            selectedSubStatusFilters = Array.from(checkboxes).map(cb => cb.value);

            if (selectedSubStatusFilters.length === 0) {
                subStatusChipsContainer.innerHTML = `<span style="color: var(--color-text-muted);">All Sub-Statuses</span>`;
            } else {
                subStatusChipsContainer.innerHTML = selectedSubStatusFilters.map(sub => `
                    <span class="chip chip-info" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 6px; background:#e0f2fe; color:#0369a1; border-radius:4px;">
                        ${escapeHtml(sub)}
                        <span class="chip-remove" data-val="${escapeHtml(sub)}" style="cursor:pointer; font-weight:bold; margin-left:2px;">&times;</span>
                    </span>
                `).join('');

                subStatusChipsContainer.querySelectorAll('.chip-remove').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const val = btn.getAttribute('data-val');
                        const cb = document.querySelector(`.chk-filter-cust-substatus[value="${val}"]`);
                        if (cb) {
                            cb.checked = false;
                            updateSubStatusChips();
                            renderCustomerList();
                        }
                    });
                });
            }
        }

        document.querySelectorAll('.chk-filter-cust-substatus').forEach(cb => {
            cb.addEventListener('change', () => {
                updateSubStatusChips();
                renderCustomerList();
            });
        });

        if (btnSubStatusSelectAll) {
            btnSubStatusSelectAll.addEventListener('click', () => {
                document.querySelectorAll('.chk-filter-cust-substatus').forEach(cb => cb.checked = true);
                updateSubStatusChips();
                renderCustomerList();
            });
        }

        if (btnSubStatusClearAll) {
            btnSubStatusClearAll.addEventListener('click', () => {
                document.querySelectorAll('.chk-filter-cust-substatus').forEach(cb => cb.checked = false);
                updateSubStatusChips();
                renderCustomerList();
            });
        }

        // Reset all filters
        const btnClearFilters = document.getElementById('btn-cust-clear-filters');
        if (btnClearFilters) {
            btnClearFilters.addEventListener('click', () => {
                const searchId = document.getElementById('cust-search-id');
                const searchName = document.getElementById('cust-search-name');
                const filterOwner = document.getElementById('cust-filter-owner');
                const filterRoute = document.getElementById('cust-filter-route');
                const filterCreateDate = document.getElementById('cust-filter-create-date');
                const filterUpdateDate = document.getElementById('cust-filter-update-date');

                if (searchId) searchId.value = '';
                if (searchName) searchName.value = '';
                if (filterOwner) filterOwner.value = '';
                if (filterRoute) filterRoute.value = '';
                if (filterCreateDate) filterCreateDate.value = '';
                if (filterUpdateDate) filterUpdateDate.value = '';

                document.querySelectorAll('.chk-filter-cust-status').forEach(cb => cb.checked = false);
                document.querySelectorAll('.chk-filter-cust-substatus').forEach(cb => cb.checked = false);

                updateStatusChips();
                updateSubStatusChips();
                renderCustomerList();
                showToast('Customer directory filters reset.', 'info');
            });
        }
    }

    // Render Customer Directory Table (Section 9)
    function renderCustomerList() {
        const body = document.getElementById('customer-list-body');
        if (!body) return;

        body.innerHTML = '';

        const sId = document.getElementById('cust-search-id')?.value.trim().toLowerCase() || '';
        const sName = document.getElementById('cust-search-name')?.value.trim().toLowerCase() || '';
        const fOwner = document.getElementById('cust-filter-owner')?.value || '';
        const fRoute = document.getElementById('cust-filter-route')?.value.trim().toLowerCase() || '';
        const fCreateDate = document.getElementById('cust-filter-create-date')?.value || '';
        const fUpdateDate = document.getElementById('cust-filter-update-date')?.value || '';

        const filtered = customers.filter(c => {
            if (!c || !c.accountNumber) return false;
            if (sId && !c.accountNumber.toLowerCase().includes(sId)) return false;
            if (sName && (!c.customerName || !c.customerName.toLowerCase().includes(sName))) return false;
            if (fOwner && c.currentOwner !== fOwner) return false;
            if (fRoute && (!c.route || !c.route.toLowerCase().includes(fRoute))) return false;
            if (fCreateDate && c.creationDate !== fCreateDate) return false;
            if (fUpdateDate && c.lastUpdatedDate !== fUpdateDate) return false;
            if (selectedStatusFilters.length > 0 && !selectedStatusFilters.includes(c.status)) return false;
            if (selectedSubStatusFilters.length > 0 && !selectedSubStatusFilters.includes(c.subStatus)) return false;
            return true;
        });

        const countLabel = document.getElementById('cust-list-count-label');
        if (countLabel) {
            countLabel.textContent = `Showing ${filtered.length} of ${customers.length} customer records`;
        }

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--color-text-muted); padding: 30px; text-align:center;">No customers found matching the selected filter criteria.</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const tr = document.createElement('tr');

            // Construct role-based context action button in list row
            let workflowBtn = '';
            const isFinance = canRoleCreateOrEditFinance();
            const isQA = canRoleVerifyQA();
            const isTransport = canRoleTransport();

            if (c.status === STATUS.DRAFT && isFinance) {
                workflowBtn = `<button class="btn btn-sm btn-primary btn-cust-action-submit-qa" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px;">Submit to QA</button>`;
            } else if (c.status === STATUS.PENDING_QA && isQA) {
                workflowBtn = `<button class="btn btn-sm btn-warning btn-cust-action-start-qa" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px; background:#7c3aed; color:#fff; border:none;">Start QA Review</button>`;
            } else if (c.status === STATUS.QA_REVIEW && c.subStatus === SUB_STATUS.LICENCE_PENDING && isQA) {
                workflowBtn = `<button class="btn btn-sm btn-primary btn-cust-action-open-licence" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px;">Licence Info</button>`;
            } else if (c.status === STATUS.QA_REVIEW && c.subStatus === SUB_STATUS.VERIFICATION_IN_PROGRESS && isQA) {
                workflowBtn = `<button class="btn btn-sm btn-primary btn-cust-action-submit-transport" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px;">Submit Transport</button>`;
            } else if ((c.status === STATUS.PENDING_TRANSPORT || c.status === STATUS.TRANSPORT_REVIEW) && isTransport) {
                workflowBtn = `<button class="btn btn-sm btn-info btn-cust-action-assign-route" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px; background:#0284c7; color:#fff; border:none;">Assign Route</button>`;
            } else if (c.status === STATUS.PENDING_QA_ACTIVATION && isQA) {
                workflowBtn = `<button class="btn btn-sm btn-success btn-cust-action-activate" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px; background:#059669; color:#fff; border:none; font-weight:700;">Activate</button>`;
            } else if (c.subStatus === SUB_STATUS.CORRECTION_REQUIRED) {
                if (c.currentOwner === OWNER.FINANCE && isFinance) {
                    workflowBtn = `<button class="btn btn-sm btn-danger btn-cust-action-edit" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px; background:#e11d48; color:#fff; border:none;">Fix & Resubmit</button>`;
                } else if (c.currentOwner === OWNER.TRANSPORT && isTransport) {
                    workflowBtn = `<button class="btn btn-sm btn-danger btn-cust-action-assign-route" data-id="${c.accountNumber}" style="padding: 4px 8px; font-size: 11px; background:#e11d48; color:#fff; border:none;">Fix Route</button>`;
                }
            }

            const routeBadge = c.route && c.route !== 'Unassigned'
                ? `<span style="font-weight:600; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:4px; font-size:11.5px;">🚚 ${escapeHtml(c.route)}</span>`
                : `<span style="color:#94a3b8; font-style:italic; font-size:11px;">Unassigned</span>`;

            tr.innerHTML = `
                <td><strong>${escapeHtml(c.customerName || '')}</strong></td>
                <td><span style="font-family:monospace; font-weight:700; color:var(--color-primary);">${escapeHtml(c.accountNumber || '')}</span></td>
                <td><span class="status-badge ${getStatusClass(c.status)}"><span class="dot"></span>${escapeHtml(c.status || '')}</span></td>
                <td><span class="substatus-badge ${getSubStatusClass(c.subStatus)}">${escapeHtml(c.subStatus || '')}</span></td>
                <td style="text-align: center;"><span class="owner-pill ${getOwnerClass(c.currentOwner)}">👤 ${escapeHtml(c.currentOwner || '—')}</span></td>
                <td>${routeBadge}</td>
                <td><span style="font-size:11.5px; color:var(--color-text-muted);">${escapeHtml(c.creationDate || '—')}</span></td>
                <td><span style="font-size:11.5px; color:var(--color-text-muted);">${escapeHtml(c.lastUpdatedDate || '—')}</span></td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
                        <button class="btn btn-secondary btn-sm btn-cust-action-view" data-id="${c.accountNumber}" title="View Complete Customer Details & Audit Trail" style="padding: 4px 8px; font-size: 11px;">👁️ View</button>
                        <button class="btn btn-secondary btn-sm btn-cust-action-edit" data-id="${c.accountNumber}" title="Open Customer Form" style="padding: 4px 8px; font-size: 11px;">✏️ Edit</button>
                        ${workflowBtn}
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });

        // Bind table action buttons
        body.querySelectorAll('.btn-cust-action-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openCustomerViewModal(id);
            });
        });

        body.querySelectorAll('.btn-cust-action-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const cust = customers.find(c => c.accountNumber === id);
                if (cust) loadCustomerIntoForm(cust);
            });
        });

        body.querySelectorAll('.btn-cust-action-submit-qa').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                executeSubmitToQA(id);
            });
        });

        body.querySelectorAll('.btn-cust-action-start-qa').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                executeStartQAReview(id);
            });
        });

        body.querySelectorAll('.btn-cust-action-open-licence').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const cust = customers.find(c => c.accountNumber === id);
                if (cust) {
                    loadCustomerIntoForm(cust);
                    const tabLicence = document.getElementById('btn-cust-subtab-licence');
                    if (tabLicence) tabLicence.click();
                }
            });
        });

        body.querySelectorAll('.btn-cust-action-submit-transport').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                executeSubmitToTransport(id);
            });
        });

        body.querySelectorAll('.btn-cust-action-assign-route').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openRouteAssignmentModal(id);
            });
        });

        body.querySelectorAll('.btn-cust-action-activate').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openActivationModal(id);
            });
        });

        updateKPICards();
    }

    // =============================================================
    // STATE TRANSITION ENGINE & WORKFLOW ACTIONS
    // =============================================================

    // 1. Finance Saves Draft
    function executeSaveDraft(showNotification = true) {
        if (!canRoleCreateOrEditFinance()) {
            showToast("Permission Denied: Only Finance can create or save draft customer profiles.", "danger");
            return null;
        }

        const data = collectFormData();
        if (!data.accountNumber || !data.customerName) {
            if (showNotification) {
                showToast("Validation Failed: Customer ID and Customer Name are required to save draft.", "danger");
            }
            return null;
        }

        if (!data.customerType || data.customerType.trim() === '') {
            data.customerType = 'Pharmacy';
        }

        const existingIdx = customers.findIndex(c => c.accountNumber && c.accountNumber.toUpperCase() === data.accountNumber.toUpperCase());
        const prevStatus = existingIdx !== -1 ? customers[existingIdx].status : '—';
        const prevSubStatus = existingIdx !== -1 ? customers[existingIdx].subStatus : '—';

        data.status = existingIdx !== -1 ? customers[existingIdx].status : STATUS.DRAFT;
        data.subStatus = existingIdx !== -1 ? customers[existingIdx].subStatus : SUB_STATUS.FINANCE_IN_PROGRESS;
        data.currentOwner = existingIdx !== -1 ? customers[existingIdx].currentOwner : OWNER.FINANCE;
        data.lastUpdatedDate = formatCurrentISODate();

        if (existingIdx !== -1) {
            data.auditTrail = customers[existingIdx].auditTrail || [];
            data.auditTrail.push(createAuditEntry('Saved Draft Updates', prevStatus, prevSubStatus, data.status, data.subStatus, 'Finance saved customer draft updates.'));
            customers[existingIdx] = data;
        } else {
            data.creationDate = formatCurrentISODate();
            data.auditTrail = [createAuditEntry('Created Draft', '—', '—', STATUS.DRAFT, SUB_STATUS.FINANCE_IN_PROGRESS, 'New customer created as Draft by Finance.')];
            customers.unshift(data);
        }

        saveCustomers();
        renderCustomerList();
        activeCustomerInForm = data;
        updateWorkflowVisuals(data);

        if (showNotification) {
            showToast(`Draft saved: Customer '${data.customerName}' is in Draft (Finance – In Progress).`, "success");
        }
        return data;
    }

    // 2. Finance Submits Customer to QA
    function executeSubmitToQA(customerId) {
        if (!canRoleCreateOrEditFinance()) {
            showToast("Permission Denied: Only Finance can submit customer records to QA.", "danger");
            return;
        }

        // Get customer code from argument, form input, or active record
        const formAcctId = document.getElementById('cust-form-account-id')?.value.trim() || '';

        let id = customerId || (activeCustomerInForm ? activeCustomerInForm.accountNumber : null) || formAcctId;

        let idx = id ? customers.findIndex(c => c.accountNumber && c.accountNumber.toUpperCase() === id.toUpperCase()) : -1;

        if (idx === -1) {
            // Save form first
            const saved = executeSaveDraft(false);
            if (!saved) {
                showToast("Validation Failed: Please enter Customer ID and Customer Name before submitting to QA.", "danger");
                return;
            }
            id = saved.accountNumber;
            idx = customers.findIndex(c => c.accountNumber && c.accountNumber.toUpperCase() === id.toUpperCase());
            if (idx === -1) {
                showToast("Error: Unable to locate customer to submit.", "danger");
                return;
            }
        }

        const c = customers[idx];

        // Ensure customerType is present
        if (!c.customerType || c.customerType.trim() === '') {
            c.customerType = document.getElementById('cust-form-customer-type')?.value || 'Pharmacy';
        }

        // Validate basic mandatory fields before submission to QA
        if (!c.customerName || !c.accountNumber) {
            showToast("Validation Failed: Customer ID and Customer Name are required before submitting to QA.", "danger");
            return;
        }

        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.PENDING_QA;
        c.subStatus = SUB_STATUS.AWAITING_QA_VERIFICATION;
        c.currentOwner = OWNER.QA;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Submitted to QA',
            prevStatus,
            prevSubStatus,
            STATUS.PENDING_QA,
            SUB_STATUS.AWAITING_QA_VERIFICATION,
            'Finance completed required customer information and submitted to QA for verification.'
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Customer '${c.customerName}' submitted to QA. Status: Pending QA (Awaiting QA Verification).`, "success");
        showCustomerListView();
    }

    // 3. QA Starts Review
    function executeStartQAReview(customerId) {
        if (!canRoleVerifyQA()) {
            showToast("Permission Denied: Only QA can start review and verification.", "danger");
            return;
        }

        const idx = customers.findIndex(c => c.accountNumber === customerId);
        if (idx === -1) return;

        const c = customers[idx];
        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.QA_REVIEW;
        c.subStatus = SUB_STATUS.LICENCE_PENDING;
        c.currentOwner = OWNER.QA;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'QA Started Review',
            prevStatus,
            prevSubStatus,
            STATUS.QA_REVIEW,
            SUB_STATUS.LICENCE_PENDING,
            'QA commenced regulatory verification. Licence Info section pending completion.'
        ));

        saveCustomers();
        renderCustomerList();
        loadCustomerIntoForm(c);
        const tabLicence = document.getElementById('btn-cust-subtab-licence');
        if (tabLicence) tabLicence.click();

        showToast(`QA Review started for '${c.customerName}'. Please complete Licence Info.`, "info");
    }

    // 4. QA Completes Licence Info & Moves to Verification In Progress
    function executeSaveLicenceInfo(customerId) {
        if (!canRoleVerifyQA()) {
            showToast("Permission Denied: Only QA can complete Licence Information.", "danger");
            return;
        }

        const id = customerId || (activeCustomerInForm ? activeCustomerInForm.accountNumber : null);
        const idx = customers.findIndex(c => c.accountNumber === id);
        if (idx === -1) return;

        const c = customers[idx];

        // Pull licence info from form if currently editing
        const gphcNo = document.getElementById('cust-form-gphc-no')?.value.trim() || c.gphcNumber || '';
        const gphcExpiry = document.getElementById('cust-form-gphc-expiry')?.value || c.gphcExpiry || '';
        const licType = document.getElementById('cust-form-customer-type')?.value || c.licenceType || 'Pharmacy';

        if (!gphcNo) {
            showToast("Validation Failed: Licence / Registration Number is required by QA.", "danger");
            return;
        }

        c.gphcNumber = gphcNo;
        c.gphcExpiry = gphcExpiry;
        c.licenceType = licType;
        c.licenceStatus = 'Active';
        c.emailAuthChecked = true;
        c.accountFormChecked = true;
        c.ddSignedChecked = true;
        c.qaVerificationCompleted = true;

        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.QA_REVIEW;
        c.subStatus = SUB_STATUS.VERIFICATION_IN_PROGRESS;
        c.currentOwner = OWNER.QA;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Licence Info Completed',
            prevStatus,
            prevSubStatus,
            STATUS.QA_REVIEW,
            SUB_STATUS.VERIFICATION_IN_PROGRESS,
            `QA completed Licence Info (Reg No: ${gphcNo}, Expiry: ${gphcExpiry || 'N/A'}). Verification in progress.`
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Licence Info completed for '${c.customerName}'. Status: QA Review (Verification In Progress).`, "success");
    }

    // 5. QA Submits Customer to Transport for Route ID
    function executeSubmitToTransport(customerId) {
        if (!canRoleVerifyQA()) {
            showToast("Permission Denied: Only QA can submit customer records to Transport.", "danger");
            return;
        }

        const id = customerId || (activeCustomerInForm ? activeCustomerInForm.accountNumber : null);
        const idx = customers.findIndex(c => c.accountNumber === id);
        if (idx === -1) return;

        const c = customers[idx];

        if (!c.gphcNumber) {
            showToast("Validation Failed: QA must complete Licence Info before submitting to Transport.", "danger");
            return;
        }

        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.emailAuthChecked = true;
        c.accountFormChecked = true;
        c.ddSignedChecked = true;
        c.qaVerificationCompleted = true;
        c.qaVerifiedBy = 'Dr. Vilas Vaidya (QA Lead)';
        c.qaVerifiedDate = formatCurrentISODate();

        c.status = STATUS.PENDING_TRANSPORT;
        c.subStatus = SUB_STATUS.AWAITING_ROUTE_ID;
        c.currentOwner = OWNER.TRANSPORT;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'QA Submitted to Transport',
            prevStatus,
            prevSubStatus,
            STATUS.PENDING_TRANSPORT,
            SUB_STATUS.AWAITING_ROUTE_ID,
            'QA verification completed and signed off. Customer handed over to Transport team for Route ID assignment.'
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Customer '${c.customerName}' submitted to Transport. Status: Pending Transport (Awaiting Route ID).`, "success");
        showCustomerListView();
    }

    // 6. Transport Assigns Route ID & Submits for QA Activation
    function executeSaveRouteId(customerId, routeId, routeNotes = '') {
        if (!canRoleTransport()) {
            showToast("Permission Denied: Only Transport team can enter or assign Route ID.", "danger");
            return;
        }

        if (!routeId || routeId.trim() === '') {
            showToast("Validation Failed: Route ID is mandatory for Transport assignment.", "danger");
            return;
        }

        const idx = customers.findIndex(c => c.accountNumber === customerId);
        if (idx === -1) return;

        const c = customers[idx];
        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.route = routeId.trim();
        c.routeNotes = routeNotes || '';
        c.routeAssignedBy = 'Dave Cooper (Transport)';
        c.routeAssignedDate = formatCurrentISODate();

        // Update primary address route as well
        if (c.addresses && c.addresses.length > 0) {
            c.addresses.forEach(addr => addr.route = c.route);
        }

        c.status = STATUS.PENDING_QA_ACTIVATION;
        c.subStatus = SUB_STATUS.AWAITING_QA_ACTIVATION;
        c.currentOwner = OWNER.QA;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Assigned Route ID',
            prevStatus,
            prevSubStatus,
            STATUS.PENDING_QA_ACTIVATION,
            SUB_STATUS.AWAITING_QA_ACTIVATION,
            `Transport assigned Route ID '${c.route}' (Notes: ${routeNotes || 'Standard route assignment'}). Submitted for QA Activation.`
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Route ID '${c.route}' saved for '${c.customerName}'. Status: Pending QA Activation (Awaiting QA Activation).`, "success");
        closeRouteAssignmentModal();
    }

    // 7. QA Activation (Strict 6-point validation rule - Section 5 & 10)
    function validateActivationCriteria(customer) {
        const results = {
            valid: true,
            errors: [],
            checks: [
                { id: 1, label: "Mandatory Customer Information Completed", passed: false, detail: "" },
                { id: 2, label: "Licence Info Completed by QA", passed: false, detail: "" },
                { id: 3, label: "QA Verification Completed", passed: false, detail: "" },
                { id: 4, label: "Route ID Assigned by Transport", passed: false, detail: "" },
                { id: 5, label: "All Required Workflow Steps Completed", passed: false, detail: "" },
                { id: 6, label: "Current State is Pending QA Activation", passed: false, detail: "" }
            ]
        };

        if (!customer) {
            results.valid = false;
            results.errors.push("No customer record specified.");
            return results;
        }

        // Check 1: Mandatory customer information
        const hasName = !!customer.customerName && customer.customerName.trim() !== '';
        const hasCode = !!customer.accountNumber && customer.accountNumber.trim() !== '';
        const hasType = !!customer.customerType && customer.customerType.trim() !== '';
        const hasAddress = (customer.addresses && customer.addresses.length > 0) || !!customer.addr1 || !!customer.postcode;
        if (hasName && hasCode && hasType && hasAddress) {
            results.checks[0].passed = true;
            results.checks[0].detail = `Customer Name: ${customer.customerName}, Type: ${customer.customerType || 'Pharmacy'}, Address confirmed.`;
        } else {
            results.checks[0].passed = false;
            results.checks[0].detail = "Missing customer name, code, type, or valid address line.";
            results.errors.push("Customer mandatory information is incomplete.");
        }

        // Check 2: Licence Info completed
        const hasLicence = !!customer.gphcNumber && customer.gphcNumber.trim() !== '';
        if (hasLicence) {
            results.checks[1].passed = true;
            results.checks[1].detail = `Licence / Reg No: ${customer.gphcNumber} (Expiry: ${customer.gphcExpiry || 'N/A'})`;
        } else {
            results.checks[1].passed = false;
            results.checks[1].detail = "Licence / Registration Number is missing.";
            results.errors.push("Licence Info is incomplete.");
        }

        // Check 3: QA verification completed
        const hasChecklist = customer.qaVerificationCompleted || customer.emailAuthChecked || customer.accountFormChecked || (customer.auditTrail && customer.auditTrail.some(a => a.action.includes('QA') || a.action.includes('Licence') || a.action.includes('Transport') || a.action.includes('Assigned Route ID')));
        if (hasChecklist) {
            results.checks[2].passed = true;
            results.checks[2].detail = "QA compliance verification checklist validated and signed off.";
        } else {
            results.checks[2].passed = false;
            results.checks[2].detail = "QA verification checklist items incomplete.";
            results.errors.push("QA verification checklist is incomplete.");
        }

        // Check 4: Route ID entered by Transport
        const hasRoute = customer.route && customer.route !== 'Unassigned' && customer.route.trim() !== '';
        if (hasRoute) {
            results.checks[3].passed = true;
            results.checks[3].detail = `Route ID: ${customer.route} (Assigned by: ${customer.routeAssignedBy || 'Transport'})`;
        } else {
            results.checks[3].passed = false;
            results.checks[3].detail = "Route ID has not been assigned by Transport team.";
            results.errors.push("Route ID is missing.");
        }

        // Check 5: Workflow steps completed in sequence
        const audit = customer.auditTrail || [];
        const hasFinanceSubmit = audit.some(a => a.action.includes('Submitted to QA') || a.prevStatus === STATUS.DRAFT);
        const hasQASubmitTransport = audit.some(a => a.action.includes('Submitted to Transport') || a.action.includes('Submitted for Route ID') || a.prevStatus === STATUS.QA_REVIEW);
        const hasTransportRoute = audit.some(a => a.action.includes('Assigned Route ID') || a.prevStatus === STATUS.PENDING_TRANSPORT || a.prevStatus === STATUS.TRANSPORT_REVIEW);

        if (hasFinanceSubmit && (hasQASubmitTransport || hasLicence) && (hasTransportRoute || hasRoute)) {
            results.checks[4].passed = true;
            results.checks[4].detail = "Finance → QA Verification → Transport Route ID sequential workflow completed.";
        } else {
            results.checks[4].passed = false;
            results.checks[4].detail = "Sequential workflow trail incomplete.";
            results.errors.push("Required workflow sequence steps have not all been completed.");
        }

        // Check 6: Current state is Pending QA Activation
        if (customer.status === STATUS.PENDING_QA_ACTIVATION) {
            results.checks[5].passed = true;
            results.checks[5].detail = "Customer is in 'Pending QA Activation' state.";
        } else {
            results.checks[5].passed = false;
            results.checks[5].detail = `Customer is currently in '${customer.status}', expected 'Pending QA Activation'.`;
            results.errors.push("Customer is not in Pending QA Activation state.");
        }

        results.valid = results.checks.every(c => c.passed);
        return results;
    }

    function executeActivateCustomer(customerId) {
        if (!canRoleActivateQA()) {
            showToast("Permission Denied: Only QA can perform final Customer Activation.", "danger");
            return;
        }

        const idx = customers.findIndex(c => c.accountNumber === customerId);
        if (idx === -1) return;

        const c = customers[idx];
        const validation = validateActivationCriteria(c);

        if (!validation.valid) {
            showToast(`Activation Prevented: ${validation.errors.join(' ')}`, "danger");
            return;
        }

        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.ACTIVE;
        c.subStatus = SUB_STATUS.CUSTOMER_ACTIVE;
        c.currentOwner = OWNER.NONE;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Customer Activated',
            prevStatus,
            prevSubStatus,
            STATUS.ACTIVE,
            SUB_STATUS.CUSTOMER_ACTIVE,
            'All 6 activation prerequisites verified and passed. Customer account is now fully Active in ERP.'
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`🎉 Success: Customer '${c.customerName}' has been activated! Status: Active (Customer Active).`, "success");
        closeActivationModal();
    }

    // 8. Correction / Rework Flow (Section 7)
    function executeReturnForCorrection(customerId, targetTeam, reason, remarks) {
        if (!canRoleVerifyQA()) {
            showToast("Permission Denied: Only QA can return customer records for correction.", "danger");
            return;
        }

        if (!reason || reason.trim() === '') {
            showToast("Validation Failed: Correction Reason is mandatory.", "danger");
            return;
        }

        const idx = customers.findIndex(c => c.accountNumber === customerId);
        if (idx === -1) return;

        const c = customers[idx];
        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.QA_REVIEW;
        c.subStatus = SUB_STATUS.CORRECTION_REQUIRED;
        c.currentOwner = targetTeam === 'Transport' ? OWNER.TRANSPORT : OWNER.FINANCE;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Returned for Correction',
            prevStatus,
            prevSubStatus,
            STATUS.QA_REVIEW,
            SUB_STATUS.CORRECTION_REQUIRED,
            `QA returned customer to ${c.currentOwner} for correction. Remarks: ${remarks || 'Correction required.'}`,
            reason.trim()
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Customer '${c.customerName}' returned to ${c.currentOwner} for correction. Reason: ${reason}`, "warning");
        closeCorrectionModal();
    }

    // 9. Resubmit after Correction
    function executeResubmitAfterCorrection(customerId) {
        const id = customerId || (activeCustomerInForm ? activeCustomerInForm.accountNumber : null);
        const idx = customers.findIndex(c => c.accountNumber === id);
        if (idx === -1) return;

        const c = customers[idx];
        const isFinance = canRoleCreateOrEditFinance();
        const isTransport = canRoleTransport();

        if (c.currentOwner === OWNER.FINANCE && !isFinance) {
            showToast("Permission Denied: Only Finance can resubmit Finance corrections.", "danger");
            return;
        }

        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.PENDING_QA;
        c.subStatus = SUB_STATUS.AWAITING_QA_VERIFICATION;
        c.currentOwner = OWNER.QA;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Resubmitted after Correction',
            prevStatus,
            prevSubStatus,
            STATUS.PENDING_QA,
            SUB_STATUS.AWAITING_QA_VERIFICATION,
            'Responsible team completed corrections and resubmitted to QA for re-verification.'
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Customer '${c.customerName}' resubmitted to QA for re-verification.`, "success");
        showCustomerListView();
    }

    // 10. Deactivate Customer
    function executeDeactivateCustomer(customerId) {
        if (!canRoleActivateQA()) {
            showToast("Permission Denied: Only QA can deactivate active customer accounts.", "danger");
            return;
        }

        const idx = customers.findIndex(c => c.accountNumber === customerId);
        if (idx === -1) return;

        const c = customers[idx];
        const prevStatus = c.status;
        const prevSubStatus = c.subStatus;

        c.status = STATUS.INACTIVE;
        c.subStatus = SUB_STATUS.CUSTOMER_INACTIVE;
        c.currentOwner = OWNER.NONE;
        c.lastUpdatedDate = formatCurrentISODate();

        if (!c.auditTrail) c.auditTrail = [];
        c.auditTrail.push(createAuditEntry(
            'Deactivated Customer',
            prevStatus,
            prevSubStatus,
            STATUS.INACTIVE,
            SUB_STATUS.CUSTOMER_INACTIVE,
            'Customer account deactivated and flagged as Inactive in ERP.'
        ));

        saveCustomers();
        renderCustomerList();
        if (activeCustomerInForm && activeCustomerInForm.accountNumber === c.accountNumber) {
            activeCustomerInForm = c;
            updateWorkflowVisuals(c);
        }

        showToast(`Customer '${c.customerName}' has been deactivated.`, "warning");
    }

    // =============================================================
    // MODALS & DIALOGS
    // =============================================================

    // Route Assignment Modal
    function openRouteAssignmentModal(customerId) {
        const cust = customers.find(c => c.accountNumber === customerId);
        if (!cust) return;

        const modal = document.getElementById('cust-route-modal-overlay');
        const custNameEl = document.getElementById('cust-route-modal-cust-name') || document.getElementById('cust-route-modal-custname');
        const custCodeEl = document.getElementById('cust-route-modal-cust-code') || document.getElementById('cust-route-modal-custcode');
        const custAddrEl = document.getElementById('cust-route-modal-address');
        const routeSelect = document.getElementById('cust-route-select') || document.getElementById('cust-route-modal-select');
        const routeNotesInput = document.getElementById('cust-route-delivery-notes') || document.getElementById('cust-route-remarks') || document.getElementById('cust-route-modal-notes');

        if (custNameEl) custNameEl.textContent = cust.customerName;
        if (custCodeEl) custCodeEl.textContent = cust.accountNumber;
        if (custAddrEl) {
            const addr = (cust.addresses && cust.addresses[0]) || {};
            custAddrEl.textContent = `${addr.addr1 || ''}, ${addr.city || ''}, ${addr.postcode || ''}`;
        }
        if (routeSelect) {
            routeSelect.value = (cust.route && cust.route !== 'Unassigned') ? cust.route : '444 DX';
        }
        if (routeNotesInput) {
            routeNotesInput.value = cust.routeNotes || '';
        }

        const btnConfirm = document.getElementById('btn-confirm-cust-route') || document.getElementById('btn-cust-route-modal-confirm');
        if (btnConfirm) {
            btnConfirm.onclick = (e) => {
                if (e) e.preventDefault();
                const selRoute = routeSelect ? routeSelect.value : '444 DX';
                const notes = routeNotesInput ? routeNotesInput.value.trim() : '';
                executeSaveRouteId(cust.accountNumber, selRoute, notes);
            };
        }

        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    function closeRouteAssignmentModal() {
        const modal = document.getElementById('cust-route-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // Correction Modal
    function openCorrectionModal(customerId) {
        const cust = customers.find(c => c.accountNumber === customerId);
        if (!cust) return;

        const modal = document.getElementById('cust-correction-modal-overlay');
        const custNameEl = document.getElementById('cust-correction-modal-cust-name') || document.getElementById('cust-correction-modal-custname');
        const custCodeEl = document.getElementById('cust-correction-modal-cust-code') || document.getElementById('cust-correction-modal-custcode');
        const targetTeamSelect = document.getElementById('cust-correction-target-team');
        const reasonSelect = document.getElementById('cust-correction-reason-select');
        const remarksInput = document.getElementById('cust-correction-notes') || document.getElementById('cust-correction-remarks');

        if (custNameEl) custNameEl.textContent = cust.customerName;
        if (custCodeEl) custCodeEl.textContent = cust.accountNumber;
        if (targetTeamSelect) targetTeamSelect.value = 'Finance';
        if (reasonSelect) reasonSelect.selectedIndex = 0;
        if (remarksInput) remarksInput.value = '';

        const btnConfirm = document.getElementById('btn-confirm-cust-correction') || document.getElementById('btn-cust-correction-confirm');
        if (btnConfirm) {
            btnConfirm.onclick = (e) => {
                if (e) e.preventDefault();
                const targetTeam = targetTeamSelect ? targetTeamSelect.value : 'Finance';
                const reason = reasonSelect ? reasonSelect.value : 'Incomplete Customer Information';
                const remarks = remarksInput ? remarksInput.value.trim() : '';
                executeReturnForCorrection(cust.accountNumber, targetTeam, reason, remarks);
            };
        }

        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    function closeCorrectionModal() {
        const modal = document.getElementById('cust-correction-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // Activation Modal (Checklist breakdown)
    function openActivationModal(customerId) {
        const cust = customers.find(c => c.accountNumber === customerId);
        if (!cust) return;

        const modal = document.getElementById('cust-activation-modal-overlay');
        const custNameEl = document.getElementById('cust-activation-modal-cust-name') || document.getElementById('cust-activation-modal-custname');
        const custCodeEl = document.getElementById('cust-activation-modal-cust-code') || document.getElementById('cust-activation-modal-custcode');
        const checklistContainer = document.getElementById('cust-activation-checklist') || document.getElementById('cust-activation-checklist-container');
        const btnConfirm = document.getElementById('btn-confirm-cust-activation') || document.getElementById('btn-cust-activation-confirm');
        const alertBox = document.getElementById('cust-activation-alert-box');
        const remarksInput = document.getElementById('cust-activation-remarks');

        if (custNameEl) custNameEl.textContent = cust.customerName;
        if (custCodeEl) custCodeEl.textContent = cust.accountNumber;

        const validation = validateActivationCriteria(cust);

        if (checklistContainer) {
            checklistContainer.innerHTML = validation.checks.map(chk => `
                <div style="display:flex; align-items:flex-start; gap:10px; padding:8px 12px; background:${chk.passed ? '#f0fdf4' : '#fef2f2'}; border:1px solid ${chk.passed ? '#bbf7d0' : '#fecaca'}; border-radius:6px; margin-bottom:8px;">
                    <span style="font-size:16px; line-height:1;">${chk.passed ? '✅' : '❌'}</span>
                    <div style="flex:1;">
                        <div style="font-size:12.5px; font-weight:700; color:${chk.passed ? '#15803d' : '#b91c1c'};">${chk.id}. ${escapeHtml(chk.label)}</div>
                        <div style="font-size:11.5px; color:${chk.passed ? '#166534' : '#991b1b'}; margin-top:2px;">${escapeHtml(chk.detail)}</div>
                    </div>
                </div>
            `).join('');
        }

        if (btnConfirm) {
            btnConfirm.disabled = !validation.valid;
            btnConfirm.style.opacity = validation.valid ? '1' : '0.5';
            btnConfirm.onclick = (e) => {
                if (e) e.preventDefault();
                const remarks = remarksInput ? remarksInput.value.trim() : '';
                executeActivateCustomer(cust.accountNumber, remarks);
            };
        }

        if (alertBox) {
            if (!validation.valid) {
                alertBox.classList.remove('hidden');
                alertBox.innerHTML = `<strong>Activation Blocked:</strong> ${validation.errors.join(' ')}`;
            } else {
                alertBox.classList.add('hidden');
            }
        }

        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    function closeActivationModal() {
        const modal = document.getElementById('cust-activation-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // Customer View Modal (Tabbed comprehensive view with Audit Trail)
    function openCustomerViewModal(customerId) {
        const cust = customers.find(c => c.accountNumber === customerId);
        if (!cust) return;

        const modal = document.getElementById('cust-view-modal-overlay');
        if (!modal) return;

        // Populate Header Info
        const titleEl = document.getElementById('cust-view-title');
        const codeEl = document.getElementById('cust-view-code');
        const statusEl = document.getElementById('cust-view-status');
        const subStatusEl = document.getElementById('cust-view-substatus');
        const ownerEl = document.getElementById('cust-view-owner');
        const routeEl = document.getElementById('cust-view-route');

        if (titleEl) titleEl.textContent = cust.customerName;
        if (codeEl) codeEl.textContent = cust.accountNumber;
        if (statusEl) statusEl.innerHTML = `<span class="status-badge ${getStatusClass(cust.status)}"><span class="dot"></span>${escapeHtml(cust.status)}</span>`;
        if (subStatusEl) subStatusEl.innerHTML = `<span class="substatus-badge ${getSubStatusClass(cust.subStatus)}">${escapeHtml(cust.subStatus)}</span>`;
        if (ownerEl) ownerEl.innerHTML = `<span class="owner-pill ${getOwnerClass(cust.currentOwner)}">👤 ${escapeHtml(cust.currentOwner)}</span>`;
        if (routeEl) routeEl.textContent = cust.route && cust.route !== 'Unassigned' ? cust.route : 'Unassigned';

        // Render Stepper in Modal
        const currentStage = calculateStepperStage(cust.status, cust.subStatus);
        const isCorrection = cust.subStatus === SUB_STATUS.CORRECTION_REQUIRED;
        [1, 2, 3, 4, 5].forEach(stepNum => {
            const stepEl = document.getElementById(`cust-view-step-${stepNum}`);
            if (!stepEl) return;
            stepEl.className = 'stepper-step';
            const icon = stepEl.querySelector('.stepper-icon');

            if (currentStage > stepNum) {
                stepEl.classList.add('completed');
                if (icon) icon.innerHTML = '✓';
            } else if (currentStage === stepNum) {
                if (isCorrection) {
                    stepEl.classList.add('rejected');
                    if (icon) icon.innerHTML = '⚠️';
                } else {
                    stepEl.classList.add('active');
                    if (icon) icon.innerHTML = `${stepNum}`;
                }
            } else {
                if (icon) icon.innerHTML = `${stepNum}`;
            }
        });

        // Tab Content: Overview
        const overviewContainer = document.getElementById('cust-view-tab-overview');
        if (overviewContainer) {
            overviewContainer.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); gap: 14px;">
                    <div><span style="font-size:11.5px; color:#64748b;">Customer ID:</span><div style="font-weight:700; font-family:monospace;">${escapeHtml(cust.accountNumber)}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Customer Name:</span><div style="font-weight:700;">${escapeHtml(cust.customerName)}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Company:</span><div>${escapeHtml(cust.company || 'LAXMI01')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Customer Type:</span><div>${escapeHtml(cust.customerType || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Customer Group:</span><div>${escapeHtml(cust.customerGroup || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Buying Group:</span><div>${escapeHtml(cust.buyingGroup || 'None')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Salesman (RSM):</span><div>${escapeHtml(cust.rsm || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">General Email:</span><div>${escapeHtml(cust.generalEmail || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Creation Date:</span><div>${escapeHtml(cust.creationDate || '—')}</div></div>
                </div>
            `;
        }

        // Tab Content: Address & Route ID
        const addressContainer = document.getElementById('cust-view-tab-address');
        if (addressContainer) {
            const addrs = cust.addresses || [];
            addressContainer.innerHTML = `
                <div style="margin-bottom:16px; padding:12px 16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="font-size:12px; font-weight:700; color:#0369a1;">Logistics Route Assignment:</span>
                        <div style="font-size:15px; font-weight:800; color:#0c4a6e; margin-top:2px;">🚚 ${escapeHtml(cust.route || 'Unassigned')}</div>
                        <div style="font-size:11.5px; color:#0284c7; margin-top:2px;">${escapeHtml(cust.routeNotes ? `Notes: ${cust.routeNotes}` : 'No special route notes.')}</div>
                    </div>
                    <div>
                        <span style="font-size:11px; color:#64748b;">Assigned By:</span>
                        <div style="font-size:12px; font-weight:600; color:#334155;">${escapeHtml(cust.routeAssignedBy || '—')}</div>
                    </div>
                </div>
                <table class="grid-table" style="min-width:100%;">
                    <thead>
                        <tr>
                            <th>Address Line 1</th>
                            <th>City</th>
                            <th>Postcode</th>
                            <th>County</th>
                            <th>Route</th>
                            <th>Telephone</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addrs.map(a => `
                            <tr>
                                <td>${escapeHtml(a.addr1 || '')}</td>
                                <td>${escapeHtml(a.city || '')}</td>
                                <td><strong>${escapeHtml(a.postcode || '')}</strong></td>
                                <td>${escapeHtml(a.county || '')}</td>
                                <td><span style="font-weight:600; color:#0369a1;">${escapeHtml(a.route || cust.route || '—')}</span></td>
                                <td>${escapeHtml(a.telephone || '—')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Tab Content: Credit & Terms
        const creditContainer = document.getElementById('cust-view-tab-credit');
        if (creditContainer) {
            creditContainer.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); gap: 14px;">
                    <div><span style="font-size:11.5px; color:#64748b;">Credit Limit:</span><div style="font-weight:700; font-size:14px; color:#047857;">£${(cust.creditLimit || 0).toLocaleString()}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Payment Terms:</span><div>${escapeHtml(cust.paymentTerms || '30E')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Payment Method:</span><div>${escapeHtml(cust.paymentMethod || 'Direct Debit')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Credit Analyst:</span><div>${escapeHtml(cust.creditAnalyst || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">D&B Rating:</span><div>${escapeHtml(cust.dbRating || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Direct Debit Signed:</span><div>${cust.directDebitEnabled || cust.ddSignedChecked ? '✅ Yes' : '❌ No'}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Accounts Payable Email:</span><div>${escapeHtml(cust.apEmail || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Credit Notes:</span><div>${escapeHtml(cust.creditNote || '—')}</div></div>
                </div>
            `;
        }

        // Tab Content: Licence & Compliance
        const licenceContainer = document.getElementById('cust-view-tab-licence');
        if (licenceContainer) {
            licenceContainer.innerHTML = `
                <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); gap: 14px;">
                    <div><span style="font-size:11.5px; color:#64748b;">Licence Category:</span><div style="font-weight:700;">${escapeHtml(cust.licenceType || cust.customerType || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">GPhC / Licence Reg No:</span><div style="font-weight:700; color:var(--color-primary); font-family:monospace;">${escapeHtml(cust.gphcNumber || 'Not Specified')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Licence Expiry Date:</span><div>${escapeHtml(cust.gphcExpiry || '—')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">QA Licence Status:</span><div><span class="badge badge-success">Active</span></div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Uploaded Licence Document:</span><div>${escapeHtml(cust.gphcDocument || 'None')}</div></div>
                    <div><span style="font-size:11.5px; color:#64748b;">Compliance Notes:</span><div>${escapeHtml(cust.licenceNote || 'GPhC register checked & compliant.')}</div></div>
                </div>
            `;
        }

        // Tab Content: Workflow Audit Trail (Section 12)
        const auditTimelineContainer = document.getElementById('cust-view-audit-timeline');
        const auditTableContainer = document.getElementById('cust-view-audit-table');
        const auditList = cust.auditTrail || [];

        if (auditTimelineContainer) {
            auditTimelineContainer.innerHTML = generateAuditTimelineHtml(auditList);
        }
        if (auditTableContainer) {
            auditTableContainer.innerHTML = generateAuditTableHtml(auditList);
        }

        // Bind Subtabs in View Modal
        modal.querySelectorAll('.cust-view-tab-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.cust-view-tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.cust-view-tab-content').forEach(p => p.classList.add('hidden'));
                btn.classList.add('active');
                const target = btn.getAttribute('data-tab');
                const panel = document.getElementById(`cust-view-tab-${target}`);
                if (panel) panel.classList.remove('hidden');
            };
        });

        // Set default active tab
        const firstTab = modal.querySelector('.cust-view-tab-btn');
        if (firstTab) firstTab.click();

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    function closeCustomerViewModal() {
        const modal = document.getElementById('cust-view-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // Generate Audit Trail Timeline HTML
    function generateAuditTimelineHtml(auditList) {
        if (!auditList || auditList.length === 0) {
            return `<div style="color:var(--color-text-muted); font-style:italic; padding:15px;">No audit events recorded yet.</div>`;
        }

        const reversed = [...auditList].reverse();
        return `
            <div style="display:flex; flex-direction:column; gap:14px; position:relative; padding-left:24px; border-left:2px solid #e2e8f0; margin-left:10px;">
                ${reversed.map((item, idx) => `
                    <div style="position:relative;">
                        <div style="position:absolute; left:-31px; top:3px; width:12px; height:12px; border-radius:50%; background:${idx === 0 ? 'var(--color-primary)' : '#94a3b8'}; border:2px solid #fff; box-shadow:0 0 0 2px ${idx === 0 ? '#c7d2fe' : '#e2e8f0'};"></div>
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                            <span style="font-size:13px; font-weight:700; color:#1e293b;">${escapeHtml(item.action)}</span>
                            <span style="font-size:11px; color:#64748b;">${escapeHtml(item.date)} &bull; ${escapeHtml(item.time)}</span>
                        </div>
                        <div style="font-size:12px; color:#334155; margin-bottom:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <span class="status-badge ${getStatusClass(item.prevStatus)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.prevStatus)}</span>
                            <span style="color:#94a3b8;">➔</span>
                            <span class="status-badge ${getStatusClass(item.newStatus)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.newStatus)}</span>
                            <span style="color:#cbd5e1;">|</span>
                            <span class="substatus-badge ${getSubStatusClass(item.newSubStatus)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.newSubStatus)}</span>
                        </div>
                        <div style="font-size:11.5px; color:#475569;">
                            <strong>Actor:</strong> ${escapeHtml(item.performedBy)} &bull; <span class="owner-pill ${getOwnerClass(item.userRole)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.userRole)}</span>
                        </div>
                        ${item.correctionReason ? `<div style="font-size:11.5px; color:#b91c1c; font-weight:700; margin-top:2px;">⚠️ Correction Reason: ${escapeHtml(item.correctionReason)}</div>` : ''}
                        ${item.remarks ? `<div style="font-size:11.5px; color:#64748b; margin-top:2px; background:#f8fafc; padding:4px 8px; border-radius:4px; border:1px solid #f1f5f9;">${escapeHtml(item.remarks)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Generate Audit Trail Table HTML (Section 12)
    function generateAuditTableHtml(auditList) {
        if (!auditList || auditList.length === 0) {
            return `<div style="color:var(--color-text-muted); font-style:italic; padding:15px;">No audit events recorded yet.</div>`;
        }

        const reversed = [...auditList].reverse();
        return `
            <table class="grid-table" style="min-width:100%;">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Action Performed</th>
                        <th>Previous State</th>
                        <th>New State</th>
                        <th>Performed By (Role)</th>
                        <th>Remarks / Correction Reason</th>
                    </tr>
                </thead>
                <tbody>
                    ${reversed.map(item => `
                        <tr>
                            <td>
                                <div style="font-weight:600; font-size:11.5px;">${escapeHtml(item.date)}</div>
                                <div style="font-size:10.5px; color:#64748b;">${escapeHtml(item.time)}</div>
                            </td>
                            <td><strong>${escapeHtml(item.action)}</strong></td>
                            <td>
                                <div class="status-badge ${getStatusClass(item.prevStatus)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.prevStatus)}</div>
                                <div class="substatus-badge ${getSubStatusClass(item.prevSubStatus)}" style="font-size:10px; padding:1px 6px; margin-top:2px;">${escapeHtml(item.prevSubStatus)}</div>
                            </td>
                            <td>
                                <div class="status-badge ${getStatusClass(item.newStatus)}" style="font-size:10px; padding:1px 6px;">${escapeHtml(item.newStatus)}</div>
                                <div class="substatus-badge ${getSubStatusClass(item.newSubStatus)}" style="font-size:10px; padding:1px 6px; margin-top:2px;">${escapeHtml(item.newSubStatus)}</div>
                            </td>
                            <td>
                                <div>${escapeHtml(item.performedBy)}</div>
                                <div class="owner-pill ${getOwnerClass(item.userRole)}" style="font-size:10px; padding:1px 6px; margin-top:2px;">${escapeHtml(item.userRole)}</div>
                            </td>
                            <td>
                                ${item.correctionReason ? `<div style="color:#b91c1c; font-weight:700; font-size:11px;">Reason: ${escapeHtml(item.correctionReason)}</div>` : ''}
                                <div style="font-size:11.5px; color:#475569;">${escapeHtml(item.remarks || '—')}</div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // =============================================================
    // FORM INTEGRATION & DATA BINDING
    // =============================================================

    function showCustomerListView() {
        const panelList = document.getElementById('panel-cust-list');
        const panelForm = document.getElementById('panel-cust-form');
        if (panelForm) panelForm.classList.add('hidden');
        if (panelList) panelList.classList.remove('hidden');
        renderCustomerList();
    }

    function showCustomerFormView() {
        const panelList = document.getElementById('panel-cust-list');
        const panelForm = document.getElementById('panel-cust-form');
        if (panelList) panelList.classList.add('hidden');
        if (panelForm) panelForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadCustomerIntoForm(c) {
        if (!c) return;
        activeCustomerInForm = c;

        // Let index.js load values into form fields if present
        if (typeof window.legacyLoadCustomerIntoForm === 'function') {
            window.legacyLoadCustomerIntoForm(c);
        }

        const titleEl = document.getElementById('cust-form-title');
        if (titleEl) titleEl.textContent = `Edit Customer: ${c.customerName}`;

        const statusBadge = document.getElementById('cust-edit-status-badge');
        if (statusBadge) {
            statusBadge.textContent = `${c.status} (${c.subStatus})`;
            statusBadge.style.display = 'inline-block';
        }

        updateWorkflowVisuals(c);
        showCustomerFormView();
    }

    function resetCustomerForm() {
        activeCustomerInForm = null;
        if (typeof window.legacyResetCustomerForm === 'function') {
            window.legacyResetCustomerForm();
        }

        const formTitle = document.getElementById('cust-form-title');
        if (formTitle) formTitle.textContent = 'Create New Customer (Finance Stage)';

        const statusBadge = document.getElementById('cust-edit-status-badge');
        if (statusBadge) statusBadge.style.display = 'none';

        const dummyNewCustomer = {
            status: STATUS.DRAFT,
            subStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
            currentOwner: OWNER.FINANCE,
            route: 'Unassigned',
            auditTrail: []
        };
        updateWorkflowVisuals(dummyNewCustomer);
    }

    function collectFormData() {
        let data = null;
        if (typeof window.legacyGetCustomerFormData === 'function') {
            try {
                data = window.legacyGetCustomerFormData();
            } catch (e) {
                console.warn("legacyGetCustomerFormData error:", e);
            }
        }

        const acctId = document.getElementById('cust-form-account-id')?.value.trim() || '';
        const name = document.getElementById('cust-form-name')?.value.trim() || '';
        const company = document.getElementById('cust-form-company')?.value || 'LAXMI01';
        const typeEl = document.getElementById('cust-form-customer-type') || document.getElementById('cust-form-company-type-gen') || document.getElementById('cust-form-type');
        const type = (typeEl && typeEl.value) ? typeEl.value : 'Pharmacy';
        const rsm = document.getElementById('cust-credit-rsm')?.value || 'David Miller';
        const gphcNo = document.getElementById('cust-form-gphc-no')?.value.trim() || '';
        const gphcExpiry = document.getElementById('cust-form-gphc-expiry')?.value || '';

        if (!data) {
            data = {
                accountNumber: acctId,
                customerName: name,
                company: company,
                customerType: type,
                rsm: rsm,
                gphcNumber: gphcNo,
                gphcExpiry: gphcExpiry,
                route: 'Unassigned',
                status: STATUS.DRAFT,
                subStatus: SUB_STATUS.FINANCE_IN_PROGRESS,
                currentOwner: OWNER.FINANCE,
                addresses: [],
                contacts: [],
                auditTrail: []
            };
        } else {
            if (!data.accountNumber) data.accountNumber = acctId;
            if (!data.customerName) data.customerName = name;
            if (!data.company) data.company = company;
            if (!data.customerType) data.customerType = type;
        }

        if (activeCustomerInForm) {
            data.status = activeCustomerInForm.status;
            data.subStatus = activeCustomerInForm.subStatus;
            data.currentOwner = activeCustomerInForm.currentOwner;
            data.route = activeCustomerInForm.route || 'Unassigned';
            data.routeNotes = activeCustomerInForm.routeNotes || '';
            data.routeAssignedBy = activeCustomerInForm.routeAssignedBy || '';
            data.routeAssignedDate = activeCustomerInForm.routeAssignedDate || '';
            data.auditTrail = activeCustomerInForm.auditTrail || [];
        }

        return data;
    }

    // =============================================================
    // INITIALIZATION & EVENT LISTENERS
    // =============================================================

    function initCustomerWorkflowModule() {
        loadCustomers();

        // 1. Role Switcher Buttons
        document.querySelectorAll('.cust-role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const role = btn.getAttribute('data-role');
                setSimulationRole(role);
            });
        });

        // 2. Top KPI Cards Click to Filter
        const kpiFilterMap = [
            { id: 'cust-kpi-card-all', filter: null },
            { id: 'cust-kpi-card-draft', filter: STATUS.DRAFT },
            { id: 'cust-kpi-card-qa', filter: [STATUS.PENDING_QA, STATUS.QA_REVIEW] },
            { id: 'cust-kpi-card-transport', filter: [STATUS.PENDING_TRANSPORT, STATUS.TRANSPORT_REVIEW] },
            { id: 'cust-kpi-card-activation', filter: STATUS.PENDING_QA_ACTIVATION },
            { id: 'cust-kpi-card-active', filter: STATUS.ACTIVE }
        ];

        kpiFilterMap.forEach(item => {
            const card = document.getElementById(item.id);
            if (card) {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.chk-filter-cust-status').forEach(cb => {
                        if (!item.filter) {
                            cb.checked = false;
                        } else if (Array.isArray(item.filter)) {
                            cb.checked = item.filter.includes(cb.value);
                        } else {
                            cb.checked = cb.value === item.filter;
                        }
                    });
                    const trigger = document.getElementById('cust-filter-status-trigger');
                    if (trigger) {
                        const event = new Event('change');
                        document.querySelectorAll('.chk-filter-cust-status').forEach(cb => cb.dispatchEvent(event));
                    }
                });
            }
        });

        // 3. Search & Date Filter Inputs
        ['cust-search-id', 'cust-search-name', 'cust-filter-owner', 'cust-filter-route', 'cust-filter-create-date', 'cust-filter-update-date'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', renderCustomerList);
                el.addEventListener('change', renderCustomerList);
            }
        });

        // 4. Quick Create Button
        const btnCreateQuick = document.getElementById('btn-create-customer-quick');
        if (btnCreateQuick) {
            btnCreateQuick.addEventListener('click', () => {
                if (!canRoleCreateOrEditFinance()) {
                    showToast("Notice: Switching to Finance role for New Customer Creation.", "info");
                    setSimulationRole('Finance');
                }
                resetCustomerForm();
                const acctInput = document.getElementById('cust-form-account-id');
                if (acctInput) acctInput.disabled = false;
                showCustomerFormView();
            });
        }

        // 5. Form Workflow Action Buttons Binding
        const btnSaveDraft = document.getElementById('btn-cust-save-draft');
        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', (e) => {
                e.preventDefault();
                executeSaveDraft(true);
            });
        }

        const btnSubmitQA = document.getElementById('btn-cust-submit-qa');
        if (btnSubmitQA) {
            btnSubmitQA.addEventListener('click', (e) => {
                e.preventDefault();
                executeSubmitToQA();
            });
        }

        const btnSaveLicenceInfo = document.getElementById('btn-cust-save-licence-info');
        if (btnSaveLicenceInfo) {
            btnSaveLicenceInfo.addEventListener('click', (e) => {
                e.preventDefault();
                executeSaveLicenceInfo();
            });
        }

        const btnSubmitTransport = document.getElementById('btn-cust-submit-transport');
        if (btnSubmitTransport) {
            btnSubmitTransport.addEventListener('click', (e) => {
                e.preventDefault();
                executeSubmitToTransport();
            });
        }

        const btnAssignRouteId = document.getElementById('btn-cust-assign-route-id');
        if (btnAssignRouteId) {
            btnAssignRouteId.addEventListener('click', (e) => {
                e.preventDefault();
                if (activeCustomerInForm) {
                    openRouteAssignmentModal(activeCustomerInForm.accountNumber);
                }
            });
        }

        const btnReturnCorrection = document.getElementById('btn-cust-return-correction');
        if (btnReturnCorrection) {
            btnReturnCorrection.addEventListener('click', (e) => {
                e.preventDefault();
                if (activeCustomerInForm) {
                    openCorrectionModal(activeCustomerInForm.accountNumber);
                }
            });
        }

        const btnResubmitCorrection = document.getElementById('btn-cust-resubmit-correction');
        if (btnResubmitCorrection) {
            btnResubmitCorrection.addEventListener('click', (e) => {
                e.preventDefault();
                executeResubmitAfterCorrection();
            });
        }

        const btnActivateCustomer = document.getElementById('btn-cust-activate-customer');
        if (btnActivateCustomer) {
            btnActivateCustomer.addEventListener('click', (e) => {
                e.preventDefault();
                if (activeCustomerInForm) {
                    openActivationModal(activeCustomerInForm.accountNumber);
                }
            });
        }

        const btnDeactivateCustomer = document.getElementById('btn-cust-deactivate-customer');
        if (btnDeactivateCustomer) {
            btnDeactivateCustomer.addEventListener('click', (e) => {
                e.preventDefault();
                if (activeCustomerInForm) {
                    executeDeactivateCustomer(activeCustomerInForm.accountNumber);
                }
            });
        }

        // 6. Form Cancel & Back to List
        const btnCustCancel = document.getElementById('btn-cust-cancel');
        if (btnCustCancel) {
            btnCustCancel.addEventListener('click', (e) => {
                e.preventDefault();
                showCustomerListView();
            });
        }

        // Global topbar Cancel button handler when Customer Workspace is active
        const btnTopCancel = document.getElementById('btn-cancel');
        if (btnTopCancel) {
            btnTopCancel.addEventListener('click', () => {
                const custWorkspace = document.getElementById('customer-creation-workspace');
                if (custWorkspace && !custWorkspace.classList.contains('hidden')) {
                    showCustomerListView();
                }
            });
        }

        // 7. Modal Close & Cancel Buttons
        ['btn-close-cust-view-modal', 'btn-close-cust-view-footer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = closeCustomerViewModal;
        });

        ['btn-close-cust-route-modal', 'btn-cancel-cust-route', 'btn-close-cust-route-modal-footer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = closeRouteAssignmentModal;
        });

        ['btn-close-cust-correction-modal', 'btn-cancel-cust-correction', 'btn-close-cust-correction-modal-footer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = closeCorrectionModal;
        });

        ['btn-close-cust-activation-modal', 'btn-cancel-cust-activation', 'btn-close-cust-activation-modal-footer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = closeActivationModal;
        });

        // View Edit Button in View Modal
        const btnViewEdit = document.getElementById('btn-view-edit-customer') || document.getElementById('btn-cust-view-edit-mode');
        if (btnViewEdit) {
            btnViewEdit.onclick = () => {
                const code = document.getElementById('cust-view-code')?.textContent?.trim();
                const cust = customers.find(c => c.accountNumber === code);
                if (cust) {
                    closeCustomerViewModal();
                    loadCustomerIntoForm(cust);
                }
            };
        }

        // Dismiss modal when clicking on backdrop
        document.querySelectorAll('.cust-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    overlay.style.display = 'none';
                }
            });
        });

        // 8. Multi-select Filters init
        initMultiSelectFilters();

        // 9. Initial List Render
        renderCustomerList();
        updateKPICards();
    }

    // Expose global interface for inter-module integration
    window.CustomerWorkflowModule = {
        STATUS,
        SUB_STATUS,
        OWNER,
        init: initCustomerWorkflowModule,
        renderList: renderCustomerList,
        setRole: setSimulationRole,
        getCurrentRole: () => currentRole,
        getCustomers: () => customers,
        loadCustomer: loadCustomerIntoForm,
        openView: openCustomerViewModal,
        openRouteModal: openRouteAssignmentModal,
        openCorrectionModal: openCorrectionModal,
        openActivationModal: openActivationModal,
        showListView: showCustomerListView,
        showFormView: showCustomerFormView,
        validateActivationCriteria,
        createAuditEntry,
        executeSaveDraft,
        executeSubmitToQA,
        executeStartQAReview,
        executeSaveLicenceInfo,
        executeSubmitToTransport,
        executeSaveRouteId,
        executeActivateCustomer,
        executeReturnForCorrection,
        executeResubmitAfterCorrection,
        executeDeactivateCustomer
    };

    window.showCustomerListView = showCustomerListView;
    window.showCustomerFormView = showCustomerFormView;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomerWorkflowModule);
    } else {
        initCustomerWorkflowModule();
    }

})();
