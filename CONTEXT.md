# UnivUp — Contexte projet

## Stack
- Next.js 16.2.4 (App Router, pas TypeScript)
- Supabase (auth + base de données + storage)
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
    chat/
      layout.js                  → Layout chat (détecte le rôle, affiche la bonne sidebar)
      page.js                    → Chat général temps réel (texte + fichiers + images)
  lib/
    supabase.js
    google.js
    theme.js                     → export const t = { bg, surface, surface2, text, muted, muted2, purple, teal, blue, amber, coral, border, border2 }
  public/
    pdf.worker.min.mjs           → Worker PDF.js
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

## Base de données Supabase
- users
- groupes
- groupe_eleves
- seances
- seance_eleves
- abonnements
- paiements_eleves
- bareme_profs
- salaires_profs
- messages (id, user_id, contenu, fichier_url, fichier_type, fichier_nom, created_at)

## Storage Supabase
- bucket : chat-files (public) — fichiers et images du chat

## Realtime Supabase
- Table messages activée sur supabase_realtime

## Policies RLS (toutes en "true" pour l'instant)
- users : select, insert, update
- seances : select, insert, update
- seance_eleves : select, insert, update
- abonnements : select, insert, update
- paiements_eleves : select, insert
- bareme_profs : select, insert, update
- salaires_profs : select, insert
- messages : select, insert
- storage.objects (chat-files) : select, insert

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
- Auth 3 rôles (admin/prof/eleve)
- Admin : tableau de bord + planning + élèves + abonnements + profs + salaires
- Prof : planning + feuille d'appel + salaire + bibliothèque
- Élève : planning + résultats + abonnement + bibliothèque + GEI
- Bibliothèque Drive : navigation + viewer PDF (canvas) + viewer images + recherche
- Module GEI : QCM multi-réponses format réel GEI + Gemini IA + corrections
- Chat général temps réel : texte + images + fichiers, 3 rôles, badges colorés
- Déploiement Vercel

## Module GEI
- Modèle Gemini : gemini-2.0-flash-lite (gratuit, Google AI Studio)
- Format exact GEI : 5 propositions, 1-5 bonnes réponses
- Matières : Maths, Physique, Proba, Info
- ⚠ Quotas Gemini parfois limités sur nouvelle clé — attendre si erreur 429

## Google Drive
- Projet : univup-drive
- Compte de service : univup-drive-service@univup-drive.iam.gserviceaccount.com
- Dossier racine : UnivUp-webapp (ID: 1WgSIDIWaOQ9E_pq_0yjD1R_79CK_8XAr)

## Ce qui reste à construire
- [ ] Profils élèves (fac_origine, dominante_centrale, ecoles_cibles, ecoles_gei)
- [ ] RLS affinées par rôle
- [ ] Notifications email
- [ ] Annales GEI saisies en base (en complément IA)

## Contexte UnivUp
- Prépa privée pour étudiants universitaires — Centrale + GEI (X, Mines, ENSTA, ENSAE, ESTP...)
- 3 rôles : Admin (Yoyo), Professeurs, Élèves
- Dominantes Centrale : Maths, Physique, Info, SI, Éco
- Khôlles : 1-2 élèves / Cours collectifs : groupe entier
- Paiements élèves par virement (activation manuelle)
- Salaires profs calculés automatiquement selon barème
- Ressources Drive (pas de téléchargement ni partage)