# UnivUp — Contexte projet

## Stack
- Next.js 16.2.4 (App Router, pas TypeScript)
- Supabase (auth + base de données)
- Tailwind CSS
- Déploiement prévu sur Vercel

## Structure des dossiers
```
univup/
  app/
    page.js                    → Page de connexion
    api/
      create-user/
        route.js               → Créer un user (service role key)
    admin/
      layout.js                → Layout admin
      sidebar.js               → Sidebar admin ('use client')
      page.js                  → Tableau de bord (stats à 0 pour l'instant)
      planning/page.js         → Planning global + création séances
      eleves/page.js           → Gestion élèves + abonnements + paiements
      profs/page.js            → Gestion profs
      salaires/page.js         → Salaires profs (bug affichage séances à régler)
    prof/
      layout.js
      sidebar.js
      page.js                  → Planning prof
      appel/page.js            → Feuille d'appel (présence + note + feedback)
      salaire/page.js          → Placeholder
      ressources/page.js       → Placeholder
    eleve/
      layout.js
      sidebar.js
      page.js                  → Planning élève
      resultats/page.js        → Résultats (notes + feedback + stats)
      biblio/page.js           → Placeholder
      gei/page.js              → Placeholder
      abonnement/page.js       → Abonnement + historique paiements
  lib/
    supabase.js
```

## Variables d'environnement (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://owtubcuiogcdgsbhmsfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Base de données Supabase (toutes les tables créées)
- users
- groupes
- groupe_eleves
- seances
- seance_eleves
- abonnements
- paiements_eleves
- bareme_profs
- salaires_profs

## Policies RLS activées (toutes en "true" pour l'instant)
- users : select, insert, update
- seances : select, insert, update
- seance_eleves : select, insert, update
- abonnements : select, insert, update
- paiements_eleves : select, insert
- bareme_profs : select, insert, update
- salaires_profs : select, insert

## Ce qui est fonctionnel ✅
- Connexion + redirection par rôle (admin/prof/eleve)
- Admin : créer/activer/désactiver élèves et profs
- Admin : créer séances avec sélection individuelle profs + élèves
- Admin : créer abonnements + enregistrer virements élèves
- Admin : activation accès automatique quand abonnement soldé
- Admin : page salaires profs (barème + versements) — bug affichage séances à régler
- Prof : voir son planning
- Prof : feuille d'appel (présence + note + feedback)
- Élève : planning
- Élève : résultats (notes + feedback + moyenne + taux présence)
- Élève : abonnement (solde + référence virement + historique)

## Bugs connus 🐛
- Admin salaires : les séances effectuées n'apparaissent pas dans le détail prof
  → Problème probable : filtre date_debut avec lte mal calculé
  → La séance est bien en statut "effectuee" en base (vérifié)
  → À déboguer au prochain démarrage

## Ce qui reste à construire
- [ ] Fix bug salaires profs
- [ ] Tableau de bord admin avec vraies stats
- [ ] Espace prof : mon salaire (vue prof)
- [ ] Ressources (Google Drive sync + viewer sécurisé)
- [ ] Module GEI (QCM annales + génération IA Claude)
- [ ] Chat (élève ↔ prof + chat général)
- [ ] Déploiement Vercel

## Modules futurs planifiés
- Sync Google Drive API (gratuit)
- Viewer PDF sécurisé (signed URLs + watermark)
- IA Claude API : fiches depuis PDF, flashcards, recommandations
- QCM GEI : annales + génération IA (maths, physique, proba, info)
- Profils élèves : fac_origine, dominante_centrale, ecoles_cibles, ecoles_gei

## Contexte UnivUp
- Prépa privée pour étudiants universitaires — Concours Centrale + Mines, X, ENSTA, ENSAE, ESTP
- 3 rôles : Admin (Yoyo), Professeurs, Élèves
- Groupes par dominante Centrale (Maths, Physique, Info, SI, Éco)
- Khôlles : 1-2 élèves individuels
- Cours collectifs : groupe entier, prof peut changer par séance
- Paiements élèves par virement bancaire (activation manuelle par admin)
- Salaires profs calculés automatiquement selon barème (khôlle/cours solo/cours groupe)
- Ressources depuis Google Drive (pas de téléchargement ni partage)