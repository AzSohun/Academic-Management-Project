export interface AssignedSubject {
    id: string;
    subjectName: string;
    subjectCode: string;
}

export interface EnrolledStudent {
    id: string;
    fullName: string;
    rollNo: string;
    email: string;
    section: string;
}

export interface MyClass {
    id: string;
    className: string;
    roomNumber: string;
    studentCount: number;
    subjects: AssignedSubject[];
    students: EnrolledStudent[];
}

export interface Subject {
    id: string;
    subjectName: string;
    subjectCode: string;
    subjectDescription?: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    marks: number;
    dueDate: string;
    isDraft: boolean;
    subjectId?: string;
    subjectName?: string;
    classDetailsId?: string;
    className?: string;
}

export interface Submission {
    id: string;
    filePath: string;
    submissionDate: string;
    markAssigned: number | null;
    teacherFeedback: string;
    status?: string;
    studentName: string;
    assignmentId: string;
    assignmentTitle: string;
}

export interface TeacherProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string | null;
    qualification: string;
    experience: string;
    teacherCode: string;
    specialization: string;
}

export const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};