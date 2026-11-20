/**
 * FITZONE - Storage and Data Access Layer
 * Uses LocalStorage for seamless client-side persistence and reactivity
 */

const STORAGE_KEY = 'fitzone_gym_db_v1';

// Dynamic date generator helpers to guarantee real-time relevance
function _relDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

function _relDateTime(offsetDays = 0, timeStr = '18:00') {
  return `${_relDate(offsetDays)} ${timeStr}`;
}

// Function that generates default initial seed data
function buildInitialData() {
  return {
    settings: {
      gymName: "FITZONE Luxury Fitness & Wellness",
      shortName: "FITZONE",
      slogan: "BUILD YOUR STRONGER SELF",
      email: "info@fitzone-gym.com",
      phone: "+20 2 2795 4400",
      whatsapp: "+20 100 888 9911",
      address: "Plot 42, Sector 1, North 90th St, New Cairo, Egypt",
      city: "Cairo, Egypt",
      workingHours: "Saturday - Thursday: 06:00 AM - 12:00 AM | Friday: 08:00 AM - 10:00 PM",
      currency: "EGP",
      currencySymbol: "EGP",
      taxRate: 14,
      expirationAlertDays: 7,
      theme: "dark"
    },

    users: [
      {
        id: "usr-admin-1",
        email: "admin@fitzone.com",
        password: "admin123", // Simulated credentials
        name: "Captain Sherif El-Sayed",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        createdAt: _relDate(-300)
      },
      {
        id: "usr-client-1",
        email: "member@fitzone.com",
        password: "member123",
        name: "Ahmed Mansour",
        role: "client",
        memberId: "FZ-1001",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        createdAt: _relDate(-45)
      },
      {
        id: "usr-client-2",
        email: "mariam.kamal@gmail.com",
        password: "password123",
        name: "Mariam Kamal",
        role: "client",
        memberId: "FZ-1002",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        createdAt: _relDate(-90)
      }
    ],

    plans: [
      {
        id: "plan-1",
        name: "Basic Fitness",
        price: 500,
        durationMonths: 1,
        durationDays: 30,
        billingCycle: "Monthly",
        description: "Essential gym floor access, cardio theater and locker rooms during standard hours.",
        features: [
          "Full Gym Floor Access",
          "Cardio & Free Weights Zone",
          "Standard Locker & Showers",
          "1 Free Body Composition Scan",
          "Free Water & Wi-Fi Access"
        ],
        notIncluded: [
          "Group Fitness Classes",
          "Personal Trainer Sessions",
          "Spa & Sauna Access",
          "Guest Passes"
        ],
        badge: "Starter",
        popular: false,
        color: "#64748b"
      },
      {
        id: "plan-2",
        name: "Pro Fitness",
        price: 1300,
        durationMonths: 3,
        durationDays: 90,
        billingCycle: "3 Months",
        description: "Our most popular choice! Unlimited 24/7 access, group fitness classes and trainer consultations.",
        features: [
          "Unlimited 24/7 Gym Access",
          "All Group Fitness Classes (HIIT, Yoga, Zumba)",
          "Dedicated Locker & Sauna Access",
          "2 Free Personal Trainer Sessions",
          "Monthly InBody Scan & Diet Guide",
          "1 Free Guest Pass Per Month"
        ],
        notIncluded: [
          "Private VIP Locker",
          "Daily Towel Service"
        ],
        badge: "Most Popular",
        popular: true,
        color: "#ff5e14"
      },
      {
        id: "plan-3",
        name: "Gold Athlete",
        price: 2400,
        durationMonths: 6,
        durationDays: 180,
        billingCycle: "6 Months",
        description: "Designed for serious athletes who demand peak performance, cryo recovery and monthly PT sessions.",
        features: [
          "Full 24/7 All-Zone Access",
          "Unlimited All Classes & Workshops",
          "5 Personal Trainer Sessions Included",
          "Spa, Steam Room & Sauna Access",
          "Custom Nutrition & Macro Blueprint",
          "Towel Service & Private Lockers",
          "2 Guest Passes Per Month"
        ],
        notIncluded: [],
        badge: "Best Value",
        popular: false,
        color: "#eab308"
      },
      {
        id: "plan-4",
        name: "Elite VIP Annual",
        price: 4500,
        durationMonths: 12,
        durationDays: 365,
        billingCycle: "12 Months (Annual)",
        description: "The ultimate luxury fitness experience with unrestricted VIP perks, valet, and full wellness access.",
        features: [
          "VIP Unlimited 24/7 Access All Year",
          "12 One-on-One PT Sessions Included",
          "Unlimited All Classes (Priority Reservation)",
          "Complete Wellness: Spa, Cryotherapy & Massage",
          "Free FITZONE Pro Merchandise Starter Kit",
          "Custom Monthly Meal Plan & Macro Adjustments",
          "Unlimited Guest Passes (1 per visit)",
          "Complimentary Valet Parking"
        ],
        notIncluded: [],
        badge: "VIP Elite",
        popular: false,
        color: "#8b5cf6"
      }
    ],

    trainers: [
      {
        id: "TR-101",
        name: "Captain Omar Farouk",
        title: "Head of Strength & Conditioning",
        email: "omar.f@fitzone.com",
        phone: "+20 100 234 5671",
        experienceYears: 9,
        workingHours: "07:00 AM - 03:00 PM",
        availability: "Available",
        specialization: "Olympic Lifting & Powerlifting",
        bio: "Former national weightlifting champion and certified CSCS trainer with over 9 years of elite athlete conditioning experience.",
        image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80",
        rating: 4.9,
        assignedCount: 14
      },
      {
        id: "TR-102",
        name: "Layla Hassan",
        title: "HIIT, Zumba & Female Conditioning Lead",
        email: "layla.h@fitzone.com",
        phone: "+20 101 876 5432",
        experienceYears: 6,
        workingHours: "09:00 AM - 05:00 PM",
        availability: "Available",
        specialization: "High Intensity Cardio & Dance Fitness",
        bio: "ACE certified instructor specializing in fat loss transformations, energetic group choreography, and functional mobility.",
        image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&auto=format&fit=crop&q=80",
        rating: 5.0,
        assignedCount: 19
      },
      {
        id: "TR-103",
        name: "Tarek El-Masry",
        title: "Bodybuilding & Hypertrophy Coach",
        email: "tarek.m@fitzone.com",
        phone: "+20 102 345 6789",
        experienceYears: 11,
        workingHours: "02:00 PM - 10:00 PM",
        availability: "Busy",
        specialization: "Hypertrophy & Contest Preparation",
        bio: "IFBB PRO Master Trainer who has transformed hundreds of physique competitors and helped hundreds achieve lean muscle mass.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        rating: 4.8,
        assignedCount: 23
      },
      {
        id: "TR-104",
        name: "Nourhan Adel",
        title: "Yoga, Mobility & Functional Rehab",
        email: "nourhan.a@fitzone.com",
        phone: "+20 103 456 7890",
        experienceYears: 5,
        workingHours: "08:00 AM - 04:00 PM",
        availability: "Available",
        specialization: "Vinyasa Yoga, Posture & Recovery",
        bio: "500-Hour RYT Yoga Master dedicated to corrective movement, core stability, breathwork and sports injury recovery.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
        rating: 4.9,
        assignedCount: 11
      },
      {
        id: "TR-105",
        name: "Karim Zaki",
        title: "CrossFit Level 2 & Boxing Coach",
        email: "karim.z@fitzone.com",
        phone: "+20 104 567 8901",
        experienceYears: 7,
        workingHours: "01:00 PM - 09:00 PM",
        availability: "Available",
        specialization: "CrossFit, Striking & Endurance",
        bio: "Former amateur boxer with high-intensity endurance mastery. Leads our intense FITZONE Combat & MetCon classes.",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
        rating: 4.9,
        assignedCount: 16
      }
    ],

    // 20 realistic members with dynamically synced dates
    members: [
      {
        id: "FZ-1001",
        name: "Ahmed Mansour",
        email: "member@fitzone.com",
        phone: "+20 100 123 4567",
        gender: "Male",
        dob: "1994-05-14",
        address: "First Settlement, New Cairo",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-45),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-45),
        expireDate: _relDate(45),
        status: "Active",
        assignedTrainerId: "TR-101",
        assignedTrainerName: "Captain Omar Farouk",
        workoutPlanId: "wp-2",
        workoutPlanName: "Hypertrophy Push / Pull / Legs",
        measurements: [
          { date: _relDate(-45), weight: 84.5, height: 178, chest: 104, waist: 88, arms: 38, bodyFat: 19.5 },
          { date: _relDate(-25), weight: 83.0, height: 178, chest: 105, waist: 86, arms: 38.5, bodyFat: 18.2 },
          { date: _relDate(-5), weight: 81.8, height: 178, chest: 106, waist: 84, arms: 39.0, bodyFat: 17.0 }
        ]
      },
      {
        id: "FZ-1002",
        name: "Mariam Kamal",
        email: "mariam.kamal@gmail.com",
        phone: "+20 101 234 5678",
        gender: "Female",
        dob: "1997-08-22",
        address: "Degla, Maadi, Cairo",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-90),
        planId: "plan-4",
        planName: "Elite VIP Annual",
        startDate: _relDate(-90),
        expireDate: _relDate(275),
        status: "Active",
        assignedTrainerId: "TR-102",
        assignedTrainerName: "Layla Hassan",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-90), weight: 68.0, height: 165, chest: 92, waist: 76, arms: 29, bodyFat: 27.5 },
          { date: _relDate(-40), weight: 64.2, height: 165, chest: 90, waist: 71, arms: 28.5, bodyFat: 23.8 },
          { date: _relDate(-10), weight: 60.5, height: 165, chest: 88, waist: 67, arms: 28.0, bodyFat: 20.4 }
        ]
      },
      {
        id: "FZ-1003",
        name: "Youssef Ibrahim",
        email: "youssef.ibrahim@yahoo.com",
        phone: "+20 102 345 6789",
        gender: "Male",
        dob: "1991-11-30",
        address: "Beverly Hills, Sheikh Zayed",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-60),
        planId: "plan-3",
        planName: "Gold Athlete",
        startDate: _relDate(-60),
        expireDate: _relDate(120),
        status: "Active",
        assignedTrainerId: "TR-103",
        assignedTrainerName: "Tarek El-Masry",
        workoutPlanId: "wp-3",
        workoutPlanName: "Powerlifting Strength Foundation",
        measurements: [
          { date: _relDate(-60), weight: 92.0, height: 182, chest: 112, waist: 90, arms: 42, bodyFat: 18.0 },
          { date: _relDate(-15), weight: 94.5, height: 182, chest: 115, waist: 89, arms: 43.5, bodyFat: 17.5 }
        ]
      },
      {
        id: "FZ-1004",
        name: "Salma Sherif",
        email: "salma.sherif@outlook.com",
        phone: "+20 109 456 7890",
        gender: "Female",
        dob: "1999-03-17",
        address: "Zamalek, Cairo",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-95),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-95),
        expireDate: _relDate(-5),
        status: "Expired",
        assignedTrainerId: "TR-104",
        assignedTrainerName: "Nourhan Adel",
        workoutPlanId: "wp-4",
        workoutPlanName: "Beginner Total Body Conditioning",
        measurements: [
          { date: _relDate(-95), weight: 58.0, height: 162, chest: 85, waist: 68, arms: 26, bodyFat: 22.0 }
        ]
      },
      {
        id: "FZ-1005",
        name: "Mahmoud Hassan",
        email: "m.hassan@vodafone.com",
        phone: "+20 100 987 6543",
        gender: "Male",
        dob: "1988-09-04",
        address: "Heliopolis, Cairo",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-70),
        planId: "plan-4",
        planName: "Elite VIP Annual",
        startDate: _relDate(-70),
        expireDate: _relDate(295),
        status: "Active",
        assignedTrainerId: "TR-101",
        assignedTrainerName: "Captain Omar Farouk",
        workoutPlanId: "wp-2",
        workoutPlanName: "Hypertrophy Push / Pull / Legs",
        measurements: [
          { date: _relDate(-70), weight: 89.0, height: 175, chest: 108, waist: 92, arms: 40, bodyFat: 21.0 },
          { date: _relDate(-18), weight: 86.2, height: 175, chest: 109, waist: 88, arms: 40.5, bodyFat: 18.5 }
        ]
      },
      {
        id: "FZ-1006",
        name: "Dina Abdelaziz",
        email: "dina.aziz@gmail.com",
        phone: "+20 106 321 4567",
        gender: "Female",
        dob: "1995-12-10",
        address: "Fifth Settlement, New Cairo",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-12),
        planId: "plan-1",
        planName: "Basic Fitness",
        startDate: _relDate(-12),
        expireDate: _relDate(18),
        status: "Active",
        assignedTrainerId: null,
        assignedTrainerName: "None",
        workoutPlanId: "wp-4",
        workoutPlanName: "Beginner Total Body Conditioning",
        measurements: [
          { date: _relDate(-12), weight: 62.0, height: 168, chest: 88, waist: 72, arms: 27, bodyFat: 24.0 }
        ]
      },
      {
        id: "FZ-1007",
        name: "Karim Fouad",
        email: "karim.fouad@aucegypt.edu",
        phone: "+20 111 234 5678",
        gender: "Male",
        dob: "2000-01-25",
        address: "Rehab City, Cairo",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-40),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-40),
        expireDate: _relDate(50),
        status: "Active",
        assignedTrainerId: "TR-105",
        assignedTrainerName: "Karim Zaki",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-40), weight: 77.0, height: 180, chest: 99, waist: 82, arms: 36, bodyFat: 16.5 }
        ]
      },
      {
        id: "FZ-1008",
        name: "Nour El-Din",
        email: "nour.eldin@pharmamail.com",
        phone: "+20 122 345 6789",
        gender: "Male",
        dob: "1993-07-08",
        address: "Mohandessin, Giza",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-50),
        planId: "plan-1",
        planName: "Basic Fitness",
        startDate: _relDate(-50),
        expireDate: _relDate(-20),
        status: "Expired",
        assignedTrainerId: null,
        assignedTrainerName: "None",
        workoutPlanId: "wp-4",
        workoutPlanName: "Beginner Total Body Conditioning",
        measurements: [
          { date: _relDate(-50), weight: 80.0, height: 174, chest: 101, waist: 85, arms: 37, bodyFat: 20.0 }
        ]
      },
      {
        id: "FZ-1009",
        name: "Farida Mohsen",
        email: "farida.m@artstudio.eg",
        phone: "+20 102 789 1234",
        gender: "Female",
        dob: "1998-04-19",
        address: "Dokki, Giza",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-55),
        planId: "plan-3",
        planName: "Gold Athlete",
        startDate: _relDate(-55),
        expireDate: _relDate(125),
        status: "Active",
        assignedTrainerId: "TR-104",
        assignedTrainerName: "Nourhan Adel",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-55), weight: 61.5, height: 167, chest: 87, waist: 70, arms: 27, bodyFat: 23.5 }
        ]
      },
      {
        id: "FZ-1010",
        name: "Mostafa Gad",
        email: "mostafa.gad@eng.com",
        phone: "+20 100 456 1122",
        gender: "Male",
        dob: "1986-10-15",
        address: "Nasr City, Cairo",
        photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-22),
        planId: "plan-3",
        planName: "Gold Athlete",
        startDate: _relDate(-22),
        expireDate: _relDate(158),
        status: "Active",
        assignedTrainerId: "TR-103",
        assignedTrainerName: "Tarek El-Masry",
        workoutPlanId: "wp-2",
        workoutPlanName: "Hypertrophy Push / Pull / Legs",
        measurements: [
          { date: _relDate(-22), weight: 88.0, height: 176, chest: 107, waist: 90, arms: 41, bodyFat: 19.0 }
        ]
      },
      {
        id: "FZ-1011",
        name: "Aya Radwan",
        email: "aya.radwan@fintech.eg",
        phone: "+20 101 999 8877",
        gender: "Female",
        dob: "1996-02-28",
        address: "Mirage City, New Cairo",
        photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-93),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-93),
        expireDate: _relDate(-3),
        status: "Expired",
        assignedTrainerId: "TR-102",
        assignedTrainerName: "Layla Hassan",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-93), weight: 65.0, height: 170, chest: 91, waist: 74, arms: 29, bodyFat: 25.0 }
        ]
      },
      {
        id: "FZ-1012",
        name: "Sherif Nazmy",
        email: "sherif.nazmy@lawcorp.com",
        phone: "+20 114 555 6677",
        gender: "Male",
        dob: "1983-06-12",
        address: "Palm Hills, October City",
        photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-80),
        planId: "plan-4",
        planName: "Elite VIP Annual",
        startDate: _relDate(-80),
        expireDate: _relDate(285),
        status: "Active",
        assignedTrainerId: "TR-101",
        assignedTrainerName: "Captain Omar Farouk",
        workoutPlanId: "wp-3",
        workoutPlanName: "Powerlifting Strength Foundation",
        measurements: [
          { date: _relDate(-80), weight: 95.0, height: 185, chest: 114, waist: 94, arms: 43, bodyFat: 20.0 }
        ]
      },
      {
        id: "FZ-1013",
        name: "Hala Zaher",
        email: "hala.zaher@gmail.com",
        phone: "+20 109 888 1234",
        gender: "Female",
        dob: "2001-09-18",
        address: "Madinaty, Cairo",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-38),
        planId: "plan-1",
        planName: "Basic Fitness",
        startDate: _relDate(-38),
        expireDate: _relDate(-8),
        status: "Expired",
        assignedTrainerId: null,
        assignedTrainerName: "None",
        workoutPlanId: "wp-4",
        workoutPlanName: "Beginner Total Body Conditioning",
        measurements: [
          { date: _relDate(-38), weight: 55.0, height: 160, chest: 84, waist: 66, arms: 25, bodyFat: 21.0 }
        ]
      },
      {
        id: "FZ-1014",
        name: "Hussein Kamel",
        email: "h.kamel@archistudio.com",
        phone: "+20 106 112 3344",
        gender: "Male",
        dob: "1992-03-30",
        address: "Shorouk City, Cairo",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-18),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-18),
        expireDate: _relDate(72),
        status: "Active",
        assignedTrainerId: "TR-105",
        assignedTrainerName: "Karim Zaki",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-18), weight: 82.0, height: 179, chest: 103, waist: 86, arms: 38, bodyFat: 18.5 }
        ]
      },
      {
        id: "FZ-1015",
        name: "Reem Samir",
        email: "reem.samir@mediahub.eg",
        phone: "+20 120 777 6655",
        gender: "Female",
        dob: "1997-10-05",
        address: "Sheraton, Heliopolis",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-30),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-30),
        expireDate: _relDate(60),
        status: "Active",
        assignedTrainerId: "TR-102",
        assignedTrainerName: "Layla Hassan",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-30), weight: 59.0, height: 166, chest: 86, waist: 69, arms: 26, bodyFat: 22.5 }
        ]
      },
      {
        id: "FZ-1016",
        name: "Ziad El-Shamy",
        email: "ziad.shamy@gmail.com",
        phone: "+20 101 443 2211",
        gender: "Male",
        dob: "1999-12-14",
        address: "Katameya Heights, New Cairo",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-65),
        planId: "plan-3",
        planName: "Gold Athlete",
        startDate: _relDate(-65),
        expireDate: _relDate(115),
        status: "Active",
        assignedTrainerId: "TR-103",
        assignedTrainerName: "Tarek El-Masry",
        workoutPlanId: "wp-2",
        workoutPlanName: "Hypertrophy Push / Pull / Legs",
        measurements: [
          { date: _relDate(-65), weight: 75.0, height: 177, chest: 98, waist: 80, arms: 36, bodyFat: 15.0 }
        ]
      },
      {
        id: "FZ-1017",
        name: "Nadine Badr",
        email: "nadine.badr@designco.com",
        phone: "+20 100 876 5123",
        gender: "Female",
        dob: "1994-01-09",
        address: "Garden City, Cairo",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-8),
        planId: "plan-1",
        planName: "Basic Fitness",
        startDate: _relDate(-8),
        expireDate: _relDate(22),
        status: "Active",
        assignedTrainerId: null,
        assignedTrainerName: "None",
        workoutPlanId: "wp-4",
        workoutPlanName: "Beginner Total Body Conditioning",
        measurements: [
          { date: _relDate(-8), weight: 63.5, height: 169, chest: 89, waist: 73, arms: 28, bodyFat: 24.5 }
        ]
      },
      {
        id: "FZ-1018",
        name: "Khaled El-Sayed",
        email: "khaled.sayed@gmail.com",
        phone: "+20 115 889 9001",
        gender: "Male",
        dob: "1990-08-16",
        address: "Mivida, New Cairo",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-4),
        planId: "plan-2",
        planName: "Pro Fitness",
        startDate: _relDate(-4),
        expireDate: _relDate(86),
        status: "Active",
        assignedTrainerId: "TR-101",
        assignedTrainerName: "Captain Omar Farouk",
        workoutPlanId: "wp-2",
        workoutPlanName: "Hypertrophy Push / Pull / Legs",
        measurements: [
          { date: _relDate(-4), weight: 86.0, height: 181, chest: 106, waist: 89, arms: 39, bodyFat: 19.0 }
        ]
      },
      {
        id: "FZ-1019",
        name: "Mona Shawky",
        email: "mona.shawky@outlook.com",
        phone: "+20 109 332 2110",
        gender: "Female",
        dob: "1993-05-24",
        address: "Agouza, Giza",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-14),
        planId: "plan-3",
        planName: "Gold Athlete",
        startDate: _relDate(-14),
        expireDate: _relDate(166),
        status: "Active",
        assignedTrainerId: "TR-104",
        assignedTrainerName: "Nourhan Adel",
        workoutPlanId: "wp-1",
        workoutPlanName: "High-Intensity Weight Loss",
        measurements: [
          { date: _relDate(-14), weight: 67.0, height: 164, chest: 93, waist: 77, arms: 29.5, bodyFat: 26.5 }
        ]
      },
      {
        id: "FZ-1020",
        name: "Tamer Barakat",
        email: "tamer.barakat@invest.eg",
        phone: "+20 102 667 8899",
        gender: "Male",
        dob: "1985-02-11",
        address: "Allegria, Sheikh Zayed",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
        registrationDate: _relDate(-2),
        planId: "plan-4",
        planName: "Elite VIP Annual",
        startDate: _relDate(-2),
        expireDate: _relDate(363),
        status: "Active",
        assignedTrainerId: "TR-103",
        assignedTrainerName: "Tarek El-Masry",
        workoutPlanId: "wp-3",
        workoutPlanName: "Powerlifting Strength Foundation",
        measurements: [
          { date: _relDate(-2), weight: 91.5, height: 183, chest: 110, waist: 91, arms: 41.5, bodyFat: 19.5 }
        ]
      }
    ],

    classes: [
      {
        id: "cls-101",
        title: "CrossFit MetCon & Core",
        category: "CrossFit",
        trainerId: "TR-105",
        trainerName: "Karim Zaki",
        schedule: "Mon, Wed & Fri • 06:00 PM",
        time: "18:00",
        durationMin: 60,
        capacity: 16,
        bookedMembers: ["FZ-1001", "FZ-1007", "FZ-1014", "FZ-1016"],
        room: "The CrossFit Arena (Studio 1)",
        level: "Intermediate / Advanced",
        caloriesBurn: "650 - 850 kcal",
        description: "High-power functional workout combining Olympic lifting, kettlebells, rowing sprints and intense core finisher.",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "cls-102",
        title: "Power Vinyasa Yoga & Flow",
        category: "Yoga",
        trainerId: "TR-104",
        trainerName: "Nourhan Adel",
        schedule: "Sun, Tue & Thu • 09:00 AM",
        time: "09:00",
        durationMin: 75,
        capacity: 20,
        bookedMembers: ["FZ-1002", "FZ-1009", "FZ-1015", "FZ-1019"],
        room: "Zen Mind & Body Studio (Studio 3)",
        level: "All Levels",
        caloriesBurn: "300 - 450 kcal",
        description: "Synchronize breath with dynamic fluid postures. Builds deep core balance, joint mobility and mental clarity.",
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "cls-103",
        title: "HIIT Inferno Cardio Shred",
        category: "HIIT",
        trainerId: "TR-102",
        trainerName: "Layla Hassan",
        schedule: "Everyday • 05:00 PM",
        time: "17:00",
        durationMin: 45,
        capacity: 18,
        bookedMembers: ["FZ-1001", "FZ-1002", "FZ-1006", "FZ-1015"],
        room: "HIIT Zone & Turf (Studio 2)",
        level: "All Levels",
        caloriesBurn: "550 - 750 kcal",
        description: "Interval sprints, plyometrics, battle ropes and agility ladders engineered for maximum EPOC post-workout calorie burn.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "cls-104",
        title: "Zumba Dance Fiesta",
        category: "Zumba",
        trainerId: "TR-102",
        trainerName: "Layla Hassan",
        schedule: "Mon & Thu • 07:30 PM",
        time: "19:30",
        durationMin: 60,
        capacity: 25,
        bookedMembers: ["FZ-1002", "FZ-1004", "FZ-1015"],
        room: "Main Aerobics Hall",
        level: "Beginner Friendly",
        caloriesBurn: "500 - 700 kcal",
        description: "High-energy Latin, Afrobeat and international dance rhythms that make cardio feel like an epic party.",
        image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "cls-105",
        title: "Combat Boxing & Heavy Bag",
        category: "Boxing",
        trainerId: "TR-105",
        trainerName: "Karim Zaki",
        schedule: "Tue, Thu & Sat • 08:00 PM",
        time: "20:00",
        durationMin: 60,
        capacity: 14,
        bookedMembers: ["FZ-1003", "FZ-1007", "FZ-1014", "FZ-1018"],
        room: "Combat Boxing Ring & Bags",
        level: "Intermediate",
        caloriesBurn: "700 - 900 kcal",
        description: "Combination punching drills, footwork, speed bag work, and defensive slips for elite cardiovascular power.",
        image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "cls-106",
        title: "Reformer Pilates & Core Sculpt",
        category: "Pilates",
        trainerId: "TR-104",
        trainerName: "Nourhan Adel",
        schedule: "Sat & Wed • 11:00 AM",
        time: "11:00",
        durationMin: 55,
        capacity: 10,
        bookedMembers: ["FZ-1002", "FZ-1009", "FZ-1017"],
        room: "Pilates Reformer Studio",
        level: "All Levels",
        caloriesBurn: "350 - 500 kcal",
        description: "Precise resistance movements on Reformer machines targeting deep pelvic, spinal and abdominal stabilization.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
      }
    ],

    attendance: [
      {
        id: "att-101",
        memberId: "FZ-1001",
        memberName: "Ahmed Mansour",
        memberPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(0, '18:30'),
        checkOutTime: null,
        status: "Checked In",
        date: _relDate(0),
        method: "QR Scanner"
      },
      {
        id: "att-102",
        memberId: "FZ-1003",
        memberName: "Youssef Ibrahim",
        memberPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        planName: "Gold Athlete",
        checkInTime: _relDateTime(0, '19:15'),
        checkOutTime: null,
        status: "Checked In",
        date: _relDate(0),
        method: "Manual Check-in"
      },
      {
        id: "att-103",
        memberId: "FZ-1005",
        memberName: "Mahmoud Hassan",
        memberPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        planName: "Elite VIP Annual",
        checkInTime: _relDateTime(0, '17:00'),
        checkOutTime: _relDateTime(0, '18:45'),
        status: "Completed",
        durationMin: 105,
        date: _relDate(0),
        method: "QR Scanner"
      },
      {
        id: "att-104",
        memberId: "FZ-1007",
        memberName: "Karim Fouad",
        memberPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(0, '16:30'),
        checkOutTime: _relDateTime(0, '17:50'),
        status: "Completed",
        durationMin: 80,
        date: _relDate(0),
        method: "QR Scanner"
      },
      {
        id: "att-105",
        memberId: "FZ-1010",
        memberName: "Mostafa Gad",
        memberPhoto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        planName: "Gold Athlete",
        checkInTime: _relDateTime(0, '20:00'),
        checkOutTime: null,
        status: "Checked In",
        date: _relDate(0),
        method: "Manual Check-in"
      },
      {
        id: "att-106",
        memberId: "FZ-1002",
        memberName: "Mariam Kamal",
        memberPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        planName: "Elite VIP Annual",
        checkInTime: _relDateTime(-1, '09:15'),
        checkOutTime: _relDateTime(-1, '10:45'),
        status: "Completed",
        durationMin: 90,
        date: _relDate(-1),
        method: "QR Scanner"
      },
      {
        id: "att-107",
        memberId: "FZ-1014",
        memberName: "Hussein Kamel",
        memberPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(-1, '18:00'),
        checkOutTime: _relDateTime(-1, '19:25'),
        status: "Completed",
        durationMin: 85,
        date: _relDate(-1),
        method: "Manual Check-in"
      },
      {
        id: "att-108",
        memberId: "FZ-1016",
        memberName: "Ziad El-Shamy",
        memberPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        planName: "Gold Athlete",
        checkInTime: _relDateTime(-1, '17:10'),
        checkOutTime: _relDateTime(-1, '18:35'),
        status: "Completed",
        durationMin: 85,
        date: _relDate(-1),
        method: "QR Scanner"
      },
      {
        id: "att-109",
        memberId: "FZ-1018",
        memberName: "Khaled El-Sayed",
        memberPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(-2, '19:30'),
        checkOutTime: _relDateTime(-2, '21:00'),
        status: "Completed",
        durationMin: 90,
        date: _relDate(-2),
        method: "Manual Check-in"
      },
      {
        id: "att-110",
        memberId: "FZ-1020",
        memberName: "Tamer Barakat",
        memberPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        planName: "Elite VIP Annual",
        checkInTime: _relDateTime(-2, '20:15'),
        checkOutTime: _relDateTime(-2, '21:45'),
        status: "Completed",
        durationMin: 90,
        date: _relDate(-2),
        method: "QR Scanner"
      },
      {
        id: "att-111",
        memberId: "FZ-1001",
        memberName: "Ahmed Mansour",
        memberPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(-3, '18:00'),
        checkOutTime: _relDateTime(-3, '19:30'),
        status: "Completed",
        durationMin: 90,
        date: _relDate(-3),
        method: "QR Scanner"
      },
      {
        id: "att-112",
        memberId: "FZ-1005",
        memberName: "Mahmoud Hassan",
        memberPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        planName: "Elite VIP Annual",
        checkInTime: _relDateTime(-3, '07:30'),
        checkOutTime: _relDateTime(-3, '09:00'),
        status: "Completed",
        durationMin: 90,
        date: _relDate(-3),
        method: "QR Scanner"
      },
      {
        id: "att-113",
        memberId: "FZ-1007",
        memberName: "Karim Fouad",
        memberPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
        planName: "Pro Fitness",
        checkInTime: _relDateTime(-4, '17:45'),
        checkOutTime: _relDateTime(-4, '19:10'),
        status: "Completed",
        durationMin: 85,
        date: _relDate(-4),
        method: "Manual Check-in"
      },
      {
        id: "att-114",
        memberId: "FZ-1009",
        memberName: "Farida Mohsen",
        memberPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        planName: "Gold Athlete",
        checkInTime: _relDateTime(-4, '10:00'),
        checkOutTime: _relDateTime(-4, '11:20'),
        status: "Completed",
        durationMin: 80,
        date: _relDate(-4),
        method: "QR Scanner"
      },
      {
        id: "att-115",
        memberId: "FZ-1012",
        memberName: "Sherif Nazmy",
        memberPhoto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80",
        planName: "Elite VIP Annual",
        checkInTime: _relDateTime(-5, '18:15'),
        checkOutTime: _relDateTime(-5, '20:00'),
        status: "Completed",
        durationMin: 105,
        date: _relDate(-5),
        method: "Manual Check-in"
      }
    ],

    payments: [
      {
        id: "INV-2024-1001",
        memberId: "FZ-1001",
        memberName: "Ahmed Mansour",
        amount: 1300,
        currency: "EGP",
        planId: "plan-2",
        planName: "Pro Fitness (3 Months)",
        date: _relDate(-45),
        time: "14:22",
        method: "Visa Card",
        status: "Paid",
        transactionId: "TXN-EGY-984210",
        receivedBy: "Sherif El-Sayed (Admin)",
        notes: "Quarterly enrollment with card"
      },
      {
        id: "INV-2024-1002",
        memberId: "FZ-1002",
        memberName: "Mariam Kamal",
        amount: 4500,
        currency: "EGP",
        planId: "plan-4",
        planName: "Elite VIP Annual (12 Months)",
        date: _relDate(-90),
        time: "11:05",
        method: "Mastercard",
        status: "Paid",
        transactionId: "TXN-EGY-442190",
        receivedBy: "Sherif El-Sayed (Admin)",
        notes: "Annual full package upfront"
      },
      {
        id: "INV-2024-1003",
        memberId: "FZ-1003",
        memberName: "Youssef Ibrahim",
        amount: 2400,
        currency: "EGP",
        planId: "plan-3",
        planName: "Gold Athlete (6 Months)",
        date: _relDate(-60),
        time: "16:40",
        method: "InstaPay",
        status: "Paid",
        transactionId: "IP-FZ-781204",
        receivedBy: "Front Desk Cashier",
        notes: "Direct bank instant payment"
      },
      {
        id: "INV-2024-1004",
        memberId: "FZ-1005",
        memberName: "Mahmoud Hassan",
        amount: 4500,
        currency: "EGP",
        planId: "plan-4",
        planName: "Elite VIP Annual (12 Months)",
        date: _relDate(-70),
        time: "18:10",
        method: "Visa Card",
        status: "Paid",
        transactionId: "TXN-EGY-881230",
        receivedBy: "Sherif El-Sayed (Admin)",
        notes: "VIP package renewal"
      },
      {
        id: "INV-2024-1005",
        memberId: "FZ-1007",
        memberName: "Karim Fouad",
        amount: 1300,
        currency: "EGP",
        planId: "plan-2",
        planName: "Pro Fitness (3 Months)",
        date: _relDate(-40),
        time: "19:00",
        method: "Vodafone Cash",
        status: "Paid",
        transactionId: "VF-CASH-339182",
        receivedBy: "Front Desk Cashier",
        notes: "Mobile wallet transfer"
      },
      {
        id: "INV-2024-1006",
        memberId: "FZ-1009",
        memberName: "Farida Mohsen",
        amount: 2400,
        currency: "EGP",
        planId: "plan-3",
        planName: "Gold Athlete (6 Months)",
        date: _relDate(-55),
        time: "12:15",
        method: "Cash",
        status: "Paid",
        transactionId: "CSH-REC-001928",
        receivedBy: "Front Desk Cashier",
        notes: "Cash payment at reception"
      },
      {
        id: "INV-2024-1007",
        memberId: "FZ-1010",
        memberName: "Mostafa Gad",
        amount: 2400,
        currency: "EGP",
        planId: "plan-3",
        planName: "Gold Athlete (6 Months)",
        date: _relDate(-22),
        time: "15:45",
        method: "InstaPay",
        status: "Paid",
        transactionId: "IP-FZ-901824",
        receivedBy: "Sherif El-Sayed (Admin)",
        notes: "InstaPay confirmed"
      },
      {
        id: "INV-2024-1008",
        memberId: "FZ-1018",
        memberName: "Khaled El-Sayed",
        amount: 1300,
        currency: "EGP",
        planId: "plan-2",
        planName: "Pro Fitness (3 Months)",
        date: _relDate(-4),
        time: "17:30",
        method: "Visa Card",
        status: "Paid",
        transactionId: "TXN-EGY-510928",
        receivedBy: "Front Desk Cashier",
        notes: "New member enrollment"
      },
      {
        id: "INV-2024-1009",
        memberId: "FZ-1020",
        memberName: "Tamer Barakat",
        amount: 4500,
        currency: "EGP",
        planId: "plan-4",
        planName: "Elite VIP Annual (12 Months)",
        date: _relDate(-2),
        time: "13:00",
        method: "Mastercard",
        status: "Paid",
        transactionId: "TXN-EGY-773901",
        receivedBy: "Sherif El-Sayed (Admin)",
        notes: "Corporate executive signup"
      },
      {
        id: "INV-2024-1010",
        memberId: "FZ-1004",
        memberName: "Salma Sherif",
        amount: 1300,
        currency: "EGP",
        planId: "plan-2",
        planName: "Pro Fitness (Renewal Due)",
        date: _relDate(-4),
        time: "10:00",
        method: "Pending",
        status: "Pending",
        transactionId: "PENDING-0010",
        receivedBy: "System Reminder",
        notes: "Membership expired 5 days ago. Renewal invoice generated."
      }
    ],

    workouts: [
      {
        id: "wp-1",
        title: "High-Intensity Weight Loss & Tone",
        category: "Weight Loss",
        difficulty: "Intermediate",
        daysPerWeek: 4,
        targetGoal: "Accelerate metabolic burn, tone lean muscle, drop body fat %",
        description: "A fast-paced circuit program emphasizing high work capacity, kettlebell complexes, rowing intervals, and abdominal strengthening.",
        assignedMembersCount: 7,
        exercises: [
          { name: "Barbell Romanian Deadlift", muscle: "Hamstrings & Glutes", sets: 4, reps: "12-15", restSec: 45, notes: "Focus on hip hinge and flat spine" },
          { name: "Dumbbell Thrusters", muscle: "Full Body / Delts", sets: 4, reps: "15", restSec: 45, notes: "Deep squat into overhead press" },
          { name: "Kettlebell Swings", muscle: "Posterior Chain", sets: 4, reps: "20", restSec: 30, notes: "Explosive hip drive, keep chest proud" },
          { name: "Assault Air Bike Sprints", muscle: "Cardio Conditioning", sets: 5, reps: "30s sprint / 30s rest", restSec: 30, notes: "Max calorie RPM effort" },
          { name: "Hanging Leg Raises", muscle: "Core / Abs", sets: 3, reps: "15", restSec: 45, notes: "Avoid swinging, curl pelvis up" },
          { name: "Plank to Push-Up", muscle: "Chest, Triceps & Core", sets: 3, reps: "12 per side", restSec: 45, notes: "Keep hips level without rocking" }
        ]
      },
      {
        id: "wp-2",
        title: "Hypertrophy Push / Pull / Legs",
        category: "Muscle Building",
        difficulty: "Advanced",
        daysPerWeek: 5,
        targetGoal: "Maximum muscle hypertrophy and aesthetic symmetry",
        description: "Classic bodybuilding split designed to stimulate muscle protein synthesis across all major muscle groups twice a week.",
        assignedMembersCount: 8,
        exercises: [
          { name: "Incline Barbell Bench Press", muscle: "Upper Chest", sets: 4, reps: "8-10", restSec: 90, notes: "Control 3-second eccentric tempo" },
          { name: "Standing Overhead Military Press", muscle: "Anterior Deltoids", sets: 4, reps: "8-10", restSec: 90, notes: "Brace core and glutes firmly" },
          { name: "Weighted Pull-Ups / Lat Pulldown", muscle: "Latissimus Dorsi", sets: 4, reps: "10-12", restSec: 90, notes: "Drive elbows down to waist" },
          { name: "Chest Supported T-Bar Row", muscle: "Mid-Back & Rhomboids", sets: 4, reps: "10-12", restSec: 75, notes: "Pause 1 second at full squeeze" },
          { name: "Barbell Back Squats", muscle: "Quadriceps & Glutes", sets: 4, reps: "8-10", restSec: 120, notes: "Hit parallel with vertical torso" },
          { name: "Incline Dumbbell Bicep Curls", muscle: "Biceps", sets: 3, reps: "12", restSec: 60, notes: "Deep stretch at bottom position" },
          { name: "Cable Overhead Tricep Extension", muscle: "Triceps Long Head", sets: 3, reps: "12-15", restSec: 60, notes: "Full lock and controlled stretch" }
        ]
      },
      {
        id: "wp-3",
        title: "Powerlifting Strength Foundation",
        category: "Strength Training",
        difficulty: "Advanced",
        daysPerWeek: 4,
        targetGoal: "Develop raw neuromuscular force on the Big 3 lifts",
        description: "Periodized strength training focused on the Squat, Bench Press, and Deadlift with progressive overload calculations.",
        assignedMembersCount: 4,
        exercises: [
          { name: "Competition Low Bar Squat", muscle: "Full Lower Body", sets: 5, reps: "5", restSec: 180, notes: "Work up to 80% 1RM" },
          { name: "Pause Flat Bench Press", muscle: "Pectorals & Triceps", sets: 5, reps: "5", restSec: 180, notes: "1-second motionless pause on chest" },
          { name: "Conventional Barbell Deadlift", muscle: "Erectors & Hamstrings", sets: 4, reps: "3-5", restSec: 180, notes: "Reset breath each repetition" },
          { name: "Barbell Pendlay Rows", muscle: "Upper Back", sets: 4, reps: "6-8", restSec: 90, notes: "Pull from dead floor stop" },
          { name: "Bulgarian Split Squats", muscle: "Quads & Unilateral Balance", sets: 3, reps: "8 per leg", restSec: 75, notes: "Dumbbells at side" }
        ]
      },
      {
        id: "wp-4",
        title: "Beginner Total Body Conditioning",
        category: "Beginner",
        difficulty: "Beginner",
        daysPerWeek: 3,
        targetGoal: "Establish fundamental movement patterns, joint integrity & cardio base",
        description: "Gentle yet comprehensive initiation covering squats, pushes, pulls, and core stabilization with low injury risk.",
        assignedMembersCount: 5,
        exercises: [
          { name: "Goblet Squats with Kettlebell", muscle: "Quadriceps & Core", sets: 3, reps: "12", restSec: 60, notes: "Hold bell close to sternum" },
          { name: "Seated Cable Lat Pulldowns", muscle: "Back", sets: 3, reps: "12", restSec: 60, notes: "Smooth pull without leaning back" },
          { name: "Dumbbell Flat Chest Press", muscle: "Chest & Shoulders", sets: 3, reps: "12", restSec: 60, notes: "Elbows at 45 degree angle" },
          { name: "Seated Leg Press Machine", muscle: "Legs", sets: 3, reps: "15", restSec: 60, notes: "Do not lock knees out at top" },
          { name: "Deadbug Core Stabilization", muscle: "Abdominals & Lower Back", sets: 3, reps: "10 per side", restSec: 45, notes: "Keep lower back glued to floor" },
          { name: "Incline Treadmill Brisk Walk", muscle: "Aerobic Capacity", sets: 1, reps: "20 minutes", restSec: 0, notes: "Speed: 5.5 km/h, Incline: 8%" }
        ]
      }
    ],

    equipment: [
      {
        id: "EQ-101",
        name: "LifeFitness Pro Dual Adjustable Cable Crossover",
        category: "Strength",
        purchaseDate: _relDate(-600),
        condition: "Excellent",
        status: "Operational",
        lastServiced: _relDate(-30),
        nextMaintenance: _relDate(60),
        serialNumber: "LF-CR-89211",
        location: "Main Floor - Strength Bay"
      },
      {
        id: "EQ-102",
        name: "Hammer Strength Olympic Power Rack (x3)",
        category: "Free Weights",
        purchaseDate: _relDate(-600),
        condition: "Excellent",
        status: "Operational",
        lastServiced: _relDate(-15),
        nextMaintenance: _relDate(75),
        serialNumber: "HS-PR-00412",
        location: "Powerlifting Pit"
      },
      {
        id: "EQ-103",
        name: "Matrix Treadmill T70 Commercial Console (x6)",
        category: "Cardio",
        purchaseDate: _relDate(-400),
        condition: "Good",
        status: "Operational",
        lastServiced: _relDate(-20),
        nextMaintenance: _relDate(70),
        serialNumber: "MX-TM-77219",
        location: "Cardio Deck"
      },
      {
        id: "EQ-104",
        name: "Concept2 RowErg Model D Indoor Rower (x4)",
        category: "Functional",
        purchaseDate: _relDate(-350),
        condition: "Good",
        status: "Operational",
        lastServiced: _relDate(-10),
        nextMaintenance: _relDate(80),
        serialNumber: "C2-RW-19022",
        location: "CrossFit Arena"
      },
      {
        id: "EQ-105",
        name: "Assault AirBike Elite Commercial (x4)",
        category: "Cardio",
        purchaseDate: _relDate(-350),
        condition: "Needs Repair",
        status: "Under Maintenance",
        lastServiced: _relDate(-4),
        nextMaintenance: _relDate(4),
        serialNumber: "AB-EL-30019",
        location: "CrossFit Arena",
        repairNotes: "Chain tension adjustment & pedal bearing lubrication required"
      },
      {
        id: "EQ-106",
        name: "Technogym Pure Strength Incline Leg Press 45°",
        category: "Strength",
        purchaseDate: _relDate(-450),
        condition: "Excellent",
        status: "Operational",
        lastServiced: _relDate(-50),
        nextMaintenance: _relDate(40),
        serialNumber: "TG-LP-45129",
        location: "Leg Zone"
      },
      {
        id: "EQ-107",
        name: "Urethane Dumbbell Set (2.5kg to 50kg) with 3 Racks",
        category: "Free Weights",
        purchaseDate: _relDate(-600),
        condition: "Good",
        status: "Operational",
        lastServiced: _relDate(-20),
        nextMaintenance: _relDate(160),
        serialNumber: "DB-UR-99011",
        location: "Free Weight Zone"
      },
      {
        id: "EQ-108",
        name: "CryoAction Whole Body Cryotherapy Chamber",
        category: "Recovery & Spa",
        purchaseDate: _relDate(-250),
        condition: "Excellent",
        status: "Operational",
        lastServiced: _relDate(-15),
        nextMaintenance: _relDate(45),
        serialNumber: "CA-CRYO-011",
        location: "VIP Recovery Suite"
      }
    ],

    notifications: [
      {
        id: "notif-1",
        type: "expiration",
        title: "Membership Expired",
        message: `Salma Sherif (FZ-1004) membership expired on ${_relDate(-5)}.`,
        time: _relDateTime(-4, '09:00'),
        read: false,
        badge: "Warning",
        link: "members.html"
      },
      {
        id: "notif-2",
        type: "payment",
        title: "Pending Payment Reminder",
        message: "Invoice INV-2024-1010 for Salma Sherif (1,300 EGP) is pending renewal payment.",
        time: _relDateTime(-4, '10:15'),
        read: false,
        badge: "Finance",
        link: "payments.html"
      },
      {
        id: "notif-3",
        type: "booking",
        title: "Class Near Capacity",
        message: "HIIT Inferno Cardio Shred has 4 / 18 seats booked for tomorrow evening.",
        time: _relDateTime(-1, '14:00'),
        read: false,
        badge: "Classes",
        link: "classes.html"
      },
      {
        id: "notif-4",
        type: "equipment",
        title: "Equipment Maintenance Alert",
        message: `Assault AirBike Elite (#EQ-105) is scheduled for service on ${_relDate(4)}.`,
        time: _relDateTime(-2, '11:30'),
        read: true,
        badge: "Equipment",
        link: "equipment.html"
      },
      {
        id: "notif-5",
        type: "registration",
        title: "New VIP Member Enrolled",
        message: "Tamer Barakat enrolled in Elite VIP Annual (4,500 EGP).",
        time: _relDateTime(-2, '13:05'),
        read: true,
        badge: "Member",
        link: "members.html"
      }
    ]
  };
}

// Storage API
const DB = {
  getRawData() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (!dataStr) {
        return this.resetDemo();
      }
      return JSON.parse(dataStr);
    } catch (err) {
      console.error("Error reading localStorage:", err);
      return this.resetDemo();
    }
  },

  saveRawData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('fitzone_db_updated', { detail: { timestamp: Date.now() } }));
    } catch (err) {
      console.error("Error writing to localStorage:", err);
    }
  },

  resetDemo() {
    const fresh = buildInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    window.dispatchEvent(new CustomEvent('fitzone_db_updated', { detail: { timestamp: Date.now() } }));
    return fresh;
  },

  // Auto calculate expiration statuses
  autoSyncStatuses() {
    const data = this.getRawData();
    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    if (data.members && Array.isArray(data.members)) {
      data.members.forEach(member => {
        if (member.expireDate) {
          if (member.expireDate < today && member.status !== 'Expired') {
            member.status = 'Expired';
            updated = true;
          } else if (member.expireDate >= today && member.status === 'Expired') {
            member.status = 'Active';
            updated = true;
          }
        }
      });
    }

    if (updated) {
      this.saveRawData(data);
    }
    return data;
  },

  get(collectionName) {
    const data = this.autoSyncStatuses();
    return data[collectionName] || [];
  },

  getById(collectionName, id) {
    const items = this.get(collectionName);
    return items.find(item => String(item.id) === String(id)) || null;
  },

  add(collectionName, item) {
    const data = this.getRawData();
    if (!data[collectionName]) data[collectionName] = [];
    
    if (!item.id) {
      const prefix = collectionName.slice(0, 3).toUpperCase();
      item.id = `${prefix}-${Date.now().toString().slice(-6)}`;
    }
    
    data[collectionName].unshift(item);
    this.saveRawData(data);
    return item;
  },

  update(collectionName, id, updates) {
    const data = this.getRawData();
    if (!data[collectionName]) return null;

    const index = data[collectionName].findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    data[collectionName][index] = { ...data[collectionName][index], ...updates };
    this.saveRawData(data);
    return data[collectionName][index];
  },

  delete(collectionName, id) {
    const data = this.getRawData();
    if (!data[collectionName]) return false;

    const beforeLen = data[collectionName].length;
    data[collectionName] = data[collectionName].filter(item => String(item.id) !== String(id));
    
    if (data[collectionName].length !== beforeLen) {
      this.saveRawData(data);
      return true;
    }
    return false;
  },

  getSettings() {
    const data = this.getRawData();
    return data.settings || buildInitialData().settings;
  },

  updateSettings(newSettings) {
    const data = this.getRawData();
    data.settings = { ...data.settings, ...newSettings };
    this.saveRawData(data);
    return data.settings;
  },

  generateNextMemberId() {
    const members = this.get('members');
    let maxNum = 1000;
    members.forEach(m => {
      if (m.id && m.id.startsWith('FZ-')) {
        const num = parseInt(m.id.replace('FZ-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `FZ-${maxNum + 1}`;
  },

  // Attendance check-in with validation
  checkInMember(memberId, method = 'Manual Check-in') {
    const members = this.get('members');
    const member = members.find(m => m.id === memberId);
    if (!member) {
      return { success: false, message: "Member not found!" };
    }

    // 1. Check if member is already checked in currently
    const attendance = this.get('attendance');
    const activeVisit = attendance.find(a => a.memberId === memberId && a.status === 'Checked In');
    if (activeVisit) {
      return {
        success: false,
        alreadyCheckedIn: true,
        visit: activeVisit,
        message: `${member.name} is already checked in since ${activeVisit.checkInTime.split(' ')[1]}!`
      };
    }

    // 2. Check expiration
    const today = new Date().toISOString().split('T')[0];
    if (member.expireDate && member.expireDate < today) {
      return {
        success: false,
        expired: true,
        member,
        message: `Membership for ${member.name} has EXPIRED on ${member.expireDate}! Please renew before entering.`
      };
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const newRecord = {
      id: `att-${Date.now().toString().slice(-6)}`,
      memberId: member.id,
      memberName: member.name,
      memberPhoto: member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      planName: member.planName || 'General',
      checkInTime: timeStr,
      checkOutTime: null,
      status: 'Checked In',
      date: dateStr,
      method: method
    };

    this.add('attendance', newRecord);
    return { success: true, record: newRecord, member };
  },

  checkOutMember(attendanceId) {
    const record = this.getById('attendance', attendanceId);
    if (!record) return { success: false, message: "Attendance record not found" };

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let durationMin = 60;
    try {
      const checkInDate = new Date(record.checkInTime.replace(' ', 'T'));
      durationMin = Math.max(1, Math.round((now - checkInDate) / (1000 * 60)));
    } catch(e) {}

    const updated = this.update('attendance', attendanceId, {
      checkOutTime: timeStr,
      status: 'Completed',
      durationMin: durationMin
    });

    return { success: true, record: updated };
  },

  bookClass(classId, memberId) {
    const cls = this.getById('classes', classId);
    const member = this.getById('members', memberId);

    if (!cls) return { success: false, message: "Class not found" };
    if (!member) return { success: false, message: "Member account not found" };

    if (cls.bookedMembers.includes(memberId)) {
      return { success: false, message: "You are already booked for this class!" };
    }

    if (cls.bookedMembers.length >= cls.capacity) {
      return { success: false, message: "Class is completely full! Capacity reached." };
    }

    const updatedMembers = [...cls.bookedMembers, memberId];
    this.update('classes', classId, { bookedMembers: updatedMembers });

    this.add('notifications', {
      type: 'booking',
      title: 'Class Booked',
      message: `${member.name} booked a seat in ${cls.title}.`,
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      badge: 'Classes',
      link: 'classes.html'
    });

    return { success: true, class: cls, remaining: cls.capacity - updatedMembers.length };
  },

  cancelClassBooking(classId, memberId) {
    const cls = this.getById('classes', classId);
    if (!cls) return { success: false, message: "Class not found" };

    const updatedMembers = cls.bookedMembers.filter(id => id !== memberId);
    this.update('classes', classId, { bookedMembers: updatedMembers });
    return { success: true, class: cls };
  },

  recordPayment(paymentData) {
    const newPayment = {
      id: paymentData.id || `INV-2024-${Date.now().toString().slice(-4)}`,
      memberId: paymentData.memberId,
      memberName: paymentData.memberName,
      amount: parseFloat(paymentData.amount) || 0,
      currency: "EGP",
      planId: paymentData.planId || "",
      planName: paymentData.planName || "Membership Fee",
      date: paymentData.date || new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      method: paymentData.method || "Cash",
      status: paymentData.status || "Paid",
      transactionId: paymentData.transactionId || `TXN-EGY-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedBy: paymentData.receivedBy || "Admin",
      notes: paymentData.notes || "Recorded via system"
    };

    this.add('payments', newPayment);

    if (paymentData.planId && paymentData.extendMembership && paymentData.status === 'Paid') {
      const plan = this.getById('plans', paymentData.planId);
      const member = this.getById('members', paymentData.memberId);
      if (plan && member) {
        const now = new Date();
        const currentExp = member.expireDate ? new Date(member.expireDate) : now;
        const baseDate = currentExp > now ? currentExp : now;
        
        const newExpDate = new Date(baseDate.getTime() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000);
        const newExpStr = newExpDate.toISOString().split('T')[0];

        this.update('members', member.id, {
          planId: plan.id,
          planName: plan.name,
          expireDate: newExpStr,
          status: 'Active'
        });
      }
    }

    return newPayment;
  }
};

// Auto-initialize when loaded
DB.autoSyncStatuses();
