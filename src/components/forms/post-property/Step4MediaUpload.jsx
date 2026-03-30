import React, { useState, useRef, useCallback } from 'react';

const PHOTO_CATEGORIES = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Other'];
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function Step4MediaUpload({ formData, updateField }) {
    const [activeTab, setActiveTab] = useState('All');
    const [dragOver, setDragOver] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(formData.audioURL || '');
    const fileInputRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const photos = formData.photos || [];

    const handleFiles = useCallback((files) => {
        const validFiles = Array.from(files).filter(f => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return false;
            if (f.size > MAX_FILE_SIZE) return false;
            return true;
        });

        const remainingSlots = MAX_PHOTOS - photos.length;
        const toAdd = validFiles.slice(0, remainingSlots);

        const newPhotos = toAdd.map((file, i) => ({
            id: Date.now() + i,
            file,
            url: URL.createObjectURL(file),
            category: activeTab === 'All' ? 'Other' : activeTab,
            isCover: photos.length === 0 && i === 0,
        }));

        updateField('photos', [...photos, ...newPhotos]);
    }, [photos, activeTab, updateField]);

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const deletePhoto = (id) => {
        const updated = photos.filter(p => p.id !== id);
        // if deleted photo was cover, make first one cover
        if (updated.length > 0 && !updated.some(p => p.isCover)) {
            updated[0].isCover = true;
        }
        updateField('photos', updated);
    };

    const setCover = (id) => {
        const updated = photos.map(p => ({ ...p, isCover: p.id === id }));
        updateField('photos', updated);
    };

    const filteredPhotos = activeTab === 'All'
        ? photos
        : photos.filter(p => p.category === activeTab);

    /* ── Audio Recording ── */
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                audioChunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                updateField('audioFile', blob);
                updateField('audioURL', url);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Mic access denied', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="ppf-step-content" key="step4">
            <h2 className="ppf-heading">Add photos & media to attract more buyers</h2>

            {/* ── Photo Upload Zone ── */}
            <div
                className={`ppf-upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <svg className="ppf-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="ppf-upload-text">
                    Drag & drop photos here or <strong>browse</strong>
                </p>
                <p className="ppf-upload-hint">
                    JPG, PNG or WebP • Max 10 MB per photo • Up to {MAX_PHOTOS} photos
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* ── Photo Counter ── */}
            <div className="ppf-photo-counter">
                <span className="count">{photos.length}/{MAX_PHOTOS}</span> photos uploaded
                {photos.length < 3 && (
                    <span style={{ color: 'var(--red-500)', fontSize: '0.82rem', marginLeft: 8 }}>
                        • Min 3 recommended
                    </span>
                )}
            </div>

            {/* ── Category Tabs ── */}
            <div className="ppf-photo-tabs">
                {PHOTO_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`ppf-photo-tab ${activeTab === cat ? 'active' : ''}`}
                        onClick={() => setActiveTab(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Photo Grid ── */}
            {filteredPhotos.length > 0 && (
                <div className="ppf-photo-grid">
                    {filteredPhotos.map((photo) => (
                        <div key={photo.id} className={`ppf-photo-thumb ${photo.isCover ? 'cover' : ''}`}>
                            <img src={photo.url} alt="Property" />
                            {photo.isCover && <span className="ppf-cover-badge">Cover</span>}
                            <div className="ppf-photo-overlay">
                                {!photo.isCover && (
                                    <button type="button" className="ppf-photo-cover-btn"
                                        onClick={(e) => { e.stopPropagation(); setCover(photo.id); }}>
                                        ★ Cover
                                    </button>
                                )}
                                <button type="button" className="ppf-photo-delete"
                                    onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <hr className="ppf-divider" />

            {/* ── Video Upload ── */}
            <div className="ppf-media-section">
                <p className="ppf-media-section-title">
                    🎬 Video <span className="ppf-media-badge">Optional</span>
                </p>
                <div className="ppf-form-row">
                    <div className="ppf-field">
                        <label className="ppf-field-label">Upload video file</label>
                        <input
                            className="ppf-input"
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    updateField('videoFile', e.target.files[0]);
                                }
                            }}
                        />
                    </div>
                    <div className="ppf-field">
                        <label className="ppf-field-label">Or paste YouTube link</label>
                        <input
                            className="ppf-input"
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={formData.videoUrl}
                            onChange={(e) => updateField('videoUrl', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Voice-over ── */}
            <div className="ppf-media-section">
                <p className="ppf-media-section-title">
                    🎙️ Voice-over <span className="ppf-media-badge">Optional</span>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
                    Record a short audio description of your property
                </p>

                <div className="ppf-record-controls">
                    <button
                        type="button"
                        className={`ppf-record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                    >
                        {isRecording ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>
                    <span style={{ fontSize: '0.85rem', color: isRecording ? 'var(--red-500)' : 'var(--gray-500)' }}>
                        {isRecording ? 'Recording… click to stop' : 'Click to record'}
                    </span>
                </div>

                {audioURL && (
                    <audio controls src={audioURL} style={{ marginTop: 12, width: '100%', maxWidth: 400 }} />
                )}

                <div style={{ marginTop: 12 }}>
                    <label className="ppf-field-label">Or upload audio file</label>
                    <input
                        className="ppf-input"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                const url = URL.createObjectURL(e.target.files[0]);
                                updateField('audioFile', e.target.files[0]);
                                updateField('audioURL', url);
                                setAudioURL(url);
                            }
                        }}
                    />
                </div>
            </div>

            {/* ── Tips Card ── */}
            <div className="ppf-tips-card">
                <span className="ppf-tips-icon">💡</span>
                <p className="ppf-tips-text">
                    Photos with good lighting get <strong>2x more enquiries</strong>.
                    Add at least 3 photos from different angles for best results.
                </p>
            </div>
        </div>
    );
}
