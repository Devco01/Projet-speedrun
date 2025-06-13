const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testLogin(email, password) {
  try {
    console.log(`🔐 Test de connexion pour ${email}...`);
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        password: true, 
        role: true 
      }
    });

    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }

    console.log(`👤 Utilisateur trouvé: ${user.username} (${user.role})`);

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      console.error('❌ Mot de passe incorrect');
      return;
    }

    console.log('✅ Mot de passe correct !');

    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || '951357852456',
      { expiresIn: '24h' }
    );

    console.log('');
    console.log('🎯 TOKEN JWT VALIDE :');
    console.log(token);
    console.log('');
    console.log('📋 Informations utilisateur :');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Rôle: ${user.role}`);
    console.log('');
          console.log('✅ Connexion réussie ! Vous pouvez maintenant accéder au dashboard admin.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Usage: node test-login.js <email> <password>');
  console.error('   Exemple: node test-login.js pepsiman15.1@gmail.com votre_mot_de_passe');
  process.exit(1);
}

testLogin(email, password); 