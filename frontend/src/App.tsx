import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './theme.css';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import UXOptimizer from './components/UXOptimizer';
import QualityMonitor from './components/QualityMonitor';

import { ThemeManager } from './components/ThemeManager';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { TablesPage } from './pages/TablesPage';
import { CharactersPage } from './pages/CharactersPage';
import { CreateCharacterPage } from './pages/CreateCharacterPage';
import { CharacterSheetPage } from './pages/CharacterSheetPage';
import { CreationToolsPage } from './pages/CreationToolsPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { ItemsPage } from './pages/ItemsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { MonstersPage } from './pages/MonstersPage';
import { MonsterDetailPage } from './pages/MonsterDetailPage';
import { NpcsPage } from './pages/NpcsPage';
import { NpcDetailPage } from './pages/NpcDetailPage';
import { StoriesPage } from './pages/StoriesPage';
import { CreateStoryPage } from './pages/CreateStoryPage';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { InventoryPage } from './pages/InventoryPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { GameSessionPage } from './pages/GameSessionPage';
import { StorePage } from './pages/StorePage';
import { MissionsPage } from './pages/MissionsPage';

function AppContent() {
  return (
    <>
      <ThemeManager />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<EnhancedDashboard />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/new" element={<CreateCharacterPage />} />
          <Route path="/characters/:id" element={<CharacterSheetPage />} />
          <Route path="/tools" element={<CreationToolsPage />} />
          <Route path="/tools/items" element={<ItemsPage />} />
          <Route path="/tools/items/new" element={<CreateItemPage />} />
          <Route path="/tools/items/:id" element={<ItemDetailPage />} />
          <Route path="/tools/monsters" element={<MonstersPage />} />
          <Route path="/tools/monsters/:id" element={<MonsterDetailPage />} />
          <Route path="/tools/npcs" element={<NpcsPage />} />
          <Route path="/tools/npcs/:id" element={<NpcDetailPage />} />
          <Route path="/tools/stories" element={<StoriesPage />} />
          <Route path="/tools/stories/new" element={<CreateStoryPage />} />
          <Route path="/tools/stories/:id" element={<StoryDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/session/:tableId" element={<GameSessionPage />} />
          {/* Todas as futuras rotas protegidas irão aqui dentro */}
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ToastProvider>
        <AuthProvider>
          <UXOptimizer>
             <QualityMonitor />
             <AppContent />
           </UXOptimizer>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App
