import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Annonce } from '../../models/annonce';
import { User } from '../../models/user';
import { AnnonceApi } from '../../services/annonce-api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-accueil',
  imports: [RouterLink, NgClass],
  styleUrl: './accueil.css',
  templateUrl: './accueil.html',
})
export class Accueil {
  private annonceApi = inject(AnnonceApi);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  annonces: Annonce[] = [];
  message = '';
  typeMessage = '';

  // Charger les annonces pour la page d'accueil
  constructor() {
    this.chargerAnnonces();
  }

  // Récupérer l'utilisateur connecté
  get utilisateur(): User | null {
    return this.auth.utilisateur();
  }

  // Récupérer le rôle de l'utilisateur connecté
  get role(): string {
    return this.utilisateur?.role ?? '';
  }

  // Trier les annonces du plus récent au plus ancien et garder les 3 premières
  get dernieresAnnonces(): Annonce[] {
    return [...this.annonces]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }

  // Charger les annonces depuis json-server
  chargerAnnonces(): void {
    this.annonceApi.getAnnonces().subscribe({
      next: (donnees: Annonce[]) => {
        this.annonces = donnees;
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de charger les annonces. Lancez json-server.';
        this.cdr.markForCheck();
      }
    });
  }
}
