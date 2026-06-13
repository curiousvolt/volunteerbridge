import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  applicationId: string;
  fromId: string;
  toId: string;
  fromRole: 'student' | 'ngo';
  recipientName: string;
  onClose: () => void;
}

export default function FeedbackModal({ applicationId, fromId, toId, fromRole, recipientName, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        applicationId,
        fromId,
        toId,
        fromRole,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setTimeout(onClose, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-slate-400 text-sm">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-[Space_Grotesk]">Rate Your Experience</h3>
              <p className="text-slate-400 text-sm mt-2">
                {fromRole === 'student'
                  ? `How was your experience volunteering with ${recipientName}?`
                  : `How was ${recipientName} as a volunteer?`}
              </p>
            </div>

            {/* Star rating */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className="star-btn"
                  style={{ filter: (hover || rating) >= n ? 'grayscale(0%) opacity(1)' : 'grayscale(100%) opacity(0.35)' }}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                >
                  ⭐
                </button>
              ))}
            </div>
            {(hover || rating) > 0 && (
              <p className="text-center text-sm font-semibold text-violet-400 mb-6">
                {LABELS[hover || rating]}
              </p>
            )}

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Comments (optional)
              </label>
              <textarea
                className="input-dark resize-none"
                rows={4}
                placeholder={fromRole === 'student'
                  ? 'Describe what you learned, how well the NGO communicated, etc.'
                  : 'Describe the volunteer\'s dedication, punctuality, skill level, etc.'}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {saving ? 'Submitting...' : 'Submit Feedback'}
            </button>

            {rating === 0 && (
              <p className="text-center text-xs text-slate-500 mt-3">Please select a star rating to continue</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
