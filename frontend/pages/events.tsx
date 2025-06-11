import { useState, useEffect } from 'react';
import { useAuth } from './_app';
import Link from 'next/link';

// Types pour l'API speedrun.com
interface JeuSpeedrun {
  id: string;
  title?: string;  // Garder pour compatibilité
  name?: string;   // Nouveau format du backend
  abbreviation: string;
  coverImage?: string;  // Backend utilise coverImage
  cover?: string;       // Fallback
}

interface CategorieSpeedrun {
  id: string;
  name: string;
  type: string;
}

interface Race {
  id: string;
  jeu: string;
  jeuId: string;
  categorie: string;
  categorieId: string;
  objectif: string;
  statut: 'en-attente' | 'prete' | 'en-cours' | 'terminee';
  creePar: string;
  participants: ParticipantRace[];
  maxParticipants: number;
  heureDebut?: string;
  heureFin?: string;
  motDePasse?: string;
  creeA: string;
}

interface ParticipantRace {
  id: string;
  nomUtilisateur: string;
  statut: 'inscrit' | 'pret' | 'en-course' | 'termine' | 'abandon';
  tempsFin?: number;
  urlStream?: string;
  place?: number;
}

interface MessageChat {
  id: string;
  nomUtilisateur: string;
  message: string;
  horodatage: string;
  type: 'chat' | 'systeme';
}

export default function PageRaces() {
  // Utiliser le contexte d'authentification global
  const { utilisateurActuel, estAuthentifie, gererConnexion } = useAuth();
  
  const [races, setRaces] = useState<Race[]>([]);
  const [chargement, setChargement] = useState(false);
  const [vueActive, setVueActive] = useState<'parcourir' | 'creer' | 'course'>('parcourir');
  const [raceSelectionnee, setRaceSelectionnee] = useState<Race | null>(null);
  
  // États pour la création de race
  const [nouvelleRace, setNouvelleRace] = useState({
    jeu: '',
    jeuId: '',
    categorie: '',
    categorieId: '',
    objectif: 'Meilleur temps',
    maxParticipants: 4,
    motDePasse: ''
  });

  // États pour l'autocomplétion des jeux
  const [recherchejeu, setRechercheJeu] = useState('');
  const [jeuxSuggeres, setJeuxSuggeres] = useState<JeuSpeedrun[]>([]);
  const [chargementJeux, setChargementJeux] = useState(false);
  const [montrerSuggestions, setMontrerSuggestions] = useState(false);

  // États pour les catégories
  const [categories, setCategories] = useState<CategorieSpeedrun[]>([]);
  const [chargementCategories, setChargementCategories] = useState(false);

  // États pour le chat de race
  const [messagesChat, setMessagesChat] = useState<MessageChat[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');

  // ⏱️ NOUVEAUX ÉTATS POUR LE TIMER EN TEMPS RÉEL
  const [timerState, setTimerState] = useState<'waiting' | 'countdown' | 'racing' | 'finished'>('waiting');
  const [timeRemaining, setTimeRemaining] = useState(30); // Décompte de 30 secondes
  const [raceTime, setRaceTime] = useState(0); // Temps de course en secondes
  const [personalStartTime, setPersonalStartTime] = useState<Date | null>(null);

  // Timer en temps réel avec effets sonores
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'countdown' && timeRemaining > 0) {
      // Décompte avant le début
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          if (newTime <= 0) {
            // Attendre 1 seconde supplémentaire pour afficher "0" avant de démarrer
            setTimeout(() => {
              setTimerState('racing');
              setPersonalStartTime(new Date());
              setRaceTime(0);
            }, 1000);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerState === 'racing' && personalStartTime) {
      // Chronomètre de course avec précision centième
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = (now.getTime() - personalStartTime.getTime()) / 1000;
        setRaceTime(elapsed);
      }, 10); // Mise à jour tous les 10ms pour une précision maximale
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timeRemaining, personalStartTime]);

  // Démarrer le décompte quand l'utilisateur clique sur "Commencer"
  const startCountdown = () => {
    setTimerState('countdown');
    setTimeRemaining(30);
    setRaceTime(0);
    setPersonalStartTime(null);
  };

  // Arrêter la course (finish)
  const finishRace = () => {
    setTimerState('finished');
    if (raceSelectionnee) {
      changerStatutParticipant(raceSelectionnee.id, 'termine');
    }
  };

  // Reset du timer (abandon ou nouvelle course)
  const resetTimer = (isAbandon: boolean = false) => {
    setTimerState('waiting');
    setTimeRemaining(30);
    setRaceTime(0);
    setPersonalStartTime(null);
    
    if (raceSelectionnee && isAbandon) {
      changerStatutParticipant(raceSelectionnee.id, 'abandon');
    }
  };

  // Fonctions pour les clics de boutons (avec gestion d'événements)
  const handleAbandonClick = () => resetTimer(true);
  const handleNewRaceClick = () => resetTimer(false);

  // Fonction pour formater le temps avec millisecondes
  const formatRaceTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100); // Centièmes de seconde

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
  };

  // Liste de jeux populaires prédéfinis
  const jeuxPopulaires: JeuSpeedrun[] = [
    {
      id: 'oot-fallback',
      name: 'The Legend of Zelda: Ocarina of Time',
      title: 'The Legend of Zelda: Ocarina of Time',
      abbreviation: 'oot',
      coverImage: 'https://www.speedrun.com/static/game/oot/cover?v=1'
    },
    {
      id: 'sm64-fallback',
      name: 'Super Mario 64',
      title: 'Super Mario 64',
      abbreviation: 'sm64',
      coverImage: 'https://www.speedrun.com/static/game/sm64/cover?v=1'
    },
    {
      id: 'botw-fallback',
      name: 'The Legend of Zelda: Breath of the Wild',
      title: 'The Legend of Zelda: Breath of the Wild',
      abbreviation: 'botw',
      coverImage: 'https://www.speedrun.com/static/game/botw/cover?v=1'
    },
    {
      id: 'celeste-fallback',
      name: 'Celeste',
      title: 'Celeste',
      abbreviation: 'celeste',
      coverImage: 'https://www.speedrun.com/static/game/celeste/cover?v=1'
    },
    {
      id: 'sonic-fallback',
      name: 'Sonic the Hedgehog',
      title: 'Sonic the Hedgehog',
      abbreviation: 'sonic',
      coverImage: 'https://www.speedrun.com/static/game/sonic/cover?v=1'
    },
    {
      id: 'smw-fallback',
      name: 'Super Mario World',
      title: 'Super Mario World',
      abbreviation: 'smw',
      coverImage: 'https://www.speedrun.com/static/game/smw/cover?v=1'
    }
  ];

  // Charger les races depuis l'API au démarrage
  useEffect(() => {
    chargerRaces();
  }, []);

  // Fonction pour charger les races depuis l'API
  const chargerRaces = async () => {
    setChargement(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/races`);
      
      if (response.ok) {
        const data = await response.json();
        // Transformer les données de l'API vers le format attendu par le frontend
        const racesTransformees = data.data.map((race: any) => ({
          id: race.id,
          jeu: race.gameName,
          jeuId: race.gameId,
          categorie: race.categoryName,
          categorieId: race.categoryId,
          objectif: race.objective,
          statut: race.status,
          creePar: race.createdBy.username,
          participants: race.participants.map((p: any) => ({
            id: p.user.id,
            nomUtilisateur: p.user.username,
            statut: p.status,
            tempsFin: p.finishTime,
            urlStream: p.streamUrl,
            place: p.position
          })),
          maxParticipants: race.maxParticipants,
          heureDebut: race.startTime,
          heureFin: race.endTime,
          motDePasse: race.password,
          creeA: race.createdAt
        }));
        setRaces(racesTransformees);
        console.log('📊 Races chargées depuis API:', racesTransformees.length, 'races');
      } else {
        console.error('Erreur API:', response.status);
        setRaces([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des races:', error);
      setRaces([]);
    } finally {
      setChargement(false);
    }
  };

  // Fonction pour rechercher des jeux (Algorithme avancé inspiré de leaderboards.tsx)
  const rechercherJeux = async (query: string) => {
    if (query.length < 2) {
      setJeuxSuggeres([]);
      return;
    }

    setChargementJeux(true);
    
    try {
      // Utiliser l'API speedrun exhaustive comme dans leaderboards
      const response = await fetch(`http://localhost:5000/api/speedrun/games/search/exhaustive?q=${encodeURIComponent(query)}&limit=20`);
      let jeuxAPI: JeuSpeedrun[] = [];
      
      if (response.ok) {
        const data = await response.json();
        jeuxAPI = data.games || [];
      }

      // Algorithme de tri avancé identique à leaderboards.tsx
      if (Array.isArray(jeuxAPI)) {
        const sortedResults = jeuxAPI.sort((a, b) => {
          const queryLower = query.toLowerCase().trim();
          const aName = (a.name || a.title || '').toLowerCase();
          const bName = (b.name || b.title || '').toLowerCase();
          
          // 1. Jeux iconiques officiels par franchise (priorité absolue)
          const iconicTitles = {
            'zelda': [
              'the legend of zelda: ocarina of time',
              'the legend of zelda: majora\'s mask', 
              'the legend of zelda: breath of the wild',
              'the legend of zelda: tears of the kingdom',
              'the legend of zelda: twilight princess',
              'the legend of zelda: wind waker',
              'the legend of zelda: a link to the past',
              'the legend of zelda: link\'s awakening',
              'the legend of zelda',
              'zelda ii: the adventure of link'
            ],
            'mario': [
              'super mario 64',
              'super mario odyssey',
              'super mario world',
              'super mario bros.',
              'super mario sunshine',
              'super mario galaxy',
              'super mario bros. 3',
              'mario kart 64',
              'paper mario'
            ],
            'sonic': [
              'sonic the hedgehog',
              'sonic the hedgehog 2',
              'sonic the hedgehog 3',
              'sonic & knuckles',
              'sonic adventure',
              'sonic adventure 2',
              'sonic mania'
            ],
            'metroid': [
              'super metroid',
              'metroid prime',
              'metroid fusion',
              'metroid dread'
            ],
            'pokemon': [
              'pokemon red',
              'pokemon blue',
              'pokemon yellow',
              'pokemon gold',
              'pokemon silver',
              'pokemon ruby',
              'pokemon sapphire'
            ]
          };
          
          // Détecter les franchises recherchées
          let targetFranchise: keyof typeof iconicTitles | null = null;
          for (const franchise of Object.keys(iconicTitles) as Array<keyof typeof iconicTitles>) {
            if (queryLower.includes(franchise)) {
              targetFranchise = franchise;
              break;
            }
          }
          
          if (targetFranchise) {
            const aIsIconic = iconicTitles[targetFranchise].includes(aName);
            const bIsIconic = iconicTitles[targetFranchise].includes(bName);
            
            if (aIsIconic && !bIsIconic) return -1;
            if (!aIsIconic && bIsIconic) return 1;
          }
          
          // 2. Correspondance exacte du nom
          if (aName === queryLower && bName !== queryLower) return -1;
          if (aName !== queryLower && bName === queryLower) return 1;
          
          // 3. Commence par la requête
          const aStartsWith = aName.startsWith(queryLower);
          const bStartsWith = bName.startsWith(queryLower);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // 4. Contient la requête (proche du début prioritaire)
          const aIndex = aName.indexOf(queryLower);
          const bIndex = bName.indexOf(queryLower);
          if (aIndex !== -1 && bIndex === -1) return -1;
          if (aIndex === -1 && bIndex !== -1) return 1;
          if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
            return aIndex - bIndex;
          }
          
          // 5. Par longueur (plus court = plus pertinent)
          return aName.length - bName.length;
        });

        setJeuxSuggeres(sortedResults.slice(0, 10)); // Limiter à 10 résultats
      } else {
        setJeuxSuggeres([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de jeux:', error);
      
      // Fallback : chercher dans les jeux populaires locaux
      const queryLower = query.toLowerCase();
      const jeuxPopulairesCorrespondants = jeuxPopulaires.filter(jeu => 
        (jeu.name || jeu.title || '').toLowerCase().includes(queryLower) ||
        jeu.abbreviation.toLowerCase().includes(queryLower)
      );
      setJeuxSuggeres(jeuxPopulairesCorrespondants);
    }
    setChargementJeux(false);
  };

  // Fonction pour charger les catégories d'un jeu
  const chargerCategories = async (gameId: string) => {
    setChargementCategories(true);
    try {
      const response = await fetch(`http://localhost:5000/api/speedrun/games/${gameId}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        
        // Sélectionner automatiquement la première catégorie ou Any% si disponible
        const categoriesData = data.categories || [];
        if (categoriesData.length > 0) {
          const anyPercent = categoriesData.find((cat: CategorieSpeedrun) => 
            cat.name.toLowerCase().includes('any%')
          );
          const premiereCat = anyPercent || categoriesData[0];
          setNouvelleRace(prev => ({
            ...prev,
            categorie: premiereCat.name,
            categorieId: premiereCat.id
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setCategories([]);
    }
    setChargementCategories(false);
  };

  // Gérer la recherche de jeux avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recherchejeu && recherchejeu.length >= 2) {
        rechercherJeux(recherchejeu);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recherchejeu]);

  // Sélectionner un jeu depuis les suggestions
  const selectionnerJeu = (jeu: JeuSpeedrun) => {
    const nomJeu = jeu.title || jeu.name || 'Jeu inconnu';
    setNouvelleRace(prev => ({
      ...prev,
      jeu: nomJeu,
      jeuId: jeu.id,
      categorie: '',
      categorieId: ''
    }));
    setRechercheJeu(nomJeu);
    setMontrerSuggestions(false);
    setJeuxSuggeres([]);
    
    // Si c'est un jeu populaire prédéfini (fallback), créer des catégories spécifiques
    if (jeu.id.includes('-fallback')) {
      let categoriesParDefaut: CategorieSpeedrun[] = [];
      
      switch (jeu.id) {
        case 'oot-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: 'glitchless', name: 'Glitchless', type: 'full-game' },
            { id: 'all-dungeons', name: 'All Dungeons', type: 'full-game' },
            { id: 'mst', name: 'MST (Medallions/Stones/Trials)', type: 'full-game' },
            { id: 'all-medallions', name: 'All Medallions', type: 'full-game' },
            { id: 'defeat-ganon', name: 'Defeat Ganon', type: 'full-game' },
            { id: 'no-wrong-warp', name: 'No Wrong Warp', type: 'full-game' },
            { id: 'ganonless', name: 'Ganonless', type: 'full-game' },
            { id: '100-percent', name: '100%', type: 'full-game' }
          ];
          break;
          
        case 'sm64-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: '0-star', name: '0 Star', type: 'full-game' },
            { id: '1-star', name: '1 Star', type: 'full-game' },
            { id: '16-star', name: '16 Star', type: 'full-game' },
            { id: '31-star', name: '31 Star', type: 'full-game' },
            { id: '50-star', name: '50 Star', type: 'full-game' },
            { id: '70-star', name: '70 Star', type: 'full-game' },
            { id: '120-star', name: '120 Star', type: 'full-game' },
            { id: 'bup', name: 'BLJ (Backwards Long Jump)', type: 'full-game' },
            { id: 'shindou', name: 'Shindou Edition', type: 'full-game' }
          ];
          break;
          
        case 'botw-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: 'all-shrines', name: 'All Shrines', type: 'full-game' },
            { id: 'all-main-quests', name: 'All Main Quests', type: 'full-game' },
            { id: '100-percent', name: '100%', type: 'full-game' }
          ];
          break;
          
        case 'celeste-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: 'all-red-berries', name: 'All Red Berries', type: 'full-game' },
            { id: 'all-hearts', name: 'All Hearts', type: 'full-game' },
            { id: 'all-cassettes', name: 'All Cassettes', type: 'full-game' }
          ];
          break;
          
        case 'sonic-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: 'all-emeralds', name: 'All Emeralds', type: 'full-game' },
            { id: '100-percent', name: '100%', type: 'full-game' },
            { id: 'glitchless', name: 'Glitchless', type: 'full-game' }
          ];
          break;
          
        case 'smw-fallback':
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: 'all-exits', name: 'All Exits (96)', type: 'full-game' },
            { id: 'small-only', name: 'Small Only', type: 'full-game' },
            { id: 'no-cape', name: 'No Cape', type: 'full-game' }
          ];
          break;
          
        default:
          // Catégories génériques pour les autres jeux
          categoriesParDefaut = [
            { id: 'any-percent', name: 'Any%', type: 'full-game' },
            { id: '100-percent', name: '100%', type: 'full-game' },
            { id: 'glitchless', name: 'Glitchless', type: 'full-game' }
          ];
      }
      
      setCategories(categoriesParDefaut);
      setNouvelleRace(prev => ({
        ...prev,
        categorie: 'Any%',
        categorieId: 'any-percent'
      }));
    } else {
      // Pour les jeux de l'API, charger les vraies catégories
      chargerCategories(jeu.id);
    }
  };

  const creerRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilisateurActuel) return;

    // Validation
    if (!nouvelleRace.jeuId || !nouvelleRace.categorieId) {
      alert('Veuillez sélectionner un jeu et une catégorie valides.');
      return;
    }

    setChargement(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}/api/races`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameName: nouvelleRace.jeu,
          gameId: nouvelleRace.jeuId,
          categoryName: nouvelleRace.categorie,
          categoryId: nouvelleRace.categorieId,
          objective: nouvelleRace.objectif,
          maxParticipants: nouvelleRace.maxParticipants,
          password: nouvelleRace.motDePasse || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Race créée:', data.data);
        
        // Recharger les races depuis l'API
        await chargerRaces();
        
        // Reset le formulaire
        setNouvelleRace({
          jeu: '',
          jeuId: '',
          categorie: '',
          categorieId: '',
          objectif: 'Meilleur temps',
          maxParticipants: 4,
          motDePasse: ''
        });
        setRechercheJeu('');
        setCategories([]);
        setVueActive('parcourir');
        
        alert('Race créée avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la race:', error);
      alert('Erreur lors de la création de la race');
    } finally {
      setChargement(false);
    }
  };

  const rejoindreLaRace = (raceId: string) => {
    if (!utilisateurActuel) return;

    setRaces(races.map(race => {
      if (race.id === raceId && race.participants.length < race.maxParticipants) {
        // Vérifier si l'utilisateur n'est pas déjà participant
        const dejaParticipant = race.participants.some(p => p.id === utilisateurActuel.id);
        
        if (!dejaParticipant) {
          return {
            ...race,
            participants: [
              ...race.participants,
              { id: utilisateurActuel.id, nomUtilisateur: utilisateurActuel.nomUtilisateur, statut: 'inscrit' }
            ]
          };
        }
      }
      return race;
    }));
  };

  const quitterLaRace = (raceId: string) => {
    if (!utilisateurActuel) return;

    setRaces(races.map(race => {
      if (race.id === raceId) {
        const participantsFiltered = race.participants.filter(p => p.id !== utilisateurActuel.id);
        
        // Si c'était le créateur et qu'il n'y a plus personne, supprimer la race
        if (race.creePar === utilisateurActuel.nomUtilisateur && participantsFiltered.length === 0) {
          return null; // Sera filtré plus tard
        }
        
        return {
          ...race,
          participants: participantsFiltered
        };
      }
      return race;
    }).filter(race => race !== null) as Race[]); // Filtrer les races nulles
    
    // Si on quitte la race qu'on regardait, retourner à la vue parcourir
    if (raceSelectionnee && raceSelectionnee.id === raceId) {
      setVueActive('parcourir');
      setRaceSelectionnee(null);
    }
  };

  const supprimerRace = async (raceId: string) => {
    if (!utilisateurActuel) return;
    
    const race = races.find(r => r.id === raceId);
    if (!race || race.creePar !== utilisateurActuel.nomUtilisateur) {
      alert('Vous ne pouvez supprimer que vos propres courses.');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiUrl}/api/races/${raceId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Supprimer localement seulement si l'API confirme
          setRaces(races.filter(r => r.id !== raceId));
          
          // Si on supprime la race qu'on regardait, retourner à la vue parcourir
          if (raceSelectionnee && raceSelectionnee.id === raceId) {
            setVueActive('parcourir');
            setRaceSelectionnee(null);
          }
          
          console.log('✅ Race supprimée avec succès');
        } else {
          console.error('❌ Erreur lors de la suppression:', response.status);
          alert('Erreur lors de la suppression de la course. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('❌ Erreur réseau lors de la suppression:', error);
        alert('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  const changerStatutParticipant = async (raceId: string, nouveauStatut: ParticipantRace['statut']) => {
    if (!utilisateurActuel) return;

    // Appeler l'API pour persister le changement
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      await fetch(`${apiUrl}/api/races/${raceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nouveauStatut })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }

    setRaces(races.map(race => {
      if (race.id === raceId) {
        const participantsMisAJour = race.participants.map(participant => {
          if (participant.id === utilisateurActuel.id) {
            return {
              ...participant,
              statut: nouveauStatut,
              ...(nouveauStatut === 'termine' ? { 
                tempsFin: raceTime * 1000 // Convertir les secondes en millisecondes
              } : {})
            };
          }
          return participant;
        });

        // Mettre à jour le statut de la race si nécessaire
        let nouveauStatutRace = race.statut;
        const tousParticipantsPrets = participantsMisAJour.every(p => p.statut === 'pret');
        const auMoinsUnEnCourse = participantsMisAJour.some(p => p.statut === 'en-course');
        const tousParticipantsTermines = participantsMisAJour.every(p => 
          p.statut === 'termine' || p.statut === 'abandon'
        );
        
        if (tousParticipantsTermines && participantsMisAJour.length > 0 && race.statut === 'en-cours') {
          nouveauStatutRace = 'terminee';
        } else if (tousParticipantsPrets && participantsMisAJour.length >= 2) {
          nouveauStatutRace = 'prete';
        } else if (auMoinsUnEnCourse) {
          nouveauStatutRace = 'en-cours';
        }

        const raceMisAJour = {
          ...race,
          participants: participantsMisAJour,
          statut: nouveauStatutRace,
          ...(nouveauStatutRace === 'en-cours' && !race.heureDebut ? { heureDebut: new Date().toISOString() } : {}),
          ...(nouveauStatutRace === 'terminee' && !race.heureFin ? { heureFin: new Date().toISOString() } : {})
        };

        // Mettre à jour la race sélectionnée si c'est celle-ci
        if (raceSelectionnee && raceSelectionnee.id === raceId) {
          setRaceSelectionnee(raceMisAJour);
          
          // Ajouter un message spécial si la course vient de se terminer
          if (nouveauStatutRace === 'terminee' && race.statut !== 'terminee') {
            const messageFinCourse: MessageChat = {
              id: (Date.now() + 1).toString(),
              nomUtilisateur: 'Système',
              message: '🏁 La course est terminée ! Tous les participants ont fini ou abandonné.',
              horodatage: new Date().toISOString(),
              type: 'systeme'
            };
            
            setTimeout(() => {
              setMessagesChat(prev => [...prev, messageFinCourse]);
            }, 1000);
          }
        }

        // Le statut de la race est automatiquement mis à jour par le backend

        return raceMisAJour;
      }
      return race;
    }));

    // Ajouter un message dans le chat si on est dans la salle
    if (raceSelectionnee && raceSelectionnee.id === raceId) {
      const messageStatut = {
        'pret': 'est prêt !',
        'inscrit': 'n\'est plus prêt',
        'en-course': 'a commencé la course !',
        'termine': 'a terminé la course !',
        'abandon': 'a abandonné'
      };

      const nouveauMessageChat: MessageChat = {
        id: Date.now().toString(),
        nomUtilisateur: 'Système',
        message: `${utilisateurActuel.nomUtilisateur} ${messageStatut[nouveauStatut]}`,
        horodatage: new Date().toISOString(),
        type: 'systeme'
      };
      
      setMessagesChat(prev => [...prev, nouveauMessageChat]);
    }
  };

  const entrerDansLaRace = (race: Race) => {
    setRaceSelectionnee(race);
    setVueActive('course');
    if (utilisateurActuel) {
      setMessagesChat([
        {
          id: '1',
          nomUtilisateur: 'Système',
          message: `${utilisateurActuel.nomUtilisateur} a rejoint la course`,
          horodatage: new Date().toISOString(),
          type: 'systeme'
        }
      ]);
    }
  };

  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !utilisateurActuel) return;
    
    const message: MessageChat = {
      id: Date.now().toString(),
      nomUtilisateur: utilisateurActuel.nomUtilisateur,
      message: nouveauMessage,
      horodatage: new Date().toISOString(),
      type: 'chat'
    };
    
    setMessagesChat([...messagesChat, message]);
    setNouveauMessage('');
  };

  const obtenirBadgeStatut = (statut: Race['statut']) => {
    const configStatut = {
      'en-attente': { couleur: 'bg-blue-600', texte: 'En attente de participants' },
      'prete': { couleur: 'bg-yellow-600', texte: 'Prête à démarrer' },
      'en-cours': { couleur: 'bg-green-600 animate-pulse', texte: 'En cours' },
      'terminee': { couleur: 'bg-gray-600', texte: 'Terminée' }
    };
    
    const config = configStatut[statut];
    return (
      <span className={`px-2 py-1 ${config.couleur} text-white text-xs font-medium rounded`}>
        {config.texte}
      </span>
    );
  };

  const formaterTemps = (millisecondesOuSecondes: number): string => {
    // Détecter si c'est un timestamp (> 1000000000000) ou des secondes/millisecondes
    let millisecondes: number;
    
    if (millisecondesOuSecondes > 1000000000000) {
      // C'est un timestamp, on ne peut pas le convertir en durée sans heure de début
      return "Calcul en cours...";
    } else if (millisecondesOuSecondes > 86400) { // Plus de 24h en secondes
      // C'est probablement des millisecondes
      millisecondes = millisecondesOuSecondes;
    } else {
      // C'est des secondes avec décimales
      millisecondes = millisecondesOuSecondes * 1000;
    }
    
    const totalSecondes = Math.floor(millisecondes / 1000);
    const heures = Math.floor(totalSecondes / 3600);
    const minutes = Math.floor((totalSecondes % 3600) / 60);
    const secondes = totalSecondes % 60;
    const ms = Math.floor(millisecondes % 1000);
    
    if (heures > 0) {
      return `${heures}:${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    } else {
      return `${minutes}:${secondes.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
  };

  const obtenirTempsEcoule = (heureDebut: string): number => {
    return Math.floor((Date.now() - new Date(heureDebut).getTime()) / 1000);
  };



  // Fonction spécialement pour formater les temps finaux des participants
  const formaterTempsFinal = (tempsFin: number): string => {
    // tempsFin est en millisecondes (durée de la course)
    const totalSecondes = Math.floor(tempsFin / 1000);
    const heures = Math.floor(totalSecondes / 3600);
    const minutes = Math.floor((totalSecondes % 3600) / 60);
    const secondes = totalSecondes % 60;
    const millisecondes = Math.floor(tempsFin % 1000);
    
    if (heures > 0) {
      return `${heures}:${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}.${millisecondes.toString().padStart(3, '0')}`;
    } else {
      return `${minutes}:${secondes.toString().padStart(2, '0')}.${millisecondes.toString().padStart(3, '0')}`;
    }
  };

  if (!estAuthentifie) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Connexion requise</h3>
          <p className="text-slate-300 mb-6">Connectez-vous pour rejoindre des courses et vous mesurer à d'autres coureurs</p>
          
          {/* Boutons de redirection */}
          <div className="space-y-4 max-w-md mx-auto">
            <Link href="/login" className="group block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-500/20">
              <div className="flex items-center justify-center space-x-3">
                <span>Se connecter</span>
                <span className="text-sm opacity-75 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
            
            <Link href="/register" className="group block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20">
              <div className="flex items-center justify-center space-x-3">
                <span>Créer un compte</span>
                <span className="text-sm opacity-75 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl blur opacity-50"></div>
              <Link href="/" className="group relative block w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border border-slate-500/30">
                <div className="flex items-center justify-center space-x-3">
                  <span>Retour à l'accueil</span>
                  <span className="text-sm opacity-75 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre de la page */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Courses Speedrun</h1>
        <p className="text-slate-400">Courses de speedrun en direct • Rejoignez ou créez une course pour vous mesurer à d'autres joueurs</p>
      </div>

      {vueActive === 'parcourir' && (
        <>
          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => setVueActive('creer')}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20"
            >
              <span>Créer la Première Course</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </button>
            <button
              onClick={chargerRaces}
              className="group bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-slate-500/30"
            >
              <span>Actualiser</span>
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-2xl font-bold text-white">{races.length}</div>
              <div className="text-slate-400 text-sm">Total des Courses</div>
            </div>
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-2xl font-bold text-green-400">{races.filter(r => r.statut === 'en-cours').length}</div>
              <div className="text-slate-400 text-sm">En Cours</div>
            </div>
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-400">{races.filter(r => r.statut === 'prete').length}</div>
              <div className="text-slate-400 text-sm">Prêtes à Démarrer</div>
            </div>
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-2xl font-bold text-blue-400">{races.filter(r => r.statut === 'en-attente').length}</div>
              <div className="text-slate-400 text-sm">En Attente</div>
            </div>
          </div>

          {/* Liste des courses */}
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-700 px-6 py-3 border-b border-slate-600">
              <h2 className="text-white font-medium">Courses Actuelles</h2>
            </div>
            
            {races.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">🏁</div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune Course Active</h3>
                <p className="text-slate-400 mb-4">Soyez le premier à créer une course !</p>
                <button
                  onClick={() => setVueActive('creer')}
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20"
                >
                  <span>Créer la Première Course</span>
                  <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {races.map((race) => (
                  <div key={race.id} className="p-6 hover:bg-slate-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-medium text-white">{race.jeu}</h3>
                          <span className="text-slate-400">•</span>
                          <span className="text-blue-400">{race.categorie}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-300">{race.objectif}</span>
                          {race.motDePasse && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-yellow-400 text-sm">🔒 Mot de passe</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          {obtenirBadgeStatut(race.statut)}
                          <span className="text-slate-400">
                            Participants: {race.participants.length}/{race.maxParticipants}
                          </span>
                          <span className="text-slate-400">
                            Créée par: {race.creePar}
                          </span>
                          {race.statut === 'en-cours' && race.heureDebut && (
                            <span className="text-green-400 font-mono">
                              Temps: {formaterTemps(obtenirTempsEcoule(race.heureDebut))}
                            </span>
                          )}
                        </div>

                        {/* Participants */}
                        {race.participants.length > 0 && (
                          <div className="mt-3 flex items-center space-x-2">
                            <span className="text-slate-400 text-sm">Coureurs:</span>
                            {race.participants.map((participant, index) => (
                              <span
                                key={participant.id}
                                className={`text-sm px-2 py-1 rounded ${
                                  participant.statut === 'en-course' ? 'bg-green-900 text-green-300' :
                                  participant.statut === 'pret' ? 'bg-yellow-900 text-yellow-300' :
                                  participant.statut === 'termine' ? 'bg-blue-900 text-blue-300' :
                                  participant.statut === 'abandon' ? 'bg-red-900 text-red-300' :
                                  'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {participant.nomUtilisateur}
                                {participant.urlStream && ' 📺'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {race.participants.some(p => p.id === utilisateurActuel?.id) ? (
                          <>
                            <button
                              onClick={() => entrerDansLaRace(race)}
                              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-500/20"
                            >
                              <span>Entrer dans la Course</span>
                            </button>
                            <button
                              onClick={() => quitterLaRace(race.id)}
                              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/20"
                            >
                              <span>Quitter</span>
                            </button>
                          </>
                        ) : (
                          race.participants.length < race.maxParticipants && race.statut !== 'terminee' && (
                            <button
                              onClick={() => rejoindreLaRace(race.id)}
                              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20"
                            >
                              <span>Rejoindre la Course</span>
                            </button>
                          )
                        )}
                        
                        {/* Bouton Spectateur pour courses en cours ou terminées */}
                        {(race.statut === 'en-cours' || race.statut === 'terminee') && (
                          <button
                            onClick={() => entrerDansLaRace(race)}
                            className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 border border-purple-500/20"
                          >
                            <span>Spectateur</span>
                          </button>
                        )}
                        
                        {/* Bouton Supprimer pour le créateur */}
                        {race.creePar === utilisateurActuel?.nomUtilisateur && (
                          <button
                            onClick={() => supprimerRace(race.id)}
                            className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-500/30"
                            title="Supprimer cette course"
                          >
                            <span>🗑️</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {vueActive === 'creer' && (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Créer une Nouvelle Course</h2>
            <button
              onClick={() => {
                setVueActive('parcourir');
                setRechercheJeu('');
                setJeuxSuggeres([]);
                setCategories([]);
                setNouvelleRace({
                  jeu: '',
                  jeuId: '',
                  categorie: '',
                  categorieId: '',
                  objectif: 'Meilleur temps',
                  maxParticipants: 4,
                  motDePasse: ''
                });
              }}
              className="text-slate-400 hover:text-white"
            >
              ← Retour aux Courses
            </button>
          </div>
          
          <form onSubmit={creerRace} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection du jeu avec autocomplétion */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Jeu * <span className="text-xs text-slate-400">(depuis speedrun.com)</span>
                </label>
                <input
                  type="text"
                  required
                  value={recherchejeu}
                  onChange={(e) => {
                    setRechercheJeu(e.target.value);
                    setMontrerSuggestions(true);
                    if (!e.target.value) {
                      setNouvelleRace(prev => ({ ...prev, jeu: '', jeuId: '', categorie: '', categorieId: '' }));
                      setCategories([]);
                    }
                  }}
                  onFocus={() => setMontrerSuggestions(true)}
                  placeholder="Tapez pour rechercher un jeu..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Suggestions */}
                {montrerSuggestions && (recherchejeu.length >= 2 || jeuxSuggeres.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {chargementJeux && (
                      <div className="p-3 text-slate-400 text-center">
                        <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                        Recherche en cours...
                      </div>
                    )}
                    
                    {!chargementJeux && jeuxSuggeres.length === 0 && recherchejeu.length >= 2 && (
                      <div className="p-3 text-slate-400 text-center">
                        <div className="mb-2">Aucun jeu trouvé pour "{recherchejeu}"</div>
                        <div className="text-xs text-slate-500">
                          💡 <strong>Jeux populaires à essayer :</strong>
                          <br />
                          • <strong>mario</strong> - Super Mario 64, Mario Kart, etc.
                          <br />
                          • <strong>oot</strong> - The Legend of Zelda: Ocarina of Time
                          <br />
                          • <strong>botw</strong> - Zelda: Breath of the Wild
                          <br />
                          • <strong>sm64</strong> - Super Mario 64
                          <br />
                          • <strong>sonic</strong> - Sonic the Hedgehog
                          <br />
                          • <strong>celeste</strong> - Celeste
                          <br />
                          • <strong>smw</strong> - Super Mario World
                          <br />
                          <br />
                          <span className="text-blue-400">Tip: Utilisez les abréviations comme "oot", "sm64", "botw"</span>
                        </div>
                      </div>
                    )}
                    
                    {jeuxSuggeres.map((jeu) => (
                      <button
                        key={jeu.id}
                        type="button"
                        onClick={() => selectionnerJeu(jeu)}
                        className="w-full text-left p-3 hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          {(jeu.coverImage || jeu.cover) ? (
                            <img 
                              src={jeu.coverImage || jeu.cover} 
                              alt={jeu.title || jeu.name} 
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                // Masquer l'image si elle ne se charge pas
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center text-xs text-slate-400">
                              🎮
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {jeu.title || jeu.name}
                              {jeu.id.includes('-fallback') && (
                                <span className="ml-2 text-xs bg-blue-600 text-blue-100 px-2 py-0.5 rounded">
                                  Populaire
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs truncate">{jeu.abbreviation}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sélection de la catégorie */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Catégorie *
                  {chargementCategories && (
                    <span className="text-xs text-blue-400 ml-2">
                      <div className="animate-spin inline-block w-3 h-3 border border-blue-400 border-t-transparent rounded-full mr-1"></div>
                      Chargement...
                    </span>
                  )}
                </label>
                <select
                  value={nouvelleRace.categorieId}
                  onChange={(e) => {
                    const categorieSelectionnee = categories.find(cat => cat.id === e.target.value);
                    setNouvelleRace({
                      ...nouvelleRace, 
                      categorieId: e.target.value,
                      categorie: categorieSelectionnee?.name || ''
                    });
                  }}
                  disabled={categories.length === 0}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {categories.length === 0 ? 'Sélectionnez d\'abord un jeu' : 'Choisir une catégorie'}
                  </option>
                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.name} {categorie.type === 'per-level' ? '(Per Level)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objectif
                </label>
                <select
                  value={nouvelleRace.objectif}
                  onChange={(e) => setNouvelleRace({...nouvelleRace, objectif: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Meilleur temps">Meilleur temps</option>
                  <option value="Premier au score">Premier au score</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Participants
                </label>
                <select
                  value={nouvelleRace.maxParticipants}
                  onChange={(e) => setNouvelleRace({...nouvelleRace, maxParticipants: parseInt(e.target.value)})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe (Optionnel)
              </label>
              <input
                type="text"
                value={nouvelleRace.motDePasse}
                onChange={(e) => setNouvelleRace({...nouvelleRace, motDePasse: e.target.value})}
                placeholder="Laisser vide pour une course publique"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setVueActive('parcourir');
                  setRechercheJeu('');
                  setJeuxSuggeres([]);
                  setCategories([]);
                  setNouvelleRace({
                    jeu: '',
                    jeuId: '',
                    categorie: '',
                    categorieId: '',
                    objectif: 'Meilleur temps',
                    maxParticipants: 4,
                    motDePasse: ''
                  });
                }}
                className="group bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-slate-500/30"
              >
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={!nouvelleRace.jeuId || !nouvelleRace.categorieId}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
              >
                <span>Créer la Course</span>
                {nouvelleRace.jeuId && nouvelleRace.categorieId && (
                  <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {vueActive === 'course' && raceSelectionnee && (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          {/* ⏱️ TIMER EN TEMPS RÉEL - Section principale */}
          {timerState !== 'waiting' && (
            <div className={`px-6 py-8 text-center border-b border-slate-600 ${
              timerState === 'countdown' ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50' :
              timerState === 'racing' ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50' :
              'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
            }`}>
              {timerState === 'countdown' && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold">🏁 Course commence dans...</h3>
                  <div className={`text-8xl font-black font-mono ${
                    timeRemaining <= 3 ? 'text-red-400 animate-pulse' : 'text-orange-400'
                  }`}>
                    {timeRemaining}
                  </div>
                  <p className="text-slate-300">Préparez-vous ! La course démarre automatiquement.</p>
                </div>
              )}
              
              {timerState === 'racing' && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold">🚀 Course en cours !</h3>
                  <div className="text-6xl font-black font-mono text-green-400">
                    {formatRaceTime(raceTime)}
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={finishRace}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      🏁 Finir la course
                    </button>
                    <button
                      onClick={handleAbandonClick}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                      ❌ Abandonner
                    </button>
                  </div>
                </div>
              )}
              
              {timerState === 'finished' && (
                <div className="space-y-4">
                  <h3 className="text-white text-xl font-bold">🎉 Course terminée !</h3>
                  <div className="text-5xl font-black font-mono text-blue-400">
                    {formatRaceTime(raceTime)}
                  </div>
                  <p className="text-slate-300">Félicitations ! Votre temps a été enregistré.</p>
                  <button
                    onClick={handleNewRaceClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    🔄 Nouvelle course
                  </button>
                </div>
              )}
            </div>
          )}

          {/* En-tête de la course */}
          <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{raceSelectionnee.jeu}</h2>
                <div className="flex items-center space-x-4 text-sm text-slate-300 mt-1">
                  <span>{raceSelectionnee.categorie}</span>
                  <span>•</span>
                  <span>{raceSelectionnee.objectif}</span>
                  <span>•</span>
                  {obtenirBadgeStatut(raceSelectionnee.statut)}
                  {raceSelectionnee.statut === 'en-cours' && raceSelectionnee.heureDebut && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 font-mono">
                        {formaterTemps(obtenirTempsEcoule(raceSelectionnee.heureDebut))}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setVueActive('parcourir')}
                className="text-slate-400 hover:text-white"
              >
                ← Retour aux Courses
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-96">
            {/* Participants */}
            <div className="lg:col-span-2 p-6 border-r border-slate-700">
              <h3 className="font-medium text-white mb-4">Participants ({raceSelectionnee.participants.length}/{raceSelectionnee.maxParticipants})</h3>
              <div className="space-y-3">
                {raceSelectionnee.participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-slate-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{participant.nomUtilisateur}</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          participant.statut === 'en-course' ? 'bg-green-900 text-green-300' :
                          participant.statut === 'pret' ? 'bg-yellow-900 text-yellow-300' :
                          participant.statut === 'termine' ? 'bg-blue-900 text-blue-300' :
                          participant.statut === 'abandon' ? 'bg-red-900 text-red-300' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {participant.statut}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {participant.tempsFin && (
                        <span className="font-mono text-green-400">
                          {formaterTempsFinal(participant.tempsFin)}
                        </span>
                      )}
                      {participant.urlStream && (
                        <a
                          href={`https://${participant.urlStream}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300"
                        >
                          📺
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions de course */}
              <div className="mt-6 space-y-3">
                {/* Actions principales pour les participants */}
                {raceSelectionnee.participants.some(p => p.id === utilisateurActuel?.id) && (
                  <div className="flex space-x-2">
                    {/* Toggle Prêt/Pas Prêt */}
                    {raceSelectionnee.participants.find(p => p.id === utilisateurActuel?.id)?.statut === 'pret' ? (
                      <button 
                        onClick={() => changerStatutParticipant(raceSelectionnee.id, 'inscrit')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Pas Prêt
                      </button>
                    ) : (
                      <button 
                        onClick={() => changerStatutParticipant(raceSelectionnee.id, 'pret')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Prêt
                      </button>
                    )}
                    
                    {/* Commencer (si prêt) */}
                    {raceSelectionnee.participants.find(p => p.id === utilisateurActuel?.id)?.statut === 'pret' && timerState === 'waiting' && (
                      <button 
                        onClick={() => {
                          startCountdown();
                          changerStatutParticipant(raceSelectionnee.id, 'en-course');
                        }}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 animate-pulse"
                      >
                        🏁 DÉMARRER LA COURSE
                      </button>
                    )}

                    {/* Timer Info quand en cours */}
                    {timerState === 'countdown' && (
                      <div className="flex items-center space-x-2 text-orange-400">
                        <span className="animate-spin">⏱️</span>
                        <span className="font-mono font-bold">Course démarre dans {timeRemaining}s...</span>
                      </div>
                    )}

                    {timerState === 'racing' && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <span className="animate-pulse">🏃</span>
                        <span className="font-mono font-bold">Course en cours : {formatRaceTime(raceTime)}</span>
                      </div>
                    )}
                    
                    {/* Note: Les boutons Terminé et Abandon sont maintenant dans la section timer principale */}
                  </div>
                )}
                
                {/* Actions secondaires */}
                <div className="flex space-x-2 pt-2 border-t border-slate-600">
                  {/* Quitter la course (pour les participants) */}
                  {raceSelectionnee.participants.some(p => p.id === utilisateurActuel?.id) && (
                    <button 
                      onClick={() => quitterLaRace(raceSelectionnee.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Quitter la Course
                    </button>
                  )}
                  
                  {/* Supprimer la course (uniquement pour le créateur) */}
                  {raceSelectionnee.creePar === utilisateurActuel?.nomUtilisateur && (
                    <button 
                      onClick={() => supprimerRace(raceSelectionnee.id)}
                      className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded text-xs"
                    >
                      🗑️ Supprimer la Course
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="flex flex-col">
              <div className="bg-slate-700 px-4 py-2 border-b border-slate-600">
                <h3 className="font-medium text-white">Chat de Course</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messagesChat.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    {msg.type === 'systeme' ? (
                      <div className="text-yellow-400 italic">* {msg.message}</div>
                    ) : (
                      <div>
                        <span className="text-blue-400 font-medium">{msg.nomUtilisateur}:</span>
                        <span className="text-white ml-2">{msg.message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()}
                    placeholder="Tapez un message..."
                    className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={envoyerMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 