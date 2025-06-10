const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRole() {
  try {
    console.log('🔍 Test du champ role...');
    
    // Essayer de sélectionner le champ role
    const result = await prisma.user.findFirst({
      select: { 
        id: true,
        email: true,
        role: true 
      }
    });
    
    console.log('✅ Champ role disponible dans Prisma !');
    console.log('   Résultat:', result || 'Aucun utilisateur trouvé');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRole(); 