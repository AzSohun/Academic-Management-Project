import React, { useState } from 'react';
import { api } from '@/lib/api';
import { StudentProfile } from '@/interfaces/student';

interface ProfileProps {
    studentProfile: StudentProfile | null;
    fetchStudentData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function Profile({ studentProfile, fetchStudentData, showStatus }: ProfileProps) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        firstName: '', lastName: '', address: '', dateOfBirth: '', parentContact: '',
    });

    const handleOpenEditProfile = () => {
        if (!studentProfile) return;
        setProfileFormData({
            firstName: studentProfile.firstName || '',
            lastName: studentProfile.lastName || '',
            address: studentProfile.address || '',
            dateOfBirth: studentProfile.dateOfBirth ? studentProfile.dateOfBirth.split('T')[0] : '',
            parentContact: studentProfile.parentContact || '',
        });
        setIsEditingProfile(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/student/profile', profileFormData);
            showStatus('success', 'Profile updated successfully!');
            setIsEditingProfile(false);
            fetchStudentData();
        } catch {
            showStatus('error', 'Failed to update profile.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold text-slate-200">My Profile</h3>
                    {!isEditingProfile && (
                        <button onClick={handleOpenEditProfile} className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition cursor-pointer">
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">First Name</label><input type="text" value={profileFormData.firstName} onChange={(e) => setProfileFormData({ ...profileFormData, firstName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" required /></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Last Name</label><input type="text" value={profileFormData.lastName} onChange={(e) => setProfileFormData({ ...profileFormData, lastName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" required /></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Date of Birth</label><input type="date" value={profileFormData.dateOfBirth} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfBirth: e.target.value })} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer scheme-dark" /></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Parent Contact</label><input type="text" value={profileFormData.parentContact} onChange={(e) => setProfileFormData({ ...profileFormData, parentContact: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-400 mb-1.5">Address</label><textarea value={profileFormData.address} onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500" /></div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm font-medium transition cursor-pointer">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-md shadow-violet-600/20">Save Profile</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Full Name</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.firstName} {studentProfile?.lastName}</p></div>
                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.email}</p></div>
                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : 'Not Provided'}</p></div>
                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Parent Contact</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.parentContact || 'Not Provided'}</p></div>
                            <div className="md:col-span-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.address || 'Not Provided'}</p></div>
                        </div>
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <h4 className="text-sm font-semibold text-violet-400 mb-4">Academic Details <span className="text-xs font-normal text-slate-500 ml-2">(Managed by Admin)</span></h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Roll No</p><p className="text-sm text-violet-300 font-mono font-medium">{studentProfile?.rollNo || 'N/A'}</p></div>
                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Group</p><p className="text-sm text-violet-300 font-medium">{studentProfile?.group || 'N/A'}</p></div>
                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Section</p><p className="text-sm text-violet-300 font-medium">{studentProfile?.section || 'N/A'}</p></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}