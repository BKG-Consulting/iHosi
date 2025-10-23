import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const facilities = [
  {
    name: 'Mayo Clinic',
    slug: 'mayo-clinic',
    legal_name: 'Mayo Clinic Health System',
    facility_code: 'MC001',
    address: '200 First Street SW',
    city: 'Rochester',
    state: 'MN',
    zip_code: '55905',
    phone: '(507) 284-2511',
    email: 'admin@mayo-clinic.ihosi.com',
    website: 'https://www.mayoclinic.org',
    primary_color: '#0051C3',
    secondary_color: '#7B8794',
    accent_color: '#00A3E0',
    timezone: 'America/Chicago',
  },
  {
    name: 'Cleveland Clinic',
    slug: 'cleveland-clinic',
    legal_name: 'Cleveland Clinic Foundation',
    facility_code: 'CC001',
    address: '9500 Euclid Avenue',
    city: 'Cleveland',
    state: 'OH',
    zip_code: '44195',
    phone: '(216) 444-2200',
    email: 'admin@cleveland-clinic.ihosi.com',
    website: 'https://my.clevelandclinic.org',
    primary_color: '#003366',
    secondary_color: '#8B0000',
    accent_color: '#4682B4',
    timezone: 'America/New_York',
  },
  {
    name: 'Stanford Medical Center',
    slug: 'stanford-medical',
    legal_name: 'Stanford Health Care',
    facility_code: 'SM001',
    address: '300 Pasteur Drive',
    city: 'Stanford',
    state: 'CA',
    zip_code: '94305',
    phone: '(650) 723-4000',
    email: 'admin@stanford-medical.ihosi.com',
    website: 'https://stanfordhealthcare.org',
    primary_color: '#8C1515',
    secondary_color: '#2E2D29',
    accent_color: '#B83A4B',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'Johns Hopkins Hospital',
    slug: 'johns-hopkins',
    legal_name: 'Johns Hopkins Health System',
    facility_code: 'JH001',
    address: '1800 Orleans Street',
    city: 'Baltimore',
    state: 'MD',
    zip_code: '21287',
    phone: '(410) 955-5000',
    email: 'admin@johns-hopkins.ihosi.com',
    website: 'https://www.hopkinsmedicine.org',
    primary_color: '#002D72',
    secondary_color: '#68ACE5',
    accent_color: '#418FDE',
    timezone: 'America/New_York',
  },
  {
    name: 'Massachusetts General Hospital',
    slug: 'mass-general',
    legal_name: 'Massachusetts General Hospital',
    facility_code: 'MG001',
    address: '55 Fruit Street',
    city: 'Boston',
    state: 'MA',
    zip_code: '02114',
    phone: '(617) 726-2000',
    email: 'admin@mass-general.ihosi.com',
    website: 'https://www.massgeneral.org',
    primary_color: '#005A9C',
    secondary_color: '#8F003B',
    accent_color: '#0088CE',
    timezone: 'America/New_York',
  },
  {
    name: 'UCLA Medical Center',
    slug: 'ucla-medical',
    legal_name: 'UCLA Health System',
    facility_code: 'UC001',
    address: '757 Westwood Plaza',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90095',
    phone: '(310) 825-9111',
    email: 'admin@ucla-medical.ihosi.com',
    website: 'https://www.uclahealth.org',
    primary_color: '#2774AE',
    secondary_color: '#FFD100',
    accent_color: '#8BB8E8',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'UCSF Medical Center',
    slug: 'ucsf-medical',
    legal_name: 'University of California San Francisco Medical Center',
    facility_code: 'UF001',
    address: '505 Parnassus Avenue',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94143',
    phone: '(415) 476-1000',
    email: 'admin@ucsf-medical.ihosi.com',
    website: 'https://www.ucsfhealth.org',
    primary_color: '#052049',
    secondary_color: '#90BD31',
    accent_color: '#007CBE',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'NewYork-Presbyterian Hospital',
    slug: 'newyork-presbyterian',
    legal_name: 'NewYork-Presbyterian Hospital',
    facility_code: 'NY001',
    address: '525 East 68th Street',
    city: 'New York',
    state: 'NY',
    zip_code: '10065',
    phone: '(212) 746-5454',
    email: 'admin@newyork-presbyterian.ihosi.com',
    website: 'https://www.nyp.org',
    primary_color: '#D31F30',
    secondary_color: '#0051C3',
    accent_color: '#C41E3A',
    timezone: 'America/New_York',
  },
  {
    name: 'Cedars-Sinai Medical Center',
    slug: 'cedars-sinai',
    legal_name: 'Cedars-Sinai Medical Center',
    facility_code: 'CS001',
    address: '8700 Beverly Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90048',
    phone: '(310) 423-3277',
    email: 'admin@cedars-sinai.ihosi.com',
    website: 'https://www.cedars-sinai.org',
    primary_color: '#005DAA',
    secondary_color: '#8CC63F',
    accent_color: '#00A3E0',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'Duke University Hospital',
    slug: 'duke-university',
    legal_name: 'Duke University Health System',
    facility_code: 'DU001',
    address: '2301 Erwin Road',
    city: 'Durham',
    state: 'NC',
    zip_code: '27710',
    phone: '(919) 684-8111',
    email: 'admin@duke-university.ihosi.com',
    website: 'https://www.dukehealth.org',
    primary_color: '#003366',
    secondary_color: '#0680CD',
    accent_color: '#1D57A5',
    timezone: 'America/New_York',
  },
];

async function seedFacilities() {
  console.log('🏥 Seeding facilities...\n');

  for (const facilityData of facilities) {
    try {
      const facility = await prisma.facility.upsert({
        where: { slug: facilityData.slug },
        update: facilityData,
        create: facilityData,
      });

      console.log(`✅ ${facility.name} (${facility.slug})`);
    } catch (error) {
      console.error(`❌ Error seeding ${facilityData.name}:`, error);
    }
  }

  console.log('\n🎉 Facility seeding complete!');
  console.log('\n📋 Test URLs:');
  console.log('──────────────────────────────────────');
  facilities.forEach(f => {
    console.log(`https://${f.slug}.ihosi.com`);
  });
  console.log('──────────────────────────────────────');
  console.log('\n🧪 For local testing, add to /etc/hosts:');
  console.log('──────────────────────────────────────');
  facilities.forEach(f => {
    console.log(`127.0.0.1 ${f.slug}.localhost`);
  });
  console.log('──────────────────────────────────────');
  console.log('\n🔗 Then test: http://{slug}.localhost:3000\n');

  await prisma.$disconnect();
}

seedFacilities().catch((e) => {
  console.error('❌ Seeding failed:', e);
  prisma.$disconnect();
  process.exit(1);
});

