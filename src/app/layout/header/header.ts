import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgClass],
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Récupérer l'utilisateur connecté
  get utilisateur(): User | null {
    return this.auth.utilisateur();
  }

  // Récupérer le rôle de l'utilisateur connecté
  get role(): string {
    return this.utilisateur?.role ?? '';
  }

  // Choisir la couleur du badge selon le rôle
  get classeBadge(): string {
    if (this.role === 'administrateur') {
      return 'badge-admin';
    }
    if (this.role === 'enseignant') {
      return 'badge-enseignant';
    }
    return this.role === 'etudiant' ? 'badge-etudiant' : '';
  }

  // Déconnecter l'utilisateur et retourner à la connexion
  deconnecter(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
