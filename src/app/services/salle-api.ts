import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Salle } from '../models/salle';

@Injectable({ providedIn: 'root' })
export class SalleApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/salles';

  // Récupérer toutes les salles
  getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(this.apiUrl);
  }
}
