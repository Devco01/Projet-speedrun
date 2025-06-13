const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function promoteUserToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    console.log('✅ Utilisateur promu administrateur:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Rôle: ${user.role}`);
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ Erreur: Utilisateur non trouvé avec l\'email:', email);
    } else {
      console.error('❌ Erreur lors de la promotion:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node promote-admin.js <email>');
  console.error('   Exemple: node promote-admin.js admin@speedrun.com');
  process.exit(1);
}

console.log(`🔄 Promotion de l'utilisateur ${email} au rôle admin...`);
promoteUserToAdmin(email); 