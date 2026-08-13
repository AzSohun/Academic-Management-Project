import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TeacherDetailed, ClassOption, SubjectOption } from '@/interfaces/admin';

interface EditTeacherProps {
    teacher: TeacherDetailed;
    classList: ClassOption[];
    subjectList: SubjectOption[];
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function EditTeacher({ teacher, classList, subjectList, onClose, onSuccess, showStatus }: EditTeacherProps) {
    const [editTeacherCodeNumber, setEditTeacherCodeNumber] = useState('');
    const [editTeacherSpec, setEditTeacherSpec] = useState(teacher.specialization || '');
    const [editTeacherClassIds, setEditTeacherClassIds] = useState<string[]>([]);
    const [editTeacherSubjectIds, setEditTeacherSubjectIds] = useState<string[]>([]);
    const [teacherFormError, setTeacherFormError] = useState('');

    useEffect(() => {
        let code = teacher.teacherCode || '';
        if (code.startsWith('TIC-')) code = code.substring(4);
        setEditTeacherCodeNumber(code);

        const currentClassIds = teacher.assignedClasses.map(name => classList.find(c => c.className === name)?.id).filter(Boolean) as string[];
        setEditTeacherClassIds(currentClassIds);

        const currentSubjectIds = teacher.assignedSubjects.map(name => subjectList.find(s => s.subjectName === name)?.id).filter(Boolean) as string[];
        setEditTeacherSubjectIds(currentSubjectIds);
    }, [teacher, classList, subjectList]);

    const handleUpdateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeacherFormError('');
        try {
            const finalTeacherCode = editTeacherCodeNumber ? `TIC-${editTeacherCodeNumber}` : '';
            await api.put(`/admin/teachers/${teacher.id}`, {
                teacherCode: finalTeacherCode, specialization: editTeacherSpec,
                classIds: editTeacherClassIds, subjectIds: editTeacherSubjectIds
            });
            showStatus('success', 'Teacher details updated successfully!');
            onSuccess();
        } catch (err: any) {
            setTeacherFormError(err.response?.data?.message || 'Failed to update teacher. Please check the code.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Edit Teacher Identity</h3>
                        <p className="text-xs text-slate-400">{teacher.firstName} {teacher.lastName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleUpdateTeacher} className="space-y-4">
                    {teacherFormError && <p className="text-xs text-rose-500 bg-rose-950/40 border border-rose-800 p-2 rounded">{teacherFormError}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Teacher Code / ID</label>
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden focus-within:border-indigo-500">
                                <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-900 border-r border-slate-800 font-mono">TIC-</span>
                                <input type="text" value={editTeacherCodeNumber} onChange={(e) => setEditTeacherCodeNumber(e.target.value)} placeholder="001" className="w-full bg-transparent p-2.5 text-sm text-slate-200 focus:outline-none font-mono" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Specialization</label>
                            <input type="text" value={editTeacherSpec} onChange={(e) => setEditTeacherSpec(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Classes</label>
                            <div className="max-h-32 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                                {classList.map(c => (
                                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-900 p-1.5 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={editTeacherClassIds.includes(c.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setEditTeacherClassIds([...editTeacherClassIds, c.id]);
                                                else setEditTeacherClassIds(editTeacherClassIds.filter(id => id !== c.id));
                                            }}
                                            className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                        />
                                        {c.className}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Subjects</label>
                            <div className="max-h-32 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                                {subjectList.map(s => (
                                    <label key={s.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-900 p-1.5 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={editTeacherSubjectIds.includes(s.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setEditTeacherSubjectIds([...editTeacherSubjectIds, s.id]);
                                                else setEditTeacherSubjectIds(editTeacherSubjectIds.filter(id => id !== s.id));
                                            }}
                                            className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                        />
                                        {s.subjectName}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Details</button>
                    </div>
                </form>
            </div>
        </div>
    );
}