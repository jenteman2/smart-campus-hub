# Campus Hub

Campus Hub est une mini-application web de campus pour l'ISET Kélibia, réalisée dans le cadre de l'atelier « Framework côté client ». Elle est développée avec Angular 22 (composants standalone) et utilise json-server comme API REST fictive.

## Fonctionnalités

### Étudiant

- Consulter les annonces, les cours, les salles et les réservations.
- Voir les dernières annonces sur la page d'accueil.
- Rechercher, filtrer et trier les annonces.

### Enseignant

- Toutes les fonctionnalités de l'étudiant.
- Ajouter, modifier et supprimer des annonces.
- Réserver une salle (avec détection des conflits de créneaux).
- Supprimer ses propres réservations.

### Administrateur

- Toutes les fonctionnalités de l'enseignant.
- Ajouter, modifier et supprimer des cours.
- Supprimer toutes les réservations.
- Consulter le tableau de bord (statistiques et barres CSS).

### Visiteur (non connecté)

- Page d'accueil, liste des cours et liste des salles/réservations.
- Un message l'invite à se connecter pour consulter les annonces.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| administrateur | admin@campus.tn | admin123 |
| enseignant | enseignant@campus.tn | ens123 |
| etudiant | etudiant@campus.tn | etu123 |

> Les mots de passe sont stockés en clair dans `db.json` : il s'agit uniquement d'une connexion simulée pour un projet de cours, sans sécurité réelle.

## Lancer le projet

Deux terminaux sont nécessaires à la racine du projet. Installer d'abord les dépendances :

```bash
npm install
```

**Terminal 1 — API json-server (port 3000)**

```bash
npm run api
```

**Terminal 2 — Application Angular (port 4200)**

```bash
npm start
```

Ouvrir ensuite [http://localhost:4200](http://localhost:4200). L'API est disponible sur [http://localhost:3000](http://localhost:3000) (par exemple `http://localhost:3000/annonces`).

Pour compiler le projet :

```bash
npm run build
```

## Structure du projet

```text
campus-hub/
├── db.json                     # Données de json-server (users, annonces, cours, salles, reservations)
├── src/
│   ├── styles.css              # Styles partagés (boutons, tableaux, messages, badges, responsive)
│   └── app/
│       ├── app.ts / app.html    # Composant racine : header, router-outlet, footer
│       ├── app.config.ts        # provideRouter + provideHttpClient
│       ├── app.routes.ts        # Toutes les routes de l'application
│       ├── models/              # Interfaces TypeScript (user, annonce, cours, salle, reservation)
│       ├── services/            # Accès HTTP (annonce-api, cours-api, salle-api, reservation-api, auth)
│       ├── layout/              # Composants header et footer
│       └── pages/               # login, accueil, annonces, cours, salles, dashboard
```

## Correspondance avec les TP

| Partie du projet | Concept illustré | TP |
| --- | --- | --- |
| Interpolations, `[property]`, `(event)`, `[(ngModel)]`, getters | Data binding et gestion de l'état du composant | TP5 |
| `@if`, `@for`, `@switch`, `routerLink`, `NgClass`, `NgStyle`, rôles | Directives de contrôle, navigation et styles dynamiques | TP6 |
| Formulaires template-driven (login, annonces) et réactifs (cours, salles) | Validation des formulaires, `markAllAsTouched()` | TP7 |
| Services `HttpClient`, Observables, `provideHttpClient()`, json-server | Communication HTTP avec une API REST | TP8 |
| CRUD complet, recherche, filtre et tri des annonces ; tableaux et cartes | Gestion de données côté client | TP9 |
| Tableau de bord administrateur | Statistiques simples avec barres CSS | Synthèse TP5–TP9 |
