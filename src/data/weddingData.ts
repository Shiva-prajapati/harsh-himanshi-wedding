export interface EventDetail {
  id: string;
  title: string;
  subTitle?: string;
  date: string;
  day: string;
  time: string;
  venue: string;
  locationDetails?: string;
  icon: string;
  description: string;
}

export interface RSVPPerson {
  name: string;
  relation?: string;
  phone?: string;
}

export interface WeddingData {
  invitationQuote: string;
  shlokaSanskrit: string;
  shlokaEnglish: string;
  ganeshaMantra: string;
  
  groom: {
    name: string;
    parents: string;
    grandparents: string;
    residence?: string;
  };

  bride: {
    name: string;
    parents: string;
    residence: string;
  };

  departureInfo: {
    origin: string;
    destination: string;
  };

  events: EventDetail[];

  venue: {
    name: string;
    address: string;
    fullAddress: string;
    googleMapsUrl: string;
    embedMapUrl?: string;
  };

  rsvp: {
    primaryContact: RSVPPerson;
    allContacts: RSVPPerson[];
  };

  wkcs: string[]; // With Best Compliments / Youth
}

export const WEDDING_DATA: WeddingData = {
  ganeshaMantra: "॥ श्री गणेशाय नमः ॥",
  shlokaSanskrit: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  shlokaEnglish: "Om Vakratunda Mahakaya Suryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada ||",
  invitationQuote: "Marriage is the beautiful blessing of two lives o two heart. It is the wonderful mystical moment when a charming love story starts",

  groom: {
    name: "Harsh Prajapati",
    parents: "Smt. Pushpa Devi & Sh. Dr. Rajesh Prajapati",
    grandparents: "Smt. Kudiya & Sh. Shyamlal Prajapati",
    residence: "Vill. Sadholi Kadeem, Saharanpur",
  },

  bride: {
    name: "Himanshi Prajapati",
    parents: "Smt. Shiksha Devi & Sh. Vikram Singh",
    residence: "New Gourav Vihar Colony, Saharanpur",
  },

  departureInfo: {
    origin: "Vill. Sadholi Kadeem, Sre.",
    destination: "Shiva Banquet Hall, Shakumbhari Vihar, Saharanpur",
  },

  events: [
    {
      id: "sangeet",
      title: "Ladies Sangeet",
      subTitle: "An evening of rhythm, music & royal celebrations",
      day: "Tuesday",
      date: "18 November 2026",
      time: "8:00 PM onwards",
      venue: "Ancestral Residence, Vill. Sadholi Kadeem",
      icon: "🎵",
      description: "Join us for an enchanting night of traditional folk music, dholak beats, dance and heartfelt family performances.",
    },
    {
      id: "mandap",
      title: "Mandap & Ghurchari",
      subTitle: "Sacred rituals & auspicious horse procession",
      day: "Wednesday",
      date: "19 November 2026",
      time: "Mandap 10:00 AM | Lunch 12:00 Noon | Ghurchari 9:00 PM",
      venue: "Vill. Sadholi Kadeem, Saharanpur",
      icon: "🕍",
      description: "Auspicious sanctification under the Mandap followed by festive royal Ghurchari ceremony in the evening.",
    },
    {
      id: "barat",
      title: "Departure of Barat",
      subTitle: "The Grand Royal Wedding Procession",
      day: "Thursday",
      date: "20 November 2026",
      time: "5:00 PM Sharp",
      venue: "From Vill. Sadholi Kadeem, Sre.",
      locationDetails: "Wedding procession departs towards Shiva Banquet Hall",
      icon: "💍",
      description: "The groom's celebratory wedding caravan embarks with dhol, brass band and joyful fireworks towards the venue.",
    },
    {
      id: "reception",
      title: "Wedding Reception & Dinner",
      subTitle: "Varmala, Pheras & Royal Feast",
      day: "Thursday",
      date: "20 November 2026",
      time: "7:00 PM onwards",
      venue: "Shiva Banquet Hall, Shakumbhari Vihar, Saharanpur",
      icon: "🎊",
      description: "Witness the sacred exchange of garlands, holy vows around the sacred fire, and celebrate with a royal feast.",
    },
  ],

  venue: {
    name: "Shiva Banquet Hall",
    address: "Shakumbhari Vihar, Saharanpur",
    fullAddress: "Shiva Banquet Hall, Shakumbhari Vihar, Saharanpur, Uttar Pradesh, India",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Shiva+Banquet+Hall+Shakumbhari+Vihar+Saharanpur",
  },

  rsvp: {
    primaryContact: {
      name: "Master Ramswaroop Prajapati",
      relation: "Family Elder",
      phone: "9720140734",
    },
    allContacts: [
      { name: "Master Ramswaroop Prajapati", relation: "Family Elder", phone: "9720140734" },
      { name: "Dharampal Prajapati" },
      { name: "Namu Prajapati" },
      { name: "Rakesh Prajapati" },
      { name: "Sourij Prajapati" },
      { name: "Susheel Prajapati" },
      { name: "Mukesh Prajapati" },
      { name: "Pradeep Prajapati" },
      { name: "Sanjeev Prajapati" },
      { name: "Lalit Prajapati" },
    ],
  },

  wkcs: [
    "Sachin",
    "Vashu",
    "Prakhar",
    "Hardik",
    "Ayush",
    "Vansh",
    "Shaurya",
    "Hanu",
    "Aayu",
  ],
};
