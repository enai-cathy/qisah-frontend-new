// ═══════════════════════════════════════════════
// QISAH DATABASE — Structured Islamic Content
// ═══════════════════════════════════════════════

// ── QURAN ──
export interface QuranVerse {
  id: string; surah_number: number; surah_name: string; surah_arabic: string;
  verse_range: string; arabic_text: string; translation: string;
  revelation: 'makkan' | 'madinan'; total_verses: number; juz: number;
  reason_for_revelation: string; verified: true;
}

export const quranVerses: QuranVerse[] = [
  {
    id: 'q1', surah_number: 94, surah_name: 'Ash-Sharh', surah_arabic: 'الشرح',
    verse_range: '5-6',
    arabic_text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: '"Verily, with hardship comes ease. Verily, with hardship comes ease."',
    revelation: 'makkan', total_verses: 8, juz: 30, verified: true,
    reason_for_revelation: 'This surah was revealed to rescue the Prophet Muhammad ﷺ during a time of great difficulty in Makkah. The repetition emphasizes that relief accompanies hardship itself.',
  },
  {
    id: 'q2', surah_number: 2, surah_name: 'Al-Baqarah', surah_arabic: 'البقرة',
    verse_range: '286',
    arabic_text: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: '"Allah does not burden a soul beyond that it can bear."',
    revelation: 'madinan', total_verses: 286, juz: 3, verified: true,
    reason_for_revelation: 'Revealed to reassure believers that divine commandments are within human capacity.',
  },
  {
    id: 'q3', surah_number: 65, surah_name: 'At-Talaq', surah_arabic: 'الطلاق',
    verse_range: '7',
    arabic_text: 'سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا',
    translation: '"Allah will bring about, after hardship, ease."',
    revelation: 'madinan', total_verses: 12, juz: 28, verified: true,
    reason_for_revelation: 'Revealed regarding provisions during the waiting period, extending to a general promise of divine relief.',
  },
];

// ── HADITH ──
export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mukhtalaf';

export interface Hadith {
  id: string; arabic_text: string; english_text: string;
  source: string; source_book: string; hadith_number: string;
  narrator: string; grade: HadithGrade;
  chain_strength: string; chain_description: string;
  text_strength: string; text_description: string;
  context: string; note_type: string; note_title: string; note_text: string;
  alternative_arabic?: string; alternative_english?: string; alternative_source?: string;
}

export const hadithCollection: Hadith[] = [
  {
    id: 'h1', grade: 'sahih',
    arabic_text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english_text: '"Actions are judged by intentions, and every person will get the reward according to what they have intended…"',
    source: 'Sahih al-Bukhari, Book 1, Hadith 1', source_book: 'Sahih al-Bukhari', hadith_number: '1',
    narrator: 'Umar ibn al-Khattab',
    chain_strength: 'Strong Link', chain_description: 'Continuous reliable chain of trustworthy narrators from Umar (RA) through multiple confirmed paths.',
    text_strength: 'Accepted', text_description: 'Aligns with Quran and other authentic texts. No contradiction found.',
    context: 'This narration is considered one of the most fundamental principles of Islamic law. It emphasizes that the validity and reward of deeds depend on the intention behind them.',
    note_type: 'misconception', note_title: '⚠ Common misconception',
    note_text: 'Good intentions do not justify impermissible actions. The action itself must also be permissible within Islamic law.',
  },
  {
    id: 'h2', grade: 'hasan',
    arabic_text: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي',
    english_text: '"The best of you is the best to his family, and I am the best of you to my family."',
    source: 'Sunan al-Tirmidhi, Book 49, Hadith 3895', source_book: 'Sunan al-Tirmidhi', hadith_number: '3895',
    narrator: 'Aisha bint Abu Bakr',
    chain_strength: 'Acceptable', chain_description: 'Minor weakness in one narrator, but corroborated by other chains.',
    text_strength: 'Accepted', text_description: 'Aligns with Quran and other authentic texts about family treatment.',
    context: 'This narration emphasizes the importance of good character within the family. The Prophet ﷺ used his own example as the standard.',
    note_type: 'guidance', note_title: '💛 Guidance note',
    note_text: 'Accepted for ethics and general guidance across major schools. Reliable but with slightly lesser chain strength than Sahih.',
  },
  {
    id: 'h3', grade: 'daif',
    arabic_text: 'اطلبوا العلم ولو فى الصين',
    english_text: '"Seek knowledge even if you have to go to China"',
    source: 'Attributed to Al-Bayhaqi & Ibn Adi', source_book: 'Various', hadith_number: 'N/A',
    narrator: 'Anas ibn Malik (disputed)',
    chain_strength: 'Broken Link', chain_description: 'Contains Abu Atikah, considered unreliable by most muhaddithin.',
    text_strength: 'Consistent', text_description: 'Meaning aligns with the general Islamic principle of seeking knowledge.',
    context: 'While the chain of this narration is weak, the principle of seeking knowledge is firmly established through numerous authentic narrations and Quranic verses.',
    note_type: 'action', note_title: '⚠ What should I do?',
    note_text: 'Do not attribute this specific wording to the Prophet ﷺ. The meaning is valid, but use authentic narrations instead when sharing.',
    alternative_arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    alternative_english: '"Seeking knowledge is an obligation upon every Muslim."',
    alternative_source: 'Sunan Ibn Majah · Sahih',
  },
  {
    id: 'h4', grade: 'mukhtalaf',
    arabic_text: 'اختلاف أمتي رحمة',
    english_text: '"The difference of opinion among my Ummah is a mercy."',
    source: 'Attributed — disputed chain', source_book: 'Various', hadith_number: 'N/A',
    narrator: 'No confirmed narrator',
    chain_strength: 'Disputed', chain_description: 'No agreed-upon chain. Some scholars accept, others reject entirely.',
    text_strength: 'Meaning Accepted', text_description: 'Core meaning supported by Quran 2:213 and established scholarly practice.',
    context: 'Scholarly disagreement on this narration reflects the diversity of methodology within Islamic tradition.',
    note_type: 'scholarly', note_title: '📋 Scholarly note',
    note_text: 'Even scholars who reject the chain acknowledge the core principle — that respectful scholarly disagreement enriches Islamic jurisprudence.',
  },
];

// ── TAFSIR ──
export interface Tafsir {
  id: string; verse_id: string; source: string; author: string;
  type: 'Classic' | 'Hadith-based' | 'Legal' | 'Modern';
  initial: string; color: string; bg: string;
  content: string;
}

export const tafsirSources: Tafsir[] = [
  { id: 't1', verse_id: 'q1', source: 'Tafsir al-Tabari', author: 'Ibn Jarir al-Tabari', type: 'Classic', initial: 'AT', color: '#3E7C59', bg: '#E8F9ED', content: 'Al-Tabari explains that the repetition in these verses emphasizes certainty — that ease is not merely promised after hardship, but is a divine guarantee accompanying it.' },
  { id: 't2', verse_id: 'q1', source: 'Tafsir Ibn Kathir', author: 'Ismail ibn Kathir', type: 'Hadith-based', initial: 'IK', color: '#C9A24D', bg: '#FDF8ED', content: 'Ibn Kathir connects this verse to the hadith: "One hardship cannot overcome two eases." He emphasizes the Prophet\'s patience during the Meccan persecution as context.' },
  { id: 't3', verse_id: 'q1', source: 'Tafsir al-Qurtubi', author: 'Al-Qurtubi', type: 'Legal', initial: 'QT', color: '#7B68A8', bg: '#F3F0F8', content: 'Al-Qurtubi derives legal principles from this surah, noting that patience during hardship is not merely recommended but carries immense spiritual reward.' },
  { id: 't4', verse_id: 'q2', source: 'Tafsir al-Tabari', author: 'Ibn Jarir al-Tabari', type: 'Classic', initial: 'AT', color: '#3E7C59', bg: '#E8F9ED', content: 'Al-Tabari explains this verse was revealed when companions worried about being accountable for inner thoughts. Allah reassured them that obligations remain within human capacity.' },
];

// ── SCHOLARS ──
export interface Scholar {
  id: string; name: string; arabic_name: string; initial: string;
  school: string; era: string; grading?: string;
  work: string; bio: string;
  color: string; bg_color: string;
  hadith_count: number; works_count: number;
  commentary?: string;
  related_hadith_ids: string[];
}

export const scholars: Scholar[] = [
  {
    id: 's1', name: 'Imam al-Nawawi', arabic_name: 'أبو زكريا يحيى بن شرف النووي', initial: 'N',
    school: "Shafi'i", era: '631–676 AH', work: 'Riyadh as-Salihin',
    bio: 'Imam al-Nawawi was one of the most influential scholars of the Shafi\'i school. Born in Nawa, Syria, he authored over forty works including the renowned "40 Hadith" collection and "Riyadh as-Salihin."',
    color: '#3E7C59', bg_color: '#E8F9ED', hadith_count: 2847, works_count: 42,
    commentary: 'Places this hadith first in his renowned "40 Hadith" collection, emphasizing that intention is the foundational criterion by which all deeds are judged.',
    related_hadith_ids: ['h1', 'h2', 'h3'],
  },
  {
    id: 's2', name: 'Imam Abu Hanifa', arabic_name: 'أبو حنيفة النعمان', initial: 'A',
    school: 'Hanafi', era: '80–150 AH', work: 'Al-Fiqh al-Akbar',
    bio: 'Abu Hanifa was the founder of the Hanafi school of jurisprudence, the largest school of Islamic law by number of followers.',
    color: '#2B6CB8', bg_color: 'rgba(59,125,216,.08)', hadith_count: 1200, works_count: 15,
    related_hadith_ids: ['h1'],
  },
  {
    id: 's3', name: 'Al Qadi Iyad', arabic_name: 'القاضي عياض', initial: 'Q',
    school: 'Maliki', era: '476–544 AH', work: "Ikmal al-Mu'lim",
    bio: 'Qadi Iyad was a renowned Maliki scholar and judge, best known for his work "Ash-Shifa" on the rights and qualities of the Prophet ﷺ.',
    color: '#B86320', bg_color: 'rgba(212,118,44,.08)', hadith_count: 890, works_count: 20,
    related_hadith_ids: ['h1'],
  },
  {
    id: 's4', name: 'Ibn Rajab al-Hanbali', arabic_name: 'ابن رجب الحنبلي', initial: 'H',
    school: 'Hanbali', era: '736–795 AH', work: "Jami' al-Ulum",
    bio: 'Ibn Rajab was a Hanbali scholar known for his commentary on Imam al-Nawawi\'s 40 Hadith collection.',
    color: '#7B68A8', bg_color: '#F3F0F8', hadith_count: 1500, works_count: 30,
    related_hadith_ids: ['h1', 'h4'],
  },
  {
    id: 's5', name: 'Al-Albani', arabic_name: 'الألباني', initial: 'A',
    school: 'Muhaddith', era: '1914–1999 CE', work: 'Silsilah al-Sahihah',
    bio: 'Muhammad Nasir al-Din al-Albani was a renowned 20th century hadith scholar known for his extensive grading of hadith.',
    color: '#636366', bg_color: '#F2F2F7', hadith_count: 5000, works_count: 60,
    related_hadith_ids: ['h3', 'h4'],
  },
];

// ── CHAIN NARRATORS ──
export interface ChainNarrator {
  id: string; hadith_id: string; position: number;
  name: string; arabic_name: string;
  reliability: 'infallible' | 'trustworthy' | 'reliable' | 'weak' | 'unknown';
  era: string;
}

export const chainNarrators: ChainNarrator[] = [
  { id: 'cn1', hadith_id: 'h1', position: 0, name: 'Prophet Muhammad ﷺ', arabic_name: 'النبي محمد ﷺ', reliability: 'infallible', era: 'Prophet' },
  { id: 'cn2', hadith_id: 'h1', position: 1, name: 'Umar ibn al-Khattab', arabic_name: 'عمر بن الخطاب', reliability: 'trustworthy', era: 'Companion' },
  { id: 'cn3', hadith_id: 'h1', position: 2, name: 'Alqamah ibn Waqqas', arabic_name: 'علقمة بن وقاص', reliability: 'trustworthy', era: "Tabi'i" },
  { id: 'cn4', hadith_id: 'h1', position: 3, name: 'Muhammad ibn Ibrahim', arabic_name: 'محمد بن إبراهيم', reliability: 'reliable', era: "Tabi'i" },
  { id: 'cn5', hadith_id: 'h1', position: 4, name: "Yahya ibn Sa'id", arabic_name: 'يحيى بن سعيد', reliability: 'trustworthy', era: 'Hadith Scholar' },
  { id: 'cn6', hadith_id: 'h1', position: 5, name: 'Imam al-Bukhari', arabic_name: 'الإمام البخاري', reliability: 'trustworthy', era: '194–256 AH' },
];

// ── LECTURES ──
export interface Lecture {
  id: string; title: string; speaker: string; duration: string;
  thumbnail?: string; gradient_from: string; gradient_to: string;
  related_content_id: string; related_content_type: 'hadith' | 'quran';
}

export const lectures: Lecture[] = [
  { id: 'l1', title: 'Navigating struggles of Dunya', speaker: 'Sh. Mikaeel Smith', duration: '14:20', gradient_from: 'rgba(62,124,89,.2)', gradient_to: 'rgba(62,124,89,.08)', related_content_id: 'q1', related_content_type: 'quran' },
  { id: 'l2', title: "Allah's help is indeed near", speaker: 'The Muslim Lantern', duration: '20:10', gradient_from: 'rgba(201,162,77,.2)', gradient_to: 'rgba(201,162,77,.08)', related_content_id: 'q1', related_content_type: 'quran' },
  { id: 'l3', title: 'Understanding intentions in Islam', speaker: 'Sh. Hamza Yusuf', duration: '12:30', gradient_from: 'rgba(62,124,89,.15)', gradient_to: 'rgba(62,124,89,.05)', related_content_id: 'h1', related_content_type: 'hadith' },
  { id: 'l4', title: 'Practical applications in daily life', speaker: 'Dr. Omar Suleiman', duration: '18:45', gradient_from: 'rgba(201,162,77,.15)', gradient_to: 'rgba(201,162,77,.05)', related_content_id: 'h1', related_content_type: 'hadith' },
  { id: 'l5', title: 'Understanding weak narrations', speaker: 'Dr. Yasir Qadhi', duration: '9:45', gradient_from: 'rgba(201,74,74,.12)', gradient_to: 'rgba(201,74,74,.04)', related_content_id: 'h3', related_content_type: 'hadith' },
  { id: 'l6', title: 'How scholars grade hadith chains', speaker: 'Sh. Hamza Yusuf', duration: '14:30', gradient_from: 'rgba(201,162,77,.12)', gradient_to: 'rgba(201,162,77,.04)', related_content_id: 'h3', related_content_type: 'hadith' },
  { id: 'l7', title: 'How to verify what you hear', speaker: 'Dr. Omar Suleiman', duration: '16:20', gradient_from: 'rgba(201,162,77,.15)', gradient_to: 'rgba(201,162,77,.05)', related_content_id: 'h4', related_content_type: 'hadith' },
  { id: 'l8', title: 'Identifying fabricated hadith', speaker: 'Sh. Yasir Qadhi', duration: '12:10', gradient_from: 'rgba(201,74,74,.1)', gradient_to: 'rgba(201,74,74,.03)', related_content_id: 'h4', related_content_type: 'hadith' },
];

// ── USERS ──
export interface User {
  id: string; username: string; email: string; password: string;
  createdAt: string; madhab: string; isPro: boolean; isSuspended: boolean;
}

let users: User[] = [
  { id: 'u1', username: 'ahmed_ali', email: 'ahmed@example.com', password: 'qisah2026', createdAt: '2026-03-01T10:00:00Z', madhab: 'shafii', isPro: false, isSuspended: false },
  { id: 'u2', username: 'fatima_zahra', email: 'fatima@example.com', password: 'test1234', createdAt: '2026-03-05T14:30:00Z', madhab: 'hanafi', isPro: true, isSuspended: false },
  { id: 'u3', username: 'admin', email: 'admin@qisah.app', password: 'admin123', createdAt: '2026-01-01T00:00:00Z', madhab: 'shafii', isPro: true, isSuspended: false },
];

// ═══════════════════════════════════════════════
// DATA ACCESS LAYER — Service functions
// ═══════════════════════════════════════════════

// ── Quran ──
export function getQuranVerse(id: string): QuranVerse | undefined {
  return quranVerses.find(v => v.id === id);
}
export function getQuranByReference(surah: number, verse?: string): QuranVerse | undefined {
  return quranVerses.find(v => v.surah_number === surah && (!verse || v.verse_range === verse));
}

// ── Hadith ──
export function getHadithById(id: string): Hadith | undefined {
  return hadithCollection.find(h => h.id === id);
}
export function getHadithByGrade(grade: HadithGrade): Hadith | undefined {
  return hadithCollection.find(h => h.grade === grade);
}

// ── Tafsir ──
export function getTafsirByVerse(verseId: string): Tafsir[] {
  return tafsirSources.filter(t => t.verse_id === verseId);
}

// ── Scholars ──
export function getScholarById(id: string): Scholar | undefined {
  return scholars.find(s => s.id === id);
}
export function getScholarsByHadith(hadithId: string): Scholar[] {
  return scholars.filter(s => s.related_hadith_ids.includes(hadithId));
}

// ── Chain ──
export function getChainByHadith(hadithId: string): ChainNarrator[] {
  return chainNarrators.filter(n => n.hadith_id === hadithId).sort((a, b) => a.position - b.position);
}

// ── Lectures ──
export function getLecturesByContent(contentId: string): Lecture[] {
  return lectures.filter(l => l.related_content_id === contentId);
}
export function getAllLectures(): Lecture[] {
  return lectures;
}

// ── Search ──
export function searchContent(query: string): { type: string; id: string; title: string; match: string }[] {
  const q = query.toLowerCase();
  const results: { type: string; id: string; title: string; match: string }[] = [];
  hadithCollection.forEach(h => {
    if (h.english_text.toLowerCase().includes(q) || h.arabic_text.includes(query))
      results.push({ type: 'hadith', id: h.id, title: h.english_text.slice(1, 50) + '…', match: h.source });
  });
  quranVerses.forEach(v => {
    if (v.translation.toLowerCase().includes(q) || v.arabic_text.includes(query))
      results.push({ type: 'quran', id: v.id, title: v.surah_name + ' ' + v.verse_range, match: v.translation.slice(1, 50) + '…' });
  });
  return results;
}

// ── Users / Auth ──
export function createUser(username: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
  if (!username || username.length < 3) return { success: false, error: 'Username must be at least 3 characters' };
  if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address' };
  if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
  if (users.find(u => u.email === email)) return { success: false, error: 'An account with this email already exists' };
  if (users.find(u => u.username === username)) return { success: false, error: 'This username is already taken' };
  const user: User = { id: 'u' + (users.length + 1), username, email, password, createdAt: new Date().toISOString(), madhab: 'shafii', isPro: false, isSuspended: false };
  users.push(user);
  return { success: true, user };
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: User } {
  if (!email || !password) return { success: false, error: 'Please fill in all fields' };
  const user = users.find(u => u.email === email);
  if (!user) return { success: false, error: 'No account found with this email' };
  if (user.isSuspended) return { success: false, error: 'This account has been suspended' };
  if (user.password !== password) return { success: false, error: 'Incorrect password. Please try again.' };
  return { success: true, user };
}

export function getUsers(): User[] { return users; }
export function deleteUser(id: string): boolean { const i = users.findIndex(u => u.id === id); if (i >= 0) { users.splice(i, 1); return true; } return false; }
export function suspendUser(id: string): boolean { const u = users.find(u => u.id === id); if (u) { u.isSuspended = !u.isSuspended; return true; } return false; }

// ── Pricing ──
export function getPricing(countryCode: string): { currency: string; symbol: string; annual: number; monthly: number; annualMonthly: number } {
  if (countryCode === 'NG') return { currency: 'NGN', symbol: '₦', annual: 37999, monthly: 4500, annualMonthly: 3166 };
  return { currency: 'USD', symbol: '$', annual: 47.99, monthly: 6.99, annualMonthly: 3.99 };
}
