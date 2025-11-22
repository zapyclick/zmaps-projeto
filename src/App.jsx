import { useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';S
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, TrendingUp, MessageSquare, Book, Settings, Copy, Download, Upload, Search, Star, Award, Target, Zap, Menu, X, Home, FileText, BarChart3, MessageCircle, BookOpen, Type, Maximize2 } from 'lucide-react';

const ZMapsApp = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [businessData, setBusinessData] = useState(() => {
    const saved = localStorage.getItem('zmaps_business');
    return saved ? JSON.parse(saved) : {
      name: '',
      address: '',
      gbpLink: '',
      whatsapp: '',
      email: ''
    };
  });
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('zmaps_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPost, setCurrentPost] = useState({
    type: 'promotion',
    userInput: '',
    generatedCopy: '',
    image: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [reviewResponse, setReviewResponse] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [questionResponse, setQuestionResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [faqs, setFaqs] = useState(() => {
    const saved = localStorage.getItem('zmaps_faqs');
    return saved ? JSON.parse(saved) : [];
  });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [isGeneratingFaq, setIsGeneratingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageText, setImageText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(48);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const canvasRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [user, setUser] = useState(null);

useEffect(() => {
  // Inicializar Netlify Identity
    netlifyIdentity.on('init', user => {
      if (user) {
        setIsLoggedIn(true);
        setUser(user);
      }
    });

    netlifyIdentity.on('login', user => {
      setIsLoggedIn(true);
      setUser(user);
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setIsLoggedIn(false);
      setUser(null);
    });

    netlifyIdentity.init();
  }, []);

  const handleLogin = () => {
    netlifyIdentity.open('login');
  };

  const handleSignup = () => {
    netlifyIdentity.open('signup');
  };

  const handleLogout = () => {
    netlifyIdentity.logout();
  };
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('zmaps_business', JSON.stringify(businessData));
  }, [businessData]);

  useEffect(() => {
    localStorage.setItem('zmaps_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('zmaps_faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const postTypes = {
    promotion: { label: 'Promoção', icon: '🎉', color: 'bg-red-50 border-red-200' },
    launch: { label: 'Lançamento', icon: '🚀', color: 'bg-blue-50 border-blue-200' },
    news: { label: 'Novidades', icon: '📰', color: 'bg-green-50 border-green-200' },
    reservation: { label: 'Reservas', icon: '📅', color: 'bg-yellow-50 border-yellow-200' }
  };

  const generateCopy = async () => {
    if (!currentPost.userInput.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const prompts = {
        promotion: `Crie uma copy ULTRA PERSUASIVA para uma promoção no Google Business Profile usando técnicas de neuromarketing e Alex Hormozi. 

Informações: ${currentPost.userInput}
Nome do negócio: ${businessData.name || 'nosso negócio'}

REGRAS OBRIGATÓRIAS:
- Use FOMO (escassez de tempo/quantidade)
- Neurônio espelho (visualização do resultado)
- Oferta irresistível estilo Alex Hormozi (empilhamento de valor)
- Máximo 1500 caracteres
- Inclua CTA forte
- Tom: urgente, entusiasmado, mas profissional`,
        
        launch: `Crie uma copy IMPACTANTE para lançamento de produto/serviço no Google Business Profile.

Informações: ${currentPost.userInput}
Nome do negócio: ${businessData.name || 'nosso negócio'}

REGRAS:
- Gere curiosidade e antecipação
- Destaque o que é revolucionário/diferente
- Use prova social se possível
- Máximo 1500 caracteres
- Tom: empolgante, inovador`,
        
        news: `Crie uma copy ENGAJADORA para novidade/atualização no Google Business Profile.

Informações: ${currentPost.userInput}
Nome do negócio: ${businessData.name || 'nosso negócio'}

REGRAS:
- Destaque o benefício para o cliente
- Crie conexão emocional
- Máximo 1500 caracteres
- Tom: amigável, informativo, empolgante`,
        
        reservation: `Crie uma copy CONVIDATIVA para reservas/agendamentos no Google Business Profile.

Informações: ${currentPost.userInput}
Nome do negócio: ${businessData.name || 'nosso negócio'}

REGRAS:
- Facilite a ação de reservar
- Destaque disponibilidade limitada (se aplicável)
- Crie sensação de exclusividade
- Máximo 1500 caracteres
- Tom: acolhedor, profissional`
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: prompts[currentPost.type] }
          ]
        })
      });

      const data = await response.json();
      const generatedText = data.content[0].text;
      
      setCurrentPost(prev => ({
        ...prev,
        generatedCopy: generatedText
      }));
    } catch (error) {
      console.error('Erro ao gerar copy:', error);
      alert('Erro ao gerar copy. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setCurrentPost(prev => ({ ...prev, image: imageUrl }));
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyImageEdits = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPost.image) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas to 1200x900 (GBP ideal size)
      canvas.width = 1200;
      canvas.height = 900;
      
      // Draw image (cover fit)
      const scale = Math.max(1200 / img.width, 900 / img.height);
      const x = (1200 - img.width * scale) / 2;
      const y = (900 - img.height * scale) / 2;
      
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 1200, 900);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Draw text if exists
      if (imageText) {
        const textX = (textPosition.x / 100) * 1200;
        const textY = (textPosition.y / 100) * 900;
        
        // Background for text
        ctx.font = `bold ${textSize}px Arial, sans-serif`;
        const textMetrics = ctx.measureText(imageText);
        const padding = 20;
        
        ctx.fillStyle = backgroundColor + Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0');
        ctx.fillRect(
          textX - padding,
          textY - textSize - padding,
          textMetrics.width + padding * 2,
          textSize + padding * 2
        );
        
        // Text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(imageText, textX, textY - textSize);
      }
      
      // Save edited image
      const editedImage = canvas.toDataURL('image/jpeg', 0.9);
      setCurrentPost(prev => ({ ...prev, image: editedImage }));
      setShowImageEditor(false);
      setImageText('');
    };
    
    img.src = currentPost.image;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      localStorage.setItem('zmaps_logged_in', 'true');
      localStorage.setItem('zmaps_user_email', loginEmail);
      setIsLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zmaps_logged_in');
    localStorage.removeItem('zmaps_user_email');
    setIsLoggedIn(false);
  };

  const acceptCookies = () => {
    localStorage.setItem('zmaps_cookies_accepted', 'true');
    setShowCookieConsent(false);
  };

  {/* Login Screen */}
if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ZMaps
          </h1>
          <p className="text-gray-600 text-sm">
            Perfil brilhando, cliente chegando
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Entrar
          </button>

          <button
            onClick={handleSignup}
            className="w-full p-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Criar Conta
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Ao continuar, você concorda com nossos
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-blue-600 hover:underline"
            >
              Termos de Uso
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-blue-600 hover:underline"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center mb-2">Precisa de ajuda?</p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="https://wa.me/5511957055256" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              WhatsApp
            </a>
            <a href="mailto:zapy@zapy.click" className="text-blue-600 hover:underline">
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

  const savePost = () => {
    if (!currentPost.generatedCopy) {
      alert('Gere uma copy primeiro!');
      return;
    }
    
    const newPost = {
      ...currentPost,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setPosts(prev => [newPost, ...prev]);
    setCurrentPost({
      type: 'promotion',
      userInput: '',
      generatedCopy: '',
      image: null
    });
    alert('Post salvo com sucesso!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  const generateAIResponse = async (input, type) => {
    setIsGeneratingResponse(true);
    
    const prompts = {
      review: `Você é um especialista em atendimento ao cliente. Crie uma resposta profissional, empática e breve para esta avaliação do Google: "${input}". Nome do negócio: ${businessData.name || 'nosso negócio'}`,
      question: `Você é um especialista em atendimento. Responda esta pergunta de forma clara e útil: "${input}". Nome do negócio: ${businessData.name || 'nosso negócio'}`
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            { role: 'user', content: prompts[type] }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;
      
      if (type === 'review') {
        setReviewResponse(aiResponse);
      } else {
        setQuestionResponse(aiResponse);
      }
    } catch (error) {
      console.error('Erro:', error);
      if (type === 'review') {
        setReviewResponse('Erro ao gerar resposta.');
      } else {
        setQuestionResponse('Erro ao gerar resposta.');
      }
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { 
              role: 'user', 
              content: `Você é um consultor especializado em marketing digital, vendas e varejo. Negócio: ${businessData.name || 'não informado'}. Pergunta: ${currentInput}`
            }
          ]
        })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.content[0].text };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar.' }]);
    }
  };

  const generateFaqAnswer = async () => {
    if (!newFaqQuestion.trim()) return;
    
    setIsGeneratingFaq(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            { 
              role: 'user', 
              content: `Você é um especialista em atendimento ao cliente para Google Business Profile.

Nome do negócio: ${businessData.name || 'nosso negócio'}
Pergunta do cliente: "${newFaqQuestion}"

Crie uma resposta PROFISSIONAL, CLARA e ÚTIL seguindo estas regras:
- Máximo 300 caracteres (ideal para GBP)
- Tom amigável mas profissional
- Seja direto e objetivo
- Se relevante, inclua um CTA suave (ex: "Entre em contato", "Visite-nos")
- Não invente informações - seja genérico se necessário

Responda APENAS com o texto da resposta, sem prefixos ou explicações.`
            }
          ]
        })
      });

      const data = await response.json();
      const answer = data.content[0].text;
      setNewFaqAnswer(answer);
    } catch (error) {
      console.error('Erro ao gerar resposta FAQ:', error);
      setNewFaqAnswer('Erro ao gerar resposta. Tente novamente.');
    } finally {
      setIsGeneratingFaq(false);
    }
  };

  const saveFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      alert('Preencha a pergunta e gere uma resposta!');
      return;
    }

    if (editingFaqId) {
      setFaqs(prev => prev.map(faq => 
        faq.id === editingFaqId 
          ? { ...faq, question: newFaqQuestion, answer: newFaqAnswer }
          : faq
      ));
      setEditingFaqId(null);
    } else {
      const newFaq = {
        id: Date.now(),
        question: newFaqQuestion,
        answer: newFaqAnswer,
        createdAt: new Date().toISOString()
      };
      setFaqs(prev => [newFaq, ...prev]);
    }

    setNewFaqQuestion('');
    setNewFaqAnswer('');
    alert(editingFaqId ? 'FAQ atualizado!' : 'FAQ salvo com sucesso!');
  };

  const editFaq = (faq) => {
    setNewFaqQuestion(faq.question);
    setNewFaqAnswer(faq.answer);
    setEditingFaqId(faq.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteFaq = (id) => {
    if (confirm('Deseja realmente excluir esta FAQ?')) {
      setFaqs(prev => prev.filter(faq => faq.id !== id));
    }
  };

  const cancelEditFaq = () => {
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setEditingFaqId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-white shadow-2xl transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-0 md:w-20'
      }`}>
        <div className={`h-full flex flex-col ${sidebarOpen ? 'p-6' : 'p-4'}`}>
          {/* Logo e Toggle */}
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                      <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                      <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ZMaps
                  </h1>
                  <p className="text-xs text-gray-500">GBP Manager</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {[
              { id: 'posts', icon: Sparkles, label: 'Criar Posts', color: 'blue' },
              { id: 'faqs', icon: MessageCircle, label: 'FAQs', color: 'purple' },
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'green' },
              { id: 'responses', icon: MessageSquare, label: 'Respostas', color: 'orange' },
              { id: 'knowledge', icon: BookOpen, label: 'Conhecimento', color: 'pink' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? `bg-${item.color}-600 text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={activeTab === item.id ? {
                  backgroundColor: item.color === 'blue' ? '#2563eb' :
                                   item.color === 'purple' ? '#9333ea' :
                                   item.color === 'green' ? '#16a34a' :
                                   item.color === 'orange' ? '#ea580c' : '#ec4899'
                } : {}}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              showSettings ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Configurações</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <X className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>

          {/* User Info */}
          {sidebarOpen && businessData.name && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
              <p className="text-xs text-gray-500 mb-1">Seu Negócio</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{businessData.name}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div className="flex-1 bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo no Header para quando sidebar fecha */}
                  {!sidebarOpen && (
                    <div className="relative hidden md:block">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                          <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                          <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ZMaps - Perfil brilhando, cliente chegando
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Atualizações automáticas que fazem seu negócio atrair olhares — e vendas.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-lg">
                    {posts.length} Posts
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-semibold shadow-lg">
                    {faqs.length} FAQs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {showSettings && (
          <div className="mb-6 p-6 bg-white rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Dados do Negócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do Negócio"
                value={businessData.name}
                onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200"
              />
              <input
                type="text"
                placeholder="Endereço"
                value={businessData.address}
                onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200"
              />
              <input
                type="text"
                placeholder="Link Google Business"
                value={businessData.gbpLink}
                onChange={(e) => setBusinessData(prev => ({ ...prev, gbpLink: e.target.value }))}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200"
              />
              <input
                type="text"
                placeholder="WhatsApp"
                value={businessData.whatsapp}
                onChange={(e) => setBusinessData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200"
              />
              <input
                type="email"
                placeholder="Email"
                value={businessData.email}
                onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200 md:col-span-2"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 p-2 bg-white rounded-2xl shadow-lg md:hidden">
          {[
            { id: 'posts', icon: Sparkles, label: 'Posts' },
            { id: 'faqs', icon: MessageSquare, label: 'FAQs' },
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'responses', icon: MessageSquare, label: 'Respostas' },
            { id: 'knowledge', icon: Book, label: 'Conhecimento' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs md:text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-4 md:p-6">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Criar Postagem com IA</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(postTypes).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentPost(prev => ({ ...prev, type: key }))}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      currentPost.type === key ? type.color : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-sm">{type.label}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descreva sua {postTypes[currentPost.type].label.toLowerCase()}
                </label>
                <textarea
                  value={currentPost.userInput}
                  onChange={(e) => setCurrentPost(prev => ({ ...prev, userInput: e.target.value }))}
                  placeholder="Ex: Desconto de 30% em todos os produtos até sexta-feira, estoque limitado..."
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 resize-none"
                  rows="4"
                />
              </div>

              <button
                onClick={generateCopy}
                disabled={isGenerating || !currentPost.userInput.trim()}
                className="w-full p-4 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? 'Gerando Copy Mágica...' : 'Gerar Copy com IA'}
              </button>

              {currentPost.generatedCopy && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Edite sua Copy</h3>
                      <button
                        onClick={() => copyToClipboard(currentPost.generatedCopy)}
                        className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Copiar</span>
                      </button>
                    </div>
                    <textarea
                      value={currentPost.generatedCopy}
                      onChange={(e) => setCurrentPost(prev => ({ ...prev, generatedCopy: e.target.value }))}
                      className="w-full p-4 rounded-xl bg-white border border-blue-200 text-gray-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="12"
                      placeholder="Edite sua copy aqui..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {currentPost.generatedCopy.length} caracteres
                      </span>
                      <span className="text-xs text-gray-500">
                        💡 Dica: Edite à vontade para personalizar ainda mais!
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800">Adicionar Imagem</h3>
                    
                    <label className="block p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-all text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Upload de Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {currentPost.image && (
                      <div className="relative rounded-2xl overflow-hidden">
                        <img src={currentPost.image} alt="Preview" className="w-full h-64 object-cover" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={savePost}
                    className="w-full p-4 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all"
                  >
                    Salvar Post
                  </button>
                </div>
              )}

              {posts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Posts Salvos ({posts.length})</h3>
                  <div className="space-y-4">
                    {posts.slice(0, 5).map(post => (
                      <div key={post.id} className={`p-4 rounded-2xl border-2 ${postTypes[post.type].color}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{postTypes[post.type].icon}</span>
                            <span className="font-semibold text-sm">{postTypes[post.type].label}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(post.generatedCopy)}
                            className="p-2 rounded-lg bg-white hover:bg-gray-50"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{post.generatedCopy}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Perguntas Frequentes</h2>
                {editingFaqId && (
                  <button
                    onClick={cancelEditFaq}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      {editingFaqId ? 'Editar FAQ' : 'Criar Nova FAQ'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Digite a pergunta do cliente e a IA gerará uma resposta profissional para seu GBP
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pergunta do Cliente
                    </label>
                    <input
                      type="text"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      placeholder="Ex: Vocês fazem entregas?"
                      className="w-full p-3 rounded-xl bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={generateFaqAnswer}
                    disabled={isGeneratingFaq || !newFaqQuestion.trim()}
                    className="w-full p-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isGeneratingFaq ? 'Gerando Resposta...' : 'Gerar Resposta com IA'}
                  </button>

                  {newFaqAnswer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resposta Gerada (Editável)
                      </label>
                      <textarea
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white border border-indigo-200 resize-none focus:ring-2 focus:ring-indigo-500"
                        rows="4"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {newFaqAnswer.length} caracteres
                        </span>
                        <button
                          onClick={() => copyToClipboard(newFaqAnswer)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                      </div>

                      <button
                        onClick={saveFaq}
                        className="w-full mt-3 p-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all"
                      >
                        {editingFaqId ? 'Atualizar FAQ' : 'Salvar FAQ'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {faqs.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Suas FAQs Salvas ({faqs.length})
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-5 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">❓</span>
                              <p className="font-semibold text-gray-800">{faq.question}</p>
                            </div>
                            <div className="flex items-start gap-2 ml-7">
                              <span className="text-xl">💬</span>
                              <p className="text-sm text-gray-600">{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => copyToClipboard(`P: ${faq.question}\n\nR: ${faq.answer}`)}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all"
                              title="Copiar"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => editFaq(faq)}
                              className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all"
                              title="Editar"
                            >
                              <Settings className="w-4 h-4 text-amber-600" />
                            </button>
                            <button
                              onClick={() => deleteFaq(faq.id)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all"
                              title="Excluir"
                            >
                              <span className="text-red-600 font-bold">×</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                          {new Date(faq.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(faq.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {faqs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma FAQ salva ainda. Crie sua primeira!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Competitivo</h2>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <Star className="w-8 h-8 text-blue-600" />
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                      Seu Negócio
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">4.7 ⭐</div>
                  <div className="text-sm text-gray-600">Avaliação Média</div>
                  <div className="text-xs text-gray-500 mt-2">156 avaliações</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8 text-green-600" />
                    <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">
                      #3 de 12
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">Top 25%</div>
                  <div className="text-sm text-gray-600">Ranking Local</div>
                  <div className="text-xs text-green-600 mt-2 font-semibold">↑ +2 posições</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-semibold">
                      85%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">1.2K</div>
                  <div className="text-sm text-gray-600">Visualizações/Mês</div>
                  <div className="text-xs text-purple-600 mt-2 font-semibold">↑ +18% vs mês anterior</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <Sparkles className="w-8 h-8 text-orange-600" />
                    <span className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full font-semibold">
                      Ativo
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">23</div>
                  <div className="text-sm text-gray-600">Posts este Mês</div>
                  <div className="text-xs text-orange-600 mt-2 font-semibold">↑ Meta: 30 posts</div>
                </div>
              </div>

              {/* Radius Selector */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Análise de Concorrentes</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                      1 km
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
                      3 km
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
                      5 km
                    </button>
                  </div>
                </div>
              </div>

              {/* Competitors List */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Top Concorrentes no Raio de 1km
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {/* Your Business */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-lg">
                          3
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                            <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                            <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800">{businessData.name || 'Seu Negócio'}</h4>
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                              VOCÊ
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{businessData.address || 'Endereço não informado'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-800">4.7</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-500">156 avaliações</p>
                        <p className="text-xs text-green-600 font-semibold mt-1">23 posts/mês</p>
                      </div>
                    </div>
                  </div>

                  {/* Competitor 1 */}
                  <div className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 text-white rounded-full font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          👑
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Café Premium Center</h4>
                          <p className="text-sm text-gray-600">R. das Flores, 123</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-800">4.9</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-500">342 avaliações</p>
                        <p className="text-xs text-orange-600 font-semibold mt-1">45 posts/mês</p>
                      </div>
                    </div>
                  </div>

                  {/* Competitor 2 */}
                  <div className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-400 text-white rounded-full font-bold text-lg shadow-lg">
                          2
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          🥈
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Padaria Estrela</h4>
                          <p className="text-sm text-gray-600">Av. Principal, 456</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-800">4.8</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-500">289 avaliações</p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">38 posts/mês</p>
                      </div>
                    </div>
                  </div>

                  {/* Competitor 4 */}
                  <div className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-700 rounded-full font-bold text-lg">
                          4
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          🍕
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Pizzaria Don Luigi</h4>
                          <p className="text-sm text-gray-600">R. Itália, 789</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-800">4.6</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-500">198 avaliações</p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">15 posts/mês</p>
                      </div>
                    </div>
                  </div>

                  {/* Competitor 5 */}
                  <div className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-700 rounded-full font-bold text-lg">
                          5
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          🍰
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Confeitaria Doce Mel</h4>
                          <p className="text-sm text-gray-600">R. das Acácias, 321</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-800">4.5</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-500">127 avaliações</p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">12 posts/mês</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Avaliação acima da média da região (4.7 vs 4.6)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Frequência de posts consistente (23/mês)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Taxa de resposta rápida (menos de 1 hora)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Oportunidades
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">→</span>
                      <span>Aumente posts para 30/mês (líder faz 45)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">→</span>
                      <span>Adicione mais fotos (média: 5 fotos/post)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">→</span>
                      <span>Incentive mais avaliações (+100 para #2)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xl mb-2">🚀 Quer Dados Reais?</h4>
                    <p className="text-blue-100 text-sm">
                      Conecte a API do Google Places e veja comparações reais com seus concorrentes em tempo real!
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap">
                    Configurar API
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Respostas com IA</h2>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-3">Responder Avaliação</h3>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Cole aqui a avaliação do cliente..."
                  className="w-full p-3 rounded-xl bg-white border border-gray-200 mb-3"
                  rows="3"
                />
                <button
                  onClick={() => generateAIResponse(reviewInput, 'review')}
                  disabled={isGeneratingResponse || !reviewInput.trim()}
                  className="w-full p-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingResponse ? 'Gerando...' : 'Gerar Resposta'}
                </button>
                {reviewResponse && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-gray-700">Resposta Sugerida:</span>
                      <button onClick={() => copyToClipboard(reviewResponse)} className="text-blue-600">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700">{reviewResponse}</p>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-200">
                <h3 className="font-bold text-gray-800 mb-3">Responder Pergunta</h3>
                <textarea
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Cole aqui a pergunta do cliente..."
                  className="w-full p-3 rounded-xl bg-white border border-gray-200 mb-3"
                  rows="3"
                />
                <button
                  onClick={() => generateAIResponse(questionInput, 'question')}
                  disabled={isGeneratingResponse || !questionInput.trim()}
                  className="w-full p-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {isGeneratingResponse ? 'Gerando...' : 'Gerar Resposta'}
                </button>
                {questionResponse && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-gray-700">Resposta Sugerida:</span>
                      <button onClick={() => copyToClipboard(questionResponse)} className="text-green-600">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700">{questionResponse}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Central de Conhecimento</h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <Book className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-800">Consultor de Negócios IA</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Tire dúvidas sobre marketing, vendas, varejo e legislação com IA especializada.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-100 ml-12'
                        : 'bg-gray-100 mr-12'
                    }`}
                  >
                    <p className="text-sm text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Faça sua pergunta sobre negócios..."
                  className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim()}
                  className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                    <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                    <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">ZMaps</h3>
                  <p className="text-xs text-gray-600">Perfil brilhando, cliente chegando</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <a 
                  href="https://wa.me/5511957055256" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">WhatsApp</span>
                </a>
                
                <a 
                  href="mailto:zapy@zapy.click"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <span>📧</span>
                  <span className="font-medium">zapy@zapy.click</span>
                </a>
                
                <a 
                  href="https://www.zapy.click" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <span>🌐</span>
                  <span className="font-medium">zapy.click</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© 2024 ZMaps. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-blue-600 transition-all"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => setShowTermsModal(true)}
                className="hover:text-blue-600 transition-all"
              >
                Termos de Uso
              </button>
              <button 
                onClick={() => setShowCookieConsent(true)}
                className="hover:text-blue-600 transition-all"
              >
                Cookies
              </button>
            </div>
          </div>
        </footer>

        {/* Cookie Consent Banner */}
        {showCookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm">
                  🍪 Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="underline hover:text-blue-400"
                  >
                    Política de Privacidade
                  </button>
                  .
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={acceptCookies}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => setShowCookieConsent(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
                >
                  Recusar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowPrivacyModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Política de Privacidade</h3>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-700">
                <p><strong>Última atualização:</strong> Novembro de 2024</p>
                
                <h4 className="font-bold text-lg text-gray-800 mt-6">1. Informações que Coletamos</h4>
                <p>O ZMaps coleta informações que você fornece diretamente, incluindo:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email e senha para autenticação</li>
                  <li>Dados do seu negócio (nome, endereço, contatos)</li>
                  <li>Conteúdo criado (posts, FAQs, imagens)</li>
                </ul>

                <h4 className="font-bold text-lg text-gray-800 mt-6">2. Como Usamos suas Informações</h4>
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Gerar conteúdo personalizado com IA</li>
                  <li>Salvar suas preferências localmente no navegador</li>
                  <li>Comunicar atualizações e suporte</li>
                </ul>

                <h4 className="font-bold text-lg text-gray-800 mt-6">3. Armazenamento de Dados</h4>
                <p>
                  Atualmente, todos os dados são armazenados localmente no seu navegador através do localStorage. 
                  Não enviamos suas informações para servidores externos, exceto quando você utiliza recursos de IA 
                  que requerem processamento em nuvem.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">4. Compartilhamento de Dados</h4>
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. 
                  Podemos compartilhar dados apenas quando exigido por lei.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">5. Seus Direitos</h4>
                <p>Você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Acessar seus dados pessoais</li>
                  <li>Solicitar correção de dados incorretos</li>
                  <li>Solicitar exclusão de seus dados</li>
                  <li>Exportar seus dados</li>
                </ul>

                <h4 className="font-bold text-lg text-gray-800 mt-6">6. Contato</h4>
                <p>
                  Para questões sobre privacidade, entre em contato:<br/>
                  Email: zapy@zapy.click<br/>
                  WhatsApp: +55 (11) 95705-5256
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Use Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowTermsModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Termos de Uso</h3>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-700">
                <p><strong>Última atualização:</strong> Novembro de 2024</p>
                
                <h4 className="font-bold text-lg text-gray-800 mt-6">1. Aceitação dos Termos</h4>
                <p>
                  Ao acessar e usar o ZMaps, você concorda em cumprir estes Termos de Uso. 
                  Se você não concordar com qualquer parte destes termos, não utilize o serviço.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">2. Descrição do Serviço</h4>
                <p>
                  O ZMaps é uma plataforma de gerenciamento de conteúdo para Google Business Profile que oferece:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Criação de posts com auxílio de IA</li>
                  <li>Gerenciamento de perguntas frequentes</li>
                  <li>Edição de imagens</li>
                  <li>Respostas automáticas para avaliações</li>
                </ul>

                <h4 className="font-bold text-lg text-gray-800 mt-6">3. Conta de Usuário</h4>
                <p>
                  Você é responsável por manter a confidencialidade de sua conta e senha. 
                  Você concorda em aceitar a responsabilidade por todas as atividades que ocorram em sua conta.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">4. Uso Aceitável</h4>
                <p>Você concorda em NÃO:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Usar o serviço para fins ilegais ou não autorizados</li>
                  <li>Violar leis de propriedade intelectual</li>
                  <li>Transmitir vírus ou código malicioso</li>
                  <li>Fazer engenharia reversa do software</li>
                  <li>Criar conteúdo enganoso ou fraudulento</li>
                </ul>

                <h4 className="font-bold text-lg text-gray-800 mt-6">5. Conteúdo Gerado</h4>
                <p>
                  O conteúdo gerado pela IA é fornecido "como está". Você é responsável por revisar 
                  e aprovar todo conteúdo antes de publicá-lo. O ZMaps não se responsabiliza por 
                  consequências do uso inadequado do conteúdo gerado.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">6. Limitação de Responsabilidade</h4>
                <p>
                  O ZMaps não será responsável por quaisquer danos diretos, indiretos, incidentais, 
                  especiais ou consequenciais resultantes do uso ou impossibilidade de uso do serviço.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">7. Modificações</h4>
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento. 
                  Continuando a usar o serviço após mudanças, você aceita os novos termos.
                </p>

                <h4 className="font-bold text-lg text-gray-800 mt-6">8. Contato</h4>
                <p>
                  Para dúvidas sobre estes termos:<br/>
                  Email: zapy@zapy.click<br/>
                  WhatsApp: +55 (11) 95705-5256<br/>
                  Site: www.zapy.click
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Preview Google Business Profile
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* GBP Post Preview */}
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  {/* Business Header */}
                  <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                        <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="white" fillOpacity="0.7"/>
                        <circle cx="12" cy="12" r="2" fill="#FBBF24"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{businessData.name || 'Seu Negócio'}</h4>
                      <p className="text-xs text-gray-500">
                        {postTypes[currentPost.type].label} • Agora
                      </p>
                    </div>
                    <div className="text-2xl">{postTypes[currentPost.type].icon}</div>
                  </div>

                  {/* Post Image */}
                  {currentPost.image && (
                    <div className="relative w-full bg-gray-100">
                      <img 
                        src={currentPost.image} 
                        alt="Preview" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-2 right-2 px-3 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full font-semibold">
                        {postTypes[currentPost.type].label}
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    <div className="text-gray-800 text-sm whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">
                      {currentPost.generatedCopy || 'Sua copy aparecerá aqui...'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all">
                        Saiba mais
                      </button>
                      <button className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all">
                        Ligar agora
                      </button>
                    </div>
                  </div>

                  {/* Engagement Bar */}
                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-around text-gray-600 bg-gray-50">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-all">
                      <span className="text-lg">👍</span>
                      <span className="text-xs font-medium">Curtir</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-all">
                      <span className="text-lg">💬</span>
                      <span className="text-xs font-medium">Comentar</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-all">
                      <span className="text-lg">🔗</span>
                      <span className="text-xs font-medium">Compartilhar</span>
                    </button>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Dica:</strong> Este é um preview aproximado de como seu post aparecerá no Google Business Profile. 
                    A aparência pode variar ligeiramente dependendo do dispositivo.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      copyToClipboard(currentPost.generatedCopy);
                      setShowPreview(false);
                    }}
                    className="flex-1 p-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                  >
                    Copiar e Fechar
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZMapsApp;