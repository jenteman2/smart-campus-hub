export interface User {
  id: number;
  nom: string;
  email: string;
  motDePasse: string;
  role: 'etudiant' | 'enseignant' | 'administrateur';
}
