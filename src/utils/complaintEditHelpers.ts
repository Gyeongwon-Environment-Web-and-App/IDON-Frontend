import type { FileData } from '@/components/forms/FileAttach';
import type { Complaint } from '@/types/complaint';

import type {
  CurrentComplaintData,
  OriginalComplaintData,
} from './computeDiff';

/**
 * Extract address string from Complaint address (handles both string and object formats)
 */
export function extractAddressString(
  address: Complaint['address'],
  fallback?: string
): string {
  if (typeof address === 'string') {
    return address;
  }
  return address?.address || fallback || '';
}

/**
 * Convert coordinates from lat/lng format to x_coord/y_coord format
 * Note: In Kakao Maps, x = longitude, y = latitude
 */
export function convertCoordinatesToApiFormat(coordinates?: {
  latitude: number;
  longitude: number;
}): { x_coord: number; y_coord: number } | undefined {
  if (!coordinates) return undefined;

  return {
    x_coord: coordinates.longitude || 0,
    y_coord: coordinates.latitude || 0,
  };
}

/**
 * Extract categories array from Complaint (handles both single category and categories array)
 */
export function extractCategories(complaint: Complaint): string[] {
  if (complaint.categories?.length) {
    return complaint.categories;
  }
  if (complaint.category) {
    return [complaint.category];
  }
  return [];
}

/**
 * Extract phone number from source, with fallback
 */
export function extractPhoneNumber(
  source?: { phone_no?: string } | undefined,
  fallback?: string
): string {
  return source?.phone_no || fallback || '';
}

/**
 * Prepare original complaint data for API comparison
 */
export function prepareOriginalComplaintData(
  complaint: Complaint
): OriginalComplaintData {
  return {
    address: extractAddressString(complaint.address),
    coordinates: convertCoordinatesToApiFormat(complaint.coordinates),
    datetime: complaint.datetime || '',
    phone_no: extractPhoneNumber(complaint.source),
    content: complaint.content || '',
    type: complaint.type || '',
    route: complaint.route || '',
    status: complaint.status,
    source: complaint.source
      ? {
          phone_no: complaint.source.phone_no || '',
          bad: complaint.source.bad ?? false,
        }
      : undefined,
    categories: extractCategories(complaint),
    presigned_links: complaint.presigned_links || [],
  };
}

/**
 * Prepare update data from form data and original complaint
 */
export function prepareUpdateData(
  formData: {
    address?: string;
    coordinates?: { latitude: number; longitude: number };
    datetime?: string;
    content?: string;
    type?: string;
    route?: string;
    source?: { phone_no?: string; bad?: boolean };
    categories?: string[];
  },
  originalComplaint: Complaint
): CurrentComplaintData {
  const addressString =
    formData.address || extractAddressString(originalComplaint.address);

  const coordinates = convertCoordinatesToApiFormat(
    formData.coordinates || originalComplaint.coordinates
  );

  const categories = formData.categories?.length
    ? formData.categories
    : extractCategories(originalComplaint);

  const phoneNo = extractPhoneNumber(
    formData.source,
    originalComplaint.source?.phone_no
  );

  return {
    address: addressString,
    ...(coordinates && { coordinates }),
    datetime: formData.datetime || originalComplaint.datetime || '',
    phone_no: phoneNo,
    content: formData.content || '',
    type: formData.type || '',
    route: formData.route || '',
    source: {
      phone_no: phoneNo,
      bad: formData.source?.bad ?? originalComplaint.source?.bad ?? false,
    },
    categories,
  };
}

/**
 * Process files for edit - only uploads new files, preserves existing ones
 * Returns objectInfos array with all files (new uploads + existing file keys)
 * This is more efficient than the original approach which re-uploaded all files
 */
export async function processFilesForEdit(
  uploadedFiles: FileData[],
  uploadFunction: (
    files: File[],
    category: string
  ) => Promise<Array<{ key: string; originalName: string }>>
): Promise<Array<{ objectKey: string; filenameOriginal: string }> | undefined> {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return undefined;
  }

  // Separate new files (need upload) from existing files (already have keys)
  const newFilesData = uploadedFiles.filter(
    (fileData) => fileData.file && !fileData.url
  );
  const existingFilesData = uploadedFiles.filter(
    (fileData) => fileData.url && !fileData.file
  );

  const newFiles = newFilesData
    .map((fileData) => fileData.file!)
    .filter((file): file is File => file !== undefined);

  // Prepare existing files objectInfos (no upload needed - use existing keys)
  const existingObjectInfos = existingFilesData.map((f) => ({
    objectKey: f.url!,
    filenameOriginal: f.name,
  }));

  // Upload new files if any
  let newObjectInfos: Array<{ objectKey: string; filenameOriginal: string }> =
    [];
  if (newFiles.length > 0) {
    console.log('Uploading new files:', newFiles.length);
    const uploadedFilesResult = await uploadFunction(newFiles, 'complaint');
    newObjectInfos = uploadedFilesResult.map((uploaded) => ({
      objectKey: uploaded.key,
      filenameOriginal: uploaded.originalName,
    }));
  }

  // Combine existing and new files
  const allObjectInfos = [...existingObjectInfos, ...newObjectInfos];

  return allObjectInfos.length > 0 ? allObjectInfos : undefined;
}
