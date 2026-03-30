import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import './MyProfile.css';

export default function MyProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        phone: '+91 98765 43210',
        location: 'Pune, Maharashtra',
        bio: 'Property enthusiast looking for the perfect investment.',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        // Implement save logic here
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information and preferences.</p>
                </div>
                <button 
                    className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'}`}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    ) : (
                        'Edit Profile'
                    )}
                </button>
            </div>

            <div className="profile-form-card">
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                            alt="User" 
                            className="profile-avatar-large" 
                        />
                        {isEditing && (
                            <button className="avatar-upload-btn">
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {isEditing && <p className="avatar-hint">Allowed formats: JPG, PNG. Max size: 2MB.</p>}
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <User className="input-icon" />
                            <input 
                                type="text" 
                                name="name" 
                                value={profileData.name} 
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="styled-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail className="input-icon" />
                            <input 
                                type="email" 
                                name="email" 
                                value={profileData.email} 
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="styled-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                            <Phone className="input-icon" />
                            <input 
                                type="tel" 
                                name="phone" 
                                value={profileData.phone} 
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="styled-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <div className="input-with-icon">
                            <MapPin className="input-icon" />
                            <input 
                                type="text" 
                                name="location" 
                                value={profileData.location} 
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="styled-input"
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Bio</label>
                        <textarea 
                            name="bio" 
                            value={profileData.bio} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="styled-textarea"
                            rows={4}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
