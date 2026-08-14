'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Submission } from '@/interfaces/teacher';

interface GradeSubmissionProps {
    submission: Submission;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GradeSubmission({ submission, onClose, onSuccess }: GradeSubmissionProps) {
    const maxMarks = (submission as any).assignment?.marks || (submission as any).assignmentMarks || 100;

    const [givenMark, setGivenMark] = useState<string>(
        submission.markAssigned !== null ? submission.markAssigned.toString() : ''
    );
    const [givenFeedback, setGivenFeedback] = useState<string>(submission.teacherFeedback ?? '');
    const [inlineMsg, setInlineMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || /^\d+$/.test(val)) {
            let cleanVal = val.replace(/^0+(?=\d)/, '');
            if (cleanVal !== '' && Number(cleanVal) > maxMarks) {
                cleanVal = maxMarks.toString();
            }
            setGivenMark(cleanVal);
        }
    };

    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineMsg(null);

        if (givenMark === '') {
            setInlineMsg({ text: 'Please assign a valid mark.', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            await api.post(`/teacher/submissions/${submission.id}/grade`, {
                marksAssigned: Number(givenMark),
                feedback: givenFeedback,
                status: 'Graded'
            });

            setInlineMsg({ text: 'Grade & Feedback updated successfully!', type: 'success' });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (error: any) {
            let errorMessage = 'Failed to submit grade. (Server error)';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.errors && typeof data.errors === 'object') {
                    const errorMessages = Object.values(data.errors).flat();
                    errorMessage = errorMessages.join(' | ');
                } else {
                    errorMessage = data.message || data.detail || data.title || (typeof data === 'string' ? data : errorMessage);
                }
            }
            setInlineMsg({ text: errorMessage, type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Evaluate Submission</h3>
                        <p className="text-xs text-slate-400 mt-1">{submission.studentName} - {submission.assignmentTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 p-1.5 rounded-lg transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmitGrade} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Marks Assigned</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max={maxMarks}
                                value={givenMark}
                                onChange={handleMarkChange}
                                placeholder="--"
                                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl p-4 text-3xl font-bold text-center text-emerald-400 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                required
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-medium select-none flex items-center gap-1">
                                <span className="text-slate-600 text-xl font-light">/</span>
                                <span>{maxMarks}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Teacher Feedback / Notes</label>
                        <textarea
                            value={givenFeedback}
                            onChange={(e) => setGivenFeedback(e.target.value)}
                            placeholder="Provide constructive feedback for the student..."
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {inlineMsg && (
                        <div className={`p-3 rounded-lg text-xs font-medium border flex gap-2 items-start ${inlineMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            <span className="mt-0.5">{inlineMsg.type === 'error' ? '⚠' : '✓'}</span>
                            <span>{inlineMsg.text}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition cursor-pointer disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition cursor-pointer shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center min-w-30">
                            {isLoading ? <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> : 'Save Grade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}