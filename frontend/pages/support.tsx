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
      question: "Comment utiliser la plateforme de speedrun ?",
      answer: "Naviguez dans notre catalogue de jeux, consultez les classements, recherchez vos jeux favoris et découvrez les meilleurs temps réalisés par la communauté speedrun mondiale."
    },
    {
      question: "D'où viennent les données des runs ?",
      answer: "Toutes les données proviennent directement de speedrun.com, la référence mondiale pour les records de speedrun. Les informations sont synchronisées régulièrement pour vous offrir les temps les plus récents."
    },
    {
      question: "Comment trouver un jeu spécifique ?",
      answer: "Utilisez la barre de recherche sur la page des classements ou parcourez les jeux populaires sur la page d'accueil. Vous pouvez rechercher par nom de jeu ou par série."
    },
    {
      question: "Quelles informations puis-je voir sur les runs ?",
      answer: "Pour chaque run, vous pouvez consulter le temps réalisé, la date de réalisation, la plateforme utilisée, le nom du joueur et souvent un lien vers la vidéo de la performance."
    },
    {
      question: "Que faire si je trouve un bug ?",
      answer: "Signalez tout bug via le formulaire de contact ci-dessous en décrivant précisément le problème rencontré. Notre équipe technique s'en occupera rapidement."
    },
    {
      question: "Les temps affichés sont-ils à jour ?",
      answer: "Oui, nous synchronisons régulièrement avec speedrun.com pour vous proposer les classements et records les plus récents. Les mises à jour se font plusieurs fois par jour."
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Centre d'Aide & Support
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Trouvez des réponses à vos questions ou contactez notre équipe
        </p>
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
                  <option value="data">Problème avec les données</option>
                  <option value="performance">Performance du site</option>
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
    </div>
  );
} 