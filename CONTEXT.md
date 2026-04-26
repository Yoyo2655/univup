# UnivUp — Contexte projet

## Stack
- Next.js 16.2.4 (App Router, pas TypeScript)
- Supabase (auth + base de données)
- Tailwind CSS
- Déployé sur Vercel : https://univup.vercel.app
- GitHub : https://github.com/Yoyo2655/univup

## Structure des dossiers
```
univup/
  app/
    page.js                      → Page de connexion
    api/
      create-user/route.js       → Créer un user (service role key)
      drive/
        list/route.js            → Lister fichiers Drive (+ recherche)
        file/route.js            → Récupérer fichier Drive en base64
      gei/
        generate/route.js        → Générer QCM GEI avec Gemini IA
    admin/
      layout.js + sidebar.js     → Layout admin
      page.js                    → Tableau de bord (stats réelles + alertes)
      planning/page.js           → Planning global + création séances
      eleves/page.js             → Élèves + abonnements + paiements
      profs/page.js              → Gestion profs
      salaires/page.js           → Salaires profs (barème + calcul auto)
    prof/
      layout.js + sidebar.js
      page.js                    → Planning prof
      appel/page.js              → Feuille d'appel (présence + note + feedback)
      salaire/page.js            → Vue salaire prof
      ressources/page.js         → Bibliothèque Drive (même que élève)
    eleve/
      layout.js + sidebar.js
      page.js                    → Planning élève
      resultats/page.js          → Résultats (notes + feedback + stats)
      biblio/page.js             → Bibliothèque Drive + viewer PDF + recherche
      gei/page.js                → Prépa GEI (QCM multi-réponses + Gemini IA)
      abonnement/page.js         → Abonnement + historique paiements
  lib/
    supabase.js                  → Client Supabase
    google.js                    → Client Google Drive API
    theme.js                     → Thème couleurs centralisé (export t)
  public/
    pdf.worker.min.mjs           → Worker PDF.js (copié depuis pdfjs-dist/legacy)
```

## Variables d'environnement (.env.local ET Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://owtubcuiogcdgsbhmsfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=univup-drive-service@univup-drive.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_DRIVE_FOLDER_ID=1WgSIDIWaOQ9E_pq_0yjD1R_79CK_8XAr
GEMINI_API_KEY=...
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

## Thème couleurs (lib/theme.js)
```js
export const t = {
  bg: '#0f0f11', surface: '#18181c', surface2: '#1e1e24',
  text: '#e8e6e0', muted: '#6e6c66', muted2: '#9e9c96',
  purple: '#a78bfa', teal: '#34d399', blue: '#60a5fa',
  amber: '#fbbf24', coral: '#f87171',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
}
```

## Ce qui est fonctionnel ✅
- Connexion + redirection par rôle (admin/prof/eleve)
- Admin : tableau de bord (stats réelles + alertes + financier)
- Admin : créer/activer/désactiver élèves et profs
- Admin : créer séances (sélection individuelle profs + élèves)
- Admin : abonnements élèves + virements + activation auto
- Admin : salaires profs (barème configurable + calcul auto + versements)
- Prof : planning + feuille d'appel (présence + note + feedback)
- Prof : vue salaire (séances + versements + barème)
- Prof : bibliothèque Drive complète
- Élève : planning + résultats + abonnement
- Bibliothèque Drive : navigation dossiers + viewer PDF (canvas, non téléchargeable) + viewer images + recherche globale
- Module GEI : QCM multi-réponses (1-5 bonnes réponses) généré par Gemini IA, format exact GEI, corrections détaillées
- Déploiement Vercel (univup.vercel.app)

## Module GEI — détails techniques
- Modèle Gemini : gemini-2.0-flash-lite (gratuit)
- Format : plusieurs bonnes réponses possibles (comme les vraies épreuves GEI)
- Matières : Maths, Physique, Proba, Info
- Prompt calibré sur le vrai format GEI (X, ENSTA, Mines, ENSAE, ESTP...)
- ⚠ Quotas Gemini en cours d'activation (nouvelle clé) — attendre quelques heures

## Google Drive
- Projet Google Cloud : univup-drive
- Compte de service : univup-drive-service@univup-drive.iam.gserviceaccount.com
- Dossier racine partagé : UnivUp-webapp (ID: 1WgSIDIWaOQ9E_pq_0yjD1R_79CK_8XAr)
- Gemini API key depuis Google AI Studio (aistudio.google.com)

## Workflow de déploiement
```bash
git add .
git commit -m "description"
git push
# Vercel redéploie automatiquement en 1-2 min
```

## Ce qui reste à construire
- [ ] Chat (élève ↔ prof + chat général de promo)
- [ ] Profils élèves (fac_origine, dominante_centrale, ecoles_cibles, ecoles_gei)
- [ ] RLS affinées par rôle (actuellement tout en "true")
- [ ] Notifications email (rappels séances, feedback posté)
- [ ] Annales GEI saisies en base (en complément de la génération IA)

## Contexte UnivUp
- Prépa privée pour étudiants universitaires — Concours Centrale + GEI (X, Mines, ENSTA, ENSAE, ESTP...)
- 3 rôles : Admin (Yoyo), Professeurs, Élèves
- Groupes par dominante Centrale (Maths, Physique, Info, SI, Éco)
- Khôlles : 1-2 élèves individuels / Cours collectifs : groupe entier
- Paiements élèves par virement bancaire (activation manuelle par admin)
- Salaires profs calculés automatiquement selon barème
- Ressources depuis Google Drive (pas de téléchargement ni partage)