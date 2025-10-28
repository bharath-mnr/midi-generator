// // frontend/src/Components/ChatBot.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Send, Upload, Download, Copy, X, CheckCircle, 
//   AlertCircle, Loader2, FileMusic, Plus, User, LogOut,
//   Settings, Trash2, Crown, MessageSquare, PanelRight, Monitor, 
//   Globe, Mail
// } from 'lucide-react';
// import authService from '../services/authService';
// import axiosInstance from '../services/axiosConfig'; // ✅ USE THIS INSTEAD OF AXIOS
// import { getErrorMessage } from '../utils/errorUtils';

// const THINKING_MESSAGES = [
//   "Analyzing musical patterns...",
//   "Composing harmonic progressions...",
//   "Crafting melodic structures...",
//   "Balancing voice leading...",
//   "Generating rhythmic patterns...",
// ];

// // Extract bar count from user message
// const extractBarCount = (text) => {
//   if (!text) return null;
  
//   const pattern1 = /(\d+)\s*bars?/i;
//   const match1 = text.match(pattern1);
//   if (match1) {
//     const count = parseInt(match1[1]);
//     if (count > 0 && count <= 500) {
//       console.log('📊 Extracted bar count from message:', count);
//       return count;
//     }
//   }
  
//   const pattern2 = /bars?[\s:=]+(\d+)/i;
//   const match2 = text.match(pattern2);
//   if (match2) {
//     const count = parseInt(match2[1]);
//     if (count > 0 && count <= 500) {
//       console.log('📊 Extracted bar count from message:', count);
//       return count;
//     }
//   }
  
//   return null;
// };

// const ChatBot = ({ isAuthenticated, user, onOpenAuth, onNavigate, onLogout }) => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [thinkingMessage, setThinkingMessage] = useState('');
//   const [uploadedMidi, setUploadedMidi] = useState(null);
//   const [lastGeneration, setLastGeneration] = useState(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [chatSessions, setChatSessions] = useState([]);
//   const [currentSessionId, setCurrentSessionId] = useState(null);
//   const [showVSTModal, setShowVSTModal] = useState(false);
  
//   // Email verification state
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  
//   // Track if we've already fetched profile to prevent duplicate calls
//   const profileFetched = useRef(false);
  
//   const chatEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);
//   const thinkingIntervalRef = useRef(null);
//   const userMenuRef = useRef(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Single useEffect for authentication and profile
//   useEffect(() => {
//     if (isAuthenticated && !profileFetched.current) {
//       profileFetched.current = true;
//       fetchUserProfile();
//       fetchChatSessions();
//     } else if (!isAuthenticated) {
//       // Reset when logged out
//       profileFetched.current = false;
//       setEmailVerified(false);
//       setShowVerificationBanner(false);
//       setUserProfile(null);
//     }
//   }, [isAuthenticated]);

//   useEffect(() => {
//     if (isLoading) {
//       let index = 0;
//       setThinkingMessage(THINKING_MESSAGES[0]);
//       thinkingIntervalRef.current = setInterval(() => {
//         index = (index + 1) % THINKING_MESSAGES.length;
//         setThinkingMessage(THINKING_MESSAGES[index]);
//       }, 2500);
//     } else {
//       if (thinkingIntervalRef.current) {
//         clearInterval(thinkingIntervalRef.current);
//       }
//     }
//     return () => {
//       if (thinkingIntervalRef.current) {
//         clearInterval(thinkingIntervalRef.current);
//       }
//     };
//   }, [isLoading]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setShowUserMenu(false);
//       }
//     };

//     if (showUserMenu) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showUserMenu]);

//   // ✅ UPDATED: Use axiosInstance
//   const fetchUserProfile = async () => {
//     try {
//       if (!authService.isAuthenticated()) {
//         console.log('⚠️ Not authenticated, skipping profile fetch');
//         return;
//       }
      
//       console.log('📡 Fetching user profile...');
//       const response = await axiosInstance.get('/user/profile');
//       const profileData = response.data;
      
//       console.log('✅ Profile received:', {
//         email: profileData.email,
//         emailVerified: profileData.emailVerified,
//         remainingGenerations: profileData.remainingGenerations,
//         dailyCount: profileData.dailyGenerationCount
//       });
      
//       setUserProfile(profileData);
      
//       const isVerified = profileData?.emailVerified === true;
//       setEmailVerified(isVerified);
//       setShowVerificationBanner(!isVerified && isAuthenticated);
      
//       console.log('📧 Verification status updated:', {
//         emailVerified: isVerified,
//         showBanner: !isVerified && isAuthenticated
//       });
      
//     } catch (error) {
//       console.error('❌ Failed to fetch profile:', error);
//       if (error.response?.status === 401) {
//         authService.logout();
//         onOpenAuth('login');
//       }
//     }
//   };

//   // ✅ UPDATED: Use axiosInstance
//   const fetchChatSessions = async () => {
//     try {
//       if (!authService.isAuthenticated()) return;
      
//       const response = await axiosInstance.get('/chat/sessions');
//       setChatSessions(response.data);
//     } catch (error) {
//       console.error('Failed to fetch chat sessions:', error);
//     }
//   };

//   // ✅ UPDATED: Use axiosInstance
//   const loadChatSession = async (sessionId) => {
//     try {
//       const response = await axiosInstance.get(`/chat/sessions/${sessionId}`);
      
//       const loadedMessages = response.data.map(chat => ([
//         {
//           id: chat.id + '-user',
//           type: 'user',
//           content: chat.userMessage,
//           timestamp: chat.createdAt
//         },
//         {
//           id: chat.id + '-bot',
//           type: 'bot',
//           content: chat.botResponse,
//           midiUrl: chat.midiUrl,
//           barCount: chat.generatedBars,
//           source: chat.source || 'web',
//           timestamp: chat.createdAt
//         }
//       ])).flat();
      
//       setMessages(loadedMessages);
//       setCurrentSessionId(sessionId);
//     } catch (error) {
//       console.error('Failed to load chat session:', error);
//     }
//   };

//   // ✅ UPDATED: Use axiosInstance
//   const deleteChatSession = async (sessionId, e) => {
//     e.stopPropagation();
//     if (!window.confirm('Delete this chat session?')) return;
    
//     try {
//       await axiosInstance.delete(`/chat/sessions/${sessionId}`);
      
//       fetchChatSessions();
//       if (currentSessionId === sessionId) {
//         handleNewChat();
//       }
//     } catch (error) {
//       console.error('Failed to delete session:', error);
//     }
//   };

//   const handleNewChat = () => {
//     setMessages([]);
//     setInputMessage('');
//     setUploadedMidi(null);
//     setLastGeneration(null);
//     setCurrentSessionId(`session-${Date.now()}`);
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!authService.isAuthenticated()) {
//       addErrorMessage('🔐 Please log in to upload MIDI files');
//       onOpenAuth('signup');
//       return;
//     }

//     if (!emailVerified) {
//       addErrorMessage('📧 Please verify your email first. Check your inbox for the verification link!');
//       setShowVerificationBanner(true);
//       return;
//     }

//     const validExtensions = ['.mid', '.midi'];
//     const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
//     if (!validExtensions.includes(fileExtension)) {
//       addErrorMessage('❌ Invalid file type. Please upload a MIDI file (.mid or .midi)');
//       e.target.value = '';
//       return;
//     }

//     const maxSizeInBytes = 5 * 1024 * 1024;
//     if (file.size > maxSizeInBytes) {
//       const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
//       addErrorMessage(`❌ File too large (${fileSizeMB}MB). Maximum size is 5MB. Try a shorter MIDI file.`);
//       e.target.value = '';
//       return;
//     }

//     if (file.name.length > 100) {
//       addErrorMessage('❌ Filename too long. Please rename your file to less than 100 characters.');
//       e.target.value = '';
//       return;
//     }

//     try {
//       const reader = new FileReader();
      
//       reader.onload = async (event) => {
//         const base64Data = event.target.result.split(',')[1];
        
//         if (!base64Data || base64Data.length === 0) {
//           addErrorMessage('❌ Failed to read MIDI file. The file may be corrupted. Try another file.');
//           return;
//         }

//         console.log('📁 MIDI file loaded:', {
//           name: file.name,
//           size: `${(file.size / 1024).toFixed(1)}KB`,
//           base64Length: base64Data.length
//         });
        
//         setUploadedMidi({
//           fileName: file.name,
//           midiData: base64Data,
//           size: file.size
//         });
        
//         addSystemMessage(`✅ MIDI file attached: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
//       };

//       reader.onerror = () => {
//         addErrorMessage('❌ Failed to read file. Please check file permissions and try again.');
//       };

//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error('❌ File reading error:', error);
//       addErrorMessage('❌ Unexpected error reading file. Please try again or use a different file.');
//     }
    
//     e.target.value = '';
//   };

//   // ✅ CRITICAL FIX: Use axiosInstance for MIDI generation
//   const sendMessage = async (messageType = 'generate') => {
//     if (!inputMessage.trim()) {
//       addErrorMessage('⚠️ Please enter a description for your music');
//       return;
//     }

//     if (inputMessage.trim().length < 3) {
//       addErrorMessage('⚠️ Please provide a more detailed description (at least 3 characters)');
//       return;
//     }

//     if (inputMessage.length > 1000) {
//       addErrorMessage('❌ Description too long. Please keep it under 1000 characters.');
//       return;
//     }

//     if (isLoading) {
//       return;
//     }

//     if (!authService.isAuthenticated()) {
//       addErrorMessage('🔐 Please log in to generate music');
//       onOpenAuth('signup');
//       return;
//     }

//     if (!emailVerified) {
//       addErrorMessage('📧 Please verify your email before generating music. Check your inbox!');
//       setShowVerificationBanner(true);
//       return;
//     }
    
//     if (!window._firstRequestMade) {
//     console.log('⏳ First request - ensuring CSRF readiness...');
//     await new Promise(resolve => setTimeout(resolve, 500));
//     window._firstRequestMade = true;
//     }

//     const userMessage = {
//       id: Date.now(),
//       type: 'user',
//       content: inputMessage,
//       hasUpload: uploadedMidi !== null,
//       uploadFileName: uploadedMidi?.fileName,
//       timestamp: new Date().toISOString()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const currentInput = inputMessage;
//     const currentUpload = uploadedMidi;
    
//     setInputMessage('');
//     setUploadedMidi(null);
//     setIsLoading(true);

//     try {
//       const sessionId = currentSessionId || `session-${Date.now()}`;
      
//       if (!currentSessionId) {
//         setCurrentSessionId(sessionId);
//       }
      
//       const requestedBars = extractBarCount(currentInput);
      
//       const requestBody = {
//         message: currentInput,
//         creativityLevel: 'medium',
//         performanceMode: 'balanced',
//         sessionId,
//         editMode: messageType === 'edit' || currentUpload !== null,
//         originalContent: lastGeneration || null,
//         requestedBars: requestedBars || null,
//         source: 'web'
//       };

//       if (currentUpload) {
//         const cleanFileName = currentUpload.fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
//         requestBody.uploadedMidiData = currentUpload.midiData;
//         requestBody.uploadedMidiFilename = cleanFileName;
//       }

//       // ✅ CRITICAL: Use axiosInstance which handles CSRF automatically
//       const response = await axiosInstance.post('/midi/generate', requestBody, {
//         timeout: 300000
//       });

//       const data = response.data;

//       const botMessage = {
//         id: data.id || Date.now(),
//         type: 'bot',
//         content: data.message,
//         midiUrl: data.midiUrl,
//         barCount: data.barCount,
//         wasUploadBased: currentUpload !== null,
//         source: data.source || 'web',
//         timestamp: data.timestamp
//       };

//       setMessages(prev => [...prev, botMessage]);
//       if (data.message) setLastGeneration(data.message);
      
//       await fetchUserProfile();
//       fetchChatSessions();

//     } catch (error) {
//       console.error('❌ Generation failed:', error);
      
//       if (error.code === 'ECONNABORTED') {
//         addErrorMessage('⏱️ Request timed out. The server is taking too long. Please try again with a simpler prompt or smaller file.');
//       } else if (error.response?.status === 400) {
//         const errorMsg = error.response?.data?.message || '';
        
//         if (errorMsg.includes('filename') || errorMsg.includes('file name')) {
//           addErrorMessage('❌ Invalid filename. Please use only letters, numbers, hyphens, and underscores in your filename.');
//         } else if (errorMsg.includes('too large') || errorMsg.includes('size')) {
//           addErrorMessage('❌ MIDI file is too large. Maximum size is 5MB. Try a shorter MIDI file.');
//         } else if (errorMsg.includes('dangerous') || errorMsg.includes('invalid character')) {
//           addErrorMessage('❌ Your prompt contains invalid characters. Please remove special symbols and try again.');
//         } else if (errorMsg.includes('MIDI data')) {
//           addErrorMessage('❌ MIDI file format error. The file may be corrupted. Try uploading a different file.');
//         } else if (errorMsg.includes('bars')) {
//           addErrorMessage('❌ Invalid bar count. Please request between 1 and 500 bars.');
//         } else {
//           addErrorMessage(`❌ ${errorMsg || 'Invalid request. Please check your input and try again.'}`);
//         }
//       } else if (error.response?.status === 401) {
//         addErrorMessage('🔐 Session expired. Please log in again.');
//         authService.logout();
//         onOpenAuth('login');
//       } else if (error.response?.status === 403) {
//         addErrorMessage('🚫 Access denied. Please check your permissions.');
//       } else if (error.response?.status === 429) {
//         const retryAfter = error.response?.headers['retry-after'] || '60';
//         addErrorMessage(`⏳ Too many requests. Please wait ${retryAfter} seconds and try again.`);
//       } else if (error.response?.status === 500) {
//         addErrorMessage('⚠️ Server error. Our team has been notified. Please try again in a few moments.');
//       } else if (error.response?.status === 503) {
//         addErrorMessage('🔧 Service temporarily unavailable. Please try again in a few minutes.');
//       } else if (error.response?.data?.message?.includes('verify your email')) {
//         addErrorMessage('📧 Please verify your email before generating music. Check your inbox!');
//         setShowVerificationBanner(true);
//       } else if (error.response?.data?.message?.includes('Daily limit')) {
//         addErrorMessage('📊 Daily generation limit reached. Upgrade your plan or wait until tomorrow.');
//       } else if (error.message.includes('Network Error')) {
//         addErrorMessage('🌐 Network error. Please check your internet connection and try again.');
//       } else {
//         addErrorMessage('❌ Something went wrong. Please try again. If the problem persists, contact support.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addErrorMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'error',
//       content,
//       timestamp: new Date().toISOString()
//     }]);
//   };

//   const addSystemMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'system',
//       content,
//       timestamp: new Date().toISOString()
//     }]);
//   };

//   const downloadMidi = (midiUrl) => {
//     const link = document.createElement('a');
//     link.href = midiUrl;
//     link.download = `composition_${Date.now()}.mid`;
//     link.click();
//   };

//   const getTierIcon = (tier) => {
//     switch (tier) {
//       case 'FREE': return CheckCircle;
//       case 'BASIC': return CheckCircle;
//       case 'PRO': return Crown;
//       case 'UNLIMITED': return Crown;
//       default: return CheckCircle;
//     }
//   };

//   const getTierColor = (tier) => {
//     switch (tier) {
//       case 'FREE': return 'text-gray-600';
//       case 'BASIC': return 'text-green-600';
//       case 'PRO': return 'text-purple-600';
//       case 'UNLIMITED': return 'text-orange-600';
//       default: return 'text-gray-600';
//     }
//   };

//   const getInputPlaceholder = () => {
//     if (!emailVerified && isAuthenticated) {
//       return "Verify your email to start generating...";
//     }
    
//     if (uploadedMidi) {
//       return "How should I transform this MIDI? (e.g., 'make it faster', 'add harmony')";
//     }
    
//     return "Describe your music (e.g., 'calm piano melody, 16 bars')";
//   };

//   const FileUploadButton = () => {
//     const isDisabled = isLoading || (!emailVerified && isAuthenticated);
//     const tooltipText = !emailVerified && isAuthenticated 
//       ? "Verify your email first" 
//       : "Upload MIDI file to transform";

//     return (
//       <div className="relative group">
//         <button
//           onClick={() => fileInputRef.current?.click()}
//           disabled={isDisabled}
//           className={`p-2.5 rounded-lg transition-colors border ${
//             isDisabled 
//               ? 'bg-gray-100 cursor-not-allowed opacity-50' 
//               : 'bg-white hover:bg-gray-100'
//           }`}
//           title={tooltipText}
//         >
//           <Upload className="w-5 h-5 text-gray-600" />
//         </button>
//         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
//           {tooltipText}
//         </div>
//       </div>
//     );
//   };

//   const SendButton = () => {
//     const isDisabled = isLoading || !inputMessage.trim() || (!emailVerified && isAuthenticated);
    
//     let tooltipText = "Send message";
//     if (!emailVerified && isAuthenticated) {
//       tooltipText = "Verify your email first";
//     } else if (!inputMessage.trim()) {
//       tooltipText = "Enter a description";
//     } else if (isLoading) {
//       tooltipText = "Generating...";
//     }

//     return (
//       <div className="relative group">
//         <button
//           onClick={() => sendMessage()}
//           disabled={isDisabled}
//           className={`p-2.5 rounded-lg transition-colors ${
//             isDisabled
//               ? 'bg-gray-300 cursor-not-allowed opacity-50'
//               : 'bg-gray-900 hover:bg-gray-800'
//           }`}
//           title={tooltipText}
//         >
//           <Send className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
//         </button>
//         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
//           {tooltipText}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-white overflow-hidden text-sm">
//       {showVSTModal && (
//         <VSTDownloadModal onClose={() => setShowVSTModal(false)} />
//       )}

//       {!sidebarCollapsed && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setSidebarCollapsed(true)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//           fixed lg:sticky top-0 left-0 z-50 h-full bg-white
//           transition-all duration-300 ease-in-out
//           ${sidebarCollapsed ? 'w-0 lg:w-20' : 'w-72 lg:w-72'}
//           ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
//           ${sidebarCollapsed && 'overflow-hidden'}
//         `}
//       >
//         <div className="flex flex-col h-full w-full">
//           <div className="flex items-center justify-between px-4 py-3">
//             {!sidebarCollapsed && (
//               <h2 className="text-lg font-bold text-gray-900">MIDI Generator</h2>
//             )}
//             <button
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//             >
//               <PanelRight className="w-5 h-5" />
//             </button>
//           </div>

//           {!sidebarCollapsed && (
//             <div className="p-3">
//               <button
//                 onClick={handleNewChat}
//                 className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>New Chat</span>
//               </button>
//             </div>
//           )}

//           <div className="flex-1 overflow-y-auto p-3 space-y-2">
//             {chatSessions.length === 0 ? (
//               !sidebarCollapsed && (
//                 <div className="text-center py-8">
//                   <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-sm text-gray-500">No chat history yet</p>
//                 </div>
//               )
//             ) : (
//               chatSessions.map((session) => (
//                 <div
//                   key={session.sessionId}
//                   onClick={() => loadChatSession(session.sessionId)}
//                   className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
//                     currentSessionId === session.sessionId
//                       ? 'bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 min-w-0 flex-1">
//                     <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                     {!sidebarCollapsed && (
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {session.preview}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {session.messageCount} messages
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                   {!sidebarCollapsed && (
//                     <button
//                       onClick={(e) => deleteChatSession(session.sessionId, e)}
//                       className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
//                     >
//                       <Trash2 className="w-4 h-4 text-red-600" />
//                     </button>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>

//           {/* User Menu */}
//           <div className="p-3">
//             {isAuthenticated ? (
//               <div className="relative" ref={userMenuRef}>
//                 <button
//                   onClick={() => setShowUserMenu(!showUserMenu)}
//                   className={`flex items-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors ${
//                     sidebarCollapsed ? 'justify-center' : 'space-x-3'
//                   }`}
//                 >
//                   <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold relative">
//                     {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
//                     {!emailVerified && (
//                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
//                         <Mail className="w-2.5 h-2.5 text-white" />
//                       </div>
//                     )}
//                   </div>
//                   {!sidebarCollapsed && (
//                     <>
//                       <div className="flex-1 text-left min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {user?.fullName || 'User'}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">{user?.email}</p>
//                       </div>
//                       <Settings className="w-4 h-4 text-gray-400" />
//                     </>
//                   )}
//                 </button>

//                 {showUserMenu && !sidebarCollapsed && (
//                   <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg py-2 border">
//                     <div className="px-3.5 py-2.5">
//                       <div className="flex items-center space-x-2 mb-2">
//                         {React.createElement(getTierIcon(userProfile?.subscriptionTier), {
//                           className: `w-5 h-5 ${getTierColor(userProfile?.subscriptionTier)}`
//                         })}
//                         <span className="font-semibold text-gray-900">
//                           {userProfile?.subscriptionTier || 'FREE'} Plan
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-600 mb-1">
//                         Daily Limit: {userProfile?.dailyGenerationCount || 0}/{
//                           userProfile?.subscriptionTier === 'UNLIMITED' ? '∞' :
//                           userProfile?.subscriptionTier === 'FREE' ? 5 :
//                           userProfile?.subscriptionTier === 'BASIC' ? 20 : 100
//                         }
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         {userProfile?.remainingGenerations !== undefined 
//                           ? `${userProfile.remainingGenerations} generations remaining`
//                           : 'Loading...'}
//                       </p>
//                     </div>

//                     <div className="px-2 py-1.5 space-y-1">
//                       <button
//                         onClick={() => {
//                           onNavigate('dashboard');
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
//                       >
//                         <User className="w-4 h-4" />
//                         <span>Dashboard</span>
//                       </button>
                      
//                       <button
//                         onClick={() => {
//                           onNavigate('pricing');
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
//                       >
//                         <Crown className="w-4 h-4" />
//                         <span>Upgrade Plan</span>
//                       </button>
//                     </div>

//                     <div className="px-2 py-1.5">
//                       <button
//                         onClick={() => {
//                           onLogout();
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
//                       >
//                         <LogOut className="w-4 h-4" />
//                         <span>Logout</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               !sidebarCollapsed && (
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => onOpenAuth('login')}
//                     className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
//                   >
//                     Log In
//                   </button>
//                   <button
//                     onClick={() => onOpenAuth('signup')}
//                     className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
//                   >
//                     Sign Up
//                   </button>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
//         {/* Verification Banner */}
//         {showVerificationBanner && isAuthenticated && !emailVerified && (
//           <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
//             <div className="max-w-3xl mx-auto flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
//                 <div>
//                   <p className="text-sm font-semibold text-yellow-900">
//                     Verify your email to start creating music
//                   </p>
//                   <p className="text-xs text-yellow-700">
//                     Check your inbox for the verification link
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowVerificationBanner(false)}
//                 className="p-1 hover:bg-yellow-100 rounded transition-colors"
//               >
//                 <X className="w-4 h-4 text-yellow-600" />
//               </button>
//             </div>
//           </div>
//         )}

//         <header className="flex items-center justify-between px-3 sm:px-5 py-3 bg-white">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
//             >
//               <PanelRight className="w-5 h-5" />
//             </button>
//             <h1 className="text-lg font-bold text-gray-900">AI Music Generator</h1>
//           </div>
          
//           <button
//             onClick={() => setShowVSTModal(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
//           >
//             <Monitor className="w-4 h-4" />
//             <span>Download VST</span>
//           </button>
//         </header>

//         <main className="flex-1 overflow-y-auto p-4 bg-white">
//           <div className="max-w-3xl mx-auto">
//             {messages.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
//                   <FileMusic className="w-8 h-8 text-gray-600" />
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                   Describe your musical ideas
//                 </h2>
//                 <p className="text-gray-600 text-lg mb-4">
//                   or upload a MIDI file to transform it
//                 </p>
                
//                 {/* Email verification warning on empty chat */}
//                 {isAuthenticated && !emailVerified && (
//                   <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
//                     <div className="flex items-start space-x-3">
//                       <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
//                       <div className="text-left">
//                         <p className="text-sm font-semibold text-yellow-900 mb-1">
//                           Verify your email to start generating
//                         </p>
//                         <p className="text-xs text-yellow-700">
//                           Check your inbox for the verification link we sent you.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {messages.map((msg) => (
//                   <MessageBubble
//                     key={msg.id}
//                     message={msg}
//                     onDownload={downloadMidi}
//                   />
//                 ))}

//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border">
//                       <div className="flex items-center space-x-3">
//                         <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">Composing Music</div>
//                           <div className="text-xs text-gray-500">{thinkingMessage}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={chatEndRef} />
//               </div>
//             )}
//           </div>
//         </main>

//         {/* Footer */}
//         <footer className="bg-white p-3">
//           <div className="max-w-3xl mx-auto">
//             {uploadedMidi && (
//               <div className="mb-3 flex items-center justify-between bg-blue-50 rounded-lg px-3.5 py-2 border border-blue-200">
//                 <div className="flex items-center space-x-2 min-w-0 flex-1">
//                   <FileMusic className="w-4 h-4 text-blue-700 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <span className="text-sm font-medium text-blue-900 truncate block">
//                       {uploadedMidi.fileName}
//                     </span>
//                     <p className="text-xs text-blue-700">
//                       {(uploadedMidi.size / 1024).toFixed(1)}KB • Ready to transform
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setUploadedMidi(null)}
//                   className="p-1 hover:bg-blue-100 rounded flex-shrink-0"
//                   title="Remove file"
//                 >
//                   <X className="w-4 h-4 text-blue-700" />
//                 </button>
//               </div>
//             )}

//             <div className="flex items-end space-x-2">
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".mid,.midi"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
              
//               <FileUploadButton />

//               <div className="flex-1 relative">
//                 <textarea
//                   ref={textareaRef}
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       e.preventDefault();
//                       sendMessage();
//                     }
//                   }}
//                   placeholder={getInputPlaceholder()}
//                   className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 border disabled:bg-gray-50 disabled:cursor-not-allowed"
//                   style={{
//                     minHeight: '56px',
//                     maxHeight: '120px'
//                   }}
//                   rows={1}
//                   disabled={isLoading || (!emailVerified && isAuthenticated)}
//                   onInput={(e) => {
//                     e.target.style.height = 'auto';
//                     e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
//                   }}
//                 />
                
//                 {/* Character counter */}
//                 {inputMessage.length > 800 && (
//                   <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
//                     {inputMessage.length}/1000
//                   </div>
//                 )}
//               </div>

//               <SendButton />
//             </div>
            
//             {/* Footer hints */}
//             {uploadedMidi && emailVerified && (
//               <p className="text-xs text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
//                 <span>💡</span>
//                 <span>Describe how to transform your MIDI file</span>
//               </p>
//             )}
            
//             {!emailVerified && isAuthenticated && (
//               <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
//                 <Mail className="w-3.5 h-3.5 flex-shrink-0" />
//                 <span>Verify your email to start generating music</span>
//               </div>
//             )}
            
//             {inputMessage.length > 0 && inputMessage.length < 3 && (
//               <p className="text-xs text-orange-600 mt-2 text-center">
//                 ⚠️ Please provide a more detailed description
//               </p>
//             )}
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// // VST Download Modal Component
// const VSTDownloadModal = ({ onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
//                 <Monitor className="w-6 h-6 text-gray-700" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">MIDI Generator VST</h2>
//                 <p className="text-sm text-gray-600">Professional DAW Integration</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="mb-6">
//             <p className="text-gray-700 mb-4">
//               Generate AI-powered MIDI directly inside your DAW! Works with Ableton Live, FL Studio, Logic Pro, and more.
//             </p>
            
//             <div className="bg-gray-100 rounded-lg p-4 mb-4">
//               <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
//               <ul className="space-y-1 text-sm text-gray-700">
//                 <li>• Generate MIDI directly in your DAW</li>
//                 <li>• Same account & generation limits as web</li>
//                 <li>• Real-time AI composition</li>
//                 <li>• Control creativity & bar count</li>
//                 <li>• Syncs with your dashboard</li>
//               </ul>
//             </div>

//             <div className="bg-gray-100 rounded-lg p-4">
//               <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
//               <ul className="space-y-1 text-sm text-gray-700">
//                 <li>• Windows 10/11</li>
//                 <li>• VST3 compatible DAW</li>
//                 <li>• Active account (Free or Paid)</li>
//                 <li>• Internet connection</li>
//               </ul>
//             </div>
//           </div>

//           <div className="space-y-3 mb-6">
//             <a
//               href="/vst/MidiGenerator.vst3.rar"
//               download
//               className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all"
//             >
//               <Monitor className="w-5 h-5" />
//               <div className="text-left">
//                 <div className="font-semibold">Download for Windows</div>
//                 <div className="text-xs opacity-90">VST3 Plugin • ~1.24 MB</div>
//               </div>
//               <Download className="w-5 h-5" />
//             </a>
//           </div>

//           <div className="pt-6">
//             <h3 className="font-semibold text-gray-900 mb-3">Installation</h3>
            
//             <div className="space-y-4">
//               <div className="bg-gray-100 rounded-lg p-4">
//                 <h4 className="font-semibold text-gray-900 mb-2">Windows</h4>
//                 <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
//                   <li>Download the Windows VST3 file</li>
//                   <li>Extract to: <code className="bg-white px-2 py-0.5 rounded text-xs">C:\Program Files\Common Files\VST3\</code></li>
//                   <li>Restart your DAW</li>
//                   <li>Find "MIDI Generator VST" in your plugin list</li>
//                   <li>Log in with your account credentials</li>
//                 </ol>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // MessageBubble component
// const MessageBubble = ({ message, onDownload }) => {
//   const getSourceBadge = (source) => {
//     if (source === 'vst' || source === 'VST') {
//       return (
//         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
//           <Monitor className="w-3 h-3 mr-1" />
//           VST Plugin
//         </span>
//       );
//     } else if (source === 'web' || source === 'WEB' || !source) {
//       return (
//         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
//           <Globe className="w-3 h-3 mr-1" />
//           Web Interface
//         </span>
//       );
//     }
//     return null;
//   };

//   if (message.type === 'user') {
//     return (
//       <div className="flex justify-end">
//         <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 max-w-[80%]">
//           {message.hasUpload && (
//             <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-700">
//               <FileMusic className="w-4 h-4" />
//               <span className="text-xs opacity-75">{message.uploadFileName}</span>
//             </div>
//           )}
//           <p className="text-sm whitespace-pre-wrap">{message.content}</p>
//         </div>
//       </div>
//     );
//   }

//   if (message.type === 'error') {
//     return (
//       <div className="flex justify-center">
//         <div className="bg-red-50 rounded-lg px-4 py-3 max-w-[85%] border border-red-200">
//           <div className="flex items-start space-x-2">
//             <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//             <div className="flex-1">
//               <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
//               <p className="text-sm text-red-800 whitespace-pre-wrap">{message.content}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (message.type === 'system') {
//     return (
//       <div className="flex justify-center">
//         <div className="bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
//           <p className="text-xs text-blue-800 font-medium">{message.content}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-start">
//       <div className="bg-white rounded-2xl shadow-sm max-w-[80%] overflow-hidden border">
//         <div className="px-4 py-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center space-x-2">
//               <p className="text-sm font-semibold text-gray-900">
//                 {message.wasUploadBased ? 'Transformed Composition' : 'Generated Composition'}
//               </p>
//               {getSourceBadge(message.source)}
//             </div>
//             {message.barCount && (
//               <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                 {message.barCount} bars
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="p-4">
//           {message.midiUrl && (
//             <div className={`rounded-lg p-4 mb-4 ${
//               (message.source === 'vst' || message.source === 'VST')
//                 ? 'bg-purple-50 border border-purple-200' 
//                 : 'bg-gray-100'
//             }`}>
//               <div className="flex items-center justify-between gap-4">
//                 <div className="flex items-center space-x-3">
//                   <FileMusic className={`w-5 h-5 ${
//                     (message.source === 'vst' || message.source === 'VST') 
//                       ? 'text-purple-700' 
//                       : 'text-gray-700'
//                   }`} />
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">MIDI File Ready</p>
//                     <p className="text-xs text-gray-600">
//                       {message.barCount} bars • Generated via {
//                         (message.source === 'vst' || message.source === 'VST') 
//                           ? 'VST Plugin' 
//                           : 'Web Interface'
//                       }
//                     </p>
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={() => onDownload(message.midiUrl)}
//                   className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
//                     (message.source === 'vst' || message.source === 'VST')
//                       ? 'bg-purple-600 hover:bg-purple-700 text-white'
//                       : 'bg-gray-900 hover:bg-gray-800 text-white'
//                   }`}
//                 >
//                   <Download className="w-4 h-4" />
//                   <span>Download</span>
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2">
//             <button
//               onClick={() => {
//                 navigator.clipboard.writeText(message.content);
//               }}
//               className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors border"
//             >
//               <Copy className="w-4 h-4" />
//               <span>Copy MIDI Data</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBot;















// frontend/src/Components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Upload, Download, Copy, X, CheckCircle, 
  AlertCircle, Loader2, FileMusic, Plus, User, LogOut,
  Settings, Trash2, Crown, MessageSquare, PanelRight, Monitor, 
  Globe, Mail, RefreshCw
} from 'lucide-react';
import authService from '../services/authService';
import axiosInstance from '../services/axiosConfig'; // ✅ USE THIS INSTEAD OF AXIOS
import { getErrorMessage } from '../utils/errorUtils';

const THINKING_MESSAGES = [
  "Analyzing musical patterns...",
  "Composing harmonic progressions...",
  "Crafting melodic structures...",
  "Balancing voice leading...",
  "Generating rhythmic patterns...",
];

// Extract bar count from user message
const extractBarCount = (text) => {
  if (!text) return null;
  
  const pattern1 = /(\d+)\s*bars?/i;
  const match1 = text.match(pattern1);
  if (match1) {
    const count = parseInt(match1[1]);
    if (count > 0 && count <= 500) {
      console.log('📊 Extracted bar count from message:', count);
      return count;
    }
  }
  
  const pattern2 = /bars?[\s:=]+(\d+)/i;
  const match2 = text.match(pattern2);
  if (match2) {
    const count = parseInt(match2[1]);
    if (count > 0 && count <= 500) {
      console.log('📊 Extracted bar count from message:', count);
      return count;
    }
  }
  
  return null;
};

const ChatBot = ({ isAuthenticated, user, onOpenAuth, onNavigate, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [uploadedMidi, setUploadedMidi] = useState(null);
  const [lastGeneration, setLastGeneration] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showVSTModal, setShowVSTModal] = useState(false);
  
  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  
  // ✅ NEW: Resend email state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  // Track if we've already fetched profile to prevent duplicate calls
  const profileFetched = useRef(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Single useEffect for authentication and profile
  useEffect(() => {
    if (isAuthenticated && !profileFetched.current) {
      profileFetched.current = true;
      fetchUserProfile();
      fetchChatSessions();
    } else if (!isAuthenticated) {
      // Reset when logged out
      profileFetched.current = false;
      setEmailVerified(false);
      setShowVerificationBanner(false);
      setUserProfile(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) {
      let index = 0;
      setThinkingMessage(THINKING_MESSAGES[0]);
      thinkingIntervalRef.current = setInterval(() => {
        index = (index + 1) % THINKING_MESSAGES.length;
        setThinkingMessage(THINKING_MESSAGES[index]);
      }, 2500);
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    }
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // ✅ UPDATED: Use axiosInstance
  const fetchUserProfile = async () => {
    try {
      if (!authService.isAuthenticated()) {
        console.log('⚠️ Not authenticated, skipping profile fetch');
        return;
      }
      
      console.log('📡 Fetching user profile...');
      const response = await axiosInstance.get('/user/profile');
      const profileData = response.data;
      
      console.log('✅ Profile received:', {
        email: profileData.email,
        emailVerified: profileData.emailVerified,
        remainingGenerations: profileData.remainingGenerations,
        dailyCount: profileData.dailyGenerationCount
      });
      
      setUserProfile(profileData);
      
      const isVerified = profileData?.emailVerified === true;
      setEmailVerified(isVerified);
      setShowVerificationBanner(!isVerified && isAuthenticated);
      
      console.log('📧 Verification status updated:', {
        emailVerified: isVerified,
        showBanner: !isVerified && isAuthenticated
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        authService.logout();
        onOpenAuth('login');
      }
    }
  };

  // ✅ UPDATED: Use axiosInstance
  const fetchChatSessions = async () => {
    try {
      if (!authService.isAuthenticated()) return;
      
      const response = await axiosInstance.get('/chat/sessions');
      setChatSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

  // ✅ UPDATED: Use axiosInstance
  const loadChatSession = async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/chat/sessions/${sessionId}`);
      
      const loadedMessages = response.data.map(chat => ([
        {
          id: chat.id + '-user',
          type: 'user',
          content: chat.userMessage,
          timestamp: chat.createdAt
        },
        {
          id: chat.id + '-bot',
          type: 'bot',
          content: chat.botResponse,
          midiUrl: chat.midiUrl,
          barCount: chat.generatedBars,
          source: chat.source || 'web',
          timestamp: chat.createdAt
        }
      ])).flat();
      
      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  // ✅ UPDATED: Use axiosInstance
  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat session?')) return;
    
    try {
      await axiosInstance.delete(`/chat/sessions/${sessionId}`);
      
      fetchChatSessions();
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // ✅ NEW: Resend verification email function
  const handleResendVerification = async () => {
    if (resendingEmail) return;
    
    setResendingEmail(true);
    setResendMessage('');
    
    try {
      console.log('📧 Resending verification email...');
      
      const response = await axiosInstance.post('/auth/resend-verification', {
        email: user?.email
      });
      
      if (response.data.success) {
        setResendMessage('✅ Verification email sent! Check your inbox and spam folder.');
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setResendMessage('');
        }, 5000);
      } else {
        setResendMessage('❌ ' + (response.data.message || 'Failed to send email'));
      }
      
    } catch (error) {
      console.error('❌ Failed to resend verification:', error);
      
      if (error.response?.data?.message) {
        setResendMessage('❌ ' + error.response.data.message);
      } else {
        setResendMessage('❌ Failed to send verification email. Please try again.');
      }
    } finally {
      setResendingEmail(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
    setUploadedMidi(null);
    setLastGeneration(null);
    setCurrentSessionId(`session-${Date.now()}`);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!authService.isAuthenticated()) {
      addErrorMessage('🔐 Please log in to upload MIDI files');
      onOpenAuth('signup');
      return;
    }

    if (!emailVerified) {
      addErrorMessage('📧 Please verify your email first. Check your inbox for the verification link!');
      setShowVerificationBanner(true);
      return;
    }

    const validExtensions = ['.mid', '.midi'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      addErrorMessage('❌ Invalid file type. Please upload a MIDI file (.mid or .midi)');
      e.target.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      addErrorMessage(`❌ File too large (${fileSizeMB}MB). Maximum size is 5MB. Try a shorter MIDI file.`);
      e.target.value = '';
      return;
    }

    if (file.name.length > 100) {
      addErrorMessage('❌ Filename too long. Please rename your file to less than 100 characters.');
      e.target.value = '';
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Data = event.target.result.split(',')[1];
        
        if (!base64Data || base64Data.length === 0) {
          addErrorMessage('❌ Failed to read MIDI file. The file may be corrupted. Try another file.');
          return;
        }

        console.log('📁 MIDI file loaded:', {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)}KB`,
          base64Length: base64Data.length
        });
        
        setUploadedMidi({
          fileName: file.name,
          midiData: base64Data,
          size: file.size
        });
        
        addSystemMessage(`✅ MIDI file attached: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      };

      reader.onerror = () => {
        addErrorMessage('❌ Failed to read file. Please check file permissions and try again.');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ File reading error:', error);
      addErrorMessage('❌ Unexpected error reading file. Please try again or use a different file.');
    }
    
    e.target.value = '';
  };

  // ✅ CRITICAL FIX: Use axiosInstance for MIDI generation
  const sendMessage = async (messageType = 'generate') => {
    if (!inputMessage.trim()) {
      addErrorMessage('⚠️ Please enter a description for your music');
      return;
    }

    if (inputMessage.trim().length < 3) {
      addErrorMessage('⚠️ Please provide a more detailed description (at least 3 characters)');
      return;
    }

    if (inputMessage.length > 1000) {
      addErrorMessage('❌ Description too long. Please keep it under 1000 characters.');
      return;
    }

    if (isLoading) {
      return;
    }

    if (!authService.isAuthenticated()) {
      addErrorMessage('🔐 Please log in to generate music');
      onOpenAuth('signup');
      return;
    }

    if (!emailVerified) {
      addErrorMessage('📧 Please verify your email before generating music. Check your inbox!');
      setShowVerificationBanner(true);
      return;
    }
    
    if (!window._firstRequestMade) {
    console.log('⏳ First request - ensuring CSRF readiness...');
    await new Promise(resolve => setTimeout(resolve, 500));
    window._firstRequestMade = true;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      hasUpload: uploadedMidi !== null,
      uploadFileName: uploadedMidi?.fileName,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    const currentUpload = uploadedMidi;
    
    setInputMessage('');
    setUploadedMidi(null);
    setIsLoading(true);

    try {
      const sessionId = currentSessionId || `session-${Date.now()}`;
      
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }
      
      const requestedBars = extractBarCount(currentInput);
      
      const requestBody = {
        message: currentInput,
        creativityLevel: 'medium',
        performanceMode: 'balanced',
        sessionId,
        editMode: messageType === 'edit' || currentUpload !== null,
        originalContent: lastGeneration || null,
        requestedBars: requestedBars || null,
        source: 'web'
      };

      if (currentUpload) {
        const cleanFileName = currentUpload.fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        requestBody.uploadedMidiData = currentUpload.midiData;
        requestBody.uploadedMidiFilename = cleanFileName;
      }

      // ✅ CRITICAL: Use axiosInstance which handles CSRF automatically
      const response = await axiosInstance.post('/midi/generate', requestBody, {
        timeout: 300000
      });

      const data = response.data;

      const botMessage = {
        id: data.id || Date.now(),
        type: 'bot',
        content: data.message,
        midiUrl: data.midiUrl,
        barCount: data.barCount,
        wasUploadBased: currentUpload !== null,
        source: data.source || 'web',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
      if (data.message) setLastGeneration(data.message);
      
      await fetchUserProfile();
      fetchChatSessions();

    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      if (error.code === 'ECONNABORTED') {
        addErrorMessage('⏱️ Request timed out. The server is taking too long. Please try again with a simpler prompt or smaller file.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || '';
        
        if (errorMsg.includes('filename') || errorMsg.includes('file name')) {
          addErrorMessage('❌ Invalid filename. Please use only letters, numbers, hyphens, and underscores in your filename.');
        } else if (errorMsg.includes('too large') || errorMsg.includes('size')) {
          addErrorMessage('❌ MIDI file is too large. Maximum size is 5MB. Try a shorter MIDI file.');
        } else if (errorMsg.includes('dangerous') || errorMsg.includes('invalid character')) {
          addErrorMessage('❌ Your prompt contains invalid characters. Please remove special symbols and try again.');
        } else if (errorMsg.includes('MIDI data')) {
          addErrorMessage('❌ MIDI file format error. The file may be corrupted. Try uploading a different file.');
        } else if (errorMsg.includes('bars')) {
          addErrorMessage('❌ Invalid bar count. Please request between 1 and 500 bars.');
        } else {
          addErrorMessage(`❌ ${errorMsg || 'Invalid request. Please check your input and try again.'}`);
        }
      } else if (error.response?.status === 401) {
        addErrorMessage('🔐 Session expired. Please log in again.');
        authService.logout();
        onOpenAuth('login');
      } else if (error.response?.status === 403) {
        addErrorMessage('🚫 Access denied. Please check your permissions.');
      } else if (error.response?.status === 429) {
        const retryAfter = error.response?.headers['retry-after'] || '60';
        addErrorMessage(`⏳ Too many requests. Please wait ${retryAfter} seconds and try again.`);
      } else if (error.response?.status === 500) {
        addErrorMessage('⚠️ Server error. Our team has been notified. Please try again in a few moments.');
      } else if (error.response?.status === 503) {
        addErrorMessage('🔧 Service temporarily unavailable. Please try again in a few minutes.');
      } else if (error.response?.data?.message?.includes('verify your email')) {
        addErrorMessage('📧 Please verify your email before generating music. Check your inbox!');
        setShowVerificationBanner(true);
      } else if (error.response?.data?.message?.includes('Daily limit')) {
        addErrorMessage('📊 Daily generation limit reached. Upgrade your plan or wait until tomorrow.');
      } else if (error.message.includes('Network Error')) {
        addErrorMessage('🌐 Network error. Please check your internet connection and try again.');
      } else {
        addErrorMessage('❌ Something went wrong. Please try again. If the problem persists, contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addErrorMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'error',
      content,
      timestamp: new Date().toISOString()
    }]);
  };

  const addSystemMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content,
      timestamp: new Date().toISOString()
    }]);
  };

  const downloadMidi = (midiUrl) => {
    const link = document.createElement('a');
    link.href = midiUrl;
    link.download = `composition_${Date.now()}.mid`;
    link.click();
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'FREE': return CheckCircle;
      case 'BASIC': return CheckCircle;
      case 'PRO': return Crown;
      case 'UNLIMITED': return Crown;
      default: return CheckCircle;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'FREE': return 'text-gray-600';
      case 'BASIC': return 'text-green-600';
      case 'PRO': return 'text-purple-600';
      case 'UNLIMITED': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getInputPlaceholder = () => {
    if (!emailVerified && isAuthenticated) {
      return "Verify your email to start generating...";
    }
    
    if (uploadedMidi) {
      return "How should I transform this MIDI? (e.g., 'make it faster', 'add harmony')";
    }
    
    return "Describe your music (e.g., 'calm piano melody, 16 bars')";
  };

  const FileUploadButton = () => {
    const isDisabled = isLoading || (!emailVerified && isAuthenticated);
    const tooltipText = !emailVerified && isAuthenticated 
      ? "Verify your email first" 
      : "Upload MIDI file to transform";

    return (
      <div className="relative group">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className={`p-2.5 rounded-lg transition-colors border ${
            isDisabled 
              ? 'bg-gray-100 cursor-not-allowed opacity-50' 
              : 'bg-white hover:bg-gray-100'
          }`}
          title={tooltipText}
        >
          <Upload className="w-5 h-5 text-gray-600" />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltipText}
        </div>
      </div>
    );
  };

  const SendButton = () => {
    const isDisabled = isLoading || !inputMessage.trim() || (!emailVerified && isAuthenticated);
    
    let tooltipText = "Send message";
    if (!emailVerified && isAuthenticated) {
      tooltipText = "Verify your email first";
    } else if (!inputMessage.trim()) {
      tooltipText = "Enter a description";
    } else if (isLoading) {
      tooltipText = "Generating...";
    }

    return (
      <div className="relative group">
        <button
          onClick={() => sendMessage()}
          disabled={isDisabled}
          className={`p-2.5 rounded-lg transition-colors ${
            isDisabled
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
          title={tooltipText}
        >
          <Send className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltipText}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-sm">
      {showVSTModal && (
        <VSTDownloadModal onClose={() => setShowVSTModal(false)} />
      )}

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-full bg-white
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-0 lg:w-20' : 'w-72 lg:w-72'}
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          ${sidebarCollapsed && 'overflow-hidden'}
        `}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between px-4 py-3">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-bold text-gray-900">MIDI Generator</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatSessions.length === 0 ? (
              !sidebarCollapsed && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No chat history yet</p>
                </div>
              )
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => loadChatSession(session.sessionId)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.sessionId
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.preview}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.messageCount} messages
                        </p>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <button
                      onClick={(e) => deleteChatSession(session.sessionId, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* User Menu */}
          <div className="p-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors ${
                    sidebarCollapsed ? 'justify-center' : 'space-x-3'
                  }`}
                >
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold relative">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    {!emailVerified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <Mail className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Settings className="w-4 h-4 text-gray-400" />
                    </>
                  )}
                </button>

                {showUserMenu && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg py-2 border">
                    <div className="px-3.5 py-2.5">
                      <div className="flex items-center space-x-2 mb-2">
                        {React.createElement(getTierIcon(userProfile?.subscriptionTier), {
                          className: `w-5 h-5 ${getTierColor(userProfile?.subscriptionTier)}`
                        })}
                        <span className="font-semibold text-gray-900">
                          {userProfile?.subscriptionTier || 'FREE'} Plan
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        Daily Limit: {userProfile?.dailyGenerationCount || 0}/{
                          userProfile?.subscriptionTier === 'UNLIMITED' ? '∞' :
                          userProfile?.subscriptionTier === 'FREE' ? 5 :
                          userProfile?.subscriptionTier === 'BASIC' ? 20 : 100
                        }
                      </p>
                      <p className="text-xs text-gray-600">
                        {userProfile?.remainingGenerations !== undefined 
                          ? `${userProfile.remainingGenerations} generations remaining`
                          : 'Loading...'}
                      </p>
                    </div>

                    <div className="px-2 py-1.5 space-y-1">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onNavigate('pricing');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade Plan</span>
                      </button>
                    </div>

                    <div className="px-2 py-1.5">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !sidebarCollapsed && (
                <div className="space-y-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* ✅ ENHANCED: Verification Banner with Resend Button */}
        {showVerificationBanner && isAuthenticated && !emailVerified && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-yellow-900">
                      Verify your email to start creating music
                    </p>
                    <p className="text-xs text-yellow-700">
                      Check your inbox for the verification link
                    </p>
                    {resendMessage && (
                      <p className="text-xs mt-1 font-medium text-yellow-800">
                        {resendMessage}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend Email</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowVerificationBanner(false)}
                    className="p-1 hover:bg-yellow-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-yellow-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="flex items-center justify-between px-3 sm:px-5 py-3 bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <PanelRight className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">AI Music Generator</h1>
          </div>
          
          <button
            onClick={() => setShowVSTModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Monitor className="w-4 h-4" />
            <span>Download VST</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                  <FileMusic className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Describe your musical ideas
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  or upload a MIDI file to transform it
                </p>
                
                {/* Email verification warning on empty chat */}
                {isAuthenticated && !emailVerified && (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          Verify your email to start generating
                        </p>
                        <p className="text-xs text-yellow-700">
                          Check your inbox for the verification link we sent you.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onDownload={downloadMidi}
                  />
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Composing Music</div>
                          <div className="text-xs text-gray-500">{thinkingMessage}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white p-3">
          <div className="max-w-3xl mx-auto">
            {uploadedMidi && (
              <div className="mb-3 flex items-center justify-between bg-blue-50 rounded-lg px-3.5 py-2 border border-blue-200">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <FileMusic className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-blue-900 truncate block">
                      {uploadedMidi.fileName}
                    </span>
                    <p className="text-xs text-blue-700">
                      {(uploadedMidi.size / 1024).toFixed(1)}KB • Ready to transform
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedMidi(null)}
                  className="p-1 hover:bg-blue-100 rounded flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-blue-700" />
                </button>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mid,.midi"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <FileUploadButton />

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={getInputPlaceholder()}
                  className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 border disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{
                    minHeight: '56px',
                    maxHeight: '120px'
                  }}
                  rows={1}
                  disabled={isLoading || (!emailVerified && isAuthenticated)}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                
                {/* Character counter */}
                {inputMessage.length > 800 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                    {inputMessage.length}/1000
                  </div>
                )}
              </div>

              <SendButton />
            </div>
            
            {/* Footer hints */}
            {uploadedMidi && emailVerified && (
              <p className="text-xs text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
                <span>💡</span>
                <span>Describe how to transform your MIDI file</span>
              </p>
            )}
            
            {!emailVerified && isAuthenticated && (
              <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Verify your email to start generating music</span>
              </div>
            )}
            
            {inputMessage.length > 0 && inputMessage.length < 3 && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                ⚠️ Please provide a more detailed description
              </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

// VST Download Modal Component
const VSTDownloadModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">MIDI Generator VST</h2>
                <p className="text-sm text-gray-600">Professional DAW Integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Generate AI-powered MIDI directly inside your DAW! Works with Ableton Live, FL Studio, Logic Pro, and more.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Generate MIDI directly in your DAW</li>
                <li>• Same account & generation limits as web</li>
                <li>• Real-time AI composition</li>
                <li>• Control creativity & bar count</li>
                <li>• Syncs with your dashboard</li>
              </ul>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Windows 10/11</li>
                <li>• VST3 compatible DAW</li>
                <li>• Active account (Free or Paid)</li>
                <li>• Internet connection</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <a
              href="/vst/MidiGenerator.vst3.rar"
              download
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all"
            >
              <Monitor className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Download for Windows</div>
                <div className="text-xs opacity-90">VST3 Plugin • ~1.24 MB</div>
              </div>
              <Download className="w-5 h-5" />
            </a>
          </div>

          <div className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Installation</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Windows</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Download the Windows VST3 file</li>
                  <li>Extract to: <code className="bg-white px-2 py-0.5 rounded text-xs">C:\Program Files\Common Files\VST3\</code></li>
                  <li>Restart your DAW</li>
                  <li>Find "MIDI Generator VST" in your plugin list</li>
                  <li>Log in with your account credentials</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MessageBubble component
const MessageBubble = ({ message, onDownload }) => {
  const getSourceBadge = (source) => {
    if (source === 'vst' || source === 'VST') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
          <Monitor className="w-3 h-3 mr-1" />
          VST Plugin
        </span>
      );
    } else if (source === 'web' || source === 'WEB' || !source) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <Globe className="w-3 h-3 mr-1" />
          Web Interface
        </span>
      );
    }
    return null;
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 max-w-[80%]">
          {message.hasUpload && (
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-700">
              <FileMusic className="w-4 h-4" />
              <span className="text-xs opacity-75">{message.uploadFileName}</span>
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 rounded-lg px-4 py-3 max-w-[85%] border border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-800 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl shadow-sm max-w-[80%] overflow-hidden border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-900">
                {message.wasUploadBased ? 'Transformed Composition' : 'Generated Composition'}
              </p>
              {getSourceBadge(message.source)}
            </div>
            {message.barCount && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {message.barCount} bars
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {message.midiUrl && (
            <div className={`rounded-lg p-4 mb-4 ${
              (message.source === 'vst' || message.source === 'VST')
                ? 'bg-purple-50 border border-purple-200' 
                : 'bg-gray-100'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <FileMusic className={`w-5 h-5 ${
                    (message.source === 'vst' || message.source === 'VST') 
                      ? 'text-purple-700' 
                      : 'text-gray-700'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">MIDI File Ready</p>
                    <p className="text-xs text-gray-600">
                      {message.barCount} bars • Generated via {
                        (message.source === 'vst' || message.source === 'VST') 
                          ? 'VST Plugin' 
                          : 'Web Interface'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => onDownload(message.midiUrl)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
                    (message.source === 'vst' || message.source === 'VST')
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content);
              }}
              className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors border"
            >
              <Copy className="w-4 h-4" />
              <span>Copy MIDI Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
