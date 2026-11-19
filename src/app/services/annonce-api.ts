import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Annonce } from '../models/annonce';

@Injectable({ providedIn: 'root' })
export class AnnonceApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/annonces';

  // Récupérer toutes les annonces
  getAnnonces(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(this.apiUrl);
  }

  // Ajouter une annonce (l'id est généré par json-server)
  addAnnonce(annonce: Omit<Annonce, 'id'>): Observable<Annonce> {
    return this.http.post<Annonce>(this.apiUrl, annonce);
  }

  // Modifier une annonce existante
  updateAnnonce(annonce: Annonce): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.apiUrl}/${annonce.id}`, annonce);
  }

  // Supprimer une annonce
  deleteAnnonce(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
