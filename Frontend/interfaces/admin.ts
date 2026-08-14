export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: number | string;
    gender?: number | string;
    allocatedClass?: string;
    teacherClasses?: string[];
    teacherSubjects?: string[];
}

export interface QueryResultDto<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface StudentOption {
    id: string;
    fullName: string;
    email: string;
}

export interface TeacherOption {
    id: string;
    fullName: string;
    specialization: string;
}

export interface ClassOption {
    id: string;
    className: string;
    roomNumber: string;
    section: string
}

export interface SubjectOption {
    id: string;
    subjectName: string;
    subjectCode: string;
    subjectDescription: string;
}

export interface Assignment {
    id: string; title: string; description: string; marks: number;
    dueDate: string; isDraft: boolean; subjectName: string;
    className: string; teacherName: string;
}

export interface Submission {
    id: string; filePath: string; submissionDate: string; markAssigned: number | null;
    teacherFeedback: string; status: string; studentName: string; assignmentTitle: string;
}

export interface TeacherDetailed {
    id: string; userId: string; firstName: string; lastName: string;
    email: string; teacherCode: string; specialization: string;
    qualification: string; phoneNumber: string;
    assignedClasses: string[]; assignedSubjects: string[];
}

export interface StudentDetailed {
    id: string; userId: string; firstName: string; lastName: string;
    email: string; rollNo: string; group: string; section: string;
    className: string; parentContact: string;
}

export const getRoleNumeric = (role: number | string): number => {
    if (typeof role === 'number') return role;
    if (role === 'Admin') return 0;
    if (role === 'Teacher') return 1;
    if (role === 'Student') return 2;
    return isNaN(Number(role)) ? 2 : Number(role);
};

export const getGenderName = (gender?: number | string) => {
    if (gender === undefined || gender === null) return 'N/A';
    if (typeof gender === 'string' && isNaN(Number(gender))) return gender;
    const genderMap: Record<number, string> = { 0: 'Male', 1: 'Female' };
    return genderMap[Number(gender)] ?? 'N/A';
};

export const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};