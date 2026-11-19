import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cours as CoursModel } from '../../models/cours';
import { AuthService } from '../../services/auth';
import { CoursApi } from '../../services/cours-api';

@Component({
  selector: 'app-cours',
  imports: [ReactiveFormsModule, FormsModule, NgClass, NgStyle],
  styleUrl: './cours.css',
  templateUrl: './cours.html',
})
export class Cours {
  private coursApi = inject(CoursApi);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  cours: CoursModel[] = [];
  message = '';
  typeMessage = '';
  recherche = '';
  filtreNiveau = 'Tous';
  modeModification = false;
  idCoursModifie = 0;

  // Formulaire réactif pour ajouter ou modifier un cours
  form = this.fb.nonNullable.group({
    intitule: ['', [Validators.required]],
    enseignant: ['', [Validators.required]],
    niveau: ['', [Validators.required]],
    credits: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Charger les cours au démarrage
  constructor() {
    this.chargerCours();
  }

  // Autoriser la gestion seulement à l'administrateur
  get estAdmin(): boolean {
    return this.auth.aRole('administrateur');
  }

  // Rechercher par intitulé et filtrer par niveau
  get coursFiltres(): CoursModel[] {
    const recherche = this.recherche.trim().toLowerCase();
    return this.cours.filter((cours: CoursModel) => {
      const correspond = recherche === '' || cours.intitule.toLowerCase().includes(recherche);
      const niveauOk = this.filtreNiveau === 'Tous' || cours.niveau === this.filtreNiveau;
      return correspond && niveauOk;
    });
  }

  // Charger les cours depuis json-server
  chargerCours(): void {
    this.coursApi.getCours().subscribe({
      next: (donnees: CoursModel[]) => {
        this.cours = donnees;
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de charger les cours. Lancez json-server.';
        this.cdr.markForCheck();
      }
    });
  }

  // Ajouter ou modifier un cours
  enregistrerCours(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeurs = this.form.getRawValue();

    if (this.modeModification) {
      const coursModifie: CoursModel = { id: this.idCoursModifie, ...valeurs };
      this.coursApi.updateCours(coursModifie).subscribe({
        next: () => {
          this.typeMessage = 'success';
          this.message = 'Cours modifié avec succès.';
          this.reinitialiserFormulaire();
          this.chargerCours();
          this.cdr.markForCheck();
        },
        error: () => {
          this.typeMessage = 'error';
          this.message = 'Impossible de modifier le cours.';
          this.cdr.markForCheck();
        }
      });
    } else {
      const nouveauCours: Omit<CoursModel, 'id'> = valeurs;
      this.coursApi.addCours(nouveauCours).subscribe({
        next: () => {
          this.typeMessage = 'success';
          this.message = 'Cours ajouté avec succès.';
          this.reinitialiserFormulaire();
          this.chargerCours();
          this.cdr.markForCheck();
        },
        error: () => {
          this.typeMessage = 'error';
          this.message = 'Impossible d’ajouter le cours.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  // Remplir le formulaire avec le cours à modifier
  preparerModification(cours: CoursModel): void {
    this.modeModification = true;
    this.idCoursModifie = cours.id;
    this.form.patchValue(cours);
    this.message = '';
  }

  // Annuler la modification en cours
  annulerModification(): void {
    this.reinitialiserFormulaire();
  }

  // Réinitialiser le formulaire réactif
  reinitialiserFormulaire(): void {
    this.modeModification = false;
    this.idCoursModifie = 0;
    this.form.reset({
      intitule: '',
      enseignant: '',
      niveau: '',
      credits: 1,
      description: ''
    });
  }

  // Supprimer un cours après confirmation
  supprimerCours(cours: CoursModel): void {
    if (!confirm(`Voulez-vous vraiment supprimer le cours « ${cours.intitule} » ?`)) {
      return;
    }

    this.coursApi.deleteCours(cours.id).subscribe({
      next: () => {
        this.typeMessage = 'success';
        this.message = 'Cours supprimé avec succès.';
        this.chargerCours();
        this.cdr.markForCheck();
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Impossible de supprimer le cours.';
        this.cdr.markForCheck();
      }
    });
  }
}
