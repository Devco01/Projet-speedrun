// Données de test pour la plateforme de speedruns

export interface MockUser {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export interface MockGame {
  id: string;
  title: string;
  cover?: string;
  description: string;
  platform: string[];
  genre: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  createdAt: string;
}

export interface MockCategory {
  id: string;
  name: string;
  rules: string;
  gameId: string;
}

export interface MockRun {
  id: string;
  time: number; // en millisecondes
  videoUrl?: string;
  submittedAt: string;
  isVerified: boolean;
  verifiedAt?: string;
  userId: string;
  gameId: string;
  categoryId: string;
}

export interface MockEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  isOnline: boolean;
  participants: number;
  createdAt: string;
}

export interface MockComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  runId: string;
}

// Données utilisateurs de test
export const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "SpeedRunner123",
    email: "speedrunner@example.com",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: "Passionné de speedrun depuis 5 ans, spécialisé dans les plateformers.",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    username: "FastGamer",
    email: "fastgamer@example.com",
    profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
    bio: "Records holder en Any% sur plusieurs jeux rétro.",
    createdAt: "2024-02-20T14:30:00Z"
  },
  {
    id: "3",
    username: "RetroRunner",
    email: "retro@example.com",
    bio: "Fan des jeux 16-bit, toujours à la recherche du run parfait.",
    createdAt: "2024-03-10T09:15:00Z"
  }
];

// Données jeux de test
export const mockGames: MockGame[] = [
  {
    id: "1",
    title: "Super Mario Bros.",
    cover: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300",
    description: "Le classique platformer de Nintendo qui a révolutionné l'industrie du jeu vidéo.",
    platform: ["NES", "Switch"],
    genre: ["Platformer", "Action"],
    developer: "Nintendo",
    publisher: "Nintendo",
    releaseDate: "1985-09-13",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    title: "The Legend of Zelda: Ocarina of Time",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
    description: "Un RPG d'action épique qui a défini les standards des jeux 3D.",
    platform: ["N64", "3DS", "Switch"],
    genre: ["RPG", "Action", "Adventure"],
    developer: "Nintendo EAD",
    publisher: "Nintendo",
    releaseDate: "1998-11-21",
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    title: "Celeste",
    cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
    description: "Un platformer moderne challengeant avec une histoire touchante sur la santé mentale.",
    platform: ["PC", "Switch", "PS4", "Xbox One"],
    genre: ["Platformer", "Indie"],
    developer: "Maddy Makes Games",
    publisher: "Maddy Makes Games",
    releaseDate: "2018-01-25",
    createdAt: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    title: "Minecraft",
    cover: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300",
    description: "Le jeu de construction et de survie qui a conquis le monde.",
    platform: ["PC", "PS4", "Xbox One", "Switch", "Mobile"],
    genre: ["Sandbox", "Survival", "Creative"],
    developer: "Mojang Studios",
    publisher: "Microsoft",
    releaseDate: "2011-11-18",
    createdAt: "2024-01-04T00:00:00Z"
  }
];

// Données catégories de test
export const mockCategories: MockCategory[] = [
  { id: "1", name: "Any%", rules: "Finir le jeu le plus rapidement possible, glitches autorisés.", gameId: "1" },
  { id: "2", name: "100%", rules: "Finir le jeu avec tous les collectibles et niveaux.", gameId: "1" },
  { id: "3", name: "Any%", rules: "Finir le jeu principal le plus vite possible.", gameId: "2" },
  { id: "4", name: "All Dungeons", rules: "Compléter tous les donjons avant de finir le jeu.", gameId: "2" },
  { id: "5", name: "Any%", rules: "Atteindre le sommet de la montagne.", gameId: "3" },
  { id: "6", name: "All Berries", rules: "Collecter toutes les fraises dorées.", gameId: "3" },
  { id: "7", name: "Any%", rules: "Tuer l'Ender Dragon le plus rapidement possible.", gameId: "4" },
  { id: "8", name: "Set Seed", rules: "Utiliser une graine spécifique pour la course.", gameId: "4" }
];

// Données runs de test
export const mockRuns: MockRun[] = [
  {
    id: "1",
    time: 294000, // 4:54
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    submittedAt: "2024-06-01T15:30:00Z",
    isVerified: true,
    verifiedAt: "2024-06-01T16:00:00Z",
    userId: "1",
    gameId: "1",
    categoryId: "1"
  },
  {
    id: "2",
    time: 1140000, // 19:00
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    submittedAt: "2024-06-02T10:15:00Z",
    isVerified: true,
    verifiedAt: "2024-06-02T11:00:00Z",
    userId: "2",
    gameId: "1",
    categoryId: "2"
  },
  {
    id: "3",
    time: 1020000, // 17:00
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    submittedAt: "2024-06-03T14:45:00Z",
    isVerified: false,
    userId: "3",
    gameId: "2",
    categoryId: "3"
  },
  {
    id: "4",
    time: 1800000, // 30:00
    submittedAt: "2024-06-04T09:20:00Z",
    isVerified: true,
    verifiedAt: "2024-06-04T10:00:00Z",
    userId: "1",
    gameId: "3",
    categoryId: "5"
  }
];

// Données événements de test - SUPPRIMÉES
// Les événements sont maintenant créés dynamiquement par les utilisateurs
export const mockEvents: MockEvent[] = [];

// Données commentaires de test
export const mockComments: MockComment[] = [
  {
    id: "1",
    content: "Incroyable run ! Cette stratégie dans le niveau 4-2 est géniale.",
    createdAt: "2024-06-01T16:30:00Z",
    userId: "2",
    runId: "1"
  },
  {
    id: "2",
    content: "GG ! Tu peux encore gratter quelques secondes sur le boss final.",
    createdAt: "2024-06-01T17:00:00Z",
    userId: "3",
    runId: "1"
  },
  {
    id: "3",
    content: "Excellent temps ! J'aimerais voir une version avec commentaires.",
    createdAt: "2024-06-02T11:30:00Z",
    userId: "1",
    runId: "2"
  }
];

// Fonction pour formater le temps en format lisible
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 10).toString().padStart(2, '0')}`;
  } else {
    return `${seconds}.${Math.floor(ms / 10).toString().padStart(2, '0')}`;
  }
}

// Fonction pour obtenir un utilisateur par ID
export function getUserById(id: string): MockUser | undefined {
  return mockUsers.find(user => user.id === id);
}

// Fonction pour obtenir un jeu par ID
export function getGameById(id: string): MockGame | undefined {
  return mockGames.find(game => game.id === id);
}

// Fonction pour obtenir une catégorie par ID
export function getCategoryById(id: string): MockCategory | undefined {
  return mockCategories.find(category => category.id === id);
}

// Fonction pour obtenir les runs d'un jeu
export function getRunsByGameId(gameId: string): MockRun[] {
  return mockRuns.filter(run => run.gameId === gameId);
}

// Fonction pour obtenir les runs d'un utilisateur
export function getRunsByUserId(userId: string): MockRun[] {
  return mockRuns.filter(run => run.userId === userId);
}

// Fonction pour obtenir les commentaires d'un run
export function getCommentsByRunId(runId: string): MockComment[] {
  return mockComments.filter(comment => comment.runId === runId);
} 