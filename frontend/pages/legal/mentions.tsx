import Head from 'next/head';
import Link from 'next/link';

export default function MentionsLegales() {
  return (
    <>
      <Head>
        <title>Mentions légales - SpeedrunSchedule</title>
        <meta name="description" content="Mentions légales de SpeedrunSchedule" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">⚖️ Mentions légales</h1>
            <p className="text-slate-400 text-lg md:text-xl">
              Informations légales relatives au site SpeedrunSchedule
            </p>
          </div>

          {/* Contenu */}
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6 md:p-8 space-y-8 shadow-2xl">
            
            {/* Éditeur */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                1. Éditeur du site
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-white">🌐 Site web</h3>
                  <p className="text-slate-300"><strong>Nom :</strong> SpeedrunSchedule</p>
                  <p className="text-slate-300"><strong>URL :</strong> https://projet-speedrun.vercel.app/</p>
                  <p className="text-slate-300"><strong>Nature :</strong> Plateforme communautaire de speedrunning</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-white">📋 Statut juridique</h3>
                  <p className="text-slate-300"><strong>Type :</strong> Projet éducatif TP DWWM</p>
                  <p className="text-slate-300"><strong>Cadre :</strong> Formation professionnelle</p>
                  <p className="text-slate-300"><strong>Finalité :</strong> Démonstration de compétences</p>
                </div>
              </div>
            </section>

            {/* Développeur */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                2. Développeur et Directeur de la publication
              </h2>
              <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">👨‍💻 Développeur</h3>
                    <div className="space-y-2 text-slate-300">
                      <p><strong>Nom :</strong> Nicolas Baudry</p>
                      <p><strong>Qualité :</strong> Développeur Web et Web Mobile</p>
                      <p><strong>Formation :</strong> Titre Professionnel DWWM</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-3">📝 Contact</h3>
                    <div className="space-y-2 text-slate-300">
                      <p><strong>E-mail :</strong> 
                        <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 ml-1 underline">
                          nicolasbaudry37@gmail.com
                        </a>
                      </p>
                      <p><strong>Responsabilités :</strong> Conception, développement, maintenance</p>
                      <p><strong>Directeur de publication :</strong> Nicolas Baudry</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                3. Conception et développement technique
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🛠️ Stack technique</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li><strong>Frontend :</strong> Next.js 14, TypeScript, Tailwind CSS</li>
                    <li><strong>Backend :</strong> Node.js, Express.js, TypeScript</li>
                    <li><strong>Base de données :</strong> PostgreSQL, MongoDB</li>
                    <li><strong>Authentification :</strong> JWT, bcrypt</li>
                    <li><strong>Temps réel :</strong> WebSockets</li>
                  </ul>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🎓 Contexte pédagogique</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li><strong>Formation :</strong> Titre Professionnel DWWM</li>
                    <li><strong>Objectif :</strong> Projet d'examen TP</li>
                    <li><strong>Compétences :</strong> Full-stack development</li>
                    <li><strong>Durée développement :</strong> 2024-2025</li>
                    <li><strong>Niveau :</strong> Bac+2 équivalent</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                4. Hébergement et infrastructure
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🌐 Hébergeur principal</h3>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p><strong>Société :</strong> Vercel Inc.</p>
                    <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                    <p><strong>Site web :</strong> 
                      <a href="https://vercel.com" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                        vercel.com
                      </a>
                    </p>
                    <p><strong>Type :</strong> Plateforme serverless</p>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">💾 Base de données</h3>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p><strong>PostgreSQL :</strong> Hébergement sécurisé en cloud</p>
                    <p><strong>Cache Local :</strong> Optimisation des performances</p>
                    <p><strong>Localisation :</strong> Europe (conformité RGPD)</p>
                    <p><strong>Sécurité :</strong> Chiffrement SSL/TLS</p>
                    <p><strong>Sauvegardes :</strong> Automatiques quotidiennes</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                5. Propriété intellectuelle
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">©️ Droits d'auteur</h3>
                  <p className="text-slate-300 mb-3">
                    Le contenu de ce site (structure, code source, textes, design, images, etc.) 
                    est protégé par le droit d'auteur et appartient à Nicolas Baudry ou fait 
                    l'objet d'une autorisation d'utilisation.
                  </p>
                  <p className="text-slate-300 text-sm">
                    <strong>Licence :</strong> Tous droits réservés - Projet éducatif
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🎮 Contenus tiers</h4>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      <li>• Données speedrun.com : API publique</li>
                      <li>• Logos et images de jeux : Propriété des éditeurs</li>
                      <li>• Contenus utilisateurs : Propriété de leurs auteurs</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🔧 Bibliothèques open source</h4>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      <li>• Next.js : MIT License</li>
                      <li>• React : MIT License</li>
                      <li>• Tailwind CSS : MIT License</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                6. Limitation de responsabilité
              </h2>
              <div className="space-y-4">
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-200 mb-2">⚠️ Projet éducatif</h3>
                  <p className="text-amber-100 text-sm">
                    SpeedrunSchedule est un projet développé dans un cadre éducatif (TP DWWM). 
                    Il peut présenter des limitations techniques et être interrompu sans préavis 
                    à des fins pédagogiques.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">📋 Exactitude des informations</h4>
                    <p className="text-slate-300 text-sm">
                      Nous nous efforçons de fournir des informations précises mais ne 
                      pouvons garantir l'exactitude, la complétude ou l'actualité de 
                      toutes les données affichées.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🔧 Disponibilité du service</h4>
                    <p className="text-slate-300 text-sm">
                      Nous nous efforçons d'assurer la disponibilité 24h/24, mais ne 
                      pouvons garantir une disponibilité absolue du service.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Droit applicable */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                7. Droit applicable et juridiction
              </h2>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">🇫🇷 Droit français</h3>
                    <p className="text-slate-300 text-sm">
                      Les présentes mentions légales sont soumises au droit français. 
                      En cas de litige, les tribunaux français seront seuls compétents.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">🤝 Médiation</h3>
                    <p className="text-slate-300 text-sm">
                      En cas de litige, une solution amiable sera recherchée avant 
                      tout recours judiciaire.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
                8. Contact et informations
              </h2>
              <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-700 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">📞 Nous contacter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-slate-300"><strong>Questions générales :</strong></p>
                    <p className="text-slate-300">
                      <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 underline">
                        nicolasbaudry37@gmail.com
                      </a>
                    </p>
                    <p className="text-slate-400 text-sm">Objet : "SpeedrunSchedule - [Votre demande]"</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-300"><strong>Support technique :</strong></p>
                    <p className="text-slate-300">
                      <a href="mailto:nicolasbaudry37@gmail.com" className="text-violet-400 hover:text-violet-300 underline">
                        nicolasbaudry37@gmail.com
                      </a>
                    </p>
                    <p className="text-slate-400 text-sm">Objet : "Support - [Description du problème]"</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-violet-700">
                  <p className="text-slate-400 text-sm">
                    <strong>Délai de réponse :</strong> Nous nous efforçons de répondre sous 48-72h ouvrées
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
              <Link href="/legal/privacy" className="text-violet-400 hover:text-violet-300 transition-colors">Confidentialité</Link>
              <Link href="/legal/terms" className="text-blue-400 hover:text-blue-300 transition-colors">CGU</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 