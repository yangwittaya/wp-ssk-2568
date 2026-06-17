// =====================================================
//  config.js — Firebase Config
//  กระดาษทำการออนไลน์ โรงเรียนศรีสะเกษวิทยาลัย 2568
// =====================================================
//  ⚠️  แก้ค่าด้านล่างนี้ด้วย Firebase config ของคุณ
//  Firebase Console → Project Settings → Your apps → Config

const firebaseConfig = {
  apiKey:            "AIzaSyA1JKnmgAIXc7ut9i7MBvdJiDHIotcRFrk",
  authDomain:        "wp-ssk-2568.firebaseapp.com",
  projectId:         "wp-ssk-2568",
  storageBucket:     "wp-ssk-2568.firebasestorage.app",
  messagingSenderId: "125230466673",
  appId:             "1:125230466673:web:aa44a52ea9e61627c57dd0",
  measurementId:     "G-ZDRH1KM027"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== คงที่ของโปรเจกต์ =====
const APP_CONFIG = {
  unit:    "สำนักตรวจเงินแผ่นดินจังหวัดศรีสะเกษ",
  auditee: "โรงเรียนศรีสะเกษวิทยาลัย",
  year:    "2568",
  yearPrev:"2567",
  wpRef:   "อปท.8.31.2"
};

const EXPENSE_CATS = [
  { no: "1", name: "ลูกจ้างชั่วคราว" },
  { no: "2", name: "ค่าตอบแทน" },
  { no: "3", name: "ค่าใช้สอย" },
  { no: "4", name: "ค่าสาธารณูปโภค" },
  { no: "5", name: "ค่าวัสดุ" },
  { no: "6", name: "ค่าครุภัณฑ์" },
  { no: "7", name: "ค่าที่ดินและสิ่งปลูกสร้าง" },
  { no: "8", name: "เงินอุดหนุน" },
  { no: "9", name: "รายจ่ายอื่น ๆ" }
];

const PROCS = [
  { no: "1", label: "ค่าใช้จ่ายเกิดขึ้นจริง มีหลักฐาน",        assert: "A" },
  { no: "2", label: "บันทึกบัญชีถูกต้อง ครบถ้วน",              assert: "A,C" },
  { no: "3", label: "เอกสารประกอบการเบิกจ่ายครบถ้วน",          assert: "A,C" },
  { no: "4", label: "ปรากฏในแผนปฏิบัติการปี 2568",            assert: "V" },
  { no: "5", label: "อนุมัติโดยผู้มีอำนาจถูกต้อง",             assert: "A,V" },
  { no: "6", label: "วิธีจัดซื้อจัดจ้างถูกต้อง (พ.ร.บ. 2560)",assert: "V" },
  { no: "7", label: "เป็นไปตามวัตถุประสงค์ที่กำหนด",           assert: "V" },
  { no: "8", label: "จำนวนเงินถูกต้องตรงกับใบสำคัญ",           assert: "V" },
  { no: "9", label: "ข้อสังเกต/ประเด็นอื่น ๆ",                 assert: "D" }
];

const PROC_OPTIONS = ["✓", "✗", "N/A"];
const RESULT_OPTIONS = ["ผ่าน", "มีข้อสังเกต", "ไม่ผ่าน"];

// Collection name
const COL_ENTRIES = "wpEntries";

// ===== Firestore helpers =====
async function getEntries(categoryNo = null) {
  let q = categoryNo
    ? db.collection(COL_ENTRIES).where("category", "==", categoryNo)
    : db.collection(COL_ENTRIES);
  const snap = await q.get();
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => {
    const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return ta - tb;
  });
  return docs;
}

async function addEntry(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  const ref = await db.collection(COL_ENTRIES).add(data);
  return ref.id;
}

async function updateEntry(id, data) {
  data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  await db.collection(COL_ENTRIES).doc(id).update(data);
}

async function deleteEntry(id) {
  await db.collection(COL_ENTRIES).doc(id).delete();
}

function subscribeEntries(categoryNo, callback) {
  // ใช้ where อย่างเดียว แล้ว sort client-side เพื่อไม่ต้องสร้าง Composite Index
  let q = categoryNo
    ? db.collection(COL_ENTRIES).where("category", "==", categoryNo)
    : db.collection(COL_ENTRIES);
  return q.onSnapshot(
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return ta - tb;
      });
      callback(docs);
    },
    err => {
      console.error('Firestore error:', err);
      callback([]);
    }
  );
}

function subscribeAll(callback) {
  return db.collection(COL_ENTRIES).onSnapshot(
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return ta - tb;
      });
      callback(docs);
    },
    err => {
      console.error('Firestore error:', err);
      callback([]);
    }
  );
}

// ===== Utility =====
function formatNum(n) {
  if (!n && n !== 0) return "";
  return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function catName(no) {
  const c = EXPENSE_CATS.find(x => x.no === String(no));
  return c ? c.name : no;
}

function resultClass(r) {
  if (r === "ผ่าน") return "badge-success";
  if (r === "ไม่ผ่าน") return "badge-danger";
  if (r === "มีข้อสังเกต") return "badge-warning";
  return "badge-info";
}
