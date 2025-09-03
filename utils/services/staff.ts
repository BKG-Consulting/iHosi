import db from "@/lib/db";
import { PHIEncryption } from "@/lib/encryption";

export async function getAllStaff({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [staff, totalRecords] = await Promise.all([
      db.staff.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },

        skip: SKIP,
        take: LIMIT,
      }),
      db.staff.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    // Decrypt staff data
    const decryptedStaff = staff.map((member: any) => {
      const decryptedData = PHIEncryption.decryptDoctorData(member);
      return {
        ...member,
        name: decryptedData.name,
        email: decryptedData.email,
        phone: decryptedData.phone,
        address: decryptedData.address,
        license_number: decryptedData.license_number,
      };
    });

    return {
      success: true,
      data: decryptedStaff,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
