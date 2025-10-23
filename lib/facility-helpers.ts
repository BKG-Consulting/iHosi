import db from './db';
import { headers } from 'next/headers';

/**
 * Get facility by subdomain slug
 */
export async function getFacilityBySubdomain(slug: string) {
  try {
    const facility = await db.facility.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        logo_url: true,
        primary_color: true,
        secondary_color: true,
        accent_color: true,
        favicon_url: true,
        timezone: true,
      },
    });
    
    return facility;
  } catch (error) {
    console.error('Error fetching facility by subdomain:', error);
    return null;
  }
}

/**
 * Get current facility ID from request headers
 * (Set by middleware)
 */
export async function getCurrentFacilityId(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-facility-id');
}

/**
 * Get current facility from request headers
 */
export async function getCurrentFacility() {
  const headersList = await headers();
  const facilityId = headersList.get('x-facility-id');
  
  if (!facilityId) {
    return null;
  }
  
  try {
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
    });
    
    return facility;
  } catch (error) {
    console.error('Error fetching current facility:', error);
    return null;
  }
}

/**
 * Facility-aware query wrapper
 * Automatically filters by facility_id
 */
export async function facilityQuery<T>(
  query: (facilityId: string) => Promise<T>
): Promise<T> {
  const facilityId = await getCurrentFacilityId();
  
  if (!facilityId) {
    throw new Error('No facility context available');
  }
  
  return query(facilityId);
}

/**
 * Get all active facilities
 */
export async function getAllActiveFacilities() {
  try {
    const facilities = await db.facility.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return facilities;
  } catch (error) {
    console.error('Error fetching active facilities:', error);
    return [];
  }
}

/**
 * Get facility by ID
 */
export async function getFacilityById(id: string) {
  try {
    const facility = await db.facility.findUnique({
      where: { id },
    });
    
    return facility;
  } catch (error) {
    console.error('Error fetching facility:', error);
    return null;
  }
}

