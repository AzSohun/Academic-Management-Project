export interface Classmate {
    id: string;
    fullName: string;
    rollNo: string;
    email: string;
    section: string;
}

export interface EnrolledSubject {
    id: string;
    subjectName: string;
    subjectCode: string;
    activeAssignments: number;
}

export interface MyEnrolledClass {
    id: string;
    className: string;
    roomNumber: string;
    classmates: Classmate[];
    subjects: EnrolledSubject[];
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    marks: number;
    dueDate: string;
    subjectName?: string;
    className?: string;
    teacherName?: string;
}

export interface Submission {
    id: string;
    filePath: string;
    submissionDate: string;
    markAssigned: number | null;
    teacherFeedback: string;
    status: string;
    assignmentId: string;
    assignmentTitle: string;
    subjectName?: string;
}

export interface StudentProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string | null;
    address: string;
    parentContact: string;
    rollNo: string;
    group: string;
    section: string;
}

export const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};