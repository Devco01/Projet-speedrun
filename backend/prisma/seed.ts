import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Créer des utilisateurs de test
  const user1 = await prisma.user.upsert({
    where: { email: 'speedrunner@example.com' },
    update: {},
    create: {
      username: 'SpeedRunner123',
      email: 'speedrunner@example.com',
      password: '$2b$12$abc123', // Hash fictif
      bio: 'Passionné de speedrun depuis 5 ans, spécialisé dans les plateformers.',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'fastgamer@example.com' },
    update: {},
    create: {
      username: 'FastGamer',
      email: 'fastgamer@example.com',
      password: '$2b$12$def456', // Hash fictif
      bio: 'Records holder en Any% sur plusieurs jeux rétro.',
    },
  });

  // Créer des jeux
  const game1 = await prisma.game.upsert({
    where: { id: 'game-1' },
    update: {},
    create: {
      id: 'game-1',
      title: 'Super Mario Bros.',
      description: 'Le classique platformer de Nintendo qui a révolutionné l\'industrie du jeu vidéo.',
      platform: ['NES', 'Switch'],
      genre: ['Platformer', 'Action'],
      developer: 'Nintendo',
      publisher: 'Nintendo',
      releaseDate: new Date('1985-09-13'),
    },
  });

  const game2 = await prisma.game.upsert({
    where: { id: 'game-2' },
    update: {},
    create: {
      id: 'game-2',
      title: 'The Legend of Zelda: Ocarina of Time',
      description: 'Un RPG d\'action épique qui a défini les standards des jeux 3D.',
      platform: ['N64', '3DS', 'Switch'],
      genre: ['RPG', 'Action', 'Adventure'],
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      releaseDate: new Date('1998-11-21'),
    },
  });

  // Créer des catégories
  const category1 = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'Any%',
      rules: 'Finir le jeu le plus rapidement possible, glitches autorisés.',
      gameId: game1.id,
    },
  });

  const category2 = await prisma.category.upsert({
    where: { id: 'cat-2' },
    update: {},
    create: {
      id: 'cat-2',
      name: 'Any%',
      rules: 'Finir le jeu principal le plus vite possible.',
      gameId: game2.id,
    },
  });

  // Créer des runs
  await prisma.run.upsert({
    where: { id: 'run-1' },
    update: {},
    create: {
      id: 'run-1',
      time: 294, // 4:54 en secondes
      videoUrl: 'https://www.youtube.com/watch?v=example',
      isVerified: true,
      verifiedAt: new Date(),
      userId: user1.id,
      gameId: game1.id,
      categoryId: category1.id,
    },
  });

  await prisma.run.upsert({
    where: { id: 'run-2' },
    update: {},
    create: {
      id: 'run-2',
      time: 1020, // 17:00 en secondes
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      isVerified: false,
      userId: user2.id,
      gameId: game2.id,
      categoryId: category2.id,
    },
  });

  // Créer des événements
  await prisma.event.upsert({
    where: { id: 'event-1' },
    update: {},
    create: {
      id: 'event-1',
      name: 'Summer Games Done Quick 2024',
      description: 'Le marathon de speedrun le plus populaire de l\'été !',
      startDate: new Date('2024-07-15T12:00:00Z'),
      endDate: new Date('2024-07-22T06:00:00Z'),
      location: 'Minneapolis, MN',
      isOnline: false,
    },
  });

  await prisma.event.upsert({
    where: { id: 'event-2' },
    update: {},
    create: {
      id: 'event-2',
      name: 'ESA Winter 2024',
      description: 'European Speedrunner Assembly - Le plus grand événement speedrun européen.',
      startDate: new Date('2024-12-20T18:00:00Z'),
      endDate: new Date('2024-12-27T22:00:00Z'),
      isOnline: true,
    },
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log('📊 Données créées :');
  console.log('   - 2 utilisateurs');
  console.log('   - 2 jeux');
  console.log('   - 2 catégories');
  console.log('   - 2 runs');
  console.log('   - 2 événements');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 