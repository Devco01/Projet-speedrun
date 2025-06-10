import Head from 'next/head';
import Link from 'next/link';

export default function ConditionsUtilisation() {
  return (
    <>
      <Head>
        <title>Conditions d'utilisation - SpeedrunSchedule</title>
        <meta name="description" content="Conditions générales d'utilisation de SpeedrunSchedule" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">📋 Conditions d'utilisation</h1>
            <p className="text-slate-400 text-lg md:text-xl">
              Conditions générales d'utilisation de SpeedrunSchedule
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Dernière mise à jour : 9 juin 2025 | Mise en production
            </div>
          </div>

          {/* Contenu */}
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6 md:p-8 space-y-8 shadow-2xl">
            
            {/* Acceptation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                1. Acceptation des conditions
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-300">
                    En accédant et en utilisant SpeedrunSchedule, vous acceptez d'être lié par les présentes 
                    conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser 
                    notre service.
                  </p>
                </div>
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <p className="text-amber-200">
                    <strong>⚠️ Évolution des conditions :</strong> Ces conditions peuvent être modifiées à tout moment. 
                    Les modifications prendront effet dès leur publication sur le site. Il vous appartient de 
                    consulter régulièrement ces conditions.
                  </p>
                </div>
              </div>
            </section>

            {/* Description du service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                2. Description du service
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🎮 SpeedrunSchedule</h3>
                  <p className="text-slate-300 mb-3">
                    SpeedrunSchedule est une plateforme communautaire dédiée au speedrunning qui permet aux 
                    utilisateurs de :
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🏃 Fonctionnalités speedrun</h4>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      <li>• Créer et rejoindre des courses en temps réel</li>
                      <li>• Participer à des événements communautaires</li>
                      <li>• Enregistrer et comparer ses temps</li>
                      <li>• Accéder aux classements et statistiques</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🤝 Fonctionnalités sociales</h4>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      <li>• Échanger avec la communauté speedrun</li>
                      <li>• Organiser des compétitions</li>
                      <li>• Partager ses performances</li>
                      <li>• Suivre les records et actualités</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-violet-900/20 border border-violet-700 rounded-lg p-4">
                  <p className="text-violet-200">
                    <strong>🎓 Statut éducatif :</strong> Ce service est proposé dans le cadre d'un projet éducatif 
                    (TP DWWM) développé par Nicolas Baudry et peut présenter des limitations ou interruptions.
                  </p>
                </div>
              </div>
            </section>

            {/* Inscription */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                3. Inscription et compte utilisateur
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">✅ Conditions d'inscription</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Fournir des informations exactes et à jour</li>
                      <li>• Choisir un nom d'utilisateur approprié</li>
                      <li>• Être responsable de la confidentialité de vos identifiants</li>
                      <li>• Un seul compte par personne autorisé</li>
                      <li>• Respecter la communauté speedrun</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">🔒 Sécurité du compte</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Utiliser un mot de passe fort et unique</li>
                      <li>• Ne jamais partager vos identifiants</li>
                      <li>• Signaler immédiatement toute utilisation non autorisée</li>
                      <li>• Maintenir vos informations à jour</li>
                      <li>• Vous déconnecter sur les appareils partagés</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Règles d'utilisation */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                4. Règles d'utilisation
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-200 mb-3">✅ Comportements autorisés</h3>
                    <ul className="space-y-2 text-green-100 text-sm">
                      <li>• Participation fair-play aux courses</li>
                      <li>• Respect des autres utilisateurs</li>
                      <li>• Partage constructif d'expériences</li>
                      <li>• Signalement de problèmes techniques</li>
                      <li>• Encouragement des nouveaux speedrunners</li>
                      <li>• Partage de stratégies et astuces</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <h3 className="font-semibold text-red-200 mb-3">❌ Comportements interdits</h3>
                    <ul className="space-y-2 text-red-100 text-sm">
                      <li>• <strong>Triche :</strong> Modifications, bots, manipulation de temps</li>
                      <li>• <strong>Harcèlement :</strong> Messages inappropriés, menaces</li>
                      <li>• <strong>Spam :</strong> Messages répétitifs ou non pertinents</li>
                      <li>• <strong>Usurpation :</strong> Se faire passer pour quelqu'un d'autre</li>
                      <li>• <strong>Exploitation :</strong> Abus de bugs ou failles</li>
                      <li>• <strong>Contenu illégal :</strong> Partage de contenu violant la loi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Speedrun et fair-play */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                5. Règles de speedrun et fair-play
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">🏆 Intégrité des courses</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Les temps doivent être réels et non modifiés</li>
                      <li>• L'utilisation d'outils de triche est strictement interdite</li>
                      <li>• Les abandons doivent être déclarés honnêtement</li>
                      <li>• Respecter les règles spécifiques de chaque jeu</li>
                      <li>• Utiliser les versions légales des jeux</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">🤝 Esprit sportif</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Féliciter les performances des autres coureurs</li>
                      <li>• Accepter les défaites avec élégance</li>
                      <li>• Partager vos connaissances et astuces</li>
                      <li>• Aider les nouveaux speedrunners</li>
                      <li>• Maintenir une ambiance positive</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-200 mb-2">🎯 Détection de triche</h3>
                  <p className="text-blue-100 text-sm">
                    Notre système surveille automatiquement les performances suspectes. 
                    Tout comportement frauduleux sera sanctionné et pourra entraîner une exclusion définitive.
                  </p>
                </div>
              </div>
            </section>

            {/* Sanctions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                6. Sanctions et modération
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300">
                  En cas de non-respect des présentes conditions, nous nous réservons le droit d'appliquer 
                  les sanctions suivantes :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                      <h4 className="font-semibold text-yellow-200">⚠️ Avertissement</h4>
                      <p className="text-yellow-100 text-sm">Notification du comportement inapproprié</p>
                    </div>
                    <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
                      <h4 className="font-semibold text-orange-200">⏸️ Suspension temporaire</h4>
                      <p className="text-orange-100 text-sm">Interdiction d'accès pour une durée limitée</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                      <h4 className="font-semibold text-red-200">🚫 Bannissement</h4>
                      <p className="text-red-100 text-sm">Suppression définitive du compte</p>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3">
                      <h4 className="font-semibold text-purple-200">🗑️ Suppression de contenu</h4>
                      <p className="text-purple-100 text-sm">Retrait de publications inappropriées</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">📧 Procédure d'appel</h3>
                  <p className="text-slate-300 text-sm">
                    Si vous estimez qu'une sanction a été appliquée de manière injustifiée, 
                    vous pouvez contacter Nicolas Baudry à : 
                    <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 ml-1 underline">
                      nicolasbaudry37@gmail.com
                    </a>
                    <br/>
                    <strong>Objet :</strong> "Appel sanction - [Votre pseudo]"
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation de responsabilité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                7. Limitation de responsabilité
              </h2>
              <div className="space-y-4">
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-200 mb-2">⚠️ Service "en l'état"</h3>
                  <p className="text-amber-100 text-sm mb-3">
                    SpeedrunSchedule est fourni "en l'état" sans garantie d'aucune sorte. 
                    Nous ne pouvons garantir :
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-amber-100 text-xs">
                    <div>• Disponibilité continue</div>
                    <div>• Absence d'erreurs</div>
                    <div>• Sécurité absolue</div>
                    <div>• Véracité des contenus</div>
                  </div>
                </div>
                
                <div className="bg-violet-900/20 border border-violet-700 rounded-lg p-4">
                  <h3 className="font-semibold text-violet-200 mb-2">🎓 Contexte éducatif</h3>
                  <p className="text-violet-100 text-sm">
                    Ce service étant développé dans un cadre éducatif (TP DWWM), il peut présenter 
                    des limitations techniques et être interrompu sans préavis à des fins pédagogiques 
                    ou d'évaluation.
                  </p>
                </div>
              </div>
            </section>

            {/* Évolution du service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                8. Évolution et fin du service
              </h2>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300 mb-3">SpeedrunSchedule se réserve le droit de :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• Modifier les fonctionnalités du service</li>
                    <li>• Interrompre temporairement le service</li>
                    <li>• Arrêter définitivement le service</li>
                    <li>• Modifier les présentes conditions</li>
                  </ul>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <p className="text-blue-100 text-sm">
                      <strong>📢 Préavis :</strong> En cas d'arrêt du service, nous nous efforcerons 
                      de vous prévenir avec un préavis raisonnable par e-mail ou notification sur le site.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                9. Contact et support
              </h2>
              <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-700 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">📞 Nous contacter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-300 font-medium">Support général :</p>
                      <p><a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 underline">nicolasbaudry37@gmail.com</a></p>
                      <p className="text-slate-400 text-xs">Objet : "Support - [Votre problème]"</p>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Signalement d'abus :</p>
                      <p><a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 underline">nicolasbaudry37@gmail.com</a></p>
                      <p className="text-slate-400 text-xs">Objet : "Signalement - [Description]"</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-300 font-medium">Développeur :</p>
                      <p className="text-slate-300">Nicolas Baudry</p>
                      <p className="text-slate-400 text-xs">Développeur Web et Web Mobile (DWWM)</p>
                    </div>
                    <div className="bg-slate-700/30 rounded p-3">
                      <p className="text-slate-400 text-xs">
                        <strong>Délai de réponse :</strong> 48-72h ouvrées<br/>
                        <strong>Disponibilité :</strong> En fonction des contraintes de formation
                      </p>
                    </div>
                  </div>
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
              <Link href="/legal/privacy" className="text-violet-400 hover:text-violet-300 transition-colors">Confidentialité</Link>
              <Link href="/legal/mentions" className="text-blue-400 hover:text-blue-300 transition-colors">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 