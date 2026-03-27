async function main() {
  console.log("🚀 Deploying SkillLedger contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const SkillLedger = await ethers.getContractFactory("SkillLedger");
  const skillLedger = await SkillLedger.deploy(deployer.address);

  await skillLedger.waitForDeployment();

  const contractAddress = await skillLedger.getAddress();
  
  console.log("\n✅ SkillLedger deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", deployer.address);

  // Grant INSTITUTION_ROLE to deployer for testing
  console.log("\n⏳ Granting INSTITUTION_ROLE to deployer...");
  const tx = await skillLedger.addInstitution(deployer.address);
  await tx.wait();
  console.log("✅ INSTITUTION_ROLE granted!\n");

  console.log("═══════════════════════════════════════════════════");
  console.log("📋 COPY THIS TO YOUR BACKEND .env FILE:");
  console.log("═══════════════════════════════════════════════════");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });