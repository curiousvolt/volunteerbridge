export interface UserProfile {
  uid: string;
  role: 'student' | 'ngo' | 'nss';
  name: string;
  email: string;
  createdAt: any;
  // Student fields
  college?: string;
  yearOfStudy?: string;
  skills?: string[];
  causes?: string[];
  location?: string;
  availability?: number; // hours/week
  nssEnrolled?: boolean;
  bio?: string;
  // NGO fields
  darpanId?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNSUBMITTED';
  ngoDescription?: string;
  is80G?: boolean;
  isFcra?: boolean;
  ngoLocation?: string;
  ngoCauses?: string[];
  // NSS fields
  nssCollege?: string;
  nssUnit?: string;
}

export interface Project {
  id: string;
  ngoId: string;
  ngoName: string;
  ngoVerified?: boolean;
  title: string;
  description: string;
  causes: string[];
  requiredSkills: string[];
  location: string;
  hoursRequired: number;
  durationWeeks: number;
  isVerified?: boolean;
  createdAt: any;
  applicationCount?: number;
}

export interface Application {
  id: string;
  studentId: string;
  studentName?: string;
  projectId: string;
  ngoId: string;
  status: 'APPLIED' | 'ACTIVE' | 'COMPLETED' | 'FEEDBACK_SUBMITTED' | 'DECLINED';
  appliedAt: any;
  updatedAt?: any;
  hoursLogged?: number;
  feedbackGiven?: boolean;
}

export interface Feedback {
  id: string;
  applicationId: string;
  fromId: string;
  toId: string;
  fromRole: 'student' | 'ngo';
  rating: number; // 1–5
  comment: string;
  createdAt: any;
}

export interface RankedProject {
  project: Project;
  score: number;
}
