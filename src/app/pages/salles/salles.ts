import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reservation } from '../../models/reservation';
import { Salle } from '../../models/salle';
import { AuthService } from '../../services/auth';
import { ReservationApi } from '../../services/reservation-api';
import { SalleApi } from '../../services/salle-api';

@Component({
  selector: 'app-salles',
  imports: [ReactiveFormsModule, NgClass],
  styleUrl: './salles.css',
  templateUrl: './salles.html',
})
export class Salles {
  private salleApi = inject(SalleApi);
  private reservationApi = inject(ReservationApi);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  salles: Salle[] = [];
  reservations: Reservation[] = [];
  message = '';
  typeMessage = '';

  // Formulaire réactif de réservation
  form = this.fb.nonNullable.group({
    salleId: [0, [Validators.required, Validators.min(1)]],
    titre: ['', [Validators.required]],
    date: ['', [Validators.required]],
    heureDebut: ['', [Validators.required]],
    heureFin: ['', [Validators.required]]
  });

  // Charger les salles et les réservations au démarrage
  constructor() {
    this.chargerSalles();
    this.chargerReservations();
  }

  // Récupérer l'utilisateur connecté
  get utilisateur() {
    return this.auth.utilisateur();
  }

  // Autoriser la réservation aux enseignants et aux administrateurs
  get peutReserver(): boolean {
    const role = this.utilisateur?.role;
    return role === 'enseignant' || role === 'administrateur';
  }

  // Date du jour (une réservation passée n'est pas autorisée)
  get aujourdhui(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Charger les salles depuis json-server
  chargerSalles(): void {
    this.salleApi.getSalles().subscribe({
      next: (donnees: Salle[]) => {
        this.salles = donnees;
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de charger les salles. Lancez json-server.';
        this.cdr.markForCheck();
      }
    });
  }

  // Charger les réservations depuis json-server
  chargerReservations(): void {
    this.reservationApi.getReservations().subscribe({
      next: (donnees: Reservation[]) => {
        this.reservations = donnees;
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de charger les réservations. Lancez json-server.';
        this.cdr.markForCheck();
      }
    });
  }

  // Retrouver le nom d'une salle à partir de son identifiant
  getNomSalle(id: number): string {
    return this.salles.find((salle: Salle) => salle.id === id)?.nom ?? 'Salle inconnue';
  }

  // Colorer le type de salle
  classeType(type: string): string {
    if (type === 'Cours') {
      return 'badge-examen';
    }
    if (type === 'Laboratoire') {
      return 'badge-evenement';
    }
    return 'badge-administratif';
  }

  // Autoriser la suppression à l'administrateur ou au créateur de la réservation
  peutSupprimer(reservation: Reservation): boolean {
    return this.auth.aRole('administrateur') || reservation.reservePar === this.utilisateur?.nom;
  }

  // Vérifier les horaires et les conflits avant d'enregistrer
  reserver(): void {
    this.message = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.typeMessage = 'error';
      this.message = 'Veuillez remplir tous les champs du formulaire.';
      return;
    }

    const valeurs = this.form.getRawValue();
    const salleId = Number(valeurs.salleId);

    if (valeurs.heureFin <= valeurs.heureDebut) {
      this.typeMessage = 'error';
      this.message = "L'heure de fin doit être après l'heure de début.";
      return;
    }

    if (valeurs.date < this.aujourdhui) {
      this.typeMessage = 'error';
      this.message = 'La date de réservation ne peut pas être dans le passé.';
      return;
    }

    const conflit = this.reservations.find((reservation: Reservation) =>
      reservation.salleId === salleId &&
      reservation.date === valeurs.date &&
      valeurs.heureDebut < reservation.heureFin &&
      valeurs.heureFin > reservation.heureDebut
    );

    if (conflit) {
      this.typeMessage = 'error';
      this.message = 'Cette salle est déjà réservée sur ce créneau.';
      return;
    }

    const nouvelleReservation: Omit<Reservation, 'id'> = {
      salleId: salleId,
      titre: valeurs.titre,
      reservePar: this.utilisateur?.nom ?? '',
      date: valeurs.date,
      heureDebut: valeurs.heureDebut,
      heureFin: valeurs.heureFin
    };

    this.reservationApi.addReservation(nouvelleReservation).subscribe({
      next: () => {
        this.typeMessage = 'success';
        this.message = 'Réservation enregistrée avec succès.';
        this.reinitialiserFormulaire();
        this.chargerReservations();
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible d’enregistrer la réservation.';
        this.cdr.markForCheck();
      }
    });
  }

  // Réinitialiser le formulaire de réservation
  reinitialiserFormulaire(): void {
    this.form.reset({
      salleId: 0,
      titre: '',
      date: '',
      heureDebut: '',
      heureFin: ''
    });
  }

  // Supprimer une réservation après confirmation
  supprimerReservation(reservation: Reservation): void {
    if (!confirm(`Voulez-vous vraiment supprimer la réservation « ${reservation.titre} » ?`)) {
      return;
    }

    this.reservationApi.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.typeMessage = 'success';
        this.message = 'Réservation supprimée avec succès.';
        this.chargerReservations();
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de supprimer la réservation.';
        this.cdr.markForCheck();
      }
    });
  }
}
