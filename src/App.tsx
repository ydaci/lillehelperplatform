import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Calendar, Users, BookOpen, MessageSquare, Settings, Plus, Filter, Search, Globe, LogIn, UserPlus } from 'lucide-react';
import LingoLilleLogo from './img/LingoLille.jpg';
import qrcode from './img/qrcode.png';
import instagram from './img/instagram.png';
import { login, register } from './mockAuth';
import "./i18n";
import { useTranslation } from "react-i18next";
import LoginPage from './components/LoginPage';

// Types
type UserRole = 'Admin' | 'Teacher' | 'Learner' | null;
type Language = 'EN' | 'FR' | 'ES' | 'ZH' | 'IT';
type Page = 'Home' | 'Events' | 'Teachers' | 'Registration' | 'Login' | 'Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'Login' | 'Home'>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedRegType, setSelectedRegType] = useState<'Teach' | 'Learn' | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null); // Type any pour mock
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('EN');
  const [isSignup, setIsSignup] = useState(false);
  const [currentUser, setCurrentUser] =  useState(null);



  // Récupérer l'utilisateur et le token depuis localStorage au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role || null);
      setCurrentPage('Home');
    }
  }, []);

   const handleLogin = (user: any) => {
    setCurrentUser(user);
    setUserRole(user.role || null);
    onLogin(data.user);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserRole(null);
    setCurrentPage('Home');
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang.toLowerCase());
  };

  //const mockTeachers = [
  //  { id: 1, name: t('teachers.1.name'), subject: t('teachers.1.subject'), bio: t('teachers.1.bio'), photo: '' },
  //  { id: 2, name: t('teachers.2.name'), subject: t('teachers.2.subject'), bio: t('teachers.2.bio'), photo: '' },
  //  { id: 3, name: t('teachers.3.name'), subject: t('teachers.3.subject'), bio: t('teachers.3.bio'), photo: '' },
  //];

  // Header Component
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const Header = () => (
    <header className="border-b border-border bg-white px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <img src={LingoLilleLogo} alt="LingoLille" className="h-8 w-8 rounded-full object-cover" />
          <h1 className="text-xl font-medium">LingoLille</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" onClick={() => setCurrentPage('Home')}>{t('buttons.home')}</Button>
          <Button variant="ghost" onClick={() => setCurrentPage('Events')}>{t('buttons.events')}</Button>
          <Button variant="ghost" onClick={() => setCurrentPage('Teachers')}>{t('buttons.teachers')}</Button>
          <Button variant="ghost" onClick={() => setCurrentPage('Registration')}>{t('buttons.register')}</Button>
        </nav>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {(['EN', 'FR', 'ES', 'ZH', 'IT'] as Language[]).map((lang) => (
              <Button key={lang} variant={currentLanguage === lang ? "default" : "outline"} size="sm" onClick={() => handleLanguageChange(lang)} className="px-2 py-1 text-sm">
                {lang}
              </Button>
            ))}
          </div>
          {currentUser ? (
  <div className="flex items-center space-x-3">
    <span className="font-medium">
      Welcome {currentUser.firstName || currentUser.FirstName} ! &nbsp; 
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        // Déconnexion
        localStorage.removeItem('user');
        setCurrentUser(null);
        setCurrentPage('Home'); // redirection vers Home
      }}
    >
      Logout
    </Button>
  </div>
) : (
  <Button
    variant="outline"
    onClick={() => setCurrentPage('Login')} // redirection vers login
  >
    <LogIn className="h-4 w-4 mr-2" />
    {t('buttons.login')}
  </Button>
)}
        </div>
      </div>
    </header>
  );

  // Home Page
  const HomePage = () => (
    <div className="space-y-12 pb-12">
      <section className="bg-secondary/20 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-medium text-foreground">{t('home_title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('home_description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" onClick={() => setCurrentPage('Events')}><Calendar className="h-5 w-5 mr-2" />{t('discover_events')}</Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentPage('Teachers')}><Users className="h-5 w-5 mr-2" />{t('find_teachers')}</Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentPage('Login')}><UserPlus className="h-5 w-5 mr-2" />{t('get_started')}</Button>
          </div>
        </div>
      </section>
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-medium text-center mb-8">{t('offer')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('events_section_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('events_section_subtitle')}</p>
              </CardContent>
              <p className="text-muted-foreground">WhatsApp</p>
              <img src={qrcode} alt="QrCode" className="h-32 w-32 rounded-xl object-cover" />
              <p className="text-muted-foreground">Instagram</p>
              <img src={instagram} alt="Insta" className="h-32 w-32 rounded-xl object-cover" />
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('learning_section_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('learning_section_subtitle')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('community_section_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('community_section_subtitle')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );

  

  // Events Page
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // --- Fonction stable pour récupérer les événements ---
  const fetchEvents = async (filter?: string) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/api/events`;
      if (filter) {
        url += `?dateFilter=${filter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      setEvents(data || []); // jamais undefined
    } catch (err) {
      console.error("Erreur lors du fetch :", err);
      setError("Impossible de charger les événements.");
      setEvents([]); // on vide la liste en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // --- Chargement initial ---
  useEffect(() => {
    fetchEvents();
  }, []);

  // --- Filtrage par date ---
  const handleDateFilter = (filter: string | undefined) => {
    setSelectedDateFilter(filter || "");
    fetchEvents(filter);
  };

  if (loading) {
    return <p className="text-center py-12">{t("loading") || "Loading..."}</p>;
  }

  if (error) {
    return <p className="text-center py-12 text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header + bouton de création */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-medium">{t("events_page_title")}</h1>
            <Button
              onClick={async () => {
                const title = prompt("Titre de l’événement :");
                if (!title) return;

                const eventDate = prompt("Date de l’événement (YYYY-MM-DD) :");
                if (!eventDate) return;

                const frequency = prompt("Fréquence de l’événement :");
                if (!frequency) return;

                const location = prompt("Lieu de l’événement :");
                if (!location) return;

                const description = prompt("Description :");
                if (!description) return;

                const type = prompt("Type (language, cultural, professional) :");

                try {
                  const response = await fetch(`${API_URL}/api/events`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, eventDate, frequency, location, description, type }),
                  });

                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                  const newEvent = await response.json();
                  setEvents((prev) => [...prev, newEvent]);
                  alert("Événement créé avec succès !");
                } catch (err) {
                  console.error(err);
                  alert("Erreur lors de la création de l’événement.");
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("events_page_propose")}
            </Button>
          </div>

          {/* 🔍 Filtre by Date */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select
                value={selectedDateFilter}
                onValueChange={(value) => handleDateFilter(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("placeholder_date")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t("filter_today")}</SelectItem>
                  <SelectItem value="week">{t("filter_week")}</SelectItem>
                  <SelectItem value="month">{t("filter_month")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste des événements */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="secondary">{event.type || t("filter_general")}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.eventDate}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
                  <Button className="w-full mt-3">{t("join_event")}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Teachers Page
const TeachersPage = ({ setSelectedTeacher, setShowContactForm }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/teachers`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les profs.');
    } finally {
      setLoading(false);
    }
  };

  fetchTeachers();
}, []);

  if (loading) return <p className="text-center py-12">{t('loading') || 'Loading...'}</p>;
  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher) => (
        <Card key={teacher.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <img
              src={teacher.Video || '/default-avatar.png'}
              alt={teacher.FirstName}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
            <CardTitle>{teacher.FirstName} {teacher.LastName}</CardTitle>
            <Badge variant="outline">{teacher.Email}</Badge>
            <Badge variant="outline">{teacher.Subject}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-4">{teacher.Description}</p>
            <Button
              className="w-full"
              onClick={() => {
                setSelectedTeacher(teacher);
                setShowContactForm(true);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('to_contact')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

  // Registration Page
const RegistrationPage = ({
  setCurrentPage,
  setSelectedRegType,
  currentUser
}) => {
  const { t } = useTranslation();

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-medium mb-4">{t('join_community.title')}</h1>
          <p className="text-muted-foreground">{t('join_community.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedRegType('Teacher');
              setCurrentPage('Login');
            }}
          >
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>{t('join_community.teach_button')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {t('join_community.teach_description')}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedRegType('Learner');
              setCurrentPage('Login');
            }}
          >
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>{t('join_community.learn_button')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {t('join_community.learn_description')}
              </p>
            </CardContent>
          </Card>
        </div>

        {currentUser && (
          <div className="text-right p-4">
            Welcome {currentUser.firstName}!
          </div>
        )}
      </div>
    </div>
  );
};


  // Login/Signup Page
// Login/Signup Page

//<LoginPage onLogin={setCurrentUser} />;
//{currentUser && <div>Welcome {currentUser.firstName}!</div>}


  // Dashboard Page
  const DashboardPage = () => {
    const renderDashboard = () => {
      switch (userRole) {
        case 'Admin':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">{t('dashboard.admin_dashboard')}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {t('dashboard.manage_users')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.view_and_manage_all_platform_users')}</p>
                    <Button>{t('dashboard.view_users')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {t('dashboard.manage_events')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.approve_and_moderate_events')}</p>
                    <Button>{t('dashboard.view_events')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {t('dashboard.manage_teachers')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.review_teacher_applications')}</p>
                    <Button>{t('dashboard.view_teachers')}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        case 'Teacher':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">{t('teacher_dashboard.title')}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      {t('teacher_dashboard.my_profile')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('teacher_dashboard.update_info')}</p>
                    <Button>{t('teacher_dashboard.edit_profile')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {t('teacher_dashboard.my_events')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('teacher_dashboard.manage_events')}</p>
                    <Button>{t('teacher_dashboard.view_events')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {t('teacher_dashboard.messages')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('teacher_dashboard.view_students_messages')}</p>
                    <Button>{t('teacher_dashboard.view_messages')}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        case 'Learner':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">{t('dashboard.learner_dashboard')}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      {t('dashboard.my_profile')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.update_your_learning_goals')}</p>
                    <Button>{t('dashboard.edit_profile')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {t('dashboard.my_events')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.view_joined_events')}</p>
                    <Button>{t('dashboard.view_events')}</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {t('dashboard.my_contacts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('dashboard.manage_teacher_contacts')}</p>
                    <Button>{t('dashboard.view_contacts')}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        default:
          return <div>{t('dashboard.please_log_in_to_access_your_dashboard')}</div>;
      }
    };

    return (
      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {renderDashboard()}
        </div>
      </div>
    );
  };

  // Main render function
  const renderPage = () => {
    switch (currentPage) {
      case 'Home': return <HomePage />;
      case 'Events': return <EventsPage />;
      case 'Teachers': return <TeachersPage />;
          case 'Registration':
      return (
        <RegistrationPage
          setCurrentPage={setCurrentPage}
          setSelectedRegType={setSelectedRegType}
          selectedRegType={selectedRegType}
          currentUser={currentUser}
        />
      );
    case 'Login':
      return (
        <LoginPage
          role={selectedRegType} // rôle prérempli Teach/Learn
          onLogin={(user) => {
            setCurrentUser(user);
            setCurrentPage('Home'); // redirection après login
          }}
        />
      );
      case 'Dashboard': return <DashboardPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}