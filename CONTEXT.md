# UnivUp — Contexte projet

## Stack
- Next.js 16.2.4 (App Router, pas TypeScript)
- Supabase (auth + base de données)
- Tailwind CSS
- Déployé sur Vercel : https://univup.vercel.app

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
      page.js                  → Tableau de bord (stats réelles)
      planning/page.js         → Planning global + création séances
      eleves/page.js           → Gestion élèves + abonnements + paiements
      profs/page.js            → Gestion profs
      salaires/page.js         → Salaires profs (barème + versements + calcul auto)
    prof/
      layout.js
      sidebar.js
      page.js                  → Planning prof
      appel/page.js            → Feuille d'appel (présence + note + feedback)
      salaire/page.js          → Vue salaire prof (séances + versements + barème)
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

## Variables d'environnement (.env.local ET Vercel)
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

## Policies RLS (toutes en "true" pour l'instant)
- users : select, insert, update
- seances : select, insert, update
- seance_eleves : select, insert, update
- abonnements : select, insert, update
- paiements_eleves : select, insert
- bareme_profs : select, insert, update
- salaires_profs : select, insert

## Ce qui est fonctionnel ✅
- Connexion + redirection par rôle (admin/prof/eleve)
- Admin : tableau de bord avec stats réelles + alertes + financier
- Admin : créer/activer/désactiver élèves et profs
- Admin : créer séances avec sélection individuelle profs + élèves
- Admin : créer abonnements + enregistrer virements élèves
- Admin : activation accès automatique quand abonnement soldé
- Admin : salaires profs (barème configurable + calcul auto + versements)
- Prof : planning
- Prof : feuille d'appel (présence + note + feedback)
- Prof : vue salaire (séances effectuées + versements reçus + barème)
- Élève : planning
- Élève : résultats (notes + feedback + moyenne + taux présence)
- Élève : abonnement (solde + référence virement + historique)
- Déploiement Vercel (univup.vercel.app)
- GitHub : https://github.com/Yoyo2655/univup

## Workflow de déploiement
```bash
git add .
git commit -m "description"
git push
# Vercel redéploie automatiquement en 1-2 min
```

## Module Google Drive — EN COURS 🚧
- Projet Google Cloud créé : univup-drive
- API Google Drive activée
- Compte de service créé : univup-drive-service@...
- Fichier JSON de clé téléchargé (à garder précieusement)
- Prochaine étape : partager le dossier "Drive UnivUp" avec l'email client_email du JSON
- Puis : ajouter les variables d'environnement Google dans .env.local et Vercel
- Architecture prévue :
  → App lit les fichiers Drive via API (clé de service)
  → Viewer PDF intégré (pas d'URL directe exposée)
  → Signed URLs temporaires (15 min)
  → Watermark dynamique avec prénom + email élève
  → Contrôle d'accès par pack dans la table ressources

## Ce qui reste à construire
- [ ] Module ressources Google Drive (viewer sécurisé)
- [ ] Module GEI (QCM annales + génération IA Claude)
- [ ] Chat (élève ↔ prof + chat général)
- [ ] Profils élèves (fac_origine, dominante, ecoles_cibles, ecoles_gei)
- [ ] RLS affinées par rôle (actuellement tout en "true")

## Contexte UnivUp
- Prépa privée pour étudiants universitaires — Concours Centrale + Mines, X, ENSTA, ENSAE, ESTP
- 3 rôles : Admin (Yoyo), Professeurs, Élèves
- Groupes par dominante Centrale (Maths, Physique, Info, SI, Éco)
- Khôlles : 1-2 élèves individuels
- Cours collectifs : groupe entier, prof peut changer par séance
- Paiements élèves par virement bancaire (activation manuelle par admin)
- Salaires profs calculés automatiquement selon barème (khôlle/cours solo/cours groupe)
- Ressources depuis Google Drive (pas de téléchargement ni partage)
- QCM GEI : maths, physique, proba, info (annales + génération IA Claude API)