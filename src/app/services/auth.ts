import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  // Utilisateur connecté (petit état d'interface avec un signal)
  utilisateur = signal<User | null>(null);

  // Restaurer l'utilisateur depuis le navigateur au démarrage
  constructor() {
    const donnees = localStorage.getItem('campusUser');
    if (donnees) {
      this.utilisateur.set(JSON.parse(donnees) as User);
    }
  }

  // Vérifier les identifiants dans json-server
  login(email: string, motDePasse: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}&motDePasse=${encodeURIComponent(motDePasse)}`);
  }

  // Enregistrer l'utilisateur connecté en mémoire et dans le navigateur
  setUtilisateur(user: User): void {
    this.utilisateur.set(user);
    localStorage.setItem('campusUser', JSON.stringify(user));
  }

  // Déconnecter l'utilisateur
  logout(): void {
    this.utilisateur.set(null);
    localStorage.removeItem('campusUser');
  }

  // Tester si un utilisateur est connecté
  estConnecte(): boolean {
    return this.utilisateur() !== null;
  }

  // Tester le rôle de l'utilisateur connecté
  aRole(role: User['role']): boolean {
    return this.utilisateur()?.role === role;
  }
}
