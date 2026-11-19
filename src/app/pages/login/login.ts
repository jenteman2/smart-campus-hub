import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgClass],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  motDePasse = '';
  message = '';
  typeMessage = '';

  // Connecter l'utilisateur avec les identifiants du formulaire
  connecter(f: NgForm): void {
    if (f.invalid) {
      return;
    }

    this.message = '';
    this.auth.login(this.email, this.motDePasse).subscribe({
      next: (resultat: User[]) => {
        if (resultat.length === 1) {
          this.auth.setUtilisateur(resultat[0]);
          this.router.navigate(['/accueil']);
        } else {
          this.typeMessage = 'error';
          this.message = 'Email ou mot de passe incorrect.';
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.typeMessage = 'error';
        this.message = 'Serveur indisponible. Lancez json-server.';
        this.cdr.markForCheck();
      }
    });
  }
}
