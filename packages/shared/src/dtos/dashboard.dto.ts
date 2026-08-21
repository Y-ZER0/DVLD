import type { ApplicationStatus, ApplicationType } from '../enums';

export interface DashboardRecentApplicationDto {
  applicationId: number;
  applicantName: string;
  nationalNumber: string;
  applicationTypeTitle: ApplicationType;
  applicationStatus: ApplicationStatus;
  paidFees: string;
  applicationDate: string;
}

export interface DashboardUpcomingAppointmentDto {
  appointmentId: number;
  applicantName: string;
  nationalNumber: string;
  testTypeTitle: string;
  appointmentDate: string;
}

export interface DashboardSummaryDto {
  activeApplications: number;
  testsToday: number;
  pendingAppointments: number;
  activeDrivers: number;
  activeLicenses: number;
  detainedLicenses: number;
  recentApplications: DashboardRecentApplicationDto[];
  upcomingTestAppointments: DashboardUpcomingAppointmentDto[];
}
