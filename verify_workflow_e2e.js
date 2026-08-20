const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const basePath = __dirname;
const htmlContent = fs.readFileSync(path.join(basePath, 'index.html'), 'utf8');
const workflowJs = fs.readFileSync(path.join(basePath, 'supplier_workflow.js'), 'utf8');
const indexJs = fs.readFileSync(path.join(basePath, 'index.js'), 'utf8');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${testName} - ${details}`);
        failedTests++;
    }
}

console.log("================================================================================");
console.log("STARTING ERP SUPPLIER STATUS & SUB-STATUS WORKFLOW E2E VERIFICATION SUITE");
console.log("================================================================================\n");

// Setup JSDOM
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
    if (err && typeof err === 'string' && !err.includes('CSS')) {
        console.error("VIRTUAL CONSOLE ERROR:", err);
    }
});

const dom = new JSDOM(htmlContent, {
    url: "http://localhost:3000/",
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});

const { window } = dom;
const { document } = window;

// Polyfills
window.scrollTo = () => {};
window.confirm = () => true;

// Evaluate scripts
try {
    window.eval(workflowJs);
    window.eval(indexJs);
    document.dispatchEvent(new window.Event("DOMContentLoaded"));
} catch (e) {
    console.error("Initialization error:", e);
}

const Mod = window.SupplierWorkflowModule;

// TEST GROUP 1: MODULE INITIALIZATION & DIRECTORY RENDERING
console.log("--- TEST GROUP 1: Directory & Pre-seeded State Verification ---");
assert(Mod !== undefined, "SupplierWorkflowModule is exposed on window");
assert(typeof Mod.init === 'function', "SupplierWorkflowModule has init function");
assert(typeof Mod.renderList === 'function', "SupplierWorkflowModule has renderList function");

// Verify suppliers count in state
const suppliers = Mod.getSuppliers();
assert(suppliers.length >= 8, `Pre-seeded suppliers dataset has ${suppliers.length} records (expected >= 8)`);

// Check KPI cards
const kpiTotal = document.getElementById('sup-kpi-total')?.textContent;
const kpiDraft = document.getElementById('sup-kpi-draft')?.textContent;
const kpiQA = document.getElementById('sup-kpi-qa')?.textContent;
const kpiRP = document.getElementById('sup-kpi-rp')?.textContent;
const kpiActPending = document.getElementById('sup-kpi-activation')?.textContent;
const kpiActive = document.getElementById('sup-kpi-active')?.textContent;

assert(parseInt(kpiTotal) >= 8, `KPI Total Suppliers: ${kpiTotal}`);
assert(parseInt(kpiDraft) >= 1, `KPI Finance Drafts: ${kpiDraft}`);
assert(parseInt(kpiQA) >= 2, `KPI QA Verification: ${kpiQA}`);
assert(parseInt(kpiRP) >= 2, `KPI RP Review/Pending: ${kpiRP}`);
assert(parseInt(kpiActPending) >= 1, `KPI Activation Pending: ${kpiActPending}`);
assert(parseInt(kpiActive) >= 2, `KPI Active: ${kpiActive}`);

// Check Directory table rendering
const tableRows = document.querySelectorAll('#supplier-list-body tr');
assert(tableRows.length === suppliers.length, `Directory table rendered ${tableRows.length} rows`);

// Check Status badges in directory
const statusBadges = document.querySelectorAll('#supplier-list-body .status-badge');
assert(statusBadges.length === suppliers.length, `All ${statusBadges.length} rows have Status badges`);

// Check Sub-Status badges in directory
const subStatusBadges = document.querySelectorAll('#supplier-list-body .substatus-badge');
assert(subStatusBadges.length === suppliers.length, `All ${subStatusBadges.length} rows have Sub-Status badges`);

// Check Owner pills in directory
const ownerPills = document.querySelectorAll('#supplier-list-body .owner-pill');
assert(ownerPills.length === suppliers.length, `All ${ownerPills.length} rows have Owner pills`);


// TEST GROUP 2: ROLE SIMULATOR ENGINE (Topbar Profile Dropdown)
console.log("\n--- TEST GROUP 2: Role Simulation Engine (Profile RBAC Modal) ---");
const roleDropdown = document.getElementById('sup-workflow-role-selector');
assert(roleDropdown !== null, "Workflow Role Simulation dropdown '#sup-workflow-role-selector' is present in profile RBAC modal");

Mod.setRole('Finance');
assert(Mod.getCurrentRole() === 'Finance', "Current role is 'Finance'");
assert(roleDropdown?.value === 'Finance', "Profile role dropdown value is 'Finance'");

Mod.setRole('QA');
assert(Mod.getCurrentRole() === 'QA', "Current role is 'QA'");
assert(roleDropdown?.value === 'QA', "Profile role dropdown value is 'QA'");

Mod.setRole('RP');
assert(Mod.getCurrentRole() === 'RP', "Current role is 'RP'");
assert(roleDropdown?.value === 'RP', "Profile role dropdown value is 'RP'");

Mod.setRole('Admin');
assert(Mod.getCurrentRole() === 'Admin', "Current role is 'Admin'");
assert(roleDropdown?.value === 'Admin', "Profile role dropdown value is 'Admin'");


// TEST GROUP 3: COMPLETE END-TO-END LIFECYCLE (Draft -> Pending QA -> QA Review -> Pending RP -> Activation Pending -> Active)
console.log("\n--- TEST GROUP 3: Complete Supplier Lifecycle Interactive Execution ---");

// Step 3.1: Load ACC006 (Draft)
const supDraft = suppliers.find(s => s.supplierId === 'ACC006');
assert(supDraft !== undefined, "Found pre-seeded Draft supplier ACC006");
assert(supDraft.status === 'Draft', "ACC006 initial status is 'Draft'");
assert(supDraft.subStatus === 'Finance – In Progress', "ACC006 initial sub-status is 'Finance – In Progress'");
assert(supDraft.currentOwner === 'Finance', "ACC006 initial current owner is 'Finance'");

Mod.loadSupplier(supDraft);

// Verify Form View Stepper and Live Status Banner
const bannerStatus = document.getElementById('sup-banner-status')?.textContent.trim();
const bannerSubStatus = document.getElementById('sup-banner-substatus')?.textContent.trim();
const bannerOwner = document.getElementById('sup-banner-owner')?.textContent.trim();
assert(bannerStatus.includes('Draft'), `Live Banner Status contains 'Draft' (actual: '${bannerStatus}')`);
assert(bannerSubStatus.includes('Finance – In Progress'), `Live Banner Sub-Status contains 'Finance – In Progress' (actual: '${bannerSubStatus}')`);
assert(bannerOwner.includes('Finance'), `Live Banner Current Owner contains 'Finance' (actual: '${bannerOwner}')`);

// Step 3.2: Finance submits to QA
Mod.setRole('Finance');
Mod.executeSubmitToQA('ACC006');
let updatedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC006');
assert(updatedSup.status === 'Pending QA', `After Finance submit, status is 'Pending QA' (actual: '${updatedSup.status}')`);
assert(updatedSup.subStatus === 'Awaiting QA Verification', `After Finance submit, sub-status is 'Awaiting QA Verification' (actual: '${updatedSup.subStatus}')`);
assert(updatedSup.currentOwner === 'QA', `After Finance submit, current owner is 'QA' (actual: '${updatedSup.currentOwner}')`);

// Step 3.3: QA starts review
Mod.setRole('QA');
Mod.executeStartQAReview('ACC006');
updatedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC006');
assert(updatedSup.status === 'QA Review', `After QA start review, status is 'QA Review' (actual: '${updatedSup.status}')`);
assert(updatedSup.currentOwner === 'QA', `After QA start review, current owner is 'QA' (actual: '${updatedSup.currentOwner}')`);

// Step 3.4: QA submits for RP Approval (fill mandatory licence fields first)
updatedSup.licenceType = 'WDA Holder';
updatedSup.supplierFor = 'Wholesale';
updatedSup.gdpGmpCertNo = 'UK WDA 58492/001';
Mod.executeSubmitForRPApproval('ACC006');
updatedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC006');
assert(updatedSup.status === 'Pending RP Approval', `After QA submit to RP, status is 'Pending RP Approval' (actual: '${updatedSup.status}')`);
assert(updatedSup.subStatus === 'Awaiting RP Approval', `After QA submit to RP, sub-status is 'Awaiting RP Approval' (actual: '${updatedSup.subStatus}')`);
assert(updatedSup.currentOwner === 'RP', `After QA submit to RP, current owner is 'RP' (actual: '${updatedSup.currentOwner}')`);

// Step 3.5: RP Approves (Separation of duties: RP approval transitions to Activation Pending, NOT directly to Active)
Mod.setRole('RP');
Mod.executeApproveRP('ACC006', 'RP technical compliance verified against MHRA WDA register. Approved for QA activation.');
updatedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC006');
assert(updatedSup.status === 'Activation Pending', `After RP approval, status is 'Activation Pending' (actual: '${updatedSup.status}')`);
assert(updatedSup.subStatus === 'Awaiting QA Activation', `After RP approval, sub-status is 'Awaiting QA Activation' (actual: '${updatedSup.subStatus}')`);
assert(updatedSup.currentOwner === 'QA', `After RP approval, current owner is 'QA' (actual: '${updatedSup.currentOwner}')`);
assert(updatedSup.status !== 'Active', "GOVERNANCE CHECK: RP approval did NOT automatically make supplier Active");

// Step 3.6: QA Activates Supplier
Mod.setRole('QA');
Mod.executeActivateSupplier('ACC006');
updatedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC006');
assert(updatedSup.status === 'Active', `After QA activation, status is 'Active' (actual: '${updatedSup.status}')`);
assert(updatedSup.subStatus === 'Supplier Active', `After QA activation, sub-status is 'Supplier Active' (actual: '${updatedSup.subStatus}')`);
assert(updatedSup.currentOwner === '—', `After QA activation, current owner is '—' (actual: '${updatedSup.currentOwner}')`);


// TEST GROUP 4: RP REJECTION & CORRECTION FLOW
console.log("\n--- TEST GROUP 4: RP Rejection & Correction Workflow ---");

// Load ACC003 (Pending RP Approval)
const supRPPending = Mod.getSuppliers().find(s => s.supplierId === 'ACC003');
assert(supRPPending !== undefined, "Found ACC003 in Pending RP Approval");

Mod.setRole('RP');
const rejectionReason = "WDA license certificate expiry date mismatch with MHRA official portal. Please upload updated certificate.";
Mod.executeRejectRP('ACC003', rejectionReason, 'QA');

const rejectedSup = Mod.getSuppliers().find(s => s.supplierId === 'ACC003');
assert(rejectedSup.status === 'RP Review', `After RP rejection, status is 'RP Review' (actual: '${rejectedSup.status}')`);
assert(rejectedSup.subStatus === 'Rejected – Correction Required', `After RP rejection, sub-status is 'Rejected – Correction Required' (actual: '${rejectedSup.subStatus}')`);
assert(rejectedSup.currentOwner === 'QA', `After RP rejection targeted to QA, current owner is 'QA' (actual: '${rejectedSup.currentOwner}')`);
assert(rejectedSup.rejectionReason === rejectionReason, `Rejection reason stored correctly in record`);

// Verify Rejection notice banner displayed in form view
Mod.loadSupplier(rejectedSup);
const rejectionBox = document.getElementById('sup-form-rejection-box');
const rejectionText = document.getElementById('sup-rejection-reason-text')?.textContent;
assert(!rejectionBox.classList.contains('hidden'), "Rejection notice alert box is displayed in Form View");
assert(rejectionText.includes("WDA license certificate expiry date mismatch"), "Rejection reason text matches in Form View");


// TEST GROUP 5: 21 CFR PART 11 AUDIT TRAIL
console.log("\n--- TEST GROUP 5: 21 CFR Part 11 Audit Trail Ledger ---");
assert(Array.isArray(updatedSup.auditTrail), "Supplier has auditTrail array");
assert(updatedSup.auditTrail.length >= 5, `ACC006 audit log has ${updatedSup.auditTrail.length} ledger entries`);

// Verify audit entry format
const latestAudit = updatedSup.auditTrail[0];
assert(latestAudit.action !== undefined, `Audit entry has action: '${latestAudit.action}'`);
assert(latestAudit.prevStatus !== undefined, `Audit entry has prevStatus: '${latestAudit.prevStatus}'`);
assert(latestAudit.newStatus !== undefined, `Audit entry has newStatus: '${latestAudit.newStatus}'`);
assert(latestAudit.performedBy !== undefined, `Audit entry has performedBy: '${latestAudit.performedBy}'`);
assert(latestAudit.userRole !== undefined, `Audit entry has userRole: '${latestAudit.userRole}'`);
assert(latestAudit.timestamp !== undefined, `Audit entry has timestamp: '${latestAudit.timestamp}'`);

// Check rejection audit entry on ACC003
const rejectAudit = rejectedSup.auditTrail.find(h => h.action.includes('RP Rejection') || h.action.includes('Reject') || h.action.includes('Rejected'));
assert(rejectAudit !== undefined, "Found rejection audit entry in ACC003 workflow history");
assert(rejectAudit.rejectionReason === rejectionReason, "Rejection audit entry contains exact rejection reason");


// TEST GROUP 6: MULTI-SELECT FILTER ENGINE
console.log("\n--- TEST GROUP 6: Multi-Select Filter Engine ---");

// Test filtering by single status: 'Active'
Mod.setFilter('status', ['Active']);
let filteredRows = Mod.getFilteredSuppliers();
assert(filteredRows.every(s => s.status === 'Active'), `Status filter 'Active' returned ${filteredRows.length} active suppliers exclusively`);

// Test filtering by multiple statuses: ['Draft', 'Active']
Mod.setFilter('status', ['Draft', 'Active']);
filteredRows = Mod.getFilteredSuppliers();
assert(filteredRows.every(s => s.status === 'Draft' || s.status === 'Active'), `Status filter ['Draft', 'Active'] returned ${filteredRows.length} matching suppliers`);

// Test filtering by Sub-Status: ['Awaiting QA Verification']
Mod.setFilter('status', []);
Mod.setFilter('subStatus', ['Awaiting QA Verification']);
filteredRows = Mod.getFilteredSuppliers();
assert(filteredRows.every(s => s.subStatus === 'Awaiting QA Verification'), `Sub-Status filter returned ${filteredRows.length} matching suppliers`);

// Test filtering by Owner: 'RP'
Mod.setFilter('subStatus', []);
Mod.setFilter('owner', 'RP');
filteredRows = Mod.getFilteredSuppliers();
assert(filteredRows.every(s => s.currentOwner === 'RP'), `Owner filter 'RP' returned ${filteredRows.length} matching suppliers`);

// Reset filters
Mod.resetFilters();
filteredRows = Mod.getFilteredSuppliers();
assert(filteredRows.length === Mod.getSuppliers().length, `Resetting filters returned all ${filteredRows.length} suppliers`);


// TEST GROUP 7: WORKSPACE PROJECT RULES (Ctrl+K Global Search / AwesomeBar)
console.log("\n--- TEST GROUP 7: Project Rules - Ctrl+K Global Search ---");
const searchInput = document.getElementById('topbar-search-input');
const homeSearch = document.getElementById('home-search-trigger');

assert(searchInput !== null, "Topbar Ctrl+K search input element '#topbar-search-input' is present");
assert(homeSearch !== null, "Homepage Ctrl+K search trigger element '#home-search-trigger' is present");


// TEST GROUP 8: DATE FORMAT CONFORMITY & ACTIVE FORM SYNC ON WORKFLOW ACTIONS
console.log("\n--- TEST GROUP 8: Date Format Conformity & Active Form Live Sync ---");

// Test ISO date conformity on all date inputs
const dateInputs = document.querySelectorAll('input[type="date"]');
dateInputs.forEach(input => {
    if (input.value) {
        assert(/^\d{4}-\d{2}-\d{2}$/.test(input.value), `Date input #${input.id || 'unnamed'} value '${input.value}' conforms to yyyy-MM-dd`);
    }
});

// Test live form synchronization on 'Submit for RP Approval' without prior manual save
const testSup = suppliers.find(s => s.supplierId === 'ACC004');
assert(testSup !== undefined, "Found ACC004 (Medicare Bioscience)");
Mod.loadSupplier(testSup);

// Simulate user modifying Licence fields in the DOM
document.getElementById('sup-lic-type').value = 'Manufacturer';
document.getElementById('sup-lic-supplier-for').value = 'Services';
document.getElementById('sup-lic-company-reg').value = 'MFR-998822';
document.getElementById('sup-lic-company-reg-expiry').value = '2028-11-15';
document.getElementById('sup-lic-risk-score').value = 'Low';

// Submit directly for RP approval
Mod.setRole('QA');
Mod.executeSubmitForRPApproval('ACC004');

const updatedACC004 = Mod.getSuppliers().find(s => s.supplierId === 'ACC004');
assert(updatedACC004.status === 'Pending RP Approval', `ACC004 status transitioned to 'Pending RP Approval' (actual: '${updatedACC004.status}')`);
assert(updatedACC004.licenceType === 'Manufacturer', `ACC004 licenceType was synced from form: '${updatedACC004.licenceType}'`);
assert(updatedACC004.supplierFor === 'Services', `ACC004 supplierFor was synced from form: '${updatedACC004.supplierFor}'`);
assert(updatedACC004.companyRegNo === 'MFR-998822', `ACC004 companyRegNo was synced from form: '${updatedACC004.companyRegNo}'`);

console.log("\n================================================================================");
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("================================================================================\n");

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
