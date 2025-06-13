const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function changeUserPassword(email, newPassword) {
  try {
    console.log(`🔐 Changement du mot de passe pour ${email}...`);
    
    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, email: true, username: true, role: true }
    });

    if (!existingUser) {
      console.error('❌ Utilisateur non trouvé avec l\'email:', email);
      return;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    console.log('✅ Mot de passe changé avec succès !');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Rôle: ${updatedUser.role}`);
    console.log(`   Nouveau mot de passe: ${newPassword}`);
    console.log('');
    console.log('🎯 Vous pouvez maintenant vous connecter avec :');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Mot de passe: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du changement de mot de passe:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de ligne de commande
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Usage: node change-password.js <email> <nouveau_mot_de_passe>');
  console.error('   Exemple: node change-password.js pepsiman15.1@gmail.com monNouveauMotDePasse123');
  process.exit(1);
}

changeUserPassword(email, newPassword); 