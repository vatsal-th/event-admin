// Mock data for applications and payment requests

export const mockApplications = [
  // Event Hosting Applications
  {
    id: 1,
    userName: "Rajesh Kumar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    email: "rajesh.kumar@example.com",
    category: "event-hosting",
    appliedDate: "2025-10-24",
    status: "pending",
    details: {
      eventType: "Corporate Conference",
      expectedAttendees: 500,
      venue: "Mumbai Convention Center",
      experience: "5 years in event management",
      portfolio: "https://example.com/portfolio"
    }
  },
  {
    id: 2,
    userName: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    email: "priya.sharma@example.com",
    category: "event-hosting",
    appliedDate: "2025-11-15",
    status: "approved",
    details: {
      eventType: "Wedding Events",
      expectedAttendees: 300,
      venue: "Delhi Banquet Hall",
      experience: "3 years in wedding planning",
      portfolio: "https://example.com/portfolio"
    }
  },
  {
    id: 3,
    userName: "Amit Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    email: "amit.patel@example.com",
    category: "event-hosting",
    appliedDate: "2025-09-10",
    status: "rejected",
    details: {
      eventType: "Music Festival",
      expectedAttendees: 1000,
      venue: "Bangalore Open Grounds",
      experience: "1 year in event management",
      portfolio: "https://example.com/portfolio"
    }
  },
  {
    id: 4,
    userName: "Sneha Reddy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    email: "sneha.reddy@example.com",
    category: "event-hosting",
    appliedDate: "2025-12-01",
    status: "pending",
    details: {
      eventType: "Tech Summit",
      expectedAttendees: 800,
      venue: "Hyderabad Tech Park",
      experience: "4 years in tech events",
      portfolio: "https://example.com/portfolio"
    }
  },
  {
    id: 5,
    userName: "Vikram Singh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    email: "vikram.singh@example.com",
    category: "event-hosting",
    appliedDate: "2025-11-28",
    status: "approved",
    details: {
      eventType: "Sports Tournament",
      expectedAttendees: 600,
      venue: "Pune Sports Complex",
      experience: "6 years in sports events",
      portfolio: "https://example.com/portfolio"
    }
  },

  // Agency Applications
  {
    id: 6,
    userName: "Creative Events Co.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Creative",
    email: "contact@creativeevents.com",
    category: "agency",
    appliedDate: "2025-10-18",
    status: "pending",
    details: {
      agencyName: "Creative Events Co.",
      yearsInBusiness: 8,
      teamSize: 25,
      specialization: "Corporate Events & Brand Activations",
      pastClients: "Google, Amazon, Microsoft"
    }
  },
  {
    id: 7,
    userName: "Elite Planners",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Elite",
    email: "info@eliteplanners.com",
    category: "agency",
    appliedDate: "2025-11-05",
    status: "approved",
    details: {
      agencyName: "Elite Planners",
      yearsInBusiness: 5,
      teamSize: 15,
      specialization: "Luxury Weddings & Social Events",
      pastClients: "High-profile celebrities and business leaders"
    }
  },
  {
    id: 8,
    userName: "Metro Events Hub",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Metro",
    email: "hello@metroeventshub.com",
    category: "agency",
    appliedDate: "2025-09-22",
    status: "pending",
    details: {
      agencyName: "Metro Events Hub",
      yearsInBusiness: 3,
      teamSize: 10,
      specialization: "Music Festivals & Entertainment",
      pastClients: "Local music labels and artists"
    }
  },
  {
    id: 9,
    userName: "Sparkle Celebrations",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sparkle",
    email: "team@sparklecelebrations.com",
    category: "agency",
    appliedDate: "2025-12-10",
    status: "rejected",
    details: {
      agencyName: "Sparkle Celebrations",
      yearsInBusiness: 2,
      teamSize: 5,
      specialization: "Birthday Parties & Small Events",
      pastClients: "Local community and families"
    }
  },
  {
    id: 10,
    userName: "Grand Vision Events",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Grand",
    email: "contact@grandvision.com",
    category: "agency",
    appliedDate: "2025-11-20",
    status: "approved",
    details: {
      agencyName: "Grand Vision Events",
      yearsInBusiness: 10,
      teamSize: 40,
      specialization: "International Conferences & Trade Shows",
      pastClients: "Fortune 500 companies"
    }
  },

  // Influencer Applications
  {
    id: 11,
    userName: "Neha Kapoor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    email: "neha.kapoor@influencer.com",
    category: "influencer",
    appliedDate: "2025-10-30",
    status: "pending",
    details: {
      platform: "Instagram",
      followers: "250K",
      niche: "Lifestyle & Fashion",
      engagementRate: "4.5%",
      previousCollaborations: "Nike, Zara, H&M"
    }
  },
  {
    id: 12,
    userName: "Rohan Mehta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    email: "rohan.mehta@influencer.com",
    category: "influencer",
    appliedDate: "2025-11-12",
    status: "approved",
    details: {
      platform: "YouTube",
      followers: "500K",
      niche: "Tech Reviews & Gadgets",
      engagementRate: "6.2%",
      previousCollaborations: "Samsung, OnePlus, Apple"
    }
  },
  {
    id: 13,
    userName: "Ananya Desai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    email: "ananya.desai@influencer.com",
    category: "influencer",
    appliedDate: "2025-09-15",
    status: "pending",
    details: {
      platform: "Instagram & TikTok",
      followers: "180K",
      niche: "Food & Travel",
      engagementRate: "5.8%",
      previousCollaborations: "Swiggy, Zomato, MakeMyTrip"
    }
  },
  {
    id: 14,
    userName: "Karan Malhotra",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan",
    email: "karan.malhotra@influencer.com",
    category: "influencer",
    appliedDate: "2025-12-05",
    status: "rejected",
    details: {
      platform: "Instagram",
      followers: "50K",
      niche: "Fitness & Wellness",
      engagementRate: "3.2%",
      previousCollaborations: "Local gyms and supplement brands"
    }
  },
  {
    id: 15,
    userName: "Ishita Verma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita",
    email: "ishita.verma@influencer.com",
    category: "influencer",
    appliedDate: "2025-11-25",
    status: "approved",
    details: {
      platform: "YouTube & Instagram",
      followers: "800K",
      niche: "Beauty & Makeup",
      engagementRate: "7.1%",
      previousCollaborations: "Maybelline, Lakme, MAC"
    }
  },

  // Apply Event Applications
  {
    id: 16,
    userName: "Arjun Nair",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    email: "arjun.nair@example.com",
    category: "apply-event",
    appliedDate: "2025-12-15",
    status: "pending",
    details: {
      eventName: "Tech Conference 2026",
      applicationReason: "Interested in networking and learning about latest tech trends",
      experience: "Software Developer with 3 years experience",
      availability: "Available for the full 2-day event"
    }
  },
  {
    id: 17,
    userName: "Meera Joshi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    email: "meera.joshi@example.com",
    category: "apply-event",
    appliedDate: "2025-11-30",
    status: "approved",
    details: {
      eventName: "Music Festival",
      applicationReason: "Passionate about music and want to volunteer as stage helper",
      experience: "Event volunteer at local concerts",
      availability: "Available during weekends"
    }
  },
  {
    id: 18,
    userName: "Sandeep Gupta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sandeep",
    email: "sandeep.gupta@example.com",
    category: "apply-event",
    appliedDate: "2025-10-20",
    status: "pending",
    details: {
      eventName: "Startup Pitch Event",
      applicationReason: "Entrepreneur looking to pitch my startup idea",
      experience: "Founded one startup, seeking investment",
      availability: "Flexible schedule"
    }
  },
  {
    id: 19,
    userName: "Kavita Rao",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    email: "kavita.rao@example.com",
    category: "apply-event",
    appliedDate: "2025-12-08",
    status: "rejected",
    details: {
      eventName: "Art Exhibition",
      applicationReason: "Artist wanting to showcase my paintings",
      experience: "Professional artist with gallery exhibitions",
      availability: "Can attend opening night"
    }
  }
];

export const mockPaymentRequests = [
  {
    id: 1,
    userName: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    email: "priya.sharma@example.com",
    requestDate: "2026-01-15",
    amount: 1500,
    paymentMethod: "UPI",
    paymentDetails: {
      upiId: "priya.sharma@paytm"
    },
    status: "pending"
  },
  {
    id: 2,
    userName: "Rohan Mehta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    email: "rohan.mehta@influencer.com",
    requestDate: "2026-01-18",
    amount: 2500,
    paymentMethod: "Bank Transfer",
    paymentDetails: {
      accountNumber: "1234567890",
      ifscCode: "HDFC0001234",
      accountHolder: "Rohan Mehta"
    },
    status: "approved"
  },
  {
    id: 3,
    userName: "Elite Planners",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Elite",
    email: "info@eliteplanners.com",
    requestDate: "2026-01-10",
    amount: 5000,
    paymentMethod: "Bank Transfer",
    paymentDetails: {
      accountNumber: "9876543210",
      ifscCode: "ICIC0005678",
      accountHolder: "Elite Planners Pvt Ltd"
    },
    status: "pending"
  },
  {
    id: 4,
    userName: "Vikram Singh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    email: "vikram.singh@example.com",
    requestDate: "2026-01-20",
    amount: 1200,
    paymentMethod: "UPI",
    paymentDetails: {
      upiId: "vikram@oksbi"
    },
    status: "pending"
  },
  {
    id: 5,
    userName: "Ishita Verma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita",
    email: "ishita.verma@influencer.com",
    requestDate: "2026-01-12",
    amount: 3500,
    paymentMethod: "UPI",
    paymentDetails: {
      upiId: "ishita.verma@ybl"
    },
    status: "approved"
  },
  {
    id: 6,
    userName: "Grand Vision Events",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Grand",
    email: "contact@grandvision.com",
    requestDate: "2026-01-22",
    amount: 8000,
    paymentMethod: "Bank Transfer",
    paymentDetails: {
      accountNumber: "5555666677",
      ifscCode: "SBIN0012345",
      accountHolder: "Grand Vision Events Ltd"
    },
    status: "pending"
  },
  {
    id: 7,
    userName: "Neha Kapoor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    email: "neha.kapoor@influencer.com",
    requestDate: "2026-01-08",
    amount: 1800,
    paymentMethod: "UPI",
    paymentDetails: {
      upiId: "neha.k@paytm"
    },
    status: "rejected"
  },
  {
    id: 8,
    userName: "Ananya Desai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    email: "ananya.desai@influencer.com",
    requestDate: "2026-01-25",
    amount: 2200,
    paymentMethod: "Bank Transfer",
    paymentDetails: {
      accountNumber: "7777888899",
      ifscCode: "AXIS0009876",
      accountHolder: "Ananya Desai"
    },
    status: "pending"
  },
  {
    id: 9,
    userName: "Metro Events Hub",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Metro",
    email: "hello@metroeventshub.com",
    requestDate: "2026-01-14",
    amount: 4500,
    paymentMethod: "Bank Transfer",
    paymentDetails: {
      accountNumber: "3333444455",
      ifscCode: "HDFC0006789",
      accountHolder: "Metro Events Hub"
    },
    status: "approved"
  },
  {
    id: 10,
    userName: "Rajesh Kumar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    email: "rajesh.kumar@example.com",
    requestDate: "2026-01-26",
    amount: 950,
    paymentMethod: "UPI",
    paymentDetails: {
      upiId: "rajesh@oksbi"
    },
    status: "pending"
  }
];
