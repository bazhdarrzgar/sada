const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'berdoz_management';

async function seedVIPDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('🔄 Connected to MongoDB. Seeding VIP Collections...');
    
    // Clear existing data from VIP collections only
    const vipCollections = [
      'teacher_info', 'employee_leaves', 'bus_management', 'supervision', 
      'supervised_students', 'exam_supervision', 'monthly_expenses',
      'calendar_entries', 'staff_records', 'payroll', 'activities',
      'installments', 'building_expenses', 'daily_accounts',
      'kitchen_expenses', 'student_permissions', 'teachers'
    ];

    for (const collection of vipCollections) {
      await db.collection(collection).deleteMany({});
    }
    
    console.log('🗑️  Cleared existing data from VIP collections');

    // Calendar Entries (بەڕێوەبردنی ساڵنامە) - 12 entries
    const calendarEntries = [
      {
        id: uuidv4(),
        month: 'January 2025',
        week1: ['MTG', 'REV', 'PLA', 'EXE', 'EVA'],
        week2: ['TRN', 'DEV', 'TST', 'DOC', 'REP'],
        week3: ['ANA', 'DES', 'IMP', 'VER', 'DEP'],
        week4: ['MON', 'SUP', 'ADM', 'FIN', 'CLS'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'February 2025',
        week1: ['STR', 'ORG', 'PLN', 'SCH', 'COO'],
        week2: ['LEA', 'TEA', 'STU', 'PAR', 'COM'],
        week3: ['ASS', 'GRA', 'FEE', 'EXA', 'CER'],
        week4: ['HRD', 'SFT', 'TEC', 'INF', 'SYS'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'March 2025',
        week1: ['PRJ', 'RES', 'COL', 'NET', 'SUB'],
        week2: ['ACT', 'SPO', 'ART', 'CUL', 'MUS'],
        week3: ['SCL', 'EDU', 'VIS', 'TRP', 'FLD'],
        week4: ['EVL', 'RPT', 'FBK', 'IMP', 'UPD'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'April 2025',
        week1: ['WRK', 'SEM', 'CNF', 'PTN', 'MET'],
        week2: ['LAB', 'EXP', 'DEM', 'PRE', 'SHW'],
        week3: ['GRP', 'IND', 'PRP', 'STD', 'QUZ'],
        week4: ['FNL', 'GRD', 'CMP', 'SUB', 'RCR'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'May 2025',
        week1: ['SPR', 'GAM', 'TON', 'CMP', 'AWR'],
        week2: ['MSC', 'DNC', 'THT', 'PFM', 'SHO'],
        week3: ['GRD', 'CRM', 'AWR', 'PRS', 'PTY'],
        week4: ['HOL', 'CEL', 'FUN', 'RLX', 'PLN'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'June 2025',
        week1: ['EXM', 'FNL', 'STD', 'REV', 'PRP'],
        week2: ['TST', 'ASS', 'EVL', 'GRD', 'FBK'],
        week3: ['RLT', 'RPT', 'ANL', 'SUM', 'CON'],
        week4: ['VAC', 'RES', 'PLN', 'NXT', 'YAR'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'July 2025',
        week1: ['VAC', 'TRV', 'RST', 'FML', 'HBY'],
        week2: ['RLX', 'SPO', 'RED', 'WRT', 'PLY'],
        week3: ['VIS', 'FRD', 'PAR', 'CEL', 'FUN'],
        week4: ['PRP', 'PLN', 'NXT', 'TRM', 'RDY'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'August 2025',
        week1: ['STR', 'NEW', 'TRM', 'WEL', 'INT'],
        week2: ['ORG', 'CLS', 'TCH', 'STU', 'SCH'],
        week3: ['SUB', 'PLN', 'TBL', 'ASG', 'PRJ'],
        week4: ['EVL', 'TST', 'ASS', 'GRD', 'FBK'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'September 2025',
        week1: ['ACT', 'SPO', 'COM', 'TEA', 'LEA'],
        week2: ['PRJ', 'RES', 'EXP', 'LAB', 'FLD'],
        week3: ['EVE', 'CEL', 'FES', 'CUL', 'ART'],
        week4: ['REV', 'TST', 'MID', 'TRM', 'EXM'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'October 2025',
        week1: ['HAL', 'CEL', 'FES', 'COS', 'FUN'],
        week2: ['PRJ', 'SCI', 'FAI', 'EXH', 'SHW'],
        week3: ['PAR', 'MET', 'CON', 'DIS', 'PLN'],
        week4: ['PRE', 'FNL', 'EXM', 'STD', 'REV'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'November 2025',
        week1: ['GRA', 'THA', 'CEL', 'FEA', 'FML'],
        week2: ['WIN', 'SPO', 'IND', 'GAM', 'COM'],
        week3: ['ART', 'MUS', 'THE', 'PER', 'SHW'],
        week4: ['PRE', 'HOL', 'PLN', 'VAC', 'RES'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        month: 'December 2025',
        week1: ['WIN', 'FES', 'CEL', 'GIF', 'JOY'],
        week2: ['CON', 'CAR', 'CHR', 'MAS', 'SPI'],
        week3: ['YEA', 'END', 'REF', 'PLN', 'NEW'],
        week4: ['HOL', 'VAC', 'FAM', 'TIM', 'RES'],
        year: 2025,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Staff Records (تۆمارەکانی ستاف) - 15 entries
    const staffRecords = [
      {
        id: uuidv4(),
        fullName: 'احمد محمد علی',
        mobile: '+964 750 123 4567',
        address: 'هەولێر - سەنتەر',
        gender: 'Male',
        dateOfBirth: '1985-03-15',
        certificate: 'بەکالۆریۆس لە وەرزش',
        age: 40,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Physical Education',
        pass: 'A+',
        contract: 'Permanent',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'فاطمه رەشید حسەن',
        mobile: '+964 751 234 5678',
        address: 'هەولێر - بازار',
        gender: 'Female',
        dateOfBirth: '1990-07-22',
        certificate: 'ماستەر لە زانست',
        age: 35,
        education: 'Master Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Science',
        pass: 'A',
        contract: 'Permanent',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'عومەر سالح محمود',
        mobile: '+964 752 345 6789',
        address: 'هەولێر - تایران',
        gender: 'Male',
        dateOfBirth: '1987-11-08',
        certificate: 'بەکالۆریۆس لە کۆمپیوتەر',
        age: 38,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Computer Science',
        pass: 'B+',
        contract: 'Permanent',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'زەینەب کەریم ئەحمەد',
        mobile: '+964 753 456 7890',
        address: 'هەولێر - شۆڕش',
        gender: 'Female',
        dateOfBirth: '1992-05-14',
        certificate: 'بەکالۆریۆس لە هونەر',
        age: 33,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Arts',
        pass: 'A-',
        contract: 'Contract',
        bloodType: 'AB+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'کاروان ئیبراهیم مولود',
        mobile: '+964 754 567 8901',
        address: 'هەولێر - درەام سیتی',
        gender: 'Male',
        dateOfBirth: '1983-09-30',
        certificate: 'ماستەر لە بەڕێوەبردن',
        age: 42,
        education: 'Master Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Administration',
        pass: 'A+',
        contract: 'Permanent',
        bloodType: 'O-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'هەنگاو نەوروز قادر',
        mobile: '+964 755 678 9012',
        address: 'هەولێر - کۆی زانیاری',
        gender: 'Female',
        dateOfBirth: '1994-12-03',
        certificate: 'بەکالۆریۆس لە وێژە',
        age: 31,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Literature',
        pass: 'B+',
        contract: 'Contract',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'سۆران جەلال رەحیم',
        mobile: '+964 756 789 0123',
        address: 'هەولێر - ئانکاوا',
        gender: 'Male',
        dateOfBirth: '1988-02-18',
        certificate: 'بەکالۆریۆس لە ریاضی',
        age: 37,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Mathematics',
        pass: 'A',
        contract: 'Permanent',
        bloodType: 'B-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'روژان ئاکام شوان',
        mobile: '+964 757 890 1234',
        address: 'هەولێر - کۆی کامیران',
        gender: 'Female',
        dateOfBirth: '1991-06-25',
        certificate: 'بەکالۆریۆس لە مێژوو',
        age: 34,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'History',
        pass: 'B',
        contract: 'Contract',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'شوان محەمەد عەلی',
        mobile: '+964 758 901 2345',
        address: 'هەولێر - کۆی نیشتمان',
        gender: 'Male',
        dateOfBirth: '1986-10-12',
        certificate: 'ماستەر لە فیزیا',
        age: 39,
        education: 'Master Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Physics',
        pass: 'A+',
        contract: 'Permanent',
        bloodType: 'A-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ئاوار رامیار کاکە',
        mobile: '+964 759 012 3456',
        address: 'هەولێر - کۆی زانکۆ',
        gender: 'Female',
        dateOfBirth: '1993-04-07',
        certificate: 'بەکالۆریۆس لە کیمیا',
        age: 32,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Chemistry',
        pass: 'A-',
        contract: 'Contract',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'بەختیار سەلیم ئەحمەد',
        mobile: '+964 770 123 4567',
        address: 'هەولێر - کۆی گوڵان',
        gender: 'Male',
        dateOfBirth: '1984-08-19',
        certificate: 'بەکالۆریۆس لە جووگرافیا',
        age: 41,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Geography',
        pass: 'B+',
        contract: 'Permanent',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'دڵنیا فەرهاد قادر',
        mobile: '+964 771 234 5678',
        address: 'هەولێر - کۆی برایەتی',
        gender: 'Female',
        dateOfBirth: '1989-01-28',
        certificate: 'ماستەر لە پەروەردە',
        age: 36,
        education: 'Master Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Education',
        pass: 'A',
        contract: 'Permanent',
        bloodType: 'AB-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'بێستون خالید حەمە',
        mobile: '+964 772 345 6789',
        address: 'هەولێر - کۆی ئاسۆ',
        gender: 'Male',
        dateOfBirth: '1995-03-11',
        certificate: 'بەکالۆریۆس لە موسیقا',
        age: 30,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Music',
        pass: 'B',
        contract: 'Contract',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'گوڵستان نەریمان رەزا',
        mobile: '+964 773 456 7890',
        address: 'هەولێر - کۆی سەرچنار',
        gender: 'Female',
        dateOfBirth: '1996-09-05',
        certificate: 'بەکالۆریۆس لە پسکۆلۆجی',
        age: 29,
        education: 'Bachelor Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Psychology',
        pass: 'A-',
        contract: 'Contract',
        bloodType: 'O-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'یاسین مەولود عەبدوڵا',
        mobile: '+964 774 567 8901',
        address: 'هەولێر - کۆی شاری نوێ',
        gender: 'Male',
        dateOfBirth: '1982-12-16',
        certificate: 'ماستەر لە ئابووری',
        age: 43,
        education: 'Master Degree',
        attendance: 'Present',
        date: '2025-01-15',
        department: 'Economics',
        pass: 'A+',
        contract: 'Permanent',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Teachers (تۆماری مامۆستایان) - 15 entries
    const teachers = [
      {
        id: uuidv4(),
        fullName: 'پرۆفیسۆر سالم محەمەد احمد',
        birthYear: '1980',
        certificate: 'ماستەر لە ریاضیات',
        jobTitle: 'مامۆستای ریاضی',
        specialist: 'ریاضیات و ئامار',
        graduationDate: '2005-06-15',
        startDate: '2010-09-01',
        previousInstitution: 'زانکۆی سلێمانی',
        teacherName: 'پرۆفیسۆر سالم محەمەد',
        subject: 'ریاضیات - Mathematics',
        grade: 'گرۆوپی A - Group A',
        experience: '15 ساڵ - 15 Years',
        qualification: 'ماستەر لە ریاضیات - Master in Mathematics',
        phone: '+964 750 111 2222',
        email: 'salem.mohammed@berdoz.edu.krd',
        department: 'Science Department',
        status: 'Active',
        salary: 1200,
        bloodType: 'O+',
        cv: {
          field: 'ریاضیات و ئامار',
          phone: '+964 750 111 2222',
          location: 'هەولێر - کوردستان',
          email: 'salem.mohammed@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە ریاضیات بە 15 ساڵ ئەزموون لە فێرکردن',
          education: [
            { 
              startYear: '2003', 
              endYear: '2005', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە ریاضیات',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە ئامار و هەندەسە', 'بەشداری لە کۆنفرانسەکانی ریاضیات']
            },
            { 
              startYear: '1999', 
              endYear: '2002', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە ریاضیات',
              details: ['GPA: 3.9/4.0', 'باشترین خوێندکار لە بەشی ریاضیات', 'بەشداری لە پڕۆژەکانی ریاضیات']
            }
          ],
          experience: [
            { 
              startYear: '2010', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای ریاضی',
              responsibilities: ['فێرکردنی ریاضیات بۆ پۆلەکانی 9-12', 'ڕاهێنانی خوێندکاران بۆ پێشبڕکێی ریاضیات', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2005', 
              endYear: '2010', 
              company: 'زانکۆی سلێمانی', 
              position: 'مامۆستای یاریدەدەر',
              responsibilities: ['یاریدەدەری لە بەشی ریاضیات', 'ڕاهێنانی خوێندکاران', 'بەشداری لە توێژینەوەکان']
            }
          ],
          skills: ['ریاضیات', 'ئامار', 'هەندەسە', 'ئەنالایز', 'پرۆگرامسازی MATLAB', 'فێرکردن', 'ڕاهێنان'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'دکتۆر فاطمە حەسەن علی',
        birthYear: '1985',
        certificate: 'دکتۆرا لە کیمیا',
        jobTitle: 'مامۆستای کیمیا',
        specialist: 'کیمیای ئۆرگانیک',
        graduationDate: '2012-07-20',
        startDate: '2013-09-01',
        previousInstitution: 'زانکۆی بەغداد',
        teacherName: 'دکتۆر فاطمە حەسەن',
        subject: 'کیمیا - Chemistry',
        grade: 'گرۆوپی B - Group B',
        experience: '12 ساڵ - 12 Years',
        qualification: 'دکتۆرا لە کیمیا - PhD in Chemistry',
        phone: '+964 751 222 3333',
        email: 'fatima.hassan@berdoz.edu.krd',
        department: 'Science Department',
        status: 'Active',
        salary: 1400,
        bloodType: 'A+',
        cv: {
          field: 'کیمیای ئۆرگانیک و بایۆکیمیا',
          phone: '+964 751 222 3333',
          location: 'هەولێر - کوردستان',
          email: 'fatima.hassan@berdoz.edu.krd',
          aboutMe: 'دکتۆری پسپۆڕ لە کیمیا بە 12 ساڵ ئەزموون لە توێژینەوە و فێرکردن',
          education: [
            { 
              startYear: '2009', 
              endYear: '2012', 
              institution: 'زانکۆی بەغداد', 
              degree: 'دکتۆرا لە کیمیا',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە کیمیای ئۆرگانیک', 'بەشداری لە کۆنفرانسەکانی کیمیا']
            },
            { 
              startYear: '2006', 
              endYear: '2008', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە کیمیا',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە بایۆکیمیا', 'بەشداری لە پڕۆژەکانی کیمیا']
            },
            { 
              startYear: '2002', 
              endYear: '2005', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە کیمیا',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی کیمیا', 'بەشداری لە ئەزموونە عەملیەکان']
            }
          ],
          experience: [
            { 
              startYear: '2013', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای کیمیا',
              responsibilities: ['فێرکردنی کیمیا و ئەزموونی عەملی', 'ڕاهێنانی خوێندکاران لە تاقیگە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2008', 
              endYear: '2013', 
              company: 'زانکۆی بەغداد', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر کیمیای ئۆرگانیک', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['کیمیای ئۆرگانیک', 'بایۆکیمیا', 'ئەزموونی عەملی', 'تاقیکردنەوە', 'شیکردنەوەی کیمیایی', 'فێرکردن', 'توێژینەوە'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' },
            { language: 'فەرەنسی', level: 'زمانی چوارەم', details: 'ناوەند' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا ئەحمەد کەریم محمود',
        birthYear: '1978',
        certificate: 'ماستەر لە فیزیا',
        jobTitle: 'مامۆستای فیزیا',
        specialist: 'فیزیای تێیۆری',
        graduationDate: '2003-06-10',
        startDate: '2007-09-01',
        previousInstitution: 'زانکۆی دهۆک',
        teacherName: 'مامۆستا ئەحمەد کەریم',
        subject: 'فیزیا - Physics',
        grade: 'گرۆوپی C - Group C',
        experience: '18 ساڵ - 18 Years',
        qualification: 'ماستەر لە فیزیا - Master in Physics',
        phone: '+964 752 333 4444',
        email: 'ahmad.karim@berdoz.edu.krd',
        department: 'Science Department',
        status: 'Active',
        salary: 1300,
        bloodType: 'B+',
        cv: {
          field: 'فیزیای کلاسیکی و مۆدێرن',
          phone: '+964 752 333 4444',
          location: 'هەولێر - کوردستان',
          email: 'ahmad.karim@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە فیزیا بە 18 ساڵ ئەزموون لە فێرکردن و توێژینەوە',
          education: [
            { 
              startYear: '2001', 
              endYear: '2003', 
              institution: 'زانکۆی دهۆک', 
              degree: 'ماستەر لە فیزیا',
              details: ['GPA: 3.7/4.0', 'پسپۆڕ لە فیزیای کلاسیکی', 'بەشداری لە کۆنفرانسەکانی فیزیا']
            },
            { 
              startYear: '1997', 
              endYear: '2000', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە فیزیا',
              details: ['GPA: 3.8/4.0', 'باشترین خوێندکار لە بەشی فیزیا', 'بەشداری لە پڕۆژەکانی فیزیا']
            }
          ],
          experience: [
            { 
              startYear: '2007', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای فیزیا',
              responsibilities: ['فێرکردنی فیزیا و ئەزموونی عەملی', 'ڕاهێنانی خوێندکاران لە تاقیگە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2003', 
              endYear: '2007', 
              company: 'زانکۆی دهۆک', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر فیزیای کلاسیکی', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['فیزیای کلاسیکی', 'فیزیای مۆدێرن', 'ئەزموونی عەملی', 'هەندەسە', 'ماتماتیک', 'فێرکردن', 'توێژینەوە'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا زەینەب علی حسەن',
        birthYear: '1987',
        certificate: 'بەکالۆریۆس لە ئینگلیزی',
        jobTitle: 'مامۆستای زمانی ئینگلیزی',
        specialist: 'وتە و نووسین',
        graduationDate: '2010-06-25',
        startDate: '2015-09-01',
        previousInstitution: 'قوتابخانەی ئاوەدانی',
        teacherName: 'مامۆستا زەینەب علی',
        subject: 'ئینگلیزی - English',
        grade: 'گرۆوپی A - Group A',
        experience: '10 ساڵ - 10 Years',
        qualification: 'بەکالۆریۆس لە ئینگلیزی - Bachelor in English',
        phone: '+964 753 444 5555',
        email: 'zainab.ali@berdoz.edu.krd',
        department: 'Language Department',
        status: 'Active',
        salary: 1100,
        bloodType: 'AB+',
        cv: {
          field: 'زمانی ئینگلیزی و ئەدەبیات',
          phone: '+964 753 444 5555',
          location: 'هەولێر - کوردستان',
          email: 'zainab.ali@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە زمانی ئینگلیزی بە 10 ساڵ ئەزموون لە فێرکردن',
          education: [
            { 
              startYear: '2011', 
              endYear: '2013', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە زمانناسی',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە فێرکردنی زمان', 'بەشداری لە کۆنفرانسەکانی زمان']
            },
            { 
              startYear: '2007', 
              endYear: '2010', 
              institution: 'قوتابخانەی ئاوەدانی', 
              degree: 'بەکالۆریۆس لە ئینگلیزی',
              details: ['GPA: 3.6/4.0', 'باشترین خوێندکار لە بەشی ئینگلیزی', 'بەشداری لە پڕۆژەکانی زمان']
            }
          ],
          experience: [
            { 
              startYear: '2015', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای ئینگلیزی',
              responsibilities: ['فێرکردنی زمانی ئینگلیزی و ئەدەبیات', 'ڕاهێنانی خوێندکاران لە وتە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2010', 
              endYear: '2015', 
              company: 'قوتابخانەی ئاوەدانی', 
              position: 'مامۆستای یاریدەدەر',
              responsibilities: ['یاریدەدەری لە فێرکردنی ئینگلیزی', 'ڕاهێنانی خوێندکاران', 'بەشداری لە پڕۆژەکانی زمان']
            }
          ],
          skills: ['زمانی ئینگلیزی', 'ئەدەبیات', 'گرامەر', 'وتە', 'نووسین', 'ترجەمە', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'پسپۆڕ' },
            { language: 'فەرەنسی', level: 'زمانی چوارەم', details: 'ناوەند' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'پرۆفیسۆر کاروان ئیبراهیم مولود',
        birthYear: '1975',
        certificate: 'دکتۆرا لە مێژوو',
        jobTitle: 'مامۆستای مێژوو',
        specialist: 'مێژووی کورد',
        graduationDate: '2000-07-15',
        startDate: '2005-09-01',
        previousInstitution: 'زانکۆی کۆیە',
        teacherName: 'پرۆفیسۆر کاروان ئیبراهیم',
        subject: 'مێژوو - History',
        grade: 'گرۆوپی B - Group B',
        experience: '20 ساڵ - 20 Years',
        qualification: 'دکتۆرا لە مێژوو - PhD in History',
        phone: '+964 754 555 6666',
        email: 'karwan.ibrahim@berdoz.edu.krd',
        department: 'Humanities Department',
        status: 'Active',
        salary: 1500,
        bloodType: 'O-',
        cv: {
          field: 'مێژووی کورد و عێراق',
          phone: '+964 754 555 6666',
          location: 'هەولێر - کوردستان',
          email: 'karwan.ibrahim@berdoz.edu.krd',
          aboutMe: 'پرۆفیسۆری پسپۆڕ لە مێژوو بە 20 ساڵ ئەزموون لە توێژینەوە و فێرکردن',
          education: [
            { 
              startYear: '1997', 
              endYear: '2000', 
              institution: 'زانکۆی کۆیە', 
              degree: 'دکتۆرا لە مێژوو',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە مێژووی کورد', 'بەشداری لە کۆنفرانسەکانی مێژوو']
            },
            { 
              startYear: '1995', 
              endYear: '1997', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە مێژوو',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە مێژووی عێراق', 'بەشداری لە پڕۆژەکانی مێژوو']
            },
            { 
              startYear: '1991', 
              endYear: '1994', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە مێژوو',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی مێژوو', 'بەشداری لە توێژینەوەکان']
            }
          ],
          experience: [
            { 
              startYear: '2005', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای مێژوو',
              responsibilities: ['فێرکردنی مێژووی کورد و عێراق', 'ڕاهێنانی خوێندکاران لە توێژینەوە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2000', 
              endYear: '2005', 
              company: 'زانکۆی کۆیە', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر مێژووی کورد', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['مێژووی کورد', 'مێژووی عێراق', 'مێژووی ناوەڕاست', 'توێژینەوەی مێژوویی', 'نووسین', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' },
            { language: 'فەرەنسی', level: 'زمانی چوارەم', details: 'ناوەند' },
            { language: 'ئەڵمانی', level: 'زمانی پێنجەم', details: 'ناوەند' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا هەنگاو نەوروز قادر',
        birthYear: '1990',
        certificate: 'ماستەر لە وێژە',
        jobTitle: 'مامۆستای وێژەی کوردی',
        specialist: 'شیعر و چیرۆک',
        graduationDate: '2015-06-30',
        startDate: '2017-09-01',
        previousInstitution: 'زانکۆی سلێمانی',
        teacherName: 'مامۆستا هەنگاو نەوروز',
        subject: 'وێژە کوردی - Kurdish Literature',
        grade: 'گرۆوپی C - Group C',
        experience: '8 ساڵ - 8 Years',
        qualification: 'ماستەر لە وێژە - Master in Literature',
        phone: '+964 755 666 7777',
        email: 'hangaw.nawroz@berdoz.edu.krd',
        department: 'Language Department',
        status: 'Active',
        salary: 1150,
        bloodType: 'A+',
        cv: {
          field: 'وێژەی کوردی و شیعر',
          phone: '+964 755 666 7777',
          location: 'هەولێر - کوردستان',
          email: 'hangaw.nawroz@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە وێژەی کوردی بە 8 ساڵ ئەزموون لە فێرکردن و نووسین',
          education: [
            { 
              startYear: '2013', 
              endYear: '2015', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە وێژە',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە وێژەی کوردی', 'بەشداری لە کۆنفرانسەکانی وێژە']
            },
            { 
              startYear: '2009', 
              endYear: '2011', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'بەکالۆریۆس لە وێژە',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی وێژە', 'بەشداری لە پڕۆژەکانی وێژە']
            }
          ],
          experience: [
            { 
              startYear: '2017', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای وێژە',
              responsibilities: ['فێرکردنی وێژەی کوردی و شیعر', 'ڕاهێنانی خوێندکاران لە نووسین', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2015', 
              endYear: '2017', 
              company: 'گۆڤاری وێژەیی', 
              position: 'نووسەر',
              responsibilities: ['نووسینی چیرۆک و شیعر', 'بەشداری لە پڕۆژەکانی وێژە', 'ڕاهێنانی نووسەرە نوێیەکان']
            }
          ],
          skills: ['وێژەی کوردی', 'شیعر', 'چیرۆک', 'نووسین', 'شیکردنەوەی ئەدەبی', 'کریتیک', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'ناوەند' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا سۆران جەلال رەحیم',
        birthYear: '1983',
        certificate: 'ماستەر لە کۆمپیوتەر',
        jobTitle: 'مامۆستای کۆمپیوتەر',
        specialist: 'پرۆگرامسازی',
        graduationDate: '2008-07-10',
        startDate: '2011-09-01',
        previousInstitution: 'کۆلێژی تەکنیکی هەولێر',
        teacherName: 'مامۆستا سۆران جەلال',
        subject: 'کۆمپیوتەر - Computer Science',
        grade: 'گرۆوپی A - Group A',
        experience: '14 ساڵ - 14 Years',
        qualification: 'ماستەر لە کۆمپیوتەر - Master in Computer Science',
        phone: '+964 756 777 8888',
        email: 'soran.jalal@berdoz.edu.krd',
        department: 'Technology Department',
        status: 'Active',
        salary: 1350,
        bloodType: 'B-',
        cv: {
          field: 'پرۆگرامسازی و سیستەمی زانیاری',
          phone: '+964 756 777 8888',
          location: 'هەولێر - کوردستان',
          email: 'soran.jalal@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە کۆمپیوتەر بە 14 ساڵ ئەزموون لە فێرکردن و پرۆگرامسازی',
          education: [
            { 
              startYear: '2006', 
              endYear: '2008', 
              institution: 'کۆلێژی تەکنیکی هەولێر', 
              degree: 'ماستەر لە کۆمپیوتەر',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە پرۆگرامسازی', 'بەشداری لە کۆنفرانسەکانی تەکنەلۆجیا']
            },
            { 
              startYear: '2002', 
              endYear: '2005', 
              institution: 'کۆلێژی تەکنیکی هەولێر', 
              degree: 'بەکالۆریۆس لە کۆمپیوتەر',
              details: ['GPA: 3.8/4.0', 'باشترین خوێندکار لە بەشی کۆمپیوتەر', 'بەشداری لە پڕۆژەکانی پرۆگرامسازی']
            }
          ],
          experience: [
            { 
              startYear: '2011', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای کۆمپیوتەر',
              responsibilities: ['فێرکردنی پرۆگرامسازی و سیستەمی زانیاری', 'ڕاهێنانی خوێندکاران لە پرۆگرامسازی', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2008', 
              endYear: '2011', 
              company: 'کۆمپانیای تەکنەلۆجیا', 
              position: 'پرۆگرامساز',
              responsibilities: ['گەشەپێدانی نەرمەکاڵا', 'بەشداری لە پڕۆژەکانی تەکنەلۆجیا', 'ڕاهێنانی پرۆگرامسازە نوێیەکان']
            }
          ],
          skills: ['پرۆگرامسازی', 'Java', 'Python', 'C++', 'Web Development', 'Database Design', 'AI/ML', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'پسپۆڕ' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا روژان ئاکام شوان',
        birthYear: '1986',
        certificate: 'بەکالۆریۆس لە هونەری جوان',
        jobTitle: 'مامۆستای هونەر',
        specialist: 'نیگارکێشان',
        graduationDate: '2009-06-15',
        startDate: '2014-09-01',
        previousInstitution: 'ئەکادیمیای هونەری بەغداد',
        teacherName: 'مامۆستا روژان ئاکام',
        subject: 'هونەر - Arts',
        grade: 'گرۆوپی B - Group B',
        experience: '11 ساڵ - 11 Years',
        qualification: 'بەکالۆریۆس لە هونەری جوان - Bachelor in Fine Arts',
        phone: '+964 757 888 9999',
        email: 'rozhan.akam@berdoz.edu.krd',
        department: 'Arts Department',
        status: 'Active',
        salary: 1050,
        bloodType: 'O+',
        cv: {
          field: 'هونەری جوان و نیگارکێشان',
          phone: '+964 757 888 9999',
          location: 'هەولێر - کوردستان',
          email: 'rozhan.akam@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە هونەری جوان بە 11 ساڵ ئەزموون لە فێرکردن و نیگارکێشان',
          education: [
            { 
              startYear: '2010', 
              endYear: '2012', 
              institution: 'ئەکادیمیای هونەری بەغداد', 
              degree: 'ماستەر لە هونەری مۆدێرن',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە هونەری مۆدێرن', 'بەشداری لە پێشانگاکانی هونەری']
            },
            { 
              startYear: '2006', 
              endYear: '2009', 
              institution: 'ئەکادیمیای هونەری بەغداد', 
              degree: 'بەکالۆریۆس لە هونەری جوان',
              details: ['GPA: 3.8/4.0', 'باشترین خوێندکار لە بەشی هونەری', 'بەشداری لە پڕۆژەکانی هونەری']
            }
          ],
          experience: [
            { 
              startYear: '2014', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای هونەر',
              responsibilities: ['فێرکردنی نیگارکێشان و هونەری جوان', 'ڕاهێنانی خوێندکاران لە هونەر', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2009', 
              endYear: '2014', 
              company: 'گەلەری هونەری', 
              position: 'هونەرمەند',
              responsibilities: ['نیگارکێشان و پێشانگا', 'بەشداری لە پڕۆژەکانی هونەری', 'ڕاهێنانی هونەرمەندە نوێیەکان']
            }
          ],
          skills: ['نیگارکێشان', 'هونەری جوان', 'ڕەنگ', 'کۆمپۆزیشن', 'پۆرتڕەیت', 'لەندسکەیپ', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا شوان محەمەد عەلی',
        birthYear: '1982',
        certificate: 'بەکالۆریۆس لە وەرزش',
        jobTitle: 'مامۆستای وەرزش',
        specialist: 'تۆپی پێ',
        graduationDate: '2006-06-20',
        startDate: '2009-09-01',
        previousInstitution: 'کۆلێژی وەرزشی بەغداد',
        teacherName: 'مامۆستا شوان محەمەد',
        subject: 'وەرزش - Physical Education',
        grade: 'هەموو گرۆوپەکان - All Groups',
        experience: '16 ساڵ - 16 Years',
        qualification: 'بەکالۆریۆس لە وەرزش - Bachelor in Physical Education',
        phone: '+964 758 999 0000',
        email: 'shwan.mohammed@berdoz.edu.krd',
        department: 'Sports Department',
        status: 'Active',
        salary: 1200,
        bloodType: 'A-',
        cv: {
          field: 'وەرزش و ڕاهێنان',
          phone: '+964 758 999 0000',
          location: 'هەولێر - کوردستان',
          email: 'shwan.mohammed@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە وەرزش بە 16 ساڵ ئەزموون لە فێرکردن و یاریکردن',
          education: [
            { 
              startYear: '2007', 
              endYear: '2009', 
              institution: 'کۆلێژی وەرزشی بەغداد', 
              degree: 'ماستەر لە وەرزش',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە وەرزش', 'بەشداری لە کۆنفرانسەکانی وەرزش']
            },
            { 
              startYear: '2003', 
              endYear: '2006', 
              institution: 'کۆلێژی وەرزشی بەغداد', 
              degree: 'بەکالۆریۆس لە وەرزش',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی وەرزش', 'بەشداری لە پڕۆژەکانی وەرزش']
            }
          ],
          experience: [
            { 
              startYear: '2009', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای وەرزش',
              responsibilities: ['فێرکردنی وەرزش و ڕاهێنان', 'ڕاهێنانی خوێندکاران لە وەرزش', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2000', 
              endYear: '2009', 
              company: 'هەڵبژاردەی عێراق', 
              position: 'یاریزانی تۆپی پێ',
              responsibilities: ['یاریکردن لە هەڵبژاردە', 'بەشداری لە پڕۆژەکانی وەرزش', 'ڕاهێنانی یاریزانی نوێیەکان']
            }
          ],
          skills: ['تۆپی پێ', 'وەرزشی گشتی', 'ڕاهێنان', 'فیزیۆلۆجی', 'تەکنیک', 'ستراتیجی', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا ئاوار رامیار کاکە',
        birthYear: '1988',
        certificate: 'ماستەر لە بایۆلۆجی',
        jobTitle: 'مامۆستای بایۆلۆجی',
        specialist: 'زیندەزانی',
        graduationDate: '2013-07-05',
        startDate: '2016-09-01',
        previousInstitution: 'زانکۆی زاخۆ',
        teacherName: 'مامۆستا ئاوار رامیار',
        subject: 'بایۆلۆجی - Biology',
        grade: 'گرۆوپی C - Group C',
        experience: '9 ساڵ - 9 Years',
        qualification: 'ماستەر لە بایۆلۆجی - Master in Biology',
        phone: '+964 759 000 1111',
        email: 'awar.ramyar@berdoz.edu.krd',
        department: 'Science Department',
        status: 'Active',
        salary: 1250,
        bloodType: 'B+',
        cv: {
          field: 'بایۆلۆجی و زیندەزانی',
          phone: '+964 759 000 1111',
          location: 'هەولێر - کوردستان',
          email: 'awar.ramyar@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە بایۆلۆجی بە 9 ساڵ ئەزموون لە فێرکردن و توێژینەوە',
          education: [
            { 
              startYear: '2011', 
              endYear: '2013', 
              institution: 'زانکۆی زاخۆ', 
              degree: 'ماستەر لە بایۆلۆجی',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە زیندەزانی', 'بەشداری لە کۆنفرانسەکانی بایۆلۆجی']
            },
            { 
              startYear: '2008', 
              endYear: '2010', 
              institution: 'زانکۆی زاخۆ', 
              degree: 'بەکالۆریۆس لە بایۆلۆجی',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی بایۆلۆجی', 'بەشداری لە پڕۆژەکانی بایۆلۆجی']
            }
          ],
          experience: [
            { 
              startYear: '2016', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای بایۆلۆجی',
              responsibilities: ['فێرکردنی بایۆلۆجی و ئەزموونی عەملی', 'ڕاهێنانی خوێندکاران لە تاقیگە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2013', 
              endYear: '2016', 
              company: 'زانکۆی زاخۆ', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر زیندەزانی', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['بایۆلۆجی', 'زیندەزانی', 'زیستکیمیا', 'ئەزموونی عەملی', 'مایکرۆسکۆپ', 'تاقیکردنەوە', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا بەختیار سەلیم ئەحمەد',
        birthYear: '1981',
        certificate: 'بەکالۆریۆس لە جووگرافیا',
        jobTitle: 'مامۆستای جووگرافیا',
        specialist: 'جووگرافیای کوردستان',
        graduationDate: '2004-06-10',
        startDate: '2012-09-01',
        previousInstitution: 'زانکۆی دهۆک',
        teacherName: 'مامۆستا بەختیار سەلیم',
        subject: 'جووگرافیا - Geography',
        grade: 'گرۆوپی A - Group A',
        experience: '13 ساڵ - 13 Years',
        qualification: 'بەکالۆریۆس لە جووگرافیا - Bachelor in Geography',
        phone: '+964 770 111 2222',
        email: 'bakhtyar.salim@berdoz.edu.krd',
        department: 'Humanities Department',
        status: 'Active',
        salary: 1100,
        bloodType: 'O+',
        cv: {
          field: 'جووگرافیا و نەخشە',
          phone: '+964 770 111 2222',
          location: 'هەولێر - کوردستان',
          email: 'bakhtyar.salim@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە جووگرافیا بە 13 ساڵ ئەزموون لە فێرکردن و توێژینەوە',
          education: [
            { 
              startYear: '2005', 
              endYear: '2007', 
              institution: 'زانکۆی دهۆک', 
              degree: 'ماستەر لە جووگرافیای ئابووری',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە جووگرافیای ئابووری', 'بەشداری لە کۆنفرانسەکانی جووگرافیا']
            },
            { 
              startYear: '2001', 
              endYear: '2004', 
              institution: 'زانکۆی دهۆک', 
              degree: 'بەکالۆریۆس لە جووگرافیا',
              details: ['GPA: 3.6/4.0', 'باشترین خوێندکار لە بەشی جووگرافیا', 'بەشداری لە پڕۆژەکانی جووگرافیا']
            }
          ],
          experience: [
            { 
              startYear: '2012', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای جووگرافیا',
              responsibilities: ['فێرکردنی جووگرافیا و نەخشە', 'ڕاهێنانی خوێندکاران لە نەخشە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2007', 
              endYear: '2012', 
              company: 'زانکۆی دهۆک', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر جووگرافیای کوردستان', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['جووگرافیا', 'نەخشە', 'GIS', 'جووگرافیای ئابووری', 'جووگرافیای کوردستان', 'ئەنالایز', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا دڵنیا فەرهاد قادر',
        birthYear: '1992',
        certificate: 'بەکالۆریۆس لە موسیقا',
        jobTitle: 'مامۆستای موسیقا',
        specialist: 'ئامێری موسیقا',
        graduationDate: '2016-06-15',
        startDate: '2018-09-01',
        previousInstitution: 'کۆنسێرڤاتۆری بەغداد',
        teacherName: 'مامۆستا دڵنیا فەرهاد',
        subject: 'موسیقا - Music',
        grade: 'هەموو گرۆوپەکان - All Groups',
        experience: '7 ساڵ - 7 Years',
        qualification: 'بەکالۆریۆس لە موسیقا - Bachelor in Music',
        phone: '+964 771 222 3333',
        email: 'dilnya.farhad@berdoz.edu.krd',
        department: 'Arts Department',
        status: 'Active',
        salary: 1000,
        bloodType: 'AB-',
        cv: {
          field: 'موسیقا و ئامێری موسیقا',
          phone: '+964 771 222 3333',
          location: 'هەولێر - کوردستان',
          email: 'dilnya.farhad@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە موسیقا بە 7 ساڵ ئەزموون لە فێرکردن و لێدان',
          education: [
            { 
              startYear: '2017', 
              endYear: '2019', 
              institution: 'کۆنسێرڤاتۆری بەغداد', 
              degree: 'ماستەر لە موسیقا',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە موسیقا', 'بەشداری لە کۆنسێرتەکان']
            },
            { 
              startYear: '2013', 
              endYear: '2016', 
              institution: 'کۆنسێرڤاتۆری بەغداد', 
              degree: 'بەکالۆریۆس لە موسیقا',
              details: ['GPA: 3.8/4.0', 'باشترین خوێندکار لە بەشی موسیقا', 'بەشداری لە پڕۆژەکانی موسیقا']
            }
          ],
          experience: [
            { 
              startYear: '2018', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای موسیقا',
              responsibilities: ['فێرکردنی موسیقا و ئامێری موسیقا', 'ڕاهێنانی خوێندکاران لە موسیقا', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2016', 
              endYear: '2018', 
              company: 'کۆنسێرڤاتۆری بەغداد', 
              position: 'لێدەر',
              responsibilities: ['لێدەری کۆری و ئامێری موسیقا', 'بەشداری لە پڕۆژەکانی موسیقا', 'ڕاهێنانی لێدەرە نوێیەکان']
            }
          ],
          skills: ['موسیقا', 'کۆری', 'پیانۆ', 'گیتار', 'تەئۆری موسیقا', 'کۆمپۆزیشن', 'لێدان', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا رێبین نەجیب محمود',
        birthYear: '1984',
        certificate: 'ماستەر لە زمانی عەرەبی',
        jobTitle: 'مامۆستای عەرەبی',
        specialist: 'زمانی عەرەبی',
        graduationDate: '2009-07-20',
        startDate: '2013-09-01',
        previousInstitution: 'زانکۆی بەغداد',
        teacherName: 'مامۆستا رێبین نەجیب',
        subject: 'عەرەبی - Arabic',
        grade: 'گرۆوپی B - Group B',
        experience: '12 ساڵ - 12 Years',
        qualification: 'ماستەر لە زمانی عەرەبی - Master in Arabic',
        phone: '+964 772 333 4444',
        email: 'rebin.najib@berdoz.edu.krd',
        department: 'Language Department',
        status: 'Active',
        salary: 1200,
        bloodType: 'A+',
        cv: {
          field: 'زمانی عەرەبی و ئەدەبیات',
          phone: '+964 772 333 4444',
          location: 'هەولێر - کوردستان',
          email: 'rebin.najib@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە زمانی عەرەبی بە 12 ساڵ ئەزموون لە فێرکردن و توێژینەوە',
          education: [
            { 
              startYear: '2007', 
              endYear: '2009', 
              institution: 'زانکۆی بەغداد', 
              degree: 'ماستەر لە زمانی عەرەبی',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە زمانی عەرەبی', 'بەشداری لە کۆنفرانسەکانی زمان']
            },
            { 
              startYear: '2004', 
              endYear: '2006', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە زمانی عەرەبی',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی عەرەبی', 'بەشداری لە پڕۆژەکانی زمان']
            }
          ],
          experience: [
            { 
              startYear: '2013', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای عەرەبی',
              responsibilities: ['فێرکردنی زمانی عەرەبی و ئەدەبیات', 'ڕاهێنانی خوێندکاران لە عەرەبی', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2009', 
              endYear: '2013', 
              company: 'زانکۆی بەغداد', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر زمان و ئەدەبی عەرەبی', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['زمانی عەرەبی', 'ئەدەبی عەرەبی', 'گرامەر', 'وتە', 'نووسین', 'شیکردنەوە', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا هاوژین کەمال احمد',
        birthYear: '1991',
        certificate: 'ماستەر لە پسیکۆلۆجی',
        jobTitle: 'مامۆستای پسیکۆلۆجی',
        specialist: 'دەروونزانی منداڵان',
        graduationDate: '2017-06-30',
        startDate: '2019-09-01',
        previousInstitution: 'زانکۆی سلێمانی',
        teacherName: 'مامۆستا هاوژین کەمال',
        subject: 'پسیکۆلۆجی - Psychology',
        grade: 'گرۆوپی C - Group C',
        experience: '6 ساڵ - 6 Years',
        qualification: 'ماستەر لە پسیکۆلۆجی - Master in Psychology',
        phone: '+964 773 444 5555',
        email: 'hawzhin.kamal@berdoz.edu.krd',
        department: 'Social Sciences',
        status: 'Active',
        salary: 1100,
        bloodType: 'B+',
        cv: {
          field: 'پسیکۆلۆجی و ڕاوێژکاری دەروونی',
          phone: '+964 773 444 5555',
          location: 'هەولێر - کوردستان',
          email: 'gulistan.nariman@berdoz.edu.krd',
          aboutMe: 'مامۆستای پسپۆڕ لە پسیکۆلۆجی بە 6 ساڵ ئەزموون لە فێرکردن و ڕاوێژکاری',
          education: [
            { 
              startYear: '2015', 
              endYear: '2017', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'ماستەر لە پسیکۆلۆجی',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە دەروونزانی منداڵان', 'بەشداری لە کۆنفرانسەکانی پسیکۆلۆجی']
            },
            { 
              startYear: '2012', 
              endYear: '2014', 
              institution: 'زانکۆی سلێمانی', 
              degree: 'بەکالۆریۆس لە پسیکۆلۆجی',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی پسیکۆلۆجی', 'بەشداری لە پڕۆژەکانی پسیکۆلۆجی']
            }
          ],
          experience: [
            { 
              startYear: '2019', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای پسیکۆلۆجی',
              responsibilities: ['فێرکردنی پسیکۆلۆجی و ڕاوێژکاری دەروونی', 'ڕاهێنانی خوێندکاران لە پسیکۆلۆجی', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2017', 
              endYear: '2019', 
              company: 'زانکۆی سلێمانی', 
              position: 'ڕاوێژکار',
              responsibilities: ['ڕاوێژکاری دەروونی خوێندکاران', 'بەشداری لە پڕۆژەکانی پسیکۆلۆجی', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['پسیکۆلۆجی', 'دەروونزانی منداڵان', 'ڕاوێژکاری', 'تاقیکردنەوە', 'شیکردنەوە', 'چارەسەرکردن', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'باش' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'مامۆستا ئاراس قادر عەلی',
        birthYear: '1979',
        certificate: 'دکتۆرا لە فەلسەفە',
        jobTitle: 'مامۆستای فەلسەفە',
        specialist: 'فەلسەفەی ئەخلاق',
        graduationDate: '2005-07-10',
        startDate: '2011-09-01',
        previousInstitution: 'زانکۆی بەغداد',
        teacherName: 'مامۆستا ئاراس قادر',
        subject: 'فەلسەفە - Philosophy',
        grade: 'گرۆوپی A - Group A',
        experience: '14 ساڵ - 14 Years',
        qualification: 'دکتۆرا لە فەلسەفە - PhD in Philosophy',
        phone: '+964 774 555 6666',
        email: 'aras.qader@berdoz.edu.krd',
        department: 'Humanities Department',
        status: 'Active',
        salary: 1400,
        bloodType: 'O-',
        cv: {
          field: 'فەلسەفە و لۆژیک',
          phone: '+964 774 555 6666',
          location: 'هەولێر - کوردستان',
          email: 'yasin.mawlood@berdoz.edu.krd',
          aboutMe: 'پرۆفیسۆری پسپۆڕ لە فەلسەفە بە 14 ساڵ ئەزموون لە توێژینەوە و فێرکردن',
          education: [
            { 
              startYear: '2002', 
              endYear: '2005', 
              institution: 'زانکۆی بەغداد', 
              degree: 'دکتۆرا لە فەلسەفە',
              details: ['GPA: 3.9/4.0', 'پسپۆڕ لە فەلسەفەی ئەخلاق', 'بەشداری لە کۆنفرانسەکانی فەلسەفە']
            },
            { 
              startYear: '2000', 
              endYear: '2002', 
              institution: 'زانکۆی بەغداد', 
              degree: 'ماستەر لە فەلسەفە',
              details: ['GPA: 3.8/4.0', 'پسپۆڕ لە فەلسەفە', 'بەشداری لە پڕۆژەکانی فەلسەفە']
            },
            { 
              startYear: '1997', 
              endYear: '1999', 
              institution: 'زانکۆی بەغداد', 
              degree: 'بەکالۆریۆس لە فەلسەفە',
              details: ['GPA: 3.7/4.0', 'باشترین خوێندکار لە بەشی فەلسەفە', 'بەشداری لە توێژینەوەکان']
            }
          ],
          experience: [
            { 
              startYear: '2011', 
              endYear: '2025', 
              company: 'قوتابخانەی بەردۆز', 
              position: 'مامۆستای فەلسەفە',
              responsibilities: ['فێرکردنی فەلسەفە و لۆژیک', 'ڕاهێنانی خوێندکاران لە فەلسەفە', 'ئامادەکردنی پلانی وانە']
            },
            { 
              startYear: '2005', 
              endYear: '2011', 
              company: 'زانکۆی بەغداد', 
              position: 'توێژەر',
              responsibilities: ['توێژینەوە لەسەر فەلسەفەی ئەخلاق', 'بەشداری لە توێژینەوەکان', 'ڕاهێنانی خوێندکاران']
            }
          ],
          skills: ['فەلسەفە', 'فەلسەفەی ئەخلاق', 'لۆژیک', 'منتق', 'شیکردنەوە', 'نووسین', 'فێرکردن'],
          languages: [
            { language: 'کوردی', level: 'زمانی دایک', details: 'پسپۆڕ' },
            { language: 'عەرەبی', level: 'زمانی دووەم', details: 'پسپۆڕ' },
            { language: 'ئینگلیزی', level: 'زمانی سێیەم', details: 'باش' },
            { language: 'فەرەنسی', level: 'زمانی چوارەم', details: 'ناوەند' },
            { language: 'ئەڵمانی', level: 'زمانی پێنجەم', details: 'ناوەند' }
          ]
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ];


    // Payroll (لیستی بڕی موچە) - 15 entries
    const payroll = [
      {
        id: uuidv4(),
        employeeName: 'احمد محمد علی',
        salary: 1200000,
        absence: 50000,
        deduction: 25000,
        bonus: 100000,
        total: 1225000,
        notes: 'بەشداری لە کۆرسی پەروەردە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'فاطمه رەشید حسەن',
        salary: 1400000,
        absence: 0,
        deduction: 0,
        bonus: 150000,
        total: 1550000,
        notes: 'نایەی مانگانە بۆ باشترین مامۆستا',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'عومەر سالح محمود',
        salary: 1300000,
        absence: 25000,
        deduction: 15000,
        bonus: 75000,
        total: 1335000,
        notes: 'کارکردنی زیاتر لە کۆمپیوتەر',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'زەینەب کەریم ئەحمەد',
        salary: 1100000,
        absence: 30000,
        deduction: 20000,
        bonus: 50000,
        total: 1100000,
        notes: 'بەشداری لە پڕۆژەی هونەری',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'کاروان ئیبراهیم مولود',
        salary: 1500000,
        absence: 0,
        deduction: 0,
        bonus: 200000,
        total: 1700000,
        notes: 'بەڕێوەبەری گشتی - نایەی بەڕێوەبردن',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'هەنگاو نەوروز قادر',
        salary: 1150000,
        absence: 20000,
        deduction: 10000,
        bonus: 80000,
        total: 1200000,
        notes: 'نووسینی چیرۆک بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'سۆران جەلال رەحیم',
        salary: 1350000,
        absence: 0,
        deduction: 0,
        bonus: 125000,
        total: 1475000,
        notes: 'چاکسازی سیستەمی کۆمپیوتەر',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'روژان ئاکام شوان',
        salary: 1050000,
        absence: 40000,
        deduction: 30000,
        bonus: 60000,
        total: 1040000,
        notes: 'ڕازاندنەوەی دیواری قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'شوان محەمەد عەلی',
        salary: 1200000,
        absence: 15000,
        deduction: 5000,
        bonus: 90000,
        total: 1270000,
        notes: 'ڕاهێنانی تیمی وەرزشی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'ئاوار رامیار کاکە',
        salary: 1250000,
        absence: 10000,
        deduction: 0,
        bonus: 110000,
        total: 1350000,
        notes: 'ئەزموونی زانستی بۆ خوێندکاران',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'بەختیار سەلیم ئەحمەد',
        salary: 1100000,
        absence: 35000,
        deduction: 25000,
        bonus: 45000,
        total: 1085000,
        notes: 'گەشتی زانستی بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'دڵنیا فەرهاد قادر',
        salary: 1000000,
        absence: 0,
        deduction: 0,
        bonus: 70000,
        total: 1070000,
        notes: 'ئامادەکردنی کۆنسێرتی قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'بێستون خالید حەمە',
        salary: 1000000,
        absence: 25000,
        deduction: 15000,
        bonus: 55000,
        total: 1015000,
        notes: 'فێرکردنی ئامێری موسیقا',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'گوڵستان نەریمان رەزا',
        salary: 1100000,
        absence: 20000,
        deduction: 10000,
        bonus: 85000,
        total: 1155000,
        notes: 'شیکردنەوەی دەروونی خوێندکاران',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'یاسین مەولود عەبدوڵا',
        salary: 1400000,
        absence: 0,
        deduction: 0,
        bonus: 175000,
        total: 1575000,
        notes: 'بەڕێوەبردنی ئابووری قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Activities (چالاکی) - 12 entries
    const activities = [
      {
        id: uuidv4(),
        activityType: 'چالاکی وەرزشی - Sports Activity',
        preparationDate: '2025-01-10',
        content: 'یارییەکی تۆپی پێ لە نێوان پۆلەکان',
        startDate: '2025-01-15',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی هونەری - Art Activity',
        preparationDate: '2025-01-20',
        content: 'پێشانگای تابلۆی خوێندکاران',
        startDate: '2025-01-25',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی زانستی - Science Activity',
        preparationDate: '2025-02-05',
        content: 'نمایشی ئەزموونی کیمیا و فیزیا',
        startDate: '2025-02-10',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی کولتووری - Cultural Activity',
        preparationDate: '2025-02-15',
        content: 'ئێوارەیەکی شیعری کوردی',
        startDate: '2025-02-20',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی کۆمەڵایەتی - Social Activity',
        preparationDate: '2025-03-01',
        content: 'سەردانی ماڵی پیران',
        startDate: '2025-03-05',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی پەروەردەیی - Educational Activity',
        preparationDate: '2025-03-10',
        content: 'سیمینار لەسەر گرنگی خوێندن',
        startDate: '2025-03-15',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی تەندروستی - Health Activity',
        preparationDate: '2025-03-20',
        content: 'هەفتەی تەندروستی لە قوتابخانە',
        startDate: '2025-03-25',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی تەکنەلۆجی - Technology Activity',
        preparationDate: '2025-04-01',
        content: 'پێشبڕکێی پرۆگرامسازی',
        startDate: '2025-04-05',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی موسیقی - Music Activity',
        preparationDate: '2025-04-10',
        content: 'کۆنسێرتی کۆری قوتابخانە',
        startDate: '2025-04-15',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی زینگەیی - Environmental Activity',
        preparationDate: '2025-04-20',
        content: 'چاندنی دار و ڕووەکی نوێ',
        startDate: '2025-04-25',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی مێژوویی - Historical Activity',
        preparationDate: '2025-05-01',
        content: 'سەردانی شوێنە مێژووییەکان',
        startDate: '2025-05-05',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        activityType: 'چالاکی خواردن - Food Activity',
        preparationDate: '2025-05-10',
        content: 'فێستیڤاڵی خۆراکی نەتەوەیی',
        startDate: '2025-05-15',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Installments (قیستی ساڵانە) - 15 entries
    const installments = [
      {
        id: uuidv4(),
        fullName: 'ئاریان ئەحمەد محەمەد',
        grade: 'پۆل 10 - Class 10',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2000000,
        firstInstallment: 400000,
        secondInstallment: 400000,
        thirdInstallment: 400000,
        fourthInstallment: 400000,
        fifthInstallment: 400000,
        sixthInstallment: 0,
        totalReceived: 1600000,
        remaining: 400000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ژیار رەشید قادر',
        grade: 'پۆل 11 - Class 11',
        installmentType: 'ساڵانە - Annual', 
        annualAmount: 2200000,
        firstInstallment: 440000,
        secondInstallment: 440000,
        thirdInstallment: 440000,
        fourthInstallment: 440000,
        fifthInstallment: 440000,
        sixthInstallment: 0,
        totalReceived: 2200000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'دیلان سۆران علی',
        grade: 'پۆل 9 - Class 9',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 1800000,
        firstInstallment: 360000,
        secondInstallment: 360000,
        thirdInstallment: 360000,
        fourthInstallment: 360000,
        fifthInstallment: 360000,
        sixthInstallment: 0,
        totalReceived: 1080000,
        remaining: 720000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ئایان کاروان ئیبراهیم',
        grade: 'پۆل 12 - Class 12',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2500000,
        firstInstallment: 500000,
        secondInstallment: 500000,
        thirdInstallment: 500000,
        fourthInstallment: 500000,
        fifthInstallment: 500000,
        sixthInstallment: 0,
        totalReceived: 2500000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'پەیمان شوان محەمەد',
        grade: 'پۆل 10 - Class 10',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2000000,
        firstInstallment: 400000,
        secondInstallment: 400000,
        thirdInstallment: 0,
        fourthInstallment: 0,
        fifthInstallment: 0,
        sixthInstallment: 0,
        totalReceived: 800000,
        remaining: 1200000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ڕۆژین بەختیار سەلیم',
        grade: 'پۆل 11 - Class 11',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2200000,
        firstInstallment: 440000,
        secondInstallment: 440000,
        thirdInstallment: 440000,
        fourthInstallment: 440000,
        fifthInstallment: 440000,
        sixthInstallment: 0,
        totalReceived: 1760000,
        remaining: 440000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'دۆنیا ئاوار رامیار',
        grade: 'پۆل 9 - Class 9',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 1800000,
        firstInstallment: 360000,
        secondInstallment: 360000,
        thirdInstallment: 360000,
        fourthInstallment: 360000,
        fifthInstallment: 360000,
        sixthInstallment: 0,
        totalReceived: 1800000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ڕێزان یاسین مەولود',
        grade: 'پۆل 12 - Class 12',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2500000,
        firstInstallment: 500000,
        secondInstallment: 500000,
        thirdInstallment: 500000,
        fourthInstallment: 500000,
        fifthInstallment: 0,
        sixthInstallment: 0,
        totalReceived: 2000000,
        remaining: 500000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ئەیمان بێستون خالید',
        grade: 'پۆل 10 - Class 10',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2000000,
        firstInstallment: 400000,
        secondInstallment: 400000,
        thirdInstallment: 400000,
        fourthInstallment: 400000,
        fifthInstallment: 400000,
        sixthInstallment: 0,
        totalReceived: 2000000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'کۆمەڵ گوڵستان نەریمان',
        grade: 'پۆل 11 - Class 11',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2200000,
        firstInstallment: 440000,
        secondInstallment: 440000,
        thirdInstallment: 440000,
        fourthInstallment: 0,
        fifthInstallment: 0,
        sixthInstallment: 0,
        totalReceived: 1320000,
        remaining: 880000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ڕۆمان احمد محمد',
        grade: 'پۆل 9 - Class 9',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 1800000,
        firstInstallment: 360000,
        secondInstallment: 360000,
        thirdInstallment: 360000,
        fourthInstallment: 360000,
        fifthInstallment: 360000,
        sixthInstallment: 0,
        totalReceived: 1440000,
        remaining: 360000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'نەوروز فاطمە رەشید',
        grade: 'پۆل 12 - Class 12',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2500000,
        firstInstallment: 500000,
        secondInstallment: 500000,
        thirdInstallment: 500000,
        fourthInstallment: 500000,
        fifthInstallment: 500000,
        sixthInstallment: 0,
        totalReceived: 2500000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ئارام عومەر سالح',
        grade: 'پۆل 10 - Class 10',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2000000,
        firstInstallment: 400000,
        secondInstallment: 0,
        thirdInstallment: 0,
        fourthInstallment: 0,
        fifthInstallment: 0,
        sixthInstallment: 0,
        totalReceived: 400000,
        remaining: 1600000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'دڵشاد زەینەب کەریم',
        grade: 'پۆل 11 - Class 11',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 2200000,
        firstInstallment: 440000,
        secondInstallment: 440000,
        thirdInstallment: 440000,
        fourthInstallment: 440000,
        fifthInstallment: 440000,
        sixthInstallment: 0,
        totalReceived: 1760000,
        remaining: 440000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        fullName: 'ئاسۆ کاروان ئیبراهیم',
        grade: 'پۆل 9 - Class 9',
        installmentType: 'ساڵانە - Annual',
        annualAmount: 1800000,
        firstInstallment: 360000,
        secondInstallment: 360000,
        thirdInstallment: 360000,
        fourthInstallment: 360000,
        fifthInstallment: 360000,
        sixthInstallment: 0,
        totalReceived: 1800000,
        remaining: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Building Expenses (مەسروفی بینا) - 12 entries
    const buildingExpenses = [
      {
        id: uuidv4(),
        item: 'چاکسازی سیستەمی گەرمکردنەوە',
        cost: 850000,
        month: 'کانوونی دووەم - January',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'بۆیاخکردنەوەی دیواری ناوەوە',
        cost: 1200000,
        month: 'شوبات - February',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'چاکسازی سیستەمی ئاو',
        cost: 650000,
        month: 'ئازار - March',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'گۆڕینی پەنجەرەکان',
        cost: 2200000,
        month: 'نیسان - April',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'چاکسازی سیستەمی کارەبا',
        cost: 980000,
        month: 'ئایار - May',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'کێشانی کابلی نوێ',
        cost: 750000,
        month: 'حوزەیران - June',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'چاکسازی سەربان',
        cost: 1800000,
        month: 'تەمموز - July',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'دانانی فرۆشگای نوێ',
        cost: 3200000,
        month: 'ئاب - August',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'چاکسازی حەوشە',
        cost: 950000,
        month: 'ئەیلوول - September',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'گۆڕینی دەرگاکان',
        cost: 1400000,
        month: 'تشرینی یەکەم - October',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'دانانی سیستەمی گەرمکردنەوە',
        cost: 2800000,
        month: 'تشرینی دووەم - November',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'ڕازاندنەوەی دیواری دەرەوە',
        cost: 1600000,
        month: 'کانوونی یەکەم - December',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Daily Accounts (حساباتی رۆژانە) - 15 entries
    const dailyAccounts = [
      {
        id: uuidv4(),
        number: 1,
        week: 'هەفتەی یەکەم - Week 1',
        purpose: 'پارەدانی مووچەی مامۆستایان',
        checkNumber: 'CHK-2025-001',
        amount: 18500000,
        date: '2025-01-15',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 2,
        week: 'هەفتەی یەکەم - Week 1',
        purpose: 'کڕینی کەرەستەی پاکیژەکردن',
        checkNumber: 'CHK-2025-002',
        amount: 450000,
        date: '2025-01-16',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 3,
        week: 'هەفتەی دووەم - Week 2',
        purpose: 'پارەدانی قەرەبوویی کارەبا',
        checkNumber: 'CHK-2025-003',
        amount: 1200000,
        date: '2025-01-20',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 4,
        week: 'هەفتەی دووەم - Week 2',
        purpose: 'کڕینی کتێبی پەروەردەیی',
        checkNumber: 'CHK-2025-004',
        amount: 2800000,
        date: '2025-01-21',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 5,
        week: 'هەفتەی سێیەم - Week 3',
        purpose: 'چاکسازی سیستەمی گەرمکردنەوە',
        checkNumber: 'CHK-2025-005',
        amount: 850000,
        date: '2025-01-27',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 6,
        week: 'هەفتەی سێیەم - Week 3',
        purpose: 'کڕینی کەرەستەی وەرزشی',
        checkNumber: 'CHK-2025-006',
        amount: 650000,
        date: '2025-01-28',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 7,
        week: 'هەفتەی چوارەم - Week 4',
        purpose: 'کرێی بینای قوتابخانە',
        checkNumber: 'CHK-2025-007',
        amount: 2500000,
        date: '2025-02-03',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 8,
        week: 'هەفتەی چوارەم - Week 4',
        purpose: 'کڕینی ئامێری کۆمپیوتەر',
        checkNumber: 'CHK-2025-008',
        amount: 4200000,
        date: '2025-02-04',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 9,
        week: 'هەفتەی پێنجەم - Week 5',
        purpose: 'پارەدانی خەرجی گەشت',
        checkNumber: 'CHK-2025-009',
        amount: 750000,
        date: '2025-02-10',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 10,
        week: 'هەفتەی پێنجەم - Week 5',
        purpose: 'کڕینی خواردن بۆ چالاکی',
        checkNumber: 'CHK-2025-010',
        amount: 380000,
        date: '2025-02-11',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 11,
        week: 'هەفتەی شەشەم - Week 6',
        purpose: 'چاپکردنی بڕوانامەکان',
        checkNumber: 'CHK-2025-011',
        amount: 250000,
        date: '2025-02-17',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 12,
        week: 'هەفتەی شەشەم - Week 6',
        purpose: 'کڕینی کەرەستەی تاقیگە',
        checkNumber: 'CHK-2025-012',
        amount: 1200000,
        date: '2025-02-18',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 13,
        week: 'هەفتەی حەوتەم - Week 7',
        purpose: 'پارەدانی نایەی خوێندکاران',
        checkNumber: 'CHK-2025-013',
        amount: 950000,
        date: '2025-02-24',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 14,
        week: 'هەفتەی حەوتەم - Week 7',
        purpose: 'چاکسازی ئامێری موسیقا',
        checkNumber: 'CHK-2025-014',
        amount: 420000,
        date: '2025-02-25',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        number: 15,
        week: 'هەفتەی هەشتەم - Week 8',
        purpose: 'پارەدانی خەرجی ئینتەرنێت',
        checkNumber: 'CHK-2025-015',
        amount: 180000,
        date: '2025-03-03',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Kitchen Expenses (خەرجی خواردنگە) - 12 entries
    const kitchenExpenses = [
      {
        id: uuidv4(),
        item: 'نان و تەماشە بۆ نانخۆری خوێندکاران',
        cost: 850000,
        month: 'کانوونی دووەم - January',
        date: '2025-01-15',
        purpose: 'خواردنی ڕۆژانەی خوێندکاران',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'گۆشت و مریشک بۆ ناوەڕۆ',
        cost: 1200000,
        month: 'شوبات - February',
        date: '2025-02-10',
        purpose: 'خواردنی ناوەڕۆی پڕۆتین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'سەوزە و میوە بۆ ڕۆژانەی قوتابخانە',
        cost: 650000,
        month: 'ئازار - March',
        date: '2025-03-05',
        purpose: 'خواردنی تازە و تەندروست',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'شیر و ماست بۆ تیایدان',
        cost: 420000,
        month: 'نیسان - April',
        date: '2025-04-12',
        purpose: 'کەلسیۆم و پڕۆتین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'کەرەستەی خواردنەوە و شەربەت',
        cost: 380000,
        month: 'ئایار - May',
        date: '2025-05-08',
        purpose: 'خواردنەوەی تازە و سارد',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'برنج و لۆبیا بۆ خواردنی ناوەڕۆ',
        cost: 750000,
        month: 'حوزەیران - June',
        date: '2025-06-15',
        purpose: 'خواردنی ناوەڕۆی پڕۆتین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'بەستەنی و خواردنەوەی سارد',
        cost: 450000,
        month: 'تەمموز - July',
        date: '2025-07-20',
        purpose: 'خواردنەوەی سارد لە هاوین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'خواردن بۆ چالاکی دەستپێکی ساڵ',
        cost: 950000,
        month: 'ئاب - August',
        date: '2025-08-25',
        purpose: 'چالاکی دەستپێکی ساڵی نوێ',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'کەرەستەی ناشتا و نان',
        cost: 620000,
        month: 'ئەیلوول - September',
        date: '2025-09-10',
        purpose: 'خواردنی ناشتا و نان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'خواردن بۆ هالەوین پارتی',
        cost: 380000,
        month: 'تشرینی یەکەم - October',
        date: '2025-10-28',
        purpose: 'جەژنی هالەوین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'خواردنی گەرم بۆ زستان',
        cost: 850000,
        month: 'تشرینی دووەم - November',
        date: '2025-11-15',
        purpose: 'خواردنی گەرم لە زستان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        item: 'خواردن بۆ جەژنی کرسمس',
        cost: 1200000,
        month: 'کانوونی یەکەم - December',
        date: '2025-12-20',
        purpose: 'جەژنی کرسمس و ساڵی نوێ',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Student Permissions (مۆڵەت) - 15 entries
    const studentPermissions = [
      {
        id: uuidv4(),
        studentName: 'ئاریان ئەحمەد محەمەد',
        department: 'بەشی زانست',
        stage: 'پۆل 10',
        leaveDuration: '2 ڕۆژ',
        startDate: '2025-01-15',
        endDate: '2025-01-16',
        reason: 'چاوپێکەوتنی پزیشک',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ژیار رەشید قادر',
        department: 'بەشی زمان',
        stage: 'پۆل 11',
        leaveDuration: '1 ڕۆژ',
        startDate: '2025-01-20',
        endDate: '2025-01-20',
        reason: 'کاروباری خێزانی',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دیلان سۆران علی',
        department: 'بەشی زانست',
        stage: 'پۆل 9',
        leaveDuration: '3 ڕۆژ',
        startDate: '2025-01-25',
        endDate: '2025-01-27',
        reason: 'نەخۆشی سارد',
        status: 'چاوەڕوان - Pending',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئایان کاروان ئیبراهیم',
        department: 'بەشی مرۆڤایەتی',
        stage: 'پۆل 12',
        leaveDuration: '1 ڕۆژ',
        startDate: '2025-02-01',
        endDate: '2025-02-01',
        reason: 'بەشداری لە پێشبڕکێ',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'پەیمان شوان محەمەد',
        department: 'بەشی وەرزش',
        stage: 'پۆل 10',
        leaveDuration: '5 ڕۆژ',
        startDate: '2025-02-05',
        endDate: '2025-02-09',
        reason: 'گەشتی خێزانی',
        status: 'ڕەتکراوە - Rejected',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕۆژین بەختیار سەلیم',
        department: 'بەشی هونەر',
        stage: 'پۆل 11',
        leaveDuration: '2 ڕۆژ',
        startDate: '2025-02-10',
        endDate: '2025-02-11',
        reason: 'بەشداری لە پێشانگای هونەری',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دۆنیا ئاوار رامیار',
        department: 'بەشی زانست',
        stage: 'پۆل 9',
        leaveDuration: '1 ڕۆژ',
        startDate: '2025-02-15',
        endDate: '2025-02-15',
        reason: 'تاقیکردنەوەی چاو',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕێزان یاسین مەولود',
        department: 'بەشی ئابووری',
        stage: 'پۆل 12',
        leaveDuration: '4 ڕۆژ',
        startDate: '2025-02-20',
        endDate: '2025-02-23',
        reason: 'هاوکاری لە کاری باوک',
        status: 'چاوەڕوان - Pending',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئەیمان بێستون خالید',
        department: 'بەشی موسیقا',
        stage: 'پۆل 10',
        leaveDuration: '2 ڕۆژ',
        startDate: '2025-03-01',
        endDate: '2025-03-02',
        reason: 'بەشداری لە کۆنسێرت',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'کۆمەڵ گوڵستان نەریمان',
        department: 'بەشی دەروونزانی',
        stage: 'پۆل 11',
        leaveDuration: '1 ڕۆژ',
        startDate: '2025-03-05',
        endDate: '2025-03-05',
        reason: 'چاوپێکەوتنی دەروونی',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕۆمان احمد محمد',
        department: 'بەشی تەکنەلۆجیا',
        stage: 'پۆل 9',
        leaveDuration: '3 ڕۆژ',
        startDate: '2025-03-10',
        endDate: '2025-03-12',
        reason: 'بەشداری لە کۆنفرانسی تەکنەلۆجیا',
        status: 'چاوەڕوان - Pending',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'نەوروز فاطمە رەشید',
        department: 'بەشی وەرزش',
        stage: 'پۆل 12',
        leaveDuration: '2 ڕۆژ',
        startDate: '2025-03-15',
        endDate: '2025-03-16',
        reason: 'بەشداری لە یاری وەرزشی',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئارام عومەر سالح',
        department: 'بەشی جوگرافیا',
        stage: 'پۆل 10',
        leaveDuration: '6 ڕۆژ',
        startDate: '2025-03-20',
        endDate: '2025-03-25',
        reason: 'کێشەی خێزانی',
        status: 'ڕەتکراوە - Rejected',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دڵشاد زەینەب کەریم',
        department: 'بەشی زانست',
        stage: 'پۆل 11',
        leaveDuration: '1 ڕۆژ',
        startDate: '2025-04-01',
        endDate: '2025-04-01',
        reason: 'بەشداری لە ئەزموونی زانستی',
        status: 'پەسەندکراو - Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئاسۆ کاروان ئیبراهیم',
        department: 'بەشی موسیقا',
        stage: 'پۆل 9',
        leaveDuration: '2 ڕۆژ',
        startDate: '2025-04-05',
        endDate: '2025-04-06',
        reason: 'چاوپێکەوتنی قوتابخانەی موسیقا',
        status: 'چاوەڕوان - Pending',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Teacher Information (زانیاری مامۆستا) - 15 entries
    const teacherInfo = [
      {
        id: uuidv4(),
        politicalName: 'پرۆفیسۆر سالم محەمەد احمد',
        program: 'دکتۆرا لە ریاضیات',
        specialty: 'ریاضیات و ئامار',
        subject: 'ریاضیات - Mathematics',
        grade1: 3,
        grade2: 2,
        grade3: 0,
        grade4: 4,
        grade5: 3,
        grade6: 2,
        grade7: 0,
        grade8: 3,
        grade9: 2,
        totalHours: '19 کاتژمێر',
        notes: 'پسپۆڕ لە ئامار و هەندەسە',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'دکتۆر فاطمە حەسەن علی',
        program: 'دکتۆرا لە کیمیا',
        specialty: 'کیمیای ئۆرگانیک',
        subject: 'کیمیا - Chemistry',
        grade1: 2,
        grade2: 3,
        grade3: 4,
        grade4: 0,
        grade5: 2,
        grade6: 3,
        grade7: 4,
        grade8: 0,
        grade9: 3,
        totalHours: '21 کاتژمێر',
        notes: 'تایبەتمەند لە کیمیای ئۆرگانیک و بایۆکیمیا',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا ئەحمەد کەریم محمود',
        program: 'ماستەر لە فیزیا',
        specialty: 'فیزیای تێیۆری',
        subject: 'فیزیا - Physics',
        grade1: 3,
        grade2: 0,
        grade3: 2,
        grade4: 4,
        grade5: 3,
        grade6: 0,
        grade7: 2,
        grade8: 4,
        grade9: 1,
        totalHours: '19 کاتژمێر',
        notes: 'خاوەنی ئەزموونی زۆر لە فیزیای کلاسیکی',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا زەینەب علی حسەن',
        program: 'ماستەر لە ئینگلیزی',
        specialty: 'وتە و نووسین',
        subject: 'ئینگلیزی - English',
        grade1: 4,
        grade2: 3,
        grade3: 3,
        grade4: 2,
        grade5: 4,
        grade6: 3,
        grade7: 0,
        grade8: 2,
        grade9: 0,
        totalHours: '21 کاتژمێر',
        notes: 'پسپۆڕ لە فێرکردنی زمانی ئینگلیزی',
        bloodType: 'AB+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'پرۆفیسۆر کاروان ئیبراهیم مولود',
        program: 'دکتۆرا لە مێژوو',
        specialty: 'مێژووی کورد',
        subject: 'مێژوو - History',
        grade1: 0,
        grade2: 2,
        grade3: 4,
        grade4: 3,
        grade5: 0,
        grade6: 2,
        grade7: 4,
        grade8: 3,
        grade9: 2,
        totalHours: '20 کاتژمێر',
        notes: 'تایبەتمەند لە مێژووی کورد و عێراق',
        bloodType: 'O-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا هەنگاو نەوروز قادر',
        program: 'ماستەر لە وێژە',
        specialty: 'شیعر و چیرۆک',
        subject: 'وێژەی کوردی - Kurdish Literature',
        grade1: 3,
        grade2: 4,
        grade3: 0,
        grade4: 2,
        grade5: 3,
        grade6: 4,
        grade7: 0,
        grade8: 1,
        grade9: 3,
        totalHours: '20 کاتژمێر',
        notes: 'نووسەری چیرۆک و شیعری کوردی',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا سۆران جەلال رەحیم',
        program: 'ماستەر لە کۆمپیوتەر',
        specialty: 'پرۆگرامسازی',
        subject: 'کۆمپیوتەر - Computer Science',
        grade1: 2,
        grade2: 3,
        grade3: 4,
        grade4: 4,
        grade5: 2,
        grade6: 3,
        grade7: 4,
        grade8: 0,
        grade9: 0,
        totalHours: '22 کاتژمێر',
        notes: 'پسپۆڕ لە پرۆگرامسازی و سیستەمی زانیاری',
        bloodType: 'B-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا روژان ئاکام شوان',
        program: 'بەکالۆریۆس لە هونەری جوان',
        specialty: 'نیگارکێشان',
        subject: 'هونەر - Arts',
        grade1: 3,
        grade2: 2,
        grade3: 3,
        grade4: 2,
        grade5: 3,
        grade6: 2,
        grade7: 3,
        grade8: 2,
        grade9: 2,
        totalHours: '22 کاتژمێر',
        notes: 'هونەرمەندی ناسراو لە نیگارکێشان',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا شوان محەمەد عەلی',
        program: 'بەکالۆریۆس لە وەرزش',
        specialty: 'تۆپی پێ',
        subject: 'وەرزش - Physical Education',
        grade1: 2,
        grade2: 2,
        grade3: 2,
        grade4: 2,
        grade5: 2,
        grade6: 2,
        grade7: 2,
        grade8: 2,
        grade9: 2,
        totalHours: '18 کاتژمێر',
        notes: 'یاریزانی پێشووی تۆپی پێ',
        bloodType: 'A-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا ئاوار رامیار کاکە',
        program: 'ماستەر لە بایۆلۆجی',
        specialty: 'زیندەزانی',
        subject: 'بایۆلۆجی - Biology',
        grade1: 0,
        grade2: 3,
        grade3: 2,
        grade4: 4,
        grade5: 0,
        grade6: 3,
        grade7: 2,
        grade8: 4,
        grade9: 3,
        totalHours: '21 کاتژمێر',
        notes: 'پسپۆڕ لە زیندەزانی و زیستکیمیا',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا بەختیار سەلیم ئەحمەد',
        program: 'بەکالۆریۆس لە جووگرافیا',
        specialty: 'جووگرافیای کوردستان',
        subject: 'جووگرافیا - Geography',
        grade1: 2,
        grade2: 0,
        grade3: 3,
        grade4: 4,
        grade5: 2,
        grade6: 0,
        grade7: 3,
        grade8: 4,
        grade9: 2,
        totalHours: '20 کاتژمێر',
        notes: 'پسپۆڕ لە جووگرافیای ئابووری',
        bloodType: 'O+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا دڵنیا فەرهاد قادر',
        program: 'بەکالۆریۆس لە موسیقا',
        specialty: 'ئامێری موسیقا',
        subject: 'موسیقا - Music',
        grade1: 1,
        grade2: 1,
        grade3: 1,
        grade4: 1,
        grade5: 1,
        grade6: 1,
        grade7: 1,
        grade8: 1,
        grade9: 1,
        totalHours: '9 کاتژمێر',
        notes: 'لێدەری کۆری قوتابخانە',
        bloodType: 'AB-',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا رێبین نەجیب محمود',
        program: 'ماستەر لە زمانی عەرەبی',
        specialty: 'زمانی عەرەبی',
        subject: 'عەرەبی - Arabic',
        grade1: 3,
        grade2: 3,
        grade3: 0,
        grade4: 2,
        grade5: 3,
        grade6: 3,
        grade7: 0,
        grade8: 2,
        grade9: 4,
        totalHours: '20 کاتژمێر',
        notes: 'پسپۆڕ لە زمان و ئەدەبی عەرەبی',
        bloodType: 'A+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا هاوژین کەمال احمد',
        program: 'ماستەر لە پسیکۆلۆجی',
        specialty: 'دەروونزانی منداڵان',
        subject: 'پسیکۆلۆجی - Psychology',
        grade1: 0,
        grade2: 0,
        grade3: 2,
        grade4: 3,
        grade5: 0,
        grade6: 0,
        grade7: 2,
        grade8: 3,
        grade9: 4,
        totalHours: '14 کاتژمێر',
        notes: 'ڕاوێژکاری دەروونی خوێندکاران',
        bloodType: 'B+',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        politicalName: 'مامۆستا ئاراس قادر عەلی',
        program: 'دکتۆرا لە فەلسەفە',
        specialty: 'فەلسەفەی ئەخلاق',
        subject: 'فەلسەفە - Philosophy',
        grade1: 0,
        grade2: 0,
        grade3: 0,
        grade4: 2,
        grade5: 0,
        grade6: 0,
        grade7: 0,
        grade8: 2,
        grade9: 3,
        totalHours: '7 کاتژمێر',
        notes: 'پسپۆڕ لە فەلسەفەی ئەخلاق و منتق',
        bloodType: 'O-',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Employee Leaves (مۆڵەتی فەرمانبەران) - 15 entries
    const employeeLeaves = [
      {
        id: uuidv4(),
        employeeName: 'احمد محمد علی',
        specialty: 'مامۆستای وەرزش',
        leaveDate: '2025-01-15',
        leaveType: 'مۆڵەتی ساڵانە',
        leaveDuration: '7',
        orderNumber: 'BM-2025-001',
        returnDate: '2025-01-22',
        notes: 'مۆڵەتی ساڵانە بۆ پشوودان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'فاطمه رەشید حسەن',
        specialty: 'مامۆستای زانست',
        leaveDate: '2025-01-20',
        leaveType: 'مۆڵەتی نەخۆشی',
        leaveDuration: '3',
        orderNumber: 'BM-2025-002',
        returnDate: '2025-01-23',
        notes: 'مۆڵەتی نەخۆشی بۆ چاره‌سه‌ری',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'عومەر سالح محمود',
        specialty: 'مامۆستای کۆمپیوتەر',
        leaveDate: '2025-02-01',
        leaveType: 'مۆڵەتی کەسی',
        leaveDuration: '2',
        orderNumber: 'BM-2025-003',
        returnDate: '2025-02-03',
        notes: 'کاروباری کەسی و خێزانی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'زەینەب کەریم ئەحمەد',
        specialty: 'مامۆستای هونەر',
        leaveDate: '2025-02-05',
        leaveType: 'مۆڵەتی دایکبوون',
        leaveDuration: '90',
        orderNumber: 'BM-2025-004',
        returnDate: '2025-05-06',
        notes: 'مۆڵەتی دایکبوون و چاودێری منداڵ',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'کاروان ئیبراهیم مولود',
        specialty: 'بەڕێوەبەری گشتی',
        leaveDate: '2025-02-10',
        leaveType: 'مۆڵەتی ساڵانە',
        leaveDuration: '14',
        orderNumber: 'BM-2025-005',
        returnDate: '2025-02-24',
        notes: 'مۆڵەتی ساڵانە لەگەڵ خێزان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'هەنگاو نەوروز قادر',
        specialty: 'مامۆستای وێژە',
        leaveDate: '2025-02-15',
        leaveType: 'مۆڵەتی کەسی',
        leaveDuration: '1',
        orderNumber: 'BM-2025-006',
        returnDate: '2025-02-16',
        notes: 'بەشداری لە کۆنفرانسی ئەدەبی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'سۆران جەلال رەحیم',
        specialty: 'مامۆستای ریاضی',
        leaveDate: '2025-03-01',
        leaveType: 'مۆڵەتی نەخۆشی',
        leaveDuration: '5',
        orderNumber: 'BM-2025-007',
        returnDate: '2025-03-06',
        notes: 'نەخۆشی سارد و پشوو',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'روژان ئاکام شوان',
        specialty: 'مامۆستای مێژوو',
        leaveDate: '2025-03-05',
        leaveType: 'مۆڵەتی زەواج',
        leaveDuration: '7',
        orderNumber: 'BM-2025-008',
        returnDate: '2025-03-12',
        notes: 'مۆڵەتی زەواج و هەنی مون',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'شوان محەمەد عەلی',
        specialty: 'مامۆستای فیزیا',
        leaveDate: '2025-03-10',
        leaveType: 'مۆڵەتی بێ موچە',
        leaveDuration: '30',
        orderNumber: 'BM-2025-009',
        returnDate: '2025-04-09',
        notes: 'مۆڵەتی بێ موچە بۆ کارێکی تایبەت',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'ئاوار رامیار کاکە',
        specialty: 'مامۆستای کیمیا',
        leaveDate: '2025-03-15',
        leaveType: 'مۆڵەتی مردن',
        leaveDuration: '3',
        orderNumber: 'BM-2025-010',
        returnDate: '2025-03-18',
        notes: 'مۆڵەتی مردن بۆ کۆچی دوایی باوک',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'بەختیار سەلیم ئەحمەد',
        specialty: 'مامۆستای جووگرافیا',
        leaveDate: '2025-04-01',
        leaveType: 'مۆڵەتی ساڵانە',
        leaveDuration: '10',
        orderNumber: 'BM-2025-011',
        returnDate: '2025-04-11',
        notes: 'مۆڵەتی بەهار لەگەڵ خێزان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'دڵنیا فەرهاد قادر',
        specialty: 'مامۆستای پەروەردە',
        leaveDate: '2025-04-05',
        leaveType: 'مۆڵەتی نەخۆشی',
        leaveDuration: '4',
        orderNumber: 'BM-2025-012',
        returnDate: '2025-04-09',
        notes: 'چاره‌سه‌ری تایبەت لە نەخۆشخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'بێستون خالید حەمە',
        specialty: 'مامۆستای موسیقا',
        leaveDate: '2025-04-10',
        leaveType: 'مۆڵەتی کەسی',
        leaveDuration: '2',
        orderNumber: 'BM-2025-013',
        returnDate: '2025-04-12',
        notes: 'بەشداری لە فیستیڤاڵی موسیقا',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'گوڵستان نەریمان رەزا',
        specialty: 'مامۆستای پسکۆلۆجی',
        leaveDate: '2025-04-15',
        leaveType: 'مۆڵەتی ساڵانە',
        leaveDuration: '5',
        orderNumber: 'BM-2025-014',
        returnDate: '2025-04-20',
        notes: 'مۆڵەتی کورت بۆ پشوودان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employeeName: 'یاسین مەولود عەبدوڵا',
        specialty: 'مامۆستای ئابووری',
        leaveDate: '2025-04-20',
        leaveType: 'مۆڵەتی کەسی',
        leaveDuration: '6',
        orderNumber: 'BM-2025-015',
        returnDate: '2025-04-26',
        notes: 'گەشت بۆ کۆنگرەی ئابووری',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Bus Management (بەڕێوەبردنی پاس) - 15 entries
    const busManagement = [
      {
        id: uuidv4(),
        studentFullName: 'ئاریان ئەحمەد محەمەد',
        studentClass: 'پۆل دەیەم',
        studentMobile: '+964 750 123 4567',
        studentAddress: 'هەولێر - سەنتەر',
        teacherFullName: 'پرۆفیسۆر سالم محەمەد احمد',
        teacherMobile: '+964 751 234 5678',
        teacherAddress: 'هەولێر - بازار',
        teachingExperience: '15 ساڵ ئەزموون',
        teacherClass: 'پۆل دەیەم',
        driverFullName: 'عومەر سالح محمود',
        driverMobile: '+964 752 345 6789',
        driverAddress: 'هەولێر - تایران',
        driverPhoto: 'driver_photo_1.jpg',
        driverLicensePhoto: 'driver_license_1.jpg',
        driverLicenseImage: 'driver_license_image_1.jpg',
        driverVideos: ['driver_video_1.mp4', 'driver_video_2.mp4'],
        notes: 'پاسی یەکەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ژیار رەشید قادر',
        studentClass: 'پۆل یازدەیەم',
        studentMobile: '+964 753 456 7890',
        studentAddress: 'هەولێر - شۆڕش',
        teacherFullName: 'دکتۆر فاطمە حەسەن علی',
        teacherMobile: '+964 754 567 8901',
        teacherAddress: 'هەولێر - درەام سیتی',
        teachingExperience: '12 ساڵ ئەزموون',
        teacherClass: 'پۆل یازدەیەم',
        driverFullName: 'زەینەب کەریم ئەحمەد',
        driverMobile: '+964 755 678 9012',
        driverAddress: 'هەولێر - کۆی زانیاری',
        driverPhoto: 'driver_photo_2.jpg',
        driverLicensePhoto: 'driver_license_2.jpg',
        driverLicenseImage: 'driver_license_image_2.jpg',
        driverVideos: ['driver_video_3.mp4'],
        notes: 'پاسی دووەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'دیلان سۆران علی',
        studentClass: 'پۆل نۆیەم',
        studentMobile: '+964 756 789 0123',
        studentAddress: 'هەولێر - ئانکاوا',
        teacherFullName: 'مامۆستا ئەحمەد کەریم محمود',
        teacherMobile: '+964 757 890 1234',
        teacherAddress: 'هەولێر - کۆی کامیران',
        teachingExperience: '18 ساڵ ئەزموون',
        teacherClass: 'پۆل نۆیەم',
        driverFullName: 'کاروان ئیبراهیم مولود',
        driverMobile: '+964 758 901 2345',
        driverAddress: 'هەولێر - کۆی نیشتمان',
        driverPhoto: 'driver_photo_3.jpg',
        driverLicensePhoto: 'driver_license_3.jpg',
        driverLicenseImage: 'driver_license_image_3.jpg',
        driverVideos: ['driver_video_4.mp4', 'driver_video_5.mp4'],
        notes: 'پاسی سێیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ئایان کاروان ئیبراهیم',
        studentClass: 'پۆل دوازدەیەم',
        studentMobile: '+964 759 012 3456',
        studentAddress: 'هەولێر - کۆی زانکۆ',
        teacherFullName: 'مامۆستا زەینەب علی حسەن',
        teacherMobile: '+964 770 123 4567',
        teacherAddress: 'هەولێر - کۆی گوڵان',
        teachingExperience: '10 ساڵ ئەزموون',
        teacherClass: 'پۆل دوازدەیەم',
        driverFullName: 'هەنگاو نەوروز قادر',
        driverMobile: '+964 771 234 5678',
        driverAddress: 'هەولێر - کۆی برایەتی',
        driverPhoto: 'driver_photo_4.jpg',
        driverLicensePhoto: 'driver_license_4.jpg',
        driverLicenseImage: 'driver_license_image_4.jpg',
        driverVideos: ['driver_video_6.mp4'],
        notes: 'پاسی چوارەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'پەیمان شوان محەمەد',
        studentClass: 'پۆل دەیەم',
        studentMobile: '+964 772 345 6789',
        studentAddress: 'هەولێر - کۆی ئاسۆ',
        teacherFullName: 'پرۆفیسۆر کاروان ئیبراهیم مولود',
        teacherMobile: '+964 773 456 7890',
        teacherAddress: 'هەولێر - کۆی سەرچنار',
        teachingExperience: '20 ساڵ ئەزموون',
        teacherClass: 'پۆل دەیەم',
        driverFullName: 'سۆران جەلال رەحیم',
        driverMobile: '+964 774 567 8901',
        driverAddress: 'هەولێر - کۆی شاری نوێ',
        driverPhoto: 'driver_photo_5.jpg',
        driverLicensePhoto: 'driver_license_5.jpg',
        driverLicenseImage: 'driver_license_image_5.jpg',
        driverVideos: ['driver_video_7.mp4', 'driver_video_8.mp4'],
        notes: 'پاسی پێنجەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ڕۆژین بەختیار سەلیم',
        studentClass: 'پۆل یازدەیەم',
        studentMobile: '+964 775 678 9012',
        studentAddress: 'هەولێر - کۆی زانیاری',
        teacherFullName: 'مامۆستا هەنگاو نەوروز قادر',
        teacherMobile: '+964 776 789 0123',
        teacherAddress: 'هەولێر - کۆی کامیران',
        teachingExperience: '8 ساڵ ئەزموون',
        teacherClass: 'پۆل یازدەیەم',
        driverFullName: 'روژان ئاکام شوان',
        driverMobile: '+964 777 890 1234',
        driverAddress: 'هەولێر - کۆی نیشتمان',
        driverPhoto: 'driver_photo_6.jpg',
        driverLicensePhoto: 'driver_license_6.jpg',
        driverLicenseImage: 'driver_license_image_6.jpg',
        driverVideos: ['driver_video_9.mp4'],
        notes: 'پاسی شەشەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'دۆنیا ئاوار رامیار',
        studentClass: 'پۆل نۆیەم',
        studentMobile: '+964 778 901 2345',
        studentAddress: 'هەولێر - کۆی زانکۆ',
        teacherFullName: 'مامۆستا سۆران جەلال رەحیم',
        teacherMobile: '+964 779 012 3456',
        teacherAddress: 'هەولێر - کۆی گوڵان',
        teachingExperience: '14 ساڵ ئەزموون',
        teacherClass: 'پۆل نۆیەم',
        driverFullName: 'شوان محەمەد عەلی',
        driverMobile: '+964 780 123 4567',
        driverAddress: 'هەولێر - کۆی برایەتی',
        driverPhoto: 'driver_photo_7.jpg',
        driverLicensePhoto: 'driver_license_7.jpg',
        driverLicenseImage: 'driver_license_image_7.jpg',
        driverVideos: ['driver_video_10.mp4', 'driver_video_11.mp4'],
        notes: 'پاسی حەوتەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ڕێزان یاسین مەولود',
        studentClass: 'پۆل دوازدەیەم',
        studentMobile: '+964 781 234 5678',
        studentAddress: 'هەولێر - کۆی ئاسۆ',
        teacherFullName: 'مامۆستا روژان ئاکام شوان',
        teacherMobile: '+964 782 345 6789',
        teacherAddress: 'هەولێر - کۆی سەرچنار',
        teachingExperience: '11 ساڵ ئەزموون',
        teacherClass: 'پۆل دوازدەیەم',
        driverFullName: 'ئاوار رامیار کاکە',
        driverMobile: '+964 783 456 7890',
        driverAddress: 'هەولێر - کۆی شاری نوێ',
        driverPhoto: 'driver_photo_8.jpg',
        driverLicensePhoto: 'driver_license_8.jpg',
        driverLicenseImage: 'driver_license_image_8.jpg',
        driverVideos: ['driver_video_12.mp4'],
        notes: 'پاسی هەشتەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ئەیمان بێستون خالید',
        studentClass: 'پۆل دەیەم',
        studentMobile: '+964 784 567 8901',
        studentAddress: 'هەولێر - کۆی زانیاری',
        teacherFullName: 'مامۆستا شوان محەمەد عەلی',
        teacherMobile: '+964 785 678 9012',
        teacherAddress: 'هەولێر - کۆی کامیران',
        teachingExperience: '16 ساڵ ئەزموون',
        teacherClass: 'پۆل دەیەم',
        driverFullName: 'بەختیار سەلیم ئەحمەد',
        driverMobile: '+964 786 789 0123',
        driverAddress: 'هەولێر - کۆی نیشتمان',
        driverPhoto: 'driver_photo_9.jpg',
        driverLicensePhoto: 'driver_license_9.jpg',
        driverLicenseImage: 'driver_license_image_9.jpg',
        driverVideos: ['driver_video_13.mp4', 'driver_video_14.mp4'],
        notes: 'پاسی نۆیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'کۆمەڵ گوڵستان نەریمان',
        studentClass: 'پۆل یازدەیەم',
        studentMobile: '+964 787 890 1234',
        studentAddress: 'هەولێر - کۆی زانکۆ',
        teacherFullName: 'مامۆستا ئاوار رامیار کاکە',
        teacherMobile: '+964 788 901 2345',
        teacherAddress: 'هەولێر - کۆی گوڵان',
        teachingExperience: '9 ساڵ ئەزموون',
        teacherClass: 'پۆل یازدەیەم',
        driverFullName: 'دڵنیا فەرهاد قادر',
        driverMobile: '+964 789 012 3456',
        driverAddress: 'هەولێر - کۆی برایەتی',
        driverPhoto: 'driver_photo_10.jpg',
        driverLicensePhoto: 'driver_license_10.jpg',
        driverLicenseImage: 'driver_license_image_10.jpg',
        driverVideos: ['driver_video_15.mp4'],
        notes: 'پاسی دەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ڕۆمان احمد محمد',
        studentClass: 'پۆل نۆیەم',
        studentMobile: '+964 790 123 4567',
        studentAddress: 'هەولێر - کۆی ئاسۆ',
        teacherFullName: 'مامۆستا بەختیار سەلیم ئەحمەد',
        teacherMobile: '+964 791 234 5678',
        teacherAddress: 'هەولێر - کۆی سەرچنار',
        teachingExperience: '13 ساڵ ئەزموون',
        teacherClass: 'پۆل نۆیەم',
        driverFullName: 'بێستون خالید حەمە',
        driverMobile: '+964 792 345 6789',
        driverAddress: 'هەولێر - کۆی شاری نوێ',
        driverPhoto: 'driver_photo_11.jpg',
        driverLicensePhoto: 'driver_license_11.jpg',
        driverLicenseImage: 'driver_license_image_11.jpg',
        driverVideos: ['driver_video_16.mp4', 'driver_video_17.mp4'],
        notes: 'پاسی یازدەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'نەوروز فاطمە رەشید',
        studentClass: 'پۆل دوازدەیەم',
        studentMobile: '+964 793 456 7890',
        studentAddress: 'هەولێر - کۆی زانیاری',
        teacherFullName: 'مامۆستا دڵنیا فەرهاد قادر',
        teacherMobile: '+964 794 567 8901',
        teacherAddress: 'هەولێر - کۆی کامیران',
        teachingExperience: '7 ساڵ ئەزموون',
        teacherClass: 'پۆل دوازدەیەم',
        driverFullName: 'گوڵستان نەریمان رەزا',
        driverMobile: '+964 795 678 9012',
        driverAddress: 'هەولێر - کۆی نیشتمان',
        driverPhoto: 'driver_photo_12.jpg',
        driverLicensePhoto: 'driver_license_12.jpg',
        driverLicenseImage: 'driver_license_image_12.jpg',
        driverVideos: ['driver_video_18.mp4'],
        notes: 'پاسی دوازدەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ئارام عومەر سالح',
        studentClass: 'پۆل دەیەم',
        studentMobile: '+964 796 789 0123',
        studentAddress: 'هەولێر - کۆی زانکۆ',
        teacherFullName: 'مامۆستا رێبین نەجیب محمود',
        teacherMobile: '+964 797 890 1234',
        teacherAddress: 'هەولێر - کۆی گوڵان',
        teachingExperience: '12 ساڵ ئەزموون',
        teacherClass: 'پۆل دەیەم',
        driverFullName: 'یاسین مەولود عەبدوڵا',
        driverMobile: '+964 798 901 2345',
        driverAddress: 'هەولێر - کۆی برایەتی',
        driverPhoto: 'driver_photo_13.jpg',
        driverLicensePhoto: 'driver_license_13.jpg',
        driverLicenseImage: 'driver_license_image_13.jpg',
        driverVideos: ['driver_video_19.mp4', 'driver_video_20.mp4'],
        notes: 'پاسی سێزدەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'دڵشاد زەینەب کەریم',
        studentClass: 'پۆل یازدەیەم',
        studentMobile: '+964 799 012 3456',
        studentAddress: 'هەولێر - کۆی ئاسۆ',
        teacherFullName: 'مامۆستا هاوژین کەمال احمد',
        teacherMobile: '+964 800 123 4567',
        teacherAddress: 'هەولێر - کۆی سەرچنار',
        teachingExperience: '6 ساڵ ئەزموون',
        teacherClass: 'پۆل یازدەیەم',
        driverFullName: 'ئاراس قادر عەلی',
        driverMobile: '+964 801 234 5678',
        driverAddress: 'هەولێر - کۆی شاری نوێ',
        driverPhoto: 'driver_photo_14.jpg',
        driverLicensePhoto: 'driver_license_14.jpg',
        driverLicenseImage: 'driver_license_image_14.jpg',
        driverVideos: ['driver_video_21.mp4'],
        notes: 'پاسی چواردەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentFullName: 'ئاسۆ کاروان ئیبراهیم',
        studentClass: 'پۆل نۆیەم',
        studentMobile: '+964 802 345 6789',
        studentAddress: 'هەولێر - کۆی زانیاری',
        teacherFullName: 'مامۆستا ئاراس قادر عەلی',
        teacherMobile: '+964 803 456 7890',
        teacherAddress: 'هەولێر - کۆی کامیران',
        teachingExperience: '14 ساڵ ئەزموون',
        teacherClass: 'پۆل نۆیەم',
        driverFullName: 'رەشید محەمەد عەلی',
        driverMobile: '+964 804 567 8901',
        driverAddress: 'هەولێر - کۆی نیشتمان',
        driverPhoto: 'driver_photo_15.jpg',
        driverLicensePhoto: 'driver_license_15.jpg',
        driverLicenseImage: 'driver_license_image_15.jpg',
        driverVideos: ['driver_video_22.mp4', 'driver_video_23.mp4'],
        notes: 'پاسی پازدەیەم بۆ قوتابخانە',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Supervision System (چاودێری) - 15 entries
    const supervision = [
      {
        id: uuidv4(),
        teacherName: 'پرۆفیسۆر سالم محەمەد احمد',
        subject: 'ریاضیات',
        teacherDepartment: 'بەشی زانست',
        teacherGrade: 'پۆل 10',
        teacherViolationType: 'دواکەوتن لە کات',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی وانە - Classroom Hall',
        studentName: 'ئاریان ئەحمەد محەمەد',
        studentDepartment: 'بەشی زانست',
        studentGrade: 'پۆل 10',
        studentViolationType: 'قسەکردن لە پۆل',
        studentPunishmentType: 'سەرزەنشت',
        studentSupervisionLocation: 'هۆڵی وانە - Classroom Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'دکتۆر فاطمە حەسەن علی',
        subject: 'کیمیا',
        teacherDepartment: 'بەشی زانست',
        teacherGrade: 'پۆل 11',
        teacherViolationType: 'نەهاتن بە کات',
        teacherPunishmentType: 'ئاگادارکردنەوەی نووسراو',
        teacherSupervisionLocation: 'تاقیگەی کیمیا - Chemistry Lab',
        studentName: 'ژیار رەشید قادر',
        studentDepartment: 'بەشی زانست',
        studentGrade: 'پۆل 11',
        studentViolationType: 'ئارامی نەگرتن',
        studentPunishmentType: 'ئاگادارکردنەوە',
        studentSupervisionLocation: 'تاقیگەی کیمیا - Chemistry Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا ئەحمەد کەریم محمود',
        subject: 'فیزیا',
        teacherDepartment: 'بەشی زانست',
        teacherGrade: 'پۆل 12',
        teacherViolationType: 'نایەخوازی ئەرکەکان',
        teacherPunishmentType: 'سەرزەنشت',
        teacherSupervisionLocation: 'تاقیگەی فیزیا - Physics Lab',
        studentName: 'دیلان سۆران علی',
        studentDepartment: 'بەشی زانست',
        studentGrade: 'پۆل 9',
        studentViolationType: 'زۆر غیاب کردن',
        studentPunishmentType: 'ئاگادارکردنەوەی دایک و باوک',
        studentSupervisionLocation: 'تاقیگەی فیزیا - Physics Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا زەینەب علی حسەن',
        subject: 'ئینگلیزی',
        teacherDepartment: 'بەشی زمان',
        teacherGrade: 'پۆل 9',
        teacherViolationType: 'نەگەیاندنی زانیاری بە باشی',
        teacherPunishmentType: 'ڕاهێنانی زیاتر',
        teacherSupervisionLocation: 'هۆڵی زمانی ئینگلیزی - English Language Hall',
        studentName: 'ئایان کاروان ئیبراهیم',
        studentDepartment: 'بەشی مرۆڤایەتی',
        studentGrade: 'پۆل 12',
        studentViolationType: 'کەمی بەشداری',
        studentPunishmentType: 'هاندان',
        studentSupervisionLocation: 'هۆڵی زمانی ئینگلیزی - English Language Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'پرۆفیسۆر کاروان ئیبراهیم مولود',
        subject: 'مێژوو',
        teacherDepartment: 'بەشی مرۆڤایەتی',
        teacherGrade: 'پۆل 11',
        teacherViolationType: 'بەشداری نەکردن لە کۆبوونەوە',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی مێژوو - History Hall',
        studentName: 'پەیمان شوان محەمەد',
        studentDepartment: 'بەشی وەرزش',
        studentGrade: 'پۆل 10',
        studentViolationType: 'دەرەنگ هاتن',
        studentPunishmentType: 'ئاگادارکردنەوە',
        studentSupervisionLocation: 'هۆڵی مێژوو - History Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا هەنگاو نەوروز قادر',
        subject: 'وێژەی کوردی',
        teacherDepartment: 'بەشی ئەدەبیات',
        teacherGrade: 'پۆل 10',
        teacherViolationType: 'نەبردنی دەفتەری نمرە',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی وێژە - Literature Hall',
        studentName: 'ڕۆژین بەختیار سەلیم',
        studentDepartment: 'بەشی هونەر',
        studentGrade: 'پۆل 11',
        studentViolationType: 'نەکردنی پرۆژە',
        studentPunishmentType: 'مۆهلەتی زیاتر',
        studentSupervisionLocation: 'هۆڵی وێژە - Literature Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا سۆران جەلال رەحیم',
        subject: 'کۆمپیوتەر',
        teacherDepartment: 'بەشی تەکنەلۆجیا',
        teacherGrade: 'پۆل 12',
        teacherViolationType: 'کەمی ئامادەکاری وانە',
        teacherPunishmentType: 'ڕاهێنانی زیاتر',
        teacherSupervisionLocation: 'تاقیگەی کۆمپیوتەر - Computer Lab',
        studentName: 'دۆنیا ئاوار رامیار',
        studentDepartment: 'بەشی زانست',
        studentGrade: 'پۆل 9',
        studentViolationType: 'ترس لە پرسیار',
        studentPunishmentType: 'هاندان و پێدانی متمانە',
        studentSupervisionLocation: 'تاقیگەی کۆمپیوتەر - Computer Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا روژان ئاکام شوان',
        subject: 'هونەر',
        teacherDepartment: 'بەشی هونەر',
        teacherGrade: 'پۆل 9',
        teacherViolationType: 'نەهێنانی ئامرازی وانە',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی هونەر - Art Hall',
        studentName: 'ڕێزان یاسین مەولود',
        studentDepartment: 'بەشی ئابووری',
        studentGrade: 'پۆل 12',
        studentViolationType: 'تێپەڕاندنی کات',
        studentPunishmentType: 'ئاگادارکردنەوە',
        studentSupervisionLocation: 'هۆڵی هونەر - Art Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا شوان محەمەد عەلی',
        subject: 'وەرزش',
        teacherDepartment: 'بەشی وەرزش',
        teacherGrade: 'هەموو پۆلەکان',
        teacherViolationType: 'نەهێنانی ئامڕازی وەرزشی',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'مەیدانی وەرزش - Sports Field',
        studentName: 'ئەیمان بێستون خالید',
        studentDepartment: 'بەشی موسیقا',
        studentGrade: 'پۆل 10',
        studentViolationType: 'غیاب لە وەرزش',
        studentPunishmentType: 'چاوپێکەوتن لەگەڵ دایک و باوک',
        studentSupervisionLocation: 'مەیدانی وەرزش - Sports Field',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا ئاوار رامیار کاکە',
        subject: 'بایۆلۆجی',
        teacherDepartment: 'بەشی زانست',
        teacherGrade: 'پۆل 11',
        teacherViolationType: 'نەئەنجامدانی ئەزموونی عەملی',
        teacherPunishmentType: 'ڕاهێنانی زیاتر',
        teacherSupervisionLocation: 'تاقیگەی بایۆلۆجی - Biology Lab',
        studentName: 'کۆمەڵ گوڵستان نەریمان',
        studentDepartment: 'بەشی دەروونزانی',
        studentGrade: 'پۆل 11',
        studentViolationType: 'پرسیاری زۆر',
        studentPunishmentType: 'هاندان',
        studentSupervisionLocation: 'تاقیگەی بایۆلۆجی - Biology Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا بەختیار سەلیم ئەحمەد',
        subject: 'جووگرافیا',
        teacherDepartment: 'بەشی مرۆڤایەتی',
        teacherGrade: 'پۆل 10',
        teacherViolationType: 'نەبردنی نەخشە',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی جووگرافیا - Geography Hall',
        studentName: 'ڕۆمان احمد محمد',
        studentDepartment: 'بەشی تەکنەلۆجیا',
        studentGrade: 'پۆل 9',
        studentViolationType: 'بەرپرس نەبوون',
        studentPunishmentType: 'چاوپێکەوتن و ئاگادارکردنەوە',
        studentSupervisionLocation: 'هۆڵی جووگرافیا - Geography Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا دڵنیا فەرهاد قادر',
        subject: 'موسیقا',
        teacherDepartment: 'بەشی هونەر',
        teacherGrade: 'هەموو پۆلەکان',
        teacherViolationType: 'نەهێنانی ئامێری موسیقا',
        teacherPunishmentType: 'ئاگادارکردنەوە',
        teacherSupervisionLocation: 'هۆڵی موسیقا - Music Hall',
        studentName: 'نەوروز فاطمە رەشید',
        studentDepartment: 'بەشی وەرزش',
        studentGrade: 'پۆل 12',
        studentViolationType: 'ناکۆکی لەگەڵ هاوڕێکان',
        studentPunishmentType: 'وتووێژ و چارەسەرکردن',
        studentSupervisionLocation: 'هۆڵی موسیقا - Music Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا رێبین نەجیب محمود',
        subject: 'عەرەبی',
        teacherDepartment: 'بەشی زمان',
        teacherGrade: 'پۆل 12',
        teacherViolationType: 'شێوازی فێرکردنی کۆن',
        teacherPunishmentType: 'ڕاهێنانی نوێ',
        teacherSupervisionLocation: 'هۆڵی زمانی عەرەبی - Arabic Language Hall',
        studentName: 'ئارام عومەر سالح',
        studentDepartment: 'بەشی جووگرافیا',
        studentGrade: 'پۆل 10',
        studentViolationType: 'نەکردنی ئەرکی ماڵەوە',
        studentPunishmentType: 'چاوپێکەوتن لەگەڵ خێزان',
        studentSupervisionLocation: 'هۆڵی زمانی عەرەبی - Arabic Language Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا هاوژین کەمال احمد',
        subject: 'پسیکۆلۆجی',
        teacherDepartment: 'بەشی دەروونزانی',
        teacherGrade: 'پۆل 11',
        teacherViolationType: 'کەمی پەیوەندی لەگەڵ خوێندکاران',
        teacherPunishmentType: 'ڕاهێنانی کۆمەڵایەتی',
        teacherSupervisionLocation: 'هۆڵی پسیکۆلۆجی - Psychology Hall',
        studentName: 'دڵشاد زەینەب کەریم',
        studentDepartment: 'بەشی زانست',
        studentGrade: 'پۆل 11',
        studentViolationType: 'ترس لە ئەزموونی عەملی',
        studentPunishmentType: 'ئارامکردنەوە و هاندان',
        studentSupervisionLocation: 'هۆڵی پسیکۆلۆجی - Psychology Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        teacherName: 'مامۆستا ئاراس قادر عەلی',
        subject: 'فەلسەفە',
        teacherDepartment: 'بەشی فەلسەفە',
        teacherGrade: 'پۆل 12',
        teacherViolationType: 'قورسایی زیاد لە وانە',
        teacherPunishmentType: 'ئاسانکردنی شێواز',
        teacherSupervisionLocation: 'هۆڵی فەلسەفە - Philosophy Hall',
        studentName: 'ئاسۆ کاروان ئیبراهیم',
        studentDepartment: 'بەشی موسیقا',
        studentGrade: 'پۆل 9',
        studentViolationType: 'بەرزکردنەوەی دەنگ لە گۆرانی',
        studentPunishmentType: 'ڕێکخستنی کاتی تەمرین',
        studentSupervisionLocation: 'هۆڵی فەلسەفە - Philosophy Hall',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Supervised Students (خوێندکاری چاودێری کراو) - 15 entries
    const supervisedStudents = [
      {
        id: uuidv4(),
        studentName: 'ئاریان ئەحمەد محەمەد',
        department: 'بەشی زانست',
        grade: 'پۆل 10',
        violationType: 'قسەکردن لە پۆل',
        list: 'لیستی یەکەم',
        punishmentType: 'سەرزەنشت',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٥٠١٢٣٤٥٦٧',
        supervisionLocation: 'هۆڵی وانە - Classroom Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ژیار رەشید قادر',
        department: 'بەشی زانست',
        grade: 'پۆل 11',
        violationType: 'ئارامی نەگرتن',
        list: 'لیستی یەکەم',
        punishmentType: 'ئاگادارکردنەوە',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٧٠٢٣٤٥٦٧٨',
        supervisionLocation: 'تاقیگەی کیمیا - Chemistry Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دیلان سۆران علی',
        department: 'بەشی زانست',
        grade: 'پۆل 9',
        violationType: 'زۆر غیاب کردن',
        list: 'لیستی دووەم',
        punishmentType: 'ئاگادارکردنەوەی دایک و باوک',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٨٠٣٤٥٦٧٨٩',
        supervisionLocation: 'تاقیگەی فیزیا - Physics Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئایان کاروان ئیبراهیم',
        department: 'بەشی مرۆڤایەتی',
        grade: 'پۆل 12',
        violationType: 'کەمی بەشداری',
        list: 'لیستی یەکەم',
        punishmentType: 'هاندان',
        guardianNotification: 'نەناردراوە',
        guardianPhone: '٠٧٥٠٤٥٦٧٨٩٠',
        supervisionLocation: 'هۆڵی زمانی ئینگلیزی - English Language Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'پەیمان شوان محەمەد',
        department: 'بەشی وەرزش',
        grade: 'پۆل 10',
        violationType: 'دەرەنگ هاتن',
        list: 'لیستی یەکەم',
        punishmentType: 'ئاگادارکردنەوە',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٧٠٥٦٧٨٩٠١',
        supervisionLocation: 'هۆڵی مێژوو - History Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕۆژین بەختیار سەلیم',
        department: 'بەشی هونەر',
        grade: 'پۆل 11',
        violationType: 'نەکردنی پرۆژە',
        list: 'لیستی یەکەم',
        punishmentType: 'مۆهلەتی زیاتر',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٨٠٦٧٨٩٠١٢',
        supervisionLocation: 'هۆڵی وێژە - Literature Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دۆنیا ئاوار رامیار',
        department: 'بەشی زانست',
        grade: 'پۆل 9',
        violationType: 'ترس لە پرسیار',
        list: 'لیستی یەکەم',
        punishmentType: 'هاندان و پێدانی متمانە',
        guardianNotification: 'نەناردراوە',
        guardianPhone: '٠٧٥٠٧٨٩٠١٢٣',
        supervisionLocation: 'تاقیگەی کۆمپیوتەر - Computer Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕێزان یاسین مەولود',
        department: 'بەشی ئابووری',
        grade: 'پۆل 12',
        violationType: 'تێپەڕاندنی کات',
        list: 'لیستی یەکەم',
        punishmentType: 'ئاگادارکردنەوە',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٧٠٨٩٠١٢٣٤',
        supervisionLocation: 'هۆڵی هونەر - Art Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئەیمان بێستون خالید',
        department: 'بەشی موسیقا',
        grade: 'پۆل 10',
        violationType: 'غیاب لە وەرزش',
        list: 'لیستی دووەم',
        punishmentType: 'چاوپێکەوتن لەگەڵ دایک و باوک',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٨٠٩٠١٢٣٤٥',
        supervisionLocation: 'مەیدانی وەرزش - Sports Field',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'کۆمەڵ گوڵستان نەریمان',
        department: 'بەشی دەروونزانی',
        grade: 'پۆل 11',
        violationType: 'پرسیاری زۆر',
        list: 'لیستی یەکەم',
        punishmentType: 'هاندان',
        guardianNotification: 'نەناردراوە',
        guardianPhone: '٠٧٥١٠١٢٣٤٥٦',
        supervisionLocation: 'تاقیگەی بایۆلۆجی - Biology Lab',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ڕۆمان احمد محمد',
        department: 'بەشی تەکنەلۆجیا',
        grade: 'پۆل 9',
        violationType: 'بەرپرس نەبوون',
        list: 'لیستی دووەم',
        punishmentType: 'چاوپێکەوتن و ئاگادارکردنەوە',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٧١١٢٣٤٥٦٧',
        supervisionLocation: 'هۆڵی جووگرافیا - Geography Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'نەوروز فاطمە رەشید',
        department: 'بەشی وەرزش',
        grade: 'پۆل 12',
        violationType: 'ناکۆکی لەگەڵ هاوڕێکان',
        list: 'لیستی یەکەم',
        punishmentType: 'وتووێژ و چارەسەرکردن',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٨١٢٣٤٥٦٧٨',
        supervisionLocation: 'هۆڵی موسیقا - Music Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئارام عومەر سالح',
        department: 'بەشی جوگرافیا',
        grade: 'پۆل 10',
        violationType: 'نەکردنی ئەرکی ماڵەوە',
        list: 'لیستی دووەم',
        punishmentType: 'چاوپێکەوتن لەگەڵ خێزان',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٥١٣٤٥٦٧٨٩',
        supervisionLocation: 'هۆڵی زمانی عەرەبی - Arabic Language Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'دڵشاد زەینەب کەریم',
        department: 'بەشی زانست',
        grade: 'پۆل 11',
        violationType: 'ترس لە ئەزموونی عەملی',
        list: 'لیستی یەکەم',
        punishmentType: 'ئارامکردنەوە و هاندان',
        guardianNotification: 'نەناردراوە',
        guardianPhone: '٠٧٧١٤٥٦٧٨٩٠',
        supervisionLocation: 'هۆڵی پسیکۆلۆجی - Psychology Hall',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        studentName: 'ئاسۆ کاروان ئیبراهیم',
        department: 'بەشی موسیقا',
        grade: 'پۆل 9',
        violationType: 'بەرزکردنەوەی دەنگ لە گۆرانی',
        list: 'لیستی یەکەم',
        punishmentType: 'ڕێکخستنی کاتی تەمرین',
        guardianNotification: 'ناردراوە',
        guardianPhone: '٠٧٨١٥٦٧٨٩٠١',
        supervisionLocation: 'هۆڵی فەلسەفە - Philosophy Hall',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Exam Supervision Management (بەڕێوەبردنی چاودێریکردنی تاقیکردنەوە) - 15 entries
    const examSupervision = [
      {
        id: uuidv4(),
        subject: 'ریاضیات',
        stage: 'پۆل 10',
        endTime: '10:30 AM',
        examAchievement: 'باش - %78',
        supervisorName: 'پرۆفیسۆر سالم محەمەد',
        obtainedScore: '78',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'کیمیا',
        stage: 'پۆل 11',
        endTime: '11:00 AM',
        examAchievement: 'زۆر باش - %85',
        supervisorName: 'دکتۆر فاطمە حەسەن',
        obtainedScore: '85',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'فیزیا',
        stage: 'پۆل 12',
        endTime: '9:45 AM',
        examAchievement: 'ناوەند - %65',
        supervisorName: 'مامۆستا ئەحمەد کەریم',
        obtainedScore: '65',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'ئینگلیزی',
        stage: 'پۆل 9',
        endTime: '10:15 AM',
        examAchievement: 'باش - %80',
        supervisorName: 'مامۆستا زەینەب علی',
        obtainedScore: '80',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'مێژوو',
        stage: 'پۆل 11',
        endTime: '11:30 AM',
        examAchievement: 'زۆر باش - %88',
        supervisorName: 'پرۆفیسۆر کاروان ئیبراهیم',
        obtainedScore: '88',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'وێژەی کوردی',
        stage: 'پۆل 10',
        endTime: '10:00 AM',
        examAchievement: 'باش - %75',
        supervisorName: 'مامۆستا هەنگاو نەوروز',
        obtainedScore: '75',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'کۆمپیوتەر',
        stage: 'پۆل 12',
        endTime: '11:45 AM',
        examAchievement: 'زۆر باش - %92',
        supervisorName: 'مامۆستا سۆران جەلال',
        obtainedScore: '92',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'هونەر',
        stage: 'پۆل 9',
        endTime: '9:30 AM',
        examAchievement: 'دەرەنجام - %95',
        supervisorName: 'مامۆستا روژان ئاکام',
        obtainedScore: '95',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'وەرزش',
        stage: 'هەموو پۆلەکان',
        endTime: '12:00 PM',
        examAchievement: 'باش - %82',
        supervisorName: 'مامۆستا شوان محەمەد',
        obtainedScore: '82',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'بایۆلۆجی',
        stage: 'پۆل 11',
        endTime: '10:45 AM',
        examAchievement: 'زۆر باش - %86',
        supervisorName: 'مامۆستا ئاوار رامیار',
        obtainedScore: '86',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'جووگرافیا',
        stage: 'پۆل 10',
        endTime: '9:15 AM',
        examAchievement: 'ناوەند - %68',
        supervisorName: 'مامۆستا بەختیار سەلیم',
        obtainedScore: '68',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'موسیقا',
        stage: 'هەموو پۆلەکان',
        endTime: '2:00 PM',
        examAchievement: 'زۆر باش - %90',
        supervisorName: 'مامۆستا دڵنیا فەرهاد',
        obtainedScore: '90',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'عەرەبی',
        stage: 'پۆل 12',
        endTime: '11:15 AM',
        examAchievement: 'باش - %72',
        supervisorName: 'مامۆستا رێبین نەجیب',
        obtainedScore: '72',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'پسیکۆلۆجی',
        stage: 'پۆل 11',
        endTime: '10:30 AM',
        examAchievement: 'زۆر باش - %87',
        supervisorName: 'مامۆستا هاوژین کەمال',
        obtainedScore: '87',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subject: 'فەلسەفە',
        stage: 'پۆل 12',
        endTime: '3:30 PM',
        examAchievement: 'دەرەنجام - %94',
        supervisorName: 'مامۆستا ئاراس قادر',
        obtainedScore: '94',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Monthly Expenses (خەرجی مانگانه) - 15 entries
    const monthlyExpenses = [
      {
        id: uuidv4(),
        year: '2025',
        month: '1',
        staffSalary: 18500000,
        expenses: 2800000,
        buildingRent: 2500000,
        dramaFee: 450000,
        socialSupport: 300000,
        electricity: 1200000,
        total: 25750000,
        notes: 'مانگی کانوونی دووەم - بەڕێوەبردنی ئاسایی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '2',
        staffSalary: 18500000,
        expenses: 3200000,
        buildingRent: 2500000,
        dramaFee: 500000,
        socialSupport: 350000,
        electricity: 1350000,
        total: 26400000,
        notes: 'مانگی شوبات - زیادبوونی خەرجی گەرمکردنەوە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '3',
        staffSalary: 18500000,
        expenses: 2950000,
        buildingRent: 2500000,
        dramaFee: 480000,
        socialSupport: 320000,
        electricity: 1180000,
        total: 25930000,
        notes: 'مانگی ئازار - خەرجی نۆرمال',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '4',
        staffSalary: 18800000,
        expenses: 3100000,
        buildingRent: 2500000,
        dramaFee: 520000,
        socialSupport: 380000,
        electricity: 1050000,
        total: 26350000,
        notes: 'مانگی نیسان - بەرزکردنەوەی موچە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '5',
        staffSalary: 18800000,
        expenses: 2750000,
        buildingRent: 2500000,
        dramaFee: 450000,
        socialSupport: 300000,
        electricity: 950000,
        total: 25750000,
        notes: 'مانگی ئایار - کەمبوونەوەی خەرجی کارەبا',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '6',
        staffSalary: 18800000,
        expenses: 3400000,
        buildingRent: 2500000,
        dramaFee: 600000,
        socialSupport: 400000,
        electricity: 1800000,
        total: 27500000,
        notes: 'مانگی حوزەیران - زیادبوونی خەرجی سارکردنەوە',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '7',
        staffSalary: 15500000,
        expenses: 2200000,
        buildingRent: 2500000,
        dramaFee: 350000,
        socialSupport: 250000,
        electricity: 2200000,
        total: 23000000,
        notes: 'مانگی تەمموز - خەرجی کەم بەهۆی پشووی هاوین',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '8',
        staffSalary: 19200000,
        expenses: 3800000,
        buildingRent: 2500000,
        dramaFee: 650000,
        socialSupport: 450000,
        electricity: 2100000,
        total: 28700000,
        notes: 'مانگی ئاب - دەستپێکی ساڵی نوێی خوێندن',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '9',
        staffSalary: 19200000,
        expenses: 3200000,
        buildingRent: 2500000,
        dramaFee: 550000,
        socialSupport: 380000,
        electricity: 1600000,
        total: 27430000,
        notes: 'مانگی ئەیلوول - خەرجی ئاسایی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '10',
        staffSalary: 19200000,
        expenses: 3500000,
        buildingRent: 2500000,
        dramaFee: 600000,
        socialSupport: 420000,
        electricity: 1300000,
        total: 27520000,
        notes: 'مانگی تشرینی یەکەم - چالاکی زیاتر',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '11',
        staffSalary: 19200000,
        expenses: 2900000,
        buildingRent: 2500000,
        dramaFee: 500000,
        socialSupport: 350000,
        electricity: 1400000,
        total: 26850000,
        notes: 'مانگی تشرینی دووەم - ئامادەکردن بۆ زستان',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2025',
        month: '12',
        staffSalary: 19500000,
        expenses: 4200000,
        buildingRent: 2500000,
        dramaFee: 800000,
        socialSupport: 500000,
        electricity: 1800000,
        total: 29300000,
        notes: 'مانگی کانوونی یەکەم - جەژنی کریسمس و ساڵی نوێ',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2024',
        month: '12',
        staffSalary: 18000000,
        expenses: 3800000,
        buildingRent: 2300000,
        dramaFee: 700000,
        socialSupport: 400000,
        electricity: 1700000,
        total: 26900000,
        notes: 'مانگی کانوونی یەکەم ٢٠٢٤ - کۆتایی ساڵ',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2024',
        month: '11',
        staffSalary: 18000000,
        expenses: 2700000,
        buildingRent: 2300000,
        dramaFee: 450000,
        socialSupport: 300000,
        electricity: 1250000,
        total: 25000000,
        notes: 'مانگی تشرینی دووەم ٢٠٢٤ - خەرجی ئاسایی',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        year: '2024',
        month: '10',
        staffSalary: 18000000,
        expenses: 3100000,
        buildingRent: 2300000,
        dramaFee: 500000,
        socialSupport: 350000,
        electricity: 1200000,
        total: 25450000,
        notes: 'مانگی تشرینی یەکەم ٢٠٢٤ - چالاکی زیاتر',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert all VIP data
    await db.collection('teacher_info').insertMany(teacherInfo);
    await db.collection('employee_leaves').insertMany(employeeLeaves);
    await db.collection('bus_management').insertMany(busManagement);
    await db.collection('supervision').insertMany(supervision);
    await db.collection('supervised_students').insertMany(supervisedStudents);
    await db.collection('exam_supervision').insertMany(examSupervision);
    await db.collection('monthly_expenses').insertMany(monthlyExpenses);
    await db.collection('calendar_entries').insertMany(calendarEntries);
    await db.collection('staff_records').insertMany(staffRecords);
    await db.collection('teachers').insertMany(teachers);
    await db.collection('payroll').insertMany(payroll);
    await db.collection('activities').insertMany(activities);
    await db.collection('installments').insertMany(installments);
    await db.collection('building_expenses').insertMany(buildingExpenses);
    await db.collection('daily_accounts').insertMany(dailyAccounts);
    await db.collection('kitchen_expenses').insertMany(kitchenExpenses);
    await db.collection('student_permissions').insertMany(studentPermissions);

    console.log('\n🎉 ALL VIP COLLECTIONS SEEDED SUCCESSFULLY WITH CORRECT FIELD STRUCTURES!');
    console.log(`✅ ${teacherInfo.length} teacher info records added (زانیاری مامۆستا) - Includes bloodType field`);
    console.log(`✅ ${employeeLeaves.length} employee leaves records added (مۆڵەتی فەرمانبەران)`);
    console.log(`✅ ${busManagement.length} bus management records added (بەڕێوەبردنی پاس)`);
    console.log(`✅ ${supervision.length} supervision records added (چاودێری)`);
    console.log(`✅ ${supervisedStudents.length} supervised students records added (خوێندکاری چاودێری کراو)`);
    console.log(`✅ ${examSupervision.length} exam supervision records added (بەڕێوەبردنی چاودێریکردنی تاقیکردنەوە)`);
    console.log(`✅ ${monthlyExpenses.length} monthly expenses records added (خەرجی مانگانه)`);
    console.log(`✅ ${calendarEntries.length} calendar entries added (بەڕێوەبردنی ساڵنامە)`);
    console.log(`✅ ${staffRecords.length} staff records added (تۆمارەکانی ستاف) - Includes bloodType field`);
    console.log(`✅ ${teachers.length} teachers added (تۆماری مامۆستایان) - Includes bloodType and CV fields`);
    console.log(`✅ ${payroll.length} payroll records added (لیستی بڕی موچە)`);
    console.log(`✅ ${activities.length} activities added (چالاکی)`);
    console.log(`✅ ${installments.length} installments added (قیستی ساڵانە)`);
    console.log(`✅ ${buildingExpenses.length} building expenses added (مەسروفی بینا)`);
    console.log(`✅ ${dailyAccounts.length} daily accounts added (حساباتی رۆژانە) - Includes date field`);
    console.log(`✅ ${kitchenExpenses.length} kitchen expenses added (خەرجی خواردنگە) - Includes date and purpose fields`);
    console.log(`✅ ${studentPermissions.length} student permissions added (مۆڵەت)`);
    
    console.log('\n📊 ENHANCED DATA SUMMARY - Database seeded with new field structures:');
    console.log('- Blood Type Tracking: Added "جۆری خوێن" field to Teachers, Staff Records, and Teacher Information');
    console.log('- CV Data: Added comprehensive CV field to Teachers Records with education, experience, skills, and publications');
    console.log('- Date Management: Added "بەروار" field to Daily Accounts and Kitchen Expenses');
    console.log('- Purpose Field: Added "مەبەست" field to Kitchen Expenses for better expense tracking');
    console.log('- All field names now match frontend table column structures');
    console.log('- 15 records per collection with comprehensive data including new fields');
    console.log('- Kurdish/English bilingual content');
    console.log('- Ready for enhanced VIP application testing with new features');
    
  } catch (error) {
    console.error('❌ Error seeding VIP database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedVIPDatabase();
}

module.exports = seedVIPDatabase;