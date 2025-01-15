'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaCamera } from 'react-icons/fa';
import { getUniversities, searchUniversities } from '@/lib/data/universityData';
import * as Yup from 'yup';
import { API_ENDPOINTS } from '@/lib/config';

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number format'),
  university: Yup.string()
    .required('University is required'),
  department: Yup.string()
    .required('Department is required')
    .min(2, 'Department must be at least 2 characters'),
  bio: Yup.string()
    .max(500, 'Bio must not exceed 500 characters')
});

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    university: '',
    department: '',
    studentId: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          console.log('No token or user found');
          router.replace('/signin');
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.userType || user.userType !== 'attendee') {
          console.log('Invalid user type:', user.userType);
          router.replace('/signin');
          return;
        }

        // Fetch user profile data
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await response.json();
        setFormData({
          name: profileData.user.fullName || '',
          email: profileData.user.email || '',
          phone: profileData.user.phone || '',
          avatar: profileData.user.profilePicture || '',
          university: profileData.user.university || '',
          department: profileData.user.department || '',
          studentId: '',
          bio: profileData.user.location || ''
        });
        if (profileData.user.profilePicture) {
          setImagePreview(profileData.user.profilePicture);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth/Profile fetch error:', error);
        router.replace('/signin');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const allUniversities = getUniversities();
    setUniversities(allUniversities);
    setFilteredUniversities(allUniversities);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.shortName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUniversities(results);
    } else {
      setFilteredUniversities(universities);
    }
  }, [searchQuery, universities]);

  const validateField = async (name, value) => {
    try {
      await validationSchema.validateAt(name, { [name]: value });
      setErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [name]: error.message }));
    }
  };

  const handleChange = async (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    await validateField(name, value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB)
    if (file.size > 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 1MB' });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG and PNG files are allowed' });
      return;
    }

    // Create image preview
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(0);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        setUploadProgress(progress);
      }
    };
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setUploadProgress(100);
      setFormData(prev => ({ ...prev, avatar: file }));
      setTimeout(() => setUploadProgress(0), 1000);
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Error reading file' });
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Validate all fields
      await validationSchema.validate(formData, { abortEarly: false });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // First update email separately if it was changed
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (currentUser && formData.email !== currentUser.email) {
        // Update email first
        const emailUpdateResponse = await fetch(API_ENDPOINTS.UPDATE_EMAIL, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: formData.email })
        });

        if (!emailUpdateResponse.ok) {
          const emailError = await emailUpdateResponse.json();
          if (emailUpdateResponse.status === 409) {
            throw new Error('This email is already registered. Please use a different email.');
          }
          throw new Error(emailError.message || 'Failed to update email');
        }
      }

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      
      // Map frontend field names to backend field names
      formDataToSend.append('fullName', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('university', formData.university);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('location', formData.bio);

      // Append file separately if exists
      if (formData.avatar instanceof File) {
        formDataToSend.append('profilePicture', formData.avatar);
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('Failed to update profile - Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      // Update local storage
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          university: formData.university,
          department: formData.department,
          location: formData.bio
        }));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        setMessage({ type: 'error', text: 'Please fix the errors below' });
        
        // Scroll to first error
        const firstError = document.querySelector('.error-message');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setMessage({ type: 'error', text: error.message || 'Error updating profile' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {message.text && (
          <div
            className={`${
              message.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            } px-4 py-2 rounded-lg mb-4`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={imagePreview || formData.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-[#f6405f] text-white rounded-full cursor-pointer hover:bg-[#d63850]">
                <FaCamera className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </label>
              {uploadProgress > 0 && (
                <div className="absolute -bottom-6 left-0 w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-[#f6405f] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">Profile Photo</h3>
              <p className="text-sm text-gray-500">JPG or PNG, max 1MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.phone}</p>
              )}
            </div>

            {/* University Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUniversity className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search university..."
                  value={showUniversityDropdown ? searchQuery : selectedUniversity}
                  onChange={(e) => {
                    if (showUniversityDropdown) {
                      setSearchQuery(e.target.value);
                    } else {
                      setSelectedUniversity(e.target.value);
                      handleChange('university', e.target.value);
                    }
                  }}
                  onFocus={() => {
                    setShowUniversityDropdown(true);
                    setSearchQuery('');
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowUniversityDropdown(false);
                    }, 200);
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.university ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {showUniversityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUniversities.map((uni) => (
                      <button
                        key={uni.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedUniversity(uni.name);
                          handleChange('university', uni.name);
                          setShowUniversityDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="font-medium">{uni.name}</div>
                        <div className="text-sm text-gray-500">
                          {uni.shortName} • {uni.location}
                        </div>
                      </button>
                    ))}
                    {filteredUniversities.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">
                        No universities found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.university && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.university}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.department}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tell us about yourself..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63850] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}