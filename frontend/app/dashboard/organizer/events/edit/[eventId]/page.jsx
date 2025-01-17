'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaImage, FaMapMarkerAlt, FaCalendar, FaClock, FaTicketAlt, FaInfoCircle, FaUsers, FaTimes } from 'react-icons/fa';
import * as Yup from 'yup';
import { use } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/config';

const EVENT_CATEGORIES = [
  { value: 'tech', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'sports', label: 'Sports' },
  { value: 'education', label: 'Education' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'charity', label: 'Charity' },
  { value: 'other', label: 'Other' }
];

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(['tech', 'business', 'entertainment', 'sports', 'education', 'cultural', 'charity', 'other'], 'Invalid category'),
  date: Yup.date()
    .required('Date is required')
    .min(new Date(), 'Event date cannot be in the past'),
  time: Yup.string()
    .required('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  location: Yup.string()
    .required('Venue name is required')
    .min(3, 'Venue name must be at least 3 characters'),
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Please provide a complete address'),
  ticketPrice: Yup.number()
    .required('Ticket price is required')
    .min(0, 'Price cannot be negative')
    .transform((value) => (isNaN(value) ? undefined : value)),
  maxAttendees: Yup.number()
    .required('Maximum attendees is required')
    .min(1, 'Must allow at least 1 attendee')
    .integer('Must be a whole number')
    .transform((value) => (isNaN(value) ? undefined : value))
});

function EditEventPage({ eventId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    address: '',
    ticketPrice: '',
    maxAttendees: '',
    image: null,
    publication_status: 'draft'
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/signin');
          return;
        }

        console.log('Fetching event with ID:', eventId);
        const response = await fetch(API_ENDPOINTS.GET_EVENT_DETAILS(eventId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch event');
        }

        const event = await response.json();
        console.log('Received event data:', event);
        
        // Format the date
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toISOString().split('T')[0];

        // Format the time (assuming time is in HH:MM:SS format)
        const timeMatch = event.event_time.match(/(\d{2}):(\d{2})/);
        const formattedTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '00:00';

        // Set event data
        setEventData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || '',
          date: formattedDate,
          time: formattedTime,
          location: event.venue || '',
          address: event.address || '',
          ticketPrice: event.ticket_price ? event.ticket_price.toString() : '0',
          maxAttendees: event.max_attendees ? event.max_attendees.toString() : '',
          image: null,
          currentImageUrl: event.image_url || '',  // Store current image URL
          publication_status: event.publication_status || 'draft'
        });

        // Set image preview if exists (check both banner_image and image_url)
        const imageUrl = event.banner_image || event.image_url;
        if (event.image_url) {
          setImagePreview(event.image_url);  // Use Cloudinary URL directly
          console.log('Setting image preview:', event.image_url);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setSubmitError(error.message);
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const validateField = async (name, value) => {
    try {
      if (name === 'ticketPrice' || name === 'maxAttendees') {
        value = value === '' ? undefined : Number(value);
      }
      
      await validationSchema.validateAt(name, { [name]: value });
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [name]: error.message }));
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate form data
      await validationSchema.validate(eventData, { abortEarly: false });

      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/signin');
        return;
      }

      // First upload new image if exists
      let imageUrl = eventData.currentImageUrl; // Use existing image URL by default
      if (eventData.image instanceof File) {
        const formData = new FormData();
        formData.append('file', eventData.image);

        try {
          console.log('Uploading new image to Cloudinary...');
          const imageResponse = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }

          const imageData = await imageResponse.json();
          imageUrl = imageData.image_url;  // Get new Cloudinary URL
          console.log('New image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error('Failed to upload image: ' + error.message);
        }
      }

      // Prepare event update data
      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        event_date: eventData.date,
        event_time: eventData.time,
        venue: eventData.location,
        address: eventData.address,
        ticket_price: parseFloat(eventData.ticketPrice),
        max_attendees: parseInt(eventData.maxAttendees),
        image_url: imageUrl,  // Use new or existing Cloudinary URL
        publication_status: eventData.publication_status
      };

      // Send update request
      const response = await fetch(API_ENDPOINTS.UPDATE_EVENT(eventId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      router.push('/dashboard/organizer/events');
      router.refresh();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please upload an image file'
        }));
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 10MB'
        }));
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        image: undefined
      }));

      // Set the file for upload
      setEventData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setEventData(prev => ({
      ...prev,
      image: null
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Edit Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            {/* Event Image */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Event Banner
                <span className="text-gray-500 text-xs ml-2">(Required)</span>
              </label>
              <div
                className={`mt-2 ${imagePreview ? 'p-4' : 'px-6 pt-5 pb-6'} border-2 ${
                  isDragging ? 'border-[#f6405f]' : 'border-dashed'
                } rounded-lg ${errors.image ? 'border-red-500' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-gray-400">
                      <FaImage className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-[#f6405f] hover:text-[#d63850] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#f6405f] focus-within:ring-offset-2">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <span>or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.image}</p>
              )}
            </div>

            {/* Event Title */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Event Title
                <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Min. 5 characters)</span>
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.title}</p>
              )}
            </div>

            {/* Event Description */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Description
                <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Min. 20 characters)</span>
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter event description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Category
                <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={eventData.category}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {EVENT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500 error-message">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Date and Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Date
                  <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Future date only)</span>
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Time
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Venue Name
                  <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Min. 3 characters)</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={eventData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter venue name"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.location}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Address
                  <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Min. 10 characters)</span>
                </label>
                <textarea
                  name="address"
                  value={eventData.address}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                  rows="2"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Ticket Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Ticket Price (৳)
                  <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Min. 0)</span>
                </label>
                <div className="relative">
                  <FaTicketAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    name="ticketPrice"
                    value={eventData.ticketPrice}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                      errors.ticketPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter ticket price"
                  />
                </div>
                {errors.ticketPrice && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.ticketPrice}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Maximum Attendees
                  <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Min. 1)</span>
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    name="maxAttendees"
                    value={eventData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className={`w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] ${
                      errors.maxAttendees ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter maximum attendees"
                  />
                </div>
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-500 error-message">{errors.maxAttendees}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => {
                setEventData(prev => ({ ...prev, publication_status: 'draft' }));
              }}
              className="px-6 py-2 border border-[#f6405f] text-[#f6405f] rounded-lg font-medium hover:bg-[#fff1f3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              onClick={() => {
                setEventData(prev => ({ ...prev, publication_status: 'published' }));
              }}
              className="px-6 py-2 bg-[#f6405f] text-white rounded-lg font-medium hover:bg-[#d63850] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page({ params }) {
  const resolvedParams = use(params);
  return <EditEventPage eventId={resolvedParams.eventId} />;
}
