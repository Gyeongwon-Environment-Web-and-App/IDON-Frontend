import type { Complaint } from '@/types/complaint';
import type { MapPinConfig, PinData } from '@/types/map';

// Pin configuration for different categories
export const PIN_CONFIGS: Record<string, MapPinConfig> = {
  recycle: {
    size: { width: 36, height: 45 },
    offset: { x: 0, y: 0 },
  },
  food: {
    size: { width: 36, height: 45 },
    offset: { x: 0, y: 0 },
  },
  general: {
    size: { width: 36, height: 45 },
    offset: { x: 0, y: 0 },
  },
  others: {
    size: { width: 36, height: 45 },
    offset: { x: 0, y: 0 },
  },
};

export const getPinImageSrc = (category: string, isRepeat: boolean): string => {
  const basePath = '/src/assets/icons/pins/';

  const categoryMap: Record<string, string> = {
    재활용: 'recycle',
    음식물: 'food',
    일반: 'general',
    기타: 'others',
  };

  const categoryKey = categoryMap[category] || 'general';
  const suffix = isRepeat ? '_repeat' : '_pin';

  return `${basePath}${categoryKey}${suffix}.svg`;
};

// Complaint -> Pin
export const complaintToPinData = (complaint: Complaint): PinData => {
  return {
    id: `pin-${complaint.id}`,
    lat: 0,
    lng: 0,
    category: complaint.teams[0]?.category || '기타',
    isRepeat: complaint.source.bad,
    address: complaint.address,
    complaintId: complaint.id,
    content: complaint.content,
    datetime: complaint.datetime,
    status: complaint.status,
  };
};

// 중복 핀 방지용 민원 그룹화
export const groupComplaintsByAddress = (
  complaints: Complaint[]
): Map<string, Complaint[]> => {
  const grouped = new Map<string, Complaint[]>();

  complaints.forEach((complaint) => {
    const address = complaint.address;
    if (!grouped.has(address)) {
      grouped.set(address, []);
    }
    grouped.get(address)!.push(complaint);
  });

  return grouped;
};

// 민원 한 개로 묶기
export const getRepresentativeComplaint = (
  complaints: Complaint[]
): Complaint => {
  // Sort by: repeat status (desc), then by datetime (desc)
  const sorted = [...complaints].sort((a, b) => {
    if (a.source.bad !== b.source.bad) {
      return b.source.bad ? 1 : -1;
    }
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });

  return sorted[0];
};
