// // frontend/src/Components/ChatBot.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Send, Upload, Download, Copy, X, CheckCircle, 
//   AlertCircle, Loader2, FileMusic, Plus, User, LogOut,
//   Settings, Trash2, Crown, MessageSquare, PanelRight, Monitor, 
//   Globe, Mail, RefreshCw, Server, Menu
// } from 'lucide-react';
// import authService from '../services/authService';
// import axiosInstance from '../services/axiosConfig';
// import { getErrorMessage } from '../utils/errorUtils';
// import { serverStatusService } from '../services/serverStatusService';

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
//       return count;
//     }
//   }
  
//   const pattern2 = /bars?[\s:=]+(\d+)/i;
//   const match2 = text.match(pattern2);
//   if (match2) {
//     const count = parseInt(match2[1]);
//     if (count > 0 && count <= 500) {
//       return count;
//     }
//   }
  
//   return null;
// };

// // Server Status Card Component - Mobile Optimized
// const ServerStatusCard = ({ status, onRetry }) => {
//   const [dismissed, setDismissed] = useState(false);

//   if (status === 'healthy' || dismissed) return null;

//   const configs = {
//     waking: {
//       icon: Server,
//       color: 'orange',
//       title: 'Server Waking Up',
//       message: 'First visit takes 30-60 seconds. Server is starting...',
//       showProgress: true
//     },
//     error: {
//       icon: AlertCircle,
//       color: 'red',
//       title: 'Server Offline',
//       message: 'Cannot connect to server. Retrying...',
//       showProgress: false
//     },
//     checking: {
//       icon: Loader2,
//       color: 'blue',
//       title: 'Checking Server',
//       message: 'Connecting to server...',
//       showProgress: false
//     }
//   };

//   const config = configs[status];
//   if (!config) return null;

//   const Icon = config.icon;
  
//   const colorClasses = {
//     orange: 'bg-orange-50 border-orange-200 text-orange-900',
//     red: 'bg-red-50 border-red-200 text-red-900',
//     blue: 'bg-blue-50 border-blue-200 text-blue-900'
//   };

//   return (
//     <div className={`rounded-lg border p-3 mx-3 mb-3 ${colorClasses[config.color]}`}>
//       <div className="flex items-start gap-3">
//         <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
//           status === 'checking' ? 'animate-spin' : ''
//         } ${status === 'waking' ? 'animate-pulse' : ''}`} />
        
//         <div className="flex-1 min-w-0">
//           <h3 className="font-semibold text-sm mb-1">{config.title}</h3>
//           <p className="text-xs opacity-90 leading-tight">{config.message}</p>
          
//           {config.showProgress && status === 'waking' && (
//             <div className="mt-2">
//               <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
//                 <div className="bg-current h-1.5 rounded-full animate-pulse w-3/4" />
//               </div>
//               <p className="text-xs mt-1 opacity-75">Please wait...</p>
//             </div>
//           )}
//         </div>
        
//         <button
//           onClick={() => setDismissed(true)}
//           className="text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // Hook for Server Status
// const useServerStatus = () => {
//   const [status, setStatus] = useState('checking');

//   useEffect(() => {
//     const unsubscribe = serverStatusService.subscribe((newStatus) => {
//       setStatus(newStatus);
//     });
    
//     serverStatusService.initialize();
    
//     return () => {
//       unsubscribe();
//       serverStatusService.destroy();
//     };
//   }, []);

//   return { status, retry: () => serverStatusService.checkHealth() };
// };

// // // Mobile Bottom Navigation Bar
// // const MobileBottomNav = ({ 
// //   onNewChat, 
// //   onToggleSidebar, 
// //   onShowVST, 
// //   isAuthenticated 
// // }) => {
// //   return (
// //     <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40">
// //       <div className="flex justify-around items-center">
// //         <button
// //           onClick={onToggleSidebar}
// //           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
// //         >
// //           <Menu className="w-5 h-5 mb-1" />
// //           <span className="text-xs">Chats</span>
// //         </button>
        
// //         <button
// //           onClick={onNewChat}
// //           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
// //         >
// //           <Plus className="w-5 h-5 mb-1" />
// //           <span className="text-xs">New</span>
// //         </button>
        
// //         <button
// //           onClick={onShowVST}
// //           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
// //         >
// //           <Monitor className="w-5 h-5 mb-1" />
// //           <span className="text-xs">VST</span>
// //         </button>
        
// //         {!isAuthenticated && (
// //           <button
// //             onClick={() => window.location.href = '/login'}
// //             className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
// //           >
// //             <User className="w-5 h-5 mb-1" />
// //             <span className="text-xs">Login</span>
// //           </button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };


// // Mobile Bottom Navigation Bar
// const MobileBottomNav = ({ 
//   onNewChat, 
//   onToggleSidebar, 
//   onShowVST, 
//   isAuthenticated,
//   onOpenAuth 
// }) => {
//   return (
//     <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40">
//       <div className="flex justify-around items-center">
//         <button
//           onClick={onToggleSidebar}
//           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <Menu className="w-5 h-5 mb-1" />
//           <span className="text-xs">Chats</span>
//         </button>
        
//         <button
//           onClick={onNewChat}
//           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <Plus className="w-5 h-5 mb-1" />
//           <span className="text-xs">New</span>
//         </button>
        
//         <button
//           onClick={onShowVST}
//           className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <Monitor className="w-5 h-5 mb-1" />
//           <span className="text-xs">VST</span>
//         </button>
        
//         {!isAuthenticated && (
//           <button
//             onClick={() => onOpenAuth('login')}
//             className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             <User className="w-5 h-5 mb-1" />
//             <span className="text-xs">Login</span>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const ChatBot = ({ isAuthenticated, user, onOpenAuth, onNavigate, onLogout }) => {
//   const { status: serverStatus, retry: retryServer } = useServerStatus();
  
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [thinkingMessage, setThinkingMessage] = useState('');
//   const [uploadedMidi, setUploadedMidi] = useState(null);
//   const [lastGeneration, setLastGeneration] = useState(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [chatSessions, setChatSessions] = useState([]);
//   const [currentSessionId, setCurrentSessionId] = useState(null);
//   const [showVSTModal, setShowVSTModal] = useState(false);
  
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  
//   const [resendingEmail, setResendingEmail] = useState(false);
//   const [resendMessage, setResendMessage] = useState('');
  
//   const profileFetched = useRef(false);
  
//   const chatEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);
//   const thinkingIntervalRef = useRef(null);
//   const userMenuRef = useRef(null);

//   // Mobile-specific state
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (!mobile) {
//         setSidebarCollapsed(false);
//       } else {
//         setSidebarCollapsed(true);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   useEffect(() => {
//     if (isAuthenticated && !profileFetched.current) {
//       profileFetched.current = true;
//       fetchUserProfile();
//       fetchChatSessions();
//     } else if (!isAuthenticated) {
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

//   const fetchUserProfile = async () => {
//     try {
//       if (!authService.isAuthenticated()) {
//         return;
//       }

//       const response = await axiosInstance.get('/user/profile');
//       const profileData = response.data;
      
//       setUserProfile(profileData);
      
//       const isVerified = profileData?.emailVerified === true;
//       setEmailVerified(isVerified);
//       setShowVerificationBanner(!isVerified && isAuthenticated);
      
//     } catch (error) {
//       console.error('❌ Failed to fetch profile:', error);
//       if (error.response?.status === 401) {
//         authService.logout();
//         onOpenAuth('login');
//       }
//     }
//   };

//   const fetchChatSessions = async () => {
//     try {
//       if (!authService.isAuthenticated()) return;
      
//       const response = await axiosInstance.get('/chat/sessions');
//       setChatSessions(response.data);
//     } catch (error) {
//       console.error('Failed to fetch chat sessions:', error);
//     }
//   };

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
      
//       // Auto-close sidebar on mobile after selecting a chat
//       if (isMobile) {
//         setSidebarCollapsed(true);
//       }
//     } catch (error) {
//       console.error('Failed to load chat session:', error);
//     }
//   };

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

//   const handleResendVerification = async () => {
//     if (resendingEmail) return;
    
//     setResendingEmail(true);
//     setResendMessage('');
    
//     try {
//       const response = await axiosInstance.post('/auth/resend-verification', {
//         email: user?.email
//       });
      
//       if (response.data.success) {
//         setResendMessage('✅ Verification email sent! Check your inbox and spam folder.');
        
//         setTimeout(() => {
//           setResendMessage('');
//         }, 5000);
//       } else {
//         setResendMessage('❌ ' + (response.data.message || 'Failed to send email'));
//       }
      
//     } catch (error) {
//       console.error('❌ Failed to resend verification:', error);
      
//       if (error.response?.data?.message) {
//         setResendMessage('❌ ' + error.response.data.message);
//       } else {
//         setResendMessage('❌ Failed to send verification email. Please try again.');
//       }
//     } finally {
//       setResendingEmail(false);
//     }
//   };

//   const handleNewChat = () => {
//     setMessages([]);
//     setInputMessage('');
//     setUploadedMidi(null);
//     setLastGeneration(null);
//     setCurrentSessionId(`session-${Date.now()}`);
    
//     // Auto-close sidebar on mobile
//     if (isMobile) {
//       setSidebarCollapsed(true);
//     }
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
//         addErrorMessage('⚠️ Server error. Server is waking up. Please try again in a few moments.');
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
//       return "How should I transform this MIDI?";
//     }
    
//     return "Describe your music idea...";
//   };

//   const FileUploadButton = () => {
//     const isDisabled = isLoading || (!emailVerified && isAuthenticated);
//     const tooltipText = !emailVerified && isAuthenticated 
//       ? "Verify your email first" 
//       : "Upload MIDI file to transform";

//     return (
//       <button
//         onClick={() => fileInputRef.current?.click()}
//         disabled={isDisabled}
//         className={`p-3 rounded-lg transition-colors border flex-shrink-0 ${
//           isDisabled 
//             ? 'bg-gray-100 cursor-not-allowed opacity-50' 
//             : 'bg-white hover:bg-gray-100'
//         }`}
//         title={tooltipText}
//       >
//         <Upload className="w-5 h-5 text-gray-600" />
//       </button>
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
//       <button
//         onClick={() => sendMessage()}
//         disabled={isDisabled}
//         className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
//           isDisabled
//             ? 'bg-gray-300 cursor-not-allowed opacity-50'
//             : 'bg-gray-900 hover:bg-gray-800'
//         }`}
//         title={tooltipText}
//       >
//         <Send className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
//       </button>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-white overflow-hidden text-sm safe-area">
//       {showVSTModal && (
//         <VSTDownloadModal onClose={() => setShowVSTModal(false)} />
//       )}

//       {/* Mobile Overlay */}
//       {!sidebarCollapsed && isMobile && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setSidebarCollapsed(true)}
//         />
//       )}

//       {/* Sidebar - Mobile Optimized */}
//       <div
//         className={`
//           fixed lg:sticky top-0 left-0 z-50 h-full bg-white border-r border-gray-200
//           transition-all duration-300 ease-in-out
//           ${sidebarCollapsed ? 'w-0 lg:w-20' : 'w-80 lg:w-72'}
//           ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
//           ${sidebarCollapsed && 'overflow-hidden'}
//           safe-area-left
//         `}
//       >
//         <div className="flex flex-col h-full w-full">
//           {/* Header */}
//           <div className="flex items-center justify-between p-3 lg:p-4  border-gray-200">
//             {!sidebarCollapsed && (
//               <h2 className="text-lg font-bold text-gray-900 truncate">MIDI Generator</h2>
//             )}
//             <button
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
//             >
//               <PanelRight className="w-5 h-5" />
//             </button>
//           </div>

//           {/* New Chat Button */}
//           {!sidebarCollapsed && (
//             <div className="p-3">
//               <button
//                 onClick={handleNewChat}
//                 className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>New Chat</span>
//               </button>
//             </div>
//           )}

//           {/* Chat Sessions */}
//           <div className="flex-1 overflow-y-auto p-2 space-y-1">
//             {chatSessions.length === 0 ? (
//               !sidebarCollapsed && (
//                 <div className="text-center py-8 px-3">
//                   <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                   <p className="text-sm text-gray-500">No chat history yet</p>
//                 </div>
//               )
//             ) : (
//               chatSessions.map((session) => (
//                 <div
//                   key={session.sessionId}
//                   onClick={() => loadChatSession(session.sessionId)}
//                   className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
//                     currentSessionId === session.sessionId
//                       ? 'bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 min-w-0 flex-1">
//                     <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                     {!sidebarCollapsed && (
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate text-left">
//                           {session.preview}
//                         </p>
//                         <p className="text-xs text-gray-500 text-left">
//                           {session.messageCount} messages
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                   {!sidebarCollapsed && (
//                     <button
//                       onClick={(e) => deleteChatSession(session.sessionId, e)}
//                       className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity flex-shrink-0"
//                     >
//                       <Trash2 className="w-4 h-4 text-red-600" />
//                     </button>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>

//           {/* User Section */}
//           <div className="p-3  border-gray-200">
//             {isAuthenticated ? (
//               <div className="relative" ref={userMenuRef}>
//                 <button
//                   onClick={() => setShowUserMenu(!showUserMenu)}
//                   className={`flex items-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors ${
//                     sidebarCollapsed ? 'justify-center' : 'space-x-3'
//                   }`}
//                 >
//                   <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm relative flex-shrink-0">
//                     {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
//                     {!emailVerified && (
//                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
//                         <Mail className="w-2 h-2 text-white" />
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
//                       <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                     </>
//                   )}
//                 </button>

//                 {showUserMenu && !sidebarCollapsed && (
//                   <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border py-2 z-50">
//                     <div className="px-3 py-2 border-b border-gray-100">
//                       <div className="flex items-center space-x-2 mb-1">
//                         {React.createElement(getTierIcon(userProfile?.subscriptionTier), {
//                           className: `w-4 h-4 ${getTierColor(userProfile?.subscriptionTier)}`
//                         })}
//                         <span className="font-semibold text-gray-900 text-sm">
//                           {userProfile?.subscriptionTier || 'FREE'} Plan
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-600">
//                         Daily: {userProfile?.dailyGenerationCount || 0}/{
//                           userProfile?.subscriptionTier === 'UNLIMITED' ? '∞' :
//                           userProfile?.subscriptionTier === 'FREE' ? 5 :
//                           userProfile?.subscriptionTier === 'BASIC' ? 20 : 100
//                         }
//                       </p>
//                     </div>

//                     <div className="py-1 space-y-0.5">
//                       <button
//                         onClick={() => {
//                           onNavigate('dashboard');
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
//                       >
//                         <User className="w-4 h-4" />
//                         <span>Dashboard</span>
//                       </button>
                      
//                       <button
//                         onClick={() => {
//                           onNavigate('pricing');
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
//                       >
//                         <Crown className="w-4 h-4" />
//                         <span>Upgrade Plan</span>
//                       </button>
//                     </div>

//                     <div className="pt-1 border-t border-gray-100">
//                       <button
//                         onClick={() => {
//                           onLogout();
//                           setShowUserMenu(false);
//                         }}
//                         className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
//                     className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
//                   >
//                     Log In
//                   </button>
//                   <button
//                     onClick={() => onOpenAuth('signup')}
//                     className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
//                   >
//                     Sign Up
//                   </button>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 safe-area-right">
//         {/* Verification Banner */}
//         {showVerificationBanner && isAuthenticated && !emailVerified && (
//           <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2">
//             <div className="max-w-3xl mx-auto">
//               <div className="flex items-center justify-between gap-3">
//                 <div className="flex items-start space-x-2 flex-1 min-w-0">
//                   <Mail className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-yellow-900 leading-tight">
//                       Verify your email to start creating music
//                     </p>
//                     <p className="text-xs text-yellow-700 leading-tight mt-0.5">
//                       Check your inbox for the verification link
//                     </p>
//                     {resendMessage && (
//                       <p className="text-xs mt-1 font-medium text-yellow-800 leading-tight">
//                         {resendMessage}
//                       </p>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-1 flex-shrink-0">
//                   <button
//                     onClick={handleResendVerification}
//                     disabled={resendingEmail}
//                     className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {resendingEmail ? (
//                       <Loader2 className="w-3 h-3 animate-spin" />
//                     ) : (
//                       <RefreshCw className="w-3 h-3" />
//                     )}
//                     <span className="hidden xs:inline">Resend</span>
//                   </button>
                  
//                   <button
//                     onClick={() => setShowVerificationBanner(false)}
//                     className="p-1 hover:bg-yellow-100 rounded transition-colors"
//                   >
//                     <X className="w-3 h-3 text-yellow-600" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <header className="flex items-center justify-between px-3 py-3 bg-white border-gray-200 safe-area-top">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//             <h1 className="text-lg font-bold text-gray-900 truncate">AI Music Generator</h1>
//           </div>
          
//           <button
//             onClick={() => setShowVSTModal(true)}
//             className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
//           >
//             <Monitor className="w-4 h-4" />
//             <span>VST</span>
//           </button>
//         </header>

//         {/* Main Chat Area */}
//         <main className={`flex-1 overflow-y-auto bg-white ${
//           isMobile ? 'pb-16' : 'pb-4'
//         } safe-area-main`}>
//           <div className="max-w-3xl mx-auto">
            
//             <ServerStatusCard 
//               status={serverStatus} 
//               onRetry={retryServer}
//             />
            
//             {messages.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
//                 <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                   <FileMusic className="w-7 h-7 text-gray-600" />
//                 </div>
//                 <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
//                   Describe your musical ideas
//                 </h2>
//                 <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-md">
//                   or upload a MIDI file to transform it
//                 </p>
                
//                 {isAuthenticated && !emailVerified && (
//                   <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md w-full">
//                     <div className="flex items-start space-x-2">
//                       <Mail className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
//                       <div className="text-left">
//                         <p className="text-sm font-semibold text-yellow-900 mb-1">
//                           Verify your email to start generating
//                         </p>
//                         <p className="text-xs text-yellow-700 leading-tight">
//                           Check your inbox for the verification link we sent you.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-3 px-2 sm:px-4">
//                 {messages.map((msg) => (
//                   <MessageBubble
//                     key={msg.id}
//                     message={msg}
//                     onDownload={downloadMidi}
//                   />
//                 ))}

//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border max-w-[85%]">
//                       <div className="flex items-center space-x-2">
//                         <Loader2 className="w-4 h-4 animate-spin text-gray-600 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <div className="text-sm font-medium text-gray-900 truncate">Composing Music</div>
//                           <div className="text-xs text-gray-500 truncate">{thinkingMessage}</div>
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

//         {/* Input Area */}
//         <footer className={`bg-white border-gray-200 ${
//           isMobile ? 'pb-20' : 'pb-3'
//         } safe-area-bottom`}>
//           <div className="max-w-3xl mx-auto px-3">
//             {uploadedMidi && (
//               <div className="mb-2 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
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
//                   className="w-full px-3 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 border disabled:bg-gray-50 disabled:cursor-not-allowed text-base" // Larger text on mobile
//                   style={{
//                     minHeight: '52px',
//                     maxHeight: '120px'
//                   }}
//                   rows={1}
//                   disabled={isLoading || (!emailVerified && isAuthenticated)}
//                   onInput={(e) => {
//                     e.target.style.height = 'auto';
//                     e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
//                   }}
//                 />
                
//                 {inputMessage.length > 800 && (
//                   <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
//                     {inputMessage.length}/1000
//                   </div>
//                 )}
//               </div>

//               <SendButton />
//             </div>
            
//             {uploadedMidi && emailVerified && (
//               <p className="text-xs text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
//                 <span>💡</span>
//                 <span>Describe how to transform your MIDI file</span>
//               </p>
//             )}
            
//             {!emailVerified && isAuthenticated && (
//               <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
//                 <Mail className="w-3.5 h-3.5 flex-shrink-0" />
//                 <span className="text-center">Verify your email to start generating music</span>
//               </div>
//             )}
            
//             {inputMessage.length > 0 && inputMessage.length < 3 && (
//               <p className="text-xs text-orange-600 mt-2 text-center">
//                 ⚠️ Please provide a more detailed description
//               </p>
//             )}
//           </div>
//         </footer>

//         {/* Mobile Bottom Navigation */}
//         {isMobile && (
//           <MobileBottomNav
//             onNewChat={handleNewChat}
//             onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
//             onShowVST={() => setShowVSTModal(true)}
//             isAuthenticated={isAuthenticated}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// const VSTDownloadModal = ({ onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-3 safe-area">
//       <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
//               </div>
//               <div className="min-w-0">
//                 <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">MIDI Generator VST</h2>
//                 <p className="text-sm text-gray-600 truncate">Professional DAW Integration</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="mb-4">
//             <p className="text-gray-700 mb-4 text-sm sm:text-base">
//               Generate AI-powered MIDI directly inside your DAW! Works with Ableton Live, FL Studio, Logic Pro, and more.
//             </p>
            
//             <div className="bg-gray-100 rounded-lg p-3 mb-3">
//               <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Features</h3>
//               <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
//                 <li>• Generate MIDI directly in your DAW</li>
//                 <li>• Same account & generation limits as web</li>
//                 <li>• Real-time AI composition</li>
//                 <li>• Control creativity & bar count</li>
//                 <li>• Syncs with your dashboard</li>
//               </ul>
//             </div>

//             <div className="bg-gray-100 rounded-lg p-3">
//               <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Requirements</h3>
//               <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
//                 <li>• Windows 10/11</li>
//                 <li>• VST3 compatible DAW</li>
//                 <li>• Active account (Free or Paid)</li>
//                 <li>• Internet connection</li>
//               </ul>
//             </div>
//           </div>

//           <div className="space-y-3 mb-4">
//             <a
//               href="/vst/MidiGenerator.vst3.rar"
//               download
//               className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm sm:text-base"
//             >
//               <Monitor className="w-5 h-5 flex-shrink-0" />
//               <div className="text-left min-w-0 flex-1">
//                 <div className="font-semibold truncate">Download for Windows</div>
//                 <div className="text-xs opacity-90 truncate">VST3 Plugin • ~1.24 MB</div>
//               </div>
//               <Download className="w-5 h-5 flex-shrink-0" />
//             </a>
//           </div>

//           <div className="pt-4 border-t border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Installation</h3>
            
//             <div className="space-y-3">
//               <div className="bg-gray-100 rounded-lg p-3">
//                 <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Windows</h4>
//                 <ol className="text-xs sm:text-sm text-gray-700 space-y-1 list-decimal list-inside">
//                   <li>Download the Windows VST3 file</li>
//                   <li>Extract to: <code className="bg-white px-1 py-0.5 rounded text-xs font-mono">C:\Program Files\Common Files\VST3\</code></li>
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

// const MessageBubble = ({ message, onDownload }) => {
//   const getSourceBadge = (source) => {
//     if (source === 'vst' || source === 'VST') {
//       return (
//         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
//           <Monitor className="w-3 h-3 mr-1" />
//           VST
//         </span>
//       );
//     } else if (source === 'web' || source === 'WEB' || !source) {
//       return (
//         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
//           <Globe className="w-3 h-3 mr-1" />
//           Web
//         </span>
//       );
//     }
//     return null;
//   };

//   if (message.type === 'user') {
//     return (
//       <div className="flex justify-end">
//         <div className="bg-gray-900 text-white rounded-2xl px-3 py-2 max-w-[90%] sm:max-w-[80%]">
//           {message.hasUpload && (
//             <div className="flex items-center space-x-2 mb-1 pb-1 border-b border-gray-700">
//               <FileMusic className="w-3 h-3" />
//               <span className="text-xs opacity-75 truncate">{message.uploadFileName}</span>
//             </div>
//           )}
//           <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
//         </div>
//       </div>
//     );
//   }

//   if (message.type === 'error') {
//     return (
//       <div className="flex justify-center">
//         <div className="bg-red-50 rounded-lg px-3 py-2 max-w-[95%] border border-red-200">
//           <div className="flex items-start space-x-2">
//             <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
//               <p className="text-sm text-red-800 whitespace-pre-wrap break-words">{message.content}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (message.type === 'system') {
//     return (
//       <div className="flex justify-center">
//         <div className="bg-blue-50 rounded-full px-3 py-1.5 border border-blue-200 max-w-[90%]">
//           <p className="text-xs text-blue-800 font-medium text-center truncate">{message.content}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-start">
//       <div className="bg-white rounded-2xl shadow-sm max-w-[90%] sm:max-w-[80%] overflow-hidden border">
//         <div className="px-3 py-2">
//           <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
//             <div className="flex items-center space-x-2 min-w-0">
//               <p className="text-sm font-semibold text-gray-900 truncate">
//                 {message.wasUploadBased ? 'Transformed' : 'Generated'}
//               </p>
//               {getSourceBadge(message.source)}
//             </div>
//             {message.barCount && (
//               <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
//                 {message.barCount} bars
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="px-3 pb-3">
//           {message.midiUrl && (
//             <div className={`rounded-lg p-3 mb-3 ${
//               (message.source === 'vst' || message.source === 'VST')
//                 ? 'bg-purple-50 border border-purple-200' 
//                 : 'bg-gray-100'
//             }`}>
//               <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
//                 <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
//                   <FileMusic className={`w-4 h-4 ${
//                     (message.source === 'vst' || message.source === 'VST') 
//                       ? 'text-purple-700' 
//                       : 'text-gray-700'
//                   }`} />
//                   <div className="min-w-0 flex-1">
//                     <p className="text-sm font-semibold text-gray-900 truncate">MIDI File Ready</p>
//                     <p className="text-xs text-gray-600 truncate">
//                       {message.barCount} bars • {
//                         (message.source === 'vst' || message.source === 'VST') 
//                           ? 'VST Plugin' 
//                           : 'Web'
//                       }
//                     </p>
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={() => onDownload(message.midiUrl)}
//                   className={`w-full sm:w-auto px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center justify-center space-x-2 transition-colors ${
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
//               className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors border text-xs sm:text-sm"
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
  Globe, Mail, RefreshCw, Server, Menu, Wifi, WifiOff
} from 'lucide-react';
import authService from '../services/authService';
import axiosInstance from '../services/axiosConfig';
import { getErrorMessage } from '../utils/errorUtils';
import { serverStatusService } from '../services/serverStatusService';

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
      return count;
    }
  }
  
  const pattern2 = /bars?[\s:=]+(\d+)/i;
  const match2 = text.match(pattern2);
  if (match2) {
    const count = parseInt(match2[1]);
    if (count > 0 && count <= 500) {
      return count;
    }
  }
  
  return null;
};

// Enhanced Server Status Card Component
const ServerStatusCard = ({ status, failedAttempts, onRetry }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastStatus, setLastStatus] = useState(status);

  // Handle success state when server becomes healthy
  useEffect(() => {
    if (lastStatus !== 'healthy' && status === 'healthy') {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setDismissed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    setLastStatus(status);
  }, [status, lastStatus]);

  // Reset dismissed when status changes to non-healthy
  useEffect(() => {
    if (status !== 'healthy') {
      setDismissed(false);
      setShowSuccess(false);
    }
  }, [status]);

  if (dismissed && status === 'healthy') return null;

  const configs = {
    checking: {
      icon: Loader2,
      color: 'blue',
      title: 'Checking Server',
      message: 'Connecting to music generation service...',
      showProgress: false,
      showRetry: false
    },
    waking: {
      icon: Server,
      color: 'orange',
      title: 'Server Waking Up',
      message: 'First visit takes 1-3 minutes. Server is starting up...',
      showProgress: true,
      showRetry: true
    },
    error: {
      icon: WifiOff,
      color: 'red',
      title: 'Connection Failed',
      message: `Cannot connect to server (Attempt ${failedAttempts})`,
      showProgress: false,
      showRetry: true
    },
    healthy: {
      icon: Wifi,
      color: 'green',
      title: 'Server Online',
      message: 'Music generation service is ready!',
      showProgress: false,
      showRetry: false
    },
    success: {
      icon: CheckCircle,
      color: 'green',
      title: 'Server Ready!',
      message: 'Music generation service is now online and ready to use.',
      showProgress: false,
      showRetry: false
    }
  };

  const currentStatus = showSuccess ? 'success' : status;
  const config = configs[currentStatus];
  if (!config) return null;

  const Icon = config.icon;
  
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900'
  };

  const getProgressMessage = () => {
    if (status === 'waking') {
      const minutes = Math.floor(failedAttempts * 5 / 60);
      const seconds = (failedAttempts * 5) % 60;
      return `Attempting to connect... (${minutes}:${seconds.toString().padStart(2, '0')})`;
    }
    return config.message;
  };

  return (
    <div className={`rounded-lg border p-3 mx-3 mb-3 ${colorClasses[config.color]} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          status === 'checking' || status === 'waking' ? 'animate-spin' : ''
        } ${showSuccess ? 'animate-pulse' : ''}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{config.title}</h3>
            {config.showRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Retry Now
              </button>
            )}
          </div>
          <p className="text-xs opacity-90 leading-tight">{getProgressMessage()}</p>
          
          {config.showProgress && status === 'waking' && (
            <div className="mt-2">
              <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-current h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-75">
                <span>Starting services...</span>
                <span>{failedAttempts * 5}s</span>
              </div>
            </div>
          )}
        </div>
        
        {!showSuccess && (
          <button
            onClick={() => setDismissed(true)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for Server Status
const useServerStatus = () => {
  const [status, setStatus] = useState('checking');
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    const unsubscribe = serverStatusService.subscribe((newStatus, attempts) => {
      setStatus(newStatus);
      setFailedAttempts(attempts);
    });
    
    serverStatusService.initialize();
    
    return () => {
      unsubscribe();
      serverStatusService.destroy();
    };
  }, []);

  return { 
    status, 
    failedAttempts,
    retry: () => serverStatusService.checkHealth() 
  };
};

// Mobile Bottom Navigation Bar
const MobileBottomNav = ({ 
  onNewChat, 
  onToggleSidebar, 
  onShowVST, 
  isAuthenticated,
  onOpenAuth 
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40 safe-area-bottom">
      <div className="flex justify-around items-center">
        <button
          onClick={onToggleSidebar}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-xs">Chats</span>
        </button>
        
        <button
          onClick={onNewChat}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs">New</span>
        </button>
        
        <button
          onClick={onShowVST}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Monitor className="w-5 h-5 mb-1" />
          <span className="text-xs">VST</span>
        </button>
        
        {!isAuthenticated && (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

const ChatBot = ({ isAuthenticated, user, onOpenAuth, onNavigate, onLogout }) => {
  const { status: serverStatus, failedAttempts, retry: retryServer } = useServerStatus();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [uploadedMidi, setUploadedMidi] = useState(null);
  const [lastGeneration, setLastGeneration] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showVSTModal, setShowVSTModal] = useState(false);
  
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const profileFetched = useRef(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const userMenuRef = useRef(null);

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated && !profileFetched.current) {
      profileFetched.current = true;
      fetchUserProfile();
      fetchChatSessions();
    } else if (!isAuthenticated) {
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

  const fetchUserProfile = async () => {
    try {
      if (!authService.isAuthenticated()) {
        return;
      }

      const response = await axiosInstance.get('/user/profile');
      const profileData = response.data;
      
      setUserProfile(profileData);
      
      const isVerified = profileData?.emailVerified === true;
      setEmailVerified(isVerified);
      setShowVerificationBanner(!isVerified && isAuthenticated);
      
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        authService.logout();
        onOpenAuth('login');
      }
    }
  };

  const fetchChatSessions = async () => {
    try {
      if (!authService.isAuthenticated()) return;
      
      const response = await axiosInstance.get('/chat/sessions');
      setChatSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

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
      
      // Auto-close sidebar on mobile after selecting a chat
      if (isMobile) {
        setSidebarCollapsed(true);
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

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

  const handleResendVerification = async () => {
    if (resendingEmail) return;
    
    setResendingEmail(true);
    setResendMessage('');
    
    try {
      const response = await axiosInstance.post('/auth/resend-verification', {
        email: user?.email
      });
      
      if (response.data.success) {
        setResendMessage('✅ Verification email sent! Check your inbox and spam folder.');
        
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
    
    // Auto-close sidebar on mobile
    if (isMobile) {
      setSidebarCollapsed(true);
    }
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

  const sendMessage = async (messageType = 'generate') => {
    // Check server status first
    if (serverStatus !== 'healthy') {
      addErrorMessage('⚠️ Server is starting up. Please wait until the server is ready (1-3 minutes for first visit)');
      retryServer(); // Trigger immediate retry
      return;
    }

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
        addErrorMessage('⚠️ Server error. Server is waking up. Please try again in a few moments.');
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
    if (serverStatus !== 'healthy') {
      return "Server starting... Please wait";
    }
    
    if (!emailVerified && isAuthenticated) {
      return "Verify your email to start generating...";
    }
    
    if (uploadedMidi) {
      return "How should I transform this MIDI?";
    }
    
    return "Describe your music idea...";
  };

  const FileUploadButton = () => {
    const isDisabled = isLoading || (!emailVerified && isAuthenticated) || serverStatus !== 'healthy';
    let tooltipText = "Upload MIDI file to transform";
    
    if (!emailVerified && isAuthenticated) {
      tooltipText = "Verify your email first";
    } else if (serverStatus !== 'healthy') {
      tooltipText = "Server is starting up";
    }

    return (
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled}
        className={`p-3 rounded-lg transition-colors border flex-shrink-0 ${
          isDisabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
            : 'bg-white hover:bg-gray-100'
        }`}
        title={tooltipText}
      >
        <Upload className="w-5 h-5 text-gray-600" />
      </button>
    );
  };

  const SendButton = () => {
    const isDisabled = isLoading || !inputMessage.trim() || (!emailVerified && isAuthenticated) || serverStatus !== 'healthy';
    
    let tooltipText = "Send message";
    if (serverStatus !== 'healthy') {
      tooltipText = "Server is starting up";
    } else if (!emailVerified && isAuthenticated) {
      tooltipText = "Verify your email first";
    } else if (!inputMessage.trim()) {
      tooltipText = "Enter a description";
    } else if (isLoading) {
      tooltipText = "Generating...";
    }

    return (
      <button
        onClick={() => sendMessage()}
        disabled={isDisabled}
        className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
          isDisabled
            ? 'bg-gray-300 cursor-not-allowed opacity-50'
            : 'bg-gray-900 hover:bg-gray-800'
        }`}
        title={tooltipText}
      >
        <Send className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-sm safe-area">
      {showVSTModal && (
        <VSTDownloadModal onClose={() => setShowVSTModal(false)} />
      )}

      {/* Mobile Overlay */}
      {!sidebarCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar - Mobile Optimized */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-0 lg:w-20' : 'w-80 lg:w-72'}
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          ${sidebarCollapsed && 'overflow-hidden'}
          safe-area-left
        `}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 lg:p-4  border-gray-200">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-bold text-gray-900 truncate">MIDI Generator</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          {!sidebarCollapsed && (
            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>
          )}

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chatSessions.length === 0 ? (
              !sidebarCollapsed && (
                <div className="text-center py-8 px-3">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No chat history yet</p>
                </div>
              )
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => loadChatSession(session.sessionId)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.sessionId
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate text-left">
                          {session.preview}
                        </p>
                        <p className="text-xs text-gray-500 text-left">
                          {session.messageCount} messages
                        </p>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <button
                      onClick={(e) => deleteChatSession(session.sessionId, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* User Section */}
          <div className="p-3  border-gray-200">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors ${
                    sidebarCollapsed ? 'justify-center' : 'space-x-3'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm relative flex-shrink-0">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    {!emailVerified && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <Mail className="w-2 h-2 text-white" />
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
                      <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </>
                  )}
                </button>

                {showUserMenu && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2 mb-1">
                        {React.createElement(getTierIcon(userProfile?.subscriptionTier), {
                          className: `w-4 h-4 ${getTierColor(userProfile?.subscriptionTier)}`
                        })}
                        <span className="font-semibold text-gray-900 text-sm">
                          {userProfile?.subscriptionTier || 'FREE'} Plan
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Daily: {userProfile?.dailyGenerationCount || 0}/{
                          userProfile?.subscriptionTier === 'UNLIMITED' ? '∞' :
                          userProfile?.subscriptionTier === 'FREE' ? 5 :
                          userProfile?.subscriptionTier === 'BASIC' ? 20 : 100
                        }
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onNavigate('pricing');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade Plan</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                    className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 safe-area-right">
        {/* Verification Banner */}
        {showVerificationBanner && isAuthenticated && !emailVerified && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <Mail className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-yellow-900 leading-tight">
                      Verify your email to start creating music
                    </p>
                    <p className="text-xs text-yellow-700 leading-tight mt-0.5">
                      Check your inbox for the verification link
                    </p>
                    {resendMessage && (
                      <p className="text-xs mt-1 font-medium text-yellow-800 leading-tight">
                        {resendMessage}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingEmail ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span className="hidden xs:inline">Resend</span>
                  </button>
                  
                  <button
                    onClick={() => setShowVerificationBanner(false)}
                    className="p-1 hover:bg-yellow-100 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-yellow-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between px-3 py-3 bg-white border-gray-200 safe-area-top">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate">AI Music Generator</h1>
          </div>
          
          <button
            onClick={() => setShowVSTModal(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <Monitor className="w-4 h-4" />
            <span>VST</span>
          </button>
        </header>

        {/* Main Chat Area */}
        <main className={`flex-1 overflow-y-auto bg-white ${
          isMobile ? 'pb-16' : 'pb-4'
        } safe-area-main`}>
          <div className="max-w-3xl mx-auto">
            
            <ServerStatusCard 
              status={serverStatus}
              failedAttempts={failedAttempts}
              onRetry={retryServer}
            />
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FileMusic className="w-7 h-7 text-gray-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Describe your musical ideas
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-md">
                  or upload a MIDI file to transform it
                </p>
                
                {/* {serverStatus !== 'healthy' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md w-full">
                    <div className="flex items-start space-x-2">
                      <Loader2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Server is starting up
                        </p>
                        <p className="text-xs text-blue-700 leading-tight">
                          First-time setup takes 1-3 minutes. You'll be able to generate music once ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
                
                {/* {isAuthenticated && !emailVerified && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md w-full">
                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          Verify your email to start generating
                        </p>
                        <p className="text-xs text-yellow-700 leading-tight">
                          Check your inbox for the verification link we sent you.
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            ) : (
              <div className="space-y-3 px-2 sm:px-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onDownload={downloadMidi}
                  />
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">Composing Music</div>
                          <div className="text-xs text-gray-500 truncate">{thinkingMessage}</div>
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

        {/* Input Area */}
        <footer className={`bg-white  border-gray-200 ${
          isMobile ? 'pb-20' : 'pb-3'
        } safe-area-bottom`}>
          <div className="max-w-3xl mx-auto px-3">
            {uploadedMidi && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
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
                  className="w-full px-3 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 border disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                  style={{
                    minHeight: '52px',
                    maxHeight: '120px'
                  }}
                  rows={1}
                  disabled={isLoading || (!emailVerified && isAuthenticated) || serverStatus !== 'healthy'}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                
                {inputMessage.length > 800 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                    {inputMessage.length}/1000
                  </div>
                )}
              </div>

              <SendButton />
            </div>
            
            {uploadedMidi && emailVerified && serverStatus === 'healthy' && (
              <p className="text-xs text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
                <span>💡</span>
                <span>Describe how to transform your MIDI file</span>
              </p>
            )}
            
            {!emailVerified && isAuthenticated && (
              <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-center">Verify your email to start generating music</span>
              </div>
            )}
            
            {serverStatus !== 'healthy' && (
              <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                <span className="text-center">Server is starting up... This takes 1-3 minutes for first visit</span>
              </div>
            )}
            
            {inputMessage.length > 0 && inputMessage.length < 3 && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                ⚠️ Please provide a more detailed description
              </p>
            )}
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav
            onNewChat={handleNewChat}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onShowVST={() => setShowVSTModal(true)}
            isAuthenticated={isAuthenticated}
            onOpenAuth={onOpenAuth}
          />
        )}
      </div>
    </div>
  );
};

const VSTDownloadModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-3 safe-area">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">MIDI Generator VST</h2>
                <p className="text-sm text-gray-600 truncate">Professional DAW Integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-4 text-sm sm:text-base">
              Generate AI-powered MIDI directly inside your DAW! Works with Ableton Live, FL Studio, Logic Pro, and more.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Features</h3>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                <li>• Generate MIDI directly in your DAW</li>
                <li>• Same account & generation limits as web</li>
                <li>• Real-time AI composition</li>
                <li>• Control creativity & bar count</li>
                <li>• Syncs with your dashboard</li>
              </ul>
            </div>

            <div className="bg-gray-100 rounded-lg p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Requirements</h3>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                <li>• Windows 10/11</li>
                <li>• VST3 compatible DAW</li>
                <li>• Active account (Free or Paid)</li>
                <li>• Internet connection</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <a
              href="/vst/MidiGenerator.vst3.rar"
              download
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm sm:text-base"
            >
              <Monitor className="w-5 h-5 flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <div className="font-semibold truncate">Download for Windows</div>
                <div className="text-xs opacity-90 truncate">VST3 Plugin • ~1.24 MB</div>
              </div>
              <Download className="w-5 h-5 flex-shrink-0" />
            </a>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Installation</h3>
            
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Windows</h4>
                <ol className="text-xs sm:text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Download the Windows VST3 file</li>
                  <li>Extract to: <code className="bg-white px-1 py-0.5 rounded text-xs font-mono">C:\Program Files\Common Files\VST3\</code></li>
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

const MessageBubble = ({ message, onDownload }) => {
  const getSourceBadge = (source) => {
    if (source === 'vst' || source === 'VST') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
          <Monitor className="w-3 h-3 mr-1" />
          VST
        </span>
      );
    } else if (source === 'web' || source === 'WEB' || !source) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <Globe className="w-3 h-3 mr-1" />
          Web
        </span>
      );
    }
    return null;
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white rounded-2xl px-3 py-2 max-w-[90%] sm:max-w-[80%]">
          {message.hasUpload && (
            <div className="flex items-center space-x-2 mb-1 pb-1 border-b border-gray-700">
              <FileMusic className="w-3 h-3" />
              <span className="text-xs opacity-75 truncate">{message.uploadFileName}</span>
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 rounded-lg px-3 py-2 max-w-[95%] border border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-800 whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 rounded-full px-3 py-1.5 border border-blue-200 max-w-[90%]">
          <p className="text-xs text-blue-800 font-medium text-center truncate">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl shadow-sm max-w-[90%] sm:max-w-[80%] overflow-hidden border">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
            <div className="flex items-center space-x-2 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {message.wasUploadBased ? 'Transformed' : 'Generated'}
              </p>
              {getSourceBadge(message.source)}
            </div>
            {message.barCount && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                {message.barCount} bars
              </span>
            )}
          </div>
        </div>

        <div className="px-3 pb-3">
          {message.midiUrl && (
            <div className={`rounded-lg p-3 mb-3 ${
              (message.source === 'vst' || message.source === 'VST')
                ? 'bg-purple-50 border border-purple-200' 
                : 'bg-gray-100'
            }`}>
              <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
                <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
                  <FileMusic className={`w-4 h-4 ${
                    (message.source === 'vst' || message.source === 'VST') 
                      ? 'text-purple-700' 
                      : 'text-gray-700'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">MIDI File Ready</p>
                    <p className="text-xs text-gray-600 truncate">
                      {message.barCount} bars • {
                        (message.source === 'vst' || source === 'VST') 
                          ? 'VST Plugin' 
                          : 'Web'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => onDownload(message.midiUrl)}
                  className={`w-full sm:w-auto px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center justify-center space-x-2 transition-colors ${
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
              className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors border text-xs sm:text-sm"
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