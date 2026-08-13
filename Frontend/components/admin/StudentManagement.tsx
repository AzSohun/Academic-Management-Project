import React, { useState, useMemo, useEffect } from 'react';
import Pagination from '@/components/common/Pagination';
import EditStudent from '@/components/modals/Admin/EditStudent';
import { StudentDetailed, ClassOption } from '@/interfaces/admin';

interface StudentManagementProps {
    detailedStudents: StudentDetailed[];
    classList: ClassOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function StudentManagement({ detailedStudents, classList, fetchDashboardData, showStatus }: StudentManagementProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [editingStudent, setEditingStudent] = useState<StudentDetailed | null>(null);

    // --- Search, Filter & Sort States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [sortBy, setSortBy] = useState('name_asc');

    const isFilterApplied = searchTerm !== '' || classFilter !== 'All' || sectionFilter !== 'All' || sortBy !== 'name_asc';

    const handleResetFilters = () => {
        setSearchTerm('');
        setClassFilter('All');
        setSectionFilter('All');
        setSortBy('name_asc');
        setPage(1);
    };

    // Extract unique sections dynamically for the dropdown
    const uniqueSections = useMemo(() => {
        const sections = detailedStudents.map(s => s.section || 'N/A').filter(s => s !== 'N/A');
        return ['All', ...Array.from(new Set(sections))];
    }, [detailedStudents]);

    // Apply Search, Filter, and Sorting
    const filteredAndSortedStudents = useMemo(() => {
        let result = [...detailedStudents];

        // Search Logic
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(s =>
                (s.firstName?.toLowerCase() || '').includes(lowerSearch) ||
                (s.lastName?.toLowerCase() || '').includes(lowerSearch) ||
                (s.rollNo?.toLowerCase() || '').includes(lowerSearch) ||
                (s.email?.toLowerCase() || '').includes(lowerSearch)
            );
        }

        // Class Filter Logic
        if (classFilter !== 'All') {
            result = result.filter(s => (s.className || 'Unassigned') === classFilter);
        }

        // 3. Section Filter Logic
        if (sectionFilter !== 'All') {
            result = result.filter(s => (s.section || 'N/A') === sectionFilter);
        }

        // Sorting Logic
        result.sort((a, b) => {
            const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
            const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();

            if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
            if (sortBy === 'name_desc') return nameB.localeCompare(nameA);
            if (sortBy === 'roll') {
                return (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true });
            }
            return 0;
        });

        return result;
    }, [detailedStudents, searchTerm, classFilter, sectionFilter, sortBy]);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, classFilter, sectionFilter, sortBy]);

    const start = (page - 1) * limit;
    const paginatedStudents = filteredAndSortedStudents.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <h3 className="text-sm font-semibold text-slate-200">Students Directory & Enrollments</h3>

                    {/* Controls: Search, Filter, Sort, Reset */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <input
                            type="text"
                            placeholder="Search name, roll or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full md:w-48"
                        />

                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="All">All Classes</option>
                            <option value="Unassigned">Unassigned</option>
                            {classList.map((c) => (
                                <option key={c.id} value={c.className}>{c.className}</option>
                            ))}
                        </select>

                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            {uniqueSections.map(sec => (
                                <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : `Section ${sec}`}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="roll">Roll Number</option>
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
                                <th className="p-3">Roll No</th>
                                <th className="p-3">Group</th>
                                <th className="p-3">Section</th>
                                <th className="p-3">Class</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 font-medium text-slate-200">{s.firstName} {s.lastName}</td>
                                    <td className="p-3 font-mono text-indigo-400">{s.rollNo || 'N/A'}</td>
                                    <td className="p-3 text-slate-400">{s.group || 'N/A'}</td>
                                    <td className="p-3 text-slate-400">{s.section || 'N/A'}</td>
                                    <td className="p-3 font-medium text-emerald-400">{s.className || <span className="text-amber-500/70 font-normal">Unassigned</span>}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => setEditingStudent(s)}
                                            className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 cursor-pointer transition"
                                        >
                                            Edit Info
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredAndSortedStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">
                                        {detailedStudents.length === 0 ? "No students found in the system." : "No students match your filter criteria."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        totalItems={filteredAndSortedStudents.length}
                        page={page}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    />
                </div>
            </div>
            {editingStudent && (
                <EditStudent
                    student={editingStudent}
                    classList={classList}
                    onClose={() => setEditingStudent(null)}
                    onSuccess={() => { setEditingStudent(null); fetchDashboardData(); }}
                    showStatus={showStatus}
                />
            )}
        </div>
    );
}