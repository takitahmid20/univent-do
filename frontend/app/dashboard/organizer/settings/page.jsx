'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCamera, FaTimes, FaGlobe, FaFacebook, FaCopy } from 'react-icons/fa';
import * as Yup from 'yup';
import { API_ENDPOINTS } from '@/lib/config';

// Organization categories constant
const ORGANIZATION_CATEGORIES = [
  'University Club',
  'Professional Organization',
  'Student Organization',
  'Non-Profit Organization',
  'Corporate Organization',
  'Government Organization',
  'Technology',
  'Other'
];

// Helper function to format URL
const formatUrl = (url) => {
  if (!url) return '';
  
  // Remove any leading/trailing whitespace
  url = url.trim();
  
  // If it already has a protocol, return as is
  if (url.match(/^https?:\/\//i)) return url;
  
  // Add https:// to the URL
  return `https://${url}`;
};

// Helper function to validate URL format
const isValidUrl = (url) => {
  if (!url) return false;
  
  // Add https:// if no protocol is present
  const urlToTest = url.match(/^https?:\/\//i) ? url : `https://${url}`;
  
  try {
    new URL(urlToTest);
    return true;
  } catch (err) {
    // Try adding www. if the URL fails
    try {
      if (!urlToTest.includes('www.')) {
        new URL(urlToTest.replace('https://', 'https://www.'));
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  }
};

// Validation schema
const validationSchema = Yup.object({
  organizationName: Yup.string()
    .required('Organization name is required')
    .min(2, 'Organization name must be at least 2 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number format'),
  websiteUrl: Yup.string()
    .required('Website URL is required')
    .test('is-valid-url', 'Please enter a valid URL', function(value) {
      if (!value) return false;
      return isValidUrl(value);
    })
    .transform(formatUrl),
  facebookUrl: Yup.string()
    .nullable()
    .test('is-valid-url', 'Please enter a valid URL', function(value) {
      if (!value) return true; // Allow empty value
      return isValidUrl(value);
    })
    .transform(value => value ? formatUrl(value) : ''),
  organizationCategory: Yup.string()
    .required('Organization category is required')
    .oneOf(ORGANIZATION_CATEGORIES, 'Invalid organization category'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
  slug: Yup.string()
    .required('Profile URL is required')
    .min(2, 'Profile URL must be at least 2 characters')
    .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed')
});

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: '',
    phone: '',
    websiteUrl: '',
    facebookUrl: '',
    organizationCategory: '',
    description: '',
    profilePicture: null,
    slug: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.replace('/signin');
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.userType || user.userType !== 'organizer') {
          router.replace('/signin');
          return;
        }

        // Fetch organization profile
        const response = await fetch(API_ENDPOINTS.UPDATE_ORGANIZER_PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setFormData({
          organizationName: data.user.organizationName || '',
          phone: data.user.phone || '',
          websiteUrl: data.user.websiteUrl || '',
          facebookUrl: data.user.facebookUrl || '',
          organizationCategory: data.user.organizationCategory || '',
          description: data.user.description || '',
          profilePicture: data.user.profilePicture || null,
          slug: data.user.slug || ''
        });
        
        if (data.user.profilePicture) {
          setImagePreview(data.user.profilePicture);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.replace('/signin');
      }
    };

    checkAuth();
  }, []);

  const validateField = async (name, value) => {
    try {
      // Skip validation for optional fields if they're empty
      if (name === 'facebookUrl' && !value) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return;
      }

      // Validate the field
      await validationSchema.validateAt(name, { [name]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
      setFormData(prev => ({ ...prev, profilePicture: file }));
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
    setMessage({ type: '', text: '' });
    
    try {
      // Format URLs before validation
      const dataToValidate = {
        ...formData,
        websiteUrl: formatUrl(formData.websiteUrl),
        facebookUrl: formData.facebookUrl ? formatUrl(formData.facebookUrl) : ''
      };

      await validationSchema.validate(dataToValidate, { abortEarly: false });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      Object.keys(dataToValidate).forEach(key => {
        if (key === 'profilePicture') {
          if (dataToValidate[key] instanceof File) {
            formDataToSend.append('profilePicture', dataToValidate[key]);
          }
        } else {
          formDataToSend.append(key, dataToValidate[key] || '');
        }
      });

      const response = await fetch(API_ENDPOINTS.UPDATE_ORGANIZER_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update form data with response
      setFormData(prev => ({
        ...prev,
        organizationName: data.user.organizationName || '',
        phone: data.user.phone || '',
        websiteUrl: data.user.websiteUrl || '',
        facebookUrl: data.user.facebookUrl || '',
        organizationCategory: data.user.organizationCategory || '',
        description: data.user.description || '',
        profilePicture: data.user.profilePicture || null,
        slug: data.user.slug || ''
      }));

      if (data.user.profilePicture) {
        setImagePreview(data.user.profilePicture);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          organizationName: formData.organizationName
        }));
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        setMessage({ type: 'error', text: 'Please fix the errors below' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Error updating profile' });
      }
    }
  };

  const handleCopyUrl = async () => {
    const url = `https://univent-frontend.vercel.app/organizers/${formData.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL:', err);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>

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
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={imagePreview || formData.profilePicture || '/default-org-logo.png'}
                alt="Organization Logo"
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
            </div>
            {uploadProgress > 0 && (
              <div className="flex-1 max-w-xs">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-[#f6405f] rounded"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Organization Name */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                errors.organizationName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.organizationName && (
              <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>
            )}
          </div>

          {/* Profile URL */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Profile URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-0">
              <div className="flex-shrink-0 px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm break-all">
                https://univent-frontend.vercel.app/organizers/
              </div>
              <div className="flex flex-1 min-w-0">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="ml-2 px-3 py-2 text-gray-600 hover:text-[#f6405f] transition-colors"
                >
                  {copySuccess ? (
                    <span className="text-green-500 text-sm">Copied!</span>
                  ) : (
                    <FaCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
            )}
          </div>

          {/* Organization Category */}
          <div>
            <label htmlFor="organizationCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Category
            </label>
            <select
              name="organizationCategory"
              value={formData.organizationCategory}
              onChange={(e) => handleChange('organizationCategory', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                errors.organizationCategory ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {ORGANIZATION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.organizationCategory && (
              <p className="mt-1 text-sm text-red-500">{errors.organizationCategory}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <div className="relative">
              <FaGlobe className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => handleChange('websiteUrl', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.websiteUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.websiteUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p>
            )}
          </div>

          {/* Facebook URL */}
          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL (Optional)
            </label>
            <div className="relative">
              <FaFacebook className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.facebookUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.facebookUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.facebookUrl}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63850] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}