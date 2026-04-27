export default function CGVPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e0d0d',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#f0eeea',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#111010',
      }}>
        <img src="/Logo1w_univup-removebg.png" alt="UnivUp" style={{ width: '140px', objectFit: 'contain' }} />
        <a href="/" style={{ fontSize: '13px', color: '#9b8ec4', textDecoration: 'none', fontWeight: '500' }}>
          ← Retour à la connexion
        </a>
      </div>

      {/* Bande tricolore */}
      <div style={{ display: 'flex', height: '3px' }}>
        <div style={{ flex: 3, background: '#f0eeea' }} />
        <div style={{ flex: 1, background: '#9b8ec4' }} />
        <div style={{ flex: 1, background: '#8a1c30' }} />
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 80px' }}>

        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', color: '#4a4847', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            Document légal
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Conditions Générales de Vente
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ height: '2px', width: '48px', background: '#9b8ec4' }} />
            <span style={{ fontSize: '13px', color: '#4a4847' }}>UnivUp — Mise à jour : Avril 2026</span>
          </div>
        </div>

        {[
          {
            num: '1',
            titre: 'Présentation et objet',
            contenu: `Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent l'ensemble des relations contractuelles entre UnivUp (ci-après « le Prestataire ») et toute personne physique souscrivant à ses services (ci-après « l'Étudiant » ou « le Client »).

UnivUp est un service de préparation privée aux concours des grandes écoles d'ingénieurs, notamment le Concours Centrale-Supélec, le GEI (Grandes Écoles par voie universitaire), et les concours des écoles du groupe Mines-Ponts (X, Mines Paris, Mines Saint-Étienne, Mines Nancy, ENSTA Paris, ENSAE, ESTP, Ponts et Chaussées, Télécom Paris, ISAE-Supaero).

Le Prestataire propose des prestations d'accompagnement pédagogique sous forme de khôlles individuelles, de cours collectifs, d'entretiens de motivation, et d'accès à une plateforme numérique dédiée (ci-après « la Plateforme »).

Toute inscription aux services UnivUp implique l'acceptation pleine, entière et sans réserve des présentes CGV. Le Client déclare en avoir pris connaissance avant toute souscription.`
          },
          {
            num: '2',
            titre: 'Services proposés',
            contenu: `UnivUp propose les services suivants, dont le détail et la composition sont précisés lors de l'inscription selon le pack choisi :

Khôlles individuelles : sessions d'interrogation orale en Mathématiques, Physique, Anglais, Informatique et Entretiens de Motivation, animées par des professeurs qualifiés et expérimentés dans les concours visés.

Cours collectifs : sessions de cours en groupe restreint portant sur les programmes des concours Centrale-Supélec et GEI.

Accès à la Plateforme UnivUp : espace numérique sécurisé permettant de consulter son planning, ses résultats, ses feedbacks, la bibliothèque de ressources, et d'accéder au module de préparation GEI par intelligence artificielle.

Le contenu précis des prestations, leur fréquence et leur durée sont définis dans le pack souscrit par l'Étudiant et communiqués lors de l'inscription. UnivUp se réserve le droit de modifier, d'adapter ou de compléter les services proposés sans préavis, dans la limite du respect des engagements contractuels pris envers les Clients déjà inscrits.`
          },
          {
            num: '3',
            titre: 'Inscription et activation du compte',
            contenu: `L'inscription s'effectue via la Plateforme UnivUp en créant un compte personnel avec une adresse email valide et un mot de passe sécurisé. L'Étudiant s'engage à fournir des informations exactes, complètes et à jour lors de son inscription.

La création du compte ne vaut pas activation de l'accès aux services. L'accès complet à la Plateforme et aux prestations est conditionné au versement de l'acompte prévu dans le pack souscrit et à la validation manuelle par UnivUp.

L'Étudiant est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation du compte par un tiers de son fait engage sa responsabilité. En cas de perte ou de compromission des identifiants, l'Étudiant doit en informer UnivUp dans les meilleurs délais.

UnivUp se réserve le droit de suspendre ou de supprimer un compte en cas de non-respect des présentes CGV, de comportement inapproprié, ou de défaut de paiement caractérisé.`
          },
          {
            num: '4',
            titre: 'Tarifs et modalités de paiement',
            contenu: `Les prix sont indiqués en euros, toutes taxes comprises (TTC). Le tarif applicable est celui en vigueur au jour de la souscription, tel qu'indiqué sur la Plateforme ou communiqué par UnivUp.

Le paiement s'effectue par virement bancaire sur le compte suivant :
• Bénéficiaire : YONI MILO ATTAL
• IBAN : FR76 2823 3000 0191 3356 4211 372
• BIC : REVOFRP2 (Revolut France)

L'Étudiant doit indiquer sa référence unique de virement (communiquée sur la Plateforme) dans le motif du virement, afin de permettre l'identification et l'activation rapide de son accès.

Le paiement peut être effectué en une ou plusieurs fois selon les modalités convenues avec UnivUp. Le versement de l'acompte est obligatoire pour valider l'inscription. La date du premier versement vaut date d'inscription officielle.

Tout retard de paiement pourra entraîner la suspension de l'accès à la Plateforme et aux prestations, après mise en demeure restée sans effet pendant 7 jours ouvrés.`
          },
          {
            num: '5',
            titre: 'Droit de rétractation',
            contenu: `Conformément aux articles L221-18 et suivants du Code de la consommation, l'Étudiant dispose d'un délai de 14 jours calendaires à compter de la date d'inscription (date du premier versement) pour exercer son droit de rétractation, sans avoir à justifier de motifs.

Pour exercer ce droit, l'Étudiant doit notifier sa décision à UnivUp par tout moyen permettant d'en accuser réception (email, message via la Plateforme), avant l'expiration du délai de 14 jours.

Toutefois, conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture d'un service pleinement exécuté avant la fin du délai de rétractation et dont l'exécution a commencé avec l'accord préalable exprès du consommateur. Ainsi, si l'Étudiant a expressément demandé le commencement des prestations avant la fin du délai de rétractation, le remboursement sera proratisé en fonction des prestations déjà effectuées.

Passé le délai de rétractation de 14 jours, l'acompte versé est partiellement remboursable jusqu'au 19/11/2025, à hauteur de 75% du montant versé. Toute annulation au-delà de cette date n'ouvre droit à aucun remboursement, sauf cas de force majeure dûment justifié et accepté par UnivUp.`
          },
          {
            num: '6',
            titre: 'Obligations et responsabilités',
            contenu: `Obligations de UnivUp : Le Prestataire s'engage à mettre en œuvre tous les moyens nécessaires pour assurer la qualité des prestations promises, à respecter les plannings établis dans la mesure du possible, et à informer l'Étudiant dans les meilleurs délais de tout changement affectant les services souscrits.

En cas d'empêchement d'un professeur, UnivUp s'engage à proposer un report de la séance ou un remplacement dans des délais raisonnables. Aucun remboursement ne pourra être exigé pour une séance reportée dans ces conditions.

Obligations de l'Étudiant : L'Étudiant s'engage à se présenter aux séances planifiées aux horaires convenus, à prévenir UnivUp ou le professeur concerné en cas d'absence dans un délai raisonnable (au minimum 24 heures avant la séance), et à adopter un comportement respectueux envers les professeurs et les autres étudiants.

Toute séance à laquelle l'Étudiant ne se présente pas sans avertissement préalable sera considérée comme effectuée et sera due au professeur concerné.

Limitation de responsabilité : La réussite de l'Étudiant aux concours visés dépend de nombreux facteurs indépendants de la volonté de UnivUp, notamment le travail personnel fourni par l'Étudiant. UnivUp ne saurait en aucun cas garantir un résultat d'admissibilité ou d'admission aux concours. La responsabilité de UnivUp est limitée au montant des prestations effectivement payées par l'Étudiant.`
          },
          {
            num: '7',
            titre: 'Propriété intellectuelle',
            contenu: `L'ensemble des contenus disponibles sur la Plateforme UnivUp (ressources pédagogiques, documents, fiches de cours, exercices, sujets d'entraînement, corrigés, etc.) est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de UnivUp ou de ses partenaires.

L'Étudiant bénéficie d'un droit d'accès et d'utilisation personnelle et non commerciale de ces contenus, strictement limité à la durée de son abonnement et à des fins de préparation aux concours. Toute reproduction, diffusion, revente ou exploitation commerciale de ces contenus, sous quelque forme que ce soit, est strictement interdite sans autorisation préalable écrite de UnivUp.

La violation de ces dispositions expose l'Étudiant à des poursuites civiles et pénales.`
          },
          {
            num: '8',
            titre: 'Protection des données personnelles (RGPD)',
            contenu: `Dans le cadre de la fourniture de ses services, UnivUp collecte et traite les données personnelles suivantes : nom et prénom, adresse email, informations relatives au parcours académique et aux concours visés, résultats aux khôlles et séances, et données de paiement (montants, dates de virement).

Ces données sont collectées et traitées conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés.

Finalités du traitement : gestion des inscriptions et des abonnements, suivi pédagogique personnalisé, communication liée aux services, facturation.

Durée de conservation : les données sont conservées pendant la durée de l'abonnement et pendant 3 ans après la fin de la relation contractuelle à des fins légales et comptables.

Droits des personnes : l'Étudiant dispose d'un droit d'accès, de rectification, d'effacement, de limitation du traitement et de portabilité de ses données, qu'il peut exercer en contactant UnivUp via la Plateforme. L'Étudiant dispose également du droit d'introduire une réclamation auprès de la CNIL.

Les données ne sont en aucun cas cédées, vendues ou louées à des tiers à des fins commerciales.`
          },
          {
            num: '9',
            titre: 'Modifications des CGV',
            contenu: `UnivUp se réserve le droit de modifier les présentes CGV à tout moment. Les nouvelles CGV seront notifiées aux Étudiants via la Plateforme ou par email au moins 15 jours avant leur entrée en vigueur.

L'utilisation continue de la Plateforme après notification des nouvelles CGV vaut acceptation de celles-ci. En cas de désaccord avec les nouvelles conditions, l'Étudiant peut résilier son abonnement selon les modalités prévues à l'article 5.

Les CGV applicables sont celles en vigueur à la date de souscription de chaque abonnement.`
          },
          {
            num: '10',
            titre: 'Litiges et droit applicable',
            contenu: `Les présentes CGV sont soumises au droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, les parties s'engagent à rechercher en premier lieu une solution amiable.

À défaut d'accord amiable dans un délai de 30 jours à compter de la notification du litige par l'une des parties, le différend sera soumis aux tribunaux compétents du ressort du siège social de UnivUp.

Conformément aux articles L616-1 et R616-1 du Code de la consommation, UnivUp propose un dispositif de médiation de la consommation. En cas de litige non résolu, l'Étudiant peut recourir gratuitement au médiateur compétent.`
          },
        ].map((article, idx) => (
          <div key={article.num} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(155,142,196,0.15)', color: '#9b8ec4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>
                {article.num}
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#f0eeea', letterSpacing: '-0.2px', margin: 0, paddingTop: '4px' }}>
                {article.titre}
              </h2>
            </div>
            <div style={{ paddingLeft: '52px' }}>
              {article.contenu.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#6e6c66', lineHeight: 1.8, marginBottom: '12px', margin: '0 0 12px 0' }}>
                  {para}
                </p>
              ))}
            </div>
            {idx < 9 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '32px', marginLeft: '52px' }} />}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.08)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#2e2d2b', lineHeight: 1.6 }}>
            © {new Date().getFullYear()} UnivUp — Tous droits réservés. Ces conditions générales de vente sont régies par le droit français.
          </p>
        </div>
      </div>
    </div>
  )
}