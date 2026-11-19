import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cours } from '../models/cours';

@Injectable({ providedIn: 'root' })
export class CoursApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/cours';

  // Récupérer tous les cours
  getCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.apiUrl);
  }

  // Ajouter un cours (l'id est généré par json-server)
  addCours(cours: Omit<Cours, 'id'>): Observable<Cours> {
    return this.http.post<Cours>(this.apiUrl, cours);
  }

  // Modifier un cours existant
  updateCours(cours: Cours): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/${cours.id}`, cours);
  }

  // Supprimer un cours
  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
