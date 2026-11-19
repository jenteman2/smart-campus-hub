import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Annonces } from './pages/annonces/annonces';
import { Cours } from './pages/cours/cours';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Salles } from './pages/salles/salles';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: 'accueil', component: Accueil },
  { path: 'login', component: Login },
  { path: 'annonces', component: Annonces },
  { path: 'cours', component: Cours },
  { path: 'salles', component: Salles },
  { path: 'dashboard', component: Dashboard },
  { path: '**', redirectTo: 'accueil' }
];
