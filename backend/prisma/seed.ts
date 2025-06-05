import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyage des données existantes
  await prisma.comment.deleteMany();
  await prisma.run.deleteMany();
  await prisma.category.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();

  // Création des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@speedrun.com',
      password: hashedPassword,
      bio: 'Administrateur de la plateforme',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    }
  });

  const speedrunner1 = await prisma.user.create({
    data: {
      username: 'FastRunner',
      email: 'fast@speedrun.com',
      password: hashedPassword,
      bio: 'Speedrunner passionné depuis 5 ans',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    }
  });

  const speedrunner2 = await prisma.user.create({
    data: {
      username: 'UltraSpeed',
      email: 'ultra@speedrun.com',
      password: hashedPassword,
      bio: 'Champion du monde Mario Kart',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b070?w=100&h=100&fit=crop'
    }
  });

  // Création des jeux
  const mario64 = await prisma.game.create({
    data: {
      title: 'Super Mario 64',
      cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m7o.webp',
      description: 'Le classique de Nintendo 64 qui a révolutionné le speedrunning',
      releaseDate: new Date('1996-06-23'),
      platform: ['Nintendo 64', 'Nintendo DS'],
      genre: ['Platformer', '3D'],
      developer: 'Nintendo',
      publisher: 'Nintendo'
    }
  });

  const zelda = await prisma.game.create({
    data: {
      title: 'The Legend of Zelda: Ocarina of Time',
      cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co23l6.webp',
      description: 'L\'aventure épique de Link dans Hyrule',
      releaseDate: new Date('1998-11-21'),
      platform: ['Nintendo 64', 'Nintendo 3DS'],
      genre: ['Action', 'Adventure'],
      developer: 'Nintendo',
      publisher: 'Nintendo'
    }
  });

  const minecraft = await prisma.game.create({
    data: {
      title: 'Minecraft',
      cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.webp',
      description: 'Le jeu de construction et de survie le plus populaire au monde',
      releaseDate: new Date('2011-11-18'),
      platform: ['PC', 'Console', 'Mobile'],
      genre: ['Sandbox', 'Survival'],
      developer: 'Mojang Studios',
      publisher: 'Microsoft'
    }
  });

  // Création des catégories
  const mario64AnyPercent = await prisma.category.create({
    data: {
      name: 'Any%',
      rules: 'Terminer le jeu le plus rapidement possible sans restrictions particulières',
      gameId: mario64.id
    }
  });

  const mario64Stars70 = await prisma.category.create({
    data: {
      name: '70 Stars',
      rules: 'Collecter exactement 70 étoiles avant de battre Bowser',
      gameId: mario64.id
    }
  });

  const zeldaAnyPercent = await prisma.category.create({
    data: {
      name: 'Any%',
      rules: 'Terminer le jeu le plus rapidement possible',
      gameId: zelda.id
    }
  });

  const minecraftAnyPercent = await prisma.category.create({
    data: {
      name: 'Any% Glitchless',
      rules: 'Battre l\'Ender Dragon sans utiliser de glitches majeurs',
      gameId: minecraft.id
    }
  });

  // Création des speedruns
  await prisma.run.create({
    data: {
      time: 936, // 15min 36s
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      isVerified: true,
      verifiedAt: new Date(),
      userId: speedrunner1.id,
      gameId: mario64.id,
      categoryId: mario64AnyPercent.id
    }
  });

  await prisma.run.create({
    data: {
      time: 2847, // 47min 27s
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      isVerified: true,
      verifiedAt: new Date(),
      userId: speedrunner2.id,
      gameId: mario64.id,
      categoryId: mario64Stars70.id
    }
  });

  await prisma.run.create({
    data: {
      time: 1021, // 17min 01s
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      isVerified: false,
      userId: speedrunner1.id,
      gameId: zelda.id,
      categoryId: zeldaAnyPercent.id
    }
  });

  await prisma.run.create({
    data: {
      time: 1456, // 24min 16s
      videoUrl: 'https://www.youtube.com/watch?v=example4',
      isVerified: true,
      verifiedAt: new Date(),
      userId: speedrunner2.id,
      gameId: minecraft.id,
      categoryId: minecraftAnyPercent.id
    }
  });

  // Création des événements
  await prisma.event.create({
    data: {
      name: 'Summer Games Done Quick 2024',
      description: 'Le plus grand marathon de speedrun caritatif au monde',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-22'),
      website: 'https://gamesdonequick.com/',
      location: 'Bloomington, Minnesota',
      isOnline: false
    }
  });

  await prisma.event.create({
    data: {
      name: 'ESA Winter 2024',
      description: 'European Speedrunner Assembly - Marathon européen',
      startDate: new Date('2024-02-17'),
      endDate: new Date('2024-02-25'),
      website: 'https://esamarathon.com/',
      location: 'Malmö, Suède',
      isOnline: false
    }
  });

  await prisma.event.create({
    data: {
      name: 'Online Speedrun Marathon',
      description: 'Marathon en ligne organisé par la communauté',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-07'),
      website: 'https://example.com/marathon',
      isOnline: true
    }
  });

  // Création des commentaires
  await prisma.comment.create({
    data: {
      content: 'Run incroyable ! Les tricks dans Bob-omb Battlefield étaient parfaits.',
      userId: speedrunner2.id,
      runId: (await prisma.run.findFirst({ where: { time: 936 } }))!.id
    }
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log(`👤 Utilisateurs créés: 3`);
  console.log(`🎮 Jeux créés: 3`);
  console.log(`📂 Catégories créées: 4`);
  console.log(`🏃 Speedruns créés: 4`);
  console.log(`📅 Événements créés: 3`);
  console.log(`💬 Commentaires créés: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 