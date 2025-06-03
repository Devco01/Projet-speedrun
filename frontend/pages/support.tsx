import { useState } from 'react';

export default function SupportPage() {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "Comment créer mon premier speedrun ?",
      answer: "Pour créer votre premier speedrun, inscrivez-vous sur la plateforme, choisissez un jeu dans notre catalogue, sélectionnez une catégorie (Any%, 100%, etc.), enregistrez votre run et soumettez-le avec une vidéo de preuve."
    },
    {
      question: "Quels sont les critères de vérification d'un run ?",
      answer: "Un run doit contenir une vidéo claire du gameplay, respecter les règles de la catégorie, avoir un timer visible, et ne pas utiliser de modifications non autorisées. Nos modérateurs vérifient chaque soumission."
    },
    {
      question: "Puis-je modifier mon run après soumission ?",
      answer: "Une fois soumis, un run ne peut plus être modifié. Cependant, vous pouvez le supprimer et en soumettre un nouveau si vous avez fait une erreur ou amélioré votre temps."
    },
    {
      question: "Comment rejoindre la communauté Discord ?",
      answer: "Cliquez sur le lien Discord dans le footer de la page ou dans la section communauté. Notre serveur Discord est ouvert à tous les speedrunners, débutants comme experts."
    },
    {
      question: "Que faire si je trouve un bug ?",
      answer: "Signalez tout bug via le formulaire de contact ci-dessous en décrivant précisément le problème rencontré. Notre équipe technique s'en occupera rapidement."
    },
    {
      question: "Comment devenir modérateur ?",
      answer: "Les modérateurs sont choisis parmi les membres actifs et respectés de la communauté. Participez aux discussions, aidez les nouveaux runners et contactez-nous si vous êtes intéressé."
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Message envoyé ! Notre équipe vous répondra sous 24h. (Démo)');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const toggleFaq = (index: number) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="text-center py-12">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <span className="text-2xl">🎧</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Centre d'Aide & Support
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Trouvez des réponses à vos questions ou contactez notre équipe
        </p>
      </section>

      {/* Liens rapides */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://discord.gg/speedrun"
            target="_blank"
            rel="noopener noreferrer"
            className="card hover-scale group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Discord</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Rejoignez notre communauté Discord pour discuter, trouver des partenaires de course et obtenir de l'aide en temps réel.
            </p>
            <div className="text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
              Rejoindre le Discord →
            </div>
          </a>

          <a
            href="https://twitch.tv/speedrunplatform"
            target="_blank"
            rel="noopener noreferrer"
            className="card hover-scale group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">📺</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Twitch</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Suivez nos streams en direct, regardez les meilleures runs et participez aux événements communautaires.
            </p>
            <div className="text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
              Suivre sur Twitch →
            </div>
          </a>

          <a
            href="https://youtube.com/@speedrunplatform"
            target="_blank"
            rel="noopener noreferrer"
            className="card hover-scale group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🎥</span>
              </div>
              <h3 className="text-xl font-semibold text-white">YouTube</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Découvrez nos tutoriels, highlights des meilleurs runs et documentaires sur le speedrunning.
            </p>
            <div className="text-red-400 font-medium group-hover:text-red-300 transition-colors">
              Voir sur YouTube →
            </div>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Questions Fréquentes</h2>
          <p className="text-slate-400">Les réponses aux questions les plus courantes</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700 transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <span className={`text-violet-400 transition-transform ${
                  selectedFaq === index ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              {selectedFaq === index && (
                <div className="px-6 pb-4 border-t border-slate-700">
                  <p className="text-slate-300 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Formulaire de contact */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Nous Contacter</h2>
          <p className="text-slate-400">Une question spécifique ? Notre équipe est là pour vous aider</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sujet
                </label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="bug">Signaler un bug</option>
                  <option value="feature">Demande de fonctionnalité</option>
                  <option value="account">Problème de compte</option>
                  <option value="run">Question sur un run</option>
                  <option value="moderation">Modération</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                  rows={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Décrivez votre question ou problème en détail..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le message'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Informations supplémentaires */}
      <section>
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Documentation</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Consultez notre documentation complète pour apprendre les bases du speedrunning et utiliser efficacement la plateforme.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Guide du débutant speedrunner</li>
              <li>• Règles et catégories des jeux</li>
              <li>• Tutoriels enregistrement/streaming</li>
              <li>• API et intégrations</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 