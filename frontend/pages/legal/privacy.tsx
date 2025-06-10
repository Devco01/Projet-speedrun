import Head from 'next/head';
import Link from 'next/link';

export default function PolitiqueConfidentialite() {
  return (
    <>
      <Head>
        <title>Politique de confidentialité - SpeedrunSchedule</title>
        <meta name="description" content="Politique de protection des données personnelles de SpeedrunSchedule, conforme au RGPD" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🔒 Politique de confidentialité</h1>
            <p className="text-slate-400 text-lg md:text-xl">
              Protection de vos données personnelles sur SpeedrunSchedule
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Dernière mise à jour : 9 juin 2025 | Mise en production
            </div>
          </div>

          {/* Contenu */}
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6 md:p-8 space-y-8 shadow-2xl">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                1. Introduction
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  SpeedrunSchedule s'engage à protéger la confidentialité de vos données personnelles. 
                  Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                  conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p><strong>Responsable du traitement :</strong> Nicolas Baudry</p>
                  <p><strong>Contact :</strong> nicolasbaudry37@gmail.com</p>
                  <p><strong>Plateforme :</strong> SpeedrunSchedule</p>
                </div>
              </div>
            </section>

            {/* Données collectées */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                2. Données personnelles collectées
              </h2>
              <div className="text-slate-300 space-y-4">
                <h3 className="text-lg font-semibold text-white">📝 Données d'inscription :</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 bg-slate-700/30 rounded-lg p-4">
                  <li>Nom d'utilisateur</li>
                  <li>Adresse e-mail</li>
                  <li>Mot de passe (crypté avec bcrypt)</li>
                  <li>Avatar (optionnel)</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">🏃 Données d'activité :</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 bg-slate-700/30 rounded-lg p-4">
                  <li>Temps de course et performances speedrun</li>
                  <li>Participations aux événements et courses</li>
                  <li>Messages dans les chats de course</li>
                  <li>Statistiques de jeu et classements</li>
                  <li>Historique des courses terminées</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">🔧 Données techniques :</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 bg-slate-700/30 rounded-lg p-4">
                  <li>Adresse IP (pour la sécurité)</li>
                  <li>Informations du navigateur</li>
                  <li>Données de connexion et session</li>
                  <li>Logs d'activité (pour le débogage)</li>
                </ul>
              </div>
            </section>

            {/* Base légale */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                3. Base légale du traitement
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>Nous traitons vos données sur les bases légales suivantes :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">✅ Consentement</h4>
                    <p className="text-sm">Pour l'inscription et l'utilisation des services de speedrunning</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">📋 Exécution du contrat</h4>
                    <p className="text-sm">Pour fournir les services de la plateforme speedrun</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">🔒 Intérêt légitime</h4>
                    <p className="text-sm">Pour l'amélioration des services et la sécurité</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">⚖️ Obligation légale</h4>
                    <p className="text-sm">Conservation des données requise par la loi</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                4. Utilisation des données
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>Vos données sont utilisées exclusivement pour :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside space-y-2 bg-slate-700/30 rounded-lg p-4">
                    <li>Créer et gérer votre compte utilisateur</li>
                    <li>Permettre votre participation aux courses speedrun</li>
                    <li>Afficher vos performances et classements</li>
                    <li>Faciliter la communication dans les événements</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 bg-slate-700/30 rounded-lg p-4">
                    <li>Améliorer nos services et fonctionnalités</li>
                    <li>Assurer la sécurité de la plateforme</li>
                    <li>Détecter et prévenir la triche</li>
                    <li>Fournir un support technique</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Conservation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                5. Durée de conservation
              </h2>
              <div className="text-slate-300 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">👤 Comptes actifs</h4>
                    <p className="text-sm">Tant que le compte reste actif et utilisé</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">😴 Comptes inactifs</h4>
                    <p className="text-sm">3 ans après la dernière connexion</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">🏆 Données de course</h4>
                    <p className="text-sm">Conservées pour les classements historiques</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">🔧 Données techniques</h4>
                    <p className="text-sm">13 mois maximum (logs et analytics)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Droits utilisateurs */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                6. Vos droits RGPD
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">👁️ Droit d'accès</h4>
                    <p className="text-sm">Consulter toutes vos données personnelles</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">✏️ Droit de rectification</h4>
                    <p className="text-sm">Corriger vos données inexactes</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">🗑️ Droit à l'effacement</h4>
                    <p className="text-sm">Supprimer vos données personnelles</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">📦 Droit de portabilité</h4>
                    <p className="text-sm">Récupérer vos données dans un format standard</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">🚫 Droit d'opposition</h4>
                    <p className="text-sm">Vous opposer au traitement de vos données</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white">⏸️ Droit de limitation</h4>
                    <p className="text-sm">Limiter le traitement de vos données</p>
                  </div>
                </div>
                <div className="bg-violet-900/30 border border-violet-700 rounded-lg p-4 mt-4">
                  <p className="text-violet-200">
                    <strong>📧 Pour exercer vos droits :</strong> Contactez-nous à 
                    <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 ml-1 underline">
                      nicolasbaudry37@gmail.com
                    </a>
                  </p>
                  <p className="text-violet-300 text-sm mt-2">
                    Réponse garantie sous 30 jours ouvrés
                  </p>
                </div>
              </div>
            </section>

            {/* Sécurité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                7. Sécurité des données
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>Nous mettons en œuvre des mesures techniques et organisationnelles robustes :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside space-y-2 bg-slate-700/30 rounded-lg p-4">
                    <li>🔐 Chiffrement des mots de passe (bcrypt)</li>
                    <li>🔒 Connexions sécurisées (HTTPS)</li>
                    <li>🛡️ Authentification JWT sécurisée</li>
                    <li>🚪 Accès restreint aux données</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 bg-slate-700/30 rounded-lg p-4">
                    <li>💾 Sauvegardes régulières et chiffrées</li>
                    <li>👁️ Surveillance de la sécurité 24/7</li>
                    <li>🔄 Mises à jour de sécurité automatiques</li>
                    <li>📊 Audit de sécurité régulier</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Transferts de données */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                8. Transferts de données
              </h2>
              <div className="text-slate-300 space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white">🌍 Hébergement</h4>
                  <p>Vos données sont hébergées en Europe (conformité RGPD garantie)</p>
                  <p className="text-sm text-slate-400 mt-2">Base de données PostgreSQL sécurisée</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white">🤝 Partage de données</h4>
                  <p>Aucune donnée personnelle n'est vendue ou partagée avec des tiers</p>
                  <p className="text-sm text-slate-400 mt-2">Les classements publics affichent uniquement les pseudos</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                9. Contact et réclamations
              </h2>
              <div className="text-slate-300 space-y-4">
                <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-700 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">📞 Nous contacter</h4>
                  <div className="space-y-2">
                    <p><strong>Développeur :</strong> Nicolas Baudry</p>
                    <p><strong>E-mail :</strong> 
                      <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 ml-1 underline">
                        nicolasbaudry37@gmail.com
                      </a>
                    </p>
                    <p><strong>Objet :</strong> "RGPD - [Votre demande]"</p>
                  </div>
                </div>
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <p className="text-amber-200">
                    <strong>⚖️ Autorité de contrôle :</strong> En cas de litige, vous pouvez saisir la 
                    <a href="https://www.cnil.fr" className="text-amber-300 hover:text-amber-200 ml-1 underline" target="_blank" rel="noopener noreferrer">
                      CNIL (Commission Nationale de l'Informatique et des Libertés)
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 space-y-4 md:space-y-0">
            <Link 
              href="/"
              className="text-slate-400 hover:text-white transition-colors flex items-center space-x-2 hover:scale-105 transform duration-200"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/legal/terms" className="text-violet-400 hover:text-violet-300 transition-colors">CGU</Link>
              <Link href="/legal/mentions" className="text-blue-400 hover:text-blue-300 transition-colors">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 