import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Annonce } from '../../models/annonce';
import { AnnonceApi } from '../../services/annonce-api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-annonces',
  imports: [FormsModule, NgClass, RouterLink],
  styleUrl: './annonces.css',
  templateUrl: './annonces.html',
})
export class Annonces {
  private annonceApi = inject(AnnonceApi);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  annonces: Annonce[] = [];
  message = '';
  typeMessage = '';

  recherche = '';
  filtreCategorie = 'Toutes';
  triDate = 'desc';

  modeModification = false;
  idAnnonceModifiee = 0;
  titre = '';
  contenu = '';
  categorie = 'Examen';
  auteurFormulaire = '';
  dateFormulaire = '';

  // Charger les annonces et préparer le formulaire
  constructor() {
    this.reinitialiserFormulaire();
    this.chargerAnnonces();
  }

  // Récupérer l'utilisateur connecté
  get utilisateur() {
    return this.auth.utilisateur();
  }

  // Autoriser la gestion pour les enseignants et les administrateurs
  get peutGerer(): boolean {
    const role = this.utilisateur?.role;
    return role === 'enseignant' || role === 'administrateur';
  }

  // Date du jour pour une nouvelle annonce
  get aujourdhui(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Rechercher, filtrer et trier les annonces côté client
  get annoncesFiltrees(): Annonce[] {
    const recherche = this.recherche.trim().toLowerCase();
    const resultat = this.annonces.filter((annonce: Annonce) => {
      const correspond =
        recherche === '' ||
        annonce.titre.toLowerCase().includes(recherche) ||
        annonce.contenu.toLowerCase().includes(recherche);
      const categorieOk = this.filtreCategorie === 'Toutes' || annonce.categorie === this.filtreCategorie;
      return correspond && categorieOk;
    });

    return resultat.sort((a: Annonce, b: Annonce) =>
      this.triDate === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
  }

  // Nombre d'annonces affichées
  get nombreAnnonces(): number {
    return this.annoncesFiltrees.length;
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

  // Ajouter ou modifier une annonce selon le mode du formulaire
  enregistrerAnnonce(): void {
    if (this.modeModification) {
      const annonceModifiee: Annonce = {
        id: this.idAnnonceModifiee,
        titre: this.titre,
        contenu: this.contenu,
        categorie: this.categorie,
        auteur: this.auteurFormulaire,
        date: this.dateFormulaire
      };

      this.annonceApi.updateAnnonce(annonceModifiee).subscribe({
        next: () => {
          this.typeMessage = 'success';
          this.message = 'Annonce modifiée avec succès.';
          this.reinitialiserFormulaire();
          this.chargerAnnonces();
          this.cdr.markForCheck();
        },
        error: () => {
          this.typeMessage = 'error';
          this.message = 'Impossible de modifier l’annonce.';
          this.cdr.markForCheck();
        }
      });
    } else {
      const nouvelleAnnonce: Omit<Annonce, 'id'> = {
        titre: this.titre,
        contenu: this.contenu,
        categorie: this.categorie,
        auteur: this.auteurFormulaire,
        date: this.dateFormulaire
      };

      this.annonceApi.addAnnonce(nouvelleAnnonce).subscribe({
        next: () => {
          this.typeMessage = 'success';
          this.message = 'Annonce ajoutée avec succès.';
          this.reinitialiserFormulaire();
          this.chargerAnnonces();
          this.cdr.markForCheck();
        },
        error: () => {
          this.typeMessage = 'error';
          this.message = 'Impossible d’ajouter l’annonce.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  // Remplir le formulaire avec l'annonce à modifier
  preparerModification(annonce: Annonce): void {
    this.modeModification = true;
    this.idAnnonceModifiee = annonce.id;
    this.titre = annonce.titre;
    this.contenu = annonce.contenu;
    this.categorie = annonce.categorie;
    this.auteurFormulaire = annonce.auteur;
    this.dateFormulaire = annonce.date;
    this.message = '';
  }

  // Annuler la modification en cours
  annulerModification(): void {
    this.reinitialiserFormulaire();
  }

  // Remettre le formulaire à zéro
  reinitialiserFormulaire(): void {
    this.modeModification = false;
    this.idAnnonceModifiee = 0;
    this.titre = '';
    this.contenu = '';
    this.categorie = 'Examen';
    this.auteurFormulaire = this.utilisateur?.nom ?? '';
    this.dateFormulaire = this.aujourdhui;
  }

  // Supprimer une annonce après confirmation
  supprimerAnnonce(annonce: Annonce): void {
    if (!confirm(`Voulez-vous vraiment supprimer l'annonce « ${annonce.titre} » ?`)) {
      return;
    }

    this.annonceApi.deleteAnnonce(annonce.id).subscribe({
      next: () => {
        this.typeMessage = 'success';
        this.message = 'Annonce supprimée avec succès.';
        this.chargerAnnonces();
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de supprimer l’annonce.';
        this.cdr.markForCheck();
      }
    });
  }

  // Choisir la couleur du badge de catégorie
  classeCategorie(categorie: string): string {
    if (categorie === 'Examen') {
      return 'badge-examen';
    }
    if (categorie === 'Événement') {
      return 'badge-evenement';
    }
    return 'badge-administratif';
  }
}
