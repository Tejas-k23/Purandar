import connectDB from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import { env } from '../config/env.js';

const samplePhotos = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
];

const createApprovedProperty = (owner, overrides = {}) => ({
  owner: owner._id,
  userName: owner.name,
  intent: 'sell',
  category: 'residential',
  propertyType: 'Flat / Apartment',
  title: 'Premium 3 BHK in Purandar',
  city: 'Pune',
  locality: 'Saswad',
  subLocality: 'Purandar Hills',
  landmark: 'Near Purandar Fort Road',
  totalFloors: '12',
  floorNo: '5',
  bedrooms: 3,
  bathrooms: 2,
  balconies: 2,
  totalArea: 1280,
  areaUnit: 'sq.ft',
  carpetArea: 1040,
  furnishing: 'Semi-Furnished',
  availability: 'Ready to Move',
  propertyAge: '2',
  ownership: 'Freehold',
  price: 6500000,
  maintenance: 2500,
  coveredParking: 1,
  photos: samplePhotos,
  societyAmenities: ['Lift', 'CCTV', 'Gymnasium', 'Security', 'Power Backup'],
  flatAmenities: ['Modular Kitchen', 'Geyser', 'Air Conditioner'],
  facing: 'East',
  overlooking: ['Garden'],
  waterSupply: 'Corporation',
  gatedCommunity: 'Yes',
  description: 'A well-connected home with open views, modern amenities, and quick access to Saswad and central Pune.',
  score: 92,
  viewCount: 0,
  status: 'approved',
  approvedAt: new Date(),
  publishedAt: new Date(),
  ...overrides,
});

const run = async () => {
  await connectDB();

  await Promise.all([
    Enquiry.deleteMany({}),
    Property.deleteMany({}),
    User.deleteMany({ email: { $in: ['demo.user@purandar.local', 'demo.agent@purandar.local'] } }),
  ]);

  const admin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() }).select('+password');

  if (!admin) {
    throw new Error('Admin user not found. Run npm run seed:admin first.');
  }

  const [demoUser, demoAgent] = await User.create([
    {
      name: 'Demo User',
      email: 'demo.user@purandar.local',
      password: 'DemoUser123!',
      role: 'user',
      phone: '9876543210',
      location: 'Purandar, Pune',
      bio: 'Actively looking for residential and investment properties in Purandar.',
    },
    {
      name: 'Demo Agent',
      email: 'demo.agent@purandar.local',
      password: 'DemoAgent123!',
      role: 'agent',
      phone: '9123456780',
      location: 'Saswad, Pune',
      bio: 'Local property consultant for residential homes, plots, and commercial spaces.',
    },
  ]);

  const properties = await Property.insertMany([
    createApprovedProperty(demoAgent, { viewCount: 126, lastViewedAt: new Date() }),
    createApprovedProperty(demoAgent, {
      title: 'Residential Plot Near Jejuri Road',
      category: 'plot',
      propertyType: 'Plot / Land',
      locality: 'Jejuri',
      subLocality: 'Temple Approach Road',
      bedrooms: null,
      bathrooms: null,
      balconies: null,
      totalArea: null,
      carpetArea: null,
      plotArea: 2400,
      price: 3200000,
      facing: 'North',
      description: 'Corner plot ideal for villa construction with excellent road access.',
      flatAmenities: [],
      societyAmenities: ['Security'],
      viewCount: 48,
      lastViewedAt: new Date(),
    }),
    createApprovedProperty(demoAgent, {
      title: 'Commercial Shop in Saswad Market',
      intent: 'rent',
      category: 'commercial',
      propertyType: 'Shop / Showroom',
      locality: 'Saswad Market',
      floorNo: 'Ground',
      totalFloors: '2',
      bedrooms: null,
      bathrooms: 1,
      balconies: null,
      totalArea: 540,
      carpetArea: 500,
      price: 28000,
      securityDeposit: 150000,
      maintenance: 0,
      facing: 'West',
      description: 'Visible main-road commercial unit suitable for retail or office use.',
      flatAmenities: ['Air Conditioner'],
      societyAmenities: ['CCTV'],
      viewCount: 74,
      lastViewedAt: new Date(),
    }),
    createApprovedProperty(demoUser, {
      title: 'Luxury Villa with Garden View',
      propertyType: 'Independent House / Villa',
      locality: 'Narayanpur',
      subLocality: 'Temple View Enclave',
      bedrooms: 4,
      bathrooms: 4,
      balconies: 3,
      totalArea: 2600,
      carpetArea: 2200,
      price: 14500000,
      maintenance: 0,
      coveredParking: 2,
      flatAmenities: ['Modular Kitchen', 'Air Conditioner', 'Private Garden'],
      societyAmenities: ['Security', 'Power Backup', 'Garden'],
      description: 'Spacious villa designed for families who want premium living close to Purandar growth corridors.',
      viewCount: 91,
      lastViewedAt: new Date(),
    }),
    createApprovedProperty(demoUser, {
      title: 'Affordable 2 BHK for First-Time Buyers',
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      totalArea: 920,
      carpetArea: 760,
      locality: 'Belsar',
      subLocality: 'Lake View Residency',
      price: 4200000,
      description: 'Budget-friendly apartment in a growing neighborhood with dependable daily connectivity.',
      viewCount: 33,
      lastViewedAt: new Date(),
    }),
    createApprovedProperty(demoAgent, {
      title: 'Pending Review Duplex',
      propertyType: 'Builder Floor',
      locality: 'Dive',
      subLocality: 'Green Valley',
      bedrooms: 3,
      bathrooms: 3,
      totalArea: 1800,
      carpetArea: 1500,
      price: 7200000,
      status: 'pending',
      approvedAt: null,
      publishedAt: null,
      viewCount: 0,
      lastViewedAt: null,
    }),
  ]);

  demoUser.savedProperties = [properties[0]._id, properties[3]._id];
  await demoUser.save({ validateBeforeSave: false });

  await Enquiry.insertMany([
    {
      property: properties[0]._id,
      propertyOwner: demoAgent._id,
      user: demoUser._id,
      name: demoUser.name,
      email: demoUser.email,
      phone: demoUser.phone,
      message: 'I would like to schedule a site visit this weekend.',
      status: 'new',
      leadType: 'enquiry',
    },
    {
      property: properties[0]._id,
      propertyOwner: demoAgent._id,
      user: demoUser._id,
      name: demoUser.name,
      email: demoUser.email,
      phone: demoUser.phone,
      message: 'Requested seller details',
      status: 'new',
      leadType: 'seller_detail',
    },
    {
      property: properties[3]._id,
      propertyOwner: demoUser._id,
      name: 'Rohan Patil',
      email: 'rohan.patil@example.com',
      phone: '9988776655',
      message: 'Please share more details about the villa and neighborhood.',
      status: 'contacted',
      leadType: 'enquiry',
    },
  ]);

  console.log('Demo users created:');
  console.log('User: demo.user@purandar.local / DemoUser123!');
  console.log('Agent: demo.agent@purandar.local / DemoAgent123!');
  console.log(`Seeded ${properties.length} properties and demo enquiries.`);

  process.exit(0);
};

run().catch((error) => {
  console.error('Failed to seed demo data', error);
  process.exit(1);
});

