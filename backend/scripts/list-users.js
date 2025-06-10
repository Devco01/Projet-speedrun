const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📋 Utilisateurs actuels (' + users.length + ' trouvé(s)):');
    console.log('');
    
    if (users.length === 0) {
      console.log('   Aucun utilisateur trouvé');
    } else {
      users.forEach((user, index) => {
        const roleIcon = user.role === 'admin' ? '👑' : '👤';
        console.log(`${index + 1}. ${roleIcon} ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🔄 Récupération des utilisateurs...');
listUsers(); 