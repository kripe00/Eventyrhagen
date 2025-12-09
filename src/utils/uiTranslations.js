// src/utils/uiTranslations.js

// Enkel ordbok for UI-tekster
// Språkkoder matcher det du bruker ellers: "no", "en", "pl", "ar", "th"

const UI = {
  no: {
    headerTitle: 'Min Side',
    logout: 'Logg ut',
    noChildren: 'Ingen barn funnet',

    messagesTitle: 'Beskjeder fra barnehagen',

    statusHome: 'Hjemme',
    statusPresent: 'I barnehagen',
    statusSick: 'Meldt fravær',

    deliver: 'LEVER',
    pickUp: 'HENT',
    markRecovered: 'Friskmeld',
    reportAbsence: 'Meld fravær',

    sendMsgToDepartment: 'Send melding til',

    modalTitle: 'Melding til',
    appliesTo: 'Gjelder',
    modalPlaceholder: "Skriv beskjeden din her (f.eks. 'Bestemor henter i dag')...",
    modalSend: 'SEND MELDING',
  },

  en: {
    headerTitle: 'My Page',
    logout: 'Log out',
    noChildren: 'No children found',

    messagesTitle: 'Messages from the kindergarten',

    statusHome: 'At home',
    statusPresent: 'At kindergarten',
    statusSick: 'Reported absent',

    deliver: 'DROP OFF',
    pickUp: 'PICK UP',
    markRecovered: 'Mark as recovered',
    reportAbsence: 'Report absence',

    sendMsgToDepartment: 'Send message to',

    modalTitle: 'Message to',
    appliesTo: 'Applies to',
    modalPlaceholder: "Write your message here (e.g. 'Grandma will pick up today')...",
    modalSend: 'SEND MESSAGE',
  },

  pl: {
    headerTitle: 'Moja strona',
    logout: 'Wyloguj',
    noChildren: 'Brak dzieci',

    messagesTitle: 'Wiadomości z przedszkola',

    statusHome: 'W domu',
    statusPresent: 'W przedszkolu',
    statusSick: 'Zgłoszona nieobecność',

    deliver: 'PRZYPROWADŹ',
    pickUp: 'ODBIEŻ',
    markRecovered: 'Usuń nieobecność',
    reportAbsence: 'Zgłoś nieobecność',

    sendMsgToDepartment: 'Wyślij wiadomość do',

    modalTitle: 'Wiadomość do',
    appliesTo: 'Dotyczy',
    modalPlaceholder: "Napisz wiadomość (np. 'Babcia dziś odbierze')...",
    modalSend: 'WYŚLIJ WIADOMOŚĆ',
  },

  ar: {
    headerTitle: 'صفحتي',
    logout: 'تسجيل الخروج',
    noChildren: 'لا يوجد أطفال',

    messagesTitle: 'رسائل من الروضة',

    statusHome: 'في المنزل',
    statusPresent: 'في الروضة',
    statusSick: 'غياب مُبلّغ عنه',

    deliver: 'تسجيل الحضور',
    pickUp: 'استلام',
    markRecovered: 'إلغاء الغياب',
    reportAbsence: 'الإبلاغ عن غياب',

    sendMsgToDepartment: 'إرسال رسالة إلى',

    modalTitle: 'رسالة إلى',
    appliesTo: 'يخص',
    modalPlaceholder: "اكتب رسالتك هنا (مثلاً: 'الجدة ستقوم بالاستلام اليوم')...",
    modalSend: 'إرسال الرسالة',
  },

  th: {
    headerTitle: 'หน้าของฉัน',
    logout: 'ออกจากระบบ',
    noChildren: 'ไม่พบข้อมูลเด็ก',

    messagesTitle: 'ข้อความจากอนุบาล',

    statusHome: 'อยู่บ้าน',
    statusPresent: 'อยู่ที่อนุบาล',
    statusSick: 'แจ้งขาดเรียน',

    deliver: 'เช็กอิน',
    pickUp: 'รับกลับบ้าน',
    markRecovered: 'ยกเลิกการขาด',
    reportAbsence: 'แจ้งขาด',

    sendMsgToDepartment: 'ส่งข้อความถึง',

    modalTitle: 'ข้อความถึง',
    appliesTo: 'เกี่ยวกับ',
    modalPlaceholder: "พิมพ์ข้อความของคุณ (เช่น 'คุณยายจะมารับวันนี้')...",
    modalSend: 'ส่งข้อความ',
  },
};
export const LANGUAGE_OPTIONS = [
  { code: 'no', label: 'Norsk' },
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'ar', label: 'العربية' },
  { code: 'th', label: 'ไทย' },
];

// Liten hjelpefunksjon
export function t(lang, key) {
  const dict = UI[lang] || UI.no;
  return dict[key] || UI.no[key] || key;
}
