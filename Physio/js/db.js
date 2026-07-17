/**
 * ReviveCMS - Database Layer (IndexedDB)
 * Structured for easy migration to REST API / cloud backend.
 * All methods return Promises.
 *
 * PERSISTENCE NOTE:
 * IndexedDB is persistent across page reloads within the same browser/origin.
 * Data is only lost if the user clears browser storage or uses private/incognito mode.
 */

const DB_NAME = 'ReviveClinicsDB';
const DB_VERSION = 7; // Bumped to 7 for Orthopaedic HIS upgrade

let db;
// Single shared init promise to prevent race conditions
let _dbInitPromise = null;

const STORES = {
  patients: 'patients',
  medicines: 'medicines',
  prescriptions: 'prescriptions',
  prescriptionMedicines: 'prescriptionMedicines',
  patientFiles: 'patientFiles',
  visits: 'visits',
  profitTransactions: 'profitTransactions',
  appointments: 'appointments',
  treatmentPlans: 'treatmentPlans',
  treatmentSessions: 'treatmentSessions',
  surgeries: 'surgeries',
  diagnosticReports: 'diagnosticReports',
  expenses: 'expenses',
  invoices: 'invoices',
  payments: 'payments',
  suppliers: 'suppliers',
  purchases: 'purchases',
  notifications: 'notifications',
  auditLogs: 'auditLogs'
};

function initDB() {
  if (_dbInitPromise) return _dbInitPromise;
  _dbInitPromise = new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;

      // Patients Table
      if (!database.objectStoreNames.contains(STORES.patients)) {
        const patientStore = database.createObjectStore(STORES.patients, { keyPath: 'id', autoIncrement: true });
        patientStore.createIndex('name', 'name', { unique: false });
        patientStore.createIndex('mobile', 'mobile', { unique: false });
      }

      // Medicines Table
      if (!database.objectStoreNames.contains(STORES.medicines)) {
        const medStore = database.createObjectStore(STORES.medicines, { keyPath: 'id', autoIncrement: true });
        medStore.createIndex('name', 'name', { unique: false });
      }

      // Prescriptions Table
      if (!database.objectStoreNames.contains(STORES.prescriptions)) {
        const rxStore = database.createObjectStore(STORES.prescriptions, { keyPath: 'id', autoIncrement: true });
        rxStore.createIndex('patientId', 'patientId', { unique: false });
        rxStore.createIndex('date', 'date', { unique: false });
      }

      // Prescription_Medicines Junction Table
      if (!database.objectStoreNames.contains(STORES.prescriptionMedicines)) {
        const rxMedStore = database.createObjectStore(STORES.prescriptionMedicines, { keyPath: 'id', autoIncrement: true });
        rxMedStore.createIndex('prescriptionId', 'prescriptionId', { unique: false });
        rxMedStore.createIndex('medicineId', 'medicineId', { unique: false });
      }

      // Patient Files Table
      if (!database.objectStoreNames.contains(STORES.patientFiles)) {
        const filesStore = database.createObjectStore(STORES.patientFiles, { keyPath: 'id', autoIncrement: true });
        filesStore.createIndex('patientId', 'patientId', { unique: false });
        filesStore.createIndex('prescriptionId', 'prescriptionId', { unique: false });
      }

      // Visits Table
      if (!database.objectStoreNames.contains(STORES.visits)) {
        const visitStore = database.createObjectStore(STORES.visits, { keyPath: 'id', autoIncrement: true });
        visitStore.createIndex('patientId', 'patientId', { unique: false });
        visitStore.createIndex('date', 'date', { unique: false });
      }

      // Profit Transactions Table
      if (e.oldVersion < 5 && database.objectStoreNames.contains(STORES.profitTransactions)) {
        database.deleteObjectStore(STORES.profitTransactions);
      }
      if (!database.objectStoreNames.contains(STORES.profitTransactions)) {
        const profitStore = database.createObjectStore(STORES.profitTransactions, { keyPath: 'id', autoIncrement: true });
        profitStore.createIndex('medicineId', 'medicineId', { unique: false });
        profitStore.createIndex('date', 'date', { unique: false });
        profitStore.createIndex('soldAt', 'soldAt', { unique: false });
      }

      // New Stores for HIS Upgrade
      if (!database.objectStoreNames.contains(STORES.appointments)) {
        const appStore = database.createObjectStore(STORES.appointments, { keyPath: 'id', autoIncrement: true });
        appStore.createIndex('patientId', 'patientId', { unique: false });
        appStore.createIndex('date', 'date', { unique: false });
        appStore.createIndex('status', 'status', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.treatmentPlans)) {
        const planStore = database.createObjectStore(STORES.treatmentPlans, { keyPath: 'id', autoIncrement: true });
        planStore.createIndex('patientId', 'patientId', { unique: false });
        planStore.createIndex('status', 'status', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.treatmentSessions)) {
        const sessStore = database.createObjectStore(STORES.treatmentSessions, { keyPath: 'id', autoIncrement: true });
        sessStore.createIndex('treatmentPlanId', 'treatmentPlanId', { unique: false });
        sessStore.createIndex('date', 'date', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.surgeries)) {
        const surgStore = database.createObjectStore(STORES.surgeries, { keyPath: 'id', autoIncrement: true });
        surgStore.createIndex('patientId', 'patientId', { unique: false });
        surgStore.createIndex('date', 'date', { unique: false });
        surgStore.createIndex('type', 'type', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.diagnosticReports)) {
        const diagStore = database.createObjectStore(STORES.diagnosticReports, { keyPath: 'id', autoIncrement: true });
        diagStore.createIndex('patientId', 'patientId', { unique: false });
        diagStore.createIndex('date', 'date', { unique: false });
        diagStore.createIndex('category', 'category', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.expenses)) {
        const expStore = database.createObjectStore(STORES.expenses, { keyPath: 'id', autoIncrement: true });
        expStore.createIndex('date', 'date', { unique: false });
        expStore.createIndex('category', 'category', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.invoices)) {
        const invStore = database.createObjectStore(STORES.invoices, { keyPath: 'id', autoIncrement: true });
        invStore.createIndex('patientId', 'patientId', { unique: false });
        invStore.createIndex('date', 'date', { unique: false });
        invStore.createIndex('invoiceNo', 'invoiceNo', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.payments)) {
        const payStore = database.createObjectStore(STORES.payments, { keyPath: 'id', autoIncrement: true });
        payStore.createIndex('invoiceId', 'invoiceId', { unique: false });
        payStore.createIndex('date', 'date', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.suppliers)) {
        const supStore = database.createObjectStore(STORES.suppliers, { keyPath: 'id', autoIncrement: true });
        supStore.createIndex('name', 'name', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.purchases)) {
        const purStore = database.createObjectStore(STORES.purchases, { keyPath: 'id', autoIncrement: true });
        purStore.createIndex('date', 'date', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.notifications)) {
        const notStore = database.createObjectStore(STORES.notifications, { keyPath: 'id', autoIncrement: true });
        notStore.createIndex('status', 'status', { unique: false });
        notStore.createIndex('type', 'type', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.auditLogs)) {
        const logStore = database.createObjectStore(STORES.auditLogs, { keyPath: 'id', autoIncrement: true });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onblocked = (e) => {
      console.warn('[ReviveCMS] Database upgrade blocked by another tab.');
      alert('Database upgrade required but blocked! Please close other ReviveCMS tabs and click OK to refresh.');
      window.location.reload();
    };

    request.onsuccess = (e) => { 
      db = e.target.result; 
      db.onversionchange = () => {
        db.close();
        window.location.reload();
      };
      resolve(db); 
    };
    request.onerror = (e) => { _dbInitPromise = null; reject(e.target.error); };
  });
  return _dbInitPromise;
}

// ─── Generic CRUD Operations ────────────────────────────────────────────────

async function getNextPatientId() {
  const patients = await dbGetAll(STORES.patients);
  let maxId = 0;
  patients.forEach(p => {
    const idInt = parseInt(p.id, 10);
    if (!isNaN(idInt) && idInt > maxId) {
      maxId = idInt;
    }
  });
  return String(maxId + 1).padStart(4, '0');
}
window.generateNextPatientId = getNextPatientId;

// ─── Patient Code (human-readable display ID) ────────────────────────────────
async function getNextPatientCode() {
  const patients = await dbGetAll(STORES.patients);
  let maxCode = 0;
  patients.forEach(p => {
    // Only parse values that look like sequential codes (not UUIDs)
    const code = p.patientCode;
    if (code && typeof code === 'string' && /^\d+$/.test(code)) {
      const n = parseInt(code, 10);
      if (!isNaN(n) && n > maxCode) maxCode = n;
    }
  });
  return String(maxCode + 1).padStart(4, '0');
}
window.generateNextPatientCode = getNextPatientCode;

function dbAdd(storeName, data) {
  return initDB().then(database => new Promise(async (resolve, reject) => {
    let finalData = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (storeName === STORES.patients && !finalData.id) {
      try {
        finalData.id = await getNextPatientId();
      } catch (err) {
        console.error('[ReviveCMS] Error generating sequential patient ID in dbAdd:', err);
      }
    }
    // Auto-assign patientCode for new patients
    if (storeName === STORES.patients && !finalData.patientCode) {
      try {
        finalData.patientCode = await getNextPatientCode();
      } catch (err) {
        console.error('[ReviveCMS] Error generating patientCode in dbAdd:', err);
      }
    }
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.add(finalData);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function dbPut(storeName, data) {
  return initDB().then(database => new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put({ ...data, updatedAt: new Date().toISOString() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function dbDelete(storeName, id) {
  return initDB().then(database => new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

function dbGetById(storeName, id) {
  return initDB().then(database => new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function dbGetAll(storeName) {
  return initDB().then(database => new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function dbGetByIndex(storeName, indexName, value) {
  return initDB().then(database => new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

// ─── Seed Demo Data ─────────────────────────────────────────────────────────
// A global promise so seeding never runs twice concurrently even across modules
let _seedPromise = null;

async function seedDemoData() {
  if (_seedPromise) return _seedPromise;
  _seedPromise = (async () => {
    await initDB();
    const patients = await dbGetAll(STORES.patients);
    if (patients.length > 0) return; // Already seeded — data is persisted in IndexedDB

    // Seed Patients
    const p1id = await dbAdd(STORES.patients, {
      name: 'Arun Kumar', age: 34, gender: 'Male',
      mobile: '+91 98765 43210', address: 'No. 5, Anna Nagar, Chennai – 600040',
      condition: 'Lower Back Pain - X-Ray Pending', diagnosis: 'Suspected Lumbar Disc Herniation',
      dateOfVisit: '2026-04-01',
    });
    const p2id = await dbAdd(STORES.patients, {
      name: 'Priya S.', age: 28, gender: 'Female',
      mobile: '+91 87654 32109', address: 'No. 22, T. Nagar, Chennai – 600017',
      condition: 'Knee Pain', diagnosis: 'Post ACL Reconstruction - Wait for MRI',
      dateOfVisit: '2026-04-02',
    });
    const p3id = await dbAdd(STORES.patients, {
      name: 'Vijay R.', age: 42, gender: 'Male',
      mobile: '+91 76543 21098', address: 'No. 8, Adyar, Chennai – 600020',
      condition: 'Wrist Traumatic Injury', diagnosis: 'Colles Fracture - X-Ray Confirmed',
      dateOfVisit: '2026-04-03',
    });

    // Seed Medicines
    const m1id = await dbAdd(STORES.medicines, { name: 'Ibuprofen 400mg', totalQty: 100, availableQty: 80, price: 5, buyingPrice: 2, sellingPrice: 5, unit: 'Tablet' });
    const m2id = await dbAdd(STORES.medicines, { name: 'Diclofenac Gel 30g', totalQty: 30, availableQty: 5, price: 85, buyingPrice: 50, sellingPrice: 85, unit: 'Tube' });
    const m3id = await dbAdd(STORES.medicines, { name: 'Methocarbamol 500mg', totalQty: 50, availableQty: 25, price: 12, buyingPrice: 6, sellingPrice: 12, unit: 'Tablet' });
    const m4id = await dbAdd(STORES.medicines, { name: 'Calcium + D3', totalQty: 60, availableQty: 60, price: 8, buyingPrice: 4, sellingPrice: 8, unit: 'Tablet' });

    // Seed Prescription
    const rx1id = await dbAdd(STORES.prescriptions, {
      patientId: p1id, patientName: 'Arun Kumar', date: '2026-04-01',
      notes: 'Take rest. Apply heat pack twice daily. Avoid bending. Review in 2 weeks.',
      doctorName: 'Dr. C. SANJAY, M.S (ORTHO)',
    });

    await dbAdd(STORES.prescriptionMedicines, { prescriptionId: rx1id, medicineId: m1id, medicineName: 'Ibuprofen 400mg', qty: 10, dosage: 'Twice daily after meals' });
    await dbAdd(STORES.prescriptionMedicines, { prescriptionId: rx1id, medicineId: m3id, medicineName: 'Methocarbamol 500mg', qty: 5, dosage: 'Once at night' });

    // Update stock after seeding prescription
    const med1 = await dbGetById(STORES.medicines, m1id);
    await dbPut(STORES.medicines, { ...med1, availableQty: med1.availableQty - 10 });
    const med3 = await dbGetById(STORES.medicines, m3id);
    await dbPut(STORES.medicines, { ...med3, availableQty: med3.availableQty - 5 });

    // Seed Visits
    await dbAdd(STORES.visits, { patientId: p1id, date: '2026-04-01', notes: 'Initial assessment. Ordered AP & Lateral Lumbar X-Ray. Started mild pain-relief therapy.' });
    await dbAdd(STORES.visits, { patientId: p2id, date: '2026-04-02', notes: 'Post-surgery follow-up. MRI requested to check graft integration. Knee range of motion improving.' });
    await dbAdd(STORES.visits, { patientId: p3id, date: '2026-04-03', notes: 'Digital X-Ray performed on-site. Confirmed distal radius fracture. Sent for casting.' });

    // Seed Appointments
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await dbAdd(STORES.appointments, { patientId: p1id, patientName: 'Arun Kumar', date: today, time: '10:30', status: 'Scheduled', type: 'Review Patient', note: 'Lumbar spondylosis review' });
    await dbAdd(STORES.appointments, { patientId: p2id, patientName: 'Priya S.', date: today, time: '11:30', status: 'Confirmed', type: 'New Patient', note: 'Post ACL rehab checkup' });
    await dbAdd(STORES.appointments, { patientId: p3id, patientName: 'Vijay R.', date: yesterday, time: '16:00', status: 'Completed', type: 'Emergency Patient', note: 'Colles fracture review' });
    await dbAdd(STORES.appointments, { patientId: p1id, patientName: 'Arun Kumar', date: tomorrow, time: '09:00', status: 'Scheduled', type: 'Review Patient', note: 'Rehab session check' });

    // Seed Rehab Treatment Plans
    const tp1id = await dbAdd(STORES.treatmentPlans, {
      patientId: p1id,
      patientName: 'Arun Kumar',
      name: 'Lumbar Disc Rehab Plan',
      status: 'Active',
      sessionsTotal: 10,
      sessionsCompleted: 4,
      sessionDuration: '45 Mins',
      assignedTherapist: 'Dr. C. Sanjay',
      goals: 'Pain reduction from 8 to 2, full range of lumbar flexion, improve core muscle strength',
      progressMetrics: 'ROM flex improved by 35 deg, pain score at 4, walking distance increased'
    });

    // Seed Treatment Sessions
    await dbAdd(STORES.treatmentSessions, { treatmentPlanId: tp1id, date: '2026-05-25', notes: 'Core activation, lumbar traction. Tolerated well.' });
    await dbAdd(STORES.treatmentSessions, { treatmentPlanId: tp1id, date: '2026-05-27', notes: 'Prone press-ups, neural glides. ROM improving.' });
    await dbAdd(STORES.treatmentSessions, { treatmentPlanId: tp1id, date: '2026-05-29', notes: 'Pelvic tilts, quadriped progression. Decreased muscle spasm.' });
    await dbAdd(STORES.treatmentSessions, { treatmentPlanId: tp1id, date: '2026-05-30', notes: 'Dynamic core stabilization. Patient feels 40% relief.' });

    // Seed Surgeries
    await dbAdd(STORES.surgeries, {
      patientId: p2id,
      patientName: 'Priya S.',
      type: 'TKR (Total Knee Replacement)',
      date: '2026-03-15',
      surgeon: 'Dr. C. SANJAY',
      implantUsed: 'Zimmer NexGen CR Knee System',
      followUpVisits: '6 weeks, 12 weeks post-op',
      recoveryProgress: 'Porthole healed. ROM 0-115 deg. Quad strength 4/5. Undergoing phase 2 physiotherapy.'
    });
    await dbAdd(STORES.surgeries, {
      patientId: p1id,
      patientName: 'Arun Kumar',
      type: 'Lumbar Spine Microdiscectomy L4-L5',
      date: '2025-11-10',
      surgeon: 'Dr. C. SANJAY',
      implantUsed: 'None (Decompression)',
      followUpVisits: 'Completed reviews. Occasional stiffness.',
      recoveryProgress: 'Sciatic pain completely resolved. Occasional localized stiffness, managing with lumbar stretching.'
    });

    // Seed Diagnostic Reports
    await dbAdd(STORES.diagnosticReports, {
      patientId: p1id,
      patientName: 'Arun Kumar',
      date: '2026-04-01',
      category: 'X-Ray',
      details: 'AP & Lateral Lumbar Spine: Mild L4-L5 disc space narrowing, early osteophytic changes. Spine alignment normal.',
      doctorName: 'Dr. C. SANJAY',
      fileName: 'lumbar_xray.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14">LUMBAR X-RAY</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="10">Arun Kumar - 01/04/26</text></svg>'
    });
    await dbAdd(STORES.diagnosticReports, {
      patientId: p2id,
      patientName: 'Priya S.',
      date: '2026-04-02',
      category: 'MRI',
      details: 'Right Knee MRI: Graft integration normal. Minimal joint effusion. Intact lateral meniscus.',
      doctorName: 'Dr. C. SANJAY',
      fileName: 'knee_mri.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14">KNEE MRI</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="10">Priya S. - 02/04/26</text></svg>'
    });

    // Seed Expenses
    await dbAdd(STORES.expenses, { category: 'Rent', amount: 25000, date: '2026-05-01', notes: 'May clinic rent' });
    await dbAdd(STORES.expenses, { category: 'Salaries', amount: 75000, date: '2026-05-01', notes: 'Staff salaries for April/May' });
    await dbAdd(STORES.expenses, { category: 'Electricity', amount: 4800, date: '2026-05-15', notes: 'Electricity bill for the clinic' });
    await dbAdd(STORES.expenses, { category: 'Consumables', amount: 12000, date: '2026-05-20', notes: 'Braces, splints, needles, tapes' });

    // Seed Invoices & Payments
    const inv1id = await dbAdd(STORES.invoices, {
      patientId: p1id,
      patientName: 'Arun Kumar',
      invoiceNo: 'INV-2026-001',
      date: '2026-04-01',
      consultCharges: 500,
      medicineCharges: 98,
      therapyCharges: 4000,
      totalAmount: 4598,
      status: 'Paid',
      notes: 'Initial orthopaedic consult & 10-session lumbar physiotherapy rehab package'
    });
    await dbAdd(STORES.payments, { invoiceId: inv1id, date: '2026-04-01', amount: 4598, method: 'UPI', notes: 'Full payment received via GPay' });

    const inv2id = await dbAdd(STORES.invoices, {
      patientId: p2id,
      patientName: 'Priya S.',
      invoiceNo: 'INV-2026-002',
      date: '2026-04-02',
      consultCharges: 500,
      medicineCharges: 85,
      therapyCharges: 0,
      totalAmount: 585,
      status: 'Partial',
      notes: 'Consultation & knee ointments'
    });
    await dbAdd(STORES.payments, { invoiceId: inv2id, date: '2026-04-02', amount: 300, method: 'Cash', notes: 'Token cash payment' });

    // Seed Notifications
    await dbAdd(STORES.notifications, { type: 'Appointment', message: 'Review appointment: Arun Kumar today at 10:30 AM', status: 'Unread', date: today });
    await dbAdd(STORES.notifications, { type: 'Low Stock', message: 'Diclofenac Gel 30g is running low (5 tubes left)', status: 'Unread', date: today });
    await dbAdd(STORES.notifications, { type: 'Expiry', message: 'Methocarbamol 500mg Batch B-32 expires in 15 days', status: 'Unread', date: today });
    await dbAdd(STORES.notifications, { type: 'Payment', message: 'Priya S. has a pending balance of \u20B9285 on INV-2026-002', status: 'Unread', date: today });

    console.log('[ReviveCMS] Orthopaedic & HIS demo data seeded successfully.');
  })();
  return _seedPromise;
}

// ─── Migration Logic ────────────────────────────────────────────────────────
async function migrateProfitTransactions() {
  let existingTx = [];
  try {
    existingTx = await dbGetAll(STORES.profitTransactions);
  } catch (e) {
    console.warn('[ReviveCMS] Could not read profitTransactions.', e);
    return;
  }

  const rxMeds = await dbGetAll(STORES.prescriptionMedicines);
  if (!rxMeds.length) return; // Nothing to migrate

  // Build a deduplication set: "prescriptionId-medicineId" keys that already exist
  const existingKeys = new Set(existingTx.map(tx => `${tx.prescriptionId}-${tx.medicineId}`));
  const toMigrate   = rxMeds.filter(rm => !existingKeys.has(`${rm.prescriptionId}-${rm.medicineId}`));

  if (!toMigrate.length) return; // All records already present

  console.log(`[ReviveCMS] Migrating ${toMigrate.length} missing profitTransaction records...`);
  const prescriptions = await dbGetAll(STORES.prescriptions);
  const medicines     = await dbGetAll(STORES.medicines);

  for (const rxMed of toMigrate) {
    const rx  = prescriptions.find(p => p.id === rxMed.prescriptionId);
    if (!rx) continue;

    const med = medicines.find(m => m.id === rxMed.medicineId);
    let bp = rxMed.buyingPrice  !== undefined ? parseFloat(rxMed.buyingPrice)  : undefined;
    let sp = rxMed.sellingPrice !== undefined ? parseFloat(rxMed.sellingPrice) : undefined;

    if (bp === undefined || isNaN(bp) || sp === undefined || isNaN(sp)) {
      if (med) {
        bp = (bp === undefined || isNaN(bp)) ? parseFloat(med.buyingPrice  ?? med.price ?? 0) : bp;
        sp = (sp === undefined || isNaN(sp)) ? parseFloat(med.sellingPrice ?? med.price ?? 0) : sp;
      } else {
        bp = bp !== undefined && !isNaN(bp) ? bp : 0;
        sp = sp !== undefined && !isNaN(sp) ? sp : 0;
      }
    }

    const qty = parseInt(rxMed.qty, 10) || 0;
    await dbAdd(STORES.profitTransactions, {
      prescriptionId : rx.id,
      medicineId     : rxMed.medicineId,
      medicineName   : rxMed.medicineName || (med ? med.name : 'Unknown'),
      qtySold        : qty,
      buyingPrice    : bp,
      sellingPrice   : sp,
      revenue        : sp * qty,
      profit         : (sp - bp) * qty,
      soldAt         : new Date(`${rx.date}T12:00:00Z`).toISOString(),
      date           : rx.date
    });
  }
  console.log('[ReviveCMS] Migration complete.');
}

async function migratePatientIdsToSequential() {
  const patients = await dbGetAll(STORES.patients);
  const prescriptions = await dbGetAll(STORES.prescriptions);

  const hasUuidPat = patients.some(p => typeof p.id === 'string' && (p.id.includes('-') || p.id.length > 4));
  if (!hasUuidPat) return;

  console.log('[ReviveCMS] Found UUID-based patient IDs. Starting sequential migration...');

  const database = await initDB();

  const sortedPatients = [...patients].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.dateOfVisit || 0);
    const dateB = new Date(b.createdAt || b.dateOfVisit || 0);
    return dateA - dateB;
  });

  const patientIdMap = {};
  sortedPatients.forEach((p, index) => {
    patientIdMap[p.id] = String(index + 1).padStart(4, '0');
  });

  const storesToMigrate = [
    STORES.patients,
    STORES.prescriptions,
    STORES.prescriptionMedicines,
    STORES.appointments,
    STORES.treatmentPlans,
    STORES.surgeries,
    STORES.diagnosticReports,
    STORES.invoices,
    STORES.patientFiles,
    STORES.visits,
    STORES.profitTransactions,
    'reports'
  ];

  const existingStores = storesToMigrate.filter(storeName => database.objectStoreNames.contains(storeName));

  return new Promise((resolve, reject) => {
    const tx = database.transaction(existingStores, 'readwrite');
    
    tx.oncomplete = () => {
      console.log('[ReviveCMS] Sequential ID migration successfully completed.');
      resolve();
    };

    tx.onerror = (e) => {
      console.error('[ReviveCMS] Sequential ID migration failed:', e.target.error);
      reject(e.target.error);
    };

    const patientStore = tx.objectStore(STORES.patients);
    sortedPatients.forEach(p => {
      const oldId = p.id;
      const newId = patientIdMap[oldId];
      if (newId && oldId !== newId) {
        patientStore.delete(oldId);
        patientStore.put({ ...p, id: newId });
      }
    });

    const rxStore = tx.objectStore(STORES.prescriptions);
    prescriptions.forEach(rx => {
      const oldPatientId = rx.patientId;
      if (oldPatientId && patientIdMap[oldPatientId]) {
        rxStore.put({ ...rx, patientId: patientIdMap[oldPatientId] });
      }
    });

    existingStores.forEach(storeName => {
      if (storeName === STORES.patients || storeName === STORES.prescriptions) return;
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = (e) => {
        const records = e.target.result;
        records.forEach(rec => {
          if (rec.patientId && patientIdMap[rec.patientId]) {
            store.put({ ...rec, patientId: patientIdMap[rec.patientId] });
          }
        });
      };
    });
  });
}

// Assign sequential patientCode to any patient that is missing one.
// Safe to run multiple times — never overwrites existing codes.
async function migratePatientCodes() {
  const patients = await dbGetAll(STORES.patients);
  const needsCode = patients.filter(p => !p.patientCode);
  if (!needsCode.length) return;

  console.log(`[ReviveCMS] Assigning patientCode to ${needsCode.length} patients...`);

  // Find current max code across ALL patients (including those already coded)
  let maxCode = 0;
  patients.forEach(p => {
    if (p.patientCode && /^\d+$/.test(p.patientCode)) {
      const n = parseInt(p.patientCode, 10);
      if (!isNaN(n) && n > maxCode) maxCode = n;
    }
  });

  // Sort unassigned patients by creation date so codes are chronological
  const sorted = [...needsCode].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.dateOfVisit || 0);
    const dateB = new Date(b.createdAt || b.dateOfVisit || 0);
    return dateA - dateB;
  });

  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORES.patients], 'readwrite');
    tx.oncomplete = () => {
      console.log('[ReviveCMS] patientCode migration complete.');
      resolve();
    };
    tx.onerror = (e) => {
      console.error('[ReviveCMS] patientCode migration failed:', e.target.error);
      reject(e.target.error);
    };
    const store = tx.objectStore(STORES.patients);
    sorted.forEach(p => {
      maxCode += 1;
      const code = String(maxCode).padStart(4, '0');
      store.put({ ...p, patientCode: code });
    });
  });
}



// ─── Public API ─────────────────────────────────────────────────────────────

window.CMS = {
  db: { initDB, dbAdd, dbPut, dbDelete, dbGetById, dbGetAll, dbGetByIndex, STORES, generateNextPatientId: getNextPatientId },

  patients: {

    add: async (data) => {
        return await window.PatientRepository.create(data);
    },

    update: async (data) => {
        return await window.PatientRepository.update(data.id, data);
    },

    delete: async (id) => {
        return await window.PatientRepository.delete(id);
    },

    getById: async (id) => {
        return await window.PatientRepository.getById(id);
    },

    getAll: async () => {
        return await window.PatientRepository.getAll();
    },

    search: async (query) => {

        const q = query.trim();

        const byName =
            await window.PatientRepository.searchByName(q);

        const byMobile =
            await window.PatientRepository.getByColumn(
                "mobile",
                q
            );

        // Also search by patientCode (exact or partial match)
        const byCode = await window.PatientRepository.getByPatientCode(q).catch(() => null);

        const map = new Map();
        [...byName, ...byMobile].forEach(patient => {
            map.set(patient.id, patient);
        });
        if (byCode) map.set(byCode.id, byCode);

        return [...map.values()];
    }
  },

  medicines: {
    add: (data) => window.MedicineRepository.create(data),
    update: (data) => window.MedicineRepository.update(data.id, data),
    delete: (id) => window.MedicineRepository.delete(id),
    getById: (id) => window.MedicineRepository.getById(id),
    getAll: () => window.MedicineRepository.getAll(),
    count: () => window.MedicineRepository.count(),
    getLowStock: async () => {
      return await window.MedicineRepository.getByColumn('stockStatus', 'Low Stock');
    },
  },

  prescriptions: {
    add: async (rxData, medicinesData) => {
      const record = {
        patientId: rxData.patientId,
        patientName: rxData.patientName,
        date: rxData.date,
        doctor: rxData.doctorName || rxData.doctor,
        doctorNotes: rxData.notes || rxData.doctorNotes,
        medicines: medicinesData.map(m => ({
          medicineId: m.medicineId,
          medicineName: m.medicineName,
          qty: parseInt(m.qty, 10),
          dosage: m.dosage || ''
        })),
        imageUrls: rxData.imageUrls || [],
        totalItems: medicinesData.length,
        status: rxData.status || "Issued"
      };
      const result = await window.PrescriptionRepository.create(record);
      return result.id;
    },
    update: async (id, rxData, medicinesData) => {
      const record = {
        patientId: rxData.patientId,
        patientName: rxData.patientName,
        date: rxData.date,
        doctor: rxData.doctorName || rxData.doctor,
        doctorNotes: rxData.notes || rxData.doctorNotes,
        medicines: medicinesData.map(m => ({
          medicineId: m.medicineId,
          medicineName: m.medicineName,
          qty: parseInt(m.qty, 10),
          dosage: m.dosage || ''
        })),
        imageUrls: rxData.imageUrls || [],
        totalItems: medicinesData.length,
        status: rxData.status || "Issued"
      };
      return await window.PrescriptionRepository.update(id, record);
    },
    delete: (id) => window.PrescriptionRepository.delete(id),
    getAll: () => window.PrescriptionRepository.getAll(),
    getById: (id) => window.PrescriptionRepository.getById(id),
    getByPatient: (patientId) => window.PrescriptionRepository.getByPatient(patientId),
    getMedicines: async (prescriptionId) => {
      const rx = await window.PrescriptionRepository.getById(prescriptionId);
      if (!rx) return [];
      return (rx.medicines || []).map(m => ({
        medicineId: m.medicineId || m.medicine_id,
        medicineName: m.medicineName || m.medicine_name,
        qty: m.qty || m.quantity || 0,
        dosage: m.dosage || ''
      }));
    },
    count: () => window.PrescriptionRepository.count()
  },

  files: {
    add: (patientId, fileData) => dbAdd(STORES.patientFiles, { patientId, ...fileData }),
    getByPatient: (patientId) => dbGetByIndex(STORES.patientFiles, 'patientId', patientId),
    getByPrescription: (prescriptionId) => dbGetByIndex(STORES.patientFiles, 'prescriptionId', prescriptionId),
    delete: (id) => dbDelete(STORES.patientFiles, id),
  },

  visits: {
    getByPatient: (patientId) => dbGetByIndex(STORES.visits, 'patientId', patientId),
    add: (data) => dbAdd(STORES.visits, data),
  },

  appointments: {
    add: (data) => window.AppointmentRepository.create(data),
    update: (data) => window.AppointmentRepository.update(data.id, data),
    delete: (id) => window.AppointmentRepository.delete(id),
    getById: (id) => window.AppointmentRepository.getById(id),
    getAll: () => window.AppointmentRepository.getAll(),
    getByPatient: (patientId) => window.AppointmentRepository.getByColumn('patientId', patientId),
  },

  treatmentPlans: {
    add: (data) => window.RehabRepository.create(data),
    update: (data) => window.RehabRepository.update(data.id, data),
    delete: (id) => window.RehabRepository.delete(id),
    getById: (id) => window.RehabRepository.getById(id),
    getAll: () => window.RehabRepository.getAll(),
    getByPatient: (patientId) => window.RehabRepository.getByPatient(patientId),
  },

  treatmentSessions: {
    add: (data) => dbAdd(STORES.treatmentSessions, data),
    delete: (id) => dbDelete(STORES.treatmentSessions, id),
    getAll: () => dbGetAll(STORES.treatmentSessions),
    getById: (id) => dbGetById(STORES.treatmentSessions, id),
  },

  surgeries: {
    add: (data) => window.SurgeryRepository.create(data),
    update: (data) => window.SurgeryRepository.update(data.id, data),
    delete: (id) => window.SurgeryRepository.delete(id),
    getById: (id) => window.SurgeryRepository.getById(id),
    getAll: () => window.SurgeryRepository.getAll(),
    getByPatient: (patientId) => window.SurgeryRepository.getByPatient(patientId),
  },

  diagnosticReports: {
    add: (data) => window.DiagnosticRepository.create(data),
    update: (data) => window.DiagnosticRepository.update(data.id, data),
    delete: (id) => window.DiagnosticRepository.delete(id),
    getById: (id) => window.DiagnosticRepository.getById(id),
    getAll: () => window.DiagnosticRepository.getAll(),
    getByPatient: (patientId) => window.DiagnosticRepository.getByPatient(patientId),
  },

  expenses: {
    add: (data) => dbAdd(STORES.expenses, data),
    update: (data) => dbPut(STORES.expenses, data),
    delete: (id) => dbDelete(STORES.expenses, id),
    getById: (id) => dbGetById(STORES.expenses, id),
    getAll: () => dbGetAll(STORES.expenses),
  },

  invoices: {
    add: (data) => window.InvoiceRepository.create(data),
    update: (updates) => window.InvoiceRepository.update(updates.id, updates),
    delete: (id) => window.InvoiceRepository.delete(id),
    getById: (id) => window.InvoiceRepository.getById(id),
    getAll: () => window.InvoiceRepository.getAll(),
    getByPatient: (patientId) => window.InvoiceRepository.getByPatient(patientId),
  },

  payments: {
    add: (data) => dbAdd(STORES.payments, data),
    update: (data) => dbPut(STORES.payments, data),
    delete: (id) => dbDelete(STORES.payments, id),
    getById: (id) => dbGetById(STORES.payments, id),
    getAll: () => dbGetAll(STORES.payments),
    getByInvoice: (invoiceId) => dbGetByIndex(STORES.payments, 'invoiceId', invoiceId),
  },

  reports: {
    add: (data) => window.ReportRepository.create(data),
    update: (updates) => window.ReportRepository.update(updates.id, updates),
    delete: (id) => window.ReportRepository.delete(id),
    getById: (id) => window.ReportRepository.getById(id),
    getAll: () => window.ReportRepository.getAll(),
    getByPatient: (patientId) => window.ReportRepository.getByColumn('patientId', patientId),
  },

  profitAnalysis: {
    add: (data) => window.ProfitAnalysisRepository.create(data),
    update: (updates) => window.ProfitAnalysisRepository.update(updates.id, updates),
    delete: (id) => window.ProfitAnalysisRepository.delete(id),
    getById: (id) => window.ProfitAnalysisRepository.getById(id),
    getAll: () => window.ProfitAnalysisRepository.getAll(),
  },

  dashboard: {
    getSummary: () => window.DashboardRepository.getDashboardSummary(),
    getFinanceTrend: () => window.DashboardRepository.getFinanceTrend(),
    getRehabStatistics: () => window.DashboardRepository.getRehabStatistics(),
    refresh: () => window.DashboardRepository.refreshDashboard(),
  },

  notifications: {
    add: (data) => dbAdd(STORES.notifications, data),
    update: (data) => dbPut(STORES.notifications, data),
    delete: (id) => dbDelete(STORES.notifications, id),
    getAll: () => dbGetAll(STORES.notifications),
  },

  auditLogs: {
    add: (data) => dbAdd(STORES.auditLogs, data),
    getAll: () => dbGetAll(STORES.auditLogs),
  },

  stats: {
    getSummary: async () => {
      const [patients, medicines, prescriptions, appointments, treatmentPlans] = await Promise.all([
        window.PatientRepository.getAll(),
        dbGetAll(STORES.medicines),
        dbGetAll(STORES.prescriptions),
        window.AppointmentRepository.getAll(),
        window.RehabRepository.getAll(),
      ]);
      const today = new Date().toISOString().split('T')[0];
      const todaysVisits = prescriptions.filter(p => p.date === today).length + appointments.filter(a => a.date === today).length;
      const lowStock = medicines.filter(m => m.availableQty <= 10).length;
      const activeTreatments = treatmentPlans.filter(t => t.status === 'Active').length;
      return { totalPatients: patients.length, todaysVisits, lowStock, totalMedicines: medicines.length, activeTreatments, totalAppointments: appointments.length };
    },
  },

  profitTransactions: {
    getAll: () => dbGetAll(STORES.profitTransactions),

    /**
     * Retroactively recalculate revenue & profit for all transactions
     * of a given medicine using the updated buying/selling prices.
     * Called whenever a medicine's price is edited.
     */
    recalcProfitForMedicine: async (medicineId, newBuyingPrice, newSellingPrice) => {
      const bp = parseFloat(newBuyingPrice) || 0;
      const sp = parseFloat(newSellingPrice) || 0;
      const allTx = await dbGetAll(STORES.profitTransactions);
      const affected = allTx.filter(tx => tx.medicineId === medicineId);
      for (const tx of affected) {
        const qty = parseInt(tx.qtySold, 10) || 0;
        await dbPut(STORES.profitTransactions, {
          ...tx,
          revenue: sp * qty,
          profit:  (sp - bp) * qty,
        });
      }
      console.log(`[ReviveCMS] Recalculated profit for medicineId=${medicineId} (${affected.length} transactions).`);
    },
  },

  // Returns a promise that resolves once DB is ready and seeded
  ready: null,
  seed: seedDemoData,
  init: async function() {
    try {
      await initDB();
    } catch (e) {
      console.error('[ReviveCMS] DB Init failed', e);
    }
    try {
      await seedDemoData();
    } catch (e) {
      console.error('[ReviveCMS] Seeding failed', e);
    }
    try {
      await migratePatientIdsToSequential();
    } catch (e) {
      console.error('[ReviveCMS] Patient ID migration failed', e);
    }
    try {
      await migratePatientCodes();
    } catch (e) {
      console.error('[ReviveCMS] Patient Code migration failed', e);
    }
    try {
      await migrateProfitTransactions();
    } catch (e) {
      console.error('[ReviveCMS] Migration failed', e);
    }
    this.ready = true;
  },
};

// Auto-init on load (resolve before DOMContentLoaded fires if possible)
window.CMS.init();
