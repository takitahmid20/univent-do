'use client';
import { useState } from 'react';
import { FaSearch, FaUsers, FaUser, FaClock } from 'react-icons/fa';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('events');
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Mock data - replace with your actual data
  const personalChats = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Thanks for organizing the event!",
      time: "2:30 PM",
      unread: 2
    },
    {
      id: 2,
      name: "Sarah Wilson",
      lastMessage: "Is there space for one more person?",
      time: "11:20 AM",
      unread: 0
    }
  ];

  const eventChats = [
    {
      id: 1,
      eventName: "Tech Conference 2024",
      memberCount: 156,
      lastMessage: "Please check your tickets before arrival",
      time: "3:45 PM",
      unread: 5
    },
    {
      id: 2,
      eventName: "Art Exhibition",
      memberCount: 89,
      lastMessage: "Venue doors open at 6 PM",
      time: "1:15 PM",
      unread: 0
    }
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-white">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[#f6405f]"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'personal' 
                ? 'border-b-2 border-[#f6405f] text-[#f6405f]' 
                : 'text-gray-500'
            }`}
          >
            Personal Chats
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'events' 
                ? 'border-b-2 border-[#f6405f] text-[#f6405f]' 
                : 'text-gray-500'
            }`}
          >
            Event Groups
          </button>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto">
          {activeTab === 'personal' ? (
            // Personal Chats
            personalChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat({ type: 'personal', ...chat })}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <FaUser className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="ml-2 bg-[#f6405f] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))
          ) : (
            // Event Group Chats
            eventChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat({ type: 'event', ...chat })}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <FaUsers className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{chat.eventName}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <FaUsers className="mr-1" /> {chat.memberCount} members
                  </div>
                </div>
                {chat.unread > 0 && (
                  <span className="ml-2 bg-[#f6405f] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b">
            <div className="flex items-center">
              {selectedChat.type === 'personal' ? (
                <FaUser className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
              ) : (
                <FaUsers className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
              )}
              <div className="ml-4">
                <h2 className="font-medium">
                  {selectedChat.type === 'personal' ? selectedChat.name : selectedChat.eventName}
                </h2>
                {selectedChat.type === 'event' && (
                  <p className="text-sm text-gray-500">
                    {selectedChat.memberCount} members
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-sm text-gray-500">
              <FaClock className="inline-block mr-2" />
              Start of conversation
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:border-[#f6405f]"
              />
              <button className="px-6 py-2 bg-[#f6405f] text-white rounded-r-lg hover:bg-[#d63850]">
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        // No Chat Selected State
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <FaUsers className="w-16 h-16 mx-auto mb-4" />
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}