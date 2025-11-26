import type { QualityGrade } from '../types';

export const getGradeColor = (grade: QualityGrade): string => {
  switch (grade) {
    case 'GOLD':
      return '#FFD700';
    case 'SILVER':
      return '#C0C0C0';
    case 'BRONZE':
      return '#CD7F32';
    default:
      return '#999999';
  }
};

export const getGradeBgColor = (grade: QualityGrade): string => {
  switch (grade) {
    case 'GOLD':
      return 'bg-yellow-100';
    case 'SILVER':
      return 'bg-gray-200';
    case 'BRONZE':
      return 'bg-orange-200';
    default:
      return 'bg-gray-100';
  }
};

export const getGradeTextColor = (grade: QualityGrade): string => {
  switch (grade) {
    case 'GOLD':
      return 'text-yellow-800';
    case 'SILVER':
      return 'text-gray-700';
    case 'BRONZE':
      return 'text-orange-800';
    default:
      return 'text-gray-700';
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
