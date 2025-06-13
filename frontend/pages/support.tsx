import { useState } from 'react';

export default function SupportPage() {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

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
      question: "Comment sont vérifiés les records ?",
      answer: "Tous les records affichés ont été vérifiés et validés par les modérateurs de speedrun.com selon des règles strictes propres à chaque jeu et catégorie."
    },
    {
      question: "Les temps affichés sont-ils à jour ?",
      answer: "Oui, nous synchronisons régulièrement avec speedrun.com pour vous proposer les classements et records les plus récents. Les mises à jour se font plusieurs fois par jour."
    },
    {
      question: "Puis-je soumettre mes propres runs ?",
      answer: "Cette plateforme est en lecture seule. Pour soumettre vos runs, rendez-vous directement sur speedrun.com où vous pourrez créer un compte et soumettre vos performances."
    },
    {
      question: "Comment naviguer entre les différentes catégories ?",
      answer: "Chaque jeu possède ses propres catégories (Any%, 100%, etc.). Utilisez les filtres disponibles sur la page des classements pour explorer les différentes catégories et règles."
    }
  ];

  const toggleFaq = (index: number) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Centre d'Aide
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Trouvez des réponses à vos questions sur l'utilisation de la plateforme
        </p>
      </section>

      {/* FAQ */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Questions Fréquentes</h2>
          <p className="text-slate-400">Les réponses aux questions les plus courantes sur notre plateforme speedrun</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700/50 transition-colors">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/80 transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <span className={`text-violet-400 transition-transform duration-200 ${
                  selectedFaq === index ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              {selectedFaq === index && (
                <div className="px-6 pb-4 border-t border-slate-700 animate-fade-in">
                  <p className="text-slate-300 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>


    </div>
  );
} 