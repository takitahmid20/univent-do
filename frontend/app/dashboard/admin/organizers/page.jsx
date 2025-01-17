"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import { FaTrash, FaSearch, FaEye, FaTimes } from 'react-icons/fa';

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.ADMIN_LIST_ORGANIZERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('adminToken');
          window.location.href = '/dashboard/admin/login';
          return;
        }
        throw new Error('Failed to fetch organizers');
      }

      const data = await response.json();
      const formattedOrganizers = data.organizers.map(organizer => ({
        id: organizer.id,
        email: organizer.email,
        username: organizer.username,
        organizationName: organizer.organizationName || 'N/A',
        organizationCategory: organizer.organizationCategory || 'N/A',
        websiteUrl: organizer.websiteUrl || 'N/A',
        phone: organizer.phone || 'N/A',
        description: organizer.description || 'N/A',
        joinedAt: new Date(organizer.joinedAt).toLocaleString()
      }));

      setOrganizers(formattedOrganizers);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (organizer) => {
    setOrganizerToDelete(organizer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.ADMIN_DELETE_ORGANIZER(organizerToDelete.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete organizer');
      }

      setOrganizers(organizers.filter(org => org.id !== organizerToDelete.id));
      setShowDeleteModal(false);
      setOrganizerToDelete(null);
    } catch (err) {
      console.error('Error deleting organizer:', err);
      setError(err.message);
    }
  };

  const handleViewProfile = (organizer) => {
    setSelectedOrganizer(organizer);
    setShowProfileModal(true);
  };

  const filteredOrganizers = organizers.filter(organizer => 
    organizer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Organizers Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search organizers..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#f6405f] focus:border-[#f6405f]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrganizers.map((organizer) => (
              <tr key={organizer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{organizer.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{organizer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{organizer.organizationName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewProfile(organizer)}
                    className="text-[#f6405f] hover:text-[#d93350] mr-4"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(organizer)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrganizers.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No organizers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Organizer</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this organizer? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrganizerToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {showProfileModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Organizer Profile</h3>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedOrganizer(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Username</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.username}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Organization Name</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.organizationName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Organization Category</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.organizationCategory}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrganizer.websiteUrl !== 'N/A' ? (
                    <a 
                      href={selectedOrganizer.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#f6405f] hover:text-[#d93350]"
                    >
                      {selectedOrganizer.websiteUrl}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Joined At</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedOrganizer.joinedAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}