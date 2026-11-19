import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Annonce } from '../../models/annonce';
import { Cours } from '../../models/cours';
import { Reservation } from '../../models/reservation';
import { Salle } from '../../models/salle';
import { AnnonceApi } from '../../services/annonce-api';
import { AuthService } from '../../services/auth';
import { CoursApi } from '../../services/cours-api';
import { ReservationApi } from '../../services/reservation-api';
import { SalleApi } from '../../services/salle-api';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, NgStyle],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private annonceApi = inject(AnnonceApi);
  private coursApi = inject(CoursApi);
  private salleApi = inject(SalleApi);
  private reservationApi = inject(ReservationApi);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  annonces: Annonce[] = [];
  cours: Cours[] = [];
  salles: Salle[] = [];
  reservations: Reservation[] = [];
  message = '';
  typeMessage = '';
  niveaux = ['L1', 'L2', 'L3'];

  // Charger toutes les données utiles au tableau de bord
  constructor() {
    if (this.estAdmin) {
      this.chargerDonnees();
    }
  }

  // Réserver le tableau de bord à l'administrateur
  get estAdmin(): boolean {
    return this.auth.aRole('administrateur');
  }

  // Statistiques simples
  get totalAnnonces(): number {
    return this.annonces.length;
  }

  get totalCours(): number {
    return this.cours.length;
  }

  get totalSalles(): number {
    return this.salles.length;
  }

  get totalReservations(): number {
    return this.reservations.length;
  }

  // Nombre maximal de réservations pour une salle
  get maxReservationsParSalle(): number {
    let maximum = 1;
    for (const salle of this.salles) {
      maximum = Math.max(maximum, this.compterReservations(salle.id));
    }
    return maximum;
  }

  // Nombre maximal de cours pour un niveau
  get maxCoursParNiveau(): number {
    let maximum = 1;
    for (const niveau of this.niveaux) {
      maximum = Math.max(maximum, this.compterNiveau(niveau));
    }
    return maximum;
  }

  // Charger les annonces, cours, salles et réservations
  chargerDonnees(): void {
    this.annonceApi.getAnnonces().subscribe({
      next: (donnees: Annonce[]) => { this.annonces = donnees; this.cdr.markForCheck(); },
      error: () => { this.afficherErreur(); }
    });

    this.coursApi.getCours().subscribe({
      next: (donnees: Cours[]) => { this.cours = donnees; this.cdr.markForCheck(); },
      error: () => { this.afficherErreur(); }
    });

    this.salleApi.getSalles().subscribe({
      next: (donnees: Salle[]) => { this.salles = donnees; this.cdr.markForCheck(); },
      error: () => { this.afficherErreur(); }
    });

    this.reservationApi.getReservations().subscribe({
      next: (donnees: Reservation[]) => { this.reservations = donnees; this.cdr.markForCheck(); },
      error: () => { this.afficherErreur(); }
    });
  }

  // Afficher un message d'erreur si json-server est arrêté
  afficherErreur(): void {
    this.typeMessage = 'error';
    this.message = 'Impossible de charger les statistiques. Lancez json-server.';
    this.cdr.markForCheck();
  }

  // Compter les réservations d'une salle
  compterReservations(salleId: number): number {
    return this.reservations.filter((reservation: Reservation) => reservation.salleId === salleId).length;
  }

  // Largeur de la barre d'une salle en pourcentage
  pourcentageSalle(salleId: number): number {
    return (this.compterReservations(salleId) / this.maxReservationsParSalle) * 100;
  }

  // Compter les cours d'un niveau
  compterNiveau(niveau: string): number {
    return this.cours.filter((cours: Cours) => cours.niveau === niveau).length;
  }

  // Largeur de la barre d'un niveau en pourcentage
  pourcentageNiveau(niveau: string): number {
    return (this.compterNiveau(niveau) / this.maxCoursParNiveau) * 100;
  }

  // Choisir la couleur de la barre selon l'utilisation
  classeBarre(valeur: number): string {
    if (valeur >= 4) {
      return 'barre-haute';
    }
    if (valeur >= 2) {
      return 'barre-moyenne';
    }
    return 'barre-faible';
  }
}
