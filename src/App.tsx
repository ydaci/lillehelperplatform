import React, { useState } from 'react';
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

// Types
type UserRole = 'Admin' | 'Teacher' | 'Learner' | null;
type Language = 'EN' | 'FR' | 'ES' | 'ZH';
type Page = 'Home' | 'Events' | 'Teachers' | 'Registration' | 'Login' | 'Dashboard';

// Mock data
const mockEvents = [
  { id: 1, title: 'Language Exchange meeting #1', date: 'Every Wednesday', location: 'Tir Na Nog', description: 'Practice French and foreign languages in a relaxed environment', type: 'Language' },
  { id: 2, title: 'Language Exchange meeting #2', date: 'Every Thursday', location: 'Ya s Bar', description: 'Practice French and foreign languages in a relaxed environment', type: 'Language' },
];

const mockTeachers = [
  { id: 1, name: 'Axel Bruni', subject: 'French As A Foreign Language', bio: 'Native French speaker with 5 years teaching experience', photo: '' },
  { id: 2, name: 'Luca Pecoriello', subject: 'Italian Language', bio: 'Italian native teacher from Torino', photo: '' },
  { id: 3, name: 'Shang Wenting', subject: 'Mandarin Chinese', bio: 'Chinese Native teacher with business background', photo: '' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('EN');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedRegType, setSelectedRegType] = useState<'Teach' | 'Learn' | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<typeof mockTeachers[0] | null>(null);

  // Header Component
  const Header = () => (
    <header className="border-b border-border bg-white px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
  <img
    src={LingoLilleLogo}
    alt="LingoLille"
    className="h-8 w-8 rounded-full object-cover"
  />
  <h1 className="text-xl font-medium">LingoLille</h1>
</div>
        
        
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" onClick={() => setCurrentPage('Home')}>Home</Button>
          <Button variant="ghost" onClick={() => setCurrentPage('Events')}>Events</Button>
          <Button variant="ghost" onClick={() => setCurrentPage('Teachers')}>Teachers</Button>
          <Button variant="ghost" disabled onClick={() => setCurrentPage('Registration')}>Register</Button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {(['EN', 'FR', 'ES', 'ZH'] as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={currentLanguage === lang ? "default" : "outline"}
                disabled
                size="sm"
                onClick={() => setCurrentLanguage(lang)}
                className="px-2 py-1 text-sm"
              >
                {lang}
              </Button>
            ))}
          </div>
          <Button disabled variant="outline" onClick={() => setCurrentPage('Login')}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </div>
      </div>
    </header>
  );

  // Home Page
  const HomePage = () => (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-secondary/20 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-medium text-foreground">
            Connect, Learn, Grow in Lille
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your platform for language exchange, cultural events, and building connections as an international in Lille.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" onClick={() => setCurrentPage('Events')}>
              <Calendar className="h-5 w-5 mr-2" />
              Discover Events
            </Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentPage('Teachers')}>
              <Users className="h-5 w-5 mr-2" />
              Find Teachers
            </Button>
            <Button size="lg" variant="outline" disabled onClick={() => setCurrentPage('Registration')}>
              <UserPlus className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Preview Cards */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-medium text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Events & Meetups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Join cultural events, language exchanges, and networking opportunities.</p>
              </CardContent>
                <img
    src={qrcode}
    alt="QrCode"
    className="h-32 w-32 rounded-xl object-cover"
  />
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Language Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Connect with qualified teachers for personalized language lessons.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Build lasting connections with fellow internationals and locals.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );

  // Events Page
  const EventsPage = () => (
    <div className="space-y-6 pb-12">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-medium">Upcoming Events</h1>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Propose Event
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="secondary">{event.type}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
                  <Button className="w-full mt-4">Join Event</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Teachers Page
  const TeachersPage = () => (
    <div className="space-y-6 pb-12">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-medium mb-8">Find a Teacher</h1>
          
          {/* Filter */}
          <div className="flex items-center space-x-4 mb-8">
            <Filter className="h-4 w-4" />
            <Select>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="french" >French Language</SelectItem>
                <SelectItem value="spanish">Spanish Language</SelectItem>
                <SelectItem value="chinese">Mandarin Chinese</SelectItem>
                <SelectItem value="english">English Language</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Teachers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <img
                    src={teacher.photo}
                    alt={teacher.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle>{teacher.name}</CardTitle>
                  <Badge variant="outline">{teacher.subject}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center mb-4">{teacher.bio}</p>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setShowContactForm(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Contact {selectedTeacher.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">Your Name</label>
                <Input placeholder="Enter your name" />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block mb-2">Message</label>
                <Textarea placeholder="Write your message..." />
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">Send Message</Button>
                <Button variant="outline" onClick={() => setShowContactForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // Registration Page
  const RegistrationPage = () => (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-medium mb-4">Join Our Community</h1>
          <p className="text-muted-foreground">Choose how you'd like to participate</p>
        </div>

        {!selectedRegType ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRegType('Teach')}>
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>I Want to Teach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Share your knowledge and help others learn your language</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRegType('Learn')}>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Connect with teachers and improve your language skills</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{selectedRegType === 'Teach' ? 'Teacher Registration' : 'Learner Registration'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRegType(null)}>← Back</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <Input placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
              {selectedRegType === 'Teach' ? (
                <>
                  <div>
                    <label className="block mb-2">Subject to Teach</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="chinese">Mandarin Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-2">Teaching Experience</label>
                    <Textarea placeholder="Describe your teaching experience..." />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-2">Target Language</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Language you want to learn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="chinese">Mandarin Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-2">Current Level</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button className="w-full">Complete Registration</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Login/Signup Page
  const LoginPage = () => (
    <div className="py-12 px-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login / Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">Choose Your Role</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block mb-2">Password</label>
              <Input type="password" placeholder="Enter your password" />
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => {
                  setUserRole('Teacher'); // Mock login
                  setCurrentPage('Dashboard');
                }}
              >
                Login
              </Button>
              <Button variant="outline" className="w-full">Create New Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard Page
  const DashboardPage = () => {
    const renderDashboard = () => {
      switch (userRole) {
        case 'Admin':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Admin Dashboard</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Manage Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">View and manage all platform users</p>
                    <Button>View Users</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Manage Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Approve and moderate events</p>
                    <Button>View Events</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Manage Teachers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Review teacher applications</p>
                    <Button>View Teachers</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        case 'Teacher':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Teacher Dashboard</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      My Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Update your profile and teaching info</p>
                    <Button>Edit Profile</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      My Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Manage your teaching events</p>
                    <Button>View Events</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">View student messages</p>
                    <Button>View Messages</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        case 'Learner':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Learner Dashboard</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      My Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Update your learning goals</p>
                    <Button>Edit Profile</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      My Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">View joined events</p>
                    <Button>View Events</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      My Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Manage teacher contacts</p>
                    <Button>View Contacts</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        default:
          return <div>Please log in to access your dashboard.</div>;
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
      case 'Registration': return <RegistrationPage />;
      case 'Login': return <LoginPage />;
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