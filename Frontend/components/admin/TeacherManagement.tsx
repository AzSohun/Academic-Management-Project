import React, { useState, useMemo, useEffect } from 'react';
import Pagination from '@/components/common/Pagination';
import EditTeacher from '@/components/modals/Admin/EditTeacher';
import { TeacherDetailed, ClassOption, SubjectOption } from '@/interfaces/admin';

interface TeacherManagementProps {
    detailedTeachers: TeacherDetailed[];
    classList: ClassOption[];
    subjectList: SubjectOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function TeacherManagement({ detailedTeachers, classList, subjectList, fetchDashboardData, showStatus }: TeacherManagementProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [editingTeacher, setEditingTeacher] = useState<TeacherDetailed | null>(null);

    // --- Search, Filter & Sort States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('All');
    const [sortBy, setSortBy] = useState('name_asc');

    const isFilterApplied = searchTerm !== '' || specializationFilter !== 'All' || sortBy !== 'name_asc';

    const handleResetFilters = () => {
        setSearchTerm('');
        setSpecializationFilter('All');
        setSortBy('name_asc');
        setPage(1);
    };

    // Extract unique specializations for the dropdown dynamically
    const specializations = useMemo(() => {
        const specs = detailedTeachers.map(t => t.specialization || 'General');
        return ['All', ...Array.from(new Set(specs))];
    }, [detailedTeachers]);

    // Apply Search, Filter, and Sorting
    const filteredAndSortedTeachers = useMemo(() => {
        let result = [...detailedTeachers];

        // 1. Search Logic
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(t =>
                (t.firstName?.toLowerCase() || '').includes(lowerSearch) ||
                (t.lastName?.toLowerCase() || '').includes(lowerSearch) ||
                (t.teacherCode?.toLowerCase() || '').includes(lowerSearch) ||
                (t.email?.toLowerCase() || '').includes(lowerSearch)
            );
        }

        // 2. Specialization Filter Logic
        if (specializationFilter !== 'All') {
            result = result.filter(t => (t.specialization || 'General') === specializationFilter);
        }

        // 3. Sorting Logic
        result.sort((a, b) => {
            const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
            const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();

            if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
            if (sortBy === 'name_desc') return nameB.localeCompare(nameA);
            if (sortBy === 'code') return (a.teacherCode || '').localeCompare(b.teacherCode || '');
            return 0;
        });

        return result;
    }, [detailedTeachers, searchTerm, specializationFilter, sortBy]);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, specializationFilter, sortBy]);

    const start = (page - 1) * limit;
    const paginatedTeachers = filteredAndSortedTeachers.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <h3 className="text-sm font-semibold text-slate-200">Teachers Directory & Allocations</h3>

                    {/* Controls: Search, Filter, Sort, Reset */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, code or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full md:w-56"
                        />

                        <select
                            value={specializationFilter}
                            onChange={(e) => setSpecializationFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec === 'All' ? 'All Specializations' : spec}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="name_asc">Sort by Name (A-Z)</option>
                            <option value="name_desc">Sort by Name (Z-A)</option>
                            <option value="code">Sort by Teacher Code</option>
                        </select>

                        {isFilterApplied && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-medium text-slate-400 hover:text-rose-400 transition px-2 py-2 flex items-center gap-1 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Specialization</th>
                                <th className="p-3">Assigned Classes</th>
                                <th className="p-3">Assigned Subjects</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedTeachers.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 font-medium text-slate-200">{t.firstName} {t.lastName}</td>
                                    <td className="p-3 font-mono text-emerald-400">{t.teacherCode || 'N/A'}</td>
                                    <td className="p-3 text-slate-300">{t.specialization || 'General'}</td>
                                    <td className="p-3 text-emerald-300/90">{t.assignedClasses?.length > 0 ? t.assignedClasses.join(', ') : 'None'}</td>
                                    <td className="p-3 text-violet-300/90">{t.assignedSubjects?.length > 0 ? t.assignedSubjects.join(', ') : 'None'}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => setEditingTeacher(t)}
                                            className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 cursor-pointer transition"
                                        >
                                            Edit Info
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredAndSortedTeachers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">
                                        {detailedTeachers.length === 0 ? "No teachers found in the system." : "No teachers match your filter criteria."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        totalItems={filteredAndSortedTeachers.length}
                        page={page}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    />
                </div>
            </div>

            {editingTeacher && (
                <EditTeacher
                    teacher={editingTeacher}
                    classList={classList}
                    subjectList={subjectList}
                    onClose={() => setEditingTeacher(null)}
                    onSuccess={() => { setEditingTeacher(null); fetchDashboardData(); }}
                    showStatus={showStatus}
                />
            )}
        </div>
    );
}