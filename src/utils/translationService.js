

//  Språkliste
export const LANGUAGE_OPTIONS = [
  { code: 'no', label: 'Norsk' },
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'ar', label: 'العربية' },
  { code: 'th', label: 'ไทย' },
];

//  Statisk Ordbok (UI)
const UI = {
  no: {
    headerTitle: 'Min Side',
    logout: 'Logg ut',
    noChildren: 'Ingen barn funnet',
    
    messagesTitle: 'Beskjeder',
    newBadge: 'NY',
    markRead: 'Marker som lest',
    showMore: 'Vis alle',
    showLess: 'Vis færre',
    
    statusHome: 'Hjemme',
    statusPresent: 'I barnehagen',
    statusSick: 'Meldt fravær',
    
    deliver: 'LEVER',
    pickUp: 'HENT',
    markRecovered: 'Friskmeld',
    reportAbsence: 'Meld fravær',
    sickShort: 'SYK',
    checkIn: 'Inn',
    
    sendMsgToDepartment: 'Send melding til',
    modalTitle: 'Melding til',
    appliesTo: 'Gjelder',
    modalPlaceholder: "Skriv beskjeden din her...",
    modalSend: 'SEND MELDING',
  },

  en: {
    headerTitle: 'My Page',
    logout: 'Log out',
    noChildren: 'No children found',
    messagesTitle: 'Messages',
    newBadge: 'NEW',
    markRead: 'Mark as read',
    showMore: 'Show all',
    showLess: 'Show less',
    statusHome: 'At home',
    statusPresent: 'At kindergarten',
    statusSick: 'Reported absent',
    deliver: 'DROP OFF',
    pickUp: 'PICK UP',
    markRecovered: 'Mark recovered',
    reportAbsence: 'Report absence',
    sickShort: 'SICK',
    checkIn: 'In',
    sendMsgToDepartment: 'Send message to',
    modalTitle: 'Message to',
    appliesTo: 'Applies to',
    modalPlaceholder: "Write your message here...",
    modalSend: 'SEND MESSAGE',
  },
  pl: {
    headerTitle: 'Moja strona',
    logout: 'Wyloguj',
    noChildren: 'Nie znaleziono dzieci',
    messagesTitle: 'Wiadomości',
    newBadge: 'NOWE',
    markRead: 'Oznacz jako przeczytane',
    showMore: 'Pokaż wszystko',
    showLess: 'Pokaż mniej',
    statusHome: 'W domu',
    statusPresent: 'W przedszkolu',
    statusSick: 'Zgłoszona nieobecność',
    deliver: 'PRZYPROWADŹ',
    pickUp: 'ODBIERZ',
    markRecovered: 'Zgłoś powrót',
    reportAbsence: 'Zgłoś nieobecność',
    sickShort: 'CHORY',
    checkIn: 'Wejście',
    sendMsgToDepartment: 'Wyślij wiadomość do',
    modalTitle: 'Wiadomość do',
    appliesTo: 'Dotyczy',
    modalPlaceholder: "Napisz wiadomość tutaj...",
    modalSend: 'WYŚLIJ',
  },
  ar: {
    headerTitle: 'صفحتي',
    logout: 'تسجيل الخروج',
    noChildren: 'لا يوجد أطفال',
    messagesTitle: 'الرسائل',
    newBadge: 'جديد',
    markRead: 'تحديد كمقروء',
    showMore: 'عرض الكل',
    showLess: 'عرض أقل',
    statusHome: 'في المنزل',
    statusPresent: 'في الروضة',
    statusSick: 'غياب مُبلّغ عنه',
    deliver: 'تسليم',
    pickUp: 'استلام',
    markRecovered: 'تسجيل عودة',
    reportAbsence: 'الإبلاغ عن غياب',
    sickShort: 'مريض',
    checkIn: 'دخول',
    sendMsgToDepartment: 'إرسال رسالة إلى',
    modalTitle: 'رسالة إلى',
    appliesTo: 'يخص',
    modalPlaceholder: "اكتب رسالتك هنا...",
    modalSend: 'إرسال',
  },
  th: {
    headerTitle: 'หน้าของฉัน',
    logout: 'ออกจากระบบ',
    noChildren: 'ไม่พบข้อมูลเด็ก',
    messagesTitle: 'ข้อความ',
    newBadge: 'ใหม่',
    markRead: 'ทำเครื่องหมายว่าอ่านแล้ว',
    showMore: 'แสดงทั้งหมด',
    showLess: 'แสดงน้อยลง',
    statusHome: 'อยู่บ้าน',
    statusPresent: 'อยู่ที่โรงเรียน',
    statusSick: 'แจ้งลา',
    deliver: 'มาส่ง',
    pickUp: 'มารับ',
    markRecovered: 'แจ้งหายป่วย',
    reportAbsence: 'แจ้งลาหยุด',
    sickShort: 'ป่วย',
    checkIn: 'เข้า',
    sendMsgToDepartment: 'ส่งข้อความถึง',
    modalTitle: 'ข้อความถึง',
    appliesTo: 'เกี่ยวกับ',
    modalPlaceholder: "พิมพ์ข้อความของคุณที่นี่...",
    modalSend: 'ส่งข้อความ',
  },
};

const fallback = UI.en; 

// Statisk t-funksjon (DENNE MANGLER OG FORÅRSAKER FEILEN!)
export function t(lang, key) {
  const dict = UI[lang] || UI.no;
  return dict[key] || fallback[key] || key;
}

//  API Oversettelse (MyMemory)
export const translateText = async (text, targetLang, sourceLang = 'no') => {
  if (!text || targetLang === sourceLang) return { ok: true, text: text };

  // Bruk din e-post her for bedre kvote
  
  const langPair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=${email}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return { ok: false, text: text };

    const data = await res.json();
    if (data && data.responseData && typeof data.responseData.translatedText === 'string') {
      return { ok: true, text: data.responseData.translatedText };
    }
    return { ok: false, text: text };

  } catch (error) {
    return { ok: false, text: text };
  }
};