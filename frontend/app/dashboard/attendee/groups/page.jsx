'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FaUsers,
  FaSearch,
  FaPaperPlane,
  FaImage,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaEllipsisV,
  FaTimes
} from 'react-icons/fa';

const getEvents = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/public/`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export default async function EventGroupsPage() {
  const events = await getEvents();

  // Filter registered events
  const userRegisteredEvents = events.filter(event => {
    // You can add more conditions based on user registration status
    return event.joinedCount > 0;
  });

  // Extend events with chat data
  const eventGroups = userRegisteredEvents.map(event => ({
    ...event,
    onlineMembers: Math.floor(Math.random() * 20) + 1,
    messages: [
      {
        id: 1,
        sender: event.organizer.name,
        avatar: event.organizer.logo,
        message: `Welcome to ${event.title} group! Please check the event details above.`,
        time: "2:30 PM",
        isOrganizer: true,
        status: 'read'
      }
    ]
  }));

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const filteredGroups = eventGroups.filter(group =>
    group.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup?.messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      avatar: "https://placekitten.com/100/100", // Replace with actual user avatar
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      isOrganizer: false,
      status: 'sent'
    };

    setSelectedGroup(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex gap-6">
      {/* Left Sidebar - Event Groups List */}
      <div className="w-96 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Event Groups</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full p-4 border-b hover:bg-gray-50 transition-colors ${
                selectedGroup?.id === group.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={group.image}
                  alt={group.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{group.title}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {group.messages[group.messages.length - 1]?.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {group.onlineMembers} online
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {group.joinedCount} members
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      {selectedGroup ? (
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedGroup.image}
                  alt={selectedGroup.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{selectedGroup.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaUsers className="w-4 h-4" />
                    <span>{selectedGroup.joinedCount} members</span>
                    <span>•</span>
                    <span>{selectedGroup.onlineMembers} online</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FaEllipsisV className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Event Details */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt className="w-4 h-4 text-[#f6405f]" />
                  <span>{selectedGroup.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="w-4 h-4 text-[#f6405f]" />
                  <span>{selectedGroup.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 text-[#f6405f]" />
                  <span>{selectedGroup.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {selectedGroup.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${
                  msg.sender === "You" ? 'flex-row-reverse' : ''
                }`}
              >
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className={`flex-1 ${msg.sender === "You" ? 'flex flex-col items-end' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${
                    msg.sender === "You" ? 'flex-row-reverse' : ''
                  }`}>
                    {msg.sender === "You" ? (
                      <>
                        <span className="text-xs text-gray-400">{msg.time}</span>
                        <span className="font-medium">You</span>
                      </>
                    ) : (
                      <>
                        <span className={`font-medium ${msg.isOrganizer ? 'text-[#f6405f]' : ''}`}>
                          {msg.sender}
                        </span>
                        {msg.isOrganizer && (
                          <span className="text-xs bg-[#f6405f]/10 text-[#f6405f] px-2 py-0.5 rounded">
                            Organizer
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{msg.time}</span>
                      </>
                    )}
                  </div>
                  
                  <div 
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "You"
                        ? 'bg-[#f6405f] text-white rounded-tr-none'
                        : 'bg-white text-gray-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  
                  {msg.sender === "You" && (
                    <div className="text-xs text-gray-400 mt-1">
                      {msg.status === 'sent' && '✓'}
                      {msg.status === 'delivered' && '✓✓'}
                      {msg.status === 'read' && <span className="text-blue-500">✓✓</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <FaImage className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                  message.trim() 
                    ? 'bg-[#f6405f] text-white hover:bg-[#d63850]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // No Group Selected State
        <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <div className="text-center">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Select an Event Group</h3>
            <p className="text-gray-500 mt-2">Choose a group from the left to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}